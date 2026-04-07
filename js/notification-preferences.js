// 📱 Хабарлама таңдау жүйесі
// Notification Preferences System

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
        
        // Загружаем сохраненный Chat ID из localStorage
        this.loadSavedChatId();
    }
    
    // UI құру
    createUI() {
        const container = document.getElementById('notificationPreferencesContainer');
        if (!container) return;
        
        container.innerHTML = `
            <div class="notification-preferences">
                <h3>
                    <i class="fas fa-bell"></i>
                    <span data-i18n="book_notification_title">Хабарлама түрі</span>
                </h3>
                <p data-i18n="book_notification_subtitle">Тапсырыс дайын болғанда қалай хабарласамыз?</p>
                
                <div class="notification-options">
                    <!-- Phone Call -->
                    <div class="notification-option">
                        <input type="radio" name="notificationType" id="notif-phone" value="phone">
                        <label for="notif-phone">
                            <div class="notification-icon">📞</div>
                            <div class="notification-label" data-i18n="book_notification_phone">Телефон қоңырауы</div>
                            <div class="notification-description" data-i18n="book_notification_phone_desc">Дайын болғанда қоңырау шаламыз</div>
                        </label>
                    </div>
                    
                    <!-- None -->
                    <div class="notification-option">
                        <input type="radio" name="notificationType" id="notif-none" value="none" checked>
                        <label for="notif-none">
                            <div class="notification-icon">🚫</div>
                            <div class="notification-label" data-i18n="book_notification_none">Хабарлама керек емес</div>
                            <div class="notification-description" data-i18n="book_notification_none_desc">Өзім тексеремін</div>
                        </label>
                    </div>
                </div>
                
                <!-- Telegram деректері -->
                <div class="notification-details" id="telegram-details">
                    <div class="form-group">
                        <label>
                            <i class="fab fa-telegram"></i>
                            <span>Telegram username</span>
                        </label>
                        <input 
                            type="text" 
                            id="telegram-input" 
                            placeholder="Введите ваш username (без @)"
                            maxlength="32"
                            pattern="[a-zA-Z0-9_]{5,32}"
                            title="Username должен содержать только буквы, цифры и подчеркивания (5-32 символа)"
                        >
                        <div class="helper-text">
                            <i class="fas fa-info-circle"></i>
                            <span>Пример: если ваш username @john_doe, введите: john_doe</span>
                        </div>
                        <div style="margin-top: 15px;">
                            <a href="test-telegram-simple.html" target="_blank" style="
                                display: inline-block;
                                background: #0088cc;
                                color: white;
                                padding: 8px 16px;
                                text-decoration: none;
                                border-radius: 6px;
                                font-size: 13px;
                                transition: background 0.3s;
                            ">
                                📱 Протестировать уведомления
                            </a>
                        </div>
                    </div>
                </div>
                            <span>Ботты іске қосыңыз: <a href="https://t.me/taksofon_coffee_bot" target="_blank">@taksofon_coffee_bot</a></span>
                        </div>
                    </div>
                </div>
                
                <!-- Email деректері -->
                <div class="notification-details" id="email-details">
                    <div class="form-group">
                        <label>
                            <i class="fas fa-envelope"></i>
                            <span>Email мекенжайы</span>
                        </label>
                        <input 
                            type="email" 
                            id="email-input" 
                            placeholder="example@mail.com"
                            data-i18n="book_email_placeholder"
                        >
                        <div class="helper-text">
                            <i class="fas fa-info-circle"></i>
                            <span>Хабарлама 1-5 минутта келеді</span>
                        </div>
                    </div>
                </div>
                
                <!-- Web Push деректері -->
                <div class="notification-details" id="push-details">
                    <div class="form-group">
                        <button class="enable-push-btn" id="enable-push-btn">
                            <i class="fas fa-bell"></i>
                            <span>Браузер хабарламаларын қосу</span>
                        </button>
                        <div class="push-status" id="push-status" style="display: none;"></div>
                        <div class="helper-text">
                            <i class="fas fa-info-circle"></i>
                            <span data-i18n="push_browser_request">Браузер рұқсат сұрайды</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Event listeners
    attachEventListeners() {
        // Хабарлама түрін таңдау
        document.querySelectorAll('input[name="notificationType"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.selectedType = e.target.value;
                this.showDetails(e.target.value);
            });
        });
        
        // Telegram input
        const telegramInput = document.getElementById('telegram-input');
        if (telegramInput) {
            telegramInput.addEventListener('input', (e) => {
                this.notificationData.telegram = e.target.value;
            });
        }
        
        // Email input
        const emailInput = document.getElementById('email-input');
        if (emailInput) {
            emailInput.addEventListener('input', (e) => {
                this.notificationData.email = e.target.value;
            });
        }
        
        // Push батырмасы
        const pushBtn = document.getElementById('enable-push-btn');
        if (pushBtn) {
            pushBtn.addEventListener('click', () => this.requestPushPermission());
        }
    }
    
    // Деректер өрісін көрсету
    showDetails(type) {
        // Барлық деректер өрістерін жасыру
        document.querySelectorAll('.notification-details').forEach(detail => {
            detail.classList.remove('active');
        });
        
        // Таңдалған түрдің өрісін көрсету
        if (type !== 'none') {
            const detailsElement = document.getElementById(`${type}-details`);
            if (detailsElement) {
                detailsElement.classList.add('active');
            }
        }
    }
    
    // Push хабарлама рұқсатын сұрау
    async requestPushPermission() {
        const btn = document.getElementById('enable-push-btn');
        const status = document.getElementById('push-status');
        
        if (!('Notification' in window)) {
            this.showPushStatus('error', 'Браузер хабарламаларды қолдамайды');
            return;
        }
        
        try {
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Күтіңіз...';
            
            const permission = await Notification.requestPermission();
            
            if (permission === 'granted') {
                // FCM token алу (Firebase Cloud Messaging)
                if (typeof firebase !== 'undefined' && firebase.messaging) {
                    const messaging = firebase.messaging();
                    const token = await messaging.getToken();
                    this.notificationData.fcmToken = token;
                    this.showPushStatus('success', '✓ ' + (window.i18n ? window.i18n.t('push_notifications_enabled') : 'Notifications enabled!'));
                } else {
                    this.showPushStatus('success', '✓ ' + (window.i18n ? window.i18n.t('push_permission_granted') : 'Permission granted!'));
                }
                
                btn.innerHTML = '<i class="fas fa-check"></i> ' + (window.i18n ? window.i18n.t('push_enabled_button') : 'Enabled');
            } else {
                this.showPushStatus('error', '✗ ' + (window.i18n ? window.i18n.t('push_permission_denied') : 'Permission denied'));
                btn.disabled = false;
                btn.innerHTML = '<i class="fas fa-bell"></i> Қайта көріңіз';
            }
        } catch (error) {
            console.error('Push рұқсат қатесі:', error);
            this.showPushStatus('error', '✗ Қате орын алды');
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-bell"></i> Қайта көріңіз';
        }
    }
    
    // Push статусын көрсету
    showPushStatus(type, message) {
        const status = document.getElementById('push-status');
        status.className = `push-status ${type}`;
        status.textContent = message;
        status.style.display = 'block';
    }
    
    // Хабарлама деректерін алу
    getData() {
        const data = {
            type: this.selectedType
        };
        
        if (this.selectedType === 'telegram') {
            data.telegram = this.notificationData.telegram || '';
        } else if (this.selectedType === 'email') {
            data.email = this.notificationData.email || '';
        } else if (this.selectedType === 'push') {
            data.fcmToken = this.notificationData.fcmToken || '';
        }
        
        return data;
    }
    
    // Валидация
    validate() {
        const data = this.getData();
        
        if (data.type === 'none') {
            return { valid: true };
        }
        
        if (data.type === 'telegram' && !data.telegram) {
            return { 
                valid: false, 
                message: 'Telegram username немесе Chat ID енгізіңіз' 
            };
        }
        
        if (data.type === 'email' && !data.email) {
            return { 
                valid: false, 
                message: 'Email мекенжайын енгізіңіз' 
            };
        }
        
        if (data.type === 'email' && !this.isValidEmail(data.email)) {
            return { 
                valid: false, 
                message: 'Email мекенжайы дұрыс емес' 
            };
        }
        
        if (data.type === 'push' && !data.fcmToken) {
            return { 
                valid: false, 
                message: 'Браузер хабарламаларын қосыңыз' 
            };
        }
        
        return { valid: true };
    }
    
    // Email валидациясы
    isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    
    // Загрузка сохраненного username из localStorage
    loadSavedChatId() {
        const savedUsername = localStorage.getItem('telegramUsername');
        
        if (savedUsername) {
            // Заполняем поле Telegram
            const telegramInput = document.querySelector('#telegram-details input');
            if (telegramInput) {
                telegramInput.value = savedUsername;
                this.notificationData.telegram = savedUsername;
            }
            
            // Автоматически выбираем Telegram как тип уведомления
            const telegramRadio = document.querySelector('input[value="telegram"]');
            if (telegramRadio) {
                telegramRadio.checked = true;
                this.selectedType = 'telegram';
                this.showDetails('telegram');
            }
            
            // Показываем информацию о сохраненном пользователе
            const telegramDetails = document.getElementById('telegram-details');
            if (telegramDetails) {
                const infoDiv = document.createElement('div');
                infoDiv.className = 'saved-username-info';
                infoDiv.style.cssText = `
                    background: #e8f5e8;
                    padding: 10px;
                    border-radius: 6px;
                    margin: 10px 0;
                    font-size: 13px;
                    color: #2e7d32;
                    border: 1px solid #c8e6c9;
                `;
                infoDiv.innerHTML = `
                    <i class="fas fa-check-circle"></i>
                    <strong>Telegram настроен:</strong> @${savedUsername}
                `;
                
                // Добавляем после input поля
                const input = telegramDetails.querySelector('input');
                if (input && !telegramDetails.querySelector('.saved-username-info')) {
                    input.parentNode.insertBefore(infoDiv, input.nextSibling);
                }
            }
            
            console.log('✅ Загружен сохраненный username:', savedUsername);
        }
    }
}

// Global instance
window.notificationPreferences = new NotificationPreferences();
