<?php
// email-sender.php - Отправка Email уведомлений
header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Простой класс для отправки email без внешних зависимостей
class SimpleEmailSender {
    private $smtpHost;
    private $smtpPort;
    private $smtpUsername;
    private $smtpPassword;
    private $fromEmail;
    private $fromName;
    
    public function __construct($config = []) {
        // Настройки по умолчанию (замените на ваши)
        $this->smtpHost = $config['smtp_host'] ?? 'smtp.gmail.com';
        $this->smtpPort = $config['smtp_port'] ?? 587;
        $this->smtpUsername = $config['smtp_username'] ?? 'your-email@gmail.com';
        $this->smtpPassword = $config['smtp_password'] ?? 'your-app-password';
        $this->fromEmail = $config['from_email'] ?? 'your-email@gmail.com';
        $this->fromName = $config['from_name'] ?? 'Coffee Shop';
    }
    
    public function sendOrderNotification($customerEmail, $orderData) {
        try {
            // Валидация email
            if (!filter_var($customerEmail, FILTER_VALIDATE_EMAIL)) {
                throw new Exception('Invalid email address');
            }
            
            // Валидация данных заказа
            $this->validateOrderData($orderData);
            
            // Генерация HTML письма
            $subject = "Заказ №{$orderData['order_id']} принят - Coffee Shop";
            $htmlBody = $this->generateOrderEmailTemplate($orderData);
            $textBody = $this->generateTextVersion($orderData);
            
            // Отправка письма
            $result = $this->sendEmail($customerEmail, $subject, $htmlBody, $textBody);
            
            $this->logMessage("Email отправлен на $customerEmail для заказа {$orderData['order_id']}");
            
            return [
                'success' => true, 
                'message' => 'Email успешно отправлен',
                'email' => $customerEmail
            ];
            
        } catch (Exception $e) {
            $this->logMessage("Ошибка отправки email: " . $e->getMessage());
            return [
                'success' => false, 
                'error' => $e->getMessage()
            ];
        }
    }
    
    private function sendEmail($to, $subject, $htmlBody, $textBody = '') {
        // Заголовки письма
        $headers = [
            'MIME-Version: 1.0',
            'Content-Type: multipart/alternative; boundary="boundary-' . uniqid() . '"',
            'From: ' . $this->fromName . ' <' . $this->fromEmail . '>',
            'Reply-To: ' . $this->fromEmail,
            'X-Mailer: PHP/' . phpversion(),
            'X-Priority: 3',
            'Date: ' . date('r')
        ];
        
        $boundary = 'boundary-' . uniqid();
        
        // Тело письма с поддержкой HTML и текста
        $body = "--$boundary\r\n";
        $body .= "Content-Type: text/plain; charset=UTF-8\r\n";
        $body .= "Content-Transfer-Encoding: 8bit\r\n\r\n";
        $body .= $textBody ?: strip_tags($htmlBody);
        $body .= "\r\n\r\n--$boundary\r\n";
        $body .= "Content-Type: text/html; charset=UTF-8\r\n";
        $body .= "Content-Transfer-Encoding: 8bit\r\n\r\n";
        $body .= $htmlBody;
        $body .= "\r\n\r\n--$boundary--";
        
        // Отправка через встроенную функцию mail()
        $success = mail($to, $subject, $body, implode("\r\n", $headers));
        
        if (!$success) {
            throw new Exception('Failed to send email via mail() function');
        }
        
        return true;
    }
    
    private function validateOrderData($data) {
        $required = ['order_id', 'customer_name', 'phone', 'total'];
        
        foreach ($required as $field) {
            if (!isset($data[$field]) || empty($data[$field])) {
                throw new Exception("Missing required field: $field");
            }
        }
        
        if (!is_numeric($data['total']) || $data['total'] <= 0) {
            throw new Exception("Invalid total amount");
        }
        
        return true;
    }
    
