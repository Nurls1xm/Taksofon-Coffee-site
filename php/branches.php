<?php
require_once 'config.php';
require_once 'firebase.php';

$firebase = new FirebaseAPI();
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

try {
    // Get all branches (public)
    if ($method === 'GET' && $action === 'list') {
        $branches = $firebase->get('/branches');
        $branchesList = [];
        
        if ($branches) {
            foreach ($branches as $id => $branch) {
                $branch['id'] = $id;
                $branchesList[] = $branch;
            }
        }
        
        sendResponse(['success' => true, 'data' => $branchesList]);
    }
    
    // Admin actions - require authentication
    requireAuth();
    
    // Get single branch
    if ($method === 'GET' && $action === 'get') {
        $id = $_GET['id'] ?? '';
        if (empty($id)) sendError('ID обязателен');
        
        $branch = $firebase->get("/branches/$id");
        sendResponse(['success' => true, 'data' => $branch]);
    }
    
    // Create branch
    if ($method === 'POST' && $action === 'create') {
        $input = json_decode(file_get_contents('php://input'), true);
        
        // Validation
        if (empty($input['name'])) sendError('Название обязательно');
        if (empty($input['address'])) sendError('Адрес обязателен');
        
        $data = [
            'name' => $input['name'],
            'nameKk' => $input['nameKk'] ?? '',
            'address' => $input['address'],
            'addressKk' => $input['addressKk'] ?? '',
            'phone' => $input['phone'] ?? '',
            'workingHours' => $input['workingHours'] ?? '',
            'coordinates' => $input['coordinates'] ?? ['lat' => 0, 'lng' => 0],
            'image' => $input['image'] ?? '',
            'active' => $input['active'] ?? true,
            'createdAt' => time(),
            'updatedAt' => time()
        ];
        
        $result = $firebase->post('/branches', $data);
        sendResponse(['success' => true, 'id' => $result['name'], 'data' => $data]);
    }
    
    // Update branch
    if ($method === 'PUT' && $action === 'update') {
        $id = $_GET['id'] ?? '';
        if (empty($id)) sendError('ID обязателен');
        
        $input = json_decode(file_get_contents('php://input'), true);
        $input['updatedAt'] = time();
        
        $firebase->patch("/branches/$id", $input);
        sendResponse(['success' => true, 'message' => 'Филиал обновлен']);
    }
    
    // Delete branch
    if ($method === 'DELETE' && $action === 'delete') {
        $id = $_GET['id'] ?? '';
        if (empty($id)) sendError('ID обязателен');
        
        $firebase->delete("/branches/$id");
        sendResponse(['success' => true, 'message' => 'Филиал удален']);
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
        
        if ($file['size'] > 5 * 1024 * 1024) {
            sendError('Файл слишком большой (макс. 5MB)');
        }
        
        // Безопасное имя файла
        $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
        $filename = 'branches/' . uniqid('branch_', true) . '.' . $extension;
        
        $url = $firebase->uploadFile($file, $filename);
        
        sendResponse(['success' => true, 'url' => $url]);
    }
    
    sendError('Invalid action');
    
} catch (Exception $e) {
    sendError($e->getMessage(), 500);
}
