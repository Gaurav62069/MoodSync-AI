// src/config/firebase.js
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

// 🔥 REPLACE THIS WITH YOUR FIREBASE CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyDHBjZK8ykSLmXO_6traFNaI1g5aZMqh0E",
  authDomain: "moodsync-ai-226f8.firebaseapp.com",
  projectId: "moodsync-ai-226f8",
  storageBucket: "moodsync-ai-226f8.firebasestorage.app",
  messagingSenderId: "236971686768",
  appId: "1:236971686768:web:858c285b0b9955f2f7edb5",
  measurementId: "G-MD89ZD3F4E"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// --- VAPID KEY (Jo Cloud Messaging tab se mili thi) ---
const VAPID_KEY = "emna-NT8Aa7siee7b-E0P_0vs4ro8H2LRQ3A5F3IUNo"; 

export const requestForToken = async () => {
  try {
    const currentToken = await getToken(messaging, { vapidKey: VAPID_KEY });
    if (currentToken) {
      console.log("🔥 FCM Token Generated:", currentToken);
      return currentToken;
    } else {
      console.log("No registration token available. Request permission to generate one.");
      return null;
    }
  } catch (err) {
    console.log("An error occurred while retrieving token. ", err);
    return null;
  }
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      console.log("📩 Message received. ", payload);
      resolve(payload);
    });
  });