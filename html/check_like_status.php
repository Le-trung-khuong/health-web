<?php
require_once 'config/database.php';

echo "<h2>Like Status Check</h2>";

// Get all posts with their like counts
$stmt = $pdo->prepare("
    SELECT p.id, p.content, 
           (SELECT COUNT(*) FROM post_likes pl WHERE pl.post_id = p.id) as likes_count
    FROM community_posts p 
    ORDER BY p.id
");
$stmt->execute();
$posts = $stmt->fetchAll();

echo "<table border='1' style='border-collapse: collapse; width: 100%;'>";
echo "<tr><th>Post ID</th><th>Content</th><th>Likes Count</th><th>Actions</th></tr>";

foreach ($posts as $post) {
    echo "<tr>";
    echo "<td>" . $post['id'] . "</td>";
    echo "<td>" . substr($post['content'], 0, 50) . "...</td>";
    echo "<td>" . $post['likes_count'] . "</td>";
    echo "<td>";
    echo "<button onclick='testLike(" . $post['id'] . ")'>Test Like</button> ";
    echo "<button onclick='checkLikes(" . $post['id'] . ")'>Check Likes</button>";
    echo "</td>";
    echo "</tr>";
}

echo "</table>";

echo "<div id='result' style='margin-top: 20px; padding: 10px; background: #f0f0f0;'></div>";

echo "<script>
function testLike(postId) {
    fetch('api/like.php', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({post_id: postId})
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('result').innerHTML = 'Like result for post ' + postId + ': ' + JSON.stringify(data, null, 2);
        setTimeout(() => location.reload(), 1000);
    })
    .catch(error => {
        document.getElementById('result').innerHTML = 'Error: ' + error.message;
    });
}

function checkLikes(postId) {
    fetch('api/like.php?check=' + postId)
    .then(response => response.json())
    .then(data => {
        document.getElementById('result').innerHTML = 'Likes for post ' + postId + ': ' + JSON.stringify(data, null, 2);
    })
    .catch(error => {
        document.getElementById('result').innerHTML = 'Error: ' + error.message;
    });
}
</script>";

// Show current session
echo "<h3>Current Session:</h3>";
session_start();
echo "<pre>";
print_r($_SESSION);
echo "</pre>";
?> 