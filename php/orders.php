<?php
require_once 'config.php';

// Для админки требуется авторизация
if (isset($_GET['action']) && in_array($_GET['action'], ['list', 'stats', 'delete'])) {
    requireAuth();
}

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

try {
    // Создать новый заказ (публичный)
    if ($method === 'POST' && $action === 'create') {
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input) {
            sendError('Неверные данные');
        }
        
        $orderId = time() . rand(1000, 9999);
        $order = [
            'id' => $orderId,
            'customerName' => $input['customerName'] ?? '',
            'phoneNumber' => $input['phoneNumber'] ?? '',
            'deliveryOption' => $input['deliveryOption'] ?? 'pickup',
            'address' => $input['address'] ?? '',
            'paymentMethod' => $input['paymentMethod'] ?? 'cash',
            'totalAmount' => $input['totalAmount'] ?? 0,
            'comment' => $input['comment'] ?? '',
            'items' => $input['items'] ?? [],
            'status' => 'Новый',
            'createdAt' => time(),
            'updatedAt' => time()
        ];
        
        $orders = readOrders();
        $orders[$orderId] = $order;
        writeOrders($orders);
        
        sendResponse(['success' => true, 'orderId' => $orderId, 'message' => 'Заказ создан']);
    }
    
    // Получить все заказы (админ)
    if ($method === 'GET' && $action === 'list') {
        $orders = readOrders();
        $ordersList = array_values($orders);
        
        usort($ordersList, function($a, $b) {
            return ($b['createdAt'] ?? 0) - ($a['createdAt'] ?? 0);
        });
        
        sendResponse(['success' => true, 'data' => $ordersList]);
    }
    
    // Получить один заказ
    if ($method === 'GET' && $action === 'get') {
        $id = $_GET['id'] ?? '';
        if (empty($id)) sendError('ID обязателен');
        
        $orders = readOrders();
        $order = $orders[$id] ?? null;
        
        if (!$order) {
            sendError('Заказ не найден', 404);
        }
        
        sendResponse(['success' => true, 'data' => $order]);
    }
    
    // Обновить статус заказа (админ)
    if ($method === 'PUT' && $action === 'status') {
        $id = $_GET['id'] ?? '';
        if (empty($id)) sendError('ID обязателен');
        
        $input = json_decode(file_get_contents('php://input'), true);
        $status = $input['status'] ?? '';
        
        $allowedStatuses = ['Новый', 'Готовится', 'Готов', 'Выдан', 'Отменен'];
        if (!in_array($status, $allowedStatuses)) {
            sendError('Недопустимый статус');
        }
        
        $orders = readOrders();
        if (!isset($orders[$id])) {
            sendError('Заказ не найден', 404);
        }
        
        $orders[$id]['status'] = $status;
        $orders[$id]['updatedAt'] = time();
        writeOrders($orders);
        
        sendResponse(['success' => true, 'message' => 'Статус обновлен']);
    }
    
    // Удалить заказ (админ)
    if ($method === 'DELETE' && $action === 'delete') {
        $id = $_GET['id'] ?? '';
        if (empty($id)) sendError('ID обязателен');
        
        $orders = readOrders();
        if (!isset($orders[$id])) {
            sendError('Заказ не найден', 404);
        }
        
        unset($orders[$id]);
        writeOrders($orders);
        
        sendResponse(['success' => true, 'message' => 'Заказ удален']);
    }
    
    // Статистика (админ)
    if ($method === 'GET' && $action === 'stats') {
        $orders = readOrders();
        
        $stats = [
            'total' => 0,
            'new' => 0,
            'preparing' => 0,
            'ready' => 0,
            'completed' => 0,
            'cancelled' => 0,
            'totalRevenue' => 0,
            'todayOrders' => 0,
            'todayRevenue' => 0
        ];
        
        $today = strtotime('today');
        
        foreach ($orders as $order) {
            $stats['total']++;
            $amount = $order['totalAmount'] ?? 0;
            $stats['totalRevenue'] += $amount;
            
            $orderDate = $order['createdAt'] ?? 0;
            if ($orderDate >= $today) {
                $stats['todayOrders']++;
                $stats['todayRevenue'] += $amount;
            }
            
            $status = $order['status'] ?? '';
            if ($status === 'Новый') $stats['new']++;
            elseif ($status === 'Готовится') $stats['preparing']++;
            elseif ($status === 'Готов') $stats['ready']++;
            elseif ($status === 'Выдан') $stats['completed']++;
            elseif ($status === 'Отменен') $stats['cancelled']++;
        }
        
        sendResponse(['success' => true, 'data' => $stats]);
    }
    
    sendError('Invalid action');
    
} catch (Exception $e) {
    sendError($e->getMessage(), 500);
}
