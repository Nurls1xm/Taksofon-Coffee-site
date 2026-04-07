// telegram-auto-connect.js - Автоматическое подключение к Telegram боту
class TelegramAutoConnect {
    constructor() {
        this.botUsername = 'taksofon_coffee_bot';
        this.botUrl = `https://t.me/${this.botUsername}`;
        this.apiUrl = 'php/telegram-bot.php';
        this.checkInterval = null;
        this.maxAttempts = 30; // 30 секунд проверки
        this.currentAttempt = 0;
    }

    // Создание кнопки автоподключения
    createAutoConnectButton(container) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'telegram-auto-connect-btn';
        button.innerHTML = `
            <i class="fab fa-telegram"></i>
            <span>Автоматически получить Chat ID</span>
        `;
        
        button.onclick = () => this.startAutoConnect();
        
        // Добавляем стили
        if (!document.getElementById('telegram-auto-connect-styles')) {
            const styles = document.createElement('style');
            styles.id = 'telegram-auto-connect-styles';
            styles.textContent = `
                .telegram-auto-connect-btn {
                    background: linear-gradient(135deg, #0088cc 0%, #0066aa 100%);
                    color: white;
                    border: none;
                    padding: 12px 20px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 14px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    width: 100%;
                    margin: 10px 0;
                    transition: all 0.3s ease;
                }
                .telegram-auto-connect-btn:hover {
                    background: linear-gradient(135deg, #0066aa 0%, #004488 100%);
                    transform: translateY(-1px);
                }
                .telegram-auto-connect-btn:disabled {
                    background: #ccc;
                    cursor: not-allowed;
                    transform: none;
                }
                .telegram-status {
                    padding: 10px;
                    border-radius: 6px;
                    margin: 10px 0;
                    font-size: 14px;
                }
                .telegram-status.loading {
                    background: #e3f2fd;
                    color: #1976d2;
                    border: 1px solid #bbdefb;
                }
                .telegram-status.success {
                    background: #e8f5e8;
                    color: #2e7d32;
                    border: 1px solid #c8e6c9;
                }
                .telegram-status.error {
                    background: #ffebee;
                    color: #c62828;
                    border: 1px solid #ffcdd2;
                }
                .telegram-qr {
                    text-align: center;
                    padding: 20px;
                    background: #f5f5f5;
                    border-radius: 8px;
                    margin: 15px 0;
                }
                .telegram-qr img {
                    max-width: 200px;
                    height: auto;
                }
            `;
            document.head.appendChild(styles);
        }
        
