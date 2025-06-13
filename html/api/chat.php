<?php
session_start();
// Xử lý đường dẫn config từ các context khác nhau
if (file_exists('../config/database.php')) {
    require_once '../config/database.php';
} elseif (file_exists('config/database.php')) {
    require_once 'config/database.php';
} else {
    die('Database config not found');
}
header('Content-Type: application/json');

// Debug session
error_log('Chat API Debug - Session data: ' . json_encode($_SESSION));
error_log('Chat API Debug - Request method: ' . $_SERVER['REQUEST_METHOD']);
error_log('Chat API Debug - Request URI: ' . $_SERVER['REQUEST_URI']);

// Kiểm tra đăng nhập
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    error_log('Chat API Debug - No user_id in session');
    echo json_encode(['success' => false, 'message' => 'Unauthorized - No session']);
    exit;
}

$user_id = $_SESSION['user_id'];
$method = $_SERVER['REQUEST_METHOD'];

error_log('Chat API Debug - User ID: ' . $user_id . ', Method: ' . $method);

try {
    switch ($method) {
        case 'GET':
            handleGetRequest();
            break;
        case 'POST':
            handlePostRequest();
            break;
        case 'PUT':
            handlePutRequest();
            break;
        case 'DELETE':
            handleDeleteRequest();
            break;
        default:
            http_response_code(405);
            echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}

function handleGetRequest() {
    global $pdo, $user_id;
    
    if (isset($_GET['action'])) {
        switch ($_GET['action']) {
            case 'user_groups':
                getUserGroups();
                break;
            case 'group_messages':
                getGroupMessages();
                break;
            case 'group_members':
                getGroupMembers();
                break;
            default:
                echo json_encode(['success' => false, 'message' => 'Invalid action']);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'Action required']);
    }
}

function handlePostRequest() {
    global $pdo, $user_id;
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        echo json_encode(['success' => false, 'message' => 'Invalid JSON']);
        return;
    }
    
    $action = $input['action'] ?? '';
    
    switch ($action) {
        case 'join_group':
            joinChatGroup($input);
            break;
        case 'create_group':
            createChatGroup($input);
            break;
        case 'send_message':
            sendMessage($input);
            break;
        case 'leave_group':
            leaveChatGroup($input);
            break;
        default:
            echo json_encode(['success' => false, 'message' => 'Invalid action']);
    }
}

function handlePutRequest() {
    global $pdo, $user_id;
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        echo json_encode(['success' => false, 'message' => 'Invalid JSON']);
        return;
    }
    
    $action = $input['action'] ?? '';
    
    switch ($action) {
        case 'edit_message':
            editMessage($input);
            break;
        case 'update_last_seen':
            updateLastSeen($input);
            break;
        default:
            echo json_encode(['success' => false, 'message' => 'Invalid action']);
    }
}

function handleDeleteRequest() {
    global $pdo, $user_id;
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        echo json_encode(['success' => false, 'message' => 'Invalid JSON']);
        return;
    }
    
    $action = $input['action'] ?? '';
    
    switch ($action) {
        case 'delete_message':
            deleteMessage($input);
            break;
        default:
            echo json_encode(['success' => false, 'message' => 'Invalid action']);
    }
}

