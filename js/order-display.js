// Order Display System JavaScript
class OrderDisplaySystem {
    constructor() {
        this.readyOrders = [];
        this.preparingOrders = [];
        this.updateInterval = null;
        this.soundEnabled = true;
        
        this.init();
    }
    
    init() {
        this.updateTime();
        this.startTimeUpdate();
        this.loadOrders();
        this.startOrderUpdates();
        this.setupKeyboardControls();
    }
    
    // Update current time
    updateTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        document.getElementById('currentTime').textContent = timeString;
    }
    
    // Start time updates
    startTimeUpdate() {
        setInterval(() => {
            this.updateTime();
        }, 1000);
    }
    
    // Load orders from Firebase
    async loadOrders() {
        try {
            const result = await OrderAPI.getAllOrders();
            if (result.success) {
                this.processOrders(result.orders);
                this.renderOrders();
            }
        } catch (error) {
            console.error('Error loading orders:', error);
        }
    }
    
    // Process orders by status
    processOrders(orders) {
        const today = new Date().toDateString();
        
        this.readyOrders = orders.filter(order => {
            const orderDate = new Date(order.createdAt?.toDate?.() || order.createdAt).toDateString();
            return order.status === 'ready' && orderDate === today;
        }).sort((a, b) => {
            const timeA = new Date(a.updatedAt?.toDate?.() || a.updatedAt);
            const timeB = new Date(b.updatedAt?.toDate?.() || b.updatedAt);
            return timeB - timeA; // Newest first
        });
        
        this.preparingOrders = orders.filter(order => {
            const orderDate = new Date(order.createdAt?.toDate?.() || order.createdAt).toDateString();
            return (order.status === 'confirmed' || order.status === 'preparing') && orderDate === today;
        }).sort((a, b) => {
            const timeA = new Date(a.createdAt?.toDate?.() || a.createdAt);
            const timeB = new Date(b.createdAt?.toDate?.() || b.createdAt);
            return timeA - timeB; // Oldest first
        });
    }
    
    // Render orders on display
    renderOrders() {
        this.renderReadyOrders();
        this.renderPreparingOrders();
    }
    
    // Render ready orders
    renderReadyOrders() {
        const container = document.getElementById('readyOrdersGrid');
        
        if (this.readyOrders.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-coffee"></i>
                    <h3>No Ready Orders</h3>
                    <p>Orders will appear here when ready</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = this.readyOrders.map(order => {
            const orderNumber = this.extractOrderNumber(order.orderNumber || order.id);
            const customerName = order.customerName || 'Customer';
            const items = this.formatOrderItems(order.items || []);
            
            return `
                <div class="order-card ready" data-order-id="${order.id}">
                    <div class="order-number">#${orderNumber}</div>
                    <div class="order-customer">${customerName}</div>
                    <div class="order-items">${items}</div>
                </div>
            `;
        }).join('');
    }
    
    // Render preparing orders
    renderPreparingOrders() {
        const container = document.getElementById('preparingOrdersList');
        
        if (this.preparingOrders.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-clock"></i>
                    <h3>No Orders in Preparation</h3>
                    <p>Orders being prepared will appear here</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = this.preparingOrders.map(order => {
            const orderNumber = this.extractOrderNumber(order.orderNumber || order.id);
            const customerName = order.customerName || 'Customer';
            
            return `
                <div class="preparing-order" data-order-id="${order.id}">
                    <div class="order-number">#${orderNumber}</div>
                    <div class="order-customer">${customerName}</div>
                </div>
            `;
        }).join('');
    }
    
    // Extract order number from full order number
    extractOrderNumber(fullOrderNumber) {
        if (!fullOrderNumber) return '000';
        
        // Extract last 3-4 digits from order number
        const match = fullOrderNumber.toString().match(/(\d{3,4})$/);
        return match ? match[1] : fullOrderNumber.toString().slice(-3);
    }
    
    // Format order items for display
    formatOrderItems(items) {
        if (!items || items.length === 0) return 'No items';
        
        return items.map(item => {
            const name = item.name || 'Item';
            const quantity = item.quantity || 1;
            const size = item.size ? ` (${item.size}ml)` : '';
            return `${quantity}x ${name}${size}`;
        }).join(', ');
    }
    
    // Start real-time order updates
    startOrderUpdates() {
        // Listen for real-time updates from Firebase
        if (window.db) {
            window.db.collection('orders')
                .where('status', 'in', ['ready', 'confirmed', 'preparing'])
                .onSnapshot((snapshot) => {
                    console.log('Orders updated, refreshing display...');
                    this.loadOrders();
                });
        }
        
        // Fallback: Update every 30 seconds
        this.updateInterval = setInterval(() => {
            this.loadOrders();
        }, 30000);
    }
    
    // Setup keyboard controls
    setupKeyboardControls() {
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'F5':
                    e.preventDefault();
                    this.loadOrders();
                    break;
                case 'F11':
                    this.toggleFullscreen();
                    break;
                case 's':
                case 'S':
                    this.toggleSound();
                    break;
            }
        });
    }
    
    // Toggle fullscreen
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }
    
    // Toggle sound
    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        console.log('Sound', this.soundEnabled ? 'enabled' : 'disabled');
    }
    
    // Play notification sound (when new order is ready)
    playNotificationSound() {
        if (!this.soundEnabled) return;
        
        // Create a simple beep sound
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    }
    
    // Cleanup
    destroy() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
    }
}

// Initialize Order Display System when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Wait for Firebase to initialize
    setTimeout(() => {
        window.orderDisplaySystem = new OrderDisplaySystem();
        console.log('Order Display System initialized');
    }, 1000);
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (window.orderDisplaySystem) {
        window.orderDisplaySystem.destroy();
    }
});