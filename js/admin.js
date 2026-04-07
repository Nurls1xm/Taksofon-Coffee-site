// Admin Panel JavaScript (Firebase Version)

// State
let currentSection = 'dashboard';
let menuItems = [];
let orders = [];
let reviews = [];
let currentUser = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    setupEventListeners();
    setupRealtimeListeners();
});

// Check Authentication (Firebase)
function checkAuth() {
    auth.onAuthStateChanged((user) => {
        if (user) {
            currentUser = user;
            showAdminPanel(user);
        } else {
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
    document.getElementById('adminUsername').textContent = user.email || user.username || 'Admin';
    loadDashboard();
}

// Setup Realtime Listeners (Firebase)
function setupRealtimeListeners() {
    // Слушаем новые заказы
    db.collection('orders').where('status', '==', 'new')
        .onSnapshot((snapshot) => {
            const newCount = snapshot.size;
            document.getElementById('newOrdersBadge').textContent = newCount;
            if (currentSection === 'orders') loadOrders();
        });
    
    // Слушаем отзывы на модерации
    db.collection('reviews').where('status', '==', 'pending')
        .onSnapshot((snapshot) => {
            const pendingCount = snapshot.size;
            document.getElementById('pendingReviewsBadge').textContent = pendingCount;
            if (currentSection === 'reviews') loadReviews();
        });
}

// Setup Event Listeners
function setupEventListeners() {
    // Login Form
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    
    // Logout
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
    
    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const section = item.dataset.section;
            switchSection(section);
        });
    });
    
    // Add buttons
    document.getElementById('addMenuBtn')?.addEventListener('click', () => openMenuModal());
    document.getElementById('addBranchBtn')?.addEventListener('click', () => openBranchModal());
    
    // Filters
    document.getElementById('orderStatusFilter')?.addEventListener('change', filterOrders);
    document.getElementById('reviewStatusFilter')?.addEventListener('change', filterReviews);
}

// Handle Login (Firebase)
async function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const errorEl = document.getElementById('loginError');
    const submitBtn = e.target.querySelector('button[type="submit"]');
    
    if (!username || !password) {
        errorEl.textContent = 'Заполните все поля';
        return;
    }
    
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Вход...';
    errorEl.textContent = '';
    
    try {
        // Проверка что Firebase Auth инициализирован
        if (typeof auth === 'undefined') {
            throw new Error('Firebase Auth не инициализирован. Проверь подключение скриптов.');
        }
        
        console.log('Попытка входа с email:', username);
        
        // Firebase Auth - используем email формат
        const email = username.includes('@') ? username : `${username}@taksofon.coffee`;
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        
        console.log('✅ Вход успешен:', userCredential.user.email);
        // checkAuth() автоматически обработает успешный вход
    } catch (error) {
        console.error('❌ Login error:', error);
        
        let errorMessage = 'Ошибка входа';
        
        if (error.code === 'auth/wrong-password') {
            errorMessage = 'Неверный пароль';
        } else if (error.code === 'auth/user-not-found') {
            errorMessage = 'Пользователь не найден. Проверь email.';
        } else if (error.code === 'auth/invalid-email') {
            errorMessage = 'Неверный формат email';
        } else if (error.code === 'auth/too-many-requests') {
            errorMessage = 'Слишком много попыток. Попробуй позже.';
        } else {
            errorMessage = error.message;
        }
        
        errorEl.textContent = errorMessage;
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Войти';
    }
}

// Handle Logout (Firebase)
async function handleLogout() {
    try {
        await auth.signOut();
        showLoginScreen();
    } catch (error) {
        console.error('Logout error:', error);
    }
}

