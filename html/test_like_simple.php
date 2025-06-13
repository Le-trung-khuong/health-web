<?php
session_start();
require_once 'config/database.php';

// Auto login for testing
if (!isset($_SESSION['user_id'])) {
    $_SESSION['user_id'] = 1;
    $_SESSION['username'] = 'admin';
}

// Get first post
$stmt = $pdo->prepare("SELECT * FROM community_posts LIMIT 1");
$stmt->execute();
$post = $stmt->fetch();

if (!$post) {
    die("No posts found");
}

// Get likes count
$stmt = $pdo->prepare("SELECT COUNT(*) as count FROM post_likes WHERE post_id = ?");
$stmt->execute([$post['id']]);
$likes_count = $stmt->fetch()['count'];

// Check if user liked
$stmt = $pdo->prepare("SELECT id FROM post_likes WHERE post_id = ? AND user_id = ?");
$stmt->execute([$post['id'], $_SESSION['user_id']]);
$user_liked = $stmt->rowCount() > 0;
?>

<!DOCTYPE html>
<html>
<head>
    <title>Test Like</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        .post-card { border: 1px solid #ddd; padding: 20px; margin: 20px 0; border-radius: 10px; }
        .post-stats { margin: 10px 0; padding: 10px; background: #f5f5f5; }
        .like-btn { background: none; border: none; padding: 10px; cursor: pointer; }
        .like-btn.liked { color: red; }
        .notification { position: fixed; top: 20px; right: 20px; padding: 10px; background: green; color: white; border-radius: 5px; display: none; }
    </style>
</head>
<body>
    <div class="post-card">
        <h3>Test Post</h3>
        <p><?php echo substr($post['content'], 0, 100); ?>...</p>
        
        <div class="post-stats">
            <?php if ($likes_count > 0): ?>
                <span><i class="fas fa-heart" style="color: red;"></i> <?php echo $likes_count; ?> lượt thích</span>
            <?php endif; ?>
        </div>
        
        <button class="like-btn <?php echo $user_liked ? 'liked' : ''; ?>" data-post-id="<?php echo $post['id']; ?>">
            <i class="<?php echo $user_liked ? 'fas' : 'far'; ?> fa-heart"></i> Thích
        </button>
    </div>

    <div class="notification" id="notification"></div>

    <script>
        function showNotification(message) {
            const notif = document.getElementById('notification');
            notif.textContent = message;
            notif.style.display = 'block';
            setTimeout(() => notif.style.display = 'none', 3000);
        }

        function updatePostStats(postCard, likesCount) {
            const statsSection = postCard.querySelector('.post-stats');
            let html = '';
            if (likesCount > 0) {
                html = `<span><i class="fas fa-heart" style="color: red;"></i> ${likesCount} lượt thích</span>`;
            }
            statsSection.innerHTML = html;
            console.log('Updated stats:', html);
        }

        document.addEventListener('click', function(e) {
            if (e.target.closest('.like-btn')) {
                const btn = e.target.closest('.like-btn');
                const postId = btn.dataset.postId;
                
                btn.disabled = true;
                
                fetch('api/like.php', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({post_id: parseInt(postId)})
                })
                .then(response => response.json())
                .then(data => {
                    console.log('Response:', data);
                    
                    if (data.success) {
                        // Update button state
                        if (data.liked) {
                            btn.classList.add('liked');
                            btn.querySelector('i').className = 'fas fa-heart';
                        } else {
                            btn.classList.remove('liked');
                            btn.querySelector('i').className = 'far fa-heart';
                        }
                        
                        // Update stats
                        const postCard = btn.closest('.post-card');
                        updatePostStats(postCard, data.likes_count);
                        
                        showNotification(data.liked ? 'Đã thích!' : 'Đã bỏ thích!');
                    } else {
                        showNotification('Lỗi: ' + data.message);
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    showNotification('Lỗi kết nối');
                })
                .finally(() => {
                    btn.disabled = false;
                });
            }
        });
    </script>
</body>
</html> 