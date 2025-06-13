# Hướng dẫn sử dụng Database - Trò chơi Nhà Điều Tra Tệ Nạn

## 1. Giới thiệu

Tài liệu này hướng dẫn cách thiết lập và sử dụng database cho trò chơi "Nhà Điều Tra Tệ Nạn". Việc sử dụng database giúp quản lý dữ liệu vụ án hiệu quả hơn, dễ dàng mở rộng nội dung và theo dõi tiến trình người chơi.

## 2. Yêu cầu hệ thống

- MySQL Server 5.7+ hoặc MariaDB 10.3+
- PHP 7.4+ với PDO extension
- Máy chủ web (Apache, Nginx, hoặc XAMPP/WAMP/MAMP cho môi trường phát triển)

## 3. Thiết lập Database

### 3.1. Tạo Database

Đăng nhập vào MySQL và tạo database mới:

```sql
CREATE DATABASE detective_game CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3.2. Tạo cấu trúc bảng

Chạy script SQL trong file `sql/detective_game_db.sql` để tạo cấu trúc bảng:

```bash
mysql -u your_username -p detective_game < sql/detective_game_db.sql
```

Hoặc import file SQL thông qua phpMyAdmin hoặc công cụ quản lý database khác.

### 3.3. Nhập dữ liệu mẫu

Chạy script SQL trong file `sql/detective_game_sample_data.sql` để nhập dữ liệu mẫu:

```bash
mysql -u your_username -p detective_game < sql/detective_game_sample_data.sql
```

### 3.4. Cấu hình kết nối

Mở file `api/db_connect.php` và cập nhật thông tin kết nối database:

```php
$db_host = 'localhost';     // Địa chỉ máy chủ database
$db_name = 'detective_game'; // Tên database
$db_user = 'your_username';  // Tên đăng nhập
$db_pass = 'your_password';  // Mật khẩu
```

## 4. Cấu trúc Database

### 4.1. Bảng chính

- `cases`: Thông tin chung về vụ án
- `evidence`: Bằng chứng trong vụ án
- `locations`: Các địa điểm trong vụ án
- `characters`: Nhân vật trong vụ án
- `steps`: Các bước trong vụ án
- `final_steps`: Bước cuối của vụ án
- `users`: Thông tin người dùng
- `user_progress`: Tiến trình người dùng

### 4.2. Bảng quan hệ và điều kiện

- `case_requirements`: Điều kiện mở khóa vụ án
- `location_requirements`: Điều kiện mở khóa địa điểm
- `character_requirements`: Điều kiện mở khóa nhân vật
- `dialog_options`: Lựa chọn đối thoại
- `dialog_unlocks`: Điều kiện mở khóa từ đối thoại
- `step_requirements`: Điều kiện của bước
- `step_actions`: Hành động trong bước
- `final_step_evidence`: Điều kiện bằng chứng cho bước cuối
- `final_choices`: Lựa chọn cho bước cuối
- `educational_tips`: Kiến thức bổ ích

## 5. API Endpoints

### 5.1. Lấy danh sách vụ án

```
GET/POST /api/get-cases.php
```

Tham số:
- `mode` (tùy chọn): Chế độ chơi ('story', 'quick', 'challenge')

Kết quả:
```json
{
  "success": true,
  "cases": [
    {
      "id": "drug-school-1",
      "title": "Bóng Ma Trong Trường",
      "description": "...",
      "type": "Ma túy",
      "difficulty": 1,
      "mode": "story",
      "is_locked": false,
      "image": "../images/cases/school.jpg",
      "timed": false,
      "time_limit": 0,
      "requiredCases": []
    },
    ...
  ]
}
```

### 5.2. Lấy chi tiết vụ án

```
GET/POST /api/get-case-detail.php
```

Tham số:
- `case_id` (bắt buộc): ID của vụ án

Kết quả:
```json
{
  "success": true,
  "case": {
    "id": "drug-school-1",
    "title": "Bóng Ma Trong Trường",
    "description": "...",
    "difficulty": 1,
    "type": "Ma túy",
    "mode": "story",
    "isLocked": false,
    "timed": false,
    "timeLimit": 0,
    "requiredCases": [],
    "evidence": [...],
    "locations": [...],
    "characters": [...],
    "steps": [...],
    "finalStep": {...},
    "educationalTips": [...]
  }
}
```

### 5.3. Lưu kết quả vụ án

```
POST /api/save-case-result.php
```

Tham số:
- `user_id` (bắt buộc): ID của người dùng
- `case_id` (bắt buộc): ID của vụ án
- `success` (tùy chọn): Kết quả vụ án (true/false)
- `score` (tùy chọn): Điểm số
- `evidence_collected` (tùy chọn): Số bằng chứng đã thu thập
- `total_evidence` (tùy chọn): Tổng số bằng chứng trong vụ án
- `correct_choices` (tùy chọn): Số lượng lựa chọn đúng
- `wrong_choices` (tùy chọn): Số lượng lựa chọn sai
- `time_spent` (tùy chọn): Thời gian hoàn thành (giây)

Kết quả:
```json
{
  "success": true,
  "newScore": 150,
  "newRank": "Điều tra viên",
  "message": "Đã lưu kết quả vụ án thành công"
}
```

## 6. Thêm vụ án mới

### 6.1. Chuẩn bị dữ liệu

Để thêm vụ án mới, bạn cần chuẩn bị:
- Thông tin chung về vụ án
- Danh sách bằng chứng
- Danh sách địa điểm
- Danh sách nhân vật
- Các bước trong vụ án
- Bước cuối cùng và lựa chọn
- Kiến thức bổ ích về tệ nạn xã hội liên quan

### 6.2. Nhập dữ liệu

Tạo script SQL mới theo mẫu `sql/detective_game_sample_data.sql`:

```sql
-- Chèn vụ án mới
INSERT INTO cases (id, title, description, type, difficulty, mode, is_locked, image, timed, time_limit, success_content, failure_content)
VALUES ('your-case-id', 'Tên vụ án', 'Mô tả vụ án...', 'Loại tệ nạn', 1, 'story', FALSE, '../images/cases/image.jpg', FALSE, 0, 'Nội dung thành công', 'Nội dung thất bại');

