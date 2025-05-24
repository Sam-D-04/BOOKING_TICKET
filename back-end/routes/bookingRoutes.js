//Định nghĩa các API endpoint cho việc đặt vé và xem lịch sử đặt vé

// backend/routes/bookingRoutes.js
const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware'); // Yêu cầu đăng nhập cho các hành động này

// GET /api/bookings/showtimes/:showtimeId/seats - Lấy thông tin ghế và trạng thái của một suất chiếu
router.get('/showtimes/:showtimeId/seats', protect, bookingController.getSeatsForShowtime);

// POST /api/bookings - Tạo một đơn đặt vé mới
router.post('/', protect, bookingController.createBooking);

// GET /api/bookings/my-tickets - Lấy danh sách vé đã đặt của người dùng hiện tại
router.get('/my-tickets', protect, bookingController.getUserTickets);

// GET /api/bookings/:bookingId - Lấy chi tiết một đơn đặt vé (có thể dùng cho admin hoặc người dùng tự xem)
router.get('/:bookingId', protect, bookingController.getBookingDetails);

// POST /api/bookings/:bookingId/cancel - Hủy một đơn đặt vé (ví dụ)
// router.post('/:bookingId/cancel', protect, bookingController.cancelBooking);

module.exports = router;


