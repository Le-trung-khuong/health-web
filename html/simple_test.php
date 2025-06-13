<?php
require_once 'config/database.php';

// Function helper để xử lý avatar URL
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
            echo "✅ Found file at: $checkPath -> returning: {$returnPaths[$index]}\n";
            return $returnPaths[$index];
        } else {
            echo "❌ Not found: $checkPath\n";
        }
    }
    
    echo "🎨 Using default avatar\n";
    return $defaultAvatar;
}

echo "=== AVATAR PROCESSING TEST ===\n";

// Test với một user có avatar
$user = $pdo->query("SELECT username, avatar FROM users WHERE avatar IS NOT NULL LIMIT 1")->fetch();

if ($user) {
    echo "Testing user: {$user['username']}\n";
    echo "Avatar DB field: {$user['avatar']}\n";
    echo "Current directory: " . getcwd() . "\n";
    
    $result = getApiAvatarUrl($user['avatar'], $user['username']);
    echo "Final result: $result\n";
} else {
    echo "No users with avatar found\n";
}
?> 