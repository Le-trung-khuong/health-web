<?php
require_once 'config/database.php';

echo "<h2>Setup Test Data for Comments</h2>";

try {
    // Tạo user test nếu chưa có
    $stmt = $pdo->prepare("SELECT id FROM users WHERE username = ?");
    $stmt->execute(['testuser']);
    $user = $stmt->fetch();
    
    if (!$user) {
        $stmt = $pdo->prepare("INSERT INTO users (username, email, password) VALUES (?, ?, ?)");
        $stmt->execute(['testuser', 'test@test.com', password_hash('123456', PASSWORD_DEFAULT)]);
        $user_id = $pdo->lastInsertId();
        echo "✓ Created test user (ID: $user_id)<br>";
    } else {
        $user_id = $user['id'];
        echo "✓ Test user exists (ID: $user_id)<br>";
    }
    
    // Tạo bài viết test nếu chưa có
    $stmt = $pdo->prepare("SELECT id FROM community_posts WHERE user_id = ?");
    $stmt->execute([$user_id]);
    $post = $stmt->fetch();
    
    if (!$post) {
        $stmt = $pdo->prepare("INSERT INTO community_posts (user_id, content) VALUES (?, ?)");
        $stmt->execute([$user_id, 'Đây là bài viết test để kiểm tra hệ thống comments và replies. Hãy thử bình luận và trả lời để test chức năng!']);
        $post_id = $pdo->lastInsertId();
        echo "✓ Created test post (ID: $post_id)<br>";
    } else {
        $post_id = $post['id'];
        echo "✓ Test post exists (ID: $post_id)<br>";
    }
    
    // Tạo comments test
    $stmt = $pdo->prepare("SELECT COUNT(*) as count FROM post_comments WHERE post_id = ?");
    $stmt->execute([$post_id]);
    $comment_count = $stmt->fetch()['count'];
    
    if ($comment_count == 0) {
        // Comment gốc 1
        $stmt = $pdo->prepare("INSERT INTO post_comments (post_id, user_id, content) VALUES (?, ?, ?)");
        $stmt->execute([$post_id, $user_id, 'Đây là comment test đầu tiên']);
        $comment1_id = $pdo->lastInsertId();
        
        // Comment gốc 2  
        $stmt->execute([$post_id, $user_id, 'Đây là comment test thứ hai']);
        $comment2_id = $pdo->lastInsertId();
        
        // Reply cho comment 1
        $stmt = $pdo->prepare("INSERT INTO post_comments (post_id, user_id, content, parent_id, reply_level) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([$post_id, $user_id, 'Đây là reply cho comment đầu tiên', $comment1_id, 1]);
        
        // Reply cho reply trên (level 2)
        $reply1_id = $pdo->lastInsertId();
        $stmt->execute([$post_id, $user_id, 'Đây là reply cấp 2', $reply1_id, 2]);
        
        echo "✓ Created test comments and replies<br>";
    } else {
        echo "✓ Test comments already exist ($comment_count comments)<br>";
    }
    
    echo "<br><strong>Setup completed successfully!</strong><br>";
    echo "<a href='community.php'>Go to Community Page</a><br>";
    echo "<a href='test_comments.php'>Test Comments API</a><br>";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage();
}
?> 