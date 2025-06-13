<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

session_start();
require_once '../config/database.php';

// Kiểm tra phương thức
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// Lấy từ khóa tìm kiếm
$query = trim($_GET['q'] ?? '');
$limit = min(intval($_GET['limit'] ?? 10), 20); // Giới hạn tối đa 20 kết quả

if (empty($query)) {
    echo json_encode(['success' => false, 'message' => 'Từ khóa tìm kiếm không được để trống']);
    exit;
}

if (strlen($query) < 2) {
    echo json_encode(['success' => false, 'message' => 'Từ khóa tìm kiếm phải có ít nhất 2 ký tự']);
    exit;
}

try {
    // Tìm kiếm người dùng theo username và email
    $stmt = $pdo->prepare("
        SELECT 
            id,
            username,
            email,
            avatar,
            created_at,
            (SELECT COUNT(*) FROM community_posts WHERE user_id = users.id) as post_count,
            (SELECT COUNT(*) FROM post_likes pl JOIN community_posts cp ON pl.post_id = cp.id WHERE cp.user_id = users.id) as total_likes,
            (SELECT COUNT(*) FROM chat_members WHERE user_id = users.id) as group_count
        FROM users 
        WHERE 
            username LIKE ? OR 
            email LIKE ?
        ORDER BY 
            CASE 
                WHEN username LIKE ? THEN 1 
                WHEN username LIKE ? THEN 2
                ELSE 3 
            END,
            post_count DESC,
            total_likes DESC
        LIMIT ?
    ");
    
    $searchTerm = '%' . $query . '%';
    $exactStart = $query . '%';
    
    $stmt->execute([
        $searchTerm,    // username LIKE
        $searchTerm,    // email LIKE  
        $exactStart,    // username LIKE exact start (priority 1)
        $searchTerm,    // username LIKE anywhere (priority 2)
        $limit
    ]);
    
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Xử lý avatar cho mỗi user
    foreach ($users as &$user) {
        $user['avatar_url'] = getAvatarUrl($user['avatar'], $user['username']);
        $user['display_email'] = substr($user['email'], 0, 3) . '***@' . substr($user['email'], strpos($user['email'], '@') + 1);
        $user['join_date'] = date('d/m/Y', strtotime($user['created_at']));
        
        // Không trả về email đầy đủ vì lý do bảo mật
        unset($user['email']);
    }
    
    echo json_encode([
        'success' => true, 
        'users' => $users,
        'count' => count($users),
        'query' => $query
    ]);
    
} catch (Exception $e) {
    error_log("Search users error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Lỗi server khi tìm kiếm']);
}

// Helper function để xử lý avatar (copy từ community.php)
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
?> 