// Switch Section
function switchSection(section) {
    currentSection = section;
    
    // Update navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.section === section);
    });
    
    // Update content
    document.querySelectorAll('.content-section').forEach(sec => {
        sec.classList.toggle('active', sec.id === `${section}-section`);
    });
    
    // Update title
    const titles = {
        dashboard: 'Дашборд',
        menu: 'Меню',
        orders: 'Заказы',
        reviews: 'Отзывы',
        branches: 'Филиалы'
    };
    document.getElementById('sectionTitle').textContent = titles[section];
    
    // Load data
    switch(section) {
        case 'dashboard': loadDashboard(); break;
        case 'menu': loadMenu(); break;
        case 'orders': loadOrders(); break;
        case 'reviews': loadReviews(); break;
        case 'branches': loadBranches(); break;
    }
}

// Load Dashboard (Firebase)
async function loadDashboard() {
    try {
        const result = await OrderAPI.getStats();
        
        if (result.success) {
            const stats = result.stats;
            const statusCounts = stats.statusCounts || {};
            
            animateValue('totalOrders', 0, stats.totalOrders || 0, 1000);
            animateValue('newOrders', 0, statusCounts.new || 0, 1000);
            animateValue('preparingOrders', 0, statusCounts.preparing || 0, 1000);
            animateValue('totalRevenue', 0, stats.totalRevenue || 0, 1000, '₸');
        }
    } catch (error) {
        console.error('Dashboard error:', error);
        showNotification('Ошибка загрузки статистики', 'error');
    }
}

// Анимация чисел
function animateValue(id, start, end, duration, suffix = '') {
    const element = document.getElementById(id);
    if (!element) return;
    
    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
            current = end;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current).toLocaleString() + suffix;
    }, 16);
}

// Load Menu (Firebase)
async function loadMenu() {
    try {
        const snapshot = await db.collection('products').get();
        menuItems = [];
        snapshot.forEach(doc => {
            menuItems.push({ id: doc.id, ...doc.data() });
        });
        renderMenuTable();
    } catch (error) {
        console.error('Menu error:', error);
        showNotification('Ошибка загрузки меню', 'error');
    }
}

