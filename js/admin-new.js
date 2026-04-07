// Admin Panel JavaScript (Firebase Version)

// State
let currentSection = 'dashboard';
let menuItems = [];
let orders = [];
let reviews = [];
let currentUser = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    console.log('Admin panel loading...');
    checkAuth();
    setupEventListeners();
});

// Check Authentication (Firebase)
function checkAuth() {
    console.log('🔍 Проверка auth...');
    console.log('auth определен?', typeof auth !== 'undefined');
    console.log('firebase определен?', typeof firebase !== 'undefined');
    console.log('firebase.auth определен?', typeof firebase !== 'undefined' && typeof firebase.auth !== 'undefined');
    
    // Проверяем что Firebase загружен
    if (typeof firebase === 'undefined') {
        console.error('❌ Firebase не загружен!');
        alert('ОШИБКА: Firebase не загружен!\n\nПроверьте подключение к интернету и перезагрузите страницу.');
        showLoginScreen();
        return;
    }
    
    // Проверяем что Firebase Auth доступен
    if (typeof firebase.auth === 'undefined') {
        console.error('❌ Firebase Auth модуль не загружен!');
        alert('ОШИБКА: Firebase Auth модуль не загружен!\n\nПроверьте что firebase-auth-compat.js подключен.');
        showLoginScreen();
        return;
    }
    
    // Если auth не определен, пытаемся получить его из firebase
    if (typeof auth === 'undefined') {
        console.warn('⚠️ auth не определен, получаем из firebase.auth()');
        window.auth = firebase.auth();
    }
    
    console.log('✅ Firebase Auth готов');
    console.log('auth объект:', auth);
    
    // Устанавливаем слушатель изменения состояния авторизации
    auth.onAuthStateChanged((user) => {
        console.log('🔄 onAuthStateChanged вызван');
        if (user) {
            console.log('✅ Пользователь авторизован:', user.email);
            console.log('User UID:', user.uid);
            currentUser = user;
            showAdminPanel(user);
            setupRealtimeListeners();
        } else {
            console.log('ℹ️ Пользователь не авторизован');
            showLoginScreen();
        }
    });
}

// Show Login Screen
function showLoginScreen() {
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('adminPanel').style.display = 'none';
}

// Show Admin Panel
function showAdminPanel(user) {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('adminPanel').style.display = 'flex';
    document.getElementById('adminUsername').textContent = user.email || 'Әкімші';
    loadDashboard();
}

// Setup Realtime Listeners (Firebase) - ОТКЛЮЧЕНО из-за проблем с правами
function setupRealtimeListeners() {
    console.log('⚠️ Realtime listeners өшірілген. Жаңарту батырмасын пайдаланыңыз.');
    // Listeners өшірілген - қолмен жаңартуды пайдаланамыз
}

// Setup Event Listeners
function setupEventListeners() {
    // Login Form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const section = item.dataset.section;
            switchSection(section);
        });
    });
    
    // Add buttons
    const addMenuBtn = document.getElementById('addMenuBtn');
    if (addMenuBtn) {
        addMenuBtn.addEventListener('click', () => openMenuModal());
    }
    
    // Filters
    const orderFilter = document.getElementById('orderStatusFilter');
    if (orderFilter) {
        orderFilter.addEventListener('change', filterOrders);
    }
    
    const reviewFilter = document.getElementById('reviewStatusFilter');
    if (reviewFilter) {
        reviewFilter.addEventListener('change', filterReviews);
    }
}

// Handle Login (Firebase)
async function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const errorEl = document.getElementById('loginError');
    const submitBtn = e.target.querySelector('button[type="submit"]');
    
    console.log('📝 handleLogin вызван');
    console.log('Username:', username);
    console.log('Password length:', password.length);
    
    if (!username || !password) {
        errorEl.textContent = 'Барлық өрістерді толтырыңыз';
        return;
    }
    
    // Проверяем что auth доступен
    if (typeof auth === 'undefined') {
        console.error('❌ auth не определен в handleLogin!');
        errorEl.textContent = 'Firebase Auth не загружен. Перезагрузите страницу.';
        return;
    }
    
    submitBtn.disabled = true;
    submitBtn.textContent = 'Кіру...';
    errorEl.textContent = '';
    
    try {
        console.log('🔐 Попытка входа:', username);
        
        const email = username.includes('@') ? username : username + '@taksofon.coffee';
        console.log('📧 Email для входа:', email);
        
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        
        console.log('✅ Вход успешен!');
        console.log('User:', userCredential.user.email);
        console.log('UID:', userCredential.user.uid);
        
        // onAuthStateChanged автоматически вызовется и покажет админ панель
        
    } catch (error) {
        console.error('❌ Ошибка входа:', error);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        
        let errorMessage = 'Кіру қатесі';
        
        if (error.code === 'auth/wrong-password') {
            errorMessage = 'Құпия сөз қате';
        } else if (error.code === 'auth/user-not-found') {
            errorMessage = 'Пайдаланушы табылмады. Тіркелгі жасалған ба?';
        } else if (error.code === 'auth/invalid-email') {
            errorMessage = 'Email форматы қате';
        } else if (error.code === 'auth/invalid-credential') {
            errorMessage = 'Email немесе құпия сөз қате';
        } else if (error.code === 'auth/too-many-requests') {
            errorMessage = 'Тым көп әрекет. Кейінірек қайталаңыз.';
        } else {
            errorMessage = error.message;
        }
        
        errorEl.textContent = errorMessage;
        submitBtn.disabled = false;
        submitBtn.textContent = 'Кіру';
    }
}

