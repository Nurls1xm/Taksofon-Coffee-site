<?php
/**
 * Централизованная обработка ошибок
 */

// Настройка обработки ошибок
error_reporting(E_ALL);
ini_set('display_errors', 0); // Не показывать ошибки пользователям
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/../logs/php_errors.log');

// Создать папку для логов если не существует
$logDir = __DIR__ . '/../logs';
if (!file_exists($logDir)) {
    mkdir($logDir, 0755, true);
}

// Кастомный обработчик ошибок
set_error_handler(function($errno, $errstr, $errfile, $errline) {
    $errorTypes = [
        E_ERROR => 'ERROR',
        E_WARNING => 'WARNING',
        E_PARSE => 'PARSE',
        E_NOTICE => 'NOTICE',
        E_CORE_ERROR => 'CORE_ERROR',
        E_CORE_WARNING => 'CORE_WARNING',
        E_COMPILE_ERROR => 'COMPILE_ERROR',
        E_COMPILE_WARNING => 'COMPILE_WARNING',
        E_USER_ERROR => 'USER_ERROR',
        E_USER_WARNING => 'USER_WARNING',
        E_USER_NOTICE => 'USER_NOTICE',
        E_STRICT => 'STRICT',
        E_RECOVERABLE_ERROR => 'RECOVERABLE_ERROR',
        E_DEPRECATED => 'DEPRECATED',
        E_USER_DEPRECATED => 'USER_DEPRECATED',
    ];
    
    $type = $errorTypes[$errno] ?? 'UNKNOWN';
    $message = sprintf(
        "[%s] %s: %s in %s on line %d",
        date('Y-m-d H:i:s'),
        $type,
        $errstr,
        $errfile,
        $errline
    );
    
    error_log($message);
    
    // Для критических ошибок - отправить JSON ответ
    if (in_array($errno, [E_ERROR, E_CORE_ERROR, E_COMPILE_ERROR, E_USER_ERROR])) {
        http_response_code(500);
        header('Content-Type: application/json');
        echo json_encode([
            'error' => 'Internal server error',
            'message' => 'Произошла ошибка. Пожалуйста, попробуйте позже.'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }
    
    return true;
});

// Обработчик исключений
set_exception_handler(function($exception) {
    $message = sprintf(
        "[%s] EXCEPTION: %s in %s on line %d\nStack trace:\n%s",
        date('Y-m-d H:i:s'),
        $exception->getMessage(),
        $exception->getFile(),
        $exception->getLine(),
        $exception->getTraceAsString()
    );
    
    error_log($message);
    
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode([
        'error' => 'Internal server error',
        'message' => 'Произошла ошибка. Пожалуйста, попробуйте позже.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
});

// Обработчик фатальных ошибок
register_shutdown_function(function() {
    $error = error_get_last();
    if ($error !== null && in_array($error['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR])) {
        $message = sprintf(
            "[%s] FATAL: %s in %s on line %d",
            date('Y-m-d H:i:s'),
            $error['message'],
            $error['file'],
            $error['line']
        );
        
        error_log($message);
        
        if (!headers_sent()) {
            http_response_code(500);
            header('Content-Type: application/json');
            echo json_encode([
                'error' => 'Internal server error',
                'message' => 'Произошла критическая ошибка.'
            ], JSON_UNESCAPED_UNICODE);
        }
    }
});

/**
 * Логирование действий администратора
 */
function logAdminAction($action, $details = []) {
    $logFile = __DIR__ . '/../logs/admin_actions.log';
    $entry = sprintf(
        "[%s] User: %s | Action: %s | IP: %s | Details: %s\n",
        date('Y-m-d H:i:s'),
        $_SESSION['admin_username'] ?? 'unknown',
        $action,
        $_SERVER['REMOTE_ADDR'] ?? 'unknown',
        json_encode($details, JSON_UNESCAPED_UNICODE)
    );
    
    file_put_contents($logFile, $entry, FILE_APPEND);
}

/**
 * Логирование подозрительной активности
 */
function logSuspiciousActivity($type, $details = []) {
    $logFile = __DIR__ . '/../logs/suspicious.log';
    $entry = sprintf(
        "[%s] Type: %s | IP: %s | User-Agent: %s | Details: %s\n",
        date('Y-m-d H:i:s'),
        $type,
        $_SERVER['REMOTE_ADDR'] ?? 'unknown',
        $_SERVER['HTTP_USER_AGENT'] ?? 'unknown',
        json_encode($details, JSON_UNESCAPED_UNICODE)
    );
    
    file_put_contents($logFile, $entry, FILE_APPEND);
}

