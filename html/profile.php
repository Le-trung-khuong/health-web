<?php
// Bắt đầu phiên làm việc
session_start();

// Kiểm tra nếu người dùng chưa đăng nhập thì chuyển hướng đến trang đăng nhập
if (!isset($_SESSION["user_id"])) {
    header("Location: login.php");
    exit;
}

// Kết nối đến database
require_once "config/database.php";

// Biến lưu thông báo
$success = '';
$error = '';

// Lấy thông tin người dùng
$user_id = $_SESSION["user_id"];
$user = null;

try {
    $stmt = $conn->prepare("SELECT * FROM users WHERE id = :user_id");
    $stmt->bindParam(':user_id', $user_id);
    $stmt->execute();
    
    if ($stmt->rowCount() > 0) {
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
    } else {
        // Không tìm thấy người dùng, đăng xuất
        session_destroy();
        header("Location: login.php");
        exit;
    }
} catch (PDOException $e) {
    $error = "Lỗi kết nối: " . $e->getMessage();
}

// Xử lý cập nhật thông tin cá nhân
if ($_SERVER["REQUEST_METHOD"] == "POST" && isset($_POST["update_profile"])) {
    $email = trim($_POST["email"]);
    $bio = trim($_POST["bio"]);
    
    // Kiểm tra email
    if (empty($email)) {
        $error = "Email không được để trống";
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $error = "Email không hợp lệ";
    } else {
        try {
            // Kiểm tra email đã tồn tại chưa (trừ email hiện tại của người dùng)
            $checkEmail = $conn->prepare("SELECT id FROM users WHERE email = :email AND id != :user_id");
            $checkEmail->bindParam(':email', $email);
            $checkEmail->bindParam(':user_id', $user_id);
            $checkEmail->execute();
            
            if ($checkEmail->rowCount() > 0) {
                $error = "Email này đã được sử dụng bởi tài khoản khác";
            } else {
                // Cập nhật thông tin
                $stmt = $conn->prepare("UPDATE users SET email = :email, bio = :bio WHERE id = :user_id");
                $stmt->bindParam(':email', $email);
                $stmt->bindParam(':bio', $bio);
                $stmt->bindParam(':user_id', $user_id);
                
                if ($stmt->execute()) {
                    $success = "Cập nhật thông tin thành công!";
                    // Cập nhật lại thông tin người dùng
                    $stmt = $conn->prepare("SELECT * FROM users WHERE id = :user_id");
                    $stmt->bindParam(':user_id', $user_id);
                    $stmt->execute();
                    $user = $stmt->fetch(PDO::FETCH_ASSOC);
                } else {
                    $error = "Không thể cập nhật thông tin, vui lòng thử lại";
                }
            }
        } catch (PDOException $e) {
            $error = "Lỗi: " . $e->getMessage();
        }
    }
}

