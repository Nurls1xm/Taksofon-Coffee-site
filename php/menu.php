<?php
require_once 'config.php';
require_once 'firebase.php';

requireAuth();

$firebase = new FirebaseAPI();
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

try {
    // Get all menu items
    if ($method === 'GET' && $action === 'list') {
        $items = $firebase->get('/menu');
        sendResponse(['success' => true, 'data' => $items ?? []]);
    }
    
    // Get single menu item
    if ($method === 'GET' && $action === 'get') {
        $id = $_GET['id'] ?? '';
        if (empty($id)) sendError('ID обязателен');
        
        $item = $firebase->get("/menu/$id");
        sendResponse(['success' => true, 'data' => $item]);
    }
    
    // Create menu item
    if ($method === 'POST' && $action === 'create') {
        $input = json_decode(file_get_contents('php://input'), true);
        
        // Validation
        if (empty($input['name'])) sendError('Название обязательно');
        if (empty($input['category'])) sendError('Категория обязательна');
        if (empty($input['basePrice'])) sendError('Цена обязательна');
        
        $data = [
            'name' => $input['name'],
            'nameKk' => $input['nameKk'] ?? '',
            'category' => $input['category'],
            'description' => $input['description'] ?? '',
            'basePrice' => (int)$input['basePrice'],
            'sizes' => $input['sizes'] ?? [],
            'options' => $input['options'] ?? [],
            'image' => $input['image'] ?? '',
            'available' => $input['available'] ?? true,
            'createdAt' => time(),
            'updatedAt' => time()
        ];
        
        $result = $firebase->post('/menu', $data);
        sendResponse(['success' => true, 'id' => $result['name'], 'data' => $data]);
    }
    
    // Update menu item
    if ($method === 'PUT' && $action === 'update') {
        $id = $_GET['id'] ?? '';
        if (empty($id)) sendError('ID обязателен');
        
        $input = json_decode(file_get_contents('php://input'), true);
        $input['updatedAt'] = time();
        
        $firebase->patch("/menu/$id", $input);
        sendResponse(['success' => true, 'message' => 'Обновлено успешно']);
    }
    
    // Delete menu item
    if ($method === 'DELETE' && $action === 'delete') {
        $id = $_GET['id'] ?? '';
        if (empty($id)) sendError('ID обязателен');
        
        $firebase->delete("/menu/$id");
        sendResponse(['success' => true, 'message' => 'Удалено успешно']);
    }
    
    // Upload image
    if ($method === 'POST' && $action === 'upload') {
        if (!isset($_FILES['image'])) sendError('Файл не загружен');
        
        $file = $_FILES['image'];
        
        // Проверка ошибок загрузки
        if ($file['error'] !== UPLOAD_ERR_OK) {
            sendError('Ошибка загрузки файла: ' . $file['error']);
        }
        
        // Проверка MIME типа
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mimeType = finfo_file($finfo, $file['tmp_name']);
        finfo_close($finfo);
        
        $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        
        if (!in_array($mimeType, $allowedTypes)) {
            sendError('Недопустимый тип файла. Разрешены: JPEG, PNG, GIF, WebP');
        }
        
        if ($file['size'] > 5 * 1024 * 1024) { // 5MB
            sendError('Файл слишком большой (макс. 5MB)');
        }
        
        // Безопасное имя файла
        $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
        $filename = 'menu/' . uniqid('img_', true) . '.' . $extension;
        
        $url = $firebase->uploadFile($file, $filename);
        
        sendResponse(['success' => true, 'url' => $url]);
    }
    
    sendError('Invalid action');
    
} catch (Exception $e) {
    sendError($e->getMessage(), 500);
}
