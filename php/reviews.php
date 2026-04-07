<?php
require_once 'config.php';
require_once 'firebase.php';

$firebase = new FirebaseAPI();
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

try {
    // Get all reviews (public)
    if ($method === 'GET' && $action === 'list') {
        $showAll = isset($_GET['all']) && isLoggedIn();
        
        $reviews = $firebase->get('/reviews');
        $reviewsList = [];
        
        if ($reviews) {
            foreach ($reviews as $id => $review) {
                // Show only approved reviews for public
                if ($showAll || ($review['approved'] ?? false)) {
                    $review['id'] = $id;
                    $reviewsList[] = $review;
                }
            }
            
            // Sort by date
            usort($reviewsList, function($a, $b) {
                return ($b['createdAt'] ?? 0) - ($a['createdAt'] ?? 0);
            });
        }
        
        sendResponse(['success' => true, 'data' => $reviewsList]);
    }
    
    // Create review (public)
    if ($method === 'POST' && $action === 'create') {
        $input = json_decode(file_get_contents('php://input'), true);
        
        // Validation
        $name = trim($input['name'] ?? '');
        $text = trim($input['text'] ?? '');
        $rating = (int)($input['rating'] ?? 0);
        
        if (empty($name) || mb_strlen($name) < 2) {
            sendError('Имя должно содержать минимум 2 символа');
        }
        
        if (mb_strlen($name) > 100) {
            sendError('Имя слишком длинное (макс. 100 символов)');
        }
        
        if ($rating < 1 || $rating > 5) {
            sendError('Рейтинг должен быть от 1 до 5');
        }
        
        if (empty($text) || mb_strlen($text) < 10) {
            sendError('Текст отзыва должен содержать минимум 10 символов');
        }
        
        if (mb_strlen($text) > 1000) {
            sendError('Текст отзыва слишком длинный (макс. 1000 символов)');
        }
        
        // Простая защита от спама
        $lastReviewTime = $_SESSION['last_review_time'] ?? 0;
        if (time() - $lastReviewTime < 60) {
            sendError('Пожалуйста, подождите минуту перед отправкой следующего отзыва');
        }
        
        $data = [
            'name' => htmlspecialchars($name, ENT_QUOTES, 'UTF-8'),
            'rating' => $rating,
            'text' => htmlspecialchars($text, ENT_QUOTES, 'UTF-8'),
            'approved' => false,
            'visible' => true,
            'adminReply' => '',
            'createdAt' => time(),
            'updatedAt' => time(),
            'ipAddress' => $_SERVER['REMOTE_ADDR'] ?? 'unknown'
        ];
        
        $result = $firebase->post('/reviews', $data);
        $_SESSION['last_review_time'] = time();
        
        sendResponse(['success' => true, 'id' => $result['name'], 'message' => 'Отзыв отправлен на модерацию']);
    }
    
    // Admin actions - require authentication
    requireAuth();
    
    // Approve review
    if ($method === 'PUT' && $action === 'approve') {
        $id = $_GET['id'] ?? '';
        if (empty($id)) sendError('ID обязателен');
        
        $firebase->patch("/reviews/$id", [
            'approved' => true,
            'updatedAt' => time()
        ]);
        
        sendResponse(['success' => true, 'message' => 'Отзыв одобрен']);
    }
    
    // Toggle visibility
    if ($method === 'PUT' && $action === 'toggle') {
        $id = $_GET['id'] ?? '';
        if (empty($id)) sendError('ID обязателен');
        
        $review = $firebase->get("/reviews/$id");
        $visible = !($review['visible'] ?? true);
        
        $firebase->patch("/reviews/$id", [
            'visible' => $visible,
            'updatedAt' => time()
        ]);
        
        sendResponse(['success' => true, 'message' => 'Видимость изменена']);
    }
    
    // Add admin reply
    if ($method === 'PUT' && $action === 'reply') {
        $id = $_GET['id'] ?? '';
        if (empty($id)) sendError('ID обязателен');
        
        $input = json_decode(file_get_contents('php://input'), true);
        $reply = $input['reply'] ?? '';
        
        $firebase->patch("/reviews/$id", [
            'adminReply' => htmlspecialchars($reply),
            'updatedAt' => time()
        ]);
        
        sendResponse(['success' => true, 'message' => 'Ответ добавлен']);
    }
    
    // Delete review
    if ($method === 'DELETE' && $action === 'delete') {
        $id = $_GET['id'] ?? '';
        if (empty($id)) sendError('ID обязателен');
        
        $firebase->delete("/reviews/$id");
        sendResponse(['success' => true, 'message' => 'Отзыв удален']);
    }
    
    sendError('Invalid action');
    
} catch (Exception $e) {
    sendError($e->getMessage(), 500);
}
