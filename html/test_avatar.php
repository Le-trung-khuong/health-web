<?php
session_start();
require_once 'config/database.php';

echo "<h2>Avatar Debug Test</h2>";

// Kiểm tra user hiện tại
if (isset($_SESSION['user_id'])) {
    $user_id = $_SESSION['user_id'];
    
    // Lấy thông tin từ database
    $stmt = $pdo->prepare("SELECT id, username, avatar FROM users WHERE id = ?");
    $stmt->execute([$user_id]);
    $user = $stmt->fetch();
    
    if ($user) {
        echo "<h3>User Info from Database:</h3>";
        echo "ID: " . $user['id'] . "<br>";
        echo "Username: " . $user['username'] . "<br>";
        echo "Avatar: " . ($user['avatar'] ?? 'NULL') . "<br>";
        
        if ($user['avatar']) {
            echo "<h3>Avatar File Check:</h3>";
            $avatar_path = $user['avatar'];
            
            echo "Avatar path from DB: " . $avatar_path . "<br>";
            echo "File exists check: " . (file_exists($avatar_path) ? 'YES' : 'NO') . "<br>";
            echo "Full server path: " . __DIR__ . '/' . $avatar_path . "<br>";
            echo "Full path exists: " . (file_exists(__DIR__ . '/' . $avatar_path) ? 'YES' : 'NO') . "<br>";
            
            // Kiểm tra các variation của path
            $paths_to_check = [
                $avatar_path,
                'uploads/avatars/' . basename($avatar_path),
                __DIR__ . '/' . $avatar_path,
                __DIR__ . '/uploads/avatars/' . basename($avatar_path)
            ];
            
            echo "<h3>Path Variations Check:</h3>";
            foreach ($paths_to_check as $path) {
                echo "Path: $path - Exists: " . (file_exists($path) ? 'YES' : 'NO') . "<br>";
            }
            
            // Hiển thị avatar nếu tìm thấy
            echo "<h3>Avatar Display Test:</h3>";
            if (file_exists($avatar_path)) {
                echo "<img src='$avatar_path' style='width:100px;height:100px;border-radius:50%;' alt='Avatar'><br>";
                echo "Direct path worked!<br>";
            } else {
                $backup_path = 'uploads/avatars/' . basename($avatar_path);
                if (file_exists($backup_path)) {
                    echo "<img src='$backup_path' style='width:100px;height:100px;border-radius:50%;' alt='Avatar'><br>";
                    echo "Backup path worked: $backup_path<br>";
                } else {
                    echo "No avatar file found!<br>";
                }
            }
        }
    }
    
    // Kiểm tra session
    echo "<h3>Session Info:</h3>";
    echo "Session Avatar: " . ($_SESSION['avatar'] ?? 'NULL') . "<br>";
    echo "Session Username: " . ($_SESSION['username'] ?? 'NULL') . "<br>";
    
} else {
    echo "No user logged in<br>";
}

// Liệt kê files trong uploads/avatars
echo "<h3>Files in uploads/avatars/:</h3>";
if (is_dir('uploads/avatars')) {
    $files = scandir('uploads/avatars');
    foreach ($files as $file) {
        if ($file != '.' && $file != '..') {
            echo "$file<br>";
        }
    }
} else {
    echo "uploads/avatars directory does not exist<br>";
}

echo "<br><a href='community.php'>Back to Community</a>";
?> 