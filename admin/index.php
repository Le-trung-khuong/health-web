<?php
// connect.php
$host = '127.0.0.1';    // hoặc 'localhost'
$user = 'root';         // user mặc định
$pass = '';             // để trống nếu chưa đặt mật khẩu
$db   = 'web_k91';     // tên database bạn vừa tạo

$conn = new mysqli($host, $user, $pass, $db);

if ($conn->connect_error) {
    die("Kết nối thất bại: " . $conn->connect_error);
}
echo "Kết nối thành côngâkakjssj!";
?>
