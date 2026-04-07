<?php

require_once __DIR__ . '/../helpers/JWT.php';
require_once __DIR__ . '/../helpers/Response.php';

class Auth {
    public static function authenticate() {
        $token = JWT::getBearerToken();
        
        if (!$token) {
            Response::unauthorized('Token not provided');
        }

        $decoded = JWT::decode($token);
        
        if (!$decoded) {
            Response::unauthorized('Invalid or expired token');
        }

        return $decoded;
    }

    public static function requireRole($allowedRoles) {
        $user = self::authenticate();

        if (!in_array($user['role'], $allowedRoles)) {
            Response::forbidden('Access denied');
        }

        return $user;
    }

    public static function requireAdmin() {
        return self::requireRole(['admin']);
    }

    public static function requireBaristaOrAdmin() {
        return self::requireRole(['admin', 'barista']);
    }
}
