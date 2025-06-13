const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

// Middleware xác thực người dùng bằng token JWT
const authenticateUser = async (req, res, next) => {
    try {
        // Lấy token từ header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Không tìm thấy token xác thực' });
        }
        
        const token = authHeader.split(' ')[1];
        
        // Xác thực token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'vicongdongkhoemanh-secret-key');
        
        // Kiểm tra session còn hiệu lực không
        const sessionQuery = `
            SELECT * FROM UserSessions 
            WHERE Token = @Token AND IsActive = 1 AND ExpiresAt > GETDATE()
        `;
        
        const sessionResult = await pool.request()
            .input('Token', token)
            .query(sessionQuery);
            
        if (sessionResult.recordset.length === 0) {
            return res.status(401).json({ message: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn' });
        }
        
        // Kiểm tra người dùng còn tồn tại và hoạt động không
        const userQuery = `
            SELECT UserID, Email, FullName, Role 
            FROM Users 
            WHERE UserID = @UserID AND IsActive = 1
        `;
        
        const userResult = await pool.request()
            .input('UserID', decoded.id)
            .query(userQuery);
            
        if (userResult.recordset.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy thông tin người dùng hoặc tài khoản đã bị khóa' });
        }
        
        // Lưu thông tin người dùng vào request để các middleware tiếp theo sử dụng
        req.user = {
            id: userResult.recordset[0].UserID,
            email: userResult.recordset[0].Email,
            fullName: userResult.recordset[0].FullName,
            role: userResult.recordset[0].Role
        };
        
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });
        }
        
        console.error('Auth middleware error:', error);
        return res.status(500).json({ message: 'Đã xảy ra lỗi khi xác thực người dùng' });
    }
};

// Middleware kiểm tra quyền admin
const requireAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Không có quyền truy cập' });
    }
    
    next();
};

module.exports = {
    authenticateUser,
    requireAdmin
}; 