// Handle Logout
async function handleLogout() {
    try {
        await auth.signOut();
        console.log('Шығу орындалды');
    } catch (error) {
        console.error('Шығу қатесі:', error);
    }
}

// Switch Section
function switchSection(section) {
    currentSection = section;
    
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.section === section);
    });
    
    document.querySelectorAll('.content-section').forEach(sec => {
        sec.classList.toggle('active', sec.id === section + '-section');
    });
    
    const titles = {
        dashboard: 'Басты бет',
        menu: 'Мәзір',
        orders: 'Тапсырыстар',
        reviews: 'Пікірлер'
    };
    
    const titleEl = document.getElementById('sectionTitle');
    if (titleEl) {
        titleEl.textContent = titles[section] || section;
    }
    
    switch(section) {
        case 'dashboard': loadDashboard(); break;
        case 'menu': loadMenu(); break;
        case 'orders': loadOrders(); break;
        case 'reviews': loadReviews(); break;
    }
}

// Load Dashboard
async function loadDashboard() {
    try {
        const result = await OrderAPI.getStats();
        
        if (result.success) {
            const stats = result.stats;
            const statusCounts = stats.statusCounts || {};
            
            document.getElementById('totalOrders').textContent = stats.totalOrders || 0;
            document.getElementById('newOrders').textContent = statusCounts.new || 0;
            document.getElementById('preparingOrders').textContent = statusCounts.preparing || 0;
            document.getElementById('totalRevenue').textContent = (stats.totalRevenue || 0) + '₸';
        }
    } catch (error) {
        console.error('Басты бетті жүктеу қатесі:', error);
    }
}

// Load Menu
async function loadMenu() {
    try {
        const snapshot = await db.collection('products').get();
        menuItems = [];
        snapshot.forEach(doc => {
            menuItems.push({ id: doc.id, ...doc.data() });
        });
        renderMenuTable();
    } catch (error) {
        console.error('Мәзірді жүктеу қатесі:', error);
    }
}

// Render Menu Table
function renderMenuTable() {
    const tbody = document.getElementById('menuTableBody');
    if (!tbody) return;
    
    if (menuItems.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">Деректер жоқ</td></tr>';
        return;
    }
    
    tbody.innerHTML = menuItems.map(item => {
        const price = item.prices?.medium || item.basePrice || 0;
        const available = item.available !== false;
        
        return `
            <tr>
                <td><img src="${item.image || 'image/menu-1.png'}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px;"></td>
                <td>${item.name || 'Атауы жоқ'}</td>
                <td>${item.type || 'coffee'}</td>
                <td>${price}₸</td>
                <td><span class="badge ${available ? 'badge-success' : 'badge-danger'}">${available ? 'Қолжетімді' : 'Қолжетімсіз'}</span></td>
                <td>
                    <button class="btn-icon" onclick="editMenuItem('${item.id}')">✏️</button>
                    <button class="btn-icon btn-danger" onclick="deleteMenuItem('${item.id}')">🗑️</button>
                </td>
            </tr>
        `;
    }).join('');
}

// Load Orders
async function loadOrders() {
    try {
        const result = await OrderAPI.getAllOrders();
        if (result.success) {
            orders = result.orders || [];
            renderOrdersTable();
        }
    } catch (error) {
        console.error('Тапсырыстарды жүктеу қатесі:', error);
    }
}

// Render Orders Table
function renderOrdersTable(filteredOrders = null) {
    const tbody = document.getElementById('ordersTableBody');
    if (!tbody) return;
    
    const displayOrders = filteredOrders || orders;
    
    if (displayOrders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center">Тапсырыстар жоқ</td></tr>';
        return;
    }
    
    tbody.innerHTML = displayOrders.map(order => {
        return `
            <tr>
                <td>${order.orderNumber || '#' + order.id.slice(-6)}</td>
                <td>${order.customerName || 'Көрсетілмеген'}</td>
                <td>${order.phoneNumber || 'Көрсетілмеген'}</td>
                <td>${order.total || order.totalAmount || 0}₸</td>
                <td>
                    <select class="status-select" onchange="updateOrderStatus('${order.id}', this.value)">
                        <option value="new" ${order.status === 'new' ? 'selected' : ''}>Жаңа</option>
                        <option value="confirmed" ${order.status === 'confirmed' ? 'selected' : ''}>Расталған</option>
                        <option value="preparing" ${order.status === 'preparing' ? 'selected' : ''}>Дайындалуда</option>
                        <option value="ready" ${order.status === 'ready' ? 'selected' : ''}>Дайын</option>
                        <option value="completed" ${order.status === 'completed' ? 'selected' : ''}>Аяқталған</option>
                        <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Бас тартылған</option>
                    </select>
                </td>
                <td>${formatDate(order.createdAt)}</td>
                <td>
                    <button class="btn-icon" onclick="viewOrder('${order.id}')">👁️</button>
                    <button class="btn-icon btn-danger" onclick="deleteOrder('${order.id}')">🗑️</button>
                </td>
            </tr>
        `;
    }).join('');
}

