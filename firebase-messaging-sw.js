// Firebase Cloud Messaging Service Worker
// Web Push хабарламалары үшін

importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

// Firebase конфигурациясы (firebase-config.js-тен көшіріңіз)
firebase.initializeApp({
    apiKey: "AIzaSyCNbSAvxnYC-9KouEpJugz0s1QfV7l3nh0",
    authDomain: "taksofon-coffewe.firebaseapp.com",
    databaseURL: "https://taksofon-coffewe-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "taksofon-coffewe",
    storageBucket: "taksofon-coffewe.firebasestorage.app",
    messagingSenderId: "186868536302",
    appId: "1:186868536302:web:28585ec738faa66ef434ff"
});

const messaging = firebase.messaging();

// Background хабарламаларды өңдеу
messaging.onBackgroundMessage((payload) => {
    console.log('Background хабарлама алынды:', payload);
    
    const notificationTitle = payload.notification.title || 'Taksofon Coffee';
    const notificationOptions = {
        body: payload.notification.body || 'Жаңа хабарлама',
        icon: payload.notification.icon || '/image/TaksofonCoffeeLogo.png',
        badge: '/image/TaksofonCoffeeLogo.png',
        vibrate: [200, 100, 200],
        tag: 'order-notification',
        requireInteraction: true,
        actions: [
            {
                action: 'view',
                title: 'Көру'
            },
            {
                action: 'close',
                title: 'Жабу'
            }
        ]
    };
    
    return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Хабарламаны басқанда
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    if (event.action === 'view') {
        // Тапсырысты бақылау бетін ашу
        event.waitUntil(
            clients.openWindow('/order-tracking.html')
        );
    }
});
