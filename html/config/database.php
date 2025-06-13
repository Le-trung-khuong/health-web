<?php
/**
 * Cấu hình kết nối Database cho Community
 * Tương thích với setup_database_phpmyadmin.sql
 */

$host = 'localhost';
$dbname = 'community_db';
$username = 'root';
$password = '123456';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    
    // Tạo biến $conn để tương thích với các file khác
    $conn = $pdo;
    
    // Đảm bảo các bảng cần thiết tồn tại
    ensureTablesExist($pdo);
} catch(PDOException $e) {
    die("Lỗi kết nối database: " . $e->getMessage());
}

/**
 * Kiểm tra và tạo các bảng cần thiết nếu chưa tồn tại
 * Tương thích với cấu trúc từ setup_database_phpmyadmin.sql
 */
function ensureTablesExist($pdo) {
    try {
        // Kiểm tra xem database đã được setup chưa
        $stmt = $pdo->query("SHOW TABLES LIKE 'users'");
        if ($stmt->rowCount() == 0) {
            // Database chưa được setup, tạo cấu trúc cơ bản
            createBasicTables($pdo);
        } else {
            // Database đã tồn tại, kiểm tra và cập nhật cấu trúc nếu cần
            updateTableStructure($pdo);
        }
    } catch (PDOException $e) {
        // Nếu có lỗi, chỉ log mà không dừng ứng dụng
        error_log("Database setup warning: " . $e->getMessage());
    }
}

/**
 * Tạo cấu trúc bảng cơ bản (chỉ khi database hoàn toàn trống)
 */
