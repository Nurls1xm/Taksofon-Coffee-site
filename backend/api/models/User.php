<?php

class User {
    private $conn;
    private $table = 'users';

    public function __construct($db) {
        $this->conn = $db;
    }

    public function create($data) {
        $query = "INSERT INTO " . $this->table . " 
                  (name, email, password, role) 
                  VALUES (:name, :email, :password, :role)";

        $stmt = $this->conn->prepare($query);

        $hashedPassword = password_hash($data['password'], PASSWORD_DEFAULT);
        $role = $data['role'] ?? 'user';

        $stmt->bindParam(':name', $data['name']);
        $stmt->bindParam(':email', $data['email']);
        $stmt->bindParam(':password', $hashedPassword);
        $stmt->bindParam(':role', $role);

        if ($stmt->execute()) {
            return $this->conn->lastInsertId();
        }

        return false;
    }

    public function findByEmail($email) {
        $query = "SELECT * FROM " . $this->table . " WHERE email = :email LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':email', $email);
        $stmt->execute();

        return $stmt->fetch();
    }

    public function findById($id) {
        $query = "SELECT id, name, email, role, created_at FROM " . $this->table . " WHERE id = :id LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id);
        $stmt->execute();

        return $stmt->fetch();
    }

    public function getAll() {
        $query = "SELECT id, name, email, role, created_at FROM " . $this->table . " ORDER BY created_at DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();

        return $stmt->fetchAll();
    }

    public function updateRole($userId, $role) {
        $query = "UPDATE " . $this->table . " SET role = :role WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':role', $role);
        $stmt->bindParam(':id', $userId);

        return $stmt->execute();
    }

    public function verifyPassword($password, $hash) {
        return password_verify($password, $hash);
    }
}
