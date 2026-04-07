// notification-preferences-simple.js - Система уведомлений БЕЗ Telegram

class NotificationPreferences {
    constructor() {
        this.selectedType = 'none';
        this.notificationData = {};
        
        // Бетті толық жүктегенде іске қосу
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }
    
    init() {
        // Container бар ма тексеру
        const container = document.getElementById('notificationPreferencesContainer');
        if (!container) {
            console.log('ℹ️ Notification container not found, skipping initialization');
            return;
        }
        
        this.createUI();
        this.attachEventListeners();
    }
    
    // UI құру
    createUI() {
        const container = document.getElementById('notificationPreferencesContainer');
        if (!container) return;
        
        container.innerHTML = `
            <div class="notification-preferences">
                <h3>
                    <i class="fas fa-bell"></i>
                    <span data-i18n="book_notification_title">Notification Type</span>
                </h3>
                <p data-i18n="book_notification_subtitle">How would you like to be notified when your order is ready?</p>
                
                <div class="notification-options">
                    <!-- Email -->
                    <div class="notification-option">
                        <input type="radio" name="notificationType" id="notif-email" value="email">
                        <label for="notif-email">
                            <div class="notification-icon">📧</div>
                            <div class="notification-label" data-i18n="book_notification_email">Email</div>
                            <div class="notification-description" data-i18n="book_notification_email_desc">Email notification</div>
                        </label>
                    </div>
                    
                    <!-- Web Push -->
                    <div class="notification-option">
                        <input type="radio" name="notificationType" id="notif-push" value="push">
                        <label for="notif-push">
                            <div class="notification-icon">🔔</div>
                            <div class="notification-label" data-i18n="book_notification_push">Browser Notification</div>
                            <div class="notification-description" data-i18n="book_notification_push_desc">Push notification</div>
                        </label>
                    </div>
                    
                    <!-- None -->
                    <div class="notification-option">
                        <input type="radio" name="notificationType" id="notif-none" value="none" checked>
                        <label for="notif-none">
                            <div class="notification-icon">🚫</div>
                            <div class="notification-label" data-i18n="book_notification_none">No Notification</div>
                            <div class="notification-description" data-i18n="book_notification_none_desc">I'll check myself</div>
                        </label>
                    </div>
                </div>
                
                <!-- Email деректері -->
                <div class="notification-details" id="email-details">
                    <div class="form-group">
                        <label>
                            <i class="fas fa-envelope"></i>
                            <span>Email Address</span>
                        </label>
                        <input 
                            type="email" 
                            id="email-input"
                            placeholder="example@gmail.com"
                            maxlength="100"
                        >
                        <small>We'll send you an email when your order is ready</small>
                    </div>
                </div>
                
                <!-- Push деректері -->
                <div class="notification-details" id="push-details">
                    <div class="form-group">
                        <button type="button" class="enable-push-btn">
                            <i class="fas fa-bell"></i>
                            <span>Enable Browser Notifications</span>
                        </button>
                        <div class="push-status"></div>
                        <small>Allow browser notifications to receive updates</small>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Event listeners қосу
    attachEventListeners() {
        // Radio button өзгерістері
        document.querySelectorAll('input[name="notificationType"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.selectedType = e.target.value;
                this.showDetails(e.target.value);
            });
        });
        
        // Email input
        const emailInput = document.querySelector('#email-input');
        if (emailInput) {
            emailInput.addEventListener('input', (e) => {
                this.notificationData.email = e.target.value;
            });
        }
        
        // Push button
        const pushBtn = document.querySelector('.enable-push-btn');
        if (pushBtn) {
            pushBtn.addEventListener('click', () => {
                this.enablePushNotifications();
            });
        }
    }
    
    // Деталь көрсету
    showDetails(type) {
        // Барлық деталь блоктарын жасыру
        document.querySelectorAll('.notification-details').forEach(detail => {
            detail.style.display = 'none';
        });
        
        // Таңдалған түрдің деталін көрсету
        if (type !== 'none') {
            const detailBlock = document.getElementById(`${type}-details`);
            if (detailBlock) {
                detailBlock.style.display = 'block';
            }
        }
    }
    
    // Push хабарламаларын қосу
    async enablePushNotifications() {
        const button = document.querySelector('.enable-push-btn');
        const status = document.querySelector('.push-status');
        
        try {
            if (!('Notification' in window)) {
                throw new Error('Your browser does not support push notifications');
            }
            
            button.disabled = true;
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enabling...';
            
            const permission = await Notification.requestPermission();
            
            if (permission === 'granted') {
                this.notificationData.pushEnabled = true;
                button.innerHTML = '<i class="fas fa-check"></i> Enabled!';
                button.style.background = '#4CAF50';
                status.innerHTML = '<span style="color: #4CAF50;">✓ Push notifications enabled</span>';
            } else {
                throw new Error('Permission for push notifications was denied');
            }
            
        } catch (error) {
            button.disabled = false;
            button.innerHTML = '<i class="fas fa-bell"></i> Enable Browser Notifications';
            status.innerHTML = `<span style="color: #f44336;">✗ ${error.message}</span>`;
        }
    }
    
    // Деректерді алу
    getData() {
        const data = {
            type: this.selectedType
        };
        
        if (this.selectedType === 'email') {
            data.email = this.notificationData.email || '';
        } else if (this.selectedType === 'push') {
            data.pushEnabled = this.notificationData.pushEnabled || false;
        }
        
        return data;
    }
    
    // Валидация
    validate() {
        const data = this.getData();
        
        if (data.type === 'none') {
            return { valid: true };
        }
        
        if (data.type === 'email' && !data.email) {
            return { 
                valid: false, 
                message: 'Please enter your email address' 
            };
        }
        
        if (data.type === 'email' && !this.isValidEmail(data.email)) {
            return { 
                valid: false, 
                message: 'Please enter a valid email address' 
            };
        }
        
        if (data.type === 'push' && !data.pushEnabled) {
            return { 
                valid: false, 
                message: 'Please enable browser notifications' 
            };
        }
        
        return { valid: true };
    }
    
    // Email валидациясы
    isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
}

// Global instance
window.notificationPreferences = new NotificationPreferences();