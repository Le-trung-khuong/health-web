<?php
require_once 'config/database.php';

echo "<h2>Reset Avatars to Generated</h2>";

// Reset tất cả avatars về NULL để sử dụng generated avatars
$stmt = $pdo->prepare("UPDATE users SET avatar = NULL WHERE avatar IS NOT NULL");
$result = $stmt->execute();

if ($result) {
    $affected = $stmt->rowCount();
    echo "<p>✓ Successfully reset $affected user avatars to use generated avatars.</p>";
    echo "<p>All users will now display beautiful generated avatars based on their usernames with unique colors.</p>";
} else {
    echo "<p>❌ Failed to reset avatars</p>";
}

// Hiển thị preview của một vài users
echo "<h3>Preview Generated Avatars:</h3>";
$users = $pdo->query("SELECT username FROM users LIMIT 5")->fetchAll();

foreach ($users as $user) {
    $username = $user['username'];
    $colors = ['4f46e5', '06b6d4', '10b981', 'f59e0b', 'ef4444', '8b5cf6', 'ec4899', '14b8a6'];
    $color = $colors[abs(crc32($username)) % count($colors)];
    $avatarUrl = "https://ui-avatars.com/api/?name=" . urlencode($username) . "&size=100&background=$color&color=ffffff&rounded=true&bold=true";
    
    echo "<div style='display:inline-block; margin:10px; text-align:center;'>";
    echo "<img src='$avatarUrl' style='width:60px;height:60px;border-radius:50%;' alt='$username'><br>";
    echo "<small>$username</small>";
    echo "</div>";
}

echo "<br><br><a href='community.php'>Back to Community</a>";
?> 