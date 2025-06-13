<?php
// Kết nối đến file xác thực
require_once "../database/auth.php";

// Biến lưu thông báo
$error = '';
$success = '';

// Kiểm tra token
if (!isset($_GET['token']) || empty($_GET['token'])) {
    $error = "Link đặt lại mật khẩu không hợp lệ";
} else {
    $token = $_GET['token'];
    $user_id = verify_reset_token($token);
    
    if (!$user_id) {
        $error = "Link đặt lại mật khẩu đã hết hạn hoặc không hợp lệ";
    } else {
        // Xử lý đặt lại mật khẩu
        if ($_SERVER["REQUEST_METHOD"] == "POST" && isset($_POST["reset_password"])) {
            $password = trim($_POST["password"]);
            $confirm_password = trim($_POST["confirm_password"]);
            
            if (empty($password) || empty($confirm_password)) {
                $error = "Vui lòng nhập đầy đủ thông tin";
            } elseif ($password !== $confirm_password) {
                $error = "Mật khẩu xác nhận không khớp";
            } elseif (strlen($password) < 6) {
                $error = "Mật khẩu phải có ít nhất 6 ký tự";
            } else {
                if (reset_password($user_id, $password)) {
                    $success = "Đặt lại mật khẩu thành công! Bạn có thể đăng nhập ngay bây giờ.";
                } else {
                    $error = "Đã xảy ra lỗi, vui lòng thử lại sau";
                }
            }
        }
    }
}
?>

<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, minimum-scale=1.0">
    <title>Đặt Lại Mật Khẩu - Vì Một Cộng Đồng Khỏe Mạnh</title>
    <meta name="description" content="Đặt lại mật khẩu tài khoản trên nền tảng phòng chống tệ nạn xã hội.">
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
            min-height: 500px;
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
        
        .password-strength {
            height: 5px;
            border-radius: 5px;
            margin-top: 0.5rem;
            background: #eee;
            position: relative;
            overflow: hidden;
        }
        
        .password-strength-bar {
            height: 100%;
            border-radius: 5px;
            width: 0;
            transition: all 0.3s ease;
        }
        
        .strength-weak {
            background: #e74c3c;
            width: 25%;
        }
        
        .strength-medium {
            background: #f39c12;
            width: 50%;
        }
        
        .strength-good {
            background: #2ecc71;
            width: 75%;
        }
        
        .strength-strong {
            background: #27ae60;
            width: 100%;
        }
    </style>
</head>
<body>
    <div class="auth-container">
        <div class="auth-card">
            <div class="auth-logo">
                <i class="fas fa-lock"></i>
            </div>
            <h2 class="auth-form-title">Đặt Lại Mật Khẩu</h2>
            <p class="auth-form-subtitle">Tạo mật khẩu mới cho tài khoản của bạn</p>
            
            <?php if(!empty($error)): ?>
            <div class="alert alert-error">
                <i class="fas fa-exclamation-circle"></i> <?php echo $error; ?>
            </div>
            <?php endif; ?>
            
            <?php if(!empty($success)): ?>
            <div class="alert alert-success">
                <i class="fas fa-check-circle"></i> <?php echo $success; ?>
                <div class="auth-links" style="margin-top: 0.5rem;">
                    <a href="login.php" class="auth-link">Đăng nhập ngay</a>
                </div>
            </div>
            <?php endif; ?>
            
            <?php if(empty($success) && empty($error)): ?>
            <form method="post" action="<?php echo htmlspecialchars($_SERVER["PHP_SELF"]) . "?token=" . urlencode($_GET['token']); ?>">
                <div class="form-group">
                    <label for="password" class="form-label">Mật khẩu mới</label>
                    <input type="password" id="password" name="password" class="form-control" placeholder="Nhập mật khẩu mới" required>
                    <div class="password-strength">
                        <div class="password-strength-bar"></div>
                    </div>
                    <div class="form-text" style="font-size: 0.8rem; color: #666; margin-top: 0.5rem;">Mật khẩu cần ít nhất 6 ký tự</div>
                </div>
                
                <div class="form-group">
                    <label for="confirm_password" class="form-label">Xác nhận mật khẩu mới</label>
                    <input type="password" id="confirm_password" name="confirm_password" class="form-control" placeholder="Nhập lại mật khẩu mới" required>
                </div>
                
                <button type="submit" name="reset_password" class="btn-auth">Đặt Lại Mật Khẩu</button>
            </form>
            <?php endif; ?>
            
            <?php if(empty($success)): ?>
            <div class="auth-links">
                <span>Quay lại <a href="login.php" class="auth-link">Đăng nhập</a></span>
            </div>
            <?php endif; ?>
        </div>
    </div>
    
    <script>
        // JavaScript để kiểm tra độ mạnh của mật khẩu
        document.addEventListener('DOMContentLoaded', function() {
            const passwordInput = document.getElementById('password');
            if (passwordInput) {
                const strengthBar = document.querySelector('.password-strength-bar');
                
                passwordInput.addEventListener('input', function() {
                    const password = passwordInput.value;
                    let strength = 0;
                    
                    // Độ dài
                    if (password.length > 5) strength += 1;
                    if (password.length > 8) strength += 1;
                    
                    // Chữ thường và hoa
                    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength += 1;
                    
                    // Số và ký tự đặc biệt
                    if (password.match(/[0-9]/)) strength += 1;
                    if (password.match(/[^a-zA-Z0-9]/)) strength += 1;
                    
                    // Hiển thị độ mạnh
                    strengthBar.className = 'password-strength-bar';
                    if (password.length === 0) {
                        strengthBar.style.width = '0';
                    } else if (strength <= 1) {
                        strengthBar.classList.add('strength-weak');
                    } else if (strength <= 2) {
                        strengthBar.classList.add('strength-medium');
                    } else if (strength <= 3) {
                        strengthBar.classList.add('strength-good');
                    } else {
                        strengthBar.classList.add('strength-strong');
                    }
                });
                
                // Kiểm tra mật khẩu xác nhận
                const confirmInput = document.getElementById('confirm_password');
                
                confirmInput.addEventListener('input', function() {
                    if (passwordInput.value === confirmInput.value) {
                        confirmInput.style.borderColor = '#2ecc71';
                    } else {
                        confirmInput.style.borderColor = '#e74c3c';
                    }
                });
            }
        });
    </script>
</body>
</html> 