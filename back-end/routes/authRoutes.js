//Định nghĩa các API endpoint cho đăng ký và đăng nhập

// backend/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware'); // Middleware bảo vệ

// POST /api/auth/register - Đăng ký người dùng mới
router.post('/register', authController.registerUser);

// POST /api/auth/login - Đăng nhập người dùng
router.post('/login', authController.loginUser);

// GET /api/auth/profile - Lấy thông tin profile người dùng hiện tại (yêu cầu đăng nhập)
// Ví dụ nếu bạn muốn có một endpoint để lấy thông tin người dùng đã đăng nhập
router.get('/profile', protect, authController.getUserProfile);

// PUT /api/auth/profile - Cập nhật thông tin profile người dùng (yêu cầu đăng nhập)
// router.put('/profile', protect, authController.updateUserProfile); // Bạn có thể thêm chức năng này

module.exports = router;
