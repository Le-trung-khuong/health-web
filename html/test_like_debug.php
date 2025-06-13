<?php
session_start();
require_once 'config/database.php';

// Fake login for testing
if (!isset($_SESSION['user_id'])) {
    $_SESSION['user_id'] = 1; // Admin user
    $_SESSION['username'] = 'admin';
}

// Get a test post
$stmt = $pdo->prepare("SELECT * FROM community_posts LIMIT 1");
$stmt->execute();
$post = $stmt->fetch();

if (!$post) {
    die("No posts found. Please create a post first.");
}

$post_id = $post['id'];

// Get current likes
$stmt = $pdo->prepare("SELECT COUNT(*) as count FROM post_likes WHERE post_id = ?");
$stmt->execute([$post_id]);
$likes_count = $stmt->fetch()['count'];

// Check if current user liked
$stmt = $pdo->prepare("SELECT id FROM post_likes WHERE post_id = ? AND user_id = ?");
$stmt->execute([$post_id, $_SESSION['user_id']]);
$user_liked = $stmt->rowCount() > 0;
?>

<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test Like Debug</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: 50px auto;
            padding: 20px;
            background: #f5f5f5;
        }
        
        .test-card {
            background: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            margin-bottom: 20px;
        }
        
        .like-btn {
            background: none;
            border: none;
            padding: 10px 15px;
            border-radius: 20px;
            cursor: pointer;
            transition: all 0.2s ease;
            font-size: 14px;
        }
        
        .like-btn:hover {
            background: #f0f2f5;
        }
        
        .like-btn.liked {
            color: #ef4444;
        }
        
        .like-btn.liked i {
            color: #ef4444 !important;
        }
        
        .stats {
            margin: 15px 0;
            padding: 10px;
            background: #f8f9fa;
            border-radius: 5px;
        }
        
        .debug {
            background: #e3f2fd;
            padding: 15px;
            border-radius: 5px;
            margin: 10px 0;
            font-family: monospace;
            font-size: 12px;
        }
        
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 5px;
            color: white;
            font-weight: bold;
            z-index: 1000;
            opacity: 0;
            transform: translateX(100%);
            transition: all 0.3s ease;
        }
        
        .notification.success {
            background: #4caf50;
        }
        
        .notification.error {
            background: #f44336;
        }
        
        .notification.show {
            opacity: 1;
            transform: translateX(0);
        }
    </style>
</head>
<body>
    <div class="test-card">
        <h2>Like Function Debug Test</h2>
        <p><strong>Post ID:</strong> <?php echo $post_id; ?></p>
        <p><strong>Post Content:</strong> <?php echo substr($post['content'], 0, 100) . '...'; ?></p>
        
        <div class="stats" id="post-stats">
            <?php if ($likes_count > 0): ?>
                <span><i class="fas fa-heart" style="color: #ef4444;"></i> <?php echo $likes_count; ?> lượt thích</span>
            <?php endif; ?>
        </div>
        
        <button class="like-btn <?php echo $user_liked ? 'liked' : ''; ?>" data-post-id="<?php echo $post_id; ?>" id="like-btn">
            <i class="<?php echo $user_liked ? 'fas' : 'far'; ?> fa-heart"></i> 
            <span>Thích</span>
        </button>
        
        <div class="debug" id="debug-info">
            <strong>Debug Info:</strong><br>
            Current likes: <?php echo $likes_count; ?><br>
            User liked: <?php echo $user_liked ? 'Yes' : 'No'; ?><br>
            User ID: <?php echo $_SESSION['user_id']; ?>
        </div>
    </div>

    <div id="notification" class="notification"></div>

    <script>
        const isLoggedIn = true;
        
        function showNotification(message, type = 'success') {
            const notification = document.getElementById('notification');
            notification.textContent = message;
            notification.className = `notification ${type}`;
            notification.classList.add('show');
            
            setTimeout(() => {
                notification.classList.remove('show');
            }, 3000);
        }
        
        function updateDebugInfo(data) {
            const debugInfo = document.getElementById('debug-info');
            debugInfo.innerHTML = `
                <strong>Debug Info:</strong><br>
                Current likes: ${data.likes_count}<br>
                User liked: ${data.liked ? 'Yes' : 'No'}<br>
                User ID: <?php echo $_SESSION['user_id']; ?><br>
                <strong>Last API Response:</strong><br>
                ${JSON.stringify(data, null, 2)}
            `;
        }

        // Like functionality
        document.addEventListener('click', function(e) {
            if (e.target.closest('.like-btn')) {
                e.preventDefault();
                e.stopPropagation();
                
                const btn = e.target.closest('.like-btn');
                const postId = btn.dataset.postId;
                
                console.log('Like button clicked:', {postId, btn});
                
                if (!postId) {
                    console.error('Post ID not found');
                    showNotification('Lỗi: Không tìm thấy ID bài viết', 'error');
                    return;
                }
                
                // Disable button
                btn.disabled = true;
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
                    console.log('Response status:', response.status);
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    console.log('Like API response:', data);
                    updateDebugInfo(data);
                    
                    if (data.success) {
                        // Toggle liked state
                        if (data.liked) {
                            btn.classList.add('liked');
                            console.log('Added liked class');
                        } else {
                            btn.classList.remove('liked');
                            console.log('Removed liked class');
                        }
                        
                        // Update stats
                        const statsSection = document.getElementById('post-stats');
                        let newStatsHTML = '';
                        
                        if (data.likes_count > 0) {
                            newStatsHTML = `<span><i class="fas fa-heart" style="color: #ef4444;"></i> ${data.likes_count} lượt thích</span>`;
                        }
                        
                        console.log('Updating stats:', newStatsHTML);
                        statsSection.innerHTML = newStatsHTML;
                        
                        // Visual feedback
                        btn.style.transform = 'scale(1.1)';
                        setTimeout(() => {
                            btn.style.transform = '';
                        }, 200);
                        
                        showNotification(
                            data.liked ? 'Đã thích bài viết!' : 'Đã bỏ thích bài viết!', 
                            'success'
                        );
                        
                    } else {
                        console.error('API Error:', data.message);
                        showNotification(data.message || 'Có lỗi xảy ra!', 'error');
                    }
                })
                .catch(error => {
                    console.error('Like Error:', error);
                    showNotification('Có lỗi kết nối: ' + error.message, 'error');
                })
                .finally(() => {
                    // Re-enable button
                    btn.disabled = false;
                    const isLiked = btn.classList.contains('liked');
                    btn.innerHTML = `<i class="${isLiked ? 'fas' : 'far'} fa-heart"></i> <span>Thích</span>`;
                });
            }
        });
    </script>
</body>
</html> 