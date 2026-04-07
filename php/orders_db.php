<?php
require_once __DIR__ . '/db_config.php';
require_once __DIR__ . '/config.php';

// Получить все заказы
function getAllOrdersFromDB() {
    $pdo = getDBConnection();
    $stmt = $pdo->query("
        SELECT o.*, 
               GROUP_CONCAT(
                   CONCAT(oi.product_name, ' (', oi.size, 'мл) x', oi.quantity)
                   SEPARATOR ', '
               ) as items_summary
        FROM orders o
        LEFT JOIN order_items oi ON o.order_id = oi.order_id
        GROUP BY o.order_id
        ORDER BY o.order_date DESC
    ");
    return $stmt->fetchAll();
}

// Получить один заказ
function getOrderFromDB($orderId) {
    $pdo = getDBConnection();
    
    // Получить заказ
    $stmt = $pdo->prepare("SELECT * FROM orders WHERE order_id = ?");
    $stmt->execute([$orderId]);
    $order = $stmt->fetch();
    
    if (!$order) {
        return null;
    }
    
    // Получить товары заказа
    $stmt = $pdo->prepare("SELECT * FROM order_items WHERE order_id = ?");
    $stmt->execute([$orderId]);
    $order['items'] = $stmt->fetchAll();
    
    return $order;
}

// Создать заказ
function createOrderInDB($orderData) {
    $pdo = getDBConnection();
    
    try {
        $pdo->beginTransaction();
        
        // Генерация номера заказа
        $orderNumber = 'ORD' . date('YmdHis') . rand(100, 999);
        
        // Проверка/создание клиента
        $stmt = $pdo->prepare("SELECT customer_id FROM customers WHERE phone_number = ?");
        $stmt->execute([$orderData['phoneNumber']]);
        $customer = $stmt->fetch();
        
        if (!$customer) {
            $stmt = $pdo->prepare("
                INSERT INTO customers (phone_number, customer_name) 
                VALUES (?, ?)
            ");
            $stmt->execute([$orderData['phoneNumber'], $orderData['customerName']]);
            $customerId = $pdo->lastInsertId();
        } else {
            $customerId = $customer['customer_id'];
        }
        
        // Создание заказа
        $stmt = $pdo->prepare("
            INSERT INTO orders (
                order_number, customer_id, customer_name, phone_number,
                delivery_type, delivery_address, address_comment,
                payment_method, payment_status, items_total, delivery_fee, total_amount,
                order_status, notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        
        $stmt->execute([
            $orderNumber,
            $customerId,
            $orderData['customerName'],
            $orderData['phoneNumber'],
            $orderData['deliveryType'],
            $orderData['deliveryAddress'] ?? null,
            $orderData['addressComment'] ?? null,
            $orderData['paymentMethod'],
            'pending',
            $orderData['itemsTotal'],
            $orderData['deliveryFee'] ?? 0,
            $orderData['totalAmount'],
            'new',
            $orderData['notes'] ?? null
        ]);
        
        $orderId = $pdo->lastInsertId();
        
        // Добавление товаров
        if (isset($orderData['items']) && is_array($orderData['items'])) {
            $stmt = $pdo->prepare("
                INSERT INTO order_items (
                    order_id, product_name, product_type, size, options, 
                    comment, unit_price, quantity, total_price
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ");
            
            foreach ($orderData['items'] as $item) {
                $stmt->execute([
                    $orderId,
                    $item['name'],
                    $item['type'] ?? null,
                    $item['size'] ?? null,
                    isset($item['options']) ? json_encode($item['options']) : null,
                    $item['comment'] ?? null,
                    $item['price'],
                    $item['quantity'],
                    $item['price'] * $item['quantity']
                ]);
            }
        }
        
        // Обновление статистики клиента
        $stmt = $pdo->prepare("
            UPDATE customers 
            SET total_orders = total_orders + 1,
                total_spent = total_spent + ?,
                last_order_date = NOW()
            WHERE customer_id = ?
        ");
        $stmt->execute([$orderData['totalAmount'], $customerId]);
        
        // Добавление в историю статусов
        $stmt = $pdo->prepare("
            INSERT INTO order_status_history (order_id, new_status, changed_by)
            VALUES (?, 'new', 'system')
        ");
        $stmt->execute([$orderId]);
        
        $pdo->commit();
        
        return [
            'success' => true,
            'orderId' => $orderId,
            'orderNumber' => $orderNumber
        ];
        
    } catch (Exception $e) {
        $pdo->rollBack();
        throw $e;
    }
}

// Обновить статус заказа
function updateOrderStatusInDB($orderId, $newStatus, $comment = null) {
    $pdo = getDBConnection();
    
    try {
        $pdo->beginTransaction();
        
        // Получить текущий статус
        $stmt = $pdo->prepare("SELECT order_status FROM orders WHERE order_id = ?");
        $stmt->execute([$orderId]);
        $order = $stmt->fetch();
        
        if (!$order) {
            throw new Exception("Заказ не найден");
        }
        
        $oldStatus = $order['order_status'];
        
        // Обновить статус
        $stmt = $pdo->prepare("
            UPDATE orders 
            SET order_status = ?,
                completed_date = CASE WHEN ? = 'completed' THEN NOW() ELSE completed_date END
            WHERE order_id = ?
        ");
        $stmt->execute([$newStatus, $newStatus, $orderId]);
        
        // Добавить в историю
        $stmt = $pdo->prepare("
            INSERT INTO order_status_history (order_id, old_status, new_status, changed_by, comment)
            VALUES (?, ?, ?, 'admin', ?)
        ");
        $stmt->execute([$orderId, $oldStatus, $newStatus, $comment]);
        
        $pdo->commit();
        
        return ['success' => true];
        
    } catch (Exception $e) {
        $pdo->rollBack();
        throw $e;
    }
}

// Удалить заказ
function deleteOrderFromDB($orderId) {
    $pdo = getDBConnection();
    $stmt = $pdo->prepare("DELETE FROM orders WHERE order_id = ?");
    $stmt->execute([$orderId]);
    return ['success' => true];
}

// Получить статистику
function getStatsFromDB() {
    $pdo = getDBConnection();
    
    // Общая статистика
    $stmt = $pdo->query("
        SELECT 
            COUNT(*) as total_orders,
            SUM(CASE WHEN order_status = 'new' THEN 1 ELSE 0 END) as new_orders,
            SUM(CASE WHEN order_status = 'completed' THEN 1 ELSE 0 END) as completed_orders,
            SUM(CASE WHEN order_status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_orders,
            SUM(total_amount) as total_revenue,
            AVG(total_amount) as avg_order_value
        FROM orders
    ");
    $stats = $stmt->fetch();
    
    // Статистика за сегодня
    $stmt = $pdo->query("
        SELECT 
            COUNT(*) as today_orders,
            SUM(total_amount) as today_revenue
        FROM orders
        WHERE DATE(order_date) = CURDATE()
    ");
    $todayStats = $stmt->fetch();
    
    // Популярные товары
    $stmt = $pdo->query("
        SELECT product_name, SUM(quantity) as total_quantity
        FROM order_items
        GROUP BY product_name
        ORDER BY total_quantity DESC
        LIMIT 5
    ");
    $popularProducts = $stmt->fetchAll();
    
    return [
        'total' => $stats,
        'today' => $todayStats,
        'popular_products' => $popularProducts
    ];
}

// Получить все товары из меню
function getProductsFromDB() {
    $pdo = getDBConnection();
    $stmt = $pdo->query("
        SELECT * FROM products 
        WHERE is_available = 1 
        ORDER BY product_type, product_name
    ");
    return $stmt->fetchAll();
}
