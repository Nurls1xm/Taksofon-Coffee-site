<?php

class Router {
    private $routes = [];
    
    public function __construct() {
        $this->setupRoutes();
    }
    
    private function setupRoutes() {
        // Orders
        $this->routes['POST']['/api/orders'] = 'OrderController@create';
        $this->routes['GET']['/api/orders'] = 'OrderController@getAll';
        $this->routes['GET']['/api/orders/{id}'] = 'OrderController@getById';
        $this->routes['PUT']['/api/orders/{id}/status'] = 'OrderController@updateStatus';
        
        // Customers
        $this->routes['GET']['/api/customers/{phone}'] = 'CustomerController@getByPhone';
        
        // Products
        $this->routes['GET']['/api/products'] = 'ProductController@getAll';
    }
    
    public function handleRequest() {
        $method = $_SERVER['REQUEST_METHOD'];
        $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
        
        // Remove base path if exists
        $path = str_replace('/backend', '', $path);
        
        // Find matching route
        $handler = $this->matchRoute($method, $path);
        
        if ($handler) {
            list($controller, $action) = explode('@', $handler['handler']);
            $params = $handler['params'];
            
            require_once __DIR__ . '/../controllers/' . $controller . '.php';
            
            $controllerInstance = new $controller();
            call_user_func_array([$controllerInstance, $action], $params);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Route not found']);
        }
    }
    
    private function matchRoute($method, $path) {
        if (!isset($this->routes[$method])) {
            return null;
        }
        
        foreach ($this->routes[$method] as $route => $handler) {
            $pattern = preg_replace('/\{[a-zA-Z0-9_]+\}/', '([a-zA-Z0-9_-]+)', $route);
            $pattern = '#^' . $pattern . '$#';
            
            if (preg_match($pattern, $path, $matches)) {
                array_shift($matches); // Remove full match
                return [
                    'handler' => $handler,
                    'params' => $matches
                ];
            }
        }
        
        return null;
    }
}
