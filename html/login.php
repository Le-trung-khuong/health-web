<?php
// Kết nối đến database
require_once "config/database.php";

// Biến lưu thông báo lỗi
$error = '';
$success = '';

// Xử lý đăng nhập
if ($_SERVER["REQUEST_METHOD"] == "POST" && isset($_POST["login"])) {
    $username = trim($_POST["username"]);
    $password = trim($_POST["password"]);
    
    // Kiểm tra thông tin đăng nhập
    if (empty($username) || empty($password)) {
        $error = "Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu";
    } else {
        try {
            // Truy vấn kiểm tra người dùng
            $stmt = $conn->prepare("SELECT * FROM users WHERE username = :username");
            $stmt->bindParam(':username', $username);
            $stmt->execute();
            
            if ($stmt->rowCount() > 0) {
                $user = $stmt->fetch();
                
                // Kiểm tra mật khẩu
                if (password_verify($password, $user["password"])) {
                    // Đăng nhập thành công, lưu thông tin vào session
                    session_start();
                    $_SESSION["user_id"] = $user["id"];
                    $_SESSION["username"] = $user["username"];
                    $_SESSION["email"] = $user["email"];
                    $_SESSION["is_admin"] = $user["is_admin"];
                    $_SESSION["avatar"] = $user["avatar"];
                    $_SESSION["is_verified"] = $user["is_verified"];
                    
                    // Ghi nhớ đăng nhập nếu được chọn
                    if (isset($_POST["remember"]) && $_POST["remember"] == "on") {
                        $token = bin2hex(random_bytes(32));
                        setcookie("remember_token", $token, time() + 30 * 24 * 60 * 60, "/");
                        
                        // Lưu token vào database (giả sử có bảng user_tokens)
                        // $stmt = $conn->prepare("INSERT INTO user_tokens (user_id, token, expires) VALUES (:user_id, :token, :expires)");
                        // $expires = date("Y-m-d H:i:s", time() + 30 * 24 * 60 * 60);
                        // $stmt->bindParam(':user_id', $user["id"]);
                        // $stmt->bindParam(':token', $token);
                        // $stmt->bindParam(':expires', $expires);
                        // $stmt->execute();
                    }
                    
                    // Chuyển hướng đến trang được yêu cầu hoặc trang chính
                    $redirect = $_GET['redirect'] ?? 'index.html';
                    header("Location: " . $redirect);
                    exit;
                } else {
                    $error = "Mật khẩu không chính xác";
                }
            } else {
                $error = "Tài khoản không tồn tại";
            }
        } catch (PDOException $e) {
            $error = "Lỗi kết nối cơ sở dữ liệu: " . $e->getMessage();
        }
    }
}
?>