// Filter Orders
function filterOrders() {
    const status = document.getElementById('orderStatusFilter').value;
    
    if (!status) {
        renderOrdersTable();
        return;
    }
    
    const filtered = orders.filter(order => order.status === status);
    renderOrdersTable(filtered);
}

// Update Order Status
async function updateOrderStatus(id, status) {
    try {
        const result = await OrderAPI.updateStatus(id, status);
        if (result.success) {
            alert('Статус жаңартылды');
            
            // Отправляем уведомление клиенту если заказ готов
            if (status === 'ready' || status === 'completed') {
                await sendOrderReadyNotification(id);
            }
            
            loadOrders();
            loadDashboard();
        }
    } catch (error) {
        alert('Жаңарту қатесі');
    }
}

// Отправка уведомления о готовности заказа
async function sendOrderReadyNotification(orderId) {
    try {
        // Получаем данные заказа
        const orderDoc = await db.collection('orders').doc(orderId).get();
        if (!orderDoc.exists) return;
        
        const orderData = orderDoc.data();
        
        // Проверяем тип уведомления
        if (orderData.notificationType === 'push' && orderData.fcmToken) {
            // Отправляем push уведомление через FCM
            await sendFCMNotification(orderData.fcmToken, {
                title: 'Заказ готов! ☕',
                body: `Ваш заказ №${orderData.orderNumber || orderId.slice(-6)} готов к получению!`,
                icon: '/image/coffee-icon.png',
                badge: '/image/coffee-badge.png',
                tag: `order-ready-${orderId}`,
                data: {
                    orderId: orderId,
                    type: 'order-ready'
                }
            });
        } else if (orderData.notificationType === 'telegram' && orderData.telegramChatId) {
            // Отправляем Telegram уведомление
            const telegramData = {
                order_id: orderData.orderNumber || orderId.slice(-6),
                customer_name: orderData.customerName || orderData.name,
                phone: orderData.phone,
                delivery_type: orderData.deliveryType,
                address: orderData.address,
                payment_method: orderData.paymentMethod,
                total: orderData.total,
                items: orderData.items || [],
                status: 'ready'
            };
            
            // Используем существующий notification-sender
            if (window.notificationSender) {
                await window.notificationSender.sendTelegramNotification(
                    orderData.telegramChatId, 
                    telegramData
                );
            }
        } else if (orderData.notificationType === 'email' && orderData.customerEmail) {
            // Отправляем Email уведомление
            const emailData = {
                order_id: orderData.orderNumber || orderId.slice(-6),
                customer_name: orderData.customerName || orderData.name,
                phone: orderData.phone,
                delivery_type: orderData.deliveryType,
                address: orderData.address,
                payment_method: orderData.paymentMethod,
                total: orderData.total,
                items: orderData.items || [],
                status: 'ready'
            };
            
            if (window.notificationSender) {
                await window.notificationSender.sendEmailNotification(
                    orderData.customerEmail,
                    emailData
                );
            }
        }
        
        console.log(`Уведомление отправлено для заказа ${orderId}`);
        
    } catch (error) {
        console.error('Ошибка отправки уведомления:', error);
    }
}

// Отправка FCM уведомления
async function sendFCMNotification(token, payload) {
    try {
        // Если у вас есть Firebase Functions, используйте их
        // Иначе можно отправить через Service Worker
        
        if ('serviceWorker' in navigator) {
            const registration = await navigator.serviceWorker.ready;
            
            // Отправляем сообщение Service Worker'у для показа уведомления
            if (registration.active) {
                registration.active.postMessage({
                    type: 'SHOW_NOTIFICATION',
                    payload: payload
                });
            }
        }
        
        // Альтернативно - показываем браузерное уведомление напрямую
        if (Notification.permission === 'granted') {
            new Notification(payload.title, {
                body: payload.body,
                icon: payload.icon,
                badge: payload.badge,
                tag: payload.tag,
                data: payload.data,
                requireInteraction: true
            });
        }
        
    } catch (error) {
        console.error('Ошибка FCM уведомления:', error);
    }
}

// Load Reviews
async function loadReviews() {
    try {
        // Тікелей жүктейміз ReviewsAPI пайдаланбай (индекстер мәселесін болдырмау үшін)
        const snapshot = await db.collection('reviews').get();
        reviews = [];
        snapshot.forEach(doc => {
            reviews.push({ id: doc.id, ...doc.data() });
        });
        
        // Клиентте сұрыптаймыз
        reviews.sort((a, b) => {
            const dateA = a.createdAt?.toDate?.() || new Date(0);
            const dateB = b.createdAt?.toDate?.() || new Date(0);
            return dateB - dateA;
        });
        
        renderReviewsTable();
        console.log('✅ Пікірлер жүктелді:', reviews.length);
    } catch (error) {
        console.error('❌ Пікірлерді жүктеу қатесі:', error);
    }
}

