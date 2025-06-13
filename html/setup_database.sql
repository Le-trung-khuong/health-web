-- ================================================
-- TẠOO DATABASE VÀ CÁC BẢNG CHO COMMUNITY PLATFORM  
-- CẢI TIẾN ĐỂ HỖ TRỢ REPLY COMMENT TỐT HƠN
-- ================================================

-- Xóa database nếu tồn tại (cẩn thận khi chạy trên production)
-- DROP DATABASE IF EXISTS community_db;

CREATE DATABASE IF NOT EXISTS community_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE community_db;

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

-- Bảng post_comments (bình luận) - CẢI TIẾN ĐỂ HỖ TRỢ REPLY TỐT HƠN
CREATE TABLE IF NOT EXISTS post_comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    user_id INT NOT NULL,
    content TEXT NOT NULL,
    parent_id INT DEFAULT NULL COMMENT 'ID của comment cha (null nếu là comment gốc)',
    reply_level INT DEFAULT 0 COMMENT 'Cấp độ reply (0=comment gốc, 1=reply cấp 1, 2=reply cấp 2...)',
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

-- ================================================
-- TRIGGER ĐỂ CẬP NHẬT REPLY_COUNT TỰ ĐỘNG
-- ================================================

DELIMITER $$

-- Trigger tăng reply_count khi thêm comment reply
CREATE TRIGGER tr_comment_reply_insert 
AFTER INSERT ON post_comments
FOR EACH ROW
BEGIN
    IF NEW.parent_id IS NOT NULL THEN
        -- Cập nhật reply_count của comment cha
        UPDATE post_comments 
        SET reply_count = reply_count + 1 
        WHERE id = NEW.parent_id;
        
        -- Cập nhật reply_level cho comment mới
        UPDATE post_comments 
        SET reply_level = (
            SELECT COALESCE(reply_level, 0) + 1 
            FROM post_comments p2 
            WHERE p2.id = NEW.parent_id
        )
        WHERE id = NEW.id;
    END IF;
END$$

-- Trigger giảm reply_count khi xóa comment reply
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
-- STORED PROCEDURE ĐỂ LẤY COMMENTS VỚI REPLIES - PHIÊN BẢN PHPMYADMIN
-- ================================================

-- Lưu ý: Nếu chạy trên phpMyAdmin, copy từng section một và chạy riêng lẻ

-- Section 1: Drop procedure nếu tồn tại
DROP PROCEDURE IF EXISTS GetCommentsWithReplies;

-- Section 2: Tạo procedure (chạy riêng section này)
DELIMITER $$
CREATE PROCEDURE GetCommentsWithReplies(IN post_id_param INT, IN user_id_param INT)
BEGIN
    -- Lấy tất cả comments với replies của bài viết
    IF user_id_param IS NULL THEN
        SELECT 
            c.id,
            c.post_id,
            c.user_id,
            c.content,
            c.parent_id,
            c.reply_level,
            c.reply_count,
            c.is_edited,
            c.created_at,
            c.updated_at,
            u.username,
            u.avatar,
            (SELECT COUNT(*) FROM comment_likes cl WHERE cl.comment_id = c.id) as likes_count,
            0 as user_liked
        FROM post_comments c 
        LEFT JOIN users u ON c.user_id = u.id 
        WHERE c.post_id = post_id_param AND c.is_approved = 1
        ORDER BY 
            CASE WHEN c.parent_id IS NULL THEN c.id ELSE c.parent_id END ASC,
            c.parent_id ASC,
            c.created_at ASC;
    ELSE
        SELECT 
            c.id,
            c.post_id,
            c.user_id,
            c.content,
            c.parent_id,
            c.reply_level,
            c.reply_count,
            c.is_edited,
            c.created_at,
            c.updated_at,
            u.username,
            u.avatar,
            (SELECT COUNT(*) FROM comment_likes cl WHERE cl.comment_id = c.id) as likes_count,
            (SELECT COUNT(*) FROM comment_likes cl_check WHERE cl_check.comment_id = c.id AND cl_check.user_id = user_id_param) as user_liked
        FROM post_comments c 
        LEFT JOIN users u ON c.user_id = u.id 
        WHERE c.post_id = post_id_param AND c.is_approved = 1
        ORDER BY 
            CASE WHEN c.parent_id IS NULL THEN c.id ELSE c.parent_id END ASC,
            c.parent_id ASC,
            c.created_at ASC;
    END IF;
