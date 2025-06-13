<?php
require_once 'html/config/database.php';

echo "=== CẬP NHẬT AVATAR CHO USERS ===\n";

// Lấy danh sách files avatar có sẵn
$avatarFiles = glob('uploads/avatars/*.jpg');
echo "Tìm thấy " . count($avatarFiles) . " avatar files:\n";
foreach ($avatarFiles as $file) {
    echo "- " . basename($file) . "\n";
}

// Cập nhật avatar cho từng user
$users = $pdo->query('SELECT id, username FROM users ORDER BY id')->fetchAll();

foreach ($users as $index => $user) {
    if (isset($avatarFiles[$index])) {
        $avatarPath = $avatarFiles[$index];
        $stmt = $pdo->prepare('UPDATE users SET avatar = ? WHERE id = ?');
        $stmt->execute([$avatarPath, $user['id']]);
        
        echo "✅ Cập nhật user {$user['username']} (ID: {$user['id']}) -> " . basename($avatarPath) . "\n";
    } else {
        // Nếu không có file, set về NULL để dùng avatar tự tạo
        $stmt = $pdo->prepare('UPDATE users SET avatar = NULL WHERE id = ?');
        $stmt->execute([$user['id']]);
        
        echo "🔄 User {$user['username']} (ID: {$user['id']}) -> sử dụng avatar tự tạo\n";
    }
}

echo "\n=== KIỂM TRA KẾT QUẢ ===\n";
$users = $pdo->query('SELECT id, username, avatar FROM users')->fetchAll();

foreach($users as $user) {
    echo "User: {$user['username']} | Avatar: " . ($user['avatar'] ?: 'AUTO-GENERATED') . "\n";
    if ($user['avatar'] && file_exists($user['avatar'])) {
        echo "  ✅ File exists\n";
    } elseif ($user['avatar']) {
        echo "  ❌ File not found\n";
    } else {
        echo "  🎨 Will use auto-generated avatar\n";
    }
}

echo "\n✅ Hoàn thành cập nhật avatar!\n";
?> 