    private function generateOrderEmailTemplate($orderData) {
        $orderId = htmlspecialchars($orderData['order_id']);
        $customerName = htmlspecialchars($orderData['customer_name']);
        $phone = htmlspecialchars($orderData['phone']);
        $total = htmlspecialchars($orderData['total']);
        
        $deliveryInfo = '';
        if (isset($orderData['delivery_type'])) {
            $deliveryType = $orderData['delivery_type'] === 'delivery' ? 'Доставка' : 'Самовывоз';
            $deliveryInfo .= "<p><strong>Тип получения:</strong> $deliveryType</p>";
            
            if ($orderData['delivery_type'] === 'delivery' && !empty($orderData['address'])) {
                $address = htmlspecialchars($orderData['address']);
                $deliveryInfo .= "<p><strong>Адрес доставки:</strong> $address</p>";
            }
        }
        
        $paymentInfo = '';
        if (isset($orderData['payment_method'])) {
            $paymentMethods = [
                'cash' => 'Наличные',
                'card' => 'Банковская карта',
                'kaspi' => 'Kaspi QR'
            ];
            $paymentMethod = $paymentMethods[$orderData['payment_method']] ?? $orderData['payment_method'];
            $paymentInfo = "<p><strong>Способ оплаты:</strong> $paymentMethod</p>";
        }
        
        $itemsList = '';
        if (isset($orderData['items']) && is_array($orderData['items'])) {
            foreach ($orderData['items'] as $item) {
                $name = htmlspecialchars($item['name'] ?? 'Неизвестный товар');
                $quantity = intval($item['quantity'] ?? 1);
                $price = htmlspecialchars($item['price'] ?? 0);
                $itemsList .= "<div class=\"item\">
                    <strong>$name</strong> ×$quantity 
                    <span style=\"float: right;\">$price ₸</span>
                </div>";
            }
        }
        
        $html = '<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Заказ принят - Coffee Shop</title>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            margin: 0; 
            padding: 0; 
            background-color: #f5f5f5;
        }
        .container { 
            max-width: 600px; 
            margin: 20px auto; 
            background: white;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .header { 
            background: linear-gradient(135deg, #8B6F47 0%, #6d5638 100%); 
            color: white; 
            padding: 30px 20px; 
            text-align: center; 
        }
        .header h1 {
            margin: 0 0 10px 0;
            font-size: 28px;
            font-weight: 300;
        }
        .header h2 {
            margin: 0;
            font-size: 18px;
            font-weight: 400;
            opacity: 0.9;
        }
        .content { 
            padding: 30px 20px; 
        }
        .order-details { 
            background: #f9f9f9; 
            padding: 20px; 
            margin: 20px 0; 
            border-radius: 8px;
            border-left: 4px solid #8B6F47;
        }
        .order-details h3 {
            margin-top: 0;
            color: #8B6F47;
            font-size: 18px;
        }
        .order-details p {
            margin: 8px 0;
        }
        .item { 
            padding: 12px 0; 
            border-bottom: 1px solid #eee; 
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .item:last-child {
            border-bottom: none;
        }
        .total { 
            font-weight: bold; 
            font-size: 20px; 
            color: #8B6F47; 
            text-align: center;
            padding: 15px;
            background: #f0f8ff;
            border-radius: 5px;
            margin: 15px 0;
        }
        .info-box {
            background: #e8f4fd;
            border: 1px solid #bee5eb;
            border-radius: 5px;
            padding: 15px;
            margin: 20px 0;
        }
        .footer { 
            text-align: center; 
            padding: 20px; 
            background: #f8f9fa;
            color: #666; 
            border-top: 1px solid #eee;
        }
        .footer p {
            margin: 5px 0;
        }
        .contact-info {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 5px;
            padding: 15px;
            margin: 20px 0;
            text-align: center;
        }
        @media (max-width: 600px) {
            .container {
                margin: 10px;
                border-radius: 5px;
            }
            .content {
                padding: 20px 15px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>☕ Coffee Shop</h1>
            <h2>Ваш заказ успешно принят!</h2>
        </div>
        
        <div class="content">
            <div class="order-details">
                <h3>📋 Информация о заказе</h3>
                <p><strong>Номер заказа:</strong> ' . $orderId . '</p>
                <p><strong>Имя клиента:</strong> ' . $customerName . '</p>
                <p><strong>Телефон:</strong> ' . $phone . '</p>
                ' . $deliveryInfo . '
                ' . $paymentInfo . '
            </div>
            
            <div class="order-details">
                <h3>📦 Состав заказа</h3>
                ' . $itemsList . '
                <div class="total">
                    Итого к оплате: ' . $total . ' ₸
                </div>
            </div>
            
            <div class="info-box">
                <p><strong>⏰ Время приготовления:</strong> 15-20 минут</p>
                <p><strong>📍 Адрес кофейни:</strong> г. Астана, ул. Примерная, 123</p>
            </div>
            
            <div class="contact-info">
                <p><strong>📞 Есть вопросы?</strong></p>
                <p>Звоните: <strong>+7 (777) 123-45-67</strong></p>
                <p>Пишите: <strong>info@coffeeshop.kz</strong></p>
            </div>
        </div>
        
        <div class="footer">
            <p><strong>Спасибо за ваш заказ! ☕</strong></p>
            <p>Coffee Shop - лучший кофе в городе</p>
            <p style="font-size: 12px; color: #999;">
                Это автоматическое сообщение. Пожалуйста, не отвечайте на него.
            </p>
        </div>
    </div>
</body>
</html>';
        
        return $html;
    }
    
    private function generateTextVersion($orderData) {
        $text = "COFFEE SHOP - Заказ принят!\n\n";
        $text .= "Заказ №: {$orderData['order_id']}\n";
        $text .= "Клиент: {$orderData['customer_name']}\n";
        $text .= "Телефон: {$orderData['phone']}\n";
        
        if (isset($orderData['delivery_type'])) {
            $deliveryType = $orderData['delivery_type'] === 'delivery' ? 'Доставка' : 'Самовывоз';
            $text .= "Тип: $deliveryType\n";
            
            if ($orderData['delivery_type'] === 'delivery' && !empty($orderData['address'])) {
                $text .= "Адрес: {$orderData['address']}\n";
            }
        }
        
        if (isset($orderData['payment_method'])) {
            $paymentMethods = [
                'cash' => 'Наличные',
                'card' => 'Банковская карта',
                'kaspi' => 'Kaspi QR'
            ];
            $paymentMethod = $paymentMethods[$orderData['payment_method']] ?? $orderData['payment_method'];
            $text .= "Оплата: $paymentMethod\n";
        }
        
        $text .= "Сумма: {$orderData['total']} ₸\n\n";
        
        $text .= "СОСТАВ ЗАКАЗА:\n";
        if (isset($orderData['items']) && is_array($orderData['items'])) {
            foreach ($orderData['items'] as $item) {
                $name = $item['name'] ?? 'Неизвестный товар';
                $quantity = $item['quantity'] ?? 1;
                $price = $item['price'] ?? 0;
                $text .= "• $name x$quantity - $price ₸\n";
            }
        }
        
        $text .= "\nВремя приготовления: 15-20 минут\n";
        $text .= "Вопросы? Звоните: +7 (777) 123-45-67\n\n";
        $text .= "Спасибо за заказ!\nCoffee Shop";
        
        return $text;
    }
    
    private function logMessage($message) {
        $logFile = '../logs/email-sender.log';
        $timestamp = date('Y-m-d H:i:s');
        
        // Создаем директорию logs если её нет
        $logDir = dirname($logFile);
        if (!is_dir($logDir)) {
            mkdir($logDir, 0755, true);
        }
        
        file_put_contents($logFile, "[$timestamp] $message\n", FILE_APPEND | LOCK_EX);
    }
}

// Обработка POST запросов
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action'])) {
    
    // Rate limiting
    $clientIP = $_SERVER['REMOTE_ADDR'];
    $rateLimitFile = "../logs/email_rate_limit_$clientIP.txt";
    $now = time();
    $maxRequests = 5; // максимум 5 писем в час
    $timeWindow = 3600;
    
    if (file_exists($rateLimitFile)) {
        $requests = json_decode(file_get_contents($rateLimitFile), true) ?: [];
        $requests = array_filter($requests, function($timestamp) use ($now, $timeWindow) {
            return ($now - $timestamp) < $timeWindow;
        });
        
        if (count($requests) >= $maxRequests) {
            http_response_code(429);
            echo json_encode(['success' => false, 'error' => 'Email rate limit exceeded']);
            exit;
        }
    } else {
        $requests = [];
    }
    
    $requests[] = $now;
    file_put_contents($rateLimitFile, json_encode($requests));
    
    if ($_POST['action'] === 'send_email_notification') {
        try {
            $customerEmail = $_POST['customer_email'] ?? '';
            $orderDataJson = $_POST['order_data'] ?? '';
            
            if (empty($customerEmail) || empty($orderDataJson)) {
                throw new Exception('Missing required parameters');
            }
            
            $orderData = json_decode($orderDataJson, true);
            if (!$orderData) {
                throw new Exception('Invalid order data JSON');
            }
            
            // Конфигурация email (замените на ваши настройки)
            $emailConfig = [
                'smtp_host' => 'smtp.gmail.com',
                'smtp_port' => 587,
                'smtp_username' => 'your-email@gmail.com', // Замените
                'smtp_password' => 'your-app-password',    // Замените
                'from_email' => 'your-email@gmail.com',    // Замените
                'from_name' => 'Coffee Shop'
            ];
            
            $emailSender = new SimpleEmailSender($emailConfig);
            $result = $emailSender->sendOrderNotification($customerEmail, $orderData);
            
            echo json_encode($result);
            
        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode([
                'success' => false, 
                'error' => $e->getMessage()
            ]);
        }
    }
    
    elseif ($_POST['action'] === 'test_email') {
        // Тестовая отправка
        $testEmail = $_POST['test_email'] ?? '';
        
        if (empty($testEmail)) {
            echo json_encode(['success' => false, 'error' => 'Test email required']);
            exit;
        }
        
        $testOrderData = [
            'order_id' => 'TEST' . time(),
            'customer_name' => 'Тестовый Пользователь',
            'phone' => '+7 777 123 45 67',
            'delivery_type' => 'delivery',
            'address' => 'г. Астана, ул. Тестовая, 123',
            'payment_method' => 'card',
            'total' => 1500,
            'items' => [
                ['name' => 'Латте', 'quantity' => 1, 'price' => 800],
                ['name' => 'Капучино', 'quantity' => 1, 'price' => 700]
            ]
        ];
        
        $emailConfig = [
            'from_email' => 'test@coffeeshop.kz',
            'from_name' => 'Coffee Shop Test'
        ];
        
        $emailSender = new SimpleEmailSender($emailConfig);
        $result = $emailSender->sendOrderNotification($testEmail, $testOrderData);
        
        echo json_encode($result);
    }
    
    else {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Unknown action']);
    }
}

// GET запрос - информация о сервисе
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    echo json_encode([
        'service' => 'Email Notification Sender',
        'status' => 'active',
        'version' => '1.0',
        'endpoints' => [
            'POST /email-sender.php?action=send_email_notification' => 'Отправка уведомления о заказе',
            'POST /email-sender.php?action=test_email' => 'Тестовая отправка'
        ],
        'requirements' => [
            'PHP mail() function enabled',
            'Valid SMTP configuration'
        ]
    ]);
}
?>