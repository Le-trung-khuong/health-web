-- ======================================================
-- UPDATE DATABASE CHO TÍNH NĂNG LIKE & REPLY COMMENTS
-- Chạy file này để thêm tính năng like và reply comment
-- ======================================================

USE community_db;

-- Tạo bảng comment_likes để lưu trữ lượt thích cho bình luận
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
);

-- Thêm một số reply comments mẫu (nếu chưa có)
INSERT IGNORE INTO post_comments (post_id, user_id, content, parent_id, created_at) VALUES 
(1, 3, 'Đúng vậy! Gia đình là nền tảng đầu tiên và quan trọng nhất.', 1, '2024-01-15 09:15:00'),
(1, 1, 'Cảm ơn cả hai bạn đã góp ý! Mình sẽ viết bài chi tiết về vai trò của gia đình.', 1, '2024-01-15 10:30:00'),
(2, 2, 'Bác sĩ có thể tư vấn cụ thể hơn về cách giao tiếp với con trong trường hợp này không ạ?', 3, '2024-01-14 15:45:00'),
(2, 4, 'Mình sẽ viết một bài hướng dẫn chi tiết về cách tiếp cận này nhé!', (SELECT id FROM post_comments WHERE content LIKE 'Bác sĩ có thể tư vấn%' LIMIT 1), '2024-01-14 16:20:00');

-- Thêm một số comment likes mẫu
INSERT IGNORE INTO comment_likes (comment_id, user_id) VALUES 
-- Likes cho comment đầu tiên
((SELECT id FROM post_comments WHERE content LIKE 'Cảm ơn bạn đã chia sẻ%' LIMIT 1), 1),
((SELECT id FROM post_comments WHERE content LIKE 'Cảm ơn bạn đã chia sẻ%' LIMIT 1), 3),
((SELECT id FROM post_comments WHERE content LIKE 'Cảm ơn bạn đã chia sẻ%' LIMIT 1), 4),

-- Likes cho comment của bác sĩ
((SELECT id FROM post_comments WHERE content LIKE 'Rất đồng ý! Trong thực hành%' LIMIT 1), 1),
((SELECT id FROM post_comments WHERE content LIKE 'Rất đồng ý! Trong thực hành%' LIMIT 1), 2),

-- Likes cho các comment khác
((SELECT id FROM post_comments WHERE content LIKE 'Cảm ơn bác sĩ đã chia sẻ%' LIMIT 1), 1),
((SELECT id FROM post_comments WHERE content LIKE 'Cảm ơn bác sĩ đã chia sẻ%' LIMIT 1), 2),
((SELECT id FROM post_comments WHERE content LIKE 'Cảm ơn bác sĩ đã chia sẻ%' LIMIT 1), 4),

-- Likes cho reply comments
((SELECT id FROM post_comments WHERE content LIKE 'Đúng vậy! Gia đình là nền tảng%' LIMIT 1), 1),
((SELECT id FROM post_comments WHERE content LIKE 'Đúng vậy! Gia đình là nền tảng%' LIMIT 1), 2);

-- Tạo index để tối ưu performance cho comment likes
CREATE INDEX IF NOT EXISTS idx_comment_likes_created ON comment_likes(created_at DESC);

-- Tạo view để thống kê comment engagement
CREATE OR REPLACE VIEW comment_engagement_stats AS
SELECT 
    c.id,
    c.content,
    c.created_at,
    u.username,
    c.post_id,
    c.parent_id,
    (SELECT COUNT(*) FROM comment_likes WHERE comment_id = c.id) as likes_count,
    (SELECT COUNT(*) FROM post_comments WHERE parent_id = c.id) as replies_count,
    CASE 
        WHEN c.parent_id IS NULL THEN 'main_comment'
        ELSE 'reply'
    END as comment_type
FROM post_comments c
LEFT JOIN users u ON c.user_id = u.id
WHERE c.is_approved = 1
ORDER BY c.created_at DESC;

-- Hiển thị thống kê
SELECT 
    'Tổng số bình luận' as metric,
    COUNT(*) as value
FROM post_comments 
WHERE is_approved = 1

UNION ALL

SELECT 
    'Tổng số trả lời' as metric,
    COUNT(*) as value
FROM post_comments 
WHERE parent_id IS NOT NULL AND is_approved = 1

UNION ALL

SELECT 
    'Tổng số lượt thích comment' as metric,
    COUNT(*) as value
FROM comment_likes

UNION ALL

SELECT 
    'Comment có nhiều like nhất' as metric,
    MAX(likes_count) as value
FROM comment_engagement_stats;

-- Hiển thị top 5 comment được thích nhiều nhất
SELECT 
    username,
    LEFT(content, 50) as preview,
    likes_count,
    replies_count,
    comment_type
FROM comment_engagement_stats 
WHERE likes_count > 0
ORDER BY likes_count DESC, replies_count DESC
LIMIT 5;

COMMIT; 