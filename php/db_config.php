<?php
// Конфигурация подключения к MySQL (XAMPP)
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', ''); // По умолчанию в XAMPP пароль пустой
define('DB_NAME', 'taksofon_coffee');
define('DB_CHARSET', 'utf8mb4');

// Создание подключения
function getDBConnection() {
    try {
        $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
        $options = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ];
        
        $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        return $pdo;
    } catch (PDOException $e) {
        error_log("Database connection error: " . $e->getMessage());
        throw new Exception("Ошибка подключения к базе данных");
    }
}

// Проверка подключения
function testConnection() {
    try {
        $pdo = getDBConnection();
        return ['success' => true, 'message' => 'Подключение успешно'];
    } catch (Exception $e) {
        return ['success' => false, 'message' => $e->getMessage()];
    }
}