function createBasicTables($pdo) {
    // Bảng users với cấu trúc đầy đủ
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(50) NOT NULL UNIQUE,
            email VARCHAR(100) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            avatar VARCHAR(255) DEFAULT 'default-avatar.jpg',
            bio TEXT,
            is_verified TINYINT(1) DEFAULT 0,
            is_admin TINYINT(1) DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");

    // Bảng community_posts
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS community_posts (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            content TEXT NOT NULL,
            media_url VARCHAR(255) DEFAULT NULL,
            media_type ENUM('image', 'video') DEFAULT NULL,
            post_type ENUM('normal', 'fundraising', 'event') DEFAULT 'normal',
            is_featured TINYINT(1) DEFAULT 0,
            is_approved TINYINT(1) DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_created_at (created_at),
            INDEX idx_user_id (user_id),
            CONSTRAINT fk_posts_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");

    // Bảng post_comments với hỗ trợ reply
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS post_comments (
            id INT AUTO_INCREMENT PRIMARY KEY,
            post_id INT NOT NULL,
            user_id INT NOT NULL,
            content TEXT NOT NULL,
            parent_id INT DEFAULT NULL,
            reply_level INT DEFAULT 0,
            reply_count INT DEFAULT 0,
            is_approved TINYINT(1) DEFAULT 1,
            is_edited TINYINT(1) DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_post_id (post_id),
            INDEX idx_parent_id (parent_id),
            INDEX idx_user_id (user_id),
            CONSTRAINT fk_comments_post FOREIGN KEY (post_id) REFERENCES community_posts(id) ON DELETE CASCADE,
            CONSTRAINT fk_comments_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            CONSTRAINT fk_comments_parent FOREIGN KEY (parent_id) REFERENCES post_comments(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");

    // Các bảng khác...
    createOtherTables($pdo);
    
    // Tạo user admin mặc định
    createDefaultUsers($pdo);
}

/**
 * Cập nhật cấu trúc bảng nếu cần thiết
 */
function updateTableStructure($pdo) {
    try {
        // Kiểm tra và thêm cột reply_level nếu chưa có
        $stmt = $pdo->query("SHOW COLUMNS FROM post_comments LIKE 'reply_level'");
        if ($stmt->rowCount() == 0) {
            $pdo->exec("ALTER TABLE post_comments ADD COLUMN reply_level INT DEFAULT 0 AFTER parent_id");
        }
        
        // Kiểm tra và thêm cột reply_count nếu chưa có
        $stmt = $pdo->query("SHOW COLUMNS FROM post_comments LIKE 'reply_count'");
        if ($stmt->rowCount() == 0) {
            $pdo->exec("ALTER TABLE post_comments ADD COLUMN reply_count INT DEFAULT 0 AFTER reply_level");
        }
        
        // Kiểm tra và thêm cột is_edited nếu chưa có
        $stmt = $pdo->query("SHOW COLUMNS FROM post_comments LIKE 'is_edited'");
        if ($stmt->rowCount() == 0) {
            $pdo->exec("ALTER TABLE post_comments ADD COLUMN is_edited TINYINT(1) DEFAULT 0 AFTER is_approved");
        }
        
        // Kiểm tra và thêm cột is_verified cho users nếu chưa có
        $stmt = $pdo->query("SHOW COLUMNS FROM users LIKE 'is_verified'");
        if ($stmt->rowCount() == 0) {
            $pdo->exec("ALTER TABLE users ADD COLUMN is_verified TINYINT(1) DEFAULT 0 AFTER avatar");
        }
        
        // Kiểm tra và thêm cột is_admin cho users nếu chưa có
        $stmt = $pdo->query("SHOW COLUMNS FROM users LIKE 'is_admin'");
        if ($stmt->rowCount() == 0) {
            $pdo->exec("ALTER TABLE users ADD COLUMN is_admin TINYINT(1) DEFAULT 0 AFTER is_verified");
        }
        
        // Kiểm tra và thêm cột bio cho users nếu chưa có
        $stmt = $pdo->query("SHOW COLUMNS FROM users LIKE 'bio'");
        if ($stmt->rowCount() == 0) {
            $pdo->exec("ALTER TABLE users ADD COLUMN bio TEXT AFTER avatar");
        }
        
    } catch (PDOException $e) {
        // Log lỗi nhưng không dừng ứng dụng
        error_log("Table structure update warning: " . $e->getMessage());
    }
}

/**
 * Tạo các bảng khác
 */
function createOtherTables($pdo) {
    // Bảng post_likes
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS post_likes (
            id INT AUTO_INCREMENT PRIMARY KEY,
            post_id INT NOT NULL,
            user_id INT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY unique_like (post_id, user_id),
            CONSTRAINT fk_likes_post FOREIGN KEY (post_id) REFERENCES community_posts(id) ON DELETE CASCADE,
            CONSTRAINT fk_likes_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");

    // Bảng comment_likes
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS comment_likes (
            id INT AUTO_INCREMENT PRIMARY KEY,
            comment_id INT NOT NULL,
            user_id INT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY unique_comment_like (comment_id, user_id),
            CONSTRAINT fk_comment_likes_comment FOREIGN KEY (comment_id) REFERENCES post_comments(id) ON DELETE CASCADE,
            CONSTRAINT fk_comment_likes_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");

    // Bảng notifications
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS notifications (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            type ENUM('like', 'comment', 'donation', 'mention', 'follow', 'campaign', 'reply') NOT NULL,
            title VARCHAR(200) NOT NULL,
            content TEXT,
            related_id INT,
            related_type ENUM('post', 'comment', 'campaign', 'user'),
            is_read TINYINT(1) DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");

    // Bảng chat_groups (nhóm chat cho events)
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS chat_groups (
            id INT AUTO_INCREMENT PRIMARY KEY,
            event_post_id INT NOT NULL COMMENT 'ID của bài viết sự kiện',
            group_name VARCHAR(200) NOT NULL,
            description TEXT,
            created_by INT NOT NULL,
            max_members INT DEFAULT 50,
            is_active TINYINT(1) DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_event_post (event_post_id),
            INDEX idx_created_by (created_by),
            INDEX idx_is_active (is_active),
            CONSTRAINT fk_chat_groups_post FOREIGN KEY (event_post_id) REFERENCES community_posts(id) ON DELETE CASCADE,
            CONSTRAINT fk_chat_groups_creator FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");

    // Bảng chat_members (thành viên trong nhóm chat)
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS chat_members (
            id INT AUTO_INCREMENT PRIMARY KEY,
            group_id INT NOT NULL,
            user_id INT NOT NULL,
            role ENUM('admin', 'member') DEFAULT 'member',
            joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            is_muted TINYINT(1) DEFAULT 0,
            UNIQUE KEY unique_member (group_id, user_id),
            INDEX idx_group_id (group_id),
            INDEX idx_user_id (user_id),
            INDEX idx_last_seen (last_seen),
            CONSTRAINT fk_chat_members_group FOREIGN KEY (group_id) REFERENCES chat_groups(id) ON DELETE CASCADE,
            CONSTRAINT fk_chat_members_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");

    // Bảng chat_messages (tin nhắn trong nhóm)
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS chat_messages (
            id INT AUTO_INCREMENT PRIMARY KEY,
            group_id INT NOT NULL,
            user_id INT NOT NULL,
            message TEXT NOT NULL,
            message_type ENUM('text', 'image', 'file', 'system') DEFAULT 'text',
            reply_to_id INT DEFAULT NULL COMMENT 'ID tin nhắn được reply',
            is_deleted TINYINT(1) DEFAULT 0,
            is_edited TINYINT(1) DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_group_id (group_id),
            INDEX idx_user_id (user_id),
            INDEX idx_created_at (created_at DESC),
            INDEX idx_group_created (group_id, created_at DESC),
            INDEX idx_reply_to (reply_to_id),
            CONSTRAINT fk_chat_messages_group FOREIGN KEY (group_id) REFERENCES chat_groups(id) ON DELETE CASCADE,
            CONSTRAINT fk_chat_messages_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            CONSTRAINT fk_chat_messages_reply FOREIGN KEY (reply_to_id) REFERENCES chat_messages(id) ON DELETE SET NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");
}

/**
 * Tạo users mặc định chỉ khi chưa có
 */
function createDefaultUsers($pdo) {
    try {
        // Kiểm tra xem đã có user nào chưa
        $stmt = $pdo->query("SELECT COUNT(*) FROM users");
        $userCount = $stmt->fetchColumn();
        
        if ($userCount == 0) {
            // Chỉ tạo user mặc định khi database hoàn toàn trống
            $pdo->exec("
                INSERT INTO users (username, email, password, avatar, bio, is_verified, is_admin) VALUES 
                ('admin', 'admin@community.com', '" . password_hash('password123', PASSWORD_DEFAULT) . "', 'admin-avatar.jpg', 'Quản trị viên hệ thống', 1, 1)
            ");
        }
    } catch (PDOException $e) {
        // Bỏ qua lỗi duplicate entry
        if ($e->getCode() != 23000) {
            error_log("Create default users warning: " . $e->getMessage());
        }
    }
}

// Chỉ kiểm tra và setup nếu cần thiết
ensureTablesExist($pdo);
?> 