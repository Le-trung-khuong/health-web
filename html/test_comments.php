<?php
session_start();
require_once 'config/database.php';

// Set user session for testing (user ID 1)
$_SESSION['user_id'] = 1;
$_SESSION['username'] = 'admin';

echo "<h2>Test Comments API</h2>";

// Test 1: Get comments for post 1
echo "<h3>Test 1: Lấy comments cho post ID 1</h3>";
$response = file_get_contents('http://localhost/k91/html/api/comment.php?post_id=1');
$data = json_decode($response, true);
echo "<pre>" . print_r($data, true) . "</pre>";

// Test 2: Create new comment
echo "<h3>Test 2: Tạo comment mới</h3>";
$postData = json_encode([
    'post_id' => 1,
    'content' => 'Đây là comment test từ PHP ' . date('H:i:s')
]);

$context = stream_context_create([
    'http' => [
        'method' => 'POST',
        'header' => 'Content-Type: application/json',
        'content' => $postData
    ]
]);

$response = file_get_contents('http://localhost/k91/html/api/comment.php', false, $context);
$data = json_decode($response, true);
echo "<pre>" . print_r($data, true) . "</pre>";

// Test 3: Create reply to comment 1
echo "<h3>Test 3: Tạo reply cho comment ID 1</h3>";
$replyData = json_encode([
    'post_id' => 1,
    'content' => 'Đây là reply test từ PHP ' . date('H:i:s'),
    'parent_id' => 1
]);

$context = stream_context_create([
    'http' => [
        'method' => 'POST',
        'header' => 'Content-Type: application/json',
        'content' => $replyData
    ]
]);

$response = file_get_contents('http://localhost/k91/html/api/comment.php', false, $context);
$data = json_decode($response, true);
echo "<pre>" . print_r($data, true) . "</pre>";

// Test 4: Get comments again to see structure
echo "<h3>Test 4: Lấy lại comments để xem cấu trúc reply</h3>";
$response = file_get_contents('http://localhost/k91/html/api/comment.php?post_id=1');
$data = json_decode($response, true);
echo "<pre>" . print_r($data, true) . "</pre>";

echo "<br><a href='community.php'>Quay lại Community</a>";
?> 