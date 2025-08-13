import dotenv from 'dotenv';
dotenv.config();

import * as admin from 'firebase-admin';
import { getMessaging, MulticastMessage, SendResponse } from 'firebase-admin/messaging';
import { SQSClient, ReceiveMessageCommand, DeleteMessageCommand } from '@aws-sdk/client-sqs';

// Assuming you have a Sequelize setup like this
import { db } from './models'; // Make sure your DB connection is properly exported

// --- INITIALIZATION ---

// 1. Initialize Firebase Admin SDK
if (admin.apps.length === 0) {
    if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
        throw new Error("Missing FIREBASE_SERVICE_ACCOUNT_KEY in .env file");
    }
    try {
        admin.initializeApp({
            credential: admin.credential.cert(
                JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
            ),
        });
        console.log("Firebase Admin SDK initialized successfully.");
    } catch (error) {
        // console.error("Error initializing Firebase Admin SDK:", error.message);
        process.exit(1);
    }
}

// 2. Initialize AWS SQS Client
const sqsClient = new SQSClient({
    region: process.env.AWS_REGION,
    credentials: process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
        ? {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        }
        : undefined,
});

const SQS_QUEUE_URL = process.env.SQS_QUEUE_URL;
if (!SQS_QUEUE_URL) {
    throw new Error("Missing SQS_QUEUE_URL in .env file");
}

// --- CORE LOGIC ---

/**
 * Processes a single notification message from the SQS queue.
 * @param {object} messageBody - The parsed JSON body of the SQS message.
 */
async function processNotification(messageBody: any) {
    const {
        userId,
        message,
        data,
    } = messageBody;

    // Fetch active device tokens for the user
    const userDevices = await db.UserDevice.findAll({
        where: { user_id: userId, is_active: true },
        attributes: ["device_token"],
    });

    if (userDevices.length === 0) {
        console.log(`No active devices for user ${userId}. Skipping.`);
        return; // Nothing to do
    }

    const tokens = userDevices.map((d) => d.device_token);

    const multicastMessage = {
        tokens,
        notification: {
            title: message.title,
            body: message.body,
        },
        data,
    };

    // Send the notification to all devices
    const batchResponse = await getMessaging().sendEachForMulticast(multicastMessage);

    console.log(`${batchResponse.successCount} messages sent successfully for user ${userId}.`);

    // Clean up invalid or unregistered tokens
    if (batchResponse.failureCount > 0) {
        const tokensToDelete: string[] = [];
        batchResponse.responses.forEach((resp, idx) => {
            if (!resp.success) {
                const error = resp.error?.code;
                console.error(`Failed to send to token: ${tokens[idx]}`, error);
                // Check for errors indicating the token is no longer valid
                if (
                    error === 'messaging/registration-token-not-registered' ||
                    error === 'messaging/invalid-registration-token'
                ) {
                    tokensToDelete.push(tokens[idx]);
                }
            }
        });

        if (tokensToDelete.length > 0) {
            await db.UserDevice.destroy({
                where: { device_token: tokensToDelete },
            });
            console.log(`Cleaned up ${tokensToDelete.length} invalid tokens.`);
        }
    }
}

/**
 * Main function to start the SQS queue listener.
 */
async function startListener() {
    console.log("🚀 Notification service started. Listening for messages on SQS queue...");

    while (true) { // Infinite loop to continuously poll the queue
        try {
            const receiveCommand = new ReceiveMessageCommand({
                QueueUrl: SQS_QUEUE_URL,
                MaxNumberOfMessages: 10, // Process up to 10 messages at a time
                WaitTimeSeconds: 20,     // Use long polling to reduce costs
                AttributeNames: ["All"],
            });

            const { Messages } = await sqsClient.send(receiveCommand);

            if (Messages && Messages.length > 0) {
                console.log(`Received ${Messages.length} messages...`);
                for (const message of Messages) {
                    try {
                        if (!message.Body) {
                            console.error("Received message with empty Body. Skipping.");
                            continue;
                        }
                        const messageBody = JSON.parse(message.Body);
                        await processNotification(messageBody);

                        // IMPORTANT: Delete the message from the queue after successful processing
                        const deleteCommand = new DeleteMessageCommand({
                            QueueUrl: SQS_QUEUE_URL,
                            ReceiptHandle: message.ReceiptHandle,
                        });
                        await sqsClient.send(deleteCommand);

                    } catch (processingError) {
                        // If processing fails, the message is NOT deleted.
                        // It will become visible again after the queue's visibility timeout
                        // and can be retried.
                        console.error("Error processing message:", processingError);
                        console.error("Message Body:", message.Body);
                    }
                }
            }
        } catch (error) {
            console.error("Error polling SQS queue:", error);
            // Wait for a few seconds before retrying to avoid spamming logs on connection errors
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }
}

// Start the listener
startListener();