<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, minimum-scale=1.0">
    <title>Đăng Nhập - Vì Một Cộng Đồng Khỏe Mạnh</title>
    <meta name="description" content="Đăng nhập vào tài khoản của bạn để tiếp cận đầy đủ tính năng của nền tảng phòng chống tệ nạn xã hội.">
    <link rel="stylesheet" href="../css/custom.css">
    <link rel="stylesheet" href="../css/styles-index.css">
    <link rel="stylesheet" href="../css/responsive.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&family=Nunito:wght@400;600;700&display=swap" rel="stylesheet">
    <style>
        .auth-container {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #8A2BE2, #FF6B6B);
            padding: 2rem;
        }
        
        .auth-card {
            background: white;
            border-radius: 20px;
            box-shadow: 0 15px 30px rgba(0, 0, 0, 0.2);
            overflow: hidden;
            width: 100%;
            max-width: 900px;
            display: flex;
            min-height: 600px;
        }
        
        .auth-image {
            flex: 1;
            background-image: url('https://source.unsplash.com/random/600x900/?community');
            background-size: cover;
            background-position: center;
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .auth-image::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, rgba(138, 43, 226, 0.8), rgba(255, 107, 107, 0.8));
        }
        
        .auth-image-content {
            position: relative;
            color: white;
            text-align: center;
            padding: 2rem;
            z-index: 1;
        }
        
        .auth-image-title {
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 1rem;
        }
        
        .auth-image-text {
            font-size: 1.1rem;
            line-height: 1.6;
            margin-bottom: 2rem;
        }
        
        .auth-form {
            flex: 1;
            padding: 3rem;
            display: flex;
            flex-direction: column;
            justify-content: center;
        }
        
        .auth-form-title {
            font-size: 2rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
            color: #333;
        }
        
        .auth-form-subtitle {
            font-size: 1rem;
            color: #666;
            margin-bottom: 2rem;
        }
        
        .form-group {
            margin-bottom: 1.5rem;
        }
        
        .form-label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 600;
            color: #333;
        }
        
        .form-control {
            width: 100%;
            padding: 1rem;
            border: 1px solid #ddd;
            border-radius: 10px;
            font-size: 1rem;
            transition: all 0.3s ease;
        }
        
        .form-control:focus {
            border-color: #8A2BE2;
            box-shadow: 0 0 0 3px rgba(138, 43, 226, 0.1);
            outline: none;
        }
        
        .btn-auth {
            width: 100%;
            padding: 1rem;
            background: linear-gradient(135deg, #8A2BE2, #FF6B6B);
            color: white;
            border: none;
            border-radius: 10px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            margin-top: 1rem;
        }
        
        .btn-auth:hover {
            transform: translateY(-3px);
            box-shadow: 0 5px 15px rgba(138, 43, 226, 0.3);
        }
        
        .auth-links {
            display: flex;
            justify-content: space-between;
            margin-top: 1.5rem;
            font-size: 0.9rem;
        }
        
        .auth-link {
            color: #8A2BE2;
            text-decoration: none;
            transition: all 0.3s ease;
        }
        
        .auth-link:hover {
            color: #FF6B6B;
            text-decoration: underline;
        }
        
        .social-auth {
            margin-top: 2rem;
            text-align: center;
        }
        
        .social-auth-title {
            display: flex;
            align-items: center;
            margin-bottom: 1.5rem;
            color: #666;
            font-size: 0.9rem;
        }
        
        .social-auth-title::before,
        .social-auth-title::after {
            content: '';
            flex: 1;
            height: 1px;
            background: #ddd;
        }
        
        .social-auth-title span {
            padding: 0 1rem;
        }
        
        .social-buttons {
            display: flex;
            justify-content: center;
            gap: 1rem;
        }
        
        .social-button {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background: white;
            border: 1px solid #ddd;
            color: #666;
            font-size: 1.2rem;
            transition: all 0.3s ease;
        }
        
        .social-button:hover {
            transform: translateY(-3px);
            box-shadow: 0 5px 10px rgba(0, 0, 0, 0.1);
        }
        
        .facebook {
            color: #3b5998;
        }
        
        .google {
            color: #db4437;
        }
        
        .github {
            color: #333;
        }
        
        .alert {
            padding: 1rem;
            border-radius: 10px;
            margin-bottom: 1.5rem;
            font-weight: 500;
        }
        
        .alert-error {
            background: #fee;
            color: #e74c3c;
            border-left: 4px solid #e74c3c;
        }
        
        .alert-success {
            background: #efd;
            color: #2ecc71;
            border-left: 4px solid #2ecc71;
        }
        
        /* Responsive */
        @media (max-width: 768px) {
            .auth-card {
                flex-direction: column;
            }
            
            .auth-image {
                display: none;
            }
            
            .auth-form {
                padding: 2rem;
            }
            
            .auth-form-title {
                font-size: 1.8rem;
            }
        }
    </style>
</head>
<body>
    <div class="auth-container">
        <div class="auth-card">
            <div class="auth-image">
                <div class="auth-image-content">
                    <h2 class="auth-image-title">Chung Tay Đẩy Lùi Tệ Nạn Xã Hội</h2>
                    <p class="auth-image-text">Đăng nhập để tham gia cùng chúng tôi xây dựng một cộng đồng khỏe mạnh và an toàn. Bảo vệ bản thân và người thân khỏi các tệ nạn xã hội.</p>
                    <a href="register.php" class="btn-auth">Chưa có tài khoản? Đăng ký ngay</a>
                </div>
            </div>
            <div class="auth-form">
                <h2 class="auth-form-title">Đăng Nhập</h2>
                <p class="auth-form-subtitle">Chào mừng bạn quay trở lại! Vui lòng đăng nhập để tiếp tục.</p>
                
                <?php if(!empty($error)): ?>
                <div class="alert alert-error">
                    <i class="fas fa-exclamation-circle"></i> <?php echo $error; ?>
                </div>
                <?php endif; ?>
                
                <?php if(!empty($success)): ?>
                <div class="alert alert-success">
                    <i class="fas fa-check-circle"></i> <?php echo $success; ?>
                </div>
                <?php endif; ?>
                
                <form method="post" action="<?php echo htmlspecialchars($_SERVER["PHP_SELF"]); ?>">
                    <div class="form-group">
                        <label for="username" class="form-label">Tên đăng nhập</label>
                        <input type="text" id="username" name="username" class="form-control" placeholder="Nhập tên đăng nhập" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="password" class="form-label">Mật khẩu</label>
                        <input type="password" id="password" name="password" class="form-control" placeholder="Nhập mật khẩu" required>
                    </div>
                    
                    <div class="form-check">
                        <input type="checkbox" id="remember" name="remember" class="form-check-input">
                        <label for="remember" class="form-check-label">Ghi nhớ đăng nhập</label>
                    </div>
                    
                    <button type="submit" name="login" class="btn-auth">Đăng Nhập</button>
                    
                    <div class="auth-links">
                        <a href="forgot_password.php" class="auth-link">Quên mật khẩu?</a>
                        <a href="register.php" class="auth-link">Đăng ký tài khoản mới</a>
                    </div>
                </form>
                
                <div class="social-auth">
                    <div class="social-auth-title">
                        <span>Hoặc đăng nhập với</span>
                    </div>
                    <div class="social-buttons">
                        <a href="#" class="social-button facebook">
                            <i class="fab fa-facebook-f"></i>
                        </a>
                        <a href="#" class="social-button google">
                            <i class="fab fa-google"></i>
                        </a>
                        <a href="#" class="social-button github">
                            <i class="fab fa-github"></i>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>
</body>
</html> 