END$$
DELIMITER ;

-- ================================================
-- TẠO DỮ LIỆU MẪU - CẢI TIẾN
-- ================================================

-- Xóa dữ liệu cũ nếu có (thận trọng với production)
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

-- Tạo dữ liệu users mẫu
INSERT INTO users (username, email, password, avatar, bio, is_verified, is_admin) VALUES 
('admin', 'admin@community.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin-avatar.jpg', 'Quản trị viên hệ thống', 1, 1),
('nguoi_dung_1', 'user1@community.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user1-avatar.jpg', 'Tôi là một thành viên tích cực của cộng đồng', 0, 0),
('hoat_dong_vien', 'activist@community.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'activist-avatar.jpg', 'Hoạt động viên xã hội, quan tâm đến các vấn đề cộng đồng', 1, 0),
('bac_si_tran', 'bs.tran@community.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'doctor-avatar.jpg', 'Bác sĩ chuyên khoa tâm thần, tư vấn về tệ nạn xã hội', 1, 0),
('teacher_mai', 'mai.teacher@community.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'teacher-avatar.jpg', 'Giáo viên quan tâm đến giáo dục phòng chống tệ nạn xã hội', 1, 0);

-- Tạo một số chiến dịch gây quỹ mẫu
INSERT INTO fundraising_campaigns (title, description, target_amount, current_amount, created_by, start_date, end_date, status) VALUES 
(
    'Hỗ trợ cai nghiện cho người vô gia cư',
    'Chiến dịch này nhằm cung cấp dịch vụ cai nghiện miễn phí cho những người vô gia cư bị nghiện ma túy. Chúng tôi sẽ xây dựng trung tâm cai nghiện, thuê chuyên gia và cung cấp chỗ ở tạm thời.',
    500000000.00,
    125000000.00,
    3,
    '2024-01-01',
    '2024-12-31',
    'active'
),
(
    'Giáo dục phòng chống tệ nạn xã hội cho học sinh',
    'Tổ chức các buổi tọa đàm, hội thảo giáo dục về tác hại của ma túy, cờ bạc, mại dâm cho học sinh THPT trên toàn quốc.',
    200000000.00,
    89000000.00,
    4,
    '2024-02-01',
    '2024-11-30',
    'active'
),
(
    'Xây dựng trung tâm tư vấn tâm lý miễn phí',
    'Thành lập trung tâm tư vấn tâm lý miễn phí cho những người bị ảnh hưởng bởi tệ nạn xã hội và gia đình họ.',
    300000000.00,
    56000000.00,
    4,
    '2024-01-15',
    '2024-10-15',
    'active'
);

-- Tạo một số bài viết mẫu
INSERT INTO community_posts (user_id, content, post_type, created_at) VALUES 
(
    3,
    'Chào mọi người! Mình muốn chia sẻ về tầm quan trọng của việc giáo dục phòng chống tệ nạn xã hội từ sớm. Theo nghiên cứu, 85% các trường hợp nghiện ma túy bắt đầu từ tuổi thanh thiếu niên. Vì vậy, việc trang bị kiến thức cho các em từ cấp 2, cấp 3 là rất cần thiết. 

Mọi người có kinh nghiệm gì trong việc giáo dục con em về vấn đề này không? Chia sẻ để chúng ta cùng học hỏi nhé! 💪

#PhongChongTeNan #GiaoDuc #CongDong',
    'normal',
    '2024-01-15 08:30:00'
),
(
    4,
    'Hôm nay mình có buổi tư vấn cho một gia đình có con nghiện game và cờ bạc online. Thực sự rất đau lòng khi thấy cậu bé 16 tuổi đã mắc nợ hơn 50 triệu từ việc cá độ.

Các dấu hiệu cảnh báo mà cha mẹ cần chú ý:
- Con thường xuyên đòi tiền với lý do không rõ ràng
- Thay đổi tính cách, trở nên bí ẩn, tránh giao tiếp
- Thời gian sử dụng điện thoại/máy tính tăng đột biến
- Điểm số giảm sút, không quan tâm đến học tập

Nếu phát hiện con có những dấu hiệu này, hãy tìm đến sự trợ giúp của chuyên gia ngay! 🆘

#TuVanTamLy #PhongChongCoRac #GiaDinh',
    'normal',
    '2024-01-14 14:20:00'
),
(
    2,
    'Cảm ơn tất cả mọi người đã ủng hộ chiến dịch "Hỗ trợ cai nghiện cho người vô gia cư" của chúng mình! 🙏

Đến thời điểm hiện tại, chúng ta đã gây quỹ được 125 triệu / 500 triệu đồng mục tiêu. Với số tiền này, chúng ta đã có thể:
✅ Thuê được địa điểm tạm thời
✅ Mua sắm thiết bị y tế cơ bản
✅ Hỗ trợ 15 người bắt đầu quá trình cai nghiện

Chúng mình đã lập báo cáo chi tiết về việc sử dụng quỹ. Mọi người có thể xem tại link trong bio.

Hành trình còn dài, nhưng với sự đồng hành của cộng đồng, mình tin rằng chúng ta sẽ thành công! 💝

#GayQuy #CaiNghien #HoTroCongDong',
    'fundraising',
    '2024-01-13 16:45:00'
),
(
    1,
    'Thông báo: Diễn đàn cộng đồng chính thức ra mắt! 🎉

Xin chào tất cả các thành viên,

Hôm nay chúng ta chính thức ra mắt diễn đàn cộng đồng "Vì một xã hội khỏe mạnh". Đây là nơi để:
🔹 Chia sẻ kiến thức, kinh nghiệm về phòng chống tệ nạn xã hội
🔹 Tìm kiếm sự hỗ trợ và động viên từ cộng đồng  
🔹 Tham gia các chiến dịch gây quỹ và hoạt động thiện nguyện
🔹 Kết nối với những người có cùng chí hướng

Quy tắc cộng đồng:
- Tôn trọng và văn minh trong giao tiếp
- Không chia sẻ thông tin cá nhân nhạy cảm
- Không quảng cáo sản phẩm/dịch vụ không liên quan
- Báo cáo ngay nếu phát hiện nội dung không phù hợp

Chúc tất cả có những trải nghiệm tích cực tại đây! 🌟

#CongDong #KhoiDau #QuanTri',
    'normal',
    '2024-01-12 09:00:00'
);

-- Tạo một số likes và comments mẫu với replies
INSERT INTO post_likes (post_id, user_id) VALUES 
(1, 2), (1, 4), (1, 5),
(2, 1), (2, 3), (2, 5),
(3, 1), (3, 2), (3, 4), (3, 5),
(4, 2), (4, 3), (4, 5);

-- Comments gốc
INSERT INTO post_comments (post_id, user_id, content, parent_id, reply_level) VALUES 
(1, 2, 'Cảm ơn bạn đã chia sẻ! Mình nghĩ việc giáo dục phải bắt đầu từ gia đình trước. Cha mẹ cần trang bị kiến thức để có thể hướng dẫn con em đúng cách.', NULL, 0),
(1, 4, 'Rất đồng ý! Trong thực hành tư vấn, mình thấy những gia đình có giao tiếp tốt thường ít gặp vấn đề này hơn. Việc tạo môi trường an toàn để con cái chia sẻ là rất quan trọng.', NULL, 0),
(2, 3, 'Cảm ơn bác sĩ đã chia sẻ những dấu hiệu này. Mình sẽ chú ý quan sát con mình thêm. Có thể bác sĩ chia sẻ thêm về cách tiếp cận khi phát hiện các dấu hiệu này không ạ?', NULL, 0),
(3, 1, 'Tuyệt vời! Rất admire tinh thần của team. Báo cáo chi tiết thế này giúp mọi người yên tâm ủng hộ hơn. Mình cũng muốn đóng góp một phần nhỏ cho chiến dịch này.', NULL, 0),
(4, 3, 'Chúc mừng diễn đàn ra mắt! Hy vọng sẽ có nhiều hoạt động bổ ích. Mình rất mong chờ các chương trình giáo dục sắp tới.', NULL, 0);

-- Replies cấp 1
INSERT INTO post_comments (post_id, user_id, content, parent_id, reply_level) VALUES 
(1, 3, 'Đúng vậy! Gia đình là nền tảng đầu tiên và quan trọng nhất. Nhưng nhiều cha mẹ cũng thiếu kiến thức để hướng dẫn con em.', 1, 1),
(1, 5, 'Mình là giáo viên và thấy rất nhiều gia đình không biết cách tiếp cận vấn đề này. Có thể tổ chức các buổi tập huấn cho phụ huynh không ạ?', 1, 1),
(1, 1, 'Cảm ơn cả hai bạn đã góp ý! Mình sẽ viết bài chi tiết về vai trò của gia đình và cách thức giáo dục hiệu quả.', 1, 1),
(2, 2, 'Bác sĩ có thể tư vấn cụ thể hơn về cách giao tiếp với con trong trường hợp này không ạ? Con mình cũng có dấu hiệu tương tự.', 3, 1),
(2, 4, 'Mình sẽ viết một bài hướng dẫn chi tiết về cách tiếp cận này nhé! Tình huống của mỗi gia đình khác nhau nên cần cách tiếp cận riêng.', 3, 1),
(3, 2, 'Cảm ơn admin! Mình cũng đã ủng hộ rồi. Hy vọng sớm đạt được mục tiêu để giúp đỡ nhiều người hơn.', 4, 1);

-- Replies cấp 2
INSERT INTO post_comments (post_id, user_id, content, parent_id, reply_level) VALUES 
(1, 4, 'Ý tưởng tập huấn cho phụ huynh rất hay! Mình có thể hỗ trợ với kiến thức chuyên môn về tâm lý.', 7, 2),
(1, 2, 'Mình cũng muốn tham gia! Có thể tổ chức online để nhiều người tham gia hơn.', 7, 2),
(2, 5, 'Nếu bác sĩ viết bài hướng dẫn, mình có thể giúp chia sẻ trong môi trường giáo dục không ạ?', 10, 2);

-- Thêm một số comment likes mẫu
INSERT INTO comment_likes (comment_id, user_id) VALUES 
(1, 1), (1, 3), (1, 4), (1, 5),
(2, 1), (2, 2), (2, 5),
(3, 1), (3, 2), (3, 4), (3, 5),
(4, 2), (4, 3), (4, 5),
(5, 1), (5, 2), (5, 4),
(6, 1), (6, 2), (6, 3),
(7, 1), (7, 3), (7, 4),
(8, 3), (8, 4), (8, 5),
(9, 1), (9, 2), (9, 3),
(10, 1), (10, 2), (10, 3),
(11, 2), (11, 3), (11, 4),
(12, 1), (12, 3), (12, 5),
(13, 2), (13, 4), (13, 5);

-- Tạo một số donations mẫu
INSERT INTO donations (campaign_id, user_id, amount, donor_name, message, status) VALUES 
(1, 2, 5000000.00, 'Nguyễn Văn A', 'Mong chiến dịch thành công, giúp đỡ được nhiều người', 'completed'),
(1, 4, 10000000.00, 'Bác sĩ Trần', 'Với vai trò là bác sĩ, tôi rất ủng hộ sáng kiến này', 'completed'),
(1, 5, 3000000.00, 'Cô Mai', 'Ủng hộ từ một giáo viên quan tâm đến vấn đề xã hội', 'completed'),
(1, NULL, 2000000.00, 'Một người bạn ẩn danh', 'Chúc chiến dịch thành công', 'completed'),
(2, 3, 3000000.00, 'Hoạt động viên A', 'Giáo dục là nền tảng của mọi thay đổi tích cực', 'completed'),
(2, 2, 1500000.00, 'Nguyễn Văn A', 'Ủng hộ giáo dục cho trẻ em', 'completed'),
(3, 5, 2000000.00, 'Cô Mai', 'Tư vấn tâm lý rất quan trọng cho cộng đồng', 'completed');

-- Cập nhật current_amount cho campaigns
UPDATE fundraising_campaigns SET current_amount = (
    SELECT COALESCE(SUM(amount), 0) 
    FROM donations 
    WHERE campaign_id = fundraising_campaigns.id AND status = 'completed'
);

-- Cập nhật reply_count cho các comment cha
UPDATE post_comments SET reply_count = (
    SELECT COUNT(*) 
    FROM post_comments AS replies 
    WHERE replies.parent_id = post_comments.id
) WHERE parent_id IS NULL;

-- ================================================
-- TẠO INDEXES TỐI ƯU CHO PERFORMANCE
-- ================================================

-- Indexes cho comments và replies
CREATE INDEX idx_comments_post_parent_created ON post_comments(post_id, parent_id, created_at);
CREATE INDEX idx_comments_reply_level ON post_comments(post_id, reply_level, created_at);

-- Indexes tổng hợp cho performance
CREATE INDEX idx_posts_user_created ON community_posts(user_id, created_at DESC);
CREATE INDEX idx_comments_post_created ON post_comments(post_id, created_at DESC);
CREATE INDEX idx_likes_post_user ON post_likes(post_id, user_id);
CREATE INDEX idx_donations_campaign_status ON donations(campaign_id, status);
CREATE INDEX idx_comment_likes_comment_user ON comment_likes(comment_id, user_id);

-- ================================================
-- TẠO VIEW ĐỂ THỐNG KÊ VÀ BÁO CÁO
-- ================================================

-- View thống kê tổng quan
CREATE VIEW community_stats AS
SELECT 
    (SELECT COUNT(*) FROM users) AS total_users,
    (SELECT COUNT(*) FROM community_posts WHERE is_approved = 1) AS total_posts,
    (SELECT COUNT(*) FROM post_likes) AS total_likes,
    (SELECT COUNT(*) FROM post_comments WHERE is_approved = 1) AS total_comments,
    (SELECT COUNT(*) FROM post_comments WHERE parent_id IS NOT NULL AND is_approved = 1) AS total_replies,
    (SELECT COUNT(*) FROM fundraising_campaigns WHERE status = 'active') AS active_campaigns,
    (SELECT COALESCE(SUM(current_amount), 0) FROM fundraising_campaigns) AS total_raised;

-- View thống kê comments theo bài viết
CREATE VIEW post_comment_stats AS
SELECT 
    p.id as post_id,
    p.content as post_content,
    u.username as author,
    COUNT(DISTINCT c.id) as total_comments,
    COUNT(DISTINCT CASE WHEN c.parent_id IS NULL THEN c.id END) as root_comments,
    COUNT(DISTINCT CASE WHEN c.parent_id IS NOT NULL THEN c.id END) as replies,
    MAX(c.created_at) as last_comment_at
FROM community_posts p
LEFT JOIN post_comments c ON p.id = c.post_id AND c.is_approved = 1
LEFT JOIN users u ON p.user_id = u.id
GROUP BY p.id, p.content, u.username;

-- View top contributors (người đóng góp nhiều nhất)
CREATE VIEW top_contributors AS
SELECT 
    u.id,
    u.username,
    u.avatar,
    COUNT(DISTINCT p.id) as posts_count,
    COUNT(DISTINCT c.id) as comments_count,
    COUNT(DISTINCT pl.id) as likes_given,
    COUNT(DISTINCT cl.id) as comment_likes_given,
    (COUNT(DISTINCT p.id) * 3 + COUNT(DISTINCT c.id) * 2 + COUNT(DISTINCT pl.id) + COUNT(DISTINCT cl.id)) as activity_score
FROM users u
LEFT JOIN community_posts p ON u.id = p.user_id
LEFT JOIN post_comments c ON u.id = c.user_id
LEFT JOIN post_likes pl ON u.id = pl.user_id
LEFT JOIN comment_likes cl ON u.id = cl.user_id
GROUP BY u.id, u.username, u.avatar
ORDER BY activity_score DESC;

-- Hiển thị thống kê
SELECT 'Thống kê cộng đồng' AS info;
SELECT * FROM community_stats;

SELECT 'Top 5 người đóng góp nhiều nhất' AS info;
SELECT * FROM top_contributors LIMIT 5;

SELECT 'Thống kê comments theo bài viết' AS info;
SELECT * FROM post_comment_stats ORDER BY total_comments DESC LIMIT 10;