// Xử lý cập nhật avatar
if ($_SERVER["REQUEST_METHOD"] == "POST" && isset($_POST["update_avatar"])) {
    // Kiểm tra file upload
    if (isset($_FILES["avatar"]) && $_FILES["avatar"]["error"] == 0) {
        $allowed = ["jpg" => "image/jpg", "jpeg" => "image/jpeg", "gif" => "image/gif", "png" => "image/png"];
        $filename = $_FILES["avatar"]["name"];
        $filetype = $_FILES["avatar"]["type"];
        $filesize = $_FILES["avatar"]["size"];
        
        // Kiểm tra phần mở rộng file
        $ext = pathinfo($filename, PATHINFO_EXTENSION);
        if (!array_key_exists($ext, $allowed)) {
            $error = "Định dạng ảnh không hợp lệ. Chỉ chấp nhận jpg, jpeg, gif hoặc png";
        }
        
        // Kiểm tra kích thước file (5MB)
        $maxsize = 5 * 1024 * 1024;
        if ($filesize > $maxsize) {
            $error = "Kích thước ảnh quá lớn. Tối đa 5MB";
        }
        
        // Kiểm tra loại MIME của file
        if (in_array($filetype, $allowed)) {
            // Kiểm tra có thật sự là ảnh
            if (getimagesize($_FILES["avatar"]["tmp_name"]) !== false) {
                $uploaddir = '../uploads/avatars/';
                if (!is_dir($uploaddir)) {
                    mkdir($uploaddir, 0777, true);
                }
                
                $new_filename = time() . '_' . uniqid() . '.' . $ext;
                $uploadfile = $uploaddir . $new_filename;
                
                if (move_uploaded_file($_FILES["avatar"]["tmp_name"], $uploadfile)) {
                    // Cập nhật đường dẫn avatar trong database
                    try {
                        $avatar_path = 'uploads/avatars/' . $new_filename;
                        $stmt = $conn->prepare("UPDATE users SET avatar = :avatar WHERE id = :user_id");
                        $stmt->bindParam(':avatar', $avatar_path);
                        $stmt->bindParam(':user_id', $user_id);
                        
                        if ($stmt->execute()) {
                            $success = "Cập nhật ảnh đại diện thành công!";
                            // Cập nhật lại thông tin người dùng
                            $stmt = $conn->prepare("SELECT * FROM users WHERE id = :user_id");
                            $stmt->bindParam(':user_id', $user_id);
                            $stmt->execute();
                            $user = $stmt->fetch(PDO::FETCH_ASSOC);
                        } else {
                            $error = "Không thể cập nhật ảnh đại diện, vui lòng thử lại";
                        }
                    } catch (PDOException $e) {
                        $error = "Lỗi: " . $e->getMessage();
                    }
                } else {
                    $error = "Có lỗi xảy ra khi tải lên ảnh, vui lòng thử lại";
                }
            } else {
                $error = "File tải lên không phải là ảnh";
            }
        } else {
            $error = "Có lỗi xảy ra khi tải lên ảnh. Kiểm tra lại định dạng file";
        }
    } else {
        $error = "Vui lòng chọn ảnh để tải lên";
    }
}

// Xử lý đổi mật khẩu
if ($_SERVER["REQUEST_METHOD"] == "POST" && isset($_POST["change_password"])) {
    $current_password = trim($_POST["current_password"]);
    $new_password = trim($_POST["new_password"]);
    $confirm_password = trim($_POST["confirm_password"]);
    
    // Kiểm tra các trường
    if (empty($current_password) || empty($new_password) || empty($confirm_password)) {
        $error = "Vui lòng nhập đầy đủ thông tin";
    } elseif ($new_password !== $confirm_password) {
        $error = "Mật khẩu mới không khớp";
    } elseif (strlen($new_password) < 6) {
        $error = "Mật khẩu mới phải có ít nhất 6 ký tự";
    } else {
        try {
            // Kiểm tra mật khẩu hiện tại
            if (password_verify($current_password, $user["password"])) {
                // Cập nhật mật khẩu mới
                $hashed_password = password_hash($new_password, PASSWORD_DEFAULT);
                $stmt = $conn->prepare("UPDATE users SET password = :password WHERE id = :user_id");
                $stmt->bindParam(':password', $hashed_password);
                $stmt->bindParam(':user_id', $user_id);
                
                if ($stmt->execute()) {
                    $success = "Đổi mật khẩu thành công!";
                } else {
                    $error = "Không thể đổi mật khẩu, vui lòng thử lại";
                }
            } else {
                $error = "Mật khẩu hiện tại không đúng";
            }
        } catch (PDOException $e) {
            $error = "Lỗi: " . $e->getMessage();
        }
    }
}
?>

