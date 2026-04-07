<?php
// telegram-bot.php - Telegram бот для уведомлений о заказах
header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Конфигурация (замените на ваши данные)
$botToken = '8221760018:AAHyvzvkLqiMj_by0VdpBlec7Qi5GDAWMhU'; // Ваш токен бота
$apiUrl = "https://api.telegram.org/bot{$botToken}/";

// Функция отправки сообщения
function sendMessage($chatId, $message, $parseMode = 'HTML') {
    global $apiUrl;
    
    $data = [
        'chat_id' => $chatId,
        'text' => $message,
        'parse_mode' => $parseMode
    ];
    
    $options = [
        'http' => [
            'header' => "Content-type: application/x-www-form-urlencoded\r\n",
            'method' => 'POST',
            'content' => http_build_query($data)
        ]
    ];
    
    $context = stream_context_create($options);
    $result = file_get_contents($apiUrl . 'sendMessage', false, $context);
    
    return json_decode($result, true);
}

// Функция логирования
function logMessage($message) {
    $logFile = '../logs/telegram-bot.log';
    $timestamp = date('Y-m-d H:i:s');
    file_put_contents($logFile, "[$timestamp] $message\n", FILE_APPEND | LOCK_EX);
}

// Обработка входящих сообщений от Telegram
$input = file_get_contents('php://input');
$update = json_decode($input, true);

if (isset($update['message'])) {
    $chatId = $update['message']['chat']['id'];
    $text = $update['message']['text'];
    $firstName = $update['message']['from']['first_name'] ?? 'Пользователь';
    
    logMessage("Получено сообщение от $firstName (ID: $chatId): $text");
    
    switch ($text) {
        case '/start':
            $response = "👋 Привет, {$firstName}!\n\n";
            $response .= "☕ Добро пожаловать в бот кофейни!\n\n";
            $response .= "🔔 <b>Для получения уведомлений о заказах:</b>\n";
            $response .= "1️⃣ Скопируйте ваш Chat ID: <code>{$chatId}</code>\n";
            $response .= "2️⃣ Укажите его при оформлении заказа на сайте\n";
            $response .= "3️⃣ Выберите \"Telegram\" как способ уведомления\n\n";
            $response .= "ℹ️ Используйте /help для получения помощи";
            break;
            
        case '/command1':
            $response = "🆔 <b>Ваш Chat ID для уведомлений:</b>\n\n";
            $response .= "<code>{$chatId}</code>\n\n";
            $response .= "📋 <b>Как использовать:</b>\n";
            $response .= "1. Скопируйте Chat ID выше\n";
            $response .= "2. При заказе на сайте выберите \"Telegram\"\n";
            $response .= "3. Вставьте Chat ID в поле для контакта\n";
            $response .= "4. Получайте уведомления о статусе заказа!\n\n";
            $response .= "☕ Спасибо, что выбираете нашу кофейню!";
            break;
            
        case '/help':
            $response = "🆘 <b>Справка по боту кофейни</b>\n\n";
            $response .= "📋 <b>Доступные команды:</b>\n";
            $response .= "• /start - Начать работу с ботом\n";
            $response .= "• /command1 - Получить ваш Chat ID\n";
            $response .= "• /help - Показать эту справку\n";
            $response .= "• /myid - Показать ваш Chat ID\n";
            $response .= "• /status - Проверить статус бота\n\n";
            $response .= "🆔 <b>Ваш Chat ID:</b> <code>{$chatId}</code>\n\n";
            $response .= "📱 <b>Как получать уведомления:</b>\n";
            $response .= "1. Скопируйте Chat ID выше\n";
            $response .= "2. При заказе на сайте выберите \"Telegram\"\n";
            $response .= "3. Вставьте Chat ID в поле для контакта\n";
            $response .= "4. Получайте уведомления о статусе заказа!";
            break;
            
        case '/myid':
            $response = "🆔 <b>Ваш Chat ID:</b> <code>{$chatId}</code>\n\n";
            $response .= "📋 Скопируйте этот ID для получения уведомлений о заказах";
            break;
            
        case '/status':
            $response = "📊 <b>Статус бота:</b> ✅ Работает нормально\n";
            $response .= "🕐 <b>Время сервера:</b> " . date('d.m.Y H:i:s') . "\n";
            $response .= "🆔 <b>Ваш Chat ID:</b> <code>{$chatId}</code>";
            break;
            
        default:
            $response = "❓ Неизвестная команда: <code>{$text}</code>\n\n";
            $response .= "📋 Используйте /help для получения списка доступных команд.\n\n";
            $response .= "💡 <b>Подсказка:</b> Этот бот предназначен для уведомлений о заказах. ";
            $response .= "Для оформления заказа перейдите на наш сайт.";
    }
    
    $result = sendMessage($chatId, $response);
    logMessage("Отправлен ответ пользователю $firstName: " . ($result['ok'] ? 'успешно' : 'ошибка'));
}

