<?php
// Подключаем обработчик ошибок
require_once __DIR__ . '/error_handler.php';

// Путь к файлу с заказами
define('ORDERS_FILE', __DIR__ . '/../database/orders.json');

// Admin Credentials
define('ADMIN_USERNAME', 'admin');
define('ADMIN_PASSWORD', password_hash('admin123', PASSWORD_DEFAULT));

// Session Configuration
ini_set('session.cookie_httponly', 1);
ini_set('session.use_only_cookies', 1);
ini_set('session.cookie_secure', 0);

session_start();

// CORS Headers
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Helper Functions
function isLoggedIn() {
    return isset($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] === true;
}

function requireAuth() {
    if (!isLoggedIn()) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized']);
        exit();
    }
}

function sendResponse($data, $code = 200) {
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit();
}

function sendError($message, $code = 400) {
    http_response_code($code);
    echo json_encode(['error' => $message], JSON_UNESCAPED_UNICODE);
    exit();
}

// Функции для работы с JSON
function readOrders() {
    if (!file_exists(ORDERS_FILE)) {
        return [];
    }
    $content = file_get_contents(ORDERS_FILE);
    return json_decode($content, true) ?: [];
}

function writeOrders($orders) {
    $dir = dirname(ORDERS_FILE);
    if (!is_dir($dir)) {
        mkdir($dir, 0777, true);
    }
    file_put_contents(ORDERS_FILE, json_encode($orders, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
}
