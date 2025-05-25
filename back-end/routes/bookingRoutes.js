//Định nghĩa các API endpoint cho việc đặt vé và xem lịch sử đặt vé

// backend/routes/bookingRoutes.js
const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware'); // Yêu cầu đăng nhập cho các hành động này

// GET /api/bookings/showtimes/:showtimeId/seats - Lấy thông tin ghế và trạng thái của một suất chiếu
router.get('/:showtimeId/seats', protect, bookingController.getSeatsForShowtime);

// POST /api/bookings - Tạo một đơn đặt vé mới
router.post('/', protect, bookingController.createBooking);

// GET /api/bookings/my-tickets - Lấy danh sách vé đã đặt của người dùng hiện tại
router.get('/my-tickets', protect, bookingController.getUserTickets);

// GET /api/bookings/:bookingId - Lấy chi tiết một đơn đặt vé (có thể dùng cho admin hoặc người dùng tự xem)
router.get('/:bookingId', protect, bookingController.getBookingDetails);

// DELETE /api/bookings/:bookingId - Hủy đặt vé 
router.delete('/:bookingId', protect, bookingController.cancelBooking); 


module.exports = router;


