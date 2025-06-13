<?php
// Kết nối đến file xác thực
require_once "../database/auth.php";

// Biến lưu thông báo
$error = '';
$success = '';

// Xử lý quên mật khẩu
if ($_SERVER["REQUEST_METHOD"] == "POST" && isset($_POST["forgot_password"])) {
    $email = trim($_POST["email"]);
    
    if (empty($email)) {
        $error = "Vui lòng nhập địa chỉ email";
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $error = "Email không hợp lệ";
    } else {
        $token = create_password_reset($email);
        
        if ($token) {
            // Trong thực tế, bạn sẽ gửi email với link đặt lại mật khẩu
            // ở đây chỉ mô phỏng và hiển thị link trực tiếp
            $reset_link = "http://" . $_SERVER['HTTP_HOST'] . dirname($_SERVER['PHP_SELF']) . "/reset-password.php?token=" . $token;
            
            $success = "Một email đã được gửi đến địa chỉ của bạn với hướng dẫn đặt lại mật khẩu.";
            
            // Hiển thị link (chỉ dùng cho demo, trong thực tế nên gửi qua email)
            $success .= "<br><br><small>Link đặt lại mật khẩu (demo): <a href='$reset_link'>$reset_link</a></small>";
        } else {
            $error = "Không tìm thấy tài khoản với email này hoặc tài khoản đã bị khóa";
        }
    }
}
?>

<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, minimum-scale=1.0">
    <title>Quên Mật Khẩu - Vì Một Cộng Đồng Khỏe Mạnh</title>
    <meta name="description" content="Khôi phục mật khẩu tài khoản trên nền tảng phòng chống tệ nạn xã hội.">
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
            max-width: 500px;
            min-height: 400px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            padding: 3rem;
        }
        
        .auth-logo {
            text-align: center;
            margin-bottom: 2rem;
        }
        
        .auth-logo i {
            font-size: 3rem;
            color: #8A2BE2;
            margin-bottom: 0.5rem;
        }
        
        .auth-form-title {
            font-size: 2rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
            color: #333;
            text-align: center;
        }
        
        .auth-form-subtitle {
            font-size: 1rem;
            color: #666;
            margin-bottom: 2rem;
            text-align: center;
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
            justify-content: center;
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
    </style>
</head>
<body>
    <div class="auth-container">
        <div class="auth-card">
            <div class="auth-logo">
                <i class="fas fa-key"></i>
            </div>
            <h2 class="auth-form-title">Quên Mật Khẩu</h2>
            <p class="auth-form-subtitle">Nhập email của bạn để khôi phục mật khẩu</p>
            
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
                    <label for="email" class="form-label">Email</label>
                    <input type="email" id="email" name="email" class="form-control" placeholder="Nhập địa chỉ email" required>
                </div>
                
                <button type="submit" name="forgot_password" class="btn-auth">Gửi Link Đặt Lại Mật Khẩu</button>
                
                <div class="auth-links">
                    <span>Quay lại <a href="login.php" class="auth-link">Đăng nhập</a></span>
                </div>
            </form>
        </div>
    </div>
</body>
</html> 