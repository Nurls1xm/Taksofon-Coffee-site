// ===== FIREBASE CONFIGURATION =====
// ВАЖНО: Замени эти значения на свои из Firebase Console!
// https://console.firebase.google.com/ → Project Settings → Your apps → Web app

const firebaseConfig = {
    apiKey: "AIzaSyCNbSAvxnYC-9KouEpJugz0s1QfV7l3nh0",
    authDomain: "taksofon-coffewe.firebaseapp.com",
    databaseURL: "https://taksofon-coffewe-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "taksofon-coffewe",
    storageBucket: "taksofon-coffewe.firebasestorage.app",
    messagingSenderId: "186868536302",
    appId: "1:186868536302:web:28585ec738faa66ef434ff"
};

// Инициализация Firebase
try {
    firebase.initializeApp(firebaseConfig);
    console.log('✅ Firebase инициализирован');
    
    // Экспорт сервисов
    window.db = firebase.firestore();
    window.auth = firebase.auth();
    
    // Storage НЕ используется (фото в Base64)
    window.storage = null;
    
    console.log('✅ Firebase сервисы экспортированы:', {
        db: typeof window.db !== 'undefined',
        auth: typeof window.auth !== 'undefined',
        storage: 'disabled (Base64 used)'
    });
    
    // Настройка Firestore для работы оффлайн
    window.db.enablePersistence()
        .catch((err) => {
            if (err.code == 'failed-precondition') {
                console.warn('⚠️ Persistence failed: Multiple tabs open');
            } else if (err.code == 'unimplemented') {
                console.warn('⚠️ Persistence not available in this browser');
            }
        });
    
    console.log('✅ Firestore готов к работе');
    
} catch (error) {
    console.error('❌ Ошибка инициализации Firebase:', error);
    alert('КРИТИЧЕСКАЯ ОШИБКА: Firebase не инициализирован!\n\n' + error.message);
}

// Для обратной совместимости
const db = window.db;
const auth = window.auth;
const storage = window.storage;

// ===== ORDER API (Firebase) =====
const OrderAPI = {
    // Создать заказ
    async createOrder(orderData, orderNumber = null) {
        try {
            const finalOrderNumber = orderNumber || ('ORD' + Date.now());
            const order = {
                ...orderData,
                orderNumber: finalOrderNumber,
                status: 'new',
                createdAt: firebase.firestore.Timestamp.now(),
                updatedAt: firebase.firestore.Timestamp.now()
            };
            
            const docRef = await db.collection('orders').add(order);
            console.log('✅ Заказ создан:', docRef.id);
            return { success: true, orderId: docRef.id, orderNumber: finalOrderNumber };
        } catch (error) {
            console.error('❌ Ошибка создания заказа:', error);
            return { success: false, error: error.message };
        }
    },
    
    // Получить все заказы
    async getAllOrders() {
        try {
            const snapshot = await db.collection('orders')
                .orderBy('createdAt', 'desc')
                .get();
            
            const orders = [];
            snapshot.forEach(doc => {
                orders.push({ id: doc.id, ...doc.data() });
            });
            
            return { success: true, orders };
        } catch (error) {
            console.error('❌ Ошибка получения заказов:', error);
            return { success: false, error: error.message };
        }
    },
    
    // Получить один заказ
    async getOrder(orderId) {
        try {
            const doc = await db.collection('orders').doc(orderId).get();
            if (doc.exists) {
                return { success: true, order: { id: doc.id, ...doc.data() } };
            } else {
                return { success: false, error: 'Заказ не найден' };
            }
        } catch (error) {
            console.error('❌ Ошибка получения заказа:', error);
            return { success: false, error: error.message };
        }
    },
    
    // Обновить статус заказа
    async updateStatus(orderId, status) {
        try {
            await db.collection('orders').doc(orderId).update({
                status: status,
                updatedAt: firebase.firestore.Timestamp.now()
            });
            console.log('✅ Статус обновлен:', status);
            return { success: true };
        } catch (error) {
            console.error('❌ Ошибка обновления статуса:', error);
            return { success: false, error: error.message };
        }
    },
    
    // Удалить заказ
    async deleteOrder(orderId) {
        try {
            await db.collection('orders').doc(orderId).delete();
            console.log('✅ Заказ удален');
            return { success: true };
        } catch (error) {
            console.error('❌ Ошибка удаления заказа:', error);
            return { success: false, error: error.message };
        }
    },
    
    // Получить статистику
    async getStats() {
        try {
            const snapshot = await db.collection('orders').get();
            let totalOrders = 0;
            let totalRevenue = 0;
            let statusCounts = {};
            
            snapshot.forEach(doc => {
                const order = doc.data();
                totalOrders++;
                totalRevenue += order.total || 0;
                statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
            });
            
            return {
                success: true,
                stats: {
                    totalOrders,
                    totalRevenue,
                    statusCounts
                }
            };
        } catch (error) {
            console.error('❌ Ошибка получения статистики:', error);
            return { success: false, error: error.message };
        }
    }
};

console.log('✅ Order API готов');
