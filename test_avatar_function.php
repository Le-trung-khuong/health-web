<?php
// Test function getApiAvatarUrl
function getApiAvatarUrl($avatar, $username = 'User') {
    $colors = ['4f46e5', '06b6d4', '10b981', 'f59e0b', 'ef4444', '8b5cf6', 'ec4899', '14b8a6'];
    $color = $colors[abs(crc32($username)) % count($colors)];
    
    $defaultAvatar = 'https://ui-avatars.com/api/?name=' . urlencode($username) . '&size=200&background=' . $color . '&color=ffffff&rounded=true&bold=true';
    
    if (empty($avatar) || $avatar === 'default-avatar.jpg' || $avatar === 'NULL') {
        return $defaultAvatar;
    }
    
    if (filter_var($avatar, FILTER_VALIDATE_URL)) {
        return $avatar;
    }
    
    // Kiểm tra file tồn tại và trả về đường dẫn đúng cho browser
    $checkPaths = [
        $avatar,
        '../' . $avatar,
        '../../' . $avatar,
    ];
    
    $returnPaths = [
        $avatar,
        '../' . $avatar,
        '../../' . $avatar,
    ];
    
    foreach ($checkPaths as $index => $checkPath) {
        if (file_exists($checkPath)) {
            // Trả về đường dẫn tương đối từ html/ để browser có thể truy cập
            return $returnPaths[$index];
        }
    }
    
    return $defaultAvatar;
}

// Test với avatar thật
require_once 'html/config/database.php';

echo "=== TEST AVATAR FUNCTION ===\n";

$users = $pdo->query('SELECT username, avatar FROM users WHERE avatar IS NOT NULL LIMIT 3')->fetchAll();

foreach ($users as $user) {
    echo "User: {$user['username']}\n";
    echo "Avatar DB: {$user['avatar']}\n";
    
    // Test từ thư mục gốc (như khi chạy từ k91/)
    $result1 = getApiAvatarUrl($user['avatar'], $user['username']);
    echo "From root: $result1\n";
    
    // Test từ html/ directory (như API)
    chdir('html');
    $result2 = getApiAvatarUrl($user['avatar'], $user['username']);
    echo "From html/: $result2\n";
    chdir('..');
    
    echo "---\n";
}
?> 