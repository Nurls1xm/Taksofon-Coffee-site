<?php
// telegram-username.php - Отправка уведомлений по Telegram username
header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Конфигурация
$botToken = '8221760018:AAHyvzvkLqiMj_by0VdpBlec7Qi5GDAWMhU';
$apiUrl = "https://api.telegram.org/bot{$botToken}/";

// Функция отправки сообщения по username
function sendMessageByUsername($username, $message, $parseMode = 'HTML') {
    global $apiUrl;
    
    // Убираем @ если есть
    $username = ltrim($username, '@');
    
    $data = [
        'chat_id' => '@' . $username,
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
    $logFile = '../logs/telegram-username.log';
    $timestamp = date('Y-m-d H:i:s');
    
    // Создаем директорию logs если её нет
    $logDir = dirname($logFile);
    if (!is_dir($logDir)) {
        mkdir($logDir, 0755, true);
    }
    
    file_put_contents($logFile, "[$timestamp] $message\n", FILE_APPEND | LOCK_EX);
}

// Обработка POST запросов
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action'])) {
    
    // Rate limiting
    $clientIP = $_SERVER['REMOTE_ADDR'];
    $rateLimitFile = "../logs/telegram_rate_limit_$clientIP.txt";
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
    
    if ($_POST['action'] === 'send_order_notification_by_username') {
        try {
            $username = $_POST['username'] ?? '';
            $orderDataJson = $_POST['order_data'] ?? '';
            
            if (empty($username) || empty($orderDataJson)) {
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
            $message = "🎉 <b>Здравствуйте! У вас новый заказ в Coffee Shop!</b>\n\n";
            $message .= "📋 <b>Заказ №:</b> {$orderData['order_id']}\n";
            $message .= "👤 <b>Имя:</b> {$orderData['customer_name']}\n";
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
            $message .= "☕ Спасибо за заказ! Мы свяжемся с вами, когда заказ будет готов.";
            
            // Отправка сообщения
            $result = sendMessageByUsername($username, $message);
            
            logMessage("Отправлено уведомление о заказе {$orderData['order_id']} пользователю @$username");
            
            if ($result['ok']) {
                echo json_encode([
                    'success' => true, 
                    'message' => 'Уведомление отправлено в Telegram',
                    'telegram_response' => $result,
                    'username' => $username
                ]);
            } else {
                // Обработка специфичных ошибок Telegram
                $errorDescription = $result['description'] ?? 'Unknown error';
                
                if (strpos($errorDescription, 'chat not found') !== false) {
                    throw new Exception("Пользователь @$username не найден. Возможно, username неверный или пользователь не начал диалог с ботом.");
                } elseif (strpos($errorDescription, 'Forbidden') !== false) {
                    throw new Exception("Не удается отправить сообщение пользователю @$username. Пользователь должен сначала написать боту или добавить его в контакты.");
                } else {
                    throw new Exception("Telegram API error: $errorDescription");
                }
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
    
    // Тестовая отправка
    elseif ($_POST['action'] === 'test_username_notification') {
        $username = $_POST['username'] ?? '';
        
        if (empty($username)) {
            echo json_encode(['success' => false, 'error' => 'Username required']);
            exit;
        }
        
        $testMessage = "🧪 <b>Тестовое сообщение от Coffee Shop!</b>\n\n";
        $testMessage .= "👋 Привет! Это тестовое уведомление.\n\n";
        $testMessage .= "Если вы получили это сообщение, значит уведомления работают правильно!\n\n";
        $testMessage .= "☕ Coffee Shop";
        
        try {
            $result = sendMessageByUsername($username, $testMessage);
            
            if ($result['ok']) {
                echo json_encode([
                    'success' => true,
                    'message' => "Тестовое сообщение отправлено пользователю @$username",
                    'username' => $username
                ]);
            } else {
                $errorDescription = $result['description'] ?? 'Unknown error';
                
                if (strpos($errorDescription, 'chat not found') !== false) {
                    throw new Exception("Пользователь @$username не найден. Проверьте правильность username.");
                } elseif (strpos($errorDescription, 'Forbidden') !== false) {
                    throw new Exception("Не удается отправить сообщение пользователю @$username. Пользователь должен сначала написать боту.");
                } else {
                    throw new Exception("Telegram API error: $errorDescription");
                }
            }
        } catch (Exception $e) {
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

// GET запрос - информация о сервисе
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    echo json_encode([
        'service' => 'Telegram Username Notification Sender',
        'status' => 'active',
        'version' => '1.0',
        'bot' => '@taksofon_coffee_bot',
        'endpoints' => [
            'POST ?action=send_order_notification_by_username' => 'Отправка уведомления о заказе по username',
            'POST ?action=test_username_notification' => 'Тестовая отправка по username'
        ],
        'note' => 'Пользователь должен сначала написать боту или добавить его в контакты для получения сообщений'
    ]);
}
?>