// Orders Management (без Firebase)

// Создать новый заказ
async function createOrder(orderData) {
    try {
        const result = await OrderAPI.createOrder(orderData);
        
        if (result.success) {
            console.log('✅ Заказ создан:', result.orderId);
            return result;
        } else {
            throw new Error(result.error || 'Ошибка при создании заказа');
        }
    } catch (error) {
        console.error('❌ Ошибка при создании заказа:', error);
        throw error;
    }
}

// Получить заказ по ID
async function getOrder(orderId) {
    try {
        const result = await OrderAPI.getOrder(orderId);
        
        if (result.success) {
            return result;
        } else {
            throw new Error(result.error || 'Заказ не найден');
        }
    } catch (error) {
        console.error('❌ Ошибка при получении заказа:', error);
        throw error;
    }
}

// Получить все заказы (для админ панели)
async function getAllOrders() {
    try {
        const result = await OrderAPI.getAllOrders();
        
        if (result.success) {
            return result;
        } else {
            throw new Error(result.error || 'Ошибка при получении заказов');
        }
    } catch (error) {
        console.error('❌ Ошибка при получении заказов:', error);
        throw error;
    }
}

// Обновить статус заказа
async function updateOrderStatus(orderId, newStatus) {
    try {
        const result = await OrderAPI.updateStatus(orderId, newStatus);
        
        if (result.success) {
            console.log('✅ Статус заказа обновлен:', orderId, newStatus);
            return result;
        } else {
            throw new Error(result.error || 'Ошибка при обновлении статуса');
        }
    } catch (error) {
        console.error('❌ Ошибка при обновлении статуса:', error);
        throw error;
    }
}

// Подготовить данные заказа из корзины
function prepareOrderData(customerInfo, cart) {
    const items = cart.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.totalPrice,
        size: item.size || null,
        syrup: item.syrup || null,
        milk: item.milk || null,
        sugar: item.sugar || null,
        comment: item.comment || null,
        image: item.image || null
    }));

    return {
        customerName: customerInfo.name,
        phoneNumber: customerInfo.phone,
        deliveryOption: customerInfo.deliveryOption,
        address: customerInfo.address || null,
        paymentMethod: customerInfo.paymentMethod,
        items: items,
        totalAmount: getCartTotal(),
        comment: customerInfo.orderComment || null
    };
}

// Отправить заказ
async function submitOrder(customerInfo) {
    try {
        // Показать индикатор загрузки
        showLoadingIndicator();
        
        // Подготовить данные
        const orderData = prepareOrderData(customerInfo, cart);
        
        // Отправить в Firebase
        const result = await createOrder(orderData);
        
        if (result.success) {
            // Очистить корзину
            cart = [];
            saveCart();
            
            // Показать сообщение об успехе
            showOrderSuccess(result.orderId);
            
            return result;
        }
        
    } catch (error) {
        console.error('Ошибка при отправке заказа:', error);
        showOrderError(error.message);
        throw error;
    } finally {
        hideLoadingIndicator();
    }
}

// UI функции
function showLoadingIndicator() {
    const indicator = document.createElement('div');
    indicator.id = 'loadingIndicator';
    indicator.className = 'loading-indicator';
    const loadingText = window.i18n ? window.i18n.t('order_submitting') : 'Submitting order...';
    indicator.innerHTML = `
        <div class="loading-spinner"></div>
        <p>${loadingText}</p>
    `;
    document.body.appendChild(indicator);
}

function hideLoadingIndicator() {
    const indicator = document.getElementById('loadingIndicator');
    if (indicator) {
        indicator.remove();
    }
}

function showOrderSuccess(orderId) {
    alert(`✅ Тапсырыс сәтті жасалды!\n\nТапсырыс нөмірі: ${orderId}\n\nБіз сізге жақын арада хабарласамыз.`);
}

function showOrderError(message) {
    alert(`❌ Қате орын алды:\n\n${message}\n\nҚайталап көріңіз немесе бізге хабарласыңыз.`);
}

// Слушатель для новых заказов (для админ панели)
function listenToOrders(callback) {
    const ordersRef = database.ref('orders');
    ordersRef.on('child_added', (snapshot) => {
        callback(snapshot.val());
    });
}
