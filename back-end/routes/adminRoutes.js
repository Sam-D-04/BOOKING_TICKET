// backend/routes/adminRoutes.js (Tạo file mới)
const express = require('express');
const router = express.Router();
const { protect, adminProtect } = require('../middleware/authMiddleware');
const adminController = require('../controllers/adminController'); 

// Tuyến API để quản lý phim 
router.get('/movies', protect, adminProtect, adminController.getAllMovies);
router.post('/movies', protect, adminProtect, adminController.createMovie);
router.put('/movies/:id', protect, adminProtect, adminController.updateMovie);
router.delete('/movies/:id', protect, adminProtect, adminController.deleteMovie);

// Tuyến API để quản lý người dùng 
router.get('/users', protect, adminProtect, adminController.getAllUsers);
router.put('/users/:id', protect, adminProtect, adminController.updateUser);
router.delete('/users/:id', protect, adminProtect, adminController.deleteUser);
router.get('/users/:id', protect, adminProtect, adminController.getUserById);

module.exports = router;