<?php
session_start();
require_once 'config/database.php';

// Simulate logged in user
$_SESSION['user_id'] = 2; // nguoi_dung_1

// Get comments for post 1
$post_id = 1;
$user_id = $_SESSION['user_id'];

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
            return $returnPaths[$index];
        }
    }
    
    return $defaultAvatar;
}

// Query comments
$stmt = $pdo->prepare("
    SELECT c.*, u.username, u.avatar, u.is_verified,
           (SELECT COUNT(*) FROM comment_likes cl WHERE cl.comment_id = c.id) as likes_count,
           (SELECT COUNT(*) FROM comment_likes cl WHERE cl.comment_id = c.id AND cl.user_id = ?) as user_liked,
           (SELECT COUNT(*) FROM post_comments sc WHERE sc.parent_id = c.id) as reply_count
    FROM post_comments c
    LEFT JOIN users u ON c.user_id = u.id
    WHERE c.post_id = ? AND c.is_approved = 1
    ORDER BY 
        CASE WHEN c.parent_id IS NULL THEN c.id ELSE c.parent_id END ASC,
        c.parent_id IS NULL DESC,
        c.created_at ASC
");

$stmt->execute([$user_id, $post_id]);
$comments = $stmt->fetchAll();

// Process avatars
foreach ($comments as &$comment) {
    $comment['avatar_url'] = getApiAvatarUrl($comment['avatar'], $comment['username']);
}

// Output as JSON
header('Content-Type: application/json');
echo json_encode(['success' => true, 'comments' => $comments], JSON_PRETTY_PRINT);
?> 