// Render Reviews Table
function renderReviewsTable(filteredReviews = null) {
    const tbody = document.getElementById('reviewsTableBody');
    if (!tbody) return;
    
    const displayReviews = filteredReviews || reviews;
    
    if (displayReviews.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center">Пікірлер жоқ</td></tr>';
        return;
    }
    
    tbody.innerHTML = displayReviews.map(review => {
        const stars = '⭐'.repeat(review.rating || 5);
        const statusBadge = review.status === 'approved' ? 'badge-success' : review.status === 'rejected' ? 'badge-danger' : 'badge-warning';
        const statusText = review.status === 'approved' ? 'Мақұлданған' : review.status === 'rejected' ? 'Қабылданбаған' : 'Модерацияда';
        
        // Проверяем наличие фото
        const hasPhoto = review.photoUrl && review.photoUrl.length > 0;
        
        // Иконка фото - всегда показываем, но кликабельна только если есть фото
        let photoIcon;
        if (hasPhoto) {
            photoIcon = `<span style="cursor: pointer; font-size: 24px;" onclick="window.openPhotoModalById('${review.id}')" title="Нажмите для просмотра фото">📷</span>`;
        } else {
            photoIcon = `<span style="font-size: 24px; opacity: 0.3; cursor: not-allowed;" title="Фото не прикреплено">📷</span>`;
        }
        
        return `
            <tr>
                <td>${review.customerName || 'Аноним'}</td>
                <td>${stars}</td>
                <td style="max-width: 300px;">${review.reviewText || ''}</td>
                <td>${photoIcon}</td>
                <td><span class="badge ${statusBadge}">${statusText}</span></td>
                <td>${formatDate(review.createdAt)}</td>
                <td>
                    ${review.status === 'pending' ? `
                        <button class="btn-icon btn-success" onclick="approveReview('${review.id}')">✅</button>
                        <button class="btn-icon btn-danger" onclick="rejectReview('${review.id}')">❌</button>
                    ` : ''}
                    <button class="btn-icon btn-danger" onclick="deleteReview('${review.id}')">🗑️</button>
                </td>
            </tr>
        `;
    }).join('');
}

// Открыть фото по ID отзыва (чтобы избежать проблем с длинными Base64 строками в HTML)
window.openPhotoModalById = function(reviewId) {
    const review = reviews.find(r => r.id === reviewId);
    if (review && review.photoUrl) {
        openPhotoModal(review.photoUrl);
    } else {
        alert('Фото не найдено');
    }
};

// Filter Reviews
function filterReviews() {
    const status = document.getElementById('reviewStatusFilter').value;
    
    if (!status) {
        renderReviewsTable();
        return;
    }
    
    const filtered = reviews.filter(review => review.status === status);
    renderReviewsTable(filtered);
}

// Approve Review
async function approveReview(id) {
    try {
        const adminName = currentUser?.email || 'Әкімші';
        const result = await ReviewsAPI.approveReview(id, adminName);
        if (result.success) {
            alert('Пікір мақұлданды');
            loadReviews();
        }
    } catch (error) {
        alert('Қате');
    }
}

// Reject Review
async function rejectReview(id) {
    const comment = prompt('Қабылдамау себебі (міндетті емес):');
    try {
        const adminName = currentUser?.email || 'Әкімші';
        const result = await ReviewsAPI.rejectReview(id, adminName, comment);
        if (result.success) {
            alert('Пікір қабылданбады');
            loadReviews();
        }
    } catch (error) {
        alert('Қате');
    }
}

// Delete Review
async function deleteReview(id) {
    if (confirm('Бұл пікірді жою керек пе?')) {
        try {
            const result = await ReviewsAPI.deleteReview(id);
            if (result.success) {
                alert('Жойылды');
                loadReviews();
            }
        } catch (error) {
            alert('Жою қатесі');
        }
    }
}

// Delete Order
async function deleteOrder(id) {
    if (confirm('Бұл тапсырысты жою керек пе?')) {
        try {
            const result = await OrderAPI.deleteOrder(id);
            if (result.success) {
                alert('Жойылды');
                loadOrders();
                loadDashboard();
            }
        } catch (error) {
            alert('Жою қатесі');
        }
    }
}

// Helper Functions
function formatDate(timestamp) {
    if (!timestamp) return 'Көрсетілмеген';
    
    if (timestamp.toDate) {
        return timestamp.toDate().toLocaleString('kk-KZ');
    }
    
    if (typeof timestamp === 'number' && timestamp < 10000000000) {
        return new Date(timestamp * 1000).toLocaleString('kk-KZ');
    }
    
    const date = new Date(timestamp);
    return date.toLocaleString('kk-KZ');
}

