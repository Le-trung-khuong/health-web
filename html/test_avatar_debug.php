<?php
session_start();
require_once 'config/database.php';

// Function helper để xử lý avatar
function getAvatarUrl($avatar, $username = 'User') {
    $colors = ['4f46e5', '06b6d4', '10b981', 'f59e0b', 'ef4444', '8b5cf6', 'ec4899', '14b8a6'];
    $color = $colors[abs(crc32($username)) % count($colors)];
    
    $defaultAvatar = 'https://ui-avatars.com/api/?name=' . urlencode($username) . '&size=200&background=' . $color . '&color=ffffff&rounded=true&bold=true';
    
    if (empty($avatar) || $avatar === 'default-avatar.jpg' || $avatar === 'NULL') {
        return $defaultAvatar;
    }
    
    if (filter_var($avatar, FILTER_VALIDATE_URL)) {
        return $avatar;
    }
    
    $possiblePaths = [
        $avatar,
        'uploads/avatars/' . basename($avatar),
        '../uploads/avatars/' . basename($avatar),
        'html/uploads/avatars/' . basename($avatar),
    ];
    
    foreach ($possiblePaths as $path) {
        if (file_exists($path)) {
            return $path;
        }
    }
    
    return $defaultAvatar;
}

echo "<!DOCTYPE html>
<html>
<head>
    <title>Avatar Debug</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .user-card { border: 1px solid #ddd; padding: 15px; margin: 10px 0; border-radius: 8px; }
        .avatar { width: 60px; height: 60px; border-radius: 50%; object-fit: cover; margin-right: 15px; vertical-align: top; }
        .debug { background: #f9f9f9; padding: 10px; margin: 10px 0; border-left: 4px solid #007cba; font-family: monospace; }
    </style>
</head>
<body>";

echo "<h1>🔍 Avatar Debug Tool</h1>";
echo "<p><strong>Kiểm tra avatar của tất cả users trong hệ thống</strong></p>";

// Lấy tất cả users
$users = $pdo->query("SELECT id, username, avatar, email FROM users ORDER BY id ASC")->fetchAll();

echo "<h2>📊 Tổng quan:</h2>";
echo "<div class='debug'>";
echo "Tổng số users: " . count($users) . "<br>";
echo "Database path: " . getcwd() . "<br>";
echo "Upload directories check:<br>";

$uploadDirs = ['uploads/avatars/', '../uploads/avatars/'];
foreach ($uploadDirs as $dir) {
    echo "- $dir: " . (is_dir($dir) ? "✅ Exists" : "❌ Not found") . " | " . (is_writable($dir) ? "✅ Writable" : "❌ Not writable") . "<br>";
}
echo "</div>";

echo "<h2>👥 Users và Avatar:</h2>";

foreach ($users as $user) {
    $avatarUrl = getAvatarUrl($user['avatar'], $user['username']);
    
    echo "<div class='user-card'>";
    echo "<img src='" . htmlspecialchars($avatarUrl) . "' class='avatar' alt='" . htmlspecialchars($user['username']) . "' onerror=\"console.error('Failed to load avatar:', this.src);\">";
    echo "<strong>👤 " . htmlspecialchars($user['username']) . "</strong> (ID: " . $user['id'] . ")<br>";
    echo "📧 " . htmlspecialchars($user['email']) . "<br>";
    
    echo "<div class='debug'>";
    echo "<strong>🖼️ Avatar Debug:</strong><br>";
    echo "Raw avatar field: " . ($user['avatar'] ? "'" . htmlspecialchars($user['avatar']) . "'" : "NULL") . "<br>";
    echo "Resolved avatar URL: " . htmlspecialchars($avatarUrl) . "<br>";
    
    if ($user['avatar'] && $user['avatar'] !== 'default-avatar.jpg') {
        echo "File exists check:<br>";
        $paths = [
            $user['avatar'],
            'uploads/avatars/' . basename($user['avatar']),
            '../uploads/avatars/' . basename($user['avatar'])
        ];
        
        foreach ($paths as $path) {
            $exists = file_exists($path);
            echo "- $path: " . ($exists ? "✅ Exists" : "❌ Not found") . "<br>";
        }
    }
    echo "</div>";
    echo "</div>";
}

// Test comments với avatar
echo "<h2>💬 Comments với Avatar Test:</h2>";
$comments = $pdo->query("
    SELECT c.*, u.username, u.avatar 
    FROM post_comments c 
    LEFT JOIN users u ON c.user_id = u.id 
    ORDER BY c.created_at DESC 
    LIMIT 5
")->fetchAll();

foreach ($comments as $comment) {
    $avatarUrl = getAvatarUrl($comment['avatar'], $comment['username']);
    
    echo "<div class='user-card'>";
    echo "<img src='" . htmlspecialchars($avatarUrl) . "' class='avatar' alt='" . htmlspecialchars($comment['username']) . "'>";
    echo "<strong>💬 Comment by " . htmlspecialchars($comment['username']) . "</strong><br>";
    echo "Content: " . htmlspecialchars(substr($comment['content'], 0, 100)) . "...<br>";
    
    echo "<div class='debug'>";
    echo "Comment avatar field: " . ($comment['avatar'] ? "'" . htmlspecialchars($comment['avatar']) . "'" : "NULL") . "<br>";
    echo "Resolved URL: " . htmlspecialchars($avatarUrl) . "<br>";
    echo "</div>";
    echo "</div>";
}

echo "</body></html>";
?> 