-- Chèn điều kiện mở khóa (nếu có)
INSERT INTO case_requirements (case_id, required_case_id)
VALUES ('your-case-id', 'required-case-id');

-- Tiếp tục với bằng chứng, địa điểm, nhân vật, etc.
```

Chạy script SQL để nhập dữ liệu:

```bash
mysql -u your_username -p detective_game < your_case_data.sql
```

## 7. Quản lý người dùng

### 7.1. Đăng ký người dùng mới

Thực hiện SQL để thêm người dùng mới:

```sql
INSERT INTO users (username, password, email)
VALUES ('username', 'hashed_password', 'email@example.com');
```

Lưu ý: Mật khẩu nên được mã hóa (ví dụ: sử dụng `password_hash()` trong PHP).

### 7.2. Theo dõi tiến trình người dùng

Bảng `user_progress` lưu tiến trình người dùng cho từng vụ án.

## 8. Xử lý lỗi phổ biến

- **Không thể kết nối đến database**: Kiểm tra thông tin kết nối trong `api/db_connect.php`
- **Lỗi ký tự Unicode**: Đảm bảo database và bảng sử dụng charset utf8mb4
- **Không thấy dữ liệu vụ án**: Kiểm tra dữ liệu đã được nhập chính xác

## 9. Bảo mật

- Đặt mật khẩu mạnh cho database
- Sử dụng prepared statements để tránh SQL injection
- Xử lý đầu vào người dùng một cách an toàn
- Mã hóa mật khẩu người dùng

## 10. Tham khảo

- [Tài liệu MySQL](https://dev.mysql.com/doc/)
- [Tài liệu PHP PDO](https://www.php.net/manual/en/book.pdo.php)
- [Bảo mật website PHP](https://phpsecurity.readthedocs.io/en/latest/) 