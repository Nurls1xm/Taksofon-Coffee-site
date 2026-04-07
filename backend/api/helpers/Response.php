<?php

class Response {
    public static function json($data, $statusCode = 200) {
        http_response_code($statusCode);
        echo json_encode($data, JSON_UNESCAPED_UNICODE);
        exit();
    }

    public static function success($data = [], $message = 'Success') {
        self::json([
            'success' => true,
            'message' => $message,
            'data' => $data
        ], 200);
    }

    public static function error($message = 'Error', $statusCode = 400, $errors = []) {
        self::json([
            'success' => false,
            'message' => $message,
            'errors' => $errors
        ], $statusCode);
    }

    public static function unauthorized($message = 'Unauthorized') {
        self::error($message, 401);
    }

    public static function forbidden($message = 'Forbidden') {
        self::error($message, 403);
    }

    public static function notFound($message = 'Not found') {
        self::error($message, 404);
    }
}
