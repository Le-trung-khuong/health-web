<?php
// Khởi động phiên làm việc
session_start();

// Thiết lập header JSON
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Mảng kết quả
$result = [
    'isLoggedIn' => false,
    'username' => null,
    'isAdmin' => false,
    'avatar' => null,
    'email' => null
];

// Kiểm tra nếu người dùng đã đăng nhập
if (isset($_SESSION['user_id']) && isset($_SESSION['username'])) {
    $result['isLoggedIn'] = true;
    $result['username'] = $_SESSION['username'];
    
    // Thêm thông tin avatar nếu có
    if (isset($_SESSION['avatar'])) {
        $result['avatar'] = $_SESSION['avatar'];
    }
    
    // Nếu có thông tin về quyền admin
    if (isset($_SESSION['is_admin'])) {
        $result['isAdmin'] = (bool)$_SESSION['is_admin'];
    }
    
    // Thêm thông tin email nếu cần
    if (isset($_SESSION['email'])) {
        $result['email'] = $_SESSION['email'];
    }
}

// Trả về kết quả dạng JSON
echo json_encode($result, JSON_UNESCAPED_UNICODE);
?> 