-- ================================================
-- SCRIPT DATABASE ĐƠN GIẢN CHO PHPMYADMIN
-- VÀ CHỨC NĂNG REPLY COMMENT
-- ================================================

-- Tạo database
CREATE DATABASE IF NOT EXISTS community_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE community_db;

-- ================================================
-- TẠO CÁC BẢNG CƠ BẢN
-- ================================================

-- Bảng users (người dùng)
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng community_posts (bài viết)
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
    INDEX idx_post_type (post_type),
    INDEX idx_user_id (user_id),
    INDEX idx_user_created (user_id, created_at DESC),
    CONSTRAINT fk_posts_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng post_likes (lượt thích)
CREATE TABLE IF NOT EXISTS post_likes (
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

-- Bảng post_comments (bình luận) - HỖ TRỢ REPLY
CREATE TABLE IF NOT EXISTS post_comments (
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
CREATE TABLE IF NOT EXISTS comment_likes (
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

-- Bảng fundraising_campaigns (chiến dịch gây quỹ)
CREATE TABLE IF NOT EXISTS fundraising_campaigns (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    target_amount DECIMAL(15,2) NOT NULL,
    current_amount DECIMAL(15,2) DEFAULT 0,
    created_by INT NOT NULL,
    image_url VARCHAR(255),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status ENUM('active', 'completed', 'cancelled', 'paused') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_end_date (end_date),
    INDEX idx_created_by (created_by),
    CONSTRAINT fk_campaigns_user FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng donations (quyên góp)
CREATE TABLE IF NOT EXISTS donations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    campaign_id INT NOT NULL,
    user_id INT,
    amount DECIMAL(10,2) NOT NULL,
    donor_name VARCHAR(100),
    donor_email VARCHAR(100),
    donor_phone VARCHAR(20),
    message TEXT,
    payment_method ENUM('bank_transfer', 'momo', 'zalopay', 'cash') DEFAULT 'bank_transfer',
    transaction_id VARCHAR(100),
    status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
    is_anonymous TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_campaign_id (campaign_id),
    INDEX idx_status (status),
    INDEX idx_user_id (user_id),
    CONSTRAINT fk_donations_campaign FOREIGN KEY (campaign_id) REFERENCES fundraising_campaigns(id) ON DELETE CASCADE,
    CONSTRAINT fk_donations_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng notifications (thông báo)
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
    INDEX idx_user_id (user_id),
    INDEX idx_is_read (is_read),
    INDEX idx_created_at (created_at),
    INDEX idx_user_read (user_id, is_read),
    CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng user_follows (theo dõi người dùng)
CREATE TABLE IF NOT EXISTS user_follows (
    id INT AUTO_INCREMENT PRIMARY KEY,
    follower_id INT NOT NULL,
    following_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_follow (follower_id, following_id),
    INDEX idx_follower (follower_id),
    INDEX idx_following (following_id),
    CONSTRAINT fk_follows_follower FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_follows_following FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng reports (báo cáo vi phạm)
CREATE TABLE IF NOT EXISTS reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    reporter_id INT NOT NULL,
    reported_type ENUM('post', 'comment', 'user') NOT NULL,
    reported_id INT NOT NULL,
    reason ENUM('spam', 'inappropriate', 'harassment', 'misinformation', 'other') NOT NULL,
    description TEXT,
    status ENUM('pending', 'reviewed', 'resolved', 'dismissed') DEFAULT 'pending',
    admin_note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP NULL,
    INDEX idx_status (status),
    INDEX idx_reported_type (reported_type),
    INDEX idx_reporter_id (reporter_id),
    CONSTRAINT fk_reports_user FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================
-- TRIGGER ĐỂ CẬP NHẬT REPLY_COUNT TỰ ĐỘNG
-- Chạy từng trigger một nếu gặp lỗi
-- ================================================

-- Trigger 1: Tăng reply_count khi thêm reply
DELIMITER $$
CREATE TRIGGER tr_comment_reply_insert 
AFTER INSERT ON post_comments
FOR EACH ROW
BEGIN
    IF NEW.parent_id IS NOT NULL THEN
        UPDATE post_comments 
        SET reply_count = reply_count + 1 
        WHERE id = NEW.parent_id;
        
        UPDATE post_comments 
        SET reply_level = (
            SELECT COALESCE(reply_level, 0) + 1 
            FROM post_comments p2 
            WHERE p2.id = NEW.parent_id
        )
        WHERE id = NEW.id;
    END IF;
END$$
DELIMITER ;

-- Trigger 2: Giảm reply_count khi xóa reply
DELIMITER $$
CREATE TRIGGER tr_comment_reply_delete 
AFTER DELETE ON post_comments
FOR EACH ROW
BEGIN
    IF OLD.parent_id IS NOT NULL THEN
        UPDATE post_comments 
        SET reply_count = GREATEST(reply_count - 1, 0) 
        WHERE id = OLD.parent_id;
    END IF;
END$$
DELIMITER ;

-- ================================================
-- TẠO DỮ LIỆU MẪU
-- ================================================

-- Xóa dữ liệu cũ (cẩn thận!)
DELETE FROM comment_likes;
DELETE FROM post_comments;
DELETE FROM post_likes;
DELETE FROM donations;
DELETE FROM notifications;
DELETE FROM fundraising_campaigns;
DELETE FROM community_posts;
DELETE FROM user_follows;
DELETE FROM reports;
DELETE FROM users;

-- Reset AUTO_INCREMENT
ALTER TABLE users AUTO_INCREMENT = 1;
ALTER TABLE community_posts AUTO_INCREMENT = 1;
ALTER TABLE post_comments AUTO_INCREMENT = 1;
ALTER TABLE fundraising_campaigns AUTO_INCREMENT = 1;

-- Tạo users mẫu
INSERT INTO users (username, email, password, avatar, bio, is_verified, is_admin) VALUES 
('admin', 'admin@community.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin-avatar.jpg', 'Quản trị viên hệ thống', 1, 1),
('nguoi_dung_1', 'user1@community.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user1-avatar.jpg', 'Tôi là một thành viên tích cực của cộng đồng', 0, 0),
('hoat_dong_vien', 'activist@community.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'activist-avatar.jpg', 'Hoạt động viên xã hội, quan tâm đến các vấn đề cộng đồng', 1, 0),
('bac_si_tran', 'bs.tran@community.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'doctor-avatar.jpg', 'Bác sĩ chuyên khoa tâm thần, tư vấn về tệ nạn xã hội', 1, 0),
('teacher_mai', 'mai.teacher@community.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'teacher-avatar.jpg', 'Giáo viên quan tâm đến giáo dục phòng chống tệ nạn xã hội', 1, 0);

-- Tạo chiến dịch gây quỹ mẫu
INSERT INTO fundraising_campaigns (title, description, target_amount, current_amount, created_by, start_date, end_date, status) VALUES 
(
    'Hỗ trợ cai nghiện cho người vô gia cư',
    'Chiến dịch này nhằm cung cấp dịch vụ cai nghiện miễn phí cho những người vô gia cư bị nghiện ma túy.',
    500000000.00,
    125000000.00,
    3,
    '2024-01-01',
    '2024-12-31',
    'active'
);

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
);

-- Tạo post likes mẫu
INSERT INTO post_likes (post_id, user_id) VALUES 
(1, 2), (1, 4), (1, 5),
(2, 1), (2, 3), (2, 5);

-- Tạo comments gốc
INSERT INTO post_comments (post_id, user_id, content, parent_id, reply_level) VALUES 
(1, 2, 'Cảm ơn bạn đã chia sẻ! Mình nghĩ việc giáo dục phải bắt đầu từ gia đình trước.', NULL, 0),
(1, 4, 'Rất đồng ý! Trong thực hành tư vấn, mình thấy những gia đình có giao tiếp tốt thường ít gặp vấn đề này hơn.', NULL, 0),
(2, 3, 'Cảm ơn bác sĩ đã chia sẻ những dấu hiệu này. Mình sẽ chú ý quan sát con mình thêm.', NULL, 0);

-- Tạo replies cấp 1
INSERT INTO post_comments (post_id, user_id, content, parent_id, reply_level) VALUES 
(1, 3, 'Đúng vậy! Gia đình là nền tảng đầu tiên và quan trọng nhất.', 1, 1),
(1, 5, 'Mình là giáo viên và thấy rất nhiều gia đình không biết cách tiếp cận vấn đề này.', 1, 1),
(2, 2, 'Bác sĩ có thể tư vấn cụ thể hơn về cách giao tiếp với con không ạ?', 3, 1);

-- Tạo replies cấp 2
INSERT INTO post_comments (post_id, user_id, content, parent_id, reply_level) VALUES 
(1, 4, 'Ý tưởng tập huấn cho phụ huynh rất hay! Mình có thể hỗ trợ với kiến thức chuyên môn.', 5, 2),
(2, 4, 'Mình sẽ viết một bài hướng dẫn chi tiết về cách tiếp cận này nhé!', 6, 2);

-- Tạo comment likes mẫu
INSERT INTO comment_likes (comment_id, user_id) VALUES 
(1, 1), (1, 3), (1, 4),
(2, 1), (2, 2),
(3, 1), (3, 2), (3, 4),
(4, 2), (4, 3),
(5, 1), (5, 3);

-- Cập nhật reply_count thủ công
UPDATE post_comments SET reply_count = (
    SELECT COUNT(*) 
    FROM post_comments AS replies 
    WHERE replies.parent_id = post_comments.id
) WHERE parent_id IS NULL;

-- ================================================
-- TẠO INDEXES TỐI ƯU
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
    (SELECT COUNT(*) FROM fundraising_campaigns WHERE status = 'active') AS active_campaigns,
    (SELECT COALESCE(SUM(current_amount), 0) FROM fundraising_campaigns) AS total_raised;

-- Hiển thị thống kê
SELECT 'Thống kê cộng đồng sau khi cài đặt' AS info;
SELECT * FROM community_stats;

-- Hiển thị cấu trúc comments
SELECT 'Cấu trúc comments mẫu' AS info;
SELECT 
    c.id,
    c.content,
    c.parent_id,
    c.reply_level,
    c.reply_count,
    u.username
FROM post_comments c
LEFT JOIN users u ON c.user_id = u.id
ORDER BY 
    CASE WHEN c.parent_id IS NULL THEN c.id ELSE c.parent_id END ASC,
    c.parent_id ASC,
    c.created_at ASC; 