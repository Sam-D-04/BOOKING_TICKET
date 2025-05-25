// backend/server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config(); // Đảm bảo file .env được đọc

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Cho phép Cross-Origin Resource Sharing
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request bodies

// Routes (Bạn sẽ tạo các file này)
const movieRoutes = require('./routes/movieRoutes');
const authRoutes = require('./routes/authRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const paymentRoutes = require('./routes/paymentRoutes'); 
const adminRoutes = require('./routes/adminRoutes');
app.get('/', (req, res) => {
    res.send('Chào mừng đến với API Đặt Vé Xem Phim!');
});

// Sử dụng routes
app.use('/api/movies', movieRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);

// Xử lý lỗi chung (ví dụ)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send({ message: 'Đã có lỗi xảy ra trên server!', error: err.message });
});

app.listen(PORT, () => {
    console.log(`Server đang chạy trên cổng ${PORT}`);
    // Kiểm tra kết nối DB khi server khởi động (tùy chọn, vì db.js đã làm)
    const db = require('./config/db');
    db.getConnection()
        .then(conn => {
            console.log('Kết nối DB từ server.js thành công.');
            conn.release();
        })
        .catch(err => console.error('Không thể kết nối DB từ server.js:', err));
});

