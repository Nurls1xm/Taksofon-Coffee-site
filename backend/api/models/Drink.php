<?php

class Drink {
    private $conn;
    private $table = 'drinks';

    public function __construct($db) {
        $this->conn = $db;
    }

    public function create($data) {
        $query = "INSERT INTO " . $this->table . " 
                  (name, description, price, category, image_url) 
                  VALUES (:name, :description, :price, :category, :image_url)";

        $stmt = $this->conn->prepare($query);

        $stmt->bindParam(':name', $data['name']);
        $stmt->bindParam(':description', $data['description']);
        $stmt->bindParam(':price', $data['price']);
        $stmt->bindParam(':category', $data['category']);
        $stmt->bindParam(':image_url', $data['image_url']);

        if ($stmt->execute()) {
            return $this->conn->lastInsertId();
        }

        return false;
    }

    public function getAll($category = null) {
        $query = "SELECT * FROM " . $this->table;
        
        if ($category) {
            $query .= " WHERE category = :category";
        }
        
        $query .= " ORDER BY id DESC";

        $stmt = $this->conn->prepare($query);
        
        if ($category) {
            $stmt->bindParam(':category', $category);
        }
        
        $stmt->execute();

        return $stmt->fetchAll();
    }

    public function getById($id) {
        $query = "SELECT * FROM " . $this->table . " WHERE id = :id LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id);
        $stmt->execute();

        return $stmt->fetch();
    }

    public function update($id, $data) {
        $query = "UPDATE " . $this->table . " 
                  SET name = :name, 
                      description = :description, 
                      price = :price, 
                      category = :category, 
                      image_url = :image_url 
                  WHERE id = :id";

        $stmt = $this->conn->prepare($query);

        $stmt->bindParam(':id', $id);
        $stmt->bindParam(':name', $data['name']);
        $stmt->bindParam(':description', $data['description']);
        $stmt->bindParam(':price', $data['price']);
        $stmt->bindParam(':category', $data['category']);
        $stmt->bindParam(':image_url', $data['image_url']);

        return $stmt->execute();
    }

    public function delete($id) {
        $query = "DELETE FROM " . $this->table . " WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id);

        return $stmt->execute();
    }

    public function getPopular($limit = 5) {
        $query = "SELECT d.*, COUNT(oi.drink_id) as order_count 
                  FROM " . $this->table . " d
                  LEFT JOIN order_items oi ON d.id = oi.drink_id
                  GROUP BY d.id
                  ORDER BY order_count DESC
                  LIMIT :limit";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->fetchAll();
    }
}
