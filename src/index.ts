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
async function processNotification(messageBody: any) {
  const { userId, message, data } = messageBody;

  if (!userId || !message?.title) {
    console.warn(`⚠️ Invalid message payload: ${JSON.stringify(messageBody)}`);
    return;
  }

  const userDevices = await db.UserDevice.findAll({
    where: { user_id: userId, is_active: true },
    attributes: ["device_token"],
    raw: true,
  });

  if (!userDevices.length) {
    console.log(`ℹ️ No active devices for user ${userId}`);
    return;
  }

  const tokens = userDevices.map((d) => d.device_token);
  const multicastMessage: MulticastMessage = {
    tokens,
    notification: {
      title: message.title,
      body: message.body ?? "",
    },
    data: data || {},
  };

  try {
    const batchResponse = await getMessaging().sendEachForMulticast(
      multicastMessage
    );
    console.log(
      `📨 User ${userId}: ${batchResponse.successCount}/${tokens.length} sent.`
    );

    const invalidTokens = batchResponse.responses
      .map((resp, idx) =>
        !resp.success &&
        [
          "messaging/registration-token-not-registered",
          "messaging/invalid-registration-token",
        ].includes(resp.error?.code || "")
          ? tokens[idx]
          : null
      )
      .filter(Boolean) as string[];

    if (invalidTokens.length) {
      await db.UserDevice.destroy({
        where: { device_token: invalidTokens },
      });
      console.log(`🧹 Removed ${invalidTokens.length} invalid tokens.`);
    }
  } catch (err) {
    console.error(`❌ Failed to send notification for user ${userId}:`, err);
  }
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
