// backend/config/db.js
const mysql = require('mysql2');
require('dotenv').config(); // Để đọc biến môi trường từ file .env


// Tạo một pool kết nối để quản lý nhiều kết nối hiệu quả
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'movie_booking_db',
    waitForConnections: true,
    connectionLimit: 10, // Số lượng kết nối tối đa trong pool
    queueLimit: 0 // Không giới hạn số lượng yêu cầu đợi kết nối
});

// Kiểm tra kết nối
pool.getConnection((err, connection) => {
    if (err) {
        console.error('Lỗi kết nối đến MySQL:', err.message);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            console.error('Kết nối Database đã bị đóng.');
        }
        if (err.code === 'ER_CON_COUNT_ERROR') {
            console.error('Database có quá nhiều kết nối.');
        }
        if (err.code === 'ECONNREFUSED') {
            console.error('Kết nối Database bị từ chối.');
        }
        return;
    }
    if (connection) {
        connection.release(); // Trả kết nối về pool
        console.log('Đã kết nối thành công đến MySQL!');
    }
});

// Xuất pool để có thể sử dụng trong các modules khác
// Sử dụng promise để dễ dàng làm việc với async/await
module.exports = pool.promise();