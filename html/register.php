<?php
// Kết nối đến database
require_once "config/database.php";

// Biến lưu thông báo lỗi
$error = '';
$success = '';

// Xử lý đăng ký
if ($_SERVER["REQUEST_METHOD"] == "POST" && isset($_POST["register"])) {
    $username = trim($_POST["username"]);
    $email = trim($_POST["email"]);
    $password = trim($_POST["password"]);
    $confirm_password = trim($_POST["confirm_password"]);
    $bio = trim($_POST["bio"] ?? "");
    
    // Kiểm tra thông tin đăng ký
    if (empty($username) || empty($email) || empty($password) || empty($confirm_password)) {
        $error = "Vui lòng nhập đầy đủ thông tin";
    } elseif ($password !== $confirm_password) {
        $error = "Mật khẩu xác nhận không khớp";
    } elseif (strlen($password) < 6) {
        $error = "Mật khẩu phải có ít nhất 6 ký tự";
    } else {
        try {
            // Kiểm tra username đã tồn tại chưa
            $checkUser = $conn->prepare("SELECT id FROM users WHERE username = :username");
            $checkUser->bindParam(':username', $username);
            $checkUser->execute();
            
            if ($checkUser->rowCount() > 0) {
                $error = "Tên đăng nhập đã tồn tại";
            } else {
                // Kiểm tra email đã tồn tại chưa
                $checkEmail = $conn->prepare("SELECT id FROM users WHERE email = :email");
                $checkEmail->bindParam(':email', $email);
                $checkEmail->execute();
                
                if ($checkEmail->rowCount() > 0) {
                    $error = "Email đã được sử dụng";
                } else {
                    // Mã hóa mật khẩu
                    $hashed_password = password_hash($password, PASSWORD_DEFAULT);
                    
                    // Tạo tài khoản mới theo cấu trúc bảng users
                    $stmt = $conn->prepare("INSERT INTO users (username, email, password, bio, avatar, is_verified, is_admin, created_at) 
                                          VALUES (:username, :email, :password, :bio, 'default-avatar.jpg', 0, 0, NOW())");
                    
                    $stmt->bindParam(':username', $username);
                    $stmt->bindParam(':email', $email);
                    $stmt->bindParam(':password', $hashed_password);
                    $stmt->bindParam(':bio', $bio);
                    
                    if ($stmt->execute()) {
                        $success = "Đăng ký thành công! Bạn có thể đăng nhập ngay bây giờ.";
                    } else {
                        $error = "Đã xảy ra lỗi, vui lòng thử lại sau";
                    }
                }
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
    <title>Đăng Ký Tài Khoản - Vì Một Cộng Đồng Khỏe Mạnh</title>
    <meta name="description" content="Đăng ký tài khoản để tham gia phòng chống tệ nạn xã hội và xây dựng cộng đồng khỏe mạnh.">
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
            max-width: 1000px;
            display: flex;
            min-height: 650px;
        }
        
        .auth-image {
            flex: 1;
            background-image: url('https://source.unsplash.com/random/600x900/?community,support');
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
        
        .form-row {
            display: flex;
            gap: 1rem;
        }
        
        .form-row .form-group {
            flex: 1;
        }
        
        .form-text {
            font-size: 0.8rem;
            color: #666;
            margin-top: 0.5rem;
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
        
        /* Terms and conditions checkbox */
        .form-check {
            display: flex;
            align-items: start;
            margin-bottom: 1.5rem;
        }
        
        .form-check-input {
            margin-top: 0.25rem;
            margin-right: 0.5rem;
        }
        
        .form-check-label {
            font-size: 0.9rem;
            color: #666;
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
            
            .form-row {
                flex-direction: column;
                gap: 0;
            }
        }
    </style>
</head>
<body>
    <div class="auth-container">
        <div class="auth-card">
            <div class="auth-form">
                <h2 class="auth-form-title">Đăng Ký Tài Khoản</h2>
                <p class="auth-form-subtitle">Tạo tài khoản để tham gia cùng chúng tôi phòng chống tệ nạn xã hội</p>
                
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
                    <div class="form-row">
                        <div class="form-group">
                            <label for="username" class="form-label">Tên đăng nhập</label>
                            <input type="text" id="username" name="username" class="form-control" placeholder="Nhập tên đăng nhập" required>
                            <div class="form-text">Tên đăng nhập cần từ 4-20 ký tự và không có ký tự đặc biệt</div>
                        </div>
                        
                        <div class="form-group">
                            <label for="email" class="form-label">Email</label>
                            <input type="email" id="email" name="email" class="form-control" placeholder="Nhập địa chỉ email" required>
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="password" class="form-label">Mật khẩu</label>
                            <input type="password" id="password" name="password" class="form-control" placeholder="Nhập mật khẩu" required>
                            <div class="password-strength">
                                <div class="password-strength-bar"></div>
                            </div>
                            <div class="form-text">Mật khẩu cần ít nhất 6 ký tự</div>
                        </div>
                        
                        <div class="form-group">
                            <label for="confirm_password" class="form-label">Xác nhận mật khẩu</label>
                            <input type="password" id="confirm_password" name="confirm_password" class="form-control" placeholder="Nhập lại mật khẩu" required>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="bio" class="form-label">Giới thiệu bản thân</label>
                        <textarea id="bio" name="bio" class="form-control" placeholder="Giới thiệu ngắn gọn về bạn" rows="3"></textarea>
                    </div>
                    
                    <div class="form-check">
                        <input type="checkbox" id="terms" name="terms" class="form-check-input" required>
                        <label for="terms" class="form-check-label">
                            Tôi đồng ý với <a href="#" class="auth-link">Điều khoản sử dụng</a> và <a href="#" class="auth-link">Chính sách bảo mật</a> của hệ thống phòng chống tệ nạn xã hội.
                        </label>
                    </div>
                    
                    <button type="submit" name="register" class="btn-auth">Đăng Ký</button>
                    
                    <div class="auth-links">
                        <span>Đã có tài khoản? <a href="login.php" class="auth-link">Đăng nhập ngay</a></span>
                    </div>
                </form>
            </div>
            
            <div class="auth-image">
                <div class="auth-image-content">
                    <h2 class="auth-image-title">Cùng Xây Dựng Cộng Đồng Khỏe Mạnh</h2>
                    <p class="auth-image-text">Tham gia cùng chúng tôi trong việc tuyên truyền, phòng chống và đẩy lùi các tệ nạn xã hội như ma túy, cờ bạc, mại dâm và lạm dụng rượu bia.</p>
                    <div style="margin-top: 2rem;">
                        <div style="display: flex; justify-content: center; gap: 1rem; margin-bottom: 1.5rem;">
                            <div style="width: 80px; height: 80px; background: rgba(255,255,255,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                                <i class="fas fa-users fa-2x"></i>
                            </div>
                            <div style="width: 80px; height: 80px; background: rgba(255,255,255,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                                <i class="fas fa-shield-heart fa-2x"></i>
                            </div>
                            <div style="width: 80px; height: 80px; background: rgba(255,255,255,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                                <i class="fas fa-hands-helping fa-2x"></i>
                            </div>
                        </div>
                        <p style="text-align: center; font-size: 0.9rem; opacity: 0.8;">Cùng kết nối, chia sẻ và bảo vệ</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <script>
        // JavaScript để kiểm tra độ mạnh của mật khẩu
        document.addEventListener('DOMContentLoaded', function() {
            const passwordInput = document.getElementById('password');
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
        });
    </script>
</body>
</html> 