// notification-sender.js - Класс для отправки уведомлений
class NotificationSender {
    constructor() {
        this.telegramBotUrl = 'php/telegram-bot.php';
        this.telegramUsernameUrl = 'php/telegram-username.php';
        this.emailSenderUrl = 'php/email-sender.php';
        this.debug = true; // Включить для отладки
    }
    
    // Логирование для отладки
    log(message, data = null) {
        if (this.debug) {
            console.log(`[NotificationSender] ${message}`, data || '');
        }
    }
    
    // Отправка уведомления в Telegram по username
    async sendTelegramNotificationByUsername(username, orderData) {
        this.log('Отправка Telegram уведомления по username', { username, orderData });
        
        try {
            // Валидация username
            if (!username || username.trim() === '') {
                throw new Error('Username не указан');
            }
            
            // Очистка username от лишних символов
            const cleanUsername = username.replace(/[^a-zA-Z0-9_]/g, '');
            
            if (!cleanUsername) {
                throw new Error('Неверный формат username');
            }
            
            const formData = new FormData();
            formData.append('action', 'send_order_notification_by_username');
            formData.append('username', cleanUsername);
            formData.append('order_data', JSON.stringify(orderData));
            
            const response = await fetch(this.telegramUsernameUrl, {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const result = await response.json();
            
            this.log('Telegram username ответ получен', result);
            
            if (result.success) {
                return {
                    success: true,
                    message: 'Уведомление отправлено в Telegram',
                    platform: 'telegram_username',
                    username: cleanUsername
                };
            } else {
                throw new Error(result.error || 'Неизвестная ошибка Telegram API');
            }
            
        } catch (error) {
            this.log('Ошибка Telegram username уведомления', error);
            return {
                success: false,
                error: error.message,
                platform: 'telegram_username'
            };
        }
    }

    // Отправка уведомления в Telegram по Chat ID (старый метод)
    async sendTelegramNotification(chatId, orderData) {
        this.log('Отправка Telegram уведомления', { chatId, orderData });
        
        try {
            // Валидация Chat ID
            if (!chatId || chatId.trim() === '') {
                throw new Error('Chat ID не указан');
            }
            
            // Очистка Chat ID от лишних символов
            const cleanChatId = chatId.toString().replace(/[^\d-]/g, '');
            
            if (!cleanChatId) {
                throw new Error('Неверный формат Chat ID');
            }
            
            const formData = new FormData();
            formData.append('action', 'send_order_notification');
            formData.append('chat_id', cleanChatId);
            formData.append('order_data', JSON.stringify(orderData));
            
            const response = await fetch(this.telegramBotUrl, {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const result = await response.json();
            
            this.log('Telegram ответ получен', result);
            
            if (result.success) {
                return {
                    success: true,
                    message: 'Уведомление отправлено в Telegram',
                    platform: 'telegram',
                    chatId: cleanChatId
                };
            } else {
                throw new Error(result.error || 'Неизвестная ошибка Telegram API');
            }
            
        } catch (error) {
            this.log('Ошибка Telegram уведомления', error);
            return {
                success: false,
                error: error.message,
                platform: 'telegram'
            };
        }
    }
    
    // Отправка уведомления на Email
    async sendEmailNotification(customerEmail, orderData) {
        this.log('Отправка Email уведомления', { customerEmail, orderData });
        
        try {
            // Валидация email
            if (!customerEmail || !this.isValidEmail(customerEmail)) {
                throw new Error('Неверный формат email адреса');
            }
            
            const formData = new FormData();
            formData.append('action', 'send_email_notification');
            formData.append('customer_email', customerEmail);
            formData.append('order_data', JSON.stringify(orderData));
            
            const response = await fetch(this.emailSenderUrl, {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const result = await response.json();
            
            this.log('Email ответ получен', result);
            
            if (result.success) {
                return {
                    success: true,
                    message: 'Email уведомление отправлено',
                    platform: 'email',
                    email: customerEmail
                };
            } else {
                throw new Error(result.error || 'Неизвестная ошибка Email сервиса');
            }
            
        } catch (error) {
            this.log('Ошибка Email уведомления', error);
            return {
                success: false,
                error: error.message,
                platform: 'email'
            };
        }
    }
    
    // Отправка Push уведомления (через браузер)
    async sendPushNotification(orderData) {
        this.log('Отправка Push уведомления', orderData);
        
        try {
            // Проверка поддержки уведомлений
            if (!('Notification' in window)) {
                throw new Error('Браузер не поддерживает уведомления');
            }
            
            // Запрос разрешения
            let permission = Notification.permission;
            
            if (permission === 'default') {
                permission = await Notification.requestPermission();
            }
            
            if (permission !== 'granted') {
                throw new Error('Разрешение на уведомления не предоставлено');
            }
            
            // Создание уведомления
            const notification = new Notification(`Заказ №${orderData.order_id} принят`, {
                body: `Спасибо за заказ, ${orderData.customer_name}! Время приготовления: 15-20 минут.`,
                icon: 'image/coffee-icon.png', // Добавьте иконку
                badge: 'image/coffee-badge.png',
                tag: `order-${orderData.order_id}`,
                requireInteraction: true,
                actions: [
                    {
                        action: 'view',
                        title: 'Посмотреть заказ'
                    }
                ]
            });
            
            // Обработка клика по уведомлению
            notification.onclick = function() {
                window.focus();
                notification.close();
                // Можно добавить переход к странице отслеживания заказа
            };
            
            // Автоматическое закрытие через 10 секунд
            setTimeout(() => {
                notification.close();
            }, 10000);
            
            return {
                success: true,
                message: 'Push уведомление отправлено',
                platform: 'push'
            };
            
        } catch (error) {
            this.log('Ошибка Push уведомления', error);
            return {
                success: false,
                error: error.message,
                platform: 'push'
            };
        }
    }
    
    // Основная функция отправки уведомлений
    async sendNotifications(notificationType, contactInfo, orderData) {
        this.log('Начало отправки уведомлений', { notificationType, contactInfo, orderData });
        
        const results = [];
        
        try {
            switch (notificationType) {
                case 'telegram':
                    if (!contactInfo) {
                        throw new Error('Не указан username для Telegram');
                    }
                    // Используем отправку по username
                    const telegramResult = await this.sendTelegramNotificationByUsername(contactInfo, orderData);
                    results.push(telegramResult);
                    break;
                    
                case 'telegram_username':
                    if (!contactInfo) {
                        throw new Error('Не указан username для Telegram');
                    }
                    const telegramUsernameResult = await this.sendTelegramNotificationByUsername(contactInfo, orderData);
                    results.push(telegramUsernameResult);
                    break;
                    
                case 'email':
                    if (!contactInfo) {
                        throw new Error('Не указан email адрес');
                    }
                    const emailResult = await this.sendEmailNotification(contactInfo, orderData);
                    results.push(emailResult);
                    break;
                    
                case 'push':
                    const pushResult = await this.sendPushNotification(orderData);
                    results.push(pushResult);
                    break;
                    
                case 'none':
                    this.log('Уведомления отключены пользователем');
                    results.push({
                        success: true,
                        message: 'Уведомления отключены',
                        platform: 'none'
                    });
                    break;
                    
                default:
                    throw new Error(`Неизвестный тип уведомления: ${notificationType}`);
            }
            
            this.log('Результаты отправки уведомлений', results);
            return results;
            
        } catch (error) {
            this.log('Общая ошибка отправки уведомлений', error);
            return [{
                success: false,
                error: error.message,
                platform: notificationType
            }];
        }
    }
    
    // Тестовая отправка Telegram уведомления по username
    async testTelegramUsernameNotification(username) {
        try {
            const formData = new FormData();
            formData.append('action', 'test_username_notification');
            formData.append('username', username);
            
            const response = await fetch(this.telegramUsernameUrl, {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            return result;
            
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Тестовая отправка Telegram уведомления по Chat ID
    async testTelegramNotification(chatId) {
        const testOrderData = {
            order_id: 'TEST' + Date.now(),
            customer_name: 'Тестовый Пользователь',
            phone: '+7 777 123 45 67',
            delivery_type: 'delivery',
            address: 'г. Астана, ул. Тестовая, 123',
            payment_method: 'card',
            total: 1500,
            items: [
                { name: 'Латте', quantity: 1, price: 800 },
                { name: 'Капучино', quantity: 1, price: 700 }
            ]
        };
        
        return await this.sendTelegramNotification(chatId, testOrderData);
    }
    
    // Тестовая отправка Email уведомления
    async testEmailNotification(email) {
        try {
            const formData = new FormData();
            formData.append('action', 'test_email');
            formData.append('test_email', email);
            
            const response = await fetch(this.emailSenderUrl, {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            return result;
            
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    // Валидация email адреса
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    // Валидация Telegram username
    isValidTelegramUsername(username) {
        const cleanUsername = username.replace(/^@/, ''); // Убираем @ если есть
        return /^[a-zA-Z0-9_]{5,32}$/.test(cleanUsername);
    }

    // Валидация Telegram Chat ID
    isValidChatId(chatId) {
        const cleanChatId = chatId.toString().replace(/[^\d-]/g, '');
        return cleanChatId.length > 0 && /^-?\d+$/.test(cleanChatId);
    }
    
    // Получение статистики отправленных уведомлений
    getNotificationStats() {
        const stats = localStorage.getItem('notification_stats');
        return stats ? JSON.parse(stats) : {
            telegram: { sent: 0, failed: 0 },
            email: { sent: 0, failed: 0 },
            push: { sent: 0, failed: 0 }
        };
    }
    
    // Сохранение статистики
    updateNotificationStats(platform, success) {
        const stats = this.getNotificationStats();
        
        if (success) {
            stats[platform].sent++;
        } else {
            stats[platform].failed++;
        }
        
        localStorage.setItem('notification_stats', JSON.stringify(stats));
    }
}

// Создание глобального экземпляра
window.notificationSender = new NotificationSender();

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NotificationSender;
}