<?php
header('Content-Type: application/json');
require_once '../config/database.php';

// Function helper để xử lý avatar - sao chép từ community.php
function getAvatarUrl($avatar, $username = 'User') {
    // Danh sách màu nền ngẫu nhiên đẹp
    $colors = ['4f46e5', '06b6d4', '10b981', 'f59e0b', 'ef4444', '8b5cf6', 'ec4899', '14b8a6'];
    $color = $colors[abs(crc32($username)) % count($colors)];
    
    $defaultAvatar = 'https://ui-avatars.com/api/?name=' . urlencode($username) . '&size=200&background=' . $color . '&color=ffffff&rounded=true&bold=true';
    
    // Nếu avatar trống hoặc là default
    if (empty($avatar) || $avatar === 'default-avatar.jpg' || $avatar === 'NULL') {
        return $defaultAvatar;
    }
    
    // Kiểm tra xem có phải URL đầy đủ không
    if (filter_var($avatar, FILTER_VALIDATE_URL)) {
        return $avatar;
    }
    
    // Nếu avatar có đường dẫn uploads/ ở đầu
    if (strpos($avatar, 'uploads/') === 0) {
        if (file_exists('../' . $avatar)) {
            return $avatar;
        } else {
            // File không tồn tại, trả về default
            return $defaultAvatar;
        }
    }
    
    // Thử path trực tiếp
    if (file_exists('../' . $avatar)) {
        return $avatar;
    }
    
    // Thử trong thư mục uploads/avatars
    $uploadsPath = 'uploads/avatars/' . basename($avatar);
    if (file_exists('../' . $uploadsPath)) {
        return $uploadsPath;
    }
    
    // Nếu không tìm thấy file nào, trả về default
    return $defaultAvatar;
}

// Lấy avatar theo user_id hoặc username
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $user_id = $_GET['user_id'] ?? null;
    $username = $_GET['username'] ?? null;
    
    if (!$user_id && !$username) {
        echo json_encode(['success' => false, 'message' => 'user_id hoặc username là bắt buộc']);
        exit;
    }
    
    try {
        $query = "SELECT id, username, avatar FROM users WHERE ";
        $params = [];
        
        if ($user_id) {
            $query .= "id = ?";
            $params[] = $user_id;
        } else {
            $query .= "username = ?";
            $params[] = $username;
        }
        
        $stmt = $pdo->prepare($query);
        $stmt->execute($params);
        $user = $stmt->fetch();
        
        if ($user) {
            $avatarUrl = getAvatarUrl($user['avatar'], $user['username']);
            echo json_encode([
                'success' => true,
                'user_id' => $user['id'],
                'username' => $user['username'],
                'avatar_url' => $avatarUrl
            ]);
        } else {
            // Nếu không tìm thấy user, vẫn trả về avatar mặc định theo tên
            if ($username) {
                $defaultAvatar = getAvatarUrl(null, $username);
                echo json_encode([
                    'success' => true,
                    'username' => $username,
                    'avatar_url' => $defaultAvatar,
                    'is_default' => true
                ]);
            } else {
                echo json_encode(['success' => false, 'message' => 'Không tìm thấy người dùng']);
            }
        }
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
    }
}
?> 