// API для отправки уведомлений о заказах с сайта
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action'])) {
    
    // Простая защита от спама
    $clientIP = $_SERVER['REMOTE_ADDR'];
    $rateLimitFile = "../logs/rate_limit_$clientIP.txt";
    $now = time();
    $maxRequests = 10; // максимум запросов
    $timeWindow = 3600; // за час
    
    if (file_exists($rateLimitFile)) {
        $requests = json_decode(file_get_contents($rateLimitFile), true) ?: [];
        $requests = array_filter($requests, function($timestamp) use ($now, $timeWindow) {
            return ($now - $timestamp) < $timeWindow;
        });
        
        if (count($requests) >= $maxRequests) {
            http_response_code(429);
            echo json_encode(['success' => false, 'error' => 'Rate limit exceeded']);
            exit;
        }
    } else {
        $requests = [];
    }
    
    $requests[] = $now;
    file_put_contents($rateLimitFile, json_encode($requests));
    
    if ($_POST['action'] === 'send_order_notification') {
        try {
            $chatId = $_POST['chat_id'] ?? '';
            $orderDataJson = $_POST['order_data'] ?? '';
            
            if (empty($chatId) || empty($orderDataJson)) {
                throw new Exception('Missing required parameters');
            }
            
            $orderData = json_decode($orderDataJson, true);
            if (!$orderData) {
                throw new Exception('Invalid order data JSON');
            }
            
            // Валидация обязательных полей
            $required = ['order_id', 'customer_name', 'phone', 'total'];
            foreach ($required as $field) {
                if (!isset($orderData[$field]) || empty($orderData[$field])) {
                    throw new Exception("Missing required field: $field");
                }
            }
            
            // Формирование сообщения
            $message = "🎉 <b>Новый заказ принят!</b>\n\n";
            $message .= "📋 <b>Заказ №:</b> {$orderData['order_id']}\n";
            $message .= "👤 <b>Клиент:</b> {$orderData['customer_name']}\n";
            $message .= "📞 <b>Телефон:</b> {$orderData['phone']}\n";
            
            // Информация о доставке
            if (isset($orderData['delivery_type'])) {
                $deliveryText = $orderData['delivery_type'] === 'delivery' ? '🚚 Доставка' : '🏪 Самовывоз';
                $message .= "🚚 <b>Тип:</b> {$deliveryText}\n";
                
                if ($orderData['delivery_type'] === 'delivery' && !empty($orderData['address'])) {
                    $message .= "📍 <b>Адрес:</b> {$orderData['address']}\n";
                }
            }
            
            // Способ оплаты
            if (isset($orderData['payment_method'])) {
                $paymentMethods = [
                    'cash' => '💵 Наличные',
                    'card' => '💳 Карта',
                    'kaspi' => '📱 Kaspi QR'
                ];
                $paymentText = $paymentMethods[$orderData['payment_method']] ?? $orderData['payment_method'];
                $message .= "💳 <b>Оплата:</b> {$paymentText}\n";
            }
            
            $message .= "💰 <b>Сумма:</b> {$orderData['total']}₸\n\n";
            
            // Состав заказа
            if (isset($orderData['items']) && is_array($orderData['items'])) {
                $message .= "📦 <b>Состав заказа:</b>\n";
                foreach ($orderData['items'] as $item) {
                    $name = $item['name'] ?? 'Неизвестный товар';
                    $quantity = $item['quantity'] ?? 1;
                    $price = $item['price'] ?? 0;
                    $message .= "• {$name} ×{$quantity} — {$price}₸\n";
                }
            }
            
            $message .= "\n⏰ <b>Время приготовления:</b> 15-20 минут\n";
            $message .= "📞 <b>Вопросы?</b> Звоните: +7 (777) 123-45-67\n\n";
            $message .= "☕ Спасибо за заказ!";
            
            // Отправка сообщения
            $result = sendMessage($chatId, $message);
            
            logMessage("Отправлено уведомление о заказе {$orderData['order_id']} в чат $chatId");
            
            if ($result['ok']) {
                echo json_encode([
                    'success' => true, 
                    'message' => 'Уведомление отправлено в Telegram',
                    'telegram_response' => $result
                ]);
            } else {
                throw new Exception('Telegram API error: ' . json_encode($result));
            }
            
        } catch (Exception $e) {
            logMessage("Ошибка отправки уведомления: " . $e->getMessage());
            http_response_code(400);
            echo json_encode([
                'success' => false, 
                'error' => $e->getMessage()
            ]);
        }
    }
    
    // Проверка статуса заказа
    elseif ($_POST['action'] === 'check_order_status') {
        $orderId = $_POST['order_id'] ?? '';
        $chatId = $_POST['chat_id'] ?? '';
        
        if ($orderId && $chatId) {
            $message = "📋 <b>Статус заказа №{$orderId}</b>\n\n";
            $message .= "⏳ <b>Текущий статус:</b> В обработке\n";
            $message .= "🕐 <b>Примерное время готовности:</b> 15-20 минут\n\n";
            $message .= "📞 Для уточнения звоните: +7 (777) 123-45-67";
            
            $result = sendMessage($chatId, $message);
            echo json_encode(['success' => $result['ok'], 'result' => $result]);
        } else {
            echo json_encode(['success' => false, 'error' => 'Missing parameters']);
        }
    }
    
    // Тестовое уведомление
    elseif ($_POST['action'] === 'send_test_notification') {
        try {
            $chatId = $_POST['chat_id'] ?? '';
            
            if (empty($chatId)) {
                throw new Exception('Chat ID не указан');
            }
            
            $message = "🧪 <b>Тестовое уведомление</b>\n\n";
            $message .= "✅ Бот работает корректно!\n";
            $message .= "🆔 <b>Ваш Chat ID:</b> <code>{$chatId}</code>\n";
            $message .= "🕐 <b>Время:</b> " . date('d.m.Y H:i:s') . "\n\n";
            $message .= "☕ Теперь вы можете получать уведомления о заказах!";
            
            $result = sendMessage($chatId, $message);
            
            if ($result['ok']) {
                echo json_encode([
                    'success' => true, 
                    'message' => 'Тестовое уведомление отправлено'
                ]);
            } else {
                throw new Exception('Ошибка Telegram API: ' . json_encode($result));
            }
            
        } catch (Exception $e) {
            logMessage("Ошибка тестового уведомления: " . $e->getMessage());
            echo json_encode([
                'success' => false, 
                'error' => $e->getMessage()
            ]);
        }
    }
    
    else {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Unknown action']);
    }
}

