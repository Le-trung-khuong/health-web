<?php
require_once 'html/config/database.php';

echo "=== KIỂM TRA USERS VÀ AVATAR ===\n";

$users = $pdo->query('SELECT id, username, avatar FROM users')->fetchAll();

foreach($users as $user) {
    echo "User ID: {$user['id']}\n";
    echo "Username: {$user['username']}\n";
    echo "Avatar field: " . ($user['avatar'] ?: 'NULL') . "\n";
    
    if ($user['avatar']) {
        $paths = [
            $user['avatar'],
            'uploads/avatars/' . basename($user['avatar']),
            'html/uploads/avatars/' . basename($user['avatar'])
        ];
        
        foreach ($paths as $path) {
            echo "  - $path: " . (file_exists($path) ? "EXISTS" : "NOT FOUND") . "\n";
        }
    }
    echo "---\n";
}

echo "\n=== KIỂM TRA COMMENTS ===\n";
$comments = $pdo->query('SELECT c.id, c.content, u.username, u.avatar FROM post_comments c LEFT JOIN users u ON c.user_id = u.id LIMIT 3')->fetchAll();

foreach($comments as $comment) {
    echo "Comment ID: {$comment['id']}\n";
    echo "User: {$comment['username']}\n";
    echo "Avatar: " . ($comment['avatar'] ?: 'NULL') . "\n";
    echo "Content: " . substr($comment['content'], 0, 50) . "...\n";
    echo "---\n";
}
?> 