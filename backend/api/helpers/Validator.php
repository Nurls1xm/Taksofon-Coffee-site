<?php

class Validator {
    public static function email($email) {
        return filter_var($email, FILTER_VALIDATE_EMAIL);
    }

    public static function required($value) {
        return !empty(trim($value));
    }

    public static function minLength($value, $min) {
        return strlen($value) >= $min;
    }

    public static function maxLength($value, $max) {
        return strlen($value) <= $max;
    }

    public static function numeric($value) {
        return is_numeric($value);
    }

    public static function positive($value) {
        return is_numeric($value) && $value > 0;
    }

    public static function validateRegistration($data) {
        $errors = [];

        if (!self::required($data['name'] ?? '')) {
            $errors['name'] = 'Name is required';
        }

        if (!self::required($data['email'] ?? '')) {
            $errors['email'] = 'Email is required';
        } elseif (!self::email($data['email'])) {
            $errors['email'] = 'Invalid email format';
        }

        if (!self::required($data['password'] ?? '')) {
            $errors['password'] = 'Password is required';
        } elseif (!self::minLength($data['password'], 6)) {
            $errors['password'] = 'Password must be at least 6 characters';
        }

        return $errors;
    }

    public static function validateLogin($data) {
        $errors = [];

        if (!self::required($data['email'] ?? '')) {
            $errors['email'] = 'Email is required';
        }

        if (!self::required($data['password'] ?? '')) {
            $errors['password'] = 'Password is required';
        }

        return $errors;
    }

    public static function validateDrink($data) {
        $errors = [];

        if (!self::required($data['name'] ?? '')) {
            $errors['name'] = 'Name is required';
        }

        if (!self::positive($data['price'] ?? 0)) {
            $errors['price'] = 'Price must be positive';
        }

        if (!self::required($data['category'] ?? '')) {
            $errors['category'] = 'Category is required';
        }

        return $errors;
    }
}
