import admin from 'firebase-admin';
import User from '../models/user.model.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

let adminSDKInitialized = false;

try {
  let serviceAccount;
  // Environment variable पढ़ो
  const credentialConfig = process.env.GOOGLE_APPLICATION_CREDENTIALS;

  if (credentialConfig) {
    // 🔍 Check 1: क्या यह सीधा JSON स्ट्रिंग है? (Render Variable में JSON पेस्ट किया है तो)
    if (credentialConfig.trim().startsWith('{')) {
      serviceAccount = JSON.parse(credentialConfig);
      console.log("Loaded Firebase credentials from JSON string.");
    } 
    // 🔍 Check 2: क्या यह फाइल पाथ है? (Localhost या Secret File)
    else {
      // अगर path absolute है (जैसे /etc/secrets/...) तो वही लो, वरना current folder से जोड़ो
      const resolvedPath = path.isAbsolute(credentialConfig)
        ? credentialConfig
        : path.resolve(process.cwd(), credentialConfig);

      if (fs.existsSync(resolvedPath)) {
        serviceAccount = JSON.parse(fs.readFileSync(resolvedPath, 'utf8'));
        console.log(`Loaded Firebase credentials from file: ${resolvedPath}`);
      } else {
        console.error(`Firebase file not found at: ${resolvedPath}`);
      }
    }
  }

  // अगर credentials मिल गए तो initialize करो
  if (serviceAccount) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    adminSDKInitialized = true;
    console.log("Firebase Admin SDK initialized successfully.");
  } else {
    console.log("No Firebase credentials provided. Push notifications disabled.");
  }

} catch (error) {
  console.error("Firebase Admin SDK initialization error:", error.message);
  console.log("Push notifications will be disabled.");
}

export const sendPushNotification = async (userId, title, body, data = {}) => {
  if (!adminSDKInitialized) {
    console.log('Push notification skipped: Firebase Admin SDK not initialized.');
    return;
  }
  
  try {
    const user = await User.findById(userId);
    if (!user || !user.fcmToken) {
      console.log(`User ${userId} not found or no FCM token.`);
      return;
    }

    const message = {
      notification: {
        title: title,
        body: body,
      },
      data: data,
      token: user.fcmToken,
    };

    await admin.messaging().send(message);
    console.log(`Push notification sent to ${user.username}`);

  } catch (error) {
    if (error.code === 'messaging/registration-token-not-registered') {
      await User.findByIdAndUpdate(userId, { fcmToken: null });
    }
    console.error('Push notification failed:', error.message);
  }
};