<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, minimum-scale=1.0">
    <title>Trang Cá Nhân - Vì Một Cộng Đồng Khỏe Mạnh</title>
    <meta name="description" content="Quản lý thông tin cá nhân và tùy chỉnh tài khoản của bạn.">
    <link rel="stylesheet" href="../css/custom.css">
    <link rel="stylesheet" href="../css/styles-index.css">
    <link rel="stylesheet" href="../css/responsive.css">
    <link rel="stylesheet" href="../css/auth-ui.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&family=Nunito:wght@400;600;700&display=swap" rel="stylesheet">
    <style>
        .profile-container {
            padding: 4rem 2rem;
            background-color: #f9f9f9;
            min-height: calc(100vh - 80px);
        }
        
        .profile-header {
            background: linear-gradient(135deg, #8A2BE2, #FF6B6B);
            color: white;
            border-radius: 15px;
            padding: 2rem;
            margin-bottom: 2rem;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
            display: flex;
            align-items: center;
            gap: 2rem;
        }
        
        .profile-avatar-container {
            position: relative;
            width: 120px;
            height: 120px;
        }
        
        .profile-avatar {
            width: 120px;
            height: 120px;
            border-radius: 50%;
            object-fit: cover;
            border: 3px solid white;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        }
        
        .profile-avatar-edit {
            position: absolute;
            bottom: 0;
            right: 0;
            background: white;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #8A2BE2;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .profile-avatar-edit:hover {
            transform: scale(1.1);
        }
        
        .profile-info {
            flex: 1;
        }
        
        .profile-name {
            font-size: 2rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
        }
        
        .profile-email {
            font-size: 1rem;
            opacity: 0.8;
        }
        
        .profile-badges {
            display: flex;
            gap: 0.5rem;
            margin-top: 0.5rem;
        }
        
        .profile-badge {
            background-color: rgba(255, 255, 255, 0.2);
            padding: 0.25rem 1rem;
            border-radius: 20px;
            font-size: 0.8rem;
            display: inline-block;
        }
        
        .profile-card {
            background-color: white;
            border-radius: 15px;
            padding: 2rem;
            margin-bottom: 2rem;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
        }
        
        .profile-card-title {
            font-size: 1.5rem;
            font-weight: 600;
            margin-bottom: 1.5rem;
            color: #8A2BE2;
            border-bottom: 2px solid #f0f0f0;
            padding-bottom: 0.5rem;
        }
        
        .profile-form-group {
            margin-bottom: 1.5rem;
        }
        
        .profile-form-label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 600;
            color: #333;
        }
        
        .profile-form-control {
            width: 100%;
            padding: 1rem;
            border: 1px solid #ddd;
            border-radius: 10px;
            font-size: 1rem;
            transition: all 0.3s ease;
        }
        
        .profile-form-control:focus {
            border-color: #8A2BE2;
            box-shadow: 0 0 0 3px rgba(138, 43, 226, 0.1);
            outline: none;
        }
        
        .profile-btn {
            padding: 0.75rem 1.5rem;
            background: linear-gradient(135deg, #8A2BE2, #FF6B6B);
            color: white;
            border: none;
            border-radius: 10px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .profile-btn:hover {
            transform: translateY(-3px);
            box-shadow: 0 5px 15px rgba(138, 43, 226, 0.3);
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
        
        .row {
            display: flex;
            flex-wrap: wrap;
            margin: 0 -15px;
        }
        
        .col-8 {
            flex: 0 0 66.666667%;
            max-width: 66.666667%;
            padding: 0 15px;
        }
        
        .col-4 {
            flex: 0 0 33.333333%;
            max-width: 33.333333%;
            padding: 0 15px;
        }
        
        @media (max-width: 768px) {
            .col-md-12 {
                flex: 0 0 100%;
                max-width: 100%;
            }
            
            .profile-header {
                flex-direction: column;
                text-align: center;
            }
            
            .profile-badges {
                justify-content: center;
            }
        }
    </style>
</head>
<body>
    <!-- Header -->
    <header class="header">
        <div class="container">
            <div class="navbar">
                <a href="index.php" class="navbar-logo">
                    <i class="fas fa-shield-heart"></i> Cộng Đồng Khỏe Mạnh
                </a>
                <div class="navbar-right">
                    <a href="index.php" class="back-btn">
                        <i class="fas fa-arrow-left"></i> Quay lại Trang Chủ
                    </a> 
                </div>
            </div>
        </div>
    </header>

    <main class="profile-container">
        <div class="container">
            <?php if(!empty($success)): ?>
            <div class="alert alert-success">
                <i class="fas fa-check-circle"></i> <?php echo $success; ?>
            </div>
            <?php endif; ?>
            
            <?php if(!empty($error)): ?>
            <div class="alert alert-error">
                <i class="fas fa-exclamation-circle"></i> <?php echo $error; ?>
            </div>
            <?php endif; ?>
            
            <div class="profile-header">
                <div class="profile-avatar-container">
                    <img src="<?php echo !empty($user["avatar"]) ? '../' . $user["avatar"] : '../uploads/avatars/default-avatar.jpg'; ?>" alt="Avatar" class="profile-avatar">
                    <div class="profile-avatar-edit" onclick="document.getElementById('avatar-upload').click()">
                        <i class="fas fa-camera"></i>
                    </div>
                    <form id="avatar-form" method="post" enctype="multipart/form-data" style="display: none;">
                        <input type="file" id="avatar-upload" name="avatar" accept="image/*" onchange="document.getElementById('avatar-form').submit()">
                        <input type="hidden" name="update_avatar" value="1">
                    </form>
                </div>
                <div class="profile-info">
                    <h1 class="profile-name"><?php echo htmlspecialchars($user["username"]); ?></h1>
                    <p class="profile-email"><?php echo htmlspecialchars($user["email"]); ?></p>
                    <div class="profile-badges">
                        <?php if($user["is_verified"]): ?>
                        <span class="profile-badge">
                            <i class="fas fa-check-circle"></i> Đã xác minh
                        </span>
                        <?php endif; ?>
                        
                        <span class="profile-badge">
                            <?php echo $user["is_admin"] ? "<i class='fas fa-shield-alt'></i> Quản trị viên" : "<i class='fas fa-user'></i> Thành viên"; ?>
                        </span>
                        
                        <span class="profile-badge">
                            <i class="fas fa-calendar-alt"></i> Tham gia: <?php echo date('d/m/Y', strtotime($user["created_at"])); ?>
                        </span>
                    </div>
                </div>
            </div>
            
            <div class="row">
                <div class="col-8 col-md-12">
                    <div class="profile-card">
                        <h2 class="profile-card-title">Thông tin cá nhân</h2>
                        <form action="<?php echo htmlspecialchars($_SERVER["PHP_SELF"]); ?>" method="post">
                            <div class="profile-form-group">
                                <label class="profile-form-label">Tên đăng nhập</label>
                                <input type="text" class="profile-form-control" value="<?php echo htmlspecialchars($user["username"]); ?>" readonly>
                                <small>Tên đăng nhập không thể thay đổi</small>
                            </div>
                            
                            <div class="profile-form-group">
                                <label class="profile-form-label">Email</label>
                                <input type="email" class="profile-form-control" name="email" value="<?php echo htmlspecialchars($user["email"]); ?>" required>
                            </div>
                            
                            <div class="profile-form-group">
                                <label class="profile-form-label">Giới thiệu bản thân</label>
                                <textarea class="profile-form-control" name="bio" rows="4"><?php echo htmlspecialchars($user["bio"] ?? ''); ?></textarea>
                            </div>
                            
                            <button type="submit" class="profile-btn" name="update_profile">
                                <i class="fas fa-save"></i> Lưu thay đổi
                            </button>
                        </form>
                    </div>
                </div>
                
                <div class="col-4 col-md-12">
                    <div class="profile-card">
                        <h2 class="profile-card-title">Đổi mật khẩu</h2>
                        <form action="<?php echo htmlspecialchars($_SERVER["PHP_SELF"]); ?>" method="post">
                            <div class="profile-form-group">
                                <label class="profile-form-label">Mật khẩu hiện tại</label>
                                <input type="password" class="profile-form-control" name="current_password" required>
                            </div>
                            
                            <div class="profile-form-group">
                                <label class="profile-form-label">Mật khẩu mới</label>
                                <input type="password" class="profile-form-control" name="new_password" required>
                                <small>Mật khẩu cần ít nhất 6 ký tự</small>
                            </div>
                            
                            <div class="profile-form-group">
                                <label class="profile-form-label">Xác nhận mật khẩu mới</label>
                                <input type="password" class="profile-form-control" name="confirm_password" required>
                            </div>
                            
                            <button type="submit" class="profile-btn" name="change_password">
                                <i class="fas fa-key"></i> Đổi mật khẩu
                            </button>
                        </form>
                    </div>
                    
                    <div class="profile-card">
                        <h2 class="profile-card-title">Bảo mật tài khoản</h2>
                        <p>Trạng thái xác minh: 
                            <?php if($user["is_verified"]): ?>
                                <span style="color: #2ecc71;"><i class="fas fa-check-circle"></i> Đã xác minh</span>
                            <?php else: ?>
                                <span style="color: #e74c3c;"><i class="fas fa-times-circle"></i> Chưa xác minh</span>
                            <?php endif; ?>
                        </p>
                        
                        <?php if(!$user["is_verified"]): ?>
                        <button type="button" class="profile-btn" onclick="requestVerification()">
                            <i class="fas fa-user-check"></i> Yêu cầu xác minh
                        </button>
                        <?php endif; ?>
                    </div>
                </div>
            </div>
        </div>
    </main>
    
    <script>
        function requestVerification() {
            alert("Chức năng xác minh tài khoản đang được phát triển. Vui lòng thử lại sau.");
        }
    </script>
</body>
</html> 