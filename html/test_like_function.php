<?php
session_start();
require_once 'config/database.php';

// Test data
$test_user_id = 1;
$test_post_id = 1;

echo "<h2>Test Like Function</h2>";

// Test 1: Check if user and post exist
echo "<h3>Test 1: Check Data Existence</h3>";
$user_check = $pdo->prepare("SELECT username FROM users WHERE id = ?");
$user_check->execute([$test_user_id]);
$user = $user_check->fetch();

$post_check = $pdo->prepare("SELECT content FROM community_posts WHERE id = ?");
$post_check->execute([$test_post_id]);
$post = $post_check->fetch();

echo "User ID $test_user_id: " . ($user ? "EXISTS ({$user['username']})" : "NOT FOUND") . "<br>";
echo "Post ID $test_post_id: " . ($post ? "EXISTS" : "NOT FOUND") . "<br>";

if (!$user || !$post) {
    echo "<p style='color: red;'>Cannot proceed with tests - missing data</p>";
    exit;
}

// Test 2: Check current like status
echo "<h3>Test 2: Current Like Status</h3>";
$like_check = $pdo->prepare("SELECT id FROM post_likes WHERE post_id = ? AND user_id = ?");
$like_check->execute([$test_post_id, $test_user_id]);
$current_like = $like_check->fetch();

echo "Current like status: " . ($current_like ? "LIKED" : "NOT LIKED") . "<br>";

// Test 3: Get total likes count
$likes_count = $pdo->prepare("SELECT COUNT(*) as count FROM post_likes WHERE post_id = ?");
$likes_count->execute([$test_post_id]);
$total_likes = $likes_count->fetch()['count'];

echo "Total likes for post: $total_likes<br>";

// Test 4: Simulate like API call
echo "<h3>Test 3: Simulate Like API</h3>";

// Set session for test
$_SESSION['user_id'] = $test_user_id;

// Simulate the like logic
try {
    $stmt = $pdo->prepare("SELECT id FROM post_likes WHERE post_id = ? AND user_id = ?");
    $stmt->execute([$test_post_id, $test_user_id]);
    
    if ($stmt->rowCount() > 0) {
        // Already liked, remove like
        $stmt = $pdo->prepare("DELETE FROM post_likes WHERE post_id = ? AND user_id = ?");
        $stmt->execute([$test_post_id, $test_user_id]);
        $action = "REMOVED LIKE";
        $liked = false;
    } else {
        // Not liked, add like
        $stmt = $pdo->prepare("INSERT INTO post_likes (post_id, user_id) VALUES (?, ?)");
        $stmt->execute([$test_post_id, $test_user_id]);
        $action = "ADDED LIKE";
        $liked = true;
    }
    
    // Get new count
    $stmt = $pdo->prepare("SELECT COUNT(*) as count FROM post_likes WHERE post_id = ?");
    $stmt->execute([$test_post_id]);
    $new_likes_count = $stmt->fetch()['count'];
    
    echo "Action: $action<br>";
    echo "New like status: " . ($liked ? "LIKED" : "NOT LIKED") . "<br>";
    echo "New total likes: $new_likes_count<br>";
    
    $result = [
        'success' => true,
        'liked' => $liked,
        'likes_count' => $new_likes_count
    ];
    
    echo "<h4>API Response would be:</h4>";
    echo "<pre>" . json_encode($result, JSON_PRETTY_PRINT) . "</pre>";
    
} catch (PDOException $e) {
    echo "<p style='color: red;'>Database error: " . $e->getMessage() . "</p>";
}

// Test 5: Check database structure
echo "<h3>Test 4: Database Structure Check</h3>";
try {
    $tables = $pdo->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
    echo "Available tables: " . implode(', ', $tables) . "<br>";
    
    if (in_array('post_likes', $tables)) {
        $columns = $pdo->query("DESCRIBE post_likes")->fetchAll();
        echo "<h4>post_likes table structure:</h4>";
        echo "<table border='1' style='border-collapse: collapse;'>";
        echo "<tr><th>Field</th><th>Type</th><th>Null</th><th>Key</th><th>Default</th></tr>";
        foreach ($columns as $col) {
            echo "<tr>";
            echo "<td>{$col['Field']}</td>";
            echo "<td>{$col['Type']}</td>";
            echo "<td>{$col['Null']}</td>";
            echo "<td>{$col['Key']}</td>";
            echo "<td>{$col['Default']}</td>";
            echo "</tr>";
        }
        echo "</table>";
    }
    
} catch (PDOException $e) {
    echo "<p style='color: red;'>Error checking database structure: " . $e->getMessage() . "</p>";
}

// Test 6: Test with AJAX simulation
echo "<h3>Test 5: AJAX Simulation</h3>";
echo "<button onclick='testLikeAjax()'>Test Like AJAX</button>";
echo "<div id='ajax-result'></div>";

?>

<script>
function testLikeAjax() {
    const resultDiv = document.getElementById('ajax-result');
    resultDiv.innerHTML = 'Testing...';
    
    fetch('api/like.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({post_id: <?= $test_post_id ?>})
    })
    .then(response => {
        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);
        return response.text();
    })
    .then(text => {
        console.log('Response text:', text);
        try {
            const data = JSON.parse(text);
            resultDiv.innerHTML = `
                <h4>AJAX Test Result:</h4>
                <pre>${JSON.stringify(data, null, 2)}</pre>
            `;
        } catch (e) {
            resultDiv.innerHTML = `
                <h4>AJAX Test Error:</h4>
                <p style="color: red;">Failed to parse JSON response</p>
                <pre>${text}</pre>
            `;
        }
    })
    .catch(error => {
        console.error('AJAX Error:', error);
        resultDiv.innerHTML = `
            <h4>AJAX Test Error:</h4>
            <p style="color: red;">${error.message}</p>
        `;
    });
}
</script>

<style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    h2, h3, h4 { color: #333; }
    pre { background: #f5f5f5; padding: 10px; border-radius: 4px; }
    button { padding: 10px 20px; background: #007cba; color: white; border: none; border-radius: 4px; cursor: pointer; }
    button:hover { background: #005a87; }
</style> 