// Open Menu Modal
function openMenuModal(id = null) {
    const isEdit = id !== null;
    const item = isEdit ? menuItems.find(m => m.id === id) : null;
    
    const modalHTML = `
        <div class="modal-overlay active" id="menuModal" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 9999;">
            <div class="modal-dialog" style="background: white; padding: 30px; border-radius: 12px; max-width: 600px; width: 90%; max-height: 90vh; overflow-y: auto;">
                <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h3 style="margin: 0;">${isEdit ? 'Өңдеу' : 'Қосу'} сусын</h3>
                    <button class="modal-close" onclick="closeModal('menuModal')" style="background: none; border: none; font-size: 24px; cursor: pointer;">&times;</button>
                </div>
                <form id="menuForm" class="modal-form">
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: 500;">Атауы *</label>
                        <input type="text" name="name" value="${item?.name || ''}" required style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px;">
                    </div>
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: 500;">Санат *</label>
                        <select name="type" required style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px;">
                            <option value="coffee" ${item?.type === 'coffee' ? 'selected' : ''}>Кофе</option>
                            <option value="tea" ${item?.type === 'tea' ? 'selected' : ''}>Шай</option>
                            <option value="cold" ${item?.type === 'cold' ? 'selected' : ''}>Салқын сусындар</option>
                            <option value="other" ${item?.type === 'other' ? 'selected' : ''}>Басқа</option>
                        </select>
                    </div>
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: 500;">Сипаттама</label>
                        <textarea name="description" rows="3" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px;">${item?.description || ''}</textarea>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-bottom: 15px;">
                        <div>
                            <label style="display: block; margin-bottom: 5px; font-weight: 500;">Баға S (₸)</label>
                            <input type="number" name="priceSmall" value="${item?.prices?.small || 890}" min="0" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px;">
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 5px; font-weight: 500;">Баға M (₸) *</label>
                            <input type="number" name="priceMedium" value="${item?.prices?.medium || 990}" min="0" required style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px;">
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 5px; font-weight: 500;">Баға L (₸)</label>
                            <input type="number" name="priceLarge" value="${item?.prices?.large || 1090}" min="0" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px;">
                        </div>
                    </div>
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: 500;">Сурет URL</label>
                        <input type="text" name="image" value="${item?.image || ''}" placeholder="image/menu-1.png" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px;">
                    </div>
                    <div style="margin-bottom: 20px;">
                        <label style="display: flex; align-items: center; gap: 8px;">
                            <input type="checkbox" name="available" ${item?.available !== false ? 'checked' : ''}>
                            <span>Тапсырысқа қолжетімді</span>
                        </label>
                    </div>
                    <div style="display: flex; gap: 10px; justify-content: flex-end;">
                        <button type="button" onclick="closeModal('menuModal')" style="padding: 10px 20px; background: #95a5a6; color: white; border: none; border-radius: 6px; cursor: pointer;">Болдырмау</button>
                        <button type="submit" style="padding: 10px 20px; background: #667eea; color: white; border: none; border-radius: 6px; cursor: pointer;">💾 Сақтау</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    document.getElementById('modalContainer').innerHTML = modalHTML;
    
    document.getElementById('menuForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = {
            name: formData.get('name'),
            type: formData.get('type'),
            description: formData.get('description'),
            prices: {
                small: parseInt(formData.get('priceSmall')) || 0,
                medium: parseInt(formData.get('priceMedium')),
                large: parseInt(formData.get('priceLarge')) || 0
            },
            image: formData.get('image'),
            available: formData.get('available') === 'on',
            totalOrdered: item?.totalOrdered || 0
        };
        
        try {
            if (isEdit) {
                await db.collection('products').doc(id).update(data);
                alert('✅ Жаңартылды!');
            } else {
                await db.collection('products').add(data);
                alert('✅ Қосылды!');
            }
            closeModal('menuModal');
            loadMenu();
        } catch (error) {
            alert('❌ Қате: ' + error.message);
        }
    });
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.remove();
    }
}

function editMenuItem(id) {
    alert('Өңдеу функциясы әзірленуде');
}

function deleteMenuItem(id) {
    if (confirm('Бұл сусынды жою керек пе?')) {
        db.collection('products').doc(id).delete()
            .then(() => {
                alert('Жойылды');
                loadMenu();
            })
            .catch(error => {
                alert('Жою қатесі');
            });
    }
}

function viewOrder(id) {
    const order = orders.find(o => o.id === id);
    if (!order) {
        alert('Тапсырыс табылмады');
        return;
    }
    
    // Тауарлар тізімін қалыптастырамыз
    const itemsHTML = (order.items || []).map(item => `
        <div style="padding: 12px; background: #f8f9fa; border-radius: 8px; margin-bottom: 10px; border-left: 4px solid #667eea;">
            <div style="display: flex; justify-content: space-between; align-items: start;">
                <div>
                    <strong style="font-size: 16px; color: #2c3e50;">${item.name || 'Сусын'}</strong>
                    <div style="margin-top: 5px; color: #7f8c8d; font-size: 14px;">
                        ${item.size ? `📏 Көлемі: ${item.size} мл` : ''}
                        ${item.quantity ? `<br>📦 Саны: ${item.quantity} дана` : ''}
                        ${item.unitPrice ? `<br>💰 Бағасы: ${item.unitPrice}₸` : ''}
                        ${item.options ? `<br>➕ Опциялар: ${item.options}` : ''}
                        ${item.comment ? `<br>💬 Түсініктеме: ${item.comment}` : ''}
                    </div>
                </div>
                <div style="text-align: right;">
                    <strong style="font-size: 18px; color: #667eea;">${item.totalPrice || item.price || 0}₸</strong>
                </div>
            </div>
        </div>
    `).join('');
    
    const modalHTML = `
        <div class="modal-overlay active" id="orderModal" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 9999;">
            <div class="modal-dialog" style="background: white; padding: 30px; border-radius: 16px; max-width: 700px; width: 90%; max-height: 90vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; padding-bottom: 15px; border-bottom: 2px solid #ecf0f1;">
                    <h2 style="margin: 0; color: #2c3e50; font-size: 24px;">
                        <i class="fas fa-receipt"></i> Тапсырыс ${order.orderNumber || '#' + order.id.slice(-6)}
                    </h2>
                    <button onclick="closeModal('orderModal')" style="background: none; border: none; font-size: 28px; cursor: pointer; color: #95a5a6;">&times;</button>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 25px;">
                    <div>
                        <label style="font-weight: 600; color: #7f8c8d; font-size: 12px; text-transform: uppercase;">Клиент</label>
                        <p style="margin: 5px 0; font-size: 16px; color: #2c3e50;">${order.customerName || 'Көрсетілмеген'}</p>
                    </div>
                    <div>
                        <label style="font-weight: 600; color: #7f8c8d; font-size: 12px; text-transform: uppercase;">Телефон</label>
                        <p style="margin: 5px 0; font-size: 16px; color: #2c3e50;">${order.phoneNumber || 'Көрсетілмеген'}</p>
                    </div>
                    <div>
                        <label style="font-weight: 600; color: #7f8c8d; font-size: 12px; text-transform: uppercase;" data-i18n="checkout_delivery_type">Жеткізу түрі</label>
                        <p style="margin: 5px 0; font-size: 16px; color: #2c3e50;">${order.deliveryType === 'pickup' ? '🏪 ' + (window.i18n ? window.i18n.t('checkout_pickup') : 'Pickup') : '🚚 ' + (window.i18n ? window.i18n.t('checkout_delivery') : 'Delivery')}</p>
                    </div>
                    <div>
                        <label style="font-weight: 600; color: #7f8c8d; font-size: 12px; text-transform: uppercase;" data-i18n="checkout_payment_method">Төлем</label>
                        <p style="margin: 5px 0; font-size: 16px; color: #2c3e50;">${order.paymentMethod === 'cash' ? '💵 ' + (window.i18n ? window.i18n.t('checkout_payment_cash') : 'Cash') : order.paymentMethod === 'card' ? '💳 ' + (window.i18n ? window.i18n.t('checkout_payment_card') : 'Card') : '📱 ' + (window.i18n ? window.i18n.t('checkout_payment_kaspi') : 'Kaspi QR')}</p>
                    </div>
                </div>
                
                ${order.address ? `
                    <div style="margin-bottom: 20px; padding: 12px; background: #fff3cd; border-radius: 8px;">
                        <label style="font-weight: 600; color: #856404; font-size: 12px; text-transform: uppercase;">📍 Жеткізу мекенжайы</label>
                        <p style="margin: 5px 0; color: #856404;">${order.address}</p>
                        ${order.addressComment ? `<small style="color: #856404;">💬 ${order.addressComment}</small>` : ''}
                    </div>
                ` : ''}
                
                <div style="margin-bottom: 20px;">
                    <h3 style="font-size: 18px; margin-bottom: 15px; color: #2c3e50;">🛒 Тауарлар</h3>
                    ${itemsHTML || '<p style="color: #95a5a6;">Тауарлар жоқ</p>'}
                </div>
                
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 12px; color: white; margin-bottom: 20px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                        <span>Тауарлар:</span>
                        <strong>${order.itemsTotal || order.total || 0}₸</strong>
                    </div>
                    ${order.deliveryFee ? `
                        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                            <span>Жеткізу:</span>
                            <strong>${order.deliveryFee}₸</strong>
                        </div>
                    ` : ''}
                    <div style="display: flex; justify-content: space-between; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.3); font-size: 20px;">
                        <span>Барлығы:</span>
                        <strong>${order.total || order.totalAmount || 0}₸</strong>
                    </div>
                </div>
                
                <div style="margin-bottom: 20px;">
                    <label style="font-weight: 600; color: #7f8c8d; font-size: 12px; text-transform: uppercase; display: block; margin-bottom: 10px;">Тапсырыс статусы</label>
                    <select class="status-select" onchange="updateOrderStatus('${order.id}', this.value)" style="width: 100%; padding: 12px; border: 2px solid #ecf0f1; border-radius: 8px; font-size: 14px;">
                        <option value="new" ${order.status === 'new' ? 'selected' : ''}>🆕 Жаңа</option>
                        <option value="confirmed" ${order.status === 'confirmed' ? 'selected' : ''}>✅ Расталған</option>
                        <option value="preparing" ${order.status === 'preparing' ? 'selected' : ''}>👨‍🍳 Дайындалуда</option>
                        <option value="ready" ${order.status === 'ready' ? 'selected' : ''}>✨ Дайын</option>
                        <option value="completed" ${order.status === 'completed' ? 'selected' : ''}>🎉 Аяқталған</option>
                        <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>❌ Бас тартылған</option>
                    </select>
                </div>
                
                <div style="text-align: right; color: #95a5a6; font-size: 13px;">
                    📅 Жасалған: ${formatDate(order.createdAt)}
                </div>
                
                <div style="margin-top: 20px; text-align: right;">
                    <button onclick="closeModal('orderModal')" style="padding: 12px 24px; background: #95a5a6; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 14px;">Жабу</button>
                </div>
            </div>
        </div>
    `;
    
    const container = document.getElementById('modalContainer');
    if (container) {
        container.innerHTML = modalHTML;
    } else {
        console.error('modalContainer табылмады!');
        alert('Қате: модальды терезе контейнері табылмады');
    }
}

// Import All Menu
async function importAllMenu() {
    if (!confirm('Сайттың мәзірінен барлық сусындарды импорттау керек пе?\n\nБұл қосады:\n- 6 түрлі кофе\n- 6 түрлі шай\n\nЖалғастыру керек пе?')) {
        return;
    }
    
    const menuData = [
        // Кофе
        { name: "Латте", type: "coffee", description: "Классикалық эспрессо мен ыстық көбіктендірілген сүттен жасалған.", prices: { small: 990, medium: 1090, large: 1190 }, image: "image/menu-1.png", available: true },
        { name: "Раф", type: "coffee", description: "Эспрессо, қою кілегей және ванильді қанттың қоспасы.", prices: { small: 1090, medium: 1190, large: 1290 }, image: "image/menu-2.png", available: true },
        { name: "Флэт уайт", type: "coffee", description: "Қос эспрессо мен жібектей сүтті көбіктің жұқа қабаты.", prices: { small: 890, medium: 990, large: 1090 }, image: "image/menu-3.png", available: true },
        { name: "Моккачино", type: "coffee", description: "Шоколадты мокка тәтті дәм сүйетіндерге.", prices: { small: 1050, medium: 1150, large: 1250 }, image: "image/menu-4.png", available: true },
        { name: "Американо", type: "coffee", description: "Эспрессоны ыстық сумен сұйылту арқылы жасалған.", prices: { small: 890, medium: 990, large: 1090 }, image: "image/menu-5.png", available: true },
        { name: "Каппучино", type: "coffee", description: "Жұмсақ дәмі бар кремді капучино сүтпен.", prices: { small: 990, medium: 1090, large: 1190 }, image: "image/menu-6.png", available: true },
        
        // Чай
        { name: "Облепихалы шай", type: "tea", description: "Дәрумендерге бай облепиха жидектерімен.", prices: { small: 790, medium: 890, large: 990 }, image: "image/tea-1.png", available: true },
        { name: "Жидекті шай", type: "tea", description: "Таза жидектердің қоспасынан жасалған.", prices: { small: 750, medium: 850, large: 950 }, image: "image/tea-2.png", available: true },
        { name: "Марокко шайы", type: "tea", description: "Жалбыз бен дәстүрлі дәмдеуіштермен.", prices: { small: 790, medium: 890, large: 990 }, image: "image/tea-3.png", available: true },
        { name: "Имбирлі шай", type: "tea", description: "Жаңа имбирмен дайындалған қыздырушы шай.", prices: { small: 790, medium: 890, large: 990 }, image: "image/tea-4.png", available: true },
        { name: "Глинтвейн шай", type: "tea", description: "Дәмдеуіштер мен жылы хош иісті шай.", prices: { small: 790, medium: 890, large: 990 }, image: "image/tea-5.png", available: true },
        { name: "Карак шай", type: "tea", description: "Араб түбегі елдерінен әкелінген күшті сусын.", prices: { small: 790, medium: 890, large: 990 }, image: "image/tea-6.png", available: true }
    ];
    
    const btn = document.getElementById('importMenuBtn');
    btn.disabled = true;
    btn.textContent = '⏳ Импорттау...';
    
    let success = 0;
    let errors = 0;
    
    for (const item of menuData) {
        try {
            await db.collection('products').add({
                ...item,
                totalOrdered: 0,
                createdAt: firebase.firestore.Timestamp.now()
            });
            success++;
        } catch (error) {
            console.error('Қосу қатесі:', item.name, error);
            errors++;
        }
    }
    
    btn.disabled = false;
    btn.textContent = '✅ Барлық сусындарды импорттау';
    
    alert(`✅ Импорттау аяқталды!\n\nСәтті: ${success}\nҚателер: ${errors}`);
    
    loadMenu();
}

console.log('Admin panel script loaded');


// ===== ГРАФИКИ =====

// График статусов заказов
let ordersChartInstance = null;
function createOrdersChart(statusCounts) {
    const ctx = document.getElementById('ordersChart');
    if (!ctx) return;
    
    if (ordersChartInstance) ordersChartInstance.destroy();
    
    ordersChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Жаңа', 'Расталған', 'Дайындалуда', 'Дайын', 'Аяқталған', 'Бас тартылған'],
            datasets: [{
                data: [
                    statusCounts.new || 0,
                    statusCounts.confirmed || 0,
                    statusCounts.preparing || 0,
                    statusCounts.ready || 0,
                    statusCounts.completed || 0,
                    statusCounts.cancelled || 0
                ],
                backgroundColor: ['#f093fb', '#667eea', '#4facfe', '#43e97b', '#95a5a6', '#e74c3c'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'bottom', labels: { padding: 15, font: { size: 12 } } }
            }
        }
    });
}

// График отзывов
let reviewsChartInstance = null;
async function createReviewsChart() {
    const ctx = document.getElementById('reviewsChart');
    if (!ctx) return;
    
    try {
        const result = await ReviewsAPI.getReviewsStats();
        
        if (result.success) {
            const stats = result.stats;
            const ratingCounts = stats.ratingCounts || {};
            
            if (reviewsChartInstance) reviewsChartInstance.destroy();
            
            reviewsChartInstance = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['⭐', '⭐⭐', '⭐⭐⭐', '⭐⭐⭐⭐', '⭐⭐⭐⭐⭐'],
                    datasets: [{
                        label: 'Саны',
                        data: [
                            ratingCounts[1] || 0,
                            ratingCounts[2] || 0,
                            ratingCounts[3] || 0,
                            ratingCounts[4] || 0,
                            ratingCounts[5] || 0
                        ],
                        backgroundColor: ['#e74c3c', '#e67e22', '#f39c12', '#3498db', '#27ae60'],
                        borderWidth: 0,
                        borderRadius: 8
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { display: false },
                        title: {
                            display: true,
                            text: `Орташа рейтинг: ${stats.averageRating || 0} ⭐`,
                            font: { size: 14, weight: 'bold' }
                        }
                    },
                    scales: {
                        y: { beginAtZero: true, ticks: { stepSize: 1 } }
                    }
                }
            });
        }
    } catch (error) {
        console.error('Пікірлер графигінің қатесі:', error);
    }
}

// Обновить loadDashboard чтобы создавать графики
const originalLoadDashboard = loadDashboard;
loadDashboard = async function() {
    await originalLoadDashboard();
    
    // Получить статистику для графиков
    try {
        const result = await OrderAPI.getStats();
        if (result.success) {
            createOrdersChart(result.stats.statusCounts || {});
        }
    } catch (error) {
        console.error('Ошибка загрузки графиков:', error);
    }
    
    createReviewsChart();
};

// ===== PHOTO MODAL =====
window.openPhotoModal = function(photoUrl) {
    // Создаем модальное окно для просмотра фото
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        cursor: pointer;
        animation: fadeIn 0.3s ease;
    `;
    
    const img = document.createElement('img');
    img.src = photoUrl;
    img.style.cssText = `
        max-width: 90%;
        max-height: 90%;
        border-radius: 12px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.7);
        animation: zoomIn 0.3s ease;
    `;
    
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '✕';
    closeBtn.style.cssText = `
        position: absolute;
        top: 20px;
        right: 20px;
        background: rgba(255, 255, 255, 0.2);
        border: 2px solid white;
        color: white;
        font-size: 24px;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        cursor: pointer;
        transition: all 0.3s ease;
    `;
    
    closeBtn.addEventListener('mouseenter', () => {
        closeBtn.style.background = 'rgba(255, 255, 255, 0.3)';
        closeBtn.style.transform = 'rotate(90deg)';
    });
    
    closeBtn.addEventListener('mouseleave', () => {
        closeBtn.style.background = 'rgba(255, 255, 255, 0.2)';
        closeBtn.style.transform = 'rotate(0deg)';
    });
    
    modal.appendChild(img);
    modal.appendChild(closeBtn);
    document.body.appendChild(modal);
    
    // Добавляем CSS анимации
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        @keyframes zoomIn {
            from { transform: scale(0.8); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
        }
    `;
    document.head.appendChild(style);
    
    // Закрыть по клику на фон или кнопку
    const closeModal = () => {
        modal.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
            modal.remove();
            style.remove();
        }, 300);
    };
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
    
    closeBtn.addEventListener('click', closeModal);
    
    // Закрыть по ESC
    const handleEsc = (e) => {
        if (e.key === 'Escape') {
            closeModal();
            document.removeEventListener('keydown', handleEsc);
        }
    };
    document.addEventListener('keydown', handleEsc);
};
