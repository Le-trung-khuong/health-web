<?php
require_once 'config/database.php';

echo "<h2>Avatar Fix Script</h2>";

// Lấy tất cả users có avatar
$stmt = $pdo->query("SELECT id, username, avatar FROM users WHERE avatar IS NOT NULL AND avatar != 'default-avatar.jpg'");
$users = $stmt->fetchAll();

echo "<h3>Checking " . count($users) . " users with avatars...</h3>";

$fixed_count = 0;
foreach ($users as $user) {
    echo "<p>User: {$user['username']} - Avatar: {$user['avatar']} - ";
    
    // Kiểm tra file có tồn tại không
    if (file_exists($user['avatar'])) {
        echo "✓ File exists</p>";
    } else {
        echo "❌ File missing - ";
        
        // Reset avatar về null để sử dụng generated avatar
        $updateStmt = $pdo->prepare("UPDATE users SET avatar = NULL WHERE id = ?");
        $updateStmt->execute([$user['id']]);
        
        echo "FIXED (reset to generated avatar)</p>";
        $fixed_count++;
    }
}

echo "<h3>Summary:</h3>";
echo "<p>Fixed $fixed_count users with missing avatar files.</p>";
echo "<p>These users will now use generated avatars based on their usernames.</p>";

echo "<br><a href='community.php'>Back to Community</a> | <a href='test_avatar.php'>Test Avatar</a>";
?> 