        container.appendChild(button);
        return button;
    }

    // Создание статусного сообщения
    createStatusMessage(container) {
        const status = document.createElement('div');
        status.className = 'telegram-status';
        status.id = 'telegram-connect-status';
        status.style.display = 'none';
        container.appendChild(status);
        return status;
    }

    // Запуск автоподключения
    async startAutoConnect() {
        const button = document.querySelector('.telegram-auto-connect-btn');
        const status = document.getElementById('telegram-connect-status') || 
                      this.createStatusMessage(button.parentElement);
        
        button.disabled = true;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Подключение...';
        
        status.className = 'telegram-status loading';
        status.style.display = 'block';
        status.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <i class="fas fa-spinner fa-spin"></i>
                <div>
                    <strong>Шаг 1:</strong> Открываем бота...<br>
                    <small>Нажмите "Открыть бота" и отправьте любое сообщение</small>
                </div>
            </div>
        `;

        // Открываем бота в новой вкладке
        const botWindow = window.open(this.botUrl, '_blank');
        
        // Показываем инструкции
        this.showInstructions(status);
        
        // Начинаем проверку Chat ID
        setTimeout(() => {
            this.startChatIdCheck(status, button);
        }, 3000);
    }

    // Показ инструкций пользователю
    showInstructions(status) {
        setTimeout(() => {
            status.innerHTML = `
                <div style="display: flex; align-items: center; gap: 10px;">
                    <i class="fab fa-telegram" style="font-size: 24px; color: #0088cc;"></i>
                    <div>
                        <strong>Шаг 2:</strong> Отправьте боту любое сообщение<br>
                        <small>Например: "Привет" или нажмите /start</small>
                    </div>
                </div>
                <div style="margin-top: 10px; text-align: center;">
                    <a href="${this.botUrl}" target="_blank" style="color: #0088cc; text-decoration: none;">
                        📱 Открыть @${this.botUsername}
                    </a>
                </div>
            `;
        }, 1000);
    }

    // Начало проверки Chat ID
    startChatIdCheck(status, button) {
        this.currentAttempt = 0;
        
        status.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <i class="fas fa-search fa-spin"></i>
                <div>
                    <strong>Шаг 3:</strong> Ищем ваш Chat ID...<br>
                    <small>Проверяем сообщения (попытка 1 из ${this.maxAttempts})</small>
                </div>
            </div>
        `;

        this.checkInterval = setInterval(() => {
            this.checkForChatId(status, button);
        }, 1000);
    }

    // Проверка Chat ID
    async checkForChatId(status, button) {
        this.currentAttempt++;
        
        try {
            const response = await fetch(`${this.apiUrl}?action=get_updates`);
            const data = await response.json();
            
            if (data.success && data.updates && data.updates.length > 0) {
                // Ищем последнее сообщение
                const lastUpdate = data.updates[data.updates.length - 1];
                const chatId = lastUpdate.message?.chat?.id;
                const firstName = lastUpdate.message?.from?.first_name || 'Пользователь';
                const messageTime = lastUpdate.message?.date;
                
                // Проверяем что сообщение свежее (последние 2 минуты)
                const now = Math.floor(Date.now() / 1000);
                if (chatId && messageTime && (now - messageTime) < 120) {
                    this.onChatIdFound(chatId, firstName, status, button);
                    return;
                }
            }
            
            // Обновляем статус
            status.innerHTML = `
                <div style="display: flex; align-items: center; gap: 10px;">
                    <i class="fas fa-search fa-spin"></i>
                    <div>
                        <strong>Ищем ваш Chat ID...</strong><br>
                        <small>Попытка ${this.currentAttempt} из ${this.maxAttempts}</small>
                    </div>
                </div>
            `;
            
            // Если превысили лимит попыток
            if (this.currentAttempt >= this.maxAttempts) {
                this.onTimeout(status, button);
            }
            
        } catch (error) {
            console.error('Ошибка проверки Chat ID:', error);
            this.onError(error.message, status, button);
        }
    }

    // Chat ID найден
    onChatIdFound(chatId, firstName, status, button) {
        clearInterval(this.checkInterval);
        
        status.className = 'telegram-status success';
        status.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <i class="fas fa-check-circle" style="color: #4caf50; font-size: 24px;"></i>
                <div>
                    <strong>✅ Chat ID найден!</strong><br>
                    <small>👤 ${firstName} | 🆔 ${chatId}</small>
                </div>
            </div>
        `;
        
        // Автоматически заполняем поле
        const telegramInput = document.querySelector('input[placeholder*="Chat ID"], input[placeholder*="Telegram"], #telegram-details input');
        if (telegramInput) {
            telegramInput.value = chatId;
            telegramInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
        
        // Автоматически выбираем Telegram как тип уведомления
        const telegramRadio = document.querySelector('input[value="telegram"]');
        if (telegramRadio) {
            telegramRadio.checked = true;
            telegramRadio.dispatchEvent(new Event('change', { bubbles: true }));
        }
        
        button.innerHTML = '<i class="fas fa-check"></i> Chat ID получен!';
        button.style.background = '#4caf50';
        
        // Показываем кнопку тестирования
        setTimeout(() => {
            this.showTestButton(status, chatId);
        }, 2000);
    }

    // Таймаут поиска
    onTimeout(status, button) {
        clearInterval(this.checkInterval);
        
        status.className = 'telegram-status error';
        status.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <i class="fas fa-exclamation-triangle" style="color: #ff9800; font-size: 24px;"></i>
                <div>
                    <strong>⏰ Время ожидания истекло</strong><br>
                    <small>Не удалось найти ваше сообщение боту</small>
                </div>
            </div>
            <div style="margin-top: 10px;">
                <strong>Что делать:</strong><br>
                1. Убедитесь что отправили сообщение боту<br>
                2. Попробуйте еще раз<br>
                3. Или получите Chat ID вручную
            </div>
        `;
        
        button.disabled = false;
        button.innerHTML = '<i class="fas fa-redo"></i> Попробовать еще раз';
        button.style.background = '';
    }

    // Ошибка
    onError(errorMessage, status, button) {
        clearInterval(this.checkInterval);
        
        status.className = 'telegram-status error';
        status.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <i class="fas fa-exclamation-circle" style="color: #f44336; font-size: 24px;"></i>
                <div>
                    <strong>❌ Ошибка подключения</strong><br>
                    <small>${errorMessage}</small>
                </div>
            </div>
        `;
        
        button.disabled = false;
        button.innerHTML = '<i class="fas fa-redo"></i> Попробовать еще раз';
        button.style.background = '';
    }

    // Показ кнопки тестирования
    showTestButton(status, chatId) {
        const testButton = document.createElement('button');
        testButton.type = 'button';
        testButton.className = 'telegram-test-btn';
        testButton.innerHTML = '<i class="fas fa-paper-plane"></i> Отправить тестовое сообщение';
        testButton.style.cssText = `
            background: #ff9800;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 13px;
            margin-top: 10px;
            width: 100%;
        `;
        
        testButton.onclick = () => this.sendTestMessage(chatId, testButton);
        
        status.appendChild(testButton);
    }

    // Отправка тестового сообщения
    async sendTestMessage(chatId, button) {
        button.disabled = true;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Отправка...';
        
        try {
            const formData = new FormData();
            formData.append('action', 'send_test_notification');
            formData.append('chat_id', chatId);
            
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            
            if (result.success) {
                button.innerHTML = '<i class="fas fa-check"></i> Сообщение отправлено!';
                button.style.background = '#4caf50';
            } else {
                throw new Error(result.error || 'Неизвестная ошибка');
            }
            
        } catch (error) {
            button.innerHTML = '<i class="fas fa-exclamation"></i> Ошибка отправки';
            button.style.background = '#f44336';
            console.error('Ошибка тестового сообщения:', error);
        }
    }

    // Создание QR кода для быстрого подключения
    createQRCode(container) {
        const qrContainer = document.createElement('div');
        qrContainer.className = 'telegram-qr';
        qrContainer.innerHTML = `
            <h4>📱 Быстрое подключение через QR-код</h4>
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(this.botUrl)}" alt="QR код бота">
            <p><small>Отсканируйте QR-код телефоном и отправьте сообщение боту</small></p>
        `;
        
        container.appendChild(qrContainer);
        return qrContainer;
    }
}

// Создание глобального экземпляра
window.telegramAutoConnect = new TelegramAutoConnect();

// Автоматическая инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    // Ищем контейнер для Telegram уведомлений
    const telegramDetails = document.getElementById('telegram-details');
    if (telegramDetails) {
        // Добавляем кнопку автоподключения
        const autoConnect = window.telegramAutoConnect;
        autoConnect.createAutoConnectButton(telegramDetails);
        autoConnect.createStatusMessage(telegramDetails);
        
        // Добавляем QR код
        autoConnect.createQRCode(telegramDetails);
    }
});