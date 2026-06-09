// public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging.js');

// Wahi Config dobara yahan daal (Service Worker ko alag se chahiye hota hai)
firebase.initializeApp({
  apiKey: "AIzaSyA...",
  authDomain: "moodsync-xyz.firebaseapp.com",
  projectId: "moodsync-xyz",
  storageBucket: "moodsync-xyz.appspot.com",
  messagingSenderId: "123456...",
  appId: "1:123456..."
});

const messaging = firebase.messaging();

// Background Handler
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/vite.svg' // App icon
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});