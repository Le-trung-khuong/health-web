const sql = require('mssql');
require('dotenv').config();

const config = {
    user: process.env.DB_USER || 'sa',
    password: process.env.DB_PASSWORD || '123456789',
    server: process.env.DB_SERVER || 'localhost',
    database: process.env.DB_NAME || 'CommunityHealthDB',
    options: {
        encrypt: process.env.DB_ENCRYPT === 'true',
        trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE === 'true',
        enableArithAbort: true
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    }
};

const pool = new sql.ConnectionPool(config);

async function connectDB() {
    try {
        await pool.connect();
        console.log('Kết nối thành công tới SQL Server');
        
        const dbCheckResult = await pool.request().query(`
            SELECT name FROM sys.databases WHERE name = 'CommunityHealthDB'
        `);
        
        if (dbCheckResult.recordset.length === 0) {
            console.log('Tạo database CommunityHealthDB...');
            await pool.request().query(`CREATE DATABASE CommunityHealthDB`);
            console.log('Đã tạo database CommunityHealthDB thành công');
        }
        
        await pool.request().query(`USE CommunityHealthDB`);
        
        const tableCheckResult = await pool.request().query(`
            SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Users'
        `);
        
        if (tableCheckResult.recordset.length === 0) {
            console.log('Tạo bảng Users...');
            await pool.request().query(`
                CREATE TABLE Users (
                    UserID INT IDENTITY(1,1) PRIMARY KEY,
                    Email NVARCHAR(255) NOT NULL UNIQUE,
                    Password NVARCHAR(255) NOT NULL,
                    FullName NVARCHAR(255) NOT NULL,
                    Role NVARCHAR(50) NOT NULL DEFAULT 'user',
                    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
                    LastLogin DATETIME NULL,
                    IsActive BIT NOT NULL DEFAULT 1
                )
            `);
            console.log('Đã tạo bảng Users thành công');
        }
        
        const sessionTableCheckResult = await pool.request().query(`
            SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'UserSessions'
        `);
        
        if (sessionTableCheckResult.recordset.length === 0) {
            console.log('Tạo bảng UserSessions...');
            await pool.request().query(`
                CREATE TABLE UserSessions (
                    SessionID INT IDENTITY(1,1) PRIMARY KEY,
                    UserID INT NOT NULL,
                    Token NVARCHAR(MAX) NOT NULL,
                    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
                    ExpiresAt DATETIME NOT NULL,
                    IsActive BIT NOT NULL DEFAULT 1,
                    FOREIGN KEY (UserID) REFERENCES Users(UserID)
                )
            `);
            console.log('Đã tạo bảng UserSessions thành công');
        }
    } catch (error) {
        console.error('Lỗi kết nối database:', error);
        throw error;
    }
}

pool.on('error', err => {
    console.error('SQL Pool Error:', err);
});

module.exports = {
    pool,
    connectDB
}; 