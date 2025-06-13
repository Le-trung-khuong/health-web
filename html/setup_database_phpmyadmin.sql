-- ================================================
-- SCRIPT DATABASE HOÀN TOÀN TƯƠNG THÍCH PHPMYADMIN
-- CHỨC NĂNG REPLY COMMENT - KHÔNG CẦN TRIGGERS
-- ================================================

-- Xóa database cũ nếu tồn tại (cẩn thận!)
DROP DATABASE IF EXISTS community_db;

-- Tạo database mới
CREATE DATABASE community_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE community_db;

-- ================================================
-- TẠO CÁC BẢNG CƠ BẢN
-- ================================================

-- Bảng users (người dùng)
CREATE TABLE users (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng community_posts (bài viết)
CREATE TABLE community_posts (
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
    INDEX idx_post_type (post_type),
    INDEX idx_user_id (user_id),
    CONSTRAINT fk_posts_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng post_likes (lượt thích)
CREATE TABLE post_likes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_like (post_id, user_id),
    INDEX idx_post_id (post_id),
    INDEX idx_user_id (user_id),
    CONSTRAINT fk_likes_post FOREIGN KEY (post_id) REFERENCES community_posts(id) ON DELETE CASCADE,
    CONSTRAINT fk_likes_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng post_comments (bình luận) - HỖ TRỢ REPLY HOÀN CHỈNH
CREATE TABLE post_comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    user_id INT NOT NULL,
    content TEXT NOT NULL,
    parent_id INT DEFAULT NULL COMMENT 'ID của comment cha (null nếu là comment gốc)',
    reply_level INT DEFAULT 0 COMMENT 'Cấp độ reply (0=comment gốc, 1=reply cấp 1, 2=reply cấp 2)',
    reply_count INT DEFAULT 0 COMMENT 'Số lượng reply trực tiếp',
    is_approved TINYINT(1) DEFAULT 1,
    is_edited TINYINT(1) DEFAULT 0 COMMENT 'Đánh dấu comment đã được chỉnh sửa',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_post_id (post_id),
    INDEX idx_parent_id (parent_id),
    INDEX idx_user_id (user_id),
    INDEX idx_post_created (post_id, created_at DESC),
    INDEX idx_post_parent (post_id, parent_id),
    INDEX idx_reply_level (reply_level),
    CONSTRAINT fk_comments_post FOREIGN KEY (post_id) REFERENCES community_posts(id) ON DELETE CASCADE,
    CONSTRAINT fk_comments_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_comments_parent FOREIGN KEY (parent_id) REFERENCES post_comments(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng comment_likes (lượt thích cho bình luận)
CREATE TABLE comment_likes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    comment_id INT NOT NULL,
    user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_comment_like (comment_id, user_id),
    INDEX idx_comment_id (comment_id),
    INDEX idx_user_id (user_id),
    CONSTRAINT fk_comment_likes_comment FOREIGN KEY (comment_id) REFERENCES post_comments(id) ON DELETE CASCADE,
    CONSTRAINT fk_comment_likes_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng notifications (thông báo)
CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    type ENUM('like', 'comment', 'donation', 'mention', 'follow', 'campaign', 'reply') NOT NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT,
    related_id INT,
    related_type ENUM('post', 'comment', 'campaign', 'user'),
    is_read TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_is_read (is_read),
    INDEX idx_created_at (created_at),
    CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================
-- TẠO DỮ LIỆU MẪU
-- ================================================

-- Tạo users mẫu
INSERT INTO users (username, email, password, avatar, bio, is_verified, is_admin) VALUES 
('admin', 'admin@community.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin-avatar.jpg', 'Quản trị viên hệ thống', 1, 1),
('nguoi_dung_1', 'user1@community.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user1-avatar.jpg', 'Thành viên tích cực của cộng đồng', 0, 0),
('hoat_dong_vien', 'activist@community.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'activist-avatar.jpg', 'Hoạt động viên xã hội', 1, 0),
('bac_si_tran', 'bs.tran@community.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'doctor-avatar.jpg', 'Bác sĩ chuyên khoa tâm thần', 1, 0),
('teacher_mai', 'mai.teacher@community.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'teacher-avatar.jpg', 'Giáo viên quan tâm đến giáo dục', 1, 0);

-- Tạo bài viết mẫu
INSERT INTO community_posts (user_id, content, post_type, created_at) VALUES 
(
    3,
    'Chào mọi người! Mình muốn chia sẻ về tầm quan trọng của việc giáo dục phòng chống tệ nạn xã hội từ sớm. Theo nghiên cứu, 85% các trường hợp nghiện ma túy bắt đầu từ tuổi thanh thiếu niên.',
    'normal',
    '2024-01-15 08:30:00'
),
(
    4,
    'Hôm nay mình có buổi tư vấn cho một gia đình có con nghiện game và cờ bạc online. Thực sự rất đau lòng khi thấy cậu bé 16 tuổi đã mắc nợ hơn 50 triệu từ việc cá độ.',
    'normal',
    '2024-01-14 14:20:00'
),
(
    5,
    'Các bạn có biết cách nào để nhận biết sớm dấu hiệu nghiện game ở trẻ em không? Mình đang lo lắng về con mình.',
    'normal',
    '2024-01-13 16:45:00'
);

-- Tạo post likes mẫu
INSERT INTO post_likes (post_id, user_id) VALUES 
(1, 2), (1, 4), (1, 5),
(2, 1), (2, 3), (2, 5),
(3, 1), (3, 2), (3, 4);

-- Tạo comments gốc (parent_id = NULL, reply_level = 0)
INSERT INTO post_comments (post_id, user_id, content, parent_id, reply_level, reply_count) VALUES 
(1, 2, 'Cảm ơn bạn đã chia sẻ! Mình nghĩ việc giáo dục phải bắt đầu từ gia đình trước.', NULL, 0, 2),
(1, 4, 'Rất đồng ý! Trong thực hành tư vấn, mình thấy những gia đình có giao tiếp tốt thường ít gặp vấn đề này hơn.', NULL, 0, 1),
(2, 3, 'Cảm ơn bác sĩ đã chia sẻ. Có cách nào để phòng ngừa không ạ?', NULL, 0, 1),
(3, 4, 'Một số dấu hiệu cần chú ý: thay đổi thói quen ngủ, giảm tương tác xã hội, cáu gắt khi không được chơi game.', NULL, 0, 2);

-- Tạo replies cấp 1 (parent_id != NULL, reply_level = 1)
INSERT INTO post_comments (post_id, user_id, content, parent_id, reply_level, reply_count) VALUES 
(1, 3, 'Đúng vậy! Gia đình là nền tảng đầu tiên và quan trọng nhất.', 1, 1, 1),
(1, 5, 'Mình là giáo viên và thấy rất nhiều gia đình không biết cách tiếp cận vấn đề này.', 1, 1, 0),
(1, 2, 'Bác sĩ có thể tư vấn cụ thể hơn về cách giao tiếp với trẻ không ạ?', 2, 1, 0),
(2, 2, 'Có thể tham khảo các chương trình tư vấn tâm lý miễn phí ạ.', 3, 1, 0),
(3, 5, 'Cảm ơn bác sĩ! Còn về thời gian chơi game hợp lý thì sao ạ?', 4, 1, 1);

-- Tạo replies cấp 2 (parent_id của reply cấp 1, reply_level = 2)
INSERT INTO post_comments (post_id, user_id, content, parent_id, reply_level, reply_count) VALUES 
(1, 4, 'Mình có thể hỗ trợ tập huấn cho phụ huynh về vấn đề này!', 5, 2, 0),
(3, 4, 'Với trẻ dưới 12 tuổi: tối đa 1 tiếng/ngày. Trẻ 12-16 tuổi: tối đa 2 tiếng/ngày, có nghỉ giải lao.', 9, 2, 0);

-- Tạo comment likes mẫu
INSERT INTO comment_likes (comment_id, user_id) VALUES 
(1, 1), (1, 3), (1, 4), (1, 5),
(2, 1), (2, 2), (2, 3),
(3, 1), (3, 2), (3, 4), (3, 5),
(4, 1), (4, 2), (4, 3),
(5, 2), (5, 3), (5, 4),
(6, 1), (6, 3), (6, 4),
(7, 1), (7, 3), (7, 5),
(8, 2), (8, 3), (8, 4),
(9, 1), (9, 2), (9, 3),
(10, 2), (10, 3), (10, 5),
(11, 1), (11, 2), (11, 3), (11, 5);

-- ================================================
-- TẠO INDEXES TỐI ƯU CHO PERFORMANCE
-- ================================================

CREATE INDEX idx_comments_post_parent_created ON post_comments(post_id, parent_id, created_at);
CREATE INDEX idx_comments_reply_level ON post_comments(post_id, reply_level, created_at);
CREATE INDEX idx_posts_user_created ON community_posts(user_id, created_at DESC);
CREATE INDEX idx_comment_likes_comment_user ON comment_likes(comment_id, user_id);

-- ================================================
-- TẠO VIEW THỐNG KÊ
-- ================================================

CREATE VIEW community_stats AS
SELECT 
    (SELECT COUNT(*) FROM users) AS total_users,
    (SELECT COUNT(*) FROM community_posts WHERE is_approved = 1) AS total_posts,
    (SELECT COUNT(*) FROM post_likes) AS total_likes,
    (SELECT COUNT(*) FROM post_comments WHERE is_approved = 1) AS total_comments,
    (SELECT COUNT(*) FROM post_comments WHERE parent_id IS NOT NULL AND is_approved = 1) AS total_replies,
    (SELECT COUNT(*) FROM comment_likes) AS total_comment_likes;

-- ================================================
-- BẢNG CHAT GROUPS CHO EVENTS
-- ================================================

-- Bảng chat_groups (nhóm chat cho events)
CREATE TABLE chat_groups (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng chat_members (thành viên trong nhóm chat)
CREATE TABLE chat_members (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng chat_messages (tin nhắn trong nhóm)
CREATE TABLE chat_messages (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================
-- DỮ LIỆU MẪU CHO CHAT
-- ================================================

-- Tạo một bài viết sự kiện mẫu để test chat
INSERT INTO community_posts (user_id, content, post_type, created_at) VALUES 
(3, 'Tổ chức buổi tọa đàm "Phòng chống tệ nạn xã hội trong giới trẻ" vào Chủ nhật tuần tới tại Trung tâm Văn hóa Quận 1. Mọi người quan tâm có thể tham gia nhóm chat để thảo luận chi tiết!', 'event', NOW());

-- Tạo nhóm chat cho sự kiện
INSERT INTO chat_groups (event_post_id, group_name, description, created_by, max_members) VALUES
((SELECT MAX(id) FROM community_posts WHERE post_type = 'event'), 'Chat Tọa Đàm Phòng Chống Tệ Nạn', 'Nhóm thảo luận về buổi tọa đàm sắp tới', 3, 100);

-- Thêm thành viên vào nhóm chat
INSERT INTO chat_members (group_id, user_id, role) VALUES
((SELECT MAX(id) FROM chat_groups), 3, 'admin'),
((SELECT MAX(id) FROM chat_groups), 1, 'member'),
((SELECT MAX(id) FROM chat_groups), 2, 'member'),
((SELECT MAX(id) FROM chat_groups), 4, 'member');

-- Thêm một số tin nhắn mẫu
INSERT INTO chat_messages (group_id, user_id, message, message_type) VALUES
((SELECT MAX(id) FROM chat_groups), 3, 'Chào mọi người! Cảm ơn các bạn đã tham gia nhóm chat của sự kiện.', 'text'),
((SELECT MAX(id) FROM chat_groups), 1, 'Xin chào! Mình rất mong được tham gia buổi tọa đàm này.', 'text'),
((SELECT MAX(id) FROM chat_groups), 4, 'Buổi tọa đàm có dành cho học sinh phổ thông không ạ?', 'text'),
((SELECT MAX(id) FROM chat_groups), 3, 'Có chứ! Chúng ta sẽ có phần dành riêng cho học sinh.', 'text');

-- ================================================
-- HIỂN THỊ KẾT QUẢ
-- ================================================

SELECT 'THỐNG KÊ CỘNG ĐỒNG SAU KHI CÀI ĐẶT' AS info;
SELECT * FROM community_stats;

SELECT '' AS `separator`;
SELECT 'CẤU TRÚC COMMENTS VỚI REPLIES' AS info;
SELECT 
    c.id,
    CASE 
        WHEN c.reply_level = 0 THEN c.content
        WHEN c.reply_level = 1 THEN CONCAT('  └─ ', c.content)
        WHEN c.reply_level = 2 THEN CONCAT('    └─ ', c.content)
        ELSE CONCAT(REPEAT('  ', c.reply_level), '└─ ', c.content)
    END AS content_with_structure,
    c.parent_id,
    c.reply_level,
    c.reply_count,
    u.username,
    (SELECT COUNT(*) FROM comment_likes cl WHERE cl.comment_id = c.id) AS likes_count
FROM post_comments c
LEFT JOIN users u ON c.user_id = u.id
ORDER BY 
    CASE WHEN c.parent_id IS NULL THEN c.id ELSE c.parent_id END ASC,
    c.parent_id ASC,
    c.created_at ASC;

SELECT '' AS `separator`;
SELECT 'HƯỚNG DẪN SỬ DỤNG' AS info;
SELECT 'Database đã được tạo thành công!' AS message;
SELECT 'Bây giờ bạn có thể:' AS step1;
SELECT '1. Vào community.php để test' AS step2;
SELECT '2. Đăng nhập với tài khoản: admin / password123' AS step3;
SELECT '3. Thử comment và reply để kiểm tra' AS step4;
SELECT '4. Hệ thống reply đa cấp đã sẵn sàng!' AS step5;
