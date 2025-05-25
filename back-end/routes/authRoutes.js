const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware'); // Middleware bảo vệ

// POST /api/auth/register - Đăng ký người dùng mới
router.post('/register', authController.registerUser);

// POST /api/auth/login - Đăng nhập người dùng
router.post('/login', authController.loginUser);

// GET /api/auth/profile - Lấy thông tin profile người dùng hiện tại (yêu cầu đăng nhập)
router.get('/profile', protect, authController.getUserProfile);

module.exports = router;
