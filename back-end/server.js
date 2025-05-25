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


const CANCELLATION_TIMEOUT_MINUTES = 5; // Thời gian giữ vé 

async function autoCancelExpiredBookings() {
    console.log('Đang chạy tác vụ hủy đặt vé hết hạn...');
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // Tìm các đặt vé đang chờ xử lý đã quá 5 phút
        const [expiredBookings] = await connection.query(
            `SELECT b.id AS booking_id, bs.seat_id, b.showtime_id
             FROM bookings b
             JOIN booking_seats bs ON b.id = bs.booking_id
             WHERE b.booking_status = 'pending' AND b.booking_time < NOW() - INTERVAL ? MINUTE`,
            [CANCELLATION_TIMEOUT_MINUTES]
        );

        if (expiredBookings.length > 0) {
            const bookingIdsToCancel = [...new Set(expiredBookings.map(b => b.booking_id))];
            console.log(`Tìm thấy ${bookingIdsToCancel.length} đặt vé hết hạn cần hủy.`);

            // Cập nhật trạng thái của các đặt vé này thành 'cancelled'
            await connection.query(
                'UPDATE bookings SET booking_status = ? WHERE id IN (?)',
                ['cancelled', bookingIdsToCancel]
            );

            // Giải phóng ghế trong showtime_seats
            for (const booking of expiredBookings) {
                await connection.query(
                    'UPDATE showtime_seats SET is_available = TRUE WHERE showtime_id = ? AND seat_id = ?',
                    [booking.showtime_id, booking.seat_id]
                );
            }

            console.log(`Đã hủy thành công ${bookingIdsToCancel.length} đặt vé hết hạn.`);
        } else {
            console.log('Không tìm thấy đặt vé hết hạn nào.');
        }

        await connection.commit();
    } catch (error) {
        await connection.rollback();
        console.error('Lỗi trong tác vụ hủy tự động:', error);
    } finally {
        connection.release();
    }
}

// Chạy tác vụ hủy tự động mỗi phút (60 giây)
// Đảm bảo server của đã khởi động trước khi gọi setInterval
setInterval(autoCancelExpiredBookings, 60 * 1000); 