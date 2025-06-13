<?php
session_start();
require_once 'config/database.php';

// Function helper để xử lý avatar
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
    
    // Danh sách các đường dẫn có thể
    $possiblePaths = [
        $avatar,                                   // Đường dẫn gốc
        'uploads/avatars/' . basename($avatar),    // uploads trong thư mục hiện tại
        '../uploads/avatars/' . basename($avatar), // uploads trong thư mục gốc
        'html/uploads/avatars/' . basename($avatar), // Đường dẫn tương đối từ thư mục gốc
    ];
    
    // Kiểm tra từng đường dẫn
    foreach ($possiblePaths as $path) {
        if (file_exists($path)) {
            return $path;
        }
    }
    
    // Nếu không tìm thấy file nào, trả về default
    return $defaultAvatar;
}

// Kiểm tra đăng nhập
$is_logged_in = isset($_SESSION['user_id']);
$user_id = $_SESSION['user_id'] ?? null;
$username = $_SESSION['username'] ?? 'Khách';

// Tạo thư mục uploads/avatars nếu chưa tồn tại
$avatarDirs = ['uploads/avatars/', '../uploads/avatars/'];
foreach ($avatarDirs as $dir) {
    if (!is_dir($dir) && !mkdir($dir, 0777, true)) {
        error_log("Không thể tạo thư mục: " . $dir);
    }
}

// Lấy thông tin user mới nhất từ database thay vì session
$current_user_avatar = null;
if ($is_logged_in) {
    $stmt = $pdo->prepare("SELECT avatar, username FROM users WHERE id = ?");
    $stmt->execute([$user_id]);
    $current_user = $stmt->fetch();
    if ($current_user) {
        $current_user_avatar = $current_user['avatar'];
        $username = $current_user['username']; // Cập nhật username từ DB
    }
}

$user_avatar = getAvatarUrl($current_user_avatar ?? $_SESSION['avatar'] ?? null, $username);

// Debug thông tin avatar
$debug_avatar = false; // Set to true to enable debugging
if ($debug_avatar) {
    echo "<div style='position:fixed; bottom:0; right:0; background:#fff; padding:10px; border:1px solid #ccc; z-index:9999;'>";
    echo "<strong>Avatar Debug:</strong><br>";
    echo "Current avatar path: " . ($current_user_avatar ?? $_SESSION['avatar'] ?? 'null') . "<br>";
    echo "Resolved avatar URL: " . $user_avatar . "<br>";
    echo "</div>";
}

// Nếu chưa đăng nhập, chuyển hướng đến trang đăng nhập khi thực hiện hành động
if (!$is_logged_in && $_SERVER['REQUEST_METHOD'] === 'POST') {
    header('Location: login.php?redirect=' . urlencode($_SERVER['REQUEST_URI']));
    exit;
}