// Lấy danh sách nhóm chat mà user tham gia
function getUserGroups() {
    global $pdo, $user_id;
    
    $stmt = $pdo->prepare("
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
        WHERE cm.user_id = ? AND cg.is_active = 1
        ORDER BY last_message_time DESC, cg.created_at DESC
    ");
    
    $stmt->execute([$user_id]);
    $groups = $stmt->fetchAll();
    
    echo json_encode(['success' => true, 'groups' => $groups]);
}

// Lấy tin nhắn trong nhóm
function getGroupMessages() {
    global $pdo, $user_id;
    
    $group_id = intval($_GET['group_id'] ?? 0);
    $limit = intval($_GET['limit'] ?? 50);
    $offset = intval($_GET['offset'] ?? 0);
    
    error_log("Chat API Debug - getGroupMessages: group_id=$group_id, user_id=$user_id, limit=$limit, offset=$offset");
    
    // Kiểm tra user có trong nhóm không
    $stmt = $pdo->prepare("SELECT id FROM chat_members WHERE group_id = ? AND user_id = ?");
    $stmt->execute([$group_id, $user_id]);
    
    if (!$stmt->fetch()) {
        error_log("Chat API Debug - User $user_id not member of group $group_id");
        echo json_encode(['success' => false, 'message' => 'Unauthorized access to group']);
        return;
    }
    
    error_log("Chat API Debug - User $user_id is member of group $group_id");
    
    // Lấy tin nhắn - sử dụng query builder để tránh lỗi MySQL
    $query = "
        SELECT cm.*, u.username, u.avatar,
               rt.message as reply_to_message, 
               rt_u.username as reply_to_username
        FROM chat_messages cm
        LEFT JOIN users u ON cm.user_id = u.id
        LEFT JOIN chat_messages rt ON cm.reply_to_id = rt.id
        LEFT JOIN users rt_u ON rt.user_id = rt_u.id
        WHERE cm.group_id = ? AND cm.is_deleted = 0
        ORDER BY cm.created_at DESC
        LIMIT " . intval($offset) . ", " . intval($limit);
    
    $stmt = $pdo->prepare($query);
    $stmt->execute([$group_id]);
    $messages = $stmt->fetchAll();
    
    error_log("Chat API Debug - Found " . count($messages) . " messages before reverse");
    
    // Reverse để hiển thị từ cũ đến mới
    $messages = array_reverse($messages);
    
    error_log("Chat API Debug - Returning " . count($messages) . " messages: " . json_encode(array_map(function($m) {
        return ['id' => $m['id'], 'user' => $m['username'], 'message' => substr($m['message'], 0, 50)];
    }, $messages)));
    
    echo json_encode(['success' => true, 'messages' => $messages]);
}

// Lấy danh sách thành viên nhóm
function getGroupMembers() {
    global $pdo, $user_id;
    
    $group_id = $_GET['group_id'] ?? 0;
    
    // Kiểm tra user có trong nhóm không
    $stmt = $pdo->prepare("SELECT id FROM chat_members WHERE group_id = ? AND user_id = ?");
    $stmt->execute([$group_id, $user_id]);
    
    if (!$stmt->fetch()) {
        echo json_encode(['success' => false, 'message' => 'Unauthorized access to group']);
        return;
    }
    
    $stmt = $pdo->prepare("
        SELECT cm.*, u.username, u.avatar, u.bio
        FROM chat_members cm
        LEFT JOIN users u ON cm.user_id = u.id
        WHERE cm.group_id = ?
        ORDER BY cm.role DESC, cm.joined_at ASC
    ");
    
    $stmt->execute([$group_id]);
    $members = $stmt->fetchAll();
    
    echo json_encode(['success' => true, 'members' => $members]);
}

// Tham gia nhóm chat
function joinChatGroup($input) {
    global $pdo, $user_id;
    
    $group_id = $input['group_id'] ?? 0;
    
    try {
        $pdo->beginTransaction();
        
        // Kiểm tra nhóm có tồn tại và active không
        $stmt = $pdo->prepare("
            SELECT cg.*, (SELECT COUNT(*) FROM chat_members WHERE group_id = cg.id) as current_members
            FROM chat_groups cg 
            WHERE cg.id = ? AND cg.is_active = 1
        ");
        $stmt->execute([$group_id]);
        $group = $stmt->fetch();
        
        if (!$group) {
            echo json_encode(['success' => false, 'message' => 'Nhóm chat không tồn tại hoặc đã bị khóa']);
            return;
        }
        
        if ($group['current_members'] >= $group['max_members']) {
            echo json_encode(['success' => false, 'message' => 'Nhóm chat đã đầy']);
            return;
        }
        
        // Kiểm tra user đã trong nhóm chưa
        $stmt = $pdo->prepare("SELECT id FROM chat_members WHERE group_id = ? AND user_id = ?");
        $stmt->execute([$group_id, $user_id]);
        
        if ($stmt->fetch()) {
            echo json_encode(['success' => false, 'message' => 'Bạn đã tham gia nhóm này rồi']);
            return;
        }
        
        // Thêm user vào nhóm
        $stmt = $pdo->prepare("INSERT INTO chat_members (group_id, user_id, role) VALUES (?, ?, 'member')");
        $stmt->execute([$group_id, $user_id]);
        
        // Thêm thông báo hệ thống
        $stmt = $pdo->prepare("
            INSERT INTO chat_messages (group_id, user_id, message, message_type) 
            VALUES (?, ?, ?, 'system')
        ");
        $stmt->execute([$group_id, $user_id, 'đã tham gia nhóm chat']);
        
        $pdo->commit();
        
        echo json_encode(['success' => true, 'message' => 'Tham gia nhóm chat thành công!']);
        
    } catch (Exception $e) {
        $pdo->rollback();
        echo json_encode(['success' => false, 'message' => 'Lỗi khi tham gia nhóm: ' . $e->getMessage()]);
    }
}

// Tạo nhóm chat cho sự kiện
function createChatGroup($input) {
    global $pdo, $user_id;
    
    $event_post_id = $input['event_post_id'] ?? 0;
    $group_name = trim($input['group_name'] ?? '');
    $description = trim($input['description'] ?? '');
    $max_members = intval($input['max_members'] ?? 50);
    
    if (empty($group_name)) {
        echo json_encode(['success' => false, 'message' => 'Tên nhóm không được để trống']);
        return;
    }
    
    try {
        $pdo->beginTransaction();
        
        // Kiểm tra bài viết sự kiện có tồn tại không
        $stmt = $pdo->prepare("SELECT id FROM community_posts WHERE id = ? AND post_type = 'event' AND user_id = ?");
        $stmt->execute([$event_post_id, $user_id]);
        
        if (!$stmt->fetch()) {
            echo json_encode(['success' => false, 'message' => 'Chỉ người tạo sự kiện mới có thể tạo nhóm chat']);
            return;
        }
        
        // Kiểm tra đã có nhóm chat cho sự kiện này chưa
        $stmt = $pdo->prepare("SELECT id FROM chat_groups WHERE event_post_id = ?");
        $stmt->execute([$event_post_id]);
        
        if ($stmt->fetch()) {
            echo json_encode(['success' => false, 'message' => 'Sự kiện này đã có nhóm chat']);
            return;
        }
        
        // Tạo nhóm chat
        $stmt = $pdo->prepare("
            INSERT INTO chat_groups (event_post_id, group_name, description, created_by, max_members) 
            VALUES (?, ?, ?, ?, ?)
        ");
        $stmt->execute([$event_post_id, $group_name, $description, $user_id, $max_members]);
        $group_id = $pdo->lastInsertId();
        
        // Thêm người tạo vào nhóm với role admin
        $stmt = $pdo->prepare("INSERT INTO chat_members (group_id, user_id, role) VALUES (?, ?, 'admin')");
        $stmt->execute([$group_id, $user_id]);
        
        // Thêm thông báo hệ thống
        $stmt = $pdo->prepare("
            INSERT INTO chat_messages (group_id, user_id, message, message_type) 
            VALUES (?, ?, 'đã tạo nhóm chat', 'system')
        ");
        $stmt->execute([$group_id, $user_id]);
        
        $pdo->commit();
        
        echo json_encode(['success' => true, 'message' => 'Tạo nhóm chat thành công!', 'group_id' => $group_id]);
        
    } catch (Exception $e) {
        $pdo->rollback();
        echo json_encode(['success' => false, 'message' => 'Lỗi khi tạo nhóm: ' . $e->getMessage()]);
    }
}

// Gửi tin nhắn
function sendMessage($input) {
    global $pdo, $user_id;
    
    $group_id = $input['group_id'] ?? 0;
    $message = trim($input['message'] ?? '');
    $reply_to_id = $input['reply_to_id'] ?? null;
    
    if (empty($message)) {
        echo json_encode(['success' => false, 'message' => 'Tin nhắn không được để trống']);
        return;
    }
    
    // Kiểm tra user có trong nhóm không
    $stmt = $pdo->prepare("SELECT id FROM chat_members WHERE group_id = ? AND user_id = ?");
    $stmt->execute([$group_id, $user_id]);
    
    if (!$stmt->fetch()) {
        echo json_encode(['success' => false, 'message' => 'Bạn không có quyền gửi tin nhắn trong nhóm này']);
        return;
    }
    
    try {
        // Gửi tin nhắn
        $stmt = $pdo->prepare("
            INSERT INTO chat_messages (group_id, user_id, message, reply_to_id) 
            VALUES (?, ?, ?, ?)
        ");
        $stmt->execute([$group_id, $user_id, $message, $reply_to_id]);
        $message_id = $pdo->lastInsertId();
        
        // Cập nhật last_seen của user
        $stmt = $pdo->prepare("UPDATE chat_members SET last_seen = NOW() WHERE group_id = ? AND user_id = ?");
        $stmt->execute([$group_id, $user_id]);
        
        echo json_encode(['success' => true, 'message' => 'Gửi tin nhắn thành công!', 'message_id' => $message_id]);
        
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => 'Lỗi khi gửi tin nhắn: ' . $e->getMessage()]);
    }
}

// Rời khỏi nhóm
function leaveChatGroup($input) {
    global $pdo, $user_id;
    
    $group_id = $input['group_id'] ?? 0;
    
    try {
        $pdo->beginTransaction();
        
        // Kiểm tra user có trong nhóm không
        $stmt = $pdo->prepare("SELECT role FROM chat_members WHERE group_id = ? AND user_id = ?");
        $stmt->execute([$group_id, $user_id]);
        $member = $stmt->fetch();
        
        if (!$member) {
            echo json_encode(['success' => false, 'message' => 'Bạn không có trong nhóm này']);
            return;
        }
        
        // Xóa user khỏi nhóm
        $stmt = $pdo->prepare("DELETE FROM chat_members WHERE group_id = ? AND user_id = ?");
        $stmt->execute([$group_id, $user_id]);
        
        // Thêm thông báo hệ thống
        $stmt = $pdo->prepare("
            INSERT INTO chat_messages (group_id, user_id, message, message_type) 
            VALUES (?, ?, 'đã rời khỏi nhóm', 'system')
        ");
        $stmt->execute([$group_id, $user_id]);
        
        $pdo->commit();
        
        echo json_encode(['success' => true, 'message' => 'Rời nhóm thành công!']);
        
    } catch (Exception $e) {
        $pdo->rollback();
        echo json_encode(['success' => false, 'message' => 'Lỗi khi rời nhóm: ' . $e->getMessage()]);
    }
}

// Cập nhật thời gian xem cuối
function updateLastSeen($input) {
    global $pdo, $user_id;
    
    $group_id = $input['group_id'] ?? 0;
    
    $stmt = $pdo->prepare("UPDATE chat_members SET last_seen = NOW() WHERE group_id = ? AND user_id = ?");
    $stmt->execute([$group_id, $user_id]);
    
    echo json_encode(['success' => true]);
}

// Chỉnh sửa tin nhắn
function editMessage($input) {
    global $pdo, $user_id;
    
    $message_id = $input['message_id'] ?? 0;
    $new_message = trim($input['message'] ?? '');
    
    if (empty($new_message)) {
        echo json_encode(['success' => false, 'message' => 'Tin nhắn không được để trống']);
        return;
    }
    
    // Kiểm tra tin nhắn có phải của user không
    $stmt = $pdo->prepare("SELECT id FROM chat_messages WHERE id = ? AND user_id = ?");
    $stmt->execute([$message_id, $user_id]);
    
    if (!$stmt->fetch()) {
        echo json_encode(['success' => false, 'message' => 'Bạn chỉ có thể chỉnh sửa tin nhắn của mình']);
        return;
    }
    
    // Cập nhật tin nhắn
    $stmt = $pdo->prepare("UPDATE chat_messages SET message = ?, is_edited = 1, updated_at = NOW() WHERE id = ?");
    $stmt->execute([$new_message, $message_id]);
    
    echo json_encode(['success' => true, 'message' => 'Chỉnh sửa tin nhắn thành công!']);
}

// Xóa tin nhắn
function deleteMessage($input) {
    global $pdo, $user_id;
    
    $message_id = $input['message_id'] ?? 0;
    
    // Kiểm tra tin nhắn có phải của user không
    $stmt = $pdo->prepare("SELECT id FROM chat_messages WHERE id = ? AND user_id = ?");
    $stmt->execute([$message_id, $user_id]);
    
    if (!$stmt->fetch()) {
        echo json_encode(['success' => false, 'message' => 'Bạn chỉ có thể xóa tin nhắn của mình']);
        return;
    }
    
    // Đánh dấu tin nhắn đã xóa
    $stmt = $pdo->prepare("UPDATE chat_messages SET is_deleted = 1, message = 'Tin nhắn đã được xóa', updated_at = NOW() WHERE id = ?");
    $stmt->execute([$message_id]);
    
    echo json_encode(['success' => true, 'message' => 'Xóa tin nhắn thành công!']);
}
?> 