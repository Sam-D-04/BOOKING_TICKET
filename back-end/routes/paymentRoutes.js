const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

// POST /api/payments/process - Xử lý một yêu cầu thanh toán mới
router.post('/process', protect, paymentController.processPayment);

//GET /api/payments/status/:bookingId - Kiểm tra trạng thái thanh toán của một booking (ví dụ)
 router.get('/status/:bookingId', protect, paymentController.getPaymentStatus);

module.exports = router;