// Xử lý đăng bài mới - chỉ cho phép khi đã đăng nhập
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'create_post' && $is_logged_in) {
    $content = trim($_POST['content']);
    $post_type = $_POST['post_type'] ?? 'normal';
    $media_url = '';
    $media_type = null;
    
    if (!empty($content)) {
        // Xử lý upload media
        if (!empty($_FILES['media']['name'])) {
            // Đảm bảo thư mục uploads/community tồn tại cả ở thư mục gốc và thư mục html
            $upload_dirs = [
                'uploads/community/',
                '../uploads/community/' // thư mục gốc
            ];
            
            // Chọn thư mục upload chính
            $upload_dir = $upload_dirs[0]; // Mặc định dùng thư mục trong html
            
            foreach ($upload_dirs as $dir) {
                if (!is_dir($dir)) {
                    mkdir($dir, 0777, true);
                }
                // Nếu thư mục trong html không ghi được, dùng thư mục root
                if ($dir === $upload_dirs[0] && !is_writable($dir)) {
                    $upload_dir = $upload_dirs[1];
                }
            }
            
            $file_extension = pathinfo($_FILES['media']['name'], PATHINFO_EXTENSION);
            $new_filename = time() . '_' . uniqid() . '.' . $file_extension;
            $media_url = $upload_dir . $new_filename;
            
            if (move_uploaded_file($_FILES['media']['tmp_name'], $media_url)) {
                $media_type = (in_array($file_extension, ['mp4', 'avi', 'mov', 'wmv'])) ? 'video' : 'image';
                
                // Log thông tin upload thành công
                error_log("Upload media thành công: " . $media_url);
            } else {
                // Log lỗi upload
                error_log("Lỗi upload media: " . $_FILES['media']['error']);
            }
        }
        
        $stmt = $pdo->prepare("INSERT INTO community_posts (user_id, content, media_url, media_type, post_type) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([$user_id, $content, $media_url, $media_type, $post_type]);
        
        header('Location: community.php');
        exit;
    }
}

// Lấy danh sách bài viết với thông tin chi tiết
$like_check = $is_logged_in ? "AND user_id = $user_id" : "AND 1=0";
$posts = $pdo->query("
    SELECT p.*, u.username, u.avatar,
    (SELECT COUNT(*) FROM post_likes WHERE post_id = p.id) as likes_count,
    (SELECT COUNT(*) FROM post_comments WHERE post_id = p.id) as comments_count,
    (SELECT COUNT(*) FROM post_likes WHERE post_id = p.id $like_check) as user_liked
    FROM community_posts p 
    LEFT JOIN users u ON p.user_id = u.id 
    ORDER BY p.created_at DESC LIMIT 20
")->fetchAll();



// Lấy thống kê
$stats = $pdo->query("
    SELECT 
    (SELECT COUNT(*) FROM users) as total_users,
    (SELECT COUNT(*) FROM community_posts) as total_posts,
    (SELECT COUNT(*) FROM post_likes) as total_likes,
    (SELECT COUNT(*) FROM fundraising_campaigns WHERE status = 'active') as active_campaigns
")->fetch();

// Lấy danh sách nhóm chat mà user tham gia (thay thế campaigns)
$user_groups = [];
if ($is_logged_in) {
    $user_groups = $pdo->query("
        SELECT cg.*, cm.role, cm.last_seen, cm.joined_at,
               cp.content as event_content,
               u.username as creator_name,
               (SELECT COUNT(*) FROM chat_members WHERE group_id = cg.id) as member_count,
               (SELECT COUNT(*) FROM chat_messages WHERE group_id = cg.id AND created_at > cm.last_seen) as unread_count,
               (SELECT message FROM chat_messages WHERE group_id = cg.id ORDER BY created_at DESC LIMIT 1) as last_message,
               (SELECT created_at FROM chat_messages WHERE group_id = cg.id ORDER BY created_at DESC LIMIT 1) as last_message_time
        FROM chat_groups cg
        JOIN chat_members cm ON cg.id = cm.group_id
        LEFT JOIN community_posts cp ON cg.event_post_id = cp.id
        LEFT JOIN users u ON cg.created_by = u.id
        WHERE cm.user_id = $user_id AND cg.is_active = 1
        ORDER BY last_message_time DESC, cg.created_at DESC
        LIMIT 5
    ")->fetchAll();
}

// Lấy campaigns gây quỹ đang hoạt động
$campaigns = $pdo->query("
    SELECT c.*, u.username as creator_name,
    (c.current_amount / c.target_amount * 100) as progress_percent
    FROM fundraising_campaigns c
    LEFT JOIN users u ON c.created_by = u.id
    WHERE c.status = 'active' AND c.end_date >= CURDATE()
    ORDER BY c.created_at DESC LIMIT 3
")->fetchAll();
?>

<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cộng Đồng - Vì Một Xã Hội Khỏe Mạnh</title>
    <link rel="stylesheet" href="../css/gambling_casino.css">
    <link rel="stylesheet" href="css/community-components.css">
    <link rel="stylesheet" href="css/community-fixed-layout.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    
    <style>
        /* ========================================
           THIẾT KẾ COMMUNITY - GIAO DIỆN MỚI HIỆN ĐẠI
           ======================================== */
        
        :root {
            /* Màu sắc chính - palette ấm áp và gần gũi */
            --primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            --accent-color: #6366f1;
            --accent-light: #a5b4fc;
            --success-color: #10b981;
            --success-light: #6ee7b7;
            --warning-color: #f59e0b;
            --warning-light: #fbbf24;
            --danger-color: #ef4444;
            --danger-light: #f87171;
            --text-primary: #1f2937;
            --text-secondary: #6b7280;
            --text-muted: #9ca3af;
            --bg-primary: #f8fafc;
            --bg-secondary: #ffffff;
            --bg-soft: #f1f5f9;
            --bg-hover: #f3f4f6;
            --border-color: #e2e8f0;
            --border-light: #f1f5f9;
            --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
            --shadow-soft: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            --shadow-medium: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
            --shadow-large: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
            --border-radius: 16px;
            --border-radius-sm: 8px;
            --border-radius-lg: 24px;
        }

        /* Animation keyframes */
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        @keyframes slideInRight {
            from {
                opacity: 0;
                transform: translateX(30px);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }

        @keyframes pulse {
            0%, 100% {
                transform: scale(1);
            }
            50% {
                transform: scale(1.05);
            }
        }

        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
        }

        /* Body và layout chính */
        body {
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: var(--text-primary);
            margin: 0;
            padding: 0;
        }

        /* Container chính - sử dụng grid layout từ CSS components */
        .community-container {
            /* Sử dụng grid layout từ community-components.css */
            /* Không override ở đây để tránh conflict */
        }

        /* Header cộng đồng - thiết kế mới với glassmorphism */
        .community-hero {
            grid-column: 1 / -1;
            background: linear-gradient(135deg, rgba(99, 102, 241, 0.9), rgba(139, 92, 246, 0.9));
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: var(--border-radius-lg);
            padding: 48px;
            text-align: center;
            color: white;
            margin-bottom: 32px;
            position: relative;
            overflow: hidden;
            box-shadow: var(--shadow-large);
            animation: fadeInUp 0.8s ease;
        }

        .community-hero::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
            animation: pulse 4s ease-in-out infinite;
        }

        .community-hero h1 {
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 16px;
            position: relative;
            z-index: 1;
        }

        .community-hero p {
            font-size: 1.2rem;
            opacity: 0.9;
            position: relative;
            z-index: 1;
        }

        /* Sidebar styling được định nghĩa trong community-components.css */

        /* Card styling được định nghĩa trong community-components.css */

        /* Chat group items - thiết kế mới */
        .chat-group-item {
            padding: 16px;
            border: 1px solid var(--border-color);
            border-radius: var(--border-radius-sm);
            margin-bottom: 12px;
            cursor: pointer;
            transition: all 0.3s ease;
            position: relative;
            background: var(--bg-soft);
        }

        .chat-group-item:hover {
            background: var(--bg-hover);
            transform: translateX(4px);
            box-shadow: var(--shadow-soft);
        }

        .chat-group-item.has-unread {
            border-left: 4px solid var(--accent-color);
            background: rgba(99, 102, 241, 0.05);
        }

        .chat-group-item .group-name {
            font-weight: 600;
            font-size: 0.95rem;
            margin-bottom: 4px;
            color: var(--text-primary);
        }

        .chat-group-item .last-message {
            font-size: 0.8rem;
            color: var(--text-secondary);
            margin-bottom: 8px;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
        }

        .chat-group-item .group-info {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 0.75rem;
            color: var(--text-muted);
        }

        .unread-badge {
            background: linear-gradient(135deg, var(--accent-color), var(--accent-light));
            color: white;
            border-radius: 12px;
            padding: 4px 8px;
            font-size: 0.7rem;
            font-weight: 600;
            min-width: 20px;
            text-align: center;
            box-shadow: var(--shadow-sm);
            animation: pulse 2s infinite;
        }

        /* Buttons - thiết kế mới hiện đại */
        .event-join-btn, .create-group-btn {
            background: linear-gradient(135deg, var(--accent-color), var(--accent-light));
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: var(--border-radius-sm);
            cursor: pointer;
            font-weight: 600;
            font-size: 0.85rem;
            transition: all 0.3s ease;
            box-shadow: var(--shadow-sm);
            position: relative;
            overflow: hidden;
        }

        .event-join-btn::before, .create-group-btn::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
            transition: left 0.5s;
        }

        .event-join-btn:hover::before, .create-group-btn:hover::before {
            left: 100%;
        }

        .event-join-btn:hover, .create-group-btn:hover {
            transform: translateY(-2px);
            box-shadow: var(--shadow-medium);
        }

        .event-join-btn.joined {
            background: linear-gradient(135deg, var(--success-color), var(--success-light));
        }

        .create-group-btn {
            background: linear-gradient(135deg, var(--warning-color), var(--warning-light));
            margin-left: 8px;
            padding: 8px 16px;
        }

        /* Stat items - thiết kế mới */
        .stat-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 16px 0;
            border-bottom: 1px solid var(--border-light);
            transition: all 0.3s ease;
        }

        .stat-item:last-child {
            border-bottom: none;
        }

        .stat-item:hover {
            background: var(--bg-soft);
            margin: 0 -24px;
            padding: 16px 24px;
            border-radius: var(--border-radius-sm);
        }

        .stat-item span {
            display: flex;
            align-items: center;
            gap: 8px;
            color: var(--text-secondary);
        }

        .stat-item strong {
            color: var(--accent-color);
            font-size: 1.3rem;
            font-weight: 700;
        }

        .stat-item i {
            color: var(--accent-color);
            width: 20px;
        }

        /* Progress bar - thiết kế mới */
        .progress-bar {
            background: var(--border-light);
            height: 8px;
            border-radius: 4px;
            overflow: hidden;
            margin: 12px 0;
            position: relative;
        }

        .progress-fill {
            background: linear-gradient(90deg, var(--success-color), var(--success-light));
            height: 100%;
            transition: width 0.8s ease;
            position: relative;
        }

        .progress-fill::after {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
            animation: shimmer 2s infinite;
        }

        @keyframes shimmer {
            0% { left: -100%; }
            100% { left: 100%; }
        }

        /* CSS cho comments system - style Facebook đơn giản */
        .comment-item {
            /* Không có transition để tăng performance */
        }

        .comment-like-btn:hover, 
        .comment-reply-btn:hover,
        .comment-edit-btn:hover {
            color: #1877f2 !important;
        }

        .comment-delete-btn:hover {
            color: #e41e3f !important;
        }

        /* Loại bỏ animations để tăng performance */

        /* Main feed styling được định nghĩa trong community-components.css */

        /* Post creator styling được định nghĩa trong community-components.css */

        /* Post input styling được định nghĩa trong community-components.css */

        /* Post cards - thiết kế mới hiện đại */
        .post-card {
            background: var(--bg-secondary);
            border-radius: var(--border-radius);
            box-shadow: var(--shadow-soft);
            overflow: hidden;
            transition: all 0.3s ease;
            position: relative;
            border: 1px solid var(--border-light);
        }

        .post-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 2px;
            background: linear-gradient(90deg, transparent, var(--accent-color), transparent);
            opacity: 0;
            transition: opacity 0.3s ease;
        }

        .post-card:hover {
            transform: translateY(-4px);
            box-shadow: var(--shadow-medium);
        }

        .post-card:hover::before {
            opacity: 1;
        }

        /* Post header */
        .post-header {
            padding: 20px 24px;
            display: flex;
            align-items: center;
            gap: 12px;
            position: relative;
        }

        /* Avatar styling - thiết kế mới với hiệu ứng */
        .user-avatar, .user-avatar-small, .user-avatar-large {
            border-radius: 50%;
            object-fit: cover;
            border: 3px solid transparent;
            background: linear-gradient(var(--bg-secondary), var(--bg-secondary)) padding-box,
                        linear-gradient(135deg, var(--accent-color), var(--success-color)) border-box;
            transition: all 0.3s ease;
            cursor: pointer;
            position: relative;
            overflow: hidden;
        }

        .user-avatar {
            width: 48px;
            height: 48px;
        }

        .user-avatar-small {
            width: 32px;
            height: 32px;
            border-width: 2px;
        }

        .user-avatar-large {
            width: 60px;
            height: 60px;
        }

        .user-avatar::after, .user-avatar-small::after, .user-avatar-large::after {
            content: '';
            position: absolute;
            top: -2px;
            left: -2px;
            right: -2px;
            bottom: -2px;
            background: linear-gradient(135deg, var(--accent-color), var(--success-color));
            border-radius: 50%;
            z-index: -1;
            opacity: 0;
            transition: opacity 0.3s ease;
        }

        .user-avatar:hover, .user-avatar-small:hover, .user-avatar-large:hover {
            transform: scale(1.1);
            box-shadow: 0 8px 25px rgba(99, 102, 241, 0.3);
        }

        .user-avatar:hover::after, .user-avatar-small:hover::after, .user-avatar-large:hover::after {
            opacity: 1;
        }

        /* Post media */
        .post-media {
            width: 100%;
            max-height: 500px;
            object-fit: cover;
            border-radius: var(--border-radius-sm);
            transition: transform 0.3s ease;
        }

        .post-media:hover {
            transform: scale(1.02);
        }

        /* Post actions - thiết kế mới */
        .post-actions {
            padding: 16px 24px;
            display: flex;
            justify-content: space-between;
            border-top: 1px solid var(--border-light);
            background: var(--bg-soft);
        }

        .action-btn {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 10px 16px;
            border: none;
            background: transparent;
            border-radius: var(--border-radius-sm);
            cursor: pointer;
            transition: all 0.3s ease;
            font-weight: 500;
            color: var(--text-secondary);
            position: relative;
            overflow: hidden;
        }

        .action-btn::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.1), transparent);
            transition: left 0.5s;
        }

        .action-btn:hover::before {
            left: 100%;
        }

        .action-btn:hover {
            background: var(--bg-hover);
            color: var(--accent-color);
            transform: translateY(-2px);
        }

        .action-btn.liked {
            color: var(--danger-color);
            background: rgba(239, 68, 68, 0.1);
        }

        .action-btn.liked:hover {
            background: rgba(239, 68, 68, 0.2);
            transform: scale(1.05);
        }

        .action-btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            pointer-events: none;
        }

        .action-btn {
            transition: all 0.2s ease;
            position: relative;
            overflow: hidden;
        }

        .action-btn i {
            transition: all 0.2s ease;
        }

        .action-btn.liked i {
            color: #ef4444 !important;
            animation: heartBeat 0.3s ease;
        }

        @keyframes heartBeat {
            0% { transform: scale(1); }
            50% { transform: scale(1.2); }
            100% { transform: scale(1); }
        }

        /* Comments section - thiết kế mới */
        .comments-section {
            border-top: 1px solid var(--border-light);
            background: var(--bg-soft);
        }

        .comment-form {
            display: flex;
            gap: 12px;
            margin-bottom: 16px;
            padding: 16px 24px 0;
        }

        .comment-form input {
            flex: 1;
            padding: 12px 16px;
            border: 1px solid var(--border-color);
            border-radius: 20px;
            outline: none;
            transition: all 0.3s ease;
            background: var(--bg-secondary);
        }

        .comment-form input:focus {
            border-color: var(--accent-color);
            box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }

        .comments-list {
            padding: 0 24px 16px;
        }

        /* Comment items - thiết kế mới */
        .comment-item {
            margin-bottom: 16px;
            /* Loại bỏ animation để tăng performance */
        }

        .comment-item > div:first-child {
            display: flex;
            gap: 12px;
        }

        .comment-item .comment-content {
            flex: 1;
            background: var(--bg-secondary);
            padding: 12px 16px;
            border-radius: var(--border-radius-sm);
            border-left: 3px solid var(--accent-color);
            position: relative;
        }

        .comment-item .comment-content::before {
            content: '';
            position: absolute;
            top: 12px;
            left: -8px;
            width: 0;
            height: 0;
            border-top: 8px solid transparent;
            border-bottom: 8px solid transparent;
            border-right: 8px solid var(--bg-secondary);
        }

        /* Chat Modal - thiết kế mới hiện đại */
        .chat-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.6);
            backdrop-filter: blur(10px);
            z-index: 1000;
            display: none;
            align-items: center;
            justify-content: center;
        }

        .chat-container {
            background: var(--bg-secondary);
            border-radius: var(--border-radius);
            width: 90%;
            max-width: 800px;
            height: 80%;
            max-height: 600px;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            box-shadow: var(--shadow-large);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .chat-header {
            background: linear-gradient(135deg, var(--accent-color), var(--accent-light));
            color: white;
            padding: 16px 20px;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        .chat-messages {
            flex: 1;
            padding: 16px;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            gap: 12px;
            background: var(--bg-soft);
        }

        .message-item {
            display: flex;
            gap: 12px;
            align-items: flex-start;
            animation: fadeInUp 0.3s ease;
        }

        .message-item.own {
            flex-direction: row-reverse;
        }

        .message-item.system {
            justify-content: center;
        }

        .message-bubble {
            max-width: 70%;
            padding: 12px 16px;
            border-radius: 18px;
            word-wrap: break-word;
            position: relative;
            box-shadow: var(--shadow-sm);
        }

        .message-item.own .message-bubble {
            background: linear-gradient(135deg, var(--accent-color), var(--accent-light));
            color: white;
        }

        .message-item:not(.own) .message-bubble {
            background: var(--bg-secondary);
            color: var(--text-primary);
            border: 1px solid var(--border-light);
        }

        .message-item.system .message-bubble {
            background: var(--bg-hover);
            color: var(--text-secondary);
            font-style: italic;
            font-size: 0.85rem;
        }

        .chat-input-area {
            padding: 16px;
            border-top: 1px solid var(--border-light);
            display: flex;
            gap: 12px;
            align-items: center;
            background: var(--bg-secondary);
        }

        .chat-input {
            flex: 1;
            padding: 12px 16px;
            border: 1px solid var(--border-color);
            border-radius: 24px;
            outline: none;
            font-size: 14px;
            transition: all 0.3s ease;
        }

        .chat-input:focus {
            border-color: var(--accent-color);
            box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }

        .chat-send-btn {
            background: linear-gradient(135deg, var(--accent-color), var(--accent-light));
            color: white;
            border: none;
            width: 44px;
            height: 44px;
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
            box-shadow: var(--shadow-sm);
        }

        .chat-send-btn:hover {
            transform: scale(1.1);
            box-shadow: var(--shadow-medium);
        }

        /* Responsive Design - cải thiện cho mobile */
        @media (max-width: 1200px) {
            .left-sidebar {
                left: 10px; /* Giảm khoảng cách cho màn hình nhỏ */
                width: 280px;
            }
            
            .right-sidebar {
                right: 10px;
                width: 280px;
            }
            
            .community-container {
                max-width: 600px; /* Giảm chiều rộng main content */
            }
        }

        @media (max-width: 1024px) {
            /* Ẩn sidebar trên tablet và mobile */
            .left-sidebar, .right-sidebar {
                display: none !important;
            }
            
            .community-container {
                max-width: 100%;
                margin-top: 80px;
                padding: 0 16px;
            }

            .chat-container {
                width: 95%;
                height: 90%;
            }
        }

        @media (max-width: 768px) {
            .community-container {
                padding: 0 16px;
            }

            .community-hero {
                padding: 32px 20px;
            }

            .community-hero h1 {
                font-size: 2rem;
            }

            .community-hero p {
                font-size: 1rem;
            }

            .post-creator, .post-card {
                margin: 0 -4px;
            }

            .chat-container {
                width: 100%;
                height: 100%;
                border-radius: 0;
            }

            .message-bubble {
                max-width: 85%;
            }
        }

        /* Hiệu ứng đặc biệt cho tương tác */
        .interactive-element {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .interactive-element:hover {
            transform: translateY(-2px);
        }

        .interactive-element:active {
            transform: scale(0.98);
        }

        /* Loading states */
        .loading-skeleton {
            background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
            background-size: 200% 100%;
            animation: loading 1.5s infinite;
        }

        @keyframes loading {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
        }

        /* Notification styles */
        .notification {
            position: fixed;
            top: 80px;
            right: 20px;
            z-index: 1001;
            padding: 16px 24px;
            border-radius: var(--border-radius-sm);
            color: white;
            font-weight: 500;
            box-shadow: var(--shadow-medium);
            transform: translateX(100%);
            transition: transform 0.3s ease;
            max-width: 400px;
        }

        .notification.show {
            transform: translateX(0);
        }

        .notification.success {
            background: linear-gradient(135deg, var(--success-color), var(--success-light));
        }

        .notification.error {
            background: linear-gradient(135deg, var(--danger-color), var(--danger-light));
        }

        .notification.info {
            background: linear-gradient(135deg, var(--accent-color), var(--accent-light));
        }

        /* Floating action button */
        .fab {
            position: fixed;
            bottom: 24px;
            right: 24px;
            width: 56px;
            height: 56px;
            border-radius: 50%;
            background: linear-gradient(135deg, var(--accent-color), var(--accent-light));
            color: white;
            border: none;
            cursor: pointer;
            box-shadow: var(--shadow-large);
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
            z-index: 999;
        }

        .fab:hover {
            transform: scale(1.1);
            box-shadow: 0 8px 25px rgba(99, 102, 241, 0.4);
        }

        /* Custom scrollbar */
        ::-webkit-scrollbar {
            width: 8px;
        }

        ::-webkit-scrollbar-track {
            background: var(--bg-soft);
            border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb {
            background: linear-gradient(135deg, var(--accent-color), var(--accent-light));
            border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
            background: var(--accent-color);
        }

        /* Improved focus states */
        button:focus-visible, input:focus-visible, textarea:focus-visible {
            outline: 2px solid var(--accent-color);
            outline-offset: 2px;
        }

        /* Better accessibility */
        @media (prefers-reduced-motion: reduce) {
            *, *::before, *::after {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
            }
        }

        /* Dark mode support preparation */
        @media (prefers-color-scheme: dark) {
            :root {
                --text-primary: #f9fafb;
                --text-secondary: #d1d5db;
                --text-muted: #9ca3af;
                --bg-primary: #111827;
                --bg-secondary: #1f2937;
                --bg-soft: #374151;
                --bg-hover: #4b5563;
                --border-color: #374151;
                --border-light: #4b5563;
            }
        }

        /* ========================================
           THIẾT KẾ HEADER - PHONG CÁCH MỚI HIỆN ĐẠI
           ======================================== */
        
        /* Biến CSS cho header - phù hợp với theme mới */
        :root {
            --header-bg-primary: linear-gradient(135deg, rgba(99, 102, 241, 0.95), rgba(139, 92, 246, 0.9));
            --header-glow: 0 0 20px rgba(99, 102, 241, 0.5);
            --header-text: #ffffff;
            --header-accent: #10b981;
            --header-highlight: #6366f1;
            --header-border: rgba(255, 255, 255, 0.1);
            --header-hover: rgba(255, 255, 255, 0.15);
            --header-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        }

        /* Header chính - cố định với glassmorphism */
        #main-header {
            background: var(--header-bg-primary);
            backdrop-filter: blur(20px);
            box-shadow: var(--header-shadow);
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            z-index: 1000;
            border-bottom: 1px solid var(--header-border);
            padding: 0;
            transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        /* Header khi cuộn xuống */
        #main-header.scrolled {
            padding: 0;
            background: linear-gradient(135deg, rgba(99, 102, 241, 0.98), rgba(139, 92, 246, 0.95));
            box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
        }
        
        /* Container chính của navbar */
        .navbar-container {
            max-width: 1400px;
            margin: 0 auto;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0.6rem 2rem;
            position: relative;
        }
        
        /* Logo với hiệu ứng mới */
        .navbar-logo {
            position: relative;
            font-weight: 700;
            font-size: 1.4rem;
            text-decoration: none;
            color: var(--header-text);
            display: flex;
            align-items: center;
            gap: 0.5rem;
            overflow: visible;
            background: rgba(255, 255, 255, 0.1);
            padding: 0.5rem 1.2rem;
            border-radius: 60px;
            border: 1px solid rgba(255, 255, 255, 0.15);
            transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        .navbar-logo:hover {
            background: rgba(255, 255, 255, 0.2);
            transform: translateY(-2px);
            box-shadow: var(--header-glow);
        }
        
        /* Icon wrapper với gradient mới */
        .navbar-logo .logo-icon-wrapper {
            position: relative;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            background: linear-gradient(135deg, var(--header-highlight), var(--header-accent));
            overflow: hidden;
        }
        
        .navbar-logo .logo-icon-wrapper::before {
            content: '';
            position: absolute;
            inset: -10px;
            background: conic-gradient(from 0deg, transparent, rgba(255, 255, 255, 0.4), transparent);
            animation: rotate-hue 3s linear infinite;
        }
        
        @keyframes rotate-hue {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        .navbar-logo .logo-icon-wrapper::after {
            content: '';
            position: absolute;
            inset: 2px;
            background: linear-gradient(135deg, var(--header-highlight), var(--header-accent));
            border-radius: 50%;
            z-index: 1;
        }
        
        .navbar-logo i {
            position: relative;
            font-size: 1.5rem;
            color: #ffffff;
            z-index: 2;
            filter: drop-shadow(0 0 5px rgba(255, 255, 255, 0.5));
            animation: pulse-bright 2s infinite alternate;
        }
        
        @keyframes pulse-bright {
            0% { filter: drop-shadow(0 0 5px rgba(255, 255, 255, 0.5)); }
            100% { filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.8)); }
        }
        
        .navbar-logo .logo-text {
            position: relative;
            display: inline-block;
            background: linear-gradient(to right, #ffffff, #a5b4fc);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        
        .navbar-logo .logo-text .highlight {
            color: var(--header-accent);
            -webkit-text-fill-color: initial;
            position: relative;
            display: inline-block;
        }
        
        .navbar-logo .logo-text .highlight::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 4px;
            background: var(--header-accent);
            border-radius: 2px;
            transform: scaleX(0);
            transform-origin: right;
            transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        .navbar-logo:hover .logo-text .highlight::after {
            transform: scaleX(1);
            transform-origin: left;
        }
        
        .navbar-links-container {
            display: flex;
            align-items: center;
            gap: 1.5rem;
        }
        
        .navbar-links {
            display: flex;
            list-style: none;
            margin: 0;
            padding: 0;
            gap: 0.2rem;
        }
        
        .navbar-link {
            position: relative;
            margin: 0;
            transition: all 0.3s ease;
        }
        
        .navbar-link a {
            display: block;
            color: var(--header-text);
            text-decoration: none;
            font-weight: 600;
            font-size: 0.95rem;
            padding: 0.7rem 1rem;
            border-radius: 12px;
            transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
            position: relative;
            z-index: 1;
            letter-spacing: 0.2px;
        }
        
        .navbar-link a::before {
            content: '';
            position: absolute;
            inset: 0;
            background: linear-gradient(135deg, var(--header-accent), var(--header-highlight));
            border-radius: 12px;
            opacity: 0;
            z-index: -1;
            transition: opacity 0.4s ease;
        }
        
        .navbar-link a:hover::before,
        .navbar-link a.active::before {
            opacity: 1;
        }
        
        .navbar-link a::after {
            content: '';
            position: absolute;
            bottom: 0.4rem;
            left: 1rem;
            right: 1rem;
            height: 2px;
            background: #ffffff;
            transform: scaleX(0);
            transform-origin: right;
            transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
            border-radius: 1px;
        }
        
        .navbar-link a:hover::after,
        .navbar-link a.active::after {
            transform: scaleX(1);
            transform-origin: left;
        }
        
        .navbar-link a:hover,
        .navbar-link a.active {
            color: #ffffff;
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
        }
        
        .navbar-toggle {
            display: none;
            background: linear-gradient(135deg, var(--header-highlight), var(--header-accent));
            color: #ffffff;
            border: none;
            width: 45px;
            height: 45px;
            border-radius: 50%;
            cursor: pointer;
            font-size: 1.2rem;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
            transition: all 0.3s ease;
            position: relative;
            z-index: 100;
        }
        
        .navbar-toggle:hover {
            transform: scale(1.05);
            box-shadow: 0 5px 20px rgba(0, 0, 0, 0.25);
        }
        
        .theme-toggle {
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            color: #ffffff;
            cursor: pointer;
            width: 42px;
            height: 42px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.1rem;
            transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
            position: relative;
            overflow: hidden;
        }
        
        .theme-toggle::before {
            content: '';
            position: absolute;
            inset: 0;
            background: radial-gradient(circle, var(--header-accent), var(--header-highlight));
            opacity: 0;
            transition: opacity 0.4s ease;
        }
        
        .theme-toggle:hover {
            transform: rotate(15deg) scale(1.1);
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
            border-color: rgba(255, 255, 255, 0.3);
        }
        
        .theme-toggle:hover::before {
            opacity: 1;
        }
        
        .theme-toggle i {
            z-index: 1;
        }
        
        .auth-buttons {
            display: flex;
            gap: 0.5rem;
        }
        
        .login-btn {
            padding: 0.6rem 1.2rem;
            background: transparent;
            border: 1px solid rgba(255, 255, 255, 0.2);
            color: #ffffff;
            border-radius: 50px;
            font-weight: 600;
            font-size: 0.9rem;
            cursor: pointer;
            transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
            display: flex;
            align-items: center;
            gap: 0.5rem;
            text-decoration: none;
        }
        
        .login-btn:hover {
            background: rgba(255, 255, 255, 0.1);
            transform: translateY(-2px);
            box-shadow: var(--header-glow);
        }
        
        .navbar-dropdown {
            position: absolute;
            top: 100%;
            left: 0;
            width: 220px;
            background: linear-gradient(135deg, rgba(99, 102, 241, 0.98), rgba(139, 92, 246, 0.95));
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
            padding: 1rem;
            opacity: 0;
            visibility: hidden;
            transform: translateY(10px);
            transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
            z-index: 100;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.05);
            margin-top: 0.5rem;
        }
        
        .navbar-link:hover .navbar-dropdown {
            opacity: 1;
            visibility: visible;
            transform: translateY(0);
        }
        
        .dropdown-item {
            display: block;
            color: #ffffff;
            text-decoration: none;
            padding: 0.8rem 1rem;
            border-radius: 8px;
            transition: all 0.3s ease;
            font-weight: 500;
            position: relative;
            border-left: 2px solid transparent;
        }
        
        .dropdown-item:hover {
            background: rgba(255, 255, 255, 0.1);
            padding-left: 1.5rem;
            border-left: 2px solid var(--header-accent);
        }
        
        .dropdown-item i {
            margin-right: 0.8rem;
            color: var(--header-accent);
            transition: all 0.3s ease;
        }
        
        .dropdown-item:hover i {
            transform: scale(1.2);
        }
        
        /* Header shimmer effect */
        .header-shimmer {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 1px;
            background: linear-gradient(90deg, 
                transparent, 
                rgba(255,255,255,0.3), 
                rgba(255,255,255,0.6), 
                rgba(255,255,255,0.3), 
                transparent);
            animation: shimmer 3s infinite linear;
        }
        
        @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
        }
        
        /* Responsive cho header */
        @media (max-width: 1200px) {
            .navbar-container {
                padding: 0.6rem 1rem;
            }
            
            .navbar-link a {
                padding: 0.7rem 0.8rem;
            }
        }
        
        @media (max-width: 992px) {
            .navbar-logo .logo-text span:not(.highlight) {
                display: none;
            }
            
            .navbar-toggle {
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .navbar-links-container {
                position: fixed;
                top: 0;
                right: -100%;
                height: 100vh;
                width: 280px;
                background: linear-gradient(135deg, rgba(99, 102, 241, 0.98), rgba(139, 92, 246, 0.95));
                box-shadow: -5px 0 30px rgba(0, 0, 0, 0.3);
                flex-direction: column;
                justify-content: flex-start;
                align-items: flex-start;
                padding: 5rem 1.5rem 2rem;
                gap: 1rem;
                transition: right 0.5s cubic-bezier(0.16, 1, 0.3, 1);
                z-index: 99;
                overflow-y: auto;
            }
            
            .navbar-links-container.active {
                right: 0;
            }
            
            .navbar-links {
                flex-direction: column;
                width: 100%;
                gap: 0.5rem;
            }
            
            .navbar-link {
                width: 100%;
            }
            
            .navbar-link a {
                padding: 0.9rem 1rem;
                border-radius: 8px;
                width: 100%;
            }
            
            .navbar-dropdown {
                position: static;
                width: 100%;
                box-shadow: none;
                margin-top: 0.5rem;
                background: rgba(0, 0, 0, 0.2);
            }
            
            .navbar-link:hover .navbar-dropdown {
                display: none;
            }
            
            .navbar-link.active .navbar-dropdown {
                display: block;
            }
            
            .auth-buttons {
                width: 100%;
                flex-direction: column;
            }
            
            .login-btn {
                width: 100%;
                justify-content: center;
            }
        }
        
        @media (max-width: 576px) {
            .navbar-logo {
                font-size: 1.2rem;
                padding: 0.4rem 1rem;
            }
            
            .navbar-logo .logo-icon-wrapper {
                width: 36px;
                height: 36px;
            }
            
            .navbar-logo i {
                font-size: 1.3rem;
            }
        }

        /* Dark mode support preparation */
        @media (prefers-color-scheme: dark) {
            :root {
                --text-primary: #f9fafb;
                --text-secondary: #d1d5db;
                --text-muted: #9ca3af;
                --bg-primary: #111827;
                --bg-secondary: #1f2937;
                --bg-soft: #374151;
                --bg-hover: #4b5563;
                --border-color: #374151;
                --border-light: #4b5563;
            }
        }

        /* ========================================
           LAYOUT FACEBOOK-STYLE: FIXED SIDEBARS + SCROLLABLE CENTER
           ======================================== */

        /* Đảm bảo body và html hỗ trợ layout mới */
        html {
            scroll-behavior: smooth;
            height: 100%;
            overflow-x: hidden;
        }

        body {
            margin: 0;
            padding: 0;
            overflow-x: hidden;
            position: relative;
        }

        /* Container chính - layout cố định */
        .community-container {
            position: relative;
            width: 100%;
            max-width: none;
            margin: 0;
            padding: 0;
            min-height: 100vh;
        }

        /* Hero section - full width */
        .community-hero {
            width: 100%;
            max-width: 1400px;
            margin: 100px auto 32px;
            padding: 48px 20px;
        }

        /* Main layout container - Fixed layout */
        .main-layout {
            position: relative;
            width: 100%;
            max-width: 1400px;
            margin: 0 auto;
            padding: 0 20px;
            display: flex;
            gap: 24px;
            align-items: flex-start;
            min-height: calc(100vh - 200px);
        }

        /* Left Sidebar - FIXED positioning */
        .left-sidebar {
            position: fixed;
            left: calc((100vw - 1400px) / 2 + 20px);
            top: 100px;
            width: 300px;
            height: calc(100vh - 100px);
            overflow-y: auto;
            overflow-x: hidden;
            z-index: 10;
            background: var(--bg-primary);
            padding-right: 8px;
            /* Smooth scrolling */
            scroll-behavior: smooth;
            scrollbar-width: thin;
        }

        /* Main Feed - Scrollable content với margin để tránh sidebar */
        .main-feed {
            flex: 1;
            max-width: 600px;
            margin: 0 auto;
            position: relative;
            z-index: 1;
        }

        /* Right Sidebar - FIXED positioning */
        .right-sidebar {
            position: fixed;
            right: calc((100vw - 1400px) / 2 + 20px);
            top: 100px;
            width: 300px;
            height: calc(100vh - 100px);
            overflow-y: auto;
            overflow-x: hidden;
            z-index: 10;
            background: var(--bg-primary);
            padding-left: 8px;
            /* Smooth scrolling */
            scroll-behavior: smooth;
            scrollbar-width: thin;
        }

        /* Styling cho sidebar scrollbar */
        .left-sidebar::-webkit-scrollbar,
        .right-sidebar::-webkit-scrollbar {
            width: 6px;
        }

        .left-sidebar::-webkit-scrollbar-track,
        .right-sidebar::-webkit-scrollbar-track {
            background: var(--bg-soft);
            border-radius: 3px;
        }

        .left-sidebar::-webkit-scrollbar-thumb,
        .right-sidebar::-webkit-scrollbar-thumb {
            background: var(--border-color);
            border-radius: 3px;
        }

        .left-sidebar::-webkit-scrollbar-thumb:hover,
        .right-sidebar::-webkit-scrollbar-thumb:hover {
            background: var(--accent-color);
        }

        /* Cards trong sidebar */
        .stats-card, .fundraising-card, .chat-groups-card, .trending-card, .search-card {
            position: relative;
            margin-bottom: 24px;
        }

        /* Responsive Design cho Fixed Layout */
        @media (max-width: 1440px) {
            .left-sidebar {
                left: 20px;
            }
            
            .right-sidebar {
                right: 20px;
            }
            
            .main-layout {
                max-width: calc(100vw - 680px); /* Trừ đi width của 2 sidebar + gap */
                margin-left: 340px; /* Width sidebar + gap */
                margin-right: 340px;
            }
        }

        @media (max-width: 1200px) {
            .left-sidebar, .right-sidebar {
                width: 280px;
            }
            
            .left-sidebar {
                left: 10px;
            }
            
            .right-sidebar {
                right: 10px;
            }
            
            .main-layout {
                max-width: calc(100vw - 600px);
                margin-left: 300px;
                margin-right: 300px;
            }
        }

        @media (max-width: 1024px) {
            /* Ẩn sidebar trên tablet và mobile */
            .left-sidebar, .right-sidebar {
                display: none !important;
            }
            
            .main-layout {
                max-width: 100%;
                margin: 0 auto;
                padding: 0 20px;
            }
            
            .main-feed {
                max-width: 100%;
            }
            
            .community-hero {
                margin-top: 80px;
            }
        }

        @media (max-width: 768px) {
            .main-layout {
                padding: 0 16px;
            }

            .community-hero {
                padding: 32px 16px;
                margin-top: 80px;
            }
        }

        @media (max-width: 480px) {
            .main-layout {
                padding: 0 12px;
            }

            .community-hero {
                padding: 24px 12px;
            }
        }

        /* Đảm bảo z-index hierarchy đúng */
        .community-hero {
            z-index: 1;
        }

        .main-feed {
            z-index: 2;
        }

        .left-sidebar, .right-sidebar {
            z-index: 5;
        }

        #main-header {
            z-index: 1000; /* Header luôn ở trên cùng */
        }

        /* Đảm bảo sidebar luôn hiển thị trên desktop */
        .left-sidebar, .right-sidebar {
            visibility: visible;
            opacity: 1;
        }

        /* Smooth transitions cho layout */
        .main-layout, .left-sidebar, .right-sidebar, .main-feed {
            transition: all 0.3s ease;
        }

        /* Override CSS từ community-components.css để đảm bảo fixed layout */
        .community-container {
            display: block !important;
            grid-template-columns: none !important;
            grid-template-areas: none !important;
            gap: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
        }

        .left-sidebar, .right-sidebar {
            position: fixed !important;
            top: 100px !important;
            height: calc(100vh - 100px) !important;
            grid-area: unset !important;
        }

        .main-feed {
            grid-area: unset !important;
        }

        .community-hero {
            grid-area: unset !important;
        }
    </style>
</head>

<body>
      <!-- Navbar giống hệt index.html -->
      <header class="navbar" id="main-header">
        <!-- Hiệu ứng shimmer cho header -->
        <div class="header-shimmer"></div>
        
        <!-- Container chính của navbar -->
        <div class="navbar-container">
            <!-- Logo với hiệu ứng animation -->
            <a href="index.html" class="navbar-logo">
                <div class="logo-icon-wrapper">
                    <i class="fas fa-shield-heart"></i>
                </div>
                <span class="logo-text">Vì <span class="highlight">Cộng Đồng</span> Khỏe Mạnh</span>
            </a>
            
            <!-- Nút toggle cho mobile -->
            <button class="navbar-toggle" id="navbar-toggle" aria-label="Mở menu điều hướng">
                <i class="fas fa-bars"></i>
            </button>
            
            <!-- Container chứa links và buttons -->
            <div class="navbar-links-container">
                <!-- Danh sách menu chính -->
                <ul class="navbar-links">
                    <li class="navbar-link"><a href="index.html" class="active">Trang Chủ</a></li>
                    
                    <!-- Menu Thông Tin với dropdown -->
                    <li class="navbar-link">
                        <a href="#" class="info-menu-toggle">Thông Tin <i class="fas fa-chevron-down" style="font-size: 0.7rem; margin-left: 5px;"></i></a>
                        <div class="navbar-dropdown">
                            <a href="#" class="dropdown-item" id="drugs-info-link"><i class="fas fa-pills"></i> Ma Túy</a>
                            <a href="#" class="dropdown-item" id="gambling-info-link"><i class="fas fa-dice"></i> Cờ Bạc</a>
                            <a href="#" class="dropdown-item" id="prostitution-info-link"><i class="fas fa-venus-mars"></i> Mại Dâm</a>
                            <a href="#" class="dropdown-item" id="alcohol-info-link"><i class="fas fa-wine-bottle"></i> Rượu Bia</a>
                            <a href="information.html" class="dropdown-item"><i class="fas fa-info-circle"></i> Tất Cả Thông Tin</a>
                        </div>
                    </li>
                    
                    <li class="navbar-link"><a href="#mission">Mục Tiêu Dự Án</a></li>
                    <li class="navbar-link"><a href="support.html">Hỗ Trợ</a></li>
                    
                    <!-- Menu Trải Nghiệm với dropdown -->
                    <li class="navbar-link">
                        <a href="#">Trải Nghiệm <i class="fas fa-chevron-down" style="font-size: 0.7rem; margin-left: 5px;"></i></a>
                        <div class="navbar-dropdown">
                            <a href="future_mirror.html" class="dropdown-item"><i class="fas fa-mirror"></i> Gương Soi Tương Lai</a>
                            <a href="detective_game.html" class="dropdown-item"><i class="fas fa-search"></i> Nhà Điều Tra Tệ Nạn</a>
                            <a href="community.html" class="dropdown-item"><i class="fas fa-users"></i> Cộng Đồng</a>
                        </div>
                    </li>
                    
                    <!-- Nút chuyển đổi theme -->
                    <li class="navbar-link">
                        <button class="theme-toggle" aria-label="Chuyển chế độ Sáng hoặc Tối">
                            <i class="fas fa-moon"></i>
                        </button>
                    </li>
                </ul>
                
                <!-- Nút đăng nhập -->
                <div class="auth-buttons">
                    <a href="login.php" class="login-btn"><i class="fas fa-sign-in-alt"></i> Đăng Nhập</a>
                </div>
            </div>
        </div>
    </header>
        
        <!-- JavaScript cho header - được đặt ngay trong header -->
        <script>
            (function() {
                // Xử lý hiệu ứng cuộn trang cho header
                const header = document.getElementById('main-header');
                let lastScrollTop = 0;
                
                window.addEventListener('scroll', function() {
                    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                    
                    // Thêm class scrolled khi cuộn xuống
                    if (scrollTop > 50) {
                        header.classList.add('scrolled');
                    } else {
                        header.classList.remove('scrolled');
                    }
                    
                    // Đảm bảo luôn có thể cuộn trang
                    if (document.body.style.overflow === 'hidden') {
                        document.body.style.overflow = '';
                    }
                    
                    lastScrollTop = scrollTop;
                });
                
                // Xử lý menu mobile
                const navbarToggle = document.getElementById('navbar-toggle');
                const navbarLinksContainer = document.querySelector('.navbar-links-container');
                const toggleIcon = navbarToggle.querySelector('i');
                
                // Function để đóng menu mobile
                function closeMenu() {
                    navbarLinksContainer.classList.remove('active');
                    document.body.style.overflow = ''; // Khôi phục overflow mặc định
                    toggleIcon.classList.remove('fa-times');
                    toggleIcon.classList.add('fa-bars');
                }
                
                // Function để mở menu mobile
                function openMenu() {
                    navbarLinksContainer.classList.add('active');
                    // KHÔNG sử dụng overflow: hidden cho body
                    toggleIcon.classList.remove('fa-bars');
                    toggleIcon.classList.add('fa-times');
                }
                
                navbarToggle.addEventListener('click', function(e) {
                    e.stopPropagation();
                    if (navbarLinksContainer.classList.contains('active')) {
                        closeMenu();
                    } else {
                        openMenu();
                    }
                });
                
                // Đóng menu khi click bên ngoài
                document.addEventListener('click', function(event) {
                    if (navbarLinksContainer.classList.contains('active') && 
                        !navbarLinksContainer.contains(event.target) && 
                        !navbarToggle.contains(event.target)) {
                        closeMenu();
                    }
                });
                
                // Đóng menu khi nhấn phím ESC
                document.addEventListener('keydown', function(event) {
                    if (event.key === 'Escape' && navbarLinksContainer.classList.contains('active')) {
                        closeMenu();
                    }
                });
                
                // Xử lý dropdown trên mobile
                const dropdownLinks = document.querySelectorAll('.navbar-link > a');
                
                dropdownLinks.forEach(link => {
                    const dropdown = link.nextElementSibling;
                    if (dropdown && dropdown.classList.contains('navbar-dropdown')) {
                        link.addEventListener('click', function(e) {
                            if (window.innerWidth <= 992) {
                                e.preventDefault();
                                const parentLi = this.parentElement;
                                
                                // Toggle dropdown
                                parentLi.classList.toggle('active');
                            }
                        });
                    }
                });
                
                // Xử lý theme toggle
                const themeToggle = document.querySelector('.theme-toggle');
                const themeIcon = themeToggle.querySelector('i');
                const currentTheme = localStorage.getItem('theme') || 'light';
                
                // Áp dụng theme hiện tại
                if (currentTheme === 'dark') {
                    document.body.classList.add('dark-theme');
                    themeIcon.classList.remove('fa-moon');
                    themeIcon.classList.add('fa-sun');
                }
                
                themeToggle.addEventListener('click', function() {
                    document.body.classList.toggle('dark-theme');
                    
                    if (document.body.classList.contains('dark-theme')) {
                        themeIcon.classList.remove('fa-moon');
                        themeIcon.classList.add('fa-sun');
                        localStorage.setItem('theme', 'dark');
                    } else {
                        themeIcon.classList.remove('fa-sun');
                        themeIcon.classList.add('fa-moon');
                        localStorage.setItem('theme', 'light');
                    }
                });
                
                // Xử lý active state cho navigation
                const currentPage = window.location.pathname.split('/').pop() || 'index.html';
                const navLinks = document.querySelectorAll('.navbar-link > a');
                
                navLinks.forEach(link => {
                    const href = link.getAttribute('href');
                    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
                        link.classList.add('active');
                    } else {
                        link.classList.remove('active');
                    }
                });
                
                // Script bổ sung để đảm bảo luôn có thể cuộn trang
                (function() {
                    // Kiểm tra và khôi phục khả năng cuộn mỗi 500ms
                    setInterval(function() {
                        if (document.body.style.overflow === 'hidden') {
                            document.body.style.overflow = '';
                        }
                        
                        // Kiểm tra các class có thể gây ra vấn đề
                        if (document.body.classList.contains('menu-open')) {
                            document.body.classList.remove('menu-open');
                        }
                        
                        // Đảm bảo có thể cuộn trang
                        document.documentElement.style.overflowY = 'auto';
                        document.body.style.overflowY = 'auto';
                    }, 500);
                    
                    // Bắt tất cả các sự kiện cuộn để đảm bảo cuộn được
                    window.addEventListener('wheel', function(e) {
                        // Đảm bảo trang luôn cuộn được khi người dùng sử dụng chuột
                        document.body.style.overflow = '';
                        document.documentElement.style.overflow = '';
                    }, { passive: true });
                })();
            })();
        </script>


    <div class="community-container">
        <!-- Hero Section -->
      
            
       

        <!-- Main Layout Container -->
        <div class="main-layout">
            <!-- Sidebar Trái -->
            <div class="left-sidebar">
            <?php if ($is_logged_in && !empty($user_groups)): ?>
            <div class="card chat-groups-card">
                <h3 class="card-title"><i class="fas fa-comments"></i> Nhóm Chat Của Bạn</h3>
                <?php foreach ($user_groups as $group): ?>
                <div class="chat-group-item <?= $group['unread_count'] > 0 ? 'has-unread' : '' ?>" onclick="openChatModal(<?= $group['id'] ?>, '<?= htmlspecialchars($group['group_name']) ?>')">
                    <div class="group-name"><?= htmlspecialchars($group['group_name']) ?></div>
                    <?php if ($group['last_message']): ?>
                    <div class="last-message">
                        <?= htmlspecialchars(mb_substr($group['last_message'], 0, 50)) ?><?= mb_strlen($group['last_message']) > 50 ? '...' : '' ?>
                    </div>
                    <?php endif; ?>
                    <div class="group-info">
                        <span><i class="fas fa-users"></i> <?= $group['member_count'] ?> thành viên</span>
                        <?php if ($group['unread_count'] > 0): ?>
                        <span class="unread-badge"><?= $group['unread_count'] ?></span>
                        <?php endif; ?>
                    </div>
                </div>
                <?php endforeach; ?>
            </div>
            <?php else: ?>
            <div class="card stats-card">
                <h3 class="card-title"><i class="fas fa-chart-bar"></i> Thống Kê Cộng Đồng</h3>
                <div class="stat-item">
                    <span><i class="fas fa-users"></i> Thành viên</span>
                    <strong><?= number_format($stats['total_users']) ?></strong>
                </div>
                <div class="stat-item">
                    <span><i class="fas fa-edit"></i> Bài viết</span>
                    <strong><?= number_format($stats['total_posts']) ?></strong>
                </div>
                <div class="stat-item">
                    <span><i class="fas fa-heart"></i> Lượt thích</span>
                    <strong><?= number_format($stats['total_likes']) ?></strong>
                </div>
                <div class="stat-item">
                    <span><i class="fas fa-hand-holding-heart"></i> Chiến dịch</span>
                    <strong><?= $stats['active_campaigns'] ?></strong>
                </div>
            </div>
            <?php endif; ?>

            <?php if (!empty($campaigns)): ?>
            <div class="fundraising-card card">
                <h3 class="card-title"><i class="fas fa-donate"></i> Chiến Dịch Gây Quỹ</h3>
                <?php foreach ($campaigns as $campaign): ?>
                <div class="campaign-item" style="margin-bottom: 20px; padding: 16px; border: 1px solid var(--border-color); border-radius: 8px;">
                    <h4 style="font-size: 1rem; margin-bottom: 8px;"><?= htmlspecialchars($campaign['title']) ?></h4>
                    <p style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 12px;">
                        <?= htmlspecialchars(substr($campaign['description'], 0, 80)) ?>...
                    </p>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: <?= min($campaign['progress_percent'], 100) ?>%"></div>
                    </div>
                    <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-top: 8px;">
                        <span><?= number_format($campaign['current_amount']) ?>đ</span>
                        <span>Mục tiêu: <?= number_format($campaign['target_amount']) ?>đ</span>
                    </div>
                    <button class="btn btn-success" style="width: 100%; margin-top: 12px; padding: 8px;" onclick="donate(<?= $campaign['id'] ?>)">
                        <i class="fas fa-heart"></i> Ủng hộ
                    </button>
                </div>
                <?php endforeach; ?>
            </div>
            <?php endif; ?>
        </div>

            <!-- Feed Chính -->
            <div class="main-feed">
            <?php if ($is_logged_in): ?>
            <!-- Form đăng bài - chỉ hiển thị khi đã đăng nhập -->
            <div class="post-creator">

                
                <div class="post-creator-header">
                    <img src="<?= htmlspecialchars($user_avatar) ?>" class="user-avatar" alt="<?= htmlspecialchars($username) ?> Avatar" 
                         title="<?= htmlspecialchars($username) ?>">
                    <div class="post-creator-info">
                        <div class="greeting">Xin chào <?= htmlspecialchars($username) ?>!</div>
                        <p class="subtitle">Chia sẻ suy nghĩ của bạn về các vấn đề xã hội</p>
                    </div>
                </div>
                
                <form method="POST" enctype="multipart/form-data">
                    <input type="hidden" name="action" value="create_post">
                    <textarea class="post-input" name="content" placeholder="Bạn đang nghĩ gì về các vấn đề xã hội? Chia sẻ câu chuyện, kinh nghiệm hoặc lời khuyên của bạn..." required></textarea>
                    
                    <div id="media-preview" style="display: none; margin: 16px 0;">
                        <img id="image-preview" style="max-width: 100%; border-radius: 8px; display: none;">
                        <video id="video-preview" controls style="max-width: 100%; border-radius: 8px; display: none;"></video>
                        <button type="button" onclick="removeMedia()" style="position: absolute; top: 8px; right: 8px; background: rgba(0,0,0,0.7); color: white; border: none; border-radius: 50%; width: 30px; height: 30px;">×</button>
                    </div>
                    
                    <div class="post-options">
                        <div class="post-options-left">
                            <input type="file" name="media" accept="image/*,video/*" style="display: none;" id="media-input" onchange="previewMedia(this)">
                            <button type="button" onclick="document.getElementById('media-input').click()" class="btn btn-secondary">
                                <i class="fas fa-photo-video"></i> Ảnh/Video
                            </button>
                            
                            <select name="post_type" class="form-select" style="padding: 12px 16px; border: 1px solid var(--border-color); border-radius: 8px; background: var(--bg-soft);">
                                <option value="normal">Bài viết thường</option>
                                <option value="fundraising">Kêu gọi gây quỹ</option>
                                <option value="event">Sự kiện</option>
                            </select>
                        </div>
                        
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-paper-plane"></i> Đăng bài
                        </button>
                    </div>
                </form>
            </div>
            <?php else: ?>
            <!-- Thông báo yêu cầu đăng nhập -->
            <div class="post-creator" style="text-align: center; padding: 40px;">
                <i class="fas fa-user-lock" style="font-size: 3rem; color: var(--text-secondary); margin-bottom: 16px;"></i>
                <h3>Vui lòng đăng nhập để tham gia cộng đồng</h3>
                <p style="color: var(--text-secondary); margin-bottom: 20px;">Đăng nhập để đăng bài, thích và bình luận</p>
                <div style="display: flex; gap: 12px; justify-content: center;">
                    <a href="login.php?redirect=<?= urlencode($_SERVER['REQUEST_URI']) ?>" class="btn btn-primary" style="padding: 12px 24px; background: var(--accent-color); color: white; text-decoration: none; border-radius: 8px;">
                        <i class="fas fa-sign-in-alt"></i> Đăng Nhập
                    </a>
                    <a href="register.php?redirect=<?= urlencode($_SERVER['REQUEST_URI']) ?>" class="btn btn-secondary" style="padding: 12px 24px; background: var(--border-color); color: var(--text-primary); text-decoration: none; border-radius: 8px;">
                        <i class="fas fa-user-plus"></i> Đăng Ký
                    </a>
                </div>
            </div>
            <?php endif; ?>

            <!-- Danh sách bài viết -->
            <?php if (empty($posts)): ?>
            <div class="post-card" style="text-align: center; padding: 40px;">
                <i class="fas fa-comments" style="font-size: 3rem; color: var(--text-secondary); margin-bottom: 16px;"></i>
                <h3>Chưa có bài viết nào</h3>
                <p style="color: var(--text-secondary);">Hãy là người đầu tiên chia sẻ suy nghĩ của bạn!</p>
            </div>
            <?php else: ?>
                <?php foreach ($posts as $post): ?>
                <div class="post-card" data-post-id="<?= $post['id'] ?>">
                    <div class="post-header">
                        <img src="<?= getAvatarUrl($post['avatar'], $post['username']) ?>" class="user-avatar" alt="<?= htmlspecialchars($post['username']) ?> Avatar" 
                             onerror="this.src='<?= getAvatarUrl('', $post['username']) ?>'"
                             title="<?= htmlspecialchars($post['username']) ?>">
                        <div style="flex: 1;">
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <h4 style="margin: 0; font-size: 1.1rem;"><?= htmlspecialchars($post['username']) ?></h4>
                                <?php if ($post['post_type'] === 'fundraising'): ?>
                                    <span style="background: var(--warning-color); color: white; padding: 2px 8px; border-radius: 12px; font-size: 0.7rem;">
                                        <i class="fas fa-donate"></i> Gây quỹ
                                    </span>
                                <?php elseif ($post['post_type'] === 'event'): ?>
                                    <span style="background: var(--accent-color); color: white; padding: 2px 8px; border-radius: 12px; font-size: 0.7rem;">
                                        <i class="fas fa-calendar"></i> Sự kiện
                                    </span>
                                    <?php
                                    // Kiểm tra xem có nhóm chat cho sự kiện này không
                                    $chat_group_stmt = $pdo->prepare("
                                        SELECT cg.id, cg.group_name, 
                                               (SELECT COUNT(*) FROM chat_members WHERE group_id = cg.id AND user_id = ?) as is_member,
                                               (SELECT COUNT(*) FROM chat_members WHERE group_id = cg.id) as member_count
                                        FROM chat_groups cg 
                                        WHERE cg.event_post_id = ? AND cg.is_active = 1
                                    ");
                                    $chat_group_stmt->execute([$user_id, $post['id']]);
                                    $chat_group = $chat_group_stmt->fetch();
                                    ?>
                                    <?php if ($chat_group): ?>
                                        <?php if ($is_logged_in): ?>
                                            <?php if ($chat_group['is_member']): ?>
                                                <button class="event-join-btn joined" onclick="openChatModal(<?= $chat_group['id'] ?>, '<?= htmlspecialchars($chat_group['group_name']) ?>')">
                                                    <i class="fas fa-comments"></i> Vào Chat (<?= $chat_group['member_count'] ?>)
                                                </button>
                                            <?php else: ?>
                                                <button class="event-join-btn" onclick="joinEventChat(<?= $chat_group['id'] ?>, <?= $post['id'] ?>)">
                                                    <i class="fas fa-user-plus"></i> Tham gia Chat
                                                </button>
                                            <?php endif; ?>
                                        <?php else: ?>
                                            <button class="event-join-btn" onclick="alert('Vui lòng đăng nhập để tham gia chat!')">
                                                <i class="fas fa-user-plus"></i> Tham gia Chat
                                            </button>
                                        <?php endif; ?>
                                    <?php elseif ($post['user_id'] == $user_id && $is_logged_in): ?>
                                        <button class="create-group-btn" onclick="createEventChat(<?= $post['id'] ?>)">
                                            <i class="fas fa-plus"></i> Tạo Chat
                                        </button>
                                    <?php endif; ?>
                                <?php endif; ?>
                            </div>
                            <small style="color: var(--text-secondary);"><?= date('d/m/Y H:i', strtotime($post['created_at'])) ?></small>
                        </div>
                        <div class="dropdown" style="position: relative;">
                            <button style="background: none; border: none; padding: 8px; cursor: pointer;" onclick="toggleDropdown(<?= $post['id'] ?>)">
                                <i class="fas fa-ellipsis-h"></i>
                            </button>
                            <div id="dropdown-<?= $post['id'] ?>" class="dropdown-menu" style="display: none; position: absolute; right: 0; top: 100%; background: white; box-shadow: var(--shadow-medium); border-radius: 8px; padding: 8px; z-index: 10;">
                                <button onclick="reportPost(<?= $post['id'] ?>)" style="display: block; width: 100%; text-align: left; padding: 8px 12px; border: none; background: none; cursor: pointer;">
                                    <i class="fas fa-flag"></i> Báo cáo
                                </button>
                            </div>
                        </div>
                    </div>

                    <div class="post-content" style="padding: 0 24px 16px;">
                        <p style="margin: 0; line-height: 1.6;"><?= nl2br(htmlspecialchars($post['content'])) ?></p>
                        
                        <?php if ($post['media_url']): ?>
                            <?php
                            // Tạo đường dẫn đúng cho media
                            $mediaPath = $post['media_url'];
                            $possiblePaths = [
                                $mediaPath,
                                '../' . $mediaPath
                            ];
                            
                            // Tìm đường dẫn đúng
                            $correctMediaPath = $mediaPath;
                            foreach ($possiblePaths as $path) {
                                if (file_exists($path)) {
                                    $correctMediaPath = $path;
                                    break;
                                }
                            }
                            ?>
                            <div style="margin-top: 16px;">
                                <?php if ($post['media_type'] === 'video'): ?>
                                    <video controls class="post-media" style="width: 100%; border-radius: 8px;">
                                        <source src="<?= $correctMediaPath ?>" type="video/mp4">
                                        Trình duyệt của bạn không hỗ trợ video.
                                    </video>
                                <?php else: ?>
                                    <img src="<?= $correctMediaPath ?>" class="post-media" alt="Media" style="width: 100%; border-radius: 8px; cursor: pointer;" onclick="openImageModal('<?= $correctMediaPath ?>')">
                                <?php endif; ?>
                            </div>
                        <?php endif; ?>
                    </div>

                    <div class="post-stats" style="padding: 0 24px 16px; color: var(--text-secondary); font-size: 0.9rem;">
                        <?php if ($post['likes_count'] > 0): ?>
                            <span><i class="fas fa-heart" style="color: var(--danger-color);"></i> <?= $post['likes_count'] ?> lượt thích</span>
                        <?php endif; ?>
                        <?php if ($post['comments_count'] > 0): ?>
                            <span style="margin-left: 16px;"><?= $post['comments_count'] ?> bình luận</span>
                        <?php endif; ?>
                    </div>

                    <div class="post-actions">
                        <?php if ($is_logged_in): ?>
                        <button class="action-btn like-btn <?= $post['user_liked'] ? 'liked' : '' ?>" data-post-id="<?= $post['id'] ?>">
                            <i class="fas fa-heart"></i>
                            <span>Thích</span>
                        </button>
                        <button class="action-btn comment-btn" onclick="toggleComments(<?= $post['id'] ?>)">
                            <i class="fas fa-comment"></i>
                            <span>Bình luận</span>
                        </button>
                        <?php else: ?>
                        <button class="action-btn" onclick="alert('Vui lòng đăng nhập để thích bài viết!')">
                            <i class="fas fa-heart"></i>
                            <span>Thích</span>
                        </button>
                        <button class="action-btn" onclick="alert('Vui lòng đăng nhập để bình luận!')">
                            <i class="fas fa-comment"></i>
                            <span>Bình luận</span>
                        </button>
                        <?php endif; ?>
                        <button class="action-btn share-btn" onclick="sharePost(<?= $post['id'] ?>)">
                            <i class="fas fa-share"></i>
                            <span>Chia sẻ</span>
                        </button>
                    </div>

                    <!-- Comments section -->
                    <?php if ($is_logged_in): ?>
                    <div id="comments-<?= $post['id'] ?>" class="comments-section" style="display: none; border-top: 1px solid var(--border-color); padding: 16px 24px;">
                        <div class="comment-form" style="display: flex; gap: 12px; margin-bottom: 16px;">
                            <img src="<?= htmlspecialchars($user_avatar) ?>" class="user-avatar-small" alt="<?= htmlspecialchars($username) ?> Avatar" 
                                 title="<?= htmlspecialchars($username) ?>">
                            <div style="flex: 1;">
                                <input type="text" placeholder="Viết bình luận..." style="width: 100%; padding: 8px 12px; border: 1px solid var(--border-color); border-radius: 20px;" onkeypress="handleCommentSubmit(event, <?= $post['id'] ?>)">
                            </div>
                        </div>
                        <div id="comments-list-<?= $post['id'] ?>" class="comments-list">
                            <!-- Comments sẽ được load bằng AJAX -->
                        </div>
                    </div>
                    <?php endif; ?>
                </div>
                <?php endforeach; ?>
            <?php endif; ?>
            </div>

            <!-- Sidebar Phải - Tìm kiếm người dùng -->
            <div class="right-sidebar">
                <div class="search-card card">
                    <h3 class="card-title"><i class="fas fa-search"></i> Tìm Kiếm Người Dùng</h3>
                    
                    <div class="search-container">
                        <input type="text" 
                               id="userSearchInput" 
                               class="search-input" 
                               placeholder="Nhập tên người dùng để tìm kiếm..."
                               autocomplete="off">
                        <i class="fas fa-search search-icon"></i>
                        <i class="fas fa-spinner fa-spin search-loading" id="searchLoading" style="display: none;"></i>
                    </div>
                    
                    <div id="searchResults" class="search-results">
                        <div class="no-results" style="text-align: center; padding: 40px 20px; color: var(--text-secondary);">
                            <i class="fas fa-users" style="font-size: 2rem; margin-bottom: 12px; display: block; color: var(--text-muted);"></i>
                            <p>Nhập tên để tìm kiếm thành viên trong cộng đồng</p>
                        </div>
                    </div>
                </div>
                
                <div class="stats-card card">
                    <h3 class="card-title"><i class="fas fa-chart-bar"></i> Thống Kê Cộng Đồng</h3>
                    <div class="stat-item">
                        <span><i class="fas fa-users"></i> Thành viên</span>
                        <strong><?= number_format($stats['total_users']) ?></strong>
                    </div>
                    <div class="stat-item">
                        <span><i class="fas fa-edit"></i> Bài viết</span>
                        <strong><?= number_format($stats['total_posts']) ?></strong>
                    </div>
                    <div class="stat-item">
                        <span><i class="fas fa-heart"></i> Lượt thích</span>
                        <strong><?= number_format($stats['total_likes']) ?></strong>
                    </div>
                </div>
            </div>
        </div> <!-- Đóng main-layout container -->
    </div> <!-- Đóng community-container -->

    <!-- Chat Modal -->
    <div id="chatModal" class="chat-modal">
        <div class="chat-container">
            <div class="chat-header">
                <div>
                    <h3 id="chatGroupName">Nhóm Chat</h3>
                    <small id="chatGroupInfo">0 thành viên</small>
                </div>
                <div style="display: flex; gap: 12px; align-items: center;">
                    <button onclick="showGroupMembers()" style="background: rgba(255,255,255,0.2); border: none; color: white; padding: 8px; border-radius: 6px; cursor: pointer;">
                        <i class="fas fa-users"></i>
                    </button>
                    <button onclick="closeChatModal()" style="background: rgba(255,255,255,0.2); border: none; color: white; padding: 8px; border-radius: 6px; cursor: pointer;">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
            <div id="chatMessages" class="chat-messages">
                <!-- Messages sẽ được load bằng JavaScript -->
            </div>
            <div class="chat-input-area">
                <input type="text" id="chatInput" class="chat-input" placeholder="Nhập tin nhắn..." maxlength="1000">
                <button id="chatSendBtn" class="chat-send-btn" onclick="sendChatMessage()">
                    <i class="fas fa-paper-plane"></i>
                </button>
            </div>
        </div>
    </div>

    <!-- Load JavaScript components -->
    <script src="js/community-components.js"></script>
    
    <script>
        // Tắt event listeners từ community-components.js để tránh xung đột
        if (typeof CommunityApp !== 'undefined' && CommunityApp.initializePostInteractions) {
            // Override function để không khởi tạo like handlers
            CommunityApp.initializePostInteractions = function() {
                console.log('Post interactions disabled - using inline handlers');
            };
        }
    </script>
    
    <script>
        // Biến toàn cục để kiểm tra trạng thái đăng nhập
        const isLoggedIn = <?= $is_logged_in ? 'true' : 'false' ?>;
        const currentUserId = <?= $user_id ? $user_id : 'null' ?>;
        const currentUserAvatar = <?= json_encode($user_avatar) ?>;
        const currentUsername = <?= json_encode($username) ?>;
        
        // Debug function
        function showDebugInfo() {
            console.log('=== DEBUG INFO ===');
            console.log('isLoggedIn:', isLoggedIn);
            console.log('currentUserId:', currentUserId);
            console.log('currentUserAvatar:', currentUserAvatar);
            console.log('currentUsername:', currentUsername);
            console.log('currentChatGroupId:', currentChatGroupId);
            console.log('lastMessageId:', lastMessageId);
            console.log('=================');
        }
        
        // Log debug info khi trang load
        console.log('Community page loaded:', {isLoggedIn, currentUserId});
        
        // Thêm function để test API trực tiếp từ console
        window.testChatAPI = function(groupId = 2) {
            console.log('Testing chat API with group ID:', groupId);
            fetch(`api/chat.php?action=group_messages&group_id=${groupId}&limit=10`)
                .then(response => {
                    console.log('API Response status:', response.status);
                    return response.text();
                })
                .then(text => {
                    console.log('API Response text:', text);
                    try {
                        const data = JSON.parse(text);
                        console.log('API Response JSON:', data);
                    } catch (e) {
                        console.error('Failed to parse JSON:', e);
                    }
                })
                .catch(error => console.error('API Error:', error));
        };
        
        // Preview media trước khi upload
        function previewMedia(input) {
            const file = input.files[0];
            if (file) {
                const reader = new FileReader();
                const preview = document.getElementById('media-preview');
                const imagePreview = document.getElementById('image-preview');
                const videoPreview = document.getElementById('video-preview');
                
                reader.onload = function(e) {
                    preview.style.display = 'block';
                    if (file.type.startsWith('video/')) {
                        videoPreview.src = e.target.result;
                        videoPreview.style.display = 'block';
                        imagePreview.style.display = 'none';
                    } else {
                        imagePreview.src = e.target.result;
                        imagePreview.style.display = 'block';
                        videoPreview.style.display = 'none';
                    }
                };
                reader.readAsDataURL(file);
            }
        }

        function removeMedia() {
            document.getElementById('media-input').value = '';
            document.getElementById('media-preview').style.display = 'none';
        }

                // Function đơn giản để cập nhật stats section
        function updatePostStats(postCard, likesCount, commentsCount = null) {
            const statsSection = postCard.querySelector('.post-stats');
            if (!statsSection) {
                console.error('Stats section not found in post card:', postCard);
                return;
            }
            
            console.log('Updating stats section:', statsSection);
            console.log('Likes count:', likesCount);
            
            // Lấy comments count hiện tại nếu không được cung cấp
            if (commentsCount === null) {
                const currentText = statsSection.innerHTML;
                const commentsMatch = currentText.match(/(\d+)\s+bình luận/);
                commentsCount = commentsMatch ? parseInt(commentsMatch[1]) : 0;
            }
            
            console.log('Comments count:', commentsCount);
            
            let newStatsHTML = '';
            
            // Thêm likes nếu có
            if (likesCount > 0) {
                newStatsHTML += `<span><i class="fas fa-heart" style="color: #ef4444;"></i> ${likesCount} lượt thích</span>`;
            }
            
            // Thêm comments nếu có
            if (commentsCount > 0) {
                if (newStatsHTML) {
                    newStatsHTML += '<span style="margin-left: 16px;">' + commentsCount + ' bình luận</span>';
                } else {
                    newStatsHTML += '<span>' + commentsCount + ' bình luận</span>';
                }
            }
            
            console.log('New stats HTML:', newStatsHTML);
            
            // Update DOM trực tiếp
            statsSection.innerHTML = newStatsHTML;
            
            console.log('Stats updated. Final innerHTML:', statsSection.innerHTML);
        }

        // AJAX cho like - sử dụng event delegation để tránh xung đột
        document.addEventListener('click', function(e) {
            if (e.target.closest('.like-btn')) {
                e.preventDefault();
                e.stopPropagation();
                
                const btn = e.target.closest('.like-btn');
                const postId = btn.dataset.postId;
                
                console.log('Like button clicked:', {postId, isLoggedIn, btn});
                
                if (!postId) {
                    console.error('Post ID not found');
                    showNotification('Lỗi: Không tìm thấy ID bài viết', 'error');
                    return;
                }
                
                if (!isLoggedIn) {
                    alert('Vui lòng đăng nhập để thích bài viết!');
                    window.location.href = 'login.php?redirect=' + encodeURIComponent(window.location.href);
                    return;
                }
                
                // Disable button để tránh click nhiều lần
                btn.disabled = true;
                
                // Thêm loading state
                const originalHTML = btn.innerHTML;
                btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Đang xử lý...</span>';
                
                fetch('api/like.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({post_id: parseInt(postId)})
                })
                .then(response => {
                    if (!response.ok) {
                        if (response.status === 401) {
                            alert('Vui lòng đăng nhập để thích bài viết!');
                            window.location.href = 'login.php?redirect=' + encodeURIComponent(window.location.href);
                            return;
                        }
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                                            console.log('Like API response:', data);
                        console.log('Button element:', btn);
                        console.log('Post card element:', btn.closest('.post-card'));
                        
                        if (data.success) {
                        // Toggle liked state với animation
                        if (data.liked) {
                            btn.classList.add('liked');
                            console.log('Added liked class');
                        } else {
                            btn.classList.remove('liked');
                            console.log('Removed liked class');
                        }
                        
                        // Cập nhật số lượt thích trong post-stats
                        const postCard = btn.closest('.post-card');
                        
                        console.log('Updating stats for post card:', postCard);
                        console.log('New likes count:', data.likes_count);
                        
                        // Sử dụng function helper để cập nhật stats
                        updatePostStats(postCard, data.likes_count);
                        
                        // Visual feedback với animation mượt
                        btn.style.transition = 'all 0.2s ease';
                        btn.style.transform = 'scale(1.1)';
                        
                        // Thêm hiệu ứng cho icon heart
                        const heartIcon = btn.querySelector('i');
                        if (heartIcon) {
                            heartIcon.style.transition = 'all 0.2s ease';
                            if (data.liked) {
                                heartIcon.style.color = '#ef4444';
                                heartIcon.classList.remove('far');
                                heartIcon.classList.add('fas');
                            } else {
                                heartIcon.style.color = '';
                                heartIcon.classList.remove('fas');
                                heartIcon.classList.add('far');
                            }
                        }
                        
                        setTimeout(() => {
                            btn.style.transform = '';
                        }, 200);
                        
                        // Hiển thị thông báo thành công
                        showNotification(
                            data.liked ? 'Đã thích bài viết!' : 'Đã bỏ thích bài viết!', 
                            'success'
                        );
                        
                    } else {
                        console.error('API Error:', data.message);
                        showNotification(data.message || 'Có lỗi xảy ra khi thích bài viết!', 'error');
                    }
                })
                .catch(error => {
                    console.error('Like Error:', error);
                    showNotification('Có lỗi kết nối, vui lòng thử lại!', 'error');
                })
                .finally(() => {
                    // Re-enable button và restore original HTML
                    btn.disabled = false;
                    
                    // Restore button content based on current state
                    const isLiked = btn.classList.contains('liked');
                    btn.innerHTML = `<i class="${isLiked ? 'fas' : 'far'} fa-heart"></i> <span>Thích</span>`;
                });
            }
        });

        // Toggle comments
        function toggleComments(postId) {
            if (!isLoggedIn) {
                alert('Vui lòng đăng nhập để xem và viết bình luận!');
                return;
            }
            
            const commentsSection = document.getElementById(`comments-${postId}`);
            if (commentsSection && commentsSection.style.display === 'none') {
                commentsSection.style.display = 'block';
                loadComments(postId);
            } else if (commentsSection) {
                commentsSection.style.display = 'none';
            }
        }

        // Load comments
        function loadComments(postId) {
            console.log('Loading comments for post:', postId);
            fetch(`api/comment.php?post_id=${postId}`)
                .then(response => response.json())
                .then(data => {
                    console.log('Comments response:', data);
                    if (data.success) {
                        // Debug: Log first comment to check avatar data
                        if (data.comments && data.comments.length > 0) {
                            console.log('First comment data:', data.comments[0]);
                            console.log('Avatar field:', data.comments[0].avatar);
                            console.log('Avatar URL field:', data.comments[0].avatar_url);
                        }
                        
                        const commentsList = document.getElementById(`comments-list-${postId}`);
                        if (!commentsList) {
                            console.error('Comments list element not found');
                            return;
                        }
                        
                        commentsList.innerHTML = '';
                        
                        if (data.comments && data.comments.length > 0) {
                            // Tổ chức comments theo cấu trúc Facebook: main comments + replies ngay dưới
                            const organizedComments = organizeCommentsForDisplay(data.comments);
                            
                            organizedComments.forEach(comment => {
                                const commentHtml = createCommentHtml(comment);
                                commentsList.insertAdjacentHTML('beforeend', commentHtml);
                            });
                        } else {
                            commentsList.innerHTML = '<div style="text-align: center; padding: 20px; color: var(--text-secondary);">Chưa có bình luận nào</div>';
                        }
                    } else {
                        console.error('Error loading comments:', data.message);
                        showNotification(data.message || 'Lỗi khi tải bình luận', 'error');
                    }
                })
                .catch(error => {
                    console.error('Error loading comments:', error);
                    showNotification('Lỗi kết nối khi tải bình luận', 'error');
                });
        }

        // Function để xử lý avatar URL giống như PHP
        function getCommentAvatarUrl(avatar, username) {
            const colors = ['4f46e5', '06b6d4', '10b981', 'f59e0b', 'ef4444', '8b5cf6', 'ec4899', '14b8a6'];
            const colorIndex = Math.abs(hashCode(username)) % colors.length;
            const color = colors[colorIndex];
            
            const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&size=200&background=${color}&color=ffffff&rounded=true&bold=true`;
            
            // Nếu avatar trống hoặc là default
            if (!avatar || avatar === 'default-avatar.jpg' || avatar === 'NULL' || avatar === null) {
                return defaultAvatar;
            }
            
            // Kiểm tra xem có phải URL đầy đủ không
            if (avatar.startsWith('http://') || avatar.startsWith('https://')) {
                return avatar;
            }
            
            // Thử các đường dẫn có thể có
            const possiblePaths = [
                avatar,
                `uploads/avatars/${avatar.split('/').pop()}`,
                `../uploads/avatars/${avatar.split('/').pop()}`,
                `html/uploads/avatars/${avatar.split('/').pop()}`
            ];
            
            // Trả về đường dẫn đầu tiên (giả sử file tồn tại)
            // Browser sẽ fallback về onerror nếu không load được
            return possiblePaths[0];
        }

        // Tạo HTML cho comment - style Facebook đơn giản
        function createCommentHtml(comment) {
            // Ưu tiên avatar_url từ API, fallback về avatar hoặc tạo mới
            let avatarUrl = comment.avatar_url || getCommentAvatarUrl(comment.avatar, comment.username);
            
            const colors = ['4f46e5', '06b6d4', '10b981', 'f59e0b', 'ef4444', '8b5cf6', 'ec4899', '14b8a6'];
            const colorIndex = Math.abs(hashCode(comment.username)) % colors.length;
            const color = colors[colorIndex];
            const fallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.username)}&size=64&background=${color}&color=ffffff&rounded=true&bold=true`;
            
            // Tính toán style dựa trên reply level
            const replyLevel = parseInt(comment.reply_level) || 0;
            const isReply = replyLevel > 0;
            const isEdited = comment.is_edited == 1;
            const isVerified = comment.is_verified == 1;
            
            // Kiểm tra xem có thể reply không (tối đa 2 cấp như Facebook)
            const canReply = replyLevel < 1 && isLoggedIn;
            
            // Hiển thị "trả lời ai" nếu là reply
            let replyToText = '';
            if (isReply && comment.parent_username) {
                replyToText = `<span style="color: #1877f2; font-weight: 600;">@${comment.parent_username}</span> `;
            }
            
            return `
                <div class="comment-item ${isReply ? 'comment-reply' : 'comment-main'}" 
                     data-comment-id="${comment.id}" 
                     data-reply-level="${replyLevel}"
                     data-parent-id="${comment.parent_id || ''}"
                     style="margin-bottom: ${isReply ? '8px' : '16px'}; ${isReply ? 'margin-left: 48px;' : ''}">
                    
                    <div class="comment-content" style="display: flex; gap: 8px; align-items: flex-start;">
                        <img src="${avatarUrl}" 
                             class="comment-avatar" 
                             alt="${comment.username}" 
                             onerror="this.src='${fallbackUrl}'"
                             style="width: ${isReply ? '28px' : '36px'}; height: ${isReply ? '28px' : '36px'}; border-radius: 50%; object-fit: cover; flex-shrink: 0;">
                        
                        <div class="comment-bubble" style="flex: 1; background: #f0f2f5; border-radius: 16px; padding: 8px 12px; max-width: calc(100% - 60px);">
                            <div class="comment-header" style="margin-bottom: 2px;">
                                <strong style="font-size: 0.9rem; color: #050505; font-weight: 600;">${comment.username}</strong>
                                ${isVerified ? '<i class="fas fa-check-circle" style="color: #1877f2; font-size: 0.7rem; margin-left: 4px;" title="Đã xác thực"></i>' : ''}
                                ${isEdited ? '<span style="font-size: 0.7rem; color: #65676b; margin-left: 4px;">(đã chỉnh sửa)</span>' : ''}
                            </div>
                            <div class="comment-text" style="font-size: 0.9rem; line-height: 1.4; color: #050505; word-wrap: break-word;">
                                ${replyToText}${comment.content}
                            </div>
                        </div>
                    </div>
                    
                    <div class="comment-actions" style="margin-left: ${isReply ? '36px' : '44px'}; margin-top: 4px; display: flex; align-items: center; gap: 16px; font-size: 0.75rem; color: #65676b;">
                        <span class="comment-time">${formatTimeAgo(comment.created_at)}</span>
                        
                        ${isLoggedIn ? `
                            <button class="comment-like-btn ${comment.user_liked ? 'liked' : ''}" 
                                    data-comment-id="${comment.id}" 
                                    style="background: none; border: none; color: ${comment.user_liked ? '#1877f2' : '#65676b'}; cursor: pointer; font-size: 0.75rem; font-weight: 600; padding: 4px 0;">
                                ${comment.user_liked ? 'Thích' : 'Thích'}
                            </button>
                            
                            ${canReply ? `
                            <button class="comment-reply-btn" 
                                    data-comment-id="${comment.id}"
                                    data-reply-to="${comment.username}"
                                    style="background: none; border: none; color: #65676b; cursor: pointer; font-size: 0.75rem; font-weight: 600; padding: 4px 0;">
                                Trả lời
                            </button>
                            ` : ''}
                            
                            ${comment.user_id == currentUserId ? `
                            <button class="comment-edit-btn" 
                                    data-comment-id="${comment.id}"
                                    style="background: none; border: none; color: #65676b; cursor: pointer; font-size: 0.75rem; font-weight: 600; padding: 4px 0;">
                                Sửa
                            </button>
                            <button class="comment-delete-btn" 
                                    data-comment-id="${comment.id}"
                                    style="background: none; border: none; color: #65676b; cursor: pointer; font-size: 0.75rem; font-weight: 600; padding: 4px 0;">
                                Xóa
                            </button>
                            ` : ''}
                        ` : ''}
                        
                        ${comment.likes_count > 0 ? `<span style="color: #65676b;"><i class="fas fa-heart" style="color: #f33e58; font-size: 0.7rem;"></i> ${comment.likes_count}</span>` : ''}
                    </div>
                    
                    ${canReply ? `
                    <div class="reply-form" id="reply-form-${comment.id}" style="display: none; margin-top: 8px; margin-left: ${isReply ? '36px' : '44px'};">
                        <div style="display: flex; gap: 8px; align-items: center;">
                            <img src="${currentUserAvatar}" 
                                 style="width: 28px; height: 28px; border-radius: 50%; object-fit: cover;"
                                 onerror="this.src='${getCommentAvatarUrl(null, currentUsername)}'">
                            <input type="text" 
                                   placeholder="Viết trả lời..." 
                                   style="flex: 1; padding: 8px 12px; border: 1px solid #ccd0d5; border-radius: 20px; font-size: 0.85rem; outline: none; background: #f0f2f5;"
                                   onkeypress="handleReplySubmit(event, ${comment.id}, '${comment.username}')"
                                   onfocus="this.style.borderColor='#1877f2'; this.style.background='#fff';"
                                   onblur="this.style.borderColor='#ccd0d5'; this.style.background='#f0f2f5';">
                        </div>
                    </div>
                    ` : ''}
                </div>
            `;
        }
        
        // Helper function để format thời gian giống Facebook
        function formatTimeAgo(dateString) {
            const now = new Date();
            const commentDate = new Date(dateString);
            const diffInSeconds = Math.floor((now - commentDate) / 1000);
            
            if (diffInSeconds < 60) {
                return 'Vừa xong';
            } else if (diffInSeconds < 3600) {
                const minutes = Math.floor(diffInSeconds / 60);
                return `${minutes} phút`;
            } else if (diffInSeconds < 86400) {
                const hours = Math.floor(diffInSeconds / 3600);
                return `${hours} giờ`;
            } else if (diffInSeconds < 604800) {
                const days = Math.floor(diffInSeconds / 86400);
                return `${days} ngày`;
            } else {
                return commentDate.toLocaleDateString('vi-VN');
            }
        }
        
        // Tổ chức comments theo style Facebook: main comment + replies ngay dưới
        function organizeCommentsForDisplay(comments) {
            const result = [];
            const commentMap = {};
            
            // Tạo map để dễ tìm kiếm
            comments.forEach(comment => {
                commentMap[comment.id] = comment;
            });
            
            // Tìm main comments (parent_id = null) và sắp xếp theo thời gian
            const mainComments = comments
                .filter(comment => !comment.parent_id)
                .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
            
            // Với mỗi main comment, thêm nó và tất cả replies vào result
            mainComments.forEach(mainComment => {
                result.push(mainComment);
                
                // Tìm tất cả replies của main comment này
                const replies = comments
                    .filter(comment => comment.parent_id == mainComment.id)
                    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
                
                replies.forEach(reply => {
                    // Thêm thông tin parent để hiển thị "trả lời ai"
                    reply.parent_username = mainComment.username;
                    result.push(reply);
                });
            });
            
            return result;
        }
        
        // Helper function để tạo hash từ string
        function hashCode(str) {
            let hash = 0;
            for (let i = 0; i < str.length; i++) {
                const char = str.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash; // Convert to 32bit integer
            }
            return hash;
        }

        // Submit comment
        function handleCommentSubmit(event, postId) {
            if (event.key === 'Enter' && event.target.value.trim()) {
                const content = event.target.value.trim();
                
                fetch('api/comment.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        post_id: postId,
                        content: content
                    })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        event.target.value = '';
                        loadComments(postId);
                        
                        // Cập nhật số lượng comment
                        const postCard = document.querySelector(`[data-post-id="${postId}"]`);
                        const commentBtn = postCard.querySelector('.comment-btn span');
                        commentBtn.textContent = 'Bình luận';
                    } else if (data.message && data.message.includes('Unauthorized')) {
                        alert('Vui lòng đăng nhập để bình luận!');
                        window.location.href = 'login.php?redirect=' + encodeURIComponent(window.location.href);
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('Có lỗi xảy ra, vui lòng thử lại!');
                });
            }
        }

        // Toggle dropdown
        function toggleDropdown(postId) {
            const dropdown = document.getElementById(`dropdown-${postId}`);
            dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
            
            // Đóng dropdown khi click bên ngoài
            document.addEventListener('click', function(e) {
                if (!e.target.closest('.dropdown')) {
                    dropdown.style.display = 'none';
                }
            });
        }

        // Share post
        function sharePost(postId) {
            if (navigator.share) {
                navigator.share({
                    title: 'Chia sẻ bài viết',
                    text: 'Xem bài viết thú vị này từ cộng đồng',
                    url: window.location.href + `#post-${postId}`
                });
            } else {
                // Fallback - copy link
                navigator.clipboard.writeText(window.location.href + `#post-${postId}`);
                alert('Đã copy link bài viết!');
            }
        }

        // Report post
        function reportPost(postId) {
            if (confirm('Bạn có chắc muốn báo cáo bài viết này?')) {
                // TODO: Implement report functionality
                alert('Đã gửi báo cáo. Cảm ơn bạn đã giúp duy trì cộng đồng an toàn!');
            }
        }

        // Donate function
        function donate(campaignId) {
            // TODO: Implement donation modal/redirect
            alert(`Chức năng quyên góp cho chiến dịch ${campaignId} đang được phát triển!`);
        }

        // Open image modal
        function openImageModal(imageUrl) {
            const modal = document.createElement('div');
            modal.style.cssText = `
                position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
                background: rgba(0,0,0,0.9); display: flex; align-items: center; 
                justify-content: center; z-index: 1000; cursor: pointer;
            `;
            
            const img = document.createElement('img');
            img.src = imageUrl;
            img.style.cssText = 'max-width: 90%; max-height: 90%; border-radius: 8px;';
            
            modal.appendChild(img);
            document.body.appendChild(modal);
            
            modal.addEventListener('click', () => {
                document.body.removeChild(modal);
            });
        }

        // Xử lý các sự kiện click cho comments
        document.addEventListener('click', function(e) {
            // Xử lý like comment
            if (e.target.closest('.comment-like-btn')) {
                const btn = e.target.closest('.comment-like-btn');
                const commentId = btn.dataset.commentId;
                
                fetch('api/comment_like.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({comment_id: commentId})
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        const icon = btn.querySelector('i');
                        const text = btn.querySelector('span') || btn.childNodes[btn.childNodes.length - 1];
                        
                        if (data.liked) {
                            btn.classList.add('liked');
                            btn.style.color = '#ef4444';
                            if (text.textContent) text.textContent = ' Đã thích';
                            else btn.innerHTML = '<i class="fas fa-heart"></i> Đã thích';
                        } else {
                            btn.classList.remove('liked');
                            btn.style.color = 'var(--text-secondary)';
                            if (text.textContent) text.textContent = ' Thích';
                            else btn.innerHTML = '<i class="fas fa-heart"></i> Thích';
                        }
                        
                        // Cập nhật số lượt like trong stats
                        const commentItem = btn.closest('.comment-item');
                        const statsDiv = commentItem.querySelector('div div div');
                        const likesSpan = statsDiv.querySelector('span:first-child');
                        
                        if (data.likes_count > 0) {
                            if (likesSpan && likesSpan.innerHTML.includes('heart')) {
                                likesSpan.innerHTML = `<i class="fas fa-heart" style="color: #ef4444;"></i> ${data.likes_count}`;
                            } else {
                                // Thêm likes span mới sau small time
                                const timeSpan = statsDiv.querySelector('small');
                                const newLikesSpan = document.createElement('span');
                                newLikesSpan.innerHTML = `<i class="fas fa-heart" style="color: #ef4444;"></i> ${data.likes_count}`;
                                timeSpan.parentNode.insertBefore(newLikesSpan, timeSpan.nextSibling);
                            }
                        } else if (likesSpan && likesSpan.innerHTML.includes('heart')) {
                            likesSpan.remove();
                        }
                    } else if (data.message && data.message.includes('Unauthorized')) {
                        alert('Vui lòng đăng nhập để thích bình luận!');
                        window.location.href = 'login.php?redirect=' + encodeURIComponent(window.location.href);
                    } else {
                        showNotification(data.message || 'Có lỗi khi thích comment!', 'error');
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    showNotification('Có lỗi kết nối, vui lòng thử lại!', 'error');
                });
            }
            
            // Xử lý nút reply
            if (e.target.closest('.comment-reply-btn')) {
                const btn = e.target.closest('.comment-reply-btn');
                const commentId = btn.dataset.commentId;
                const replyForm = document.getElementById(`reply-form-${commentId}`);
                
                // Ẩn tất cả reply forms khác
                document.querySelectorAll('.reply-form').forEach(form => {
                    if (form.id !== `reply-form-${commentId}`) {
                        form.style.display = 'none';
                    }
                });
                
                // Toggle reply form hiện tại
                if (replyForm.style.display === 'none' || !replyForm.style.display) {
                    replyForm.style.display = 'block';
                    replyForm.querySelector('input').focus();
                } else {
                    replyForm.style.display = 'none';
                }
            }
            
            // Xử lý nút edit comment
            if (e.target.closest('.comment-edit-btn')) {
                const btn = e.target.closest('.comment-edit-btn');
                const commentId = btn.dataset.commentId;
                editComment(commentId);
            }
            
            // Xử lý nút delete comment
            if (e.target.closest('.comment-delete-btn')) {
                const btn = e.target.closest('.comment-delete-btn');
                const commentId = btn.dataset.commentId;
                deleteComment(commentId);
            }
        });
        
        // Xử lý submit reply
        function handleReplySubmit(event, parentId, replyToUser) {
            if (event.key === 'Enter' && event.target.value.trim()) {
                const content = event.target.value.trim();
                
                // Tìm post ID từ element cha
                const postCard = event.target.closest('.post-card');
                const postId = postCard ? postCard.getAttribute('data-post-id') : null;
                
                if (!postId) {
                    console.error('Không tìm thấy post ID');
                    showNotification('Lỗi: Không tìm thấy bài viết', 'error');
                    return;
                }
                
                console.log('Submitting reply:', {postId, parentId, content});
                
                fetch('api/comment.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        post_id: parseInt(postId),
                        content: content,
                        parent_id: parseInt(parentId)
                    })
                })
                .then(response => response.json())
                .then(data => {
                    console.log('Reply response:', data);
                    if (data.success) {
                        event.target.value = '';
                        // Ẩn reply form
                        document.getElementById(`reply-form-${parentId}`).style.display = 'none';
                        // Tải lại comments
                        loadComments(postId);
                        
                        // Hiển thị thông báo thành công
                        showNotification('Trả lời thành công!', 'success');
                    } else if (data.message && data.message.includes('Unauthorized')) {
                        alert('Vui lòng đăng nhập để trả lời bình luận!');
                        window.location.href = 'login.php?redirect=' + encodeURIComponent(window.location.href);
                    } else {
                        showNotification(data.message || 'Có lỗi xảy ra khi gửi reply!', 'error');
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    showNotification('Có lỗi kết nối, vui lòng thử lại!', 'error');
                });
            }
        }
        
        // Hiển thị notification - improved version
        function showNotification(message, type = 'info') {
            // Remove existing notifications
            document.querySelectorAll('.notification').forEach(n => n.remove());
            
            const notification = document.createElement('div');
            notification.className = 'notification';
            notification.style.cssText = `
                position: fixed; top: 80px; right: 20px; z-index: 1001;
                padding: 12px 20px; border-radius: 8px; color: white;
                background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : type === 'warning' ? '#f59e0b' : '#3b82f6'};
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                transform: translateX(100%); transition: transform 0.3s ease;
                max-width: 300px; word-wrap: break-word;
                font-size: 0.9rem; font-weight: 500;
            `;
            notification.textContent = message;
            document.body.appendChild(notification);
            
            // Hiển thị
            setTimeout(() => notification.style.transform = 'translateX(0)', 100);
            
            // Ẩn sau 4 giây
            setTimeout(() => {
                notification.style.transform = 'translateX(100%)';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            }, 4000);
        }
        
        // Xử lý edit comment
        function editComment(commentId) {
            const commentItem = document.querySelector(`[data-comment-id="${commentId}"]`);
            const contentElement = commentItem.querySelector('p');
            const currentContent = contentElement.textContent;
            
            // Tạo form edit
            const editForm = document.createElement('div');
            editForm.innerHTML = `
                <textarea style="width: 100%; padding: 8px; border: 1px solid var(--border-color); border-radius: 8px; resize: vertical; min-height: 60px;">${currentContent}</textarea>
                <div style="margin-top: 8px; display: flex; gap: 8px;">
                    <button onclick="saveEdit(${commentId}, this)" style="padding: 6px 12px; background: var(--accent-color); color: white; border: none; border-radius: 4px; cursor: pointer;">Lưu</button>
                    <button onclick="cancelEdit(${commentId}, '${currentContent.replace(/'/g, "\\'")}', this)" style="padding: 6px 12px; background: var(--border-color); color: var(--text-primary); border: none; border-radius: 4px; cursor: pointer;">Hủy</button>
                </div>
            `;
            
            contentElement.style.display = 'none';
            contentElement.parentNode.insertBefore(editForm, contentElement.nextSibling);
        }
        
        // Lưu edit
        function saveEdit(commentId, button) {
            const editForm = button.closest('div').parentNode;
            const textarea = editForm.querySelector('textarea');
            const newContent = textarea.value.trim();
            
            if (!newContent) {
                showNotification('Nội dung comment không được để trống!', 'error');
                return;
            }
            
            fetch('api/comment.php', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    comment_id: commentId,
                    content: newContent
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Cập nhật nội dung và loại bỏ form edit
                    const commentItem = document.querySelector(`[data-comment-id="${commentId}"]`);
                    const contentElement = commentItem.querySelector('p');
                    contentElement.textContent = newContent;
                    contentElement.style.display = 'block';
                    
                    // Thêm dấu (đã chỉnh sửa) nếu chưa có
                    const usernameDiv = commentItem.querySelector('div div:first-child');
                    if (!usernameDiv.querySelector('span')) {
                        usernameDiv.insertAdjacentHTML('beforeend', '<span style="font-size: 0.7rem; color: var(--text-secondary); font-style: italic;">(đã chỉnh sửa)</span>');
                    }
                    
                    editForm.remove();
                    showNotification(data.message, 'success');
                } else {
                    showNotification(data.message || 'Có lỗi khi cập nhật comment!', 'error');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showNotification('Có lỗi kết nối, vui lòng thử lại!', 'error');
            });
        }
        
        // Hủy edit
        function cancelEdit(commentId, originalContent, button) {
            const editForm = button.closest('div').parentNode;
            const commentItem = document.querySelector(`[data-comment-id="${commentId}"]`);
            const contentElement = commentItem.querySelector('p');
            
            contentElement.style.display = 'block';
            editForm.remove();
        }
        
        // Xóa comment
        function deleteComment(commentId) {
            if (!confirm('Bạn có chắc muốn xóa comment này? Hành động này không thể hoàn tác.')) {
                return;
            }
            
            fetch('api/comment.php', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    comment_id: commentId
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Xóa comment khỏi DOM ngay lập tức
                    const commentItem = document.querySelector(`[data-comment-id="${commentId}"]`);
                    commentItem.remove();
                    showNotification(data.message, 'success');
                } else {
                    showNotification(data.message || 'Có lỗi khi xóa comment!', 'error');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showNotification('Có lỗi kết nối, vui lòng thử lại!', 'error');
            });
        }

        // Auto-resize textarea
        document.querySelector('.post-input').addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = this.scrollHeight + 'px';
        });
        
        // =============================================
        // CHỨC NĂNG CHAT NHÓM
        // =============================================
        
        let currentChatGroupId = null;
        let chatPollingInterval = null;
        let lastMessageId = 0;
        
        // Mở modal chat
        function openChatModal(groupId, groupName) {
            console.log('Opening chat modal:', {groupId, groupName, isLoggedIn, currentUserId});
            
            if (!isLoggedIn) {
                alert('Bạn cần đăng nhập để sử dụng chat!');
                return;
            }
            
            currentChatGroupId = groupId;
            document.getElementById('chatGroupName').textContent = groupName;
            document.getElementById('chatModal').style.display = 'flex';
            
            // Reset messages container
            document.getElementById('chatMessages').innerHTML = '<div style="text-align: center; padding: 20px; color: var(--text-secondary);">Đang tải tin nhắn...</div>';
            
            // Load messages và bắt đầu polling
            loadChatMessages();
            startChatPolling();
            
            // Focus vào input
            document.getElementById('chatInput').focus();
            
            // Cập nhật last_seen
            updateLastSeen(groupId);
        }
        
        // Đóng modal chat
        function closeChatModal() {
            document.getElementById('chatModal').style.display = 'none';
            currentChatGroupId = null;
            
            // Dừng polling
            if (chatPollingInterval) {
                clearInterval(chatPollingInterval);
                chatPollingInterval = null;
            }
            
            // Reload trang để cập nhật unread count
            setTimeout(() => location.reload(), 300);
        }
        
        // Load tin nhắn
        function loadChatMessages() {
            if (!currentChatGroupId) return;
            
            console.log('Loading messages for group:', currentChatGroupId);
            
            fetch(`api/chat.php?action=group_messages&group_id=${currentChatGroupId}&limit=50&offset=0`)
                .then(response => {
                    console.log('Response status:', response.status);
                    return response.json();
                })
                .then(data => {
                    console.log('API Response:', data);
                    if (data.success) {
                        displayMessages(data.messages);
                        scrollToBottom();
                        
                        // Cập nhật thông tin nhóm
                        loadGroupInfo();
                    } else {
                        console.error('API Error:', data.message);
                        showNotification(data.message || 'Lỗi khi tải tin nhắn!', 'error');
                    }
                })
                .catch(error => {
                    console.error('Error loading messages:', error);
                    showNotification('Lỗi kết nối khi tải tin nhắn!', 'error');
                });
        }
        
        // Hiển thị tin nhắn
        function displayMessages(messages) {
            console.log('Displaying messages:', messages);
            const container = document.getElementById('chatMessages');
            container.innerHTML = '';
            
            if (!messages || messages.length === 0) {
                console.log('No messages to display');
                container.innerHTML = '<div style="text-align: center; padding: 20px; color: var(--text-secondary);">Chưa có tin nhắn nào</div>';
                return;
            }
            
            messages.forEach((message, index) => {
                console.log(`Creating message element ${index}:`, message);
                try {
                    const messageElement = createMessageElement(message);
                    container.appendChild(messageElement);
                } catch (error) {
                    console.error('Error creating message element:', error, message);
                }
            });
            
            if (messages.length > 0) {
                lastMessageId = Math.max(...messages.map(m => parseInt(m.id)));
                console.log('Last message ID set to:', lastMessageId);
            }
        }
        
        // Tạo element tin nhắn
        function createMessageElement(message) {
            console.log('Creating message element for:', message);
            
            const div = document.createElement('div');
            const isOwnMessage = message.user_id == currentUserId;
            const isSystemMessage = message.message_type === 'system';
            
            console.log('Message details:', {
                user_id: message.user_id,
                currentUserId: currentUserId,
                isOwnMessage: isOwnMessage,
                isSystemMessage: isSystemMessage,
                username: message.username,
                message_content: message.message
            });
            
            div.className = `message-item ${isOwnMessage ? 'own' : ''} ${isSystemMessage ? 'system' : ''}`;
            
            const avatarUrl = message.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(message.username || 'User')}&size=32&background=4f46e5&color=ffffff&rounded=true`;
            
            if (isSystemMessage) {
                div.innerHTML = `
                    <div class="message-bubble">
                        <strong>${message.username || 'System'}</strong> ${message.message || ''}
                    </div>
                `;
            } else {
                div.innerHTML = `
                    ${!isOwnMessage ? `<img src="${avatarUrl}" class="user-avatar-small" alt="${message.username || 'User'}">` : ''}
                    <div class="message-bubble">
                        ${!isOwnMessage ? `<div style="font-weight: 600; font-size: 0.8rem; margin-bottom: 4px; color: var(--accent-color);">${message.username || 'User'}</div>` : ''}
                        <div>${(message.message || '').replace(/\n/g, '<br>')}</div>
                        <div class="message-meta">
                            ${message.created_at ? new Date(message.created_at).toLocaleString('vi-VN') : 'Unknown time'}
                            ${message.is_edited == 1 ? ' (đã chỉnh sửa)' : ''}
                        </div>
                    </div>
                    ${isOwnMessage ? `<img src="${avatarUrl}" class="user-avatar-small" alt="${message.username || 'User'}">` : ''}
                `;
            }
            
            console.log('Created message element HTML:', div.innerHTML);
            return div;
        }
        
        // Gửi tin nhắn
        function sendChatMessage() {
            const input = document.getElementById('chatInput');
            const message = input.value.trim();
            
            if (!message || !currentChatGroupId) return;
            
            const sendBtn = document.getElementById('chatSendBtn');
            sendBtn.disabled = true;
            sendBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            
            fetch('api/chat.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'send_message',
                    group_id: currentChatGroupId,
                    message: message
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    input.value = '';
                    loadChatMessages();  // Reload messages
                } else {
                    showNotification(data.message || 'Lỗi khi gửi tin nhắn!', 'error');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showNotification('Lỗi kết nối!', 'error');
            })
            .finally(() => {
                sendBtn.disabled = false;
                sendBtn.innerHTML = '<i class="fas fa-paper-plane"></i>';
                input.focus();
            });
        }
        
        // Polling tin nhắn mới
        function startChatPolling() {
            chatPollingInterval = setInterval(() => {
                if (currentChatGroupId) {
                                         // Check for new messages
                     fetch(`api/chat.php?action=group_messages&group_id=${currentChatGroupId}&limit=10&offset=0`)
                         .then(response => response.json())
                         .then(data => {
                             if (data.success && data.messages.length > 0) {
                                 const newMessages = data.messages.filter(m => parseInt(m.id) > lastMessageId);
                                 if (newMessages.length > 0) {
                                     newMessages.forEach(message => {
                                         const messageElement = createMessageElement(message);
                                         document.getElementById('chatMessages').appendChild(messageElement);
                                     });
                                     lastMessageId = Math.max(...data.messages.map(m => parseInt(m.id)));
                                     scrollToBottom();
                                     updateLastSeen(currentChatGroupId);
                                 }
                             }
                         })
                         .catch(error => console.error('Polling error:', error));
                }
            }, 2000); // Poll mỗi 2 giây
        }
        
        // Load thông tin nhóm
        function loadGroupInfo() {
            if (!currentChatGroupId) return;
            
            console.log('Loading group info for:', currentChatGroupId);
            
            fetch(`api/chat.php?action=group_members&group_id=${currentChatGroupId}`)
                .then(response => response.json())
                .then(data => {
                    console.log('Group info response:', data);
                    if (data.success) {
                        document.getElementById('chatGroupInfo').textContent = `${data.members.length} thành viên`;
                    } else {
                        console.error('Group info error:', data.message);
                    }
                })
                .catch(error => console.error('Error loading group info:', error));
        }
        
        // Cập nhật last seen
        function updateLastSeen(groupId) {
            fetch('api/chat.php', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'update_last_seen',
                    group_id: groupId
                })
            })
            .catch(error => console.error('Error updating last seen:', error));
        }
        
        // Cuộn xuống cuối
        function scrollToBottom() {
            const container = document.getElementById('chatMessages');
            container.scrollTop = container.scrollHeight;
        }
        
        // Tham gia chat sự kiện
        function joinEventChat(groupId, postId) {
            fetch('api/chat.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'join_group',
                    group_id: groupId
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showNotification(data.message, 'success');
                    setTimeout(() => location.reload(), 1000);
                } else {
                    showNotification(data.message || 'Lỗi khi tham gia nhóm!', 'error');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showNotification('Lỗi kết nối!', 'error');
            });
        }
        
        // Tạo chat cho sự kiện
        function createEventChat(postId) {
            const groupName = prompt('Nhập tên nhóm chat cho sự kiện:');
            if (!groupName || !groupName.trim()) return;
            
            fetch('api/chat.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'create_group',
                    event_post_id: postId,
                    group_name: groupName.trim(),
                    description: 'Nhóm chat cho sự kiện',
                    max_members: 100
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showNotification(data.message, 'success');
                    setTimeout(() => location.reload(), 1000);
                } else {
                    showNotification(data.message || 'Lỗi khi tạo nhóm!', 'error');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showNotification('Lỗi kết nối!', 'error');
            });
        }
        
        // Hiển thị thành viên nhóm
        function showGroupMembers() {
            if (!currentChatGroupId) return;
            
            fetch(`api/chat.php?action=group_members&group_id=${currentChatGroupId}`)
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        let memberList = 'Thành viên nhóm:\n\n';
                        data.members.forEach(member => {
                            memberList += `• ${member.username} ${member.role === 'admin' ? '(Quản trị)' : ''}\n`;
                        });
                        alert(memberList);
                    }
                })
                .catch(error => console.error('Error:', error));
        }
        
        // Xử lý Enter trong chat input
        document.getElementById('chatInput').addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendChatMessage();
            }
        });
        
        // Đóng modal khi click bên ngoài
        document.getElementById('chatModal').addEventListener('click', function(e) {
            if (e.target === this) {
                closeChatModal();
            }
        });
        
        // =============================================
        // CHỨC NĂNG TÌM KIẾM NGƯỜI DÙNG
        // =============================================
        
        let searchTimeout = null;
        const searchInput = document.getElementById('userSearchInput');
        const searchResults = document.getElementById('searchResults');
        const searchLoading = document.getElementById('searchLoading');
        
        // Xử lý tìm kiếm với debounce
        searchInput.addEventListener('input', function() {
            const query = this.value.trim();
            
            // Clear previous timeout
            if (searchTimeout) {
                clearTimeout(searchTimeout);
            }
            
            // Reset nếu input trống
            if (query.length === 0) {
                showNoResults('Nhập tên để tìm kiếm thành viên trong cộng đồng');
                return;
            }
            
            // Hiển thị loading
            showSearchLoading(true);
            
            // Debounce 500ms
            searchTimeout = setTimeout(() => {
                performUserSearch(query);
            }, 500);
        });
        
        // Thực hiện tìm kiếm
        function performUserSearch(query) {
            if (query.length < 2) {
                showNoResults('Vui lòng nhập ít nhất 2 ký tự');
                showSearchLoading(false);
                return;
            }
            
            fetch(`api/search_users.php?q=${encodeURIComponent(query)}&limit=10`)
                .then(response => response.json())
                .then(data => {
                    showSearchLoading(false);
                    
                    if (data.success && data.users.length > 0) {
                        displaySearchResults(data.users);
                    } else {
                        showNoResults(`Không tìm thấy người dùng nào với từ khóa "${query}"`);
                    }
                })
                .catch(error => {
                    console.error('Search error:', error);
                    showSearchLoading(false);
                    showNoResults('Có lỗi xảy ra khi tìm kiếm. Vui lòng thử lại!');
                });
        }
        
        // Hiển thị kết quả tìm kiếm
        function displaySearchResults(users) {
            let html = '';
            
            users.forEach(user => {
                html += `
                    <div class="user-item" onclick="viewUserProfile(${user.id}, '${user.username}')">
                        <img src="${user.avatar_url}" class="user-avatar" alt="${user.username}" 
                             onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&size=48&background=6366f1&color=ffffff&rounded=true'">
                        <div class="user-info">
                            <div class="user-name">${user.username}</div>
                            <div class="user-stats">
                                <span class="user-stat">
                                    <i class="fas fa-edit"></i>
                                    ${user.post_count} bài viết
                                </span>
                                <span class="user-stat">
                                    <i class="fas fa-heart"></i>
                                    ${user.total_likes} lượt thích
                                </span>
                                <span class="user-stat">
                                    <i class="fas fa-calendar"></i>
                                    ${user.join_date}
                                </span>
                            </div>
                        </div>
                    </div>
                `;
            });
            
            searchResults.innerHTML = html;
        }
        
        // Hiển thị trạng thái không có kết quả
        function showNoResults(message) {
            searchResults.innerHTML = `
                <div class="no-results" style="text-align: center; padding: 40px 20px; color: var(--text-secondary);">
                    <i class="fas fa-users" style="font-size: 2rem; margin-bottom: 12px; display: block; color: var(--text-muted);"></i>
                    <p>${message}</p>
                </div>
            `;
        }
        
        // Hiển thị/ẩn loading
        function showSearchLoading(show) {
            if (show) {
                searchLoading.style.display = 'block';
                document.querySelector('.search-icon').style.display = 'none';
            } else {
                searchLoading.style.display = 'none';
                document.querySelector('.search-icon').style.display = 'block';
            }
        }
        
        // Xem profile người dùng
        function viewUserProfile(userId, username) {
            // TODO: Implement user profile modal hoặc redirect
            const profileInfo = `
