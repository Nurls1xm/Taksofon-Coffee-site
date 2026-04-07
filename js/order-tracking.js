// 🔥 Firebase Order Tracking System
// Тапсырыс күйін бақылау жүйесі

// Тапсырыс жасау функциясы
async function createOrder(orderData) {
    try {
        // Бірегей тапсырыс нөмірін генерациялау
        const orderNumber = generateOrderNumber();
        
        // Тексеру кодын генерациялау (4 символ)
        const verificationCode = generateVerificationCode();
        
        // Тапсырыс объектісін құру
        const order = {
            orderNumber: orderNumber,
            verificationCode: verificationCode,
            customerName: orderData.customerName || 'Қонақ',
            phoneNumber: orderData.phoneNumber || '',
            items: orderData.items || [],
            total: orderData.total || 0,
            status: 'pending', // pending -> preparing -> ready -> completed
            createdAt: firebase.firestore.Timestamp.now(),
            updatedAt: firebase.firestore.Timestamp.now()
        };
        
        // Firebase-ке сақтау
        const docRef = await db.collection('orders').add(order);
        
        console.log('✅ Тапсырыс жасалды:', docRef.id);
        
        return {
            success: true,
            orderId: docRef.id,
            orderNumber: orderNumber,
            verificationCode: verificationCode,
            order: order
        };
        
    } catch (error) {
        console.error('❌ Тапсырыс жасау қатесі:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// Бірегей тапсырыс нөмірін генерациялау
function generateOrderNumber() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `${timestamp}${random}`;
}

// Тексеру кодын генерациялау (4 символ: әріптер мен сандар)
function generateVerificationCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // O, 0, I, 1 жоқ (шатастырмау үшін)
    let code = '';
    for (let i = 0; i < 4; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

// Тапсырыс күйін алу
async function getOrderStatus(orderNumber, verificationCode) {
    try {
        const snapshot = await db.collection('orders')
            .where('orderNumber', '==', orderNumber)
            .where('verificationCode', '==', verificationCode.toUpperCase())
            .limit(1)
            .get();
        
        if (snapshot.empty) {
            return {
                success: false,
                error: 'Тапсырыс табылмады. Нөмір мен кодты тексеріңіз.'
            };
        }
        
        const doc = snapshot.docs[0];
        return {
            success: true,
            orderId: doc.id,
            order: doc.data()
        };
        
    } catch (error) {
        console.error('❌ Тапсырыс іздеу қатесі:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// Тапсырыс күйін real-time бақылау
function subscribeToOrderStatus(orderId, callback) {
    return db.collection('orders')
        .doc(orderId)
        .onSnapshot((doc) => {
            if (doc.exists) {
                callback({
                    success: true,
                    order: doc.data()
                });
            } else {
                callback({
                    success: false,
                    error: 'Тапсырыс табылмады'
                });
            }
        }, (error) => {
            console.error('❌ Real-time қате:', error);
            callback({
                success: false,
                error: error.message
            });
        });
}

// Күй мәтінін қазақшаға аудару
function getStatusText(status) {
    const statusMap = {
        'pending': 'Қабылданды',
        'preparing': 'Дайындалуда',
        'ready': 'Дайын',
        'completed': 'Аяқталды',
        'cancelled': 'Бас тартылды'
    };
    return statusMap[status] || status;
}

// Күй иконкасын алу
function getStatusIcon(status) {
    const iconMap = {
        'pending': '📋',
        'preparing': '☕',
        'ready': '✅',
        'completed': '🎉',
        'cancelled': '❌'
    };
    return iconMap[status] || '📦';
}

// Чек HTML генерациялау
function generateReceiptHTML(order) {
    const statusText = getStatusText(order.status);
    const statusIcon = getStatusIcon(order.status);
    
    // Өнімдер тізімін құру
    let itemsHTML = '';
    order.items.forEach(item => {
        const itemTotal = item.unitPrice * item.quantity;
        itemsHTML += `
        <div class="receipt-item">
            <span>${item.name} x${item.quantity}</span>
            <span>${itemTotal} ₸</span>
        </div>`;
    });
    
    // Күн мен уақытты форматтау
    const date = order.createdAt.toDate();
    const dateStr = date.toLocaleDateString('kk-KZ');
    const timeStr = date.toLocaleTimeString('kk-KZ', { hour: '2-digit', minute: '2-digit' });
    
    return `
        <div class="receipt">
            <div class="receipt-header">
                <h2>TAKSOFON COFFEE ☕</h2>
            </div>
            
            <div class="receipt-divider"></div>
            
            <div class="receipt-info">
                <div class="receipt-row">
                    <span>Күні:</span>
                    <span>${dateStr}</span>
                </div>
                <div class="receipt-row">
                    <span>Уақыты:</span>
                    <span>${timeStr}</span>
                </div>
            </div>
            
            <div class="receipt-order-number">
                <div>Тапсырыс №</div>
                <div class="order-number-big">${order.orderNumber}</div>
                <div class="verification-code">Код: ${order.verificationCode}</div>
            </div>
            
            <div class="receipt-status ${order.status}">
                <span class="status-icon">${statusIcon}</span>
                <span class="status-text">Күйі: ${statusText}</span>
            </div>
            
            <div class="receipt-divider"></div>
            
            <div class="receipt-items">
                ${itemsHTML}
            </div>
            
            <div class="receipt-divider"></div>
            
            <div class="receipt-total">
                <span>Жалпы сома:</span>
                <span>${order.total} ₸</span>
            </div>
            
            <div class="receipt-footer">
                <p>Тапсырыс дайын болғанда хабарланады ☕</p>
            </div>
            
            <div class="receipt-divider"></div>
            
            <div class="receipt-tracking">
                <button onclick="openTrackingPage('${order.orderNumber}', '${order.verificationCode}')" class="btn-track">
                    📍 Тапсырысты бақылау
                </button>
            </div>
        </div>
    `;
}

// Тапсырысты бақылау бетін ашу
function openTrackingPage(orderNumber, verificationCode) {
    const url = `order-tracking.html?order=${orderNumber}&code=${verificationCode}`;
    window.open(url, '_blank');
}

// Чекті көрсету
function showReceipt(order) {
    const receiptHTML = generateReceiptHTML(order);
    
    // Modal немесе жаңа бетте көрсету
    const modal = document.createElement('div');
    modal.className = 'receipt-modal';
    modal.innerHTML = `
        <div class="receipt-modal-content">
            <button class="receipt-close" onclick="this.parentElement.parentElement.remove()">✕</button>
            ${receiptHTML}
            <div class="receipt-actions">
                <button onclick="window.print()" class="btn-print">🖨️ Басып шығару</button>
                <button onclick="this.closest('.receipt-modal').remove()" class="btn-close-modal">Жабу</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}