// Render Menu Table
function renderMenuTable() {
    const tbody = document.getElementById('menuTableBody');
    
    if (menuItems.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">Нет данных</td></tr>';
        return;
    }
    
    tbody.innerHTML = menuItems.map(item => `
        <tr>
            <td><img src="${item.image || 'image/menu-1.png'}" alt="${item.name}" class="table-img" style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px;"></td>
            <td>${item.name || 'Без названия'}</td>
            <td>${getCategoryName(item.type || item.category)}</td>
            <td>${item.prices?.medium || item.basePrice || 0}₸</td>
            <td><span class="badge ${item.available !== false ? 'badge-success' : 'badge-danger'}">
                ${item.available !== false ? 'Доступно' : 'Недоступно'}
            </span></td>
            <td>
                <button class="btn-icon" onclick="editMenuItem('${item.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon btn-danger" onclick="deleteMenuItem('${item.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// Load Orders (Firebase)
async function loadOrders() {
    try {
        const result = await OrderAPI.getAllOrders();
        if (result.success) {
            orders = result.orders || [];
            renderOrdersTable();
        }
    } catch (error) {
        console.error('Orders error:', error);
        showNotification('Ошибка загрузки заказов', 'error');
    }
}

// Render Orders Table
function renderOrdersTable(filteredOrders = null) {
    const tbody = document.getElementById('ordersTableBody');
    const displayOrders = filteredOrders || orders;
    
    if (displayOrders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center">Нет заказов</td></tr>';
        return;
    }
    
    tbody.innerHTML = displayOrders.map(order => `
        <tr>
            <td>${order.orderNumber || '#' + order.id.slice(-6)}</td>
            <td>${order.customerName || 'Не указано'}</td>
            <td>${order.phoneNumber || 'Не указано'}</td>
            <td>${order.total || order.totalAmount || 0}₸</td>
            <td>
                <select class="status-select" onchange="updateOrderStatus('${order.id}', this.value)">
                    <option value="new" ${order.status === 'new' ? 'selected' : ''}>Новый</option>
                    <option value="confirmed" ${order.status === 'confirmed' ? 'selected' : ''}>Подтвержден</option>
                    <option value="preparing" ${order.status === 'preparing' ? 'selected' : ''}>Готовится</option>
                    <option value="ready" ${order.status === 'ready' ? 'selected' : ''}>Готов</option>
                    <option value="completed" ${order.status === 'completed' ? 'selected' : ''}>Завершен</option>
                    <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Отменен</option>
                </select>
            </td>
            <td>${formatDate(order.createdAt)}</td>
            <td>
                <button class="btn-icon" onclick="viewOrder('${order.id}')">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn-icon btn-danger" onclick="deleteOrder('${order.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
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

// Update Order Status (Firebase) - Simple version
async function updateOrderStatus(id, status) {
    try {
        const result = await OrderAPI.updateStatus(id, status);
        if (result.success) {
            showNotification('Status updated', 'success');
            loadOrders();
            loadDashboard();
        } else {
            showNotification('Update error', 'error');
        }
    } catch (error) {
        console.error('Status update error:', error);
        showNotification('Update error', 'error');
    }
}

// Load Reviews (Firebase)
async function loadReviews() {
    try {
        const result = await ReviewsAPI.getAllReviews();
        if (result.success) {
            reviews = result.reviews || [];
            renderReviewsTable();
        }
    } catch (error) {
        console.error('Reviews error:', error);
        showNotification('Ошибка загрузки отзывов', 'error');
    }
}

// Render Reviews Table
function renderReviewsTable(filteredReviews = null) {
    const tbody = document.getElementById('reviewsTableBody');
    const displayReviews = filteredReviews || reviews;
    
    if (displayReviews.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center">Нет отзывов</td></tr>';
        return;
    }
    
    tbody.innerHTML = displayReviews.map(review => `
        <tr>
            <td>${review.customerName || 'Аноним'}</td>
            <td>${'⭐'.repeat(review.rating || 5)}</td>
            <td class="text-truncate" style="max-width: 300px;">${review.reviewText || ''}</td>
            <td>${review.photoUrl ? `<img src="${review.photoUrl}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px; cursor: pointer;" onclick="openPhotoModal('${review.photoUrl}')" title="Нажмите для увеличения">` : '-'}</td>
            <td>
                <span class="badge ${review.status === 'approved' ? 'badge-success' : review.status === 'rejected' ? 'badge-danger' : 'badge-warning'}">
                    ${review.status === 'approved' ? 'Одобрен' : review.status === 'rejected' ? 'Отклонен' : 'На модерации'}
                </span>
            </td>
            <td>${formatDate(review.createdAt)}</td>
            <td>
                ${review.status === 'pending' ? `
                    <button class="btn-icon btn-success" onclick="approveReview('${review.id}')" title="Одобрить">
                        <i class="fas fa-check"></i>
                    </button>
                    <button class="btn-icon btn-danger" onclick="rejectReview('${review.id}')" title="Отклонить">
                        <i class="fas fa-times"></i>
                    </button>
                ` : ''}
                <button class="btn-icon btn-danger" onclick="deleteReview('${review.id}')" title="Удалить">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// Approve Review (Firebase)
async function approveReview(id) {
    try {
        const adminName = currentUser?.email || 'Admin';
        const result = await ReviewsAPI.approveReview(id, adminName);
        if (result.success) {
            showNotification('Отзыв одобрен', 'success');
            loadReviews();
        } else {
            showNotification('Ошибка одобрения', 'error');
        }
    } catch (error) {
        showNotification('Ошибка', 'error');
    }
}

// Reject Review (Firebase)
async function rejectReview(id) {
    const comment = prompt('Причина отклонения (необязательно):');
    try {
        const adminName = currentUser?.email || 'Admin';
        const result = await ReviewsAPI.rejectReview(id, adminName, comment);
        if (result.success) {
            showNotification('Отзыв отклонен', 'success');
            loadReviews();
        } else {
            showNotification('Ошибка отклонения', 'error');
        }
    } catch (error) {
        showNotification('Ошибка', 'error');
    }
}

// Load Branches
async function loadBranches() {
    try {
        const response = await fetch(`${API_BASE}/branches.php?action=list`);
        const data = await response.json();
        
        if (data.success) {
            branches = data.data || [];
            renderBranchesTable();
        }
    } catch (error) {
        console.error('Branches error:', error);
    }
}

// Render Branches Table
function renderBranchesTable() {
    const tbody = document.getElementById('branchesTableBody');
    
    if (branches.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">Нет филиалов</td></tr>';
        return;
    }
    
    tbody.innerHTML = branches.map(branch => `
        <tr>
            <td><img src="${branch.image || 'image/about-img.png'}" alt="${branch.name}" class="table-img"></td>
            <td>${branch.name}</td>
            <td>${branch.address}</td>
            <td>${branch.phone || 'Не указан'}</td>
            <td><span class="badge ${branch.active ? 'badge-success' : 'badge-danger'}">
                ${branch.active ? 'Активен' : 'Неактивен'}
            </span></td>
            <td>
                <button class="btn-icon" onclick="editBranch('${branch.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon btn-danger" onclick="deleteBranch('${branch.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// Helper Functions
function getCategoryName(category) {
    const names = {
        coffee: 'Кофе',
        tea: 'Чай',
        cold: 'Холодные напитки',
        other: 'Другое'
    };
    return names[category] || category;
}

function formatDate(timestamp) {
    if (!timestamp) return 'Не указано';
    
    // Firebase Timestamp
    if (timestamp.toDate) {
        return timestamp.toDate().toLocaleString('ru-RU');
    }
    
    // Unix timestamp (seconds)
    if (typeof timestamp === 'number' && timestamp < 10000000000) {
        return new Date(timestamp * 1000).toLocaleString('ru-RU');
    }
    
    // Unix timestamp (milliseconds) or Date string
    const date = new Date(timestamp);
    return date.toLocaleString('ru-RU');
}

function showNotification(message, type = 'info') {
    // Создаем красивое уведомление
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    // Добавляем стили если их еще нет
    if (!document.getElementById('notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 20px;
                background: white;
                border-radius: 8px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.15);
                display: flex;
                align-items: center;
                gap: 10px;
                z-index: 10000;
                animation: slideIn 0.3s ease;
                min-width: 250px;
            }
            .notification-success { border-left: 4px solid #28a745; }
            .notification-error { border-left: 4px solid #e74c3c; }
            .notification-info { border-left: 4px solid #667eea; }
            .notification i { font-size: 20px; }
            .notification-success i { color: #28a745; }
            .notification-error i { color: #e74c3c; }
            .notification-info i { color: #667eea; }
            @keyframes slideIn {
                from { transform: translateX(400px); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(400px); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    // Автоматически удаляем через 3 секунды
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Modal Functions
function openMenuModal(id = null) {
    const isEdit = id !== null;
    const item = isEdit ? menuItems.find(m => m.id === id) : null;
    
    const modalHTML = `
        <div class="modal-overlay active" id="menuModal">
            <div class="modal-dialog">
                <div class="modal-header">
                    <h3>${isEdit ? 'Редактировать напиток' : 'Добавить напиток'}</h3>
                    <button class="modal-close" onclick="closeModal('menuModal')">&times;</button>
                </div>
                <form id="menuForm" class="modal-form">
                    <div class="form-row">
                        <div class="form-group">
                            <label>Название (RU) *</label>
                            <input type="text" name="name" value="${item?.name || ''}" required>
                        </div>
                        <div class="form-group">
                            <label>Название (KK)</label>
                            <input type="text" name="nameKk" value="${item?.nameKk || ''}">
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Категория *</label>
                        <select name="category" required>
                            <option value="coffee" ${item?.category === 'coffee' ? 'selected' : ''}>Кофе</option>
                            <option value="tea" ${item?.category === 'tea' ? 'selected' : ''}>Чай</option>
                            <option value="cold" ${item?.category === 'cold' ? 'selected' : ''}>Холодные напитки</option>
                            <option value="other" ${item?.category === 'other' ? 'selected' : ''}>Другое</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Описание</label>
                        <textarea name="description" rows="3">${item?.description || ''}</textarea>
                    </div>
                    <div class="form-group">
                        <label>Базовая цена (₸) *</label>
                        <input type="number" name="basePrice" value="${item?.basePrice || ''}" min="0" required>
                    </div>
                    <div class="form-group">
                        <label>URL изображения</label>
                        <input type="text" name="image" value="${item?.image || ''}">
                    </div>
                    <div class="form-group">
                        <label>
                            <input type="checkbox" name="available" ${item?.available !== false ? 'checked' : ''}>
                            Доступно для заказа
                        </label>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn-secondary" onclick="closeModal('menuModal')">Отмена</button>
                        <button type="submit" class="btn-primary">
                            <i class="fas fa-save"></i> Сохранить
                        </button>
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
            nameKk: formData.get('nameKk'),
            category: formData.get('category'),
            description: formData.get('description'),
            basePrice: parseInt(formData.get('basePrice')),
            image: formData.get('image'),
            available: formData.get('available') === 'on',
            sizes: [],
            options: []
        };
        
        try {
            const url = isEdit 
                ? `${API_BASE}/menu.php?action=update&id=${id}`
                : `${API_BASE}/menu.php?action=create`;
            
            const response = await fetch(url, {
                method: isEdit ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            
            const result = await response.json();
            
            if (result.success) {
                showNotification(isEdit ? 'Обновлено' : 'Добавлено', 'success');
                closeModal('menuModal');
                loadMenu();
            } else {
                showNotification(result.error || 'Ошибка', 'error');
            }
        } catch (error) {
            showNotification('Ошибка сохранения', 'error');
        }
    });
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 300);
    }
}

function editMenuItem(id) {
    openMenuModal(id);
}

async function deleteMenuItem(id) {
    if (confirm('Удалить этот напиток?')) {
        try {
            await db.collection('products').doc(id).delete();
            showNotification('Удалено', 'success');
            loadMenu();
        } catch (error) {
            showNotification('Ошибка удаления', 'error');
        }
    }
}

function viewOrder(id) {
    const order = orders.find(o => o.id === id);
    if (!order) return;
    
    const itemsHTML = order.items?.map(item => `
        <div style="padding: 10px; background: #f8f9fa; border-radius: 8px; margin-bottom: 10px;">
            <strong>${item.name}</strong><br>
            Размер: ${item.size}мл | Количество: ${item.quantity}<br>
            ${item.options?.length ? `Опции: ${item.options.join(', ')}<br>` : ''}
            Цена: ${item.price}₸
        </div>
    `).join('') || 'Нет товаров';
    
    const modalHTML = `
        <div class="modal-overlay active" id="orderModal">
            <div class="modal-dialog">
                <div class="modal-header">
                    <h3>Заказ #${order.id.slice(-6)}</h3>
                    <button class="modal-close" onclick="closeModal('orderModal')">&times;</button>
                </div>
                <div class="modal-form">
                    <div class="form-group">
                        <label>Клиент</label>
                        <p style="margin: 5px 0; font-size: 16px;">${order.customerName || 'Не указано'}</p>
                    </div>
                    <div class="form-group">
                        <label>Телефон</label>
                        <p style="margin: 5px 0; font-size: 16px;">${order.phoneNumber || 'Не указано'}</p>
                    </div>
                    <div class="form-group">
                        <label>Способ получения</label>
                        <p style="margin: 5px 0; font-size: 16px;">${order.deliveryMethod === 'pickup' ? 'Самовывоз' : 'Доставка'}</p>
                    </div>
                    ${order.address ? `
                        <div class="form-group">
                            <label>Адрес доставки</label>
                            <p style="margin: 5px 0; font-size: 16px;">${order.address}</p>
                        </div>
                    ` : ''}
                    ${order.comment ? `
                        <div class="form-group">
                            <label>Комментарий</label>
                            <p style="margin: 5px 0; font-size: 16px;">${order.comment}</p>
                        </div>
                    ` : ''}
                    <div class="form-group">
                        <label>Товары</label>
                        ${itemsHTML}
                    </div>
                    <div class="form-group">
                        <label>Итого</label>
                        <p style="margin: 5px 0; font-size: 20px; font-weight: bold; color: #667eea;">${order.totalAmount}₸</p>
                    </div>
                    <div class="form-group">
                        <label>Статус</label>
                        <select class="status-select" onchange="updateOrderStatus('${order.id}', this.value)">
                            <option value="новый" ${order.status === 'новый' ? 'selected' : ''}>Новый</option>
                            <option value="готовится" ${order.status === 'готовится' ? 'selected' : ''}>Готовится</option>
                            <option value="готов" ${order.status === 'готов' ? 'selected' : ''}>Готов</option>
                            <option value="выдан" ${order.status === 'выдан' ? 'selected' : ''}>Выдан</option>
                            <option value="отменен" ${order.status === 'отменен' ? 'selected' : ''}>Отменен</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Дата создания</label>
                        <p style="margin: 5px 0; font-size: 14px; color: #666;">${formatDate(order.createdAt)}</p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn-secondary" onclick="closeModal('orderModal')">Закрыть</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('modalContainer').innerHTML = modalHTML;
}

async function deleteOrder(id) {
    if (confirm('Удалить этот заказ?')) {
        try {
            const result = await OrderAPI.deleteOrder(id);
            if (result.success) {
                showNotification('Удалено', 'success');
                loadOrders();
                loadDashboard();
            } else {
                showNotification('Ошибка удаления', 'error');
            }
        } catch (error) {
            showNotification('Ошибка удаления', 'error');
        }
    }
}

async function deleteReview(id) {
    if (confirm('Удалить этот отзыв? Это действие нельзя отменить.')) {
        try {
            const result = await ReviewsAPI.deleteReview(id);
            if (result.success) {
                showNotification('Удалено', 'success');
                loadReviews();
            } else {
                showNotification('Ошибка удаления', 'error');
            }
        } catch (error) {
            showNotification('Ошибка удаления', 'error');
        }
    }
}

function openMenuModal(id = null) {
    const isEdit = id !== null;
    const item = isEdit ? menuItems.find(m => m.id === id) : null;
    
    const modalHTML = `
        <div class="modal-overlay active" id="menuModal">
            <div class="modal-dialog">
                <div class="modal-header">
                    <h3>${isEdit ? 'Редактировать напиток' : 'Добавить напиток'}</h3>
                    <button class="modal-close" onclick="closeModal('menuModal')">&times;</button>
                </div>
                <form id="menuForm" class="modal-form">
                    <div class="form-group">
                        <label>Название *</label>
                        <input type="text" name="name" value="${item?.name || ''}" required>
                    </div>
                    <div class="form-group">
                        <label>Категория *</label>
                        <select name="type" required>
                            <option value="coffee" ${item?.type === 'coffee' ? 'selected' : ''}>Кофе</option>
                            <option value="tea" ${item?.type === 'tea' ? 'selected' : ''}>Чай</option>
                            <option value="cold" ${item?.type === 'cold' ? 'selected' : ''}>Холодные напитки</option>
                            <option value="other" ${item?.type === 'other' ? 'selected' : ''}>Другое</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Описание</label>
                        <textarea name="description" rows="3">${item?.description || ''}</textarea>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Цена S (₸)</label>
                            <input type="number" name="priceSmall" value="${item?.prices?.small || 890}" min="0">
                        </div>
                        <div class="form-group">
                            <label>Цена M (₸) *</label>
                            <input type="number" name="priceMedium" value="${item?.prices?.medium || 990}" min="0" required>
                        </div>
                        <div class="form-group">
                            <label>Цена L (₸)</label>
                            <input type="number" name="priceLarge" value="${item?.prices?.large || 1090}" min="0">
                        </div>
                    </div>
                    <div class="form-group">
                        <label>URL изображения</label>
                        <input type="text" name="image" value="${item?.image || ''}">
                    </div>
                    <div class="form-group">
                        <label>
                            <input type="checkbox" name="available" ${item?.available !== false ? 'checked' : ''}>
                            Доступно для заказа
                        </label>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn-secondary" onclick="closeModal('menuModal')">Отмена</button>
                        <button type="submit" class="btn-primary">
                            <i class="fas fa-save"></i> Сохранить
                        </button>
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
            } else {
                await db.collection('products').add(data);
            }
            showNotification(isEdit ? 'Обновлено' : 'Добавлено', 'success');
            closeModal('menuModal');
            loadMenu();
        } catch (error) {
            showNotification('Ошибка сохранения', 'error');
        }
    });
}

function editMenuItem(id) {
    openMenuModal(id);
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Телефон</label>
                            <input type="tel" name="phone" value="${branch?.phone || ''}">
                        </div>
                        <div class="form-group">
                            <label>Часы работы</label>
                            <input type="text" name="workingHours" value="${branch?.workingHours || ''}" placeholder="09:00 - 22:00">
                        </div>
                    </div>
                    <div class="form-group">
                        <label>URL изображения</label>
                        <input type="text" name="image" value="${branch?.image || ''}">
                    </div>
                    <div class="form-group">
                        <label>
                            <input type="checkbox" name="active" ${branch?.active !== false ? 'checked' : ''}>
                            Активен
                        </label>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn-secondary" onclick="closeModal('branchModal')">Отмена</button>
                        <button type="submit" class="btn-primary">
                            <i class="fas fa-save"></i> Сохранить
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    document.getElementById('modalContainer').innerHTML = modalHTML;
    
    document.getElementById('branchForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = {
            name: formData.get('name'),
            nameKk: formData.get('nameKk'),
            address: formData.get('address'),
            addressKk: formData.get('addressKk'),
            phone: formData.get('phone'),
            workingHours: formData.get('workingHours'),
            image: formData.get('image'),
            active: formData.get('active') === 'on',
            coordinates: { lat: 0, lng: 0 }
        };
        
        try {
            const url = isEdit 
                ? `${API_BASE}/branches.php?action=update&id=${id}`
                : `${API_BASE}/branches.php?action=create`;
            
            const response = await fetch(url, {
                method: isEdit ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            
            const result = await response.json();
            
            if (result.success) {
                showNotification(isEdit ? 'Обновлено' : 'Добавлено', 'success');
                closeModal('branchModal');
                loadBranches();
            } else {
                showNotification(result.error || 'Ошибка', 'error');
            }
        } catch (error) {
            showNotification('Ошибка сохранения', 'error');
        }
    });
}

function editBranch(id) {
    openBranchModal(id);
}

function deleteBranch(id) {
    if (confirm('Удалить этот филиал?')) {
        fetch(`${API_BASE}/branches.php?action=delete&id=${id}`, { method: 'DELETE' })
            .then(r => r.json())
            .then(data => {
                if (data.success) {
                    showNotification('Удалено', 'success');
                    loadBranches();
                }
            });
    }
}

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
    `;
    
    const img = document.createElement('img');
    img.src = photoUrl;
    img.style.cssText = `
        max-width: 90%;
        max-height: 90%;
        border-radius: 8px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
    `;
    
    modal.appendChild(img);
    document.body.appendChild(modal);
    
    // Закрыть по клику
    modal.addEventListener('click', () => {
        modal.remove();
    });
};
