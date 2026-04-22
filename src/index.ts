import dotenv from "dotenv";
dotenv.config();

import * as admin from "firebase-admin";
import { getMessaging, MulticastMessage } from "firebase-admin/messaging";
import {
  SQSClient,
  ReceiveMessageCommand,
  DeleteMessageCommand,
} from "@aws-sdk/client-sqs";
import { db } from "./models";

// ===== ENVIRONMENT VALIDATION =====
const requiredEnvVars = [
  "FIREBASE_SERVICE_ACCOUNT_KEY",
  "AWS_REGION",
  "AWS_ACCESS_KEY_ID",
  "AWS_SECRET_ACCESS_KEY",
  "SQS_QUEUE_URL",
];
for (const varName of requiredEnvVars) {
  if (!process.env[varName]) {
    console.error(`❌ Missing environment variable: ${varName}`);
    process.exit(1);
  }
}

const SQS_QUEUE_URL = process.env.SQS_QUEUE_URL!;

// ===== INITIALIZATION =====
// Firebase Admin SDK
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(
        JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY!)
      ),
    });
    console.log("✅ Firebase Admin SDK initialized.");
  } catch (err: any) {
    console.error("❌ Failed to initialize Firebase Admin SDK:", err.message);
    process.exit(1);
  }
}

// AWS SQS Client
const sqsClient = new SQSClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

// ===== NOTIFICATION PROCESSING =====
// FCM multicast limit is 500 tokens per call.
const FCM_MULTICAST_LIMIT = 500;

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    out.push(arr.slice(i, i + size));
  }
  return out;
}

async function sendToTokens(
  tokens: string[],
  title: string,
  body: string,
  data: Record<string, string> = {},
  label: string
) {
  if (!tokens.length) {
    console.log(`ℹ️ ${label}: no tokens.`);
    return;
  }

  // Firebase data payload values MUST be strings.
  const stringData: Record<string, string> = {};
  for (const [k, v] of Object.entries(data)) stringData[k] = String(v);

  const batches = chunk(tokens, FCM_MULTICAST_LIMIT);
  let successCount = 0;
  const invalidTokens: string[] = [];

  for (const batchTokens of batches) {
    const multicastMessage: MulticastMessage = {
      tokens: batchTokens,
      notification: { title, body },
      data: stringData,
    };
    try {
      const batchResponse = await getMessaging().sendEachForMulticast(
        multicastMessage
      );
      successCount += batchResponse.successCount;
      batchResponse.responses.forEach((resp, idx) => {
        if (
          !resp.success &&
          [
            "messaging/registration-token-not-registered",
            "messaging/invalid-registration-token",
          ].includes(resp.error?.code || "")
        ) {
          invalidTokens.push(batchTokens[idx]);
        }
      });
    } catch (err) {
      console.error(`❌ FCM batch failed (${label}):`, err);
    }
  }

  console.log(`📨 ${label}: ${successCount}/${tokens.length} sent.`);

  if (invalidTokens.length) {
    await db.UserDevice.destroy({ where: { device_token: invalidTokens } });
    console.log(`🧹 ${label}: removed ${invalidTokens.length} invalid tokens.`);
  }
}

async function processNotification(messageBody: any) {
  const { type, userId, message, data } = messageBody;

  if (!message?.title) {
    console.warn(`⚠️ Invalid payload (no title): ${JSON.stringify(messageBody)}`);
    return;
  }

  // ===== Broadcast to all users =====
  if (type === "broadcast") {
    const devices = await db.UserDevice.findAll({
      where: { is_active: true },
      attributes: ["device_token"],
      raw: true,
    });
    const tokens = devices.map((d) => d.device_token);
    await sendToTokens(
      tokens,
      message.title,
      message.body ?? "",
      data || {},
      "broadcast"
    );
    return;
  }

  // ===== Single-user notification (existing behavior) =====
  if (!userId) {
    console.warn(`⚠️ Invalid payload (no userId): ${JSON.stringify(messageBody)}`);
    return;
  }

  const userDevices = await db.UserDevice.findAll({
    where: { user_id: userId, is_active: true },
    attributes: ["device_token"],
    raw: true,
  });
  const tokens = userDevices.map((d) => d.device_token);
  await sendToTokens(
    tokens,
    message.title,
    message.body ?? "",
    data || {},
    `user ${userId}`
  );
}

// ===== SQS LISTENER =====
async function startListener() {
  console.log("🚀 Notification service listening on SQS...");

  while (true) {
    try {
      const { Messages } = await sqsClient.send(
        new ReceiveMessageCommand({
          QueueUrl: SQS_QUEUE_URL,
          MaxNumberOfMessages: 10,
          WaitTimeSeconds: 20,
        })
      );

      if (!Messages?.length) continue;

      console.log(`📥 Received ${Messages.length} message(s).`);

      for (const msg of Messages) {
        try {
          if (!msg.Body) {
            console.warn("⚠️ Empty message body, skipping.");
            continue;
          }
          const body = JSON.parse(msg.Body);
          await processNotification(body);

          await sqsClient.send(
            new DeleteMessageCommand({
              QueueUrl: SQS_QUEUE_URL,
              ReceiptHandle: msg.ReceiptHandle!,
            })
          );
        } catch (err) {
          console.error("❌ Error processing message:", err);
        }
      }
    } catch (err) {
      console.error("❌ Error polling SQS:", err);
      await new Promise((res) => setTimeout(res, 5000));
    }
  }
}

// ===== GRACEFUL SHUTDOWN =====
process.on("SIGINT", () => {
  console.log("🛑 Shutting down listener...");
  process.exit(0);
});

startListener();