Thông tin người dùng: ${username}
ID: ${userId}

Tính năng xem profile chi tiết đang được phát triển!

Bạn có thể:
- Gửi tin nhắn trực tiếp
- Xem tất cả bài viết
- Theo dõi hoạt động
            `;
            alert(profileInfo);
        }
        
        // Xử lý click vào avatar để xem profile
        function showUserProfile(username) {
            viewUserProfile(null, username);
        }
        
        // Thêm click handler cho tất cả avatar
        document.addEventListener('click', function(e) {
            if (e.target.classList.contains('user-avatar') || 
                e.target.classList.contains('user-avatar-small') || 
                e.target.classList.contains('user-avatar-large')) {
                const username = e.target.getAttribute('title') || e.target.getAttribute('alt');
                if (username && !e.target.closest('.user-item')) { // Không trigger nếu đã trong user-item
                    showUserProfile(username);
                }
            }
        });
    </script>
    
    <?php if (isset($_GET['debug']) && $_GET['debug'] === '1'): ?>
    <!-- Developer Debug Info - Only visible with ?debug=1 parameter -->
    <div style="margin-top: 50px; padding: 20px; background: #f9f9f9; border: 1px solid #ddd; border-radius: 8px; font-family: monospace;">
        <h3>Debug Information</h3>
        <p><strong>Current Working Directory:</strong> <?= getcwd() ?></p>
        <p><strong>Document Root:</strong> <?= $_SERVER['DOCUMENT_ROOT'] ?></p>
        <p><strong>PHP Version:</strong> <?= phpversion() ?></p>
        
        <h4>Avatar Paths (Readable):</h4>
        <ul>
            <?php
            $testPaths = [
                'uploads/avatars/',
                '../uploads/avatars/',
                'html/uploads/avatars/'
            ];
            
            foreach ($testPaths as $path) {
                echo '<li>' . $path . ' - ' . (is_readable($path) ? 'Readable ✓' : 'Not Readable ✗') . ' - ' . (is_dir($path) ? 'Dir Exists ✓' : 'Dir Not Found ✗') . '</li>';
            }
            ?>
        </ul>
        
        <h4>Current User Avatar:</h4>
        <p>Avatar Path in DB: <?= htmlspecialchars($current_user_avatar ?? 'null') ?></p>
        <p>Resolved Avatar URL: <?= htmlspecialchars($user_avatar) ?></p>
        <img src="<?= htmlspecialchars($user_avatar) ?>" style="width: 80px; height: 80px; border-radius: 50%;">
    </div>
    <?php endif; ?>
</body>
</html> 