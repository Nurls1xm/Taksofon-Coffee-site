<?php
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

// Login
if ($method === 'POST' && $action === 'login') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    $username = trim($input['username'] ?? '');
    $password = $input['password'] ?? '';
    
    // Rate limiting - простая защита от брутфорса
    $loginAttempts = $_SESSION['login_attempts'] ?? 0;
    $lastAttempt = $_SESSION['last_login_attempt'] ?? 0;
    
    if ($loginAttempts >= 5 && (time() - $lastAttempt) < 300) {
        sendError('Слишком много попыток входа. Попробуйте через 5 минут', 429);
    }
    
    if (empty($username) || empty($password)) {
        sendError('Логин и пароль обязательны', 400);
    }
    
    if ($username === ADMIN_USERNAME && password_verify($password, ADMIN_PASSWORD)) {
        // Успешный вход - сбросить счетчик
        unset($_SESSION['login_attempts']);
        unset($_SESSION['last_login_attempt']);
        
        // Регенерация ID сессии для безопасности
        session_regenerate_id(true);
        
        $_SESSION['admin_logged_in'] = true;
        $_SESSION['admin_username'] = $username;
        $_SESSION['login_time'] = time();
        
        sendResponse([
            'success' => true,
            'message' => 'Успешный вход',
            'user' => ['username' => $username]
        ]);
    } else {
        // Неудачная попытка
        $_SESSION['login_attempts'] = $loginAttempts + 1;
        $_SESSION['last_login_attempt'] = time();
        
        sendError('Неверное имя пользователя или пароль', 401);
    }
}

// Logout
if ($method === 'POST' && $action === 'logout') {
    session_destroy();
    sendResponse(['success' => true, 'message' => 'Выход выполнен']);
}

// Check Auth Status
if ($method === 'GET' && $action === 'check') {
    if (isLoggedIn()) {
        sendResponse([
            'authenticated' => true,
            'user' => ['username' => $_SESSION['admin_username']]
        ]);
    } else {
        sendResponse(['authenticated' => false]);
    }
}

sendError('Invalid request', 400);
