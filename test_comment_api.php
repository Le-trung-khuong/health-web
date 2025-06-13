<?php
require_once 'html/config/database.php';

// Simulate API call
$_GET['post_id'] = 1; // Test với post ID 1
$_SESSION['user_id'] = 1; // Simulate logged in user

// Include API logic
ob_start();
include 'html/api/comment.php';
$output = ob_get_clean();

echo "=== API COMMENT OUTPUT ===\n";
echo $output . "\n";

// Parse JSON để kiểm tra
$data = json_decode($output, true);

if ($data && $data['success'] && isset($data['comments'])) {
    echo "\n=== AVATAR ANALYSIS ===\n";
    foreach ($data['comments'] as $comment) {
        echo "User: {$comment['username']}\n";
        echo "Avatar field: " . ($comment['avatar'] ?: 'NULL') . "\n";
        echo "Avatar URL: " . ($comment['avatar_url'] ?: 'NULL') . "\n";
        
        if ($comment['avatar_url'] && $comment['avatar_url'] !== $comment['avatar']) {
            echo "✅ Avatar URL processed\n";
        } else {
            echo "❌ Avatar URL not processed\n";
        }
        echo "---\n";
    }
} else {
    echo "❌ API Error or no comments\n";
}
?> 