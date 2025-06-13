<?php
session_start();
require_once '../config/database.php';

header('Content-Type: application/json');

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
            // Trả về đường dẫn tương đối từ html/ để browser có thể truy cập
            return $returnPaths[$index];
        }
    }
    
    return $defaultAvatar;
}

// Kiểm tra đăng nhập cho tất cả các request trừ GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET' && !isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

$user_id = $_SESSION['user_id'] ?? null;

try {
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        // Lấy danh sách comments
        $post_id = $_GET['post_id'] ?? null;
        
        if (!$post_id) {
            echo json_encode(['success' => false, 'message' => 'Post ID is required']);
            exit;
        }
        
        // Lấy tất cả comments theo thứ tự phẳng
        $stmt = $pdo->prepare("
            SELECT c.*, u.username, u.avatar, u.is_verified,
                   (SELECT COUNT(*) FROM comment_likes cl WHERE cl.comment_id = c.id) as likes_count,
                   " . ($user_id ? "(SELECT COUNT(*) FROM comment_likes cl WHERE cl.comment_id = c.id AND cl.user_id = ?) as user_liked," : "0 as user_liked,") . "
                   (SELECT COUNT(*) FROM post_comments sc WHERE sc.parent_id = c.id) as reply_count
            FROM post_comments c
            LEFT JOIN users u ON c.user_id = u.id
            WHERE c.post_id = ? AND c.is_approved = 1
            ORDER BY 
                CASE WHEN c.parent_id IS NULL THEN c.id ELSE c.parent_id END ASC,
                c.parent_id IS NULL DESC,
                c.created_at ASC
        ");
        
        if ($user_id) {
            $stmt->execute([$user_id, $post_id]);
        } else {
            $stmt->execute([$post_id]);
        }
        
        $comments = $stmt->fetchAll();
        
        // Xử lý avatar URL cho mỗi comment
        foreach ($comments as &$comment) {
            $comment['avatar_url'] = getApiAvatarUrl($comment['avatar'], $comment['username']);
        }
        
        // Trả về danh sách phẳng - JavaScript sẽ xử lý hiển thị
        echo json_encode(['success' => true, 'comments' => $comments]);
        
    } elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
        // Tạo comment mới
        $input = json_decode(file_get_contents('php://input'), true);
        $post_id = $input['post_id'] ?? null;
        $content = trim($input['content'] ?? '');
        $parent_id = $input['parent_id'] ?? null;
        
        if (!$post_id || !$content) {
            echo json_encode(['success' => false, 'message' => 'Post ID and content are required']);
            exit;
        }
        
        // Tính reply level
        $reply_level = 0;
        if ($parent_id) {
            $stmt = $pdo->prepare("SELECT reply_level FROM post_comments WHERE id = ?");
            $stmt->execute([$parent_id]);
            $parent = $stmt->fetch();
            if ($parent) {
                $reply_level = min($parent['reply_level'] + 1, 3); // Giới hạn 3 cấp
            }
        }
        
        // Thêm comment
        $stmt = $pdo->prepare("
            INSERT INTO post_comments (post_id, user_id, content, parent_id, reply_level) 
            VALUES (?, ?, ?, ?, ?)
        ");
        $stmt->execute([$post_id, $user_id, $content, $parent_id, $reply_level]);
        
        // Cập nhật reply count cho parent comment
        if ($parent_id) {
            $stmt = $pdo->prepare("UPDATE post_comments SET reply_count = reply_count + 1 WHERE id = ?");
            $stmt->execute([$parent_id]);
        }
        
        echo json_encode(['success' => true, 'message' => 'Comment added successfully']);
        
    } elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
        // Chỉnh sửa comment
        $input = json_decode(file_get_contents('php://input'), true);
        $comment_id = $input['comment_id'] ?? null;
        $content = trim($input['content'] ?? '');
        
        if (!$comment_id || !$content) {
            echo json_encode(['success' => false, 'message' => 'Comment ID and content are required']);
            exit;
        }
        
        // Kiểm tra quyền chỉnh sửa
        $stmt = $pdo->prepare("SELECT user_id FROM post_comments WHERE id = ?");
        $stmt->execute([$comment_id]);
        $comment = $stmt->fetch();
        
        if (!$comment || $comment['user_id'] != $user_id) {
            echo json_encode(['success' => false, 'message' => 'You can only edit your own comments']);
            exit;
        }
        
        // Cập nhật comment
        $stmt = $pdo->prepare("UPDATE post_comments SET content = ?, is_edited = 1 WHERE id = ?");
        $stmt->execute([$content, $comment_id]);
        
        echo json_encode(['success' => true, 'message' => 'Comment updated successfully']);
        
    } elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
        // Xóa comment
        $input = json_decode(file_get_contents('php://input'), true);
        $comment_id = $input['comment_id'] ?? null;
        
        if (!$comment_id) {
            echo json_encode(['success' => false, 'message' => 'Comment ID is required']);
            exit;
        }
        
        // Kiểm tra quyền xóa
        $stmt = $pdo->prepare("SELECT user_id, parent_id FROM post_comments WHERE id = ?");
        $stmt->execute([$comment_id]);
        $comment = $stmt->fetch();
        
        if (!$comment || $comment['user_id'] != $user_id) {
            echo json_encode(['success' => false, 'message' => 'You can only delete your own comments']);
            exit;
        }
        
        // Cập nhật reply count cho parent comment
        if ($comment['parent_id']) {
            $stmt = $pdo->prepare("UPDATE post_comments SET reply_count = reply_count - 1 WHERE id = ?");
            $stmt->execute([$comment['parent_id']]);
        }
        
        // Xóa comment (cascade sẽ xóa replies)
        $stmt = $pdo->prepare("DELETE FROM post_comments WHERE id = ?");
        $stmt->execute([$comment_id]);
        
        echo json_encode(['success' => true, 'message' => 'Comment deleted successfully']);
    }
    
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?> 