// Если это GET запрос, показываем информацию о боте или получаем updates
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (isset($_GET['action']) && $_GET['action'] === 'get_updates') {
        // Получение последних сообщений для поиска Chat ID
        try {
            $updatesUrl = $apiUrl . 'getUpdates?limit=10&offset=-10';
            $updatesResponse = file_get_contents($updatesUrl);
            $updatesData = json_decode($updatesResponse, true);
            
            if ($updatesData['ok']) {
                echo json_encode([
                    'success' => true,
                    'updates' => $updatesData['result']
                ]);
            } else {
                throw new Exception('Telegram API error');
            }
        } catch (Exception $e) {
            echo json_encode([
                'success' => false,
                'error' => 'Не удалось получить обновления: ' . $e->getMessage()
            ]);
        }
    } else {
        echo json_encode([
            'bot_name' => 'Coffee Shop Notification Bot',
            'status' => 'active',
            'version' => '1.0',
            'endpoints' => [
                'POST /telegram-bot.php' => 'Webhook для Telegram',
                'POST /telegram-bot.php?action=send_order_notification' => 'Отправка уведомления о заказе',
                'POST /telegram-bot.php?action=check_order_status' => 'Проверка статуса заказа',
                'POST /telegram-bot.php?action=send_test_notification' => 'Тестовое уведомление',
                'GET /telegram-bot.php?action=get_updates' => 'Получение последних сообщений'
            ]
        ]);
    }
}
?>