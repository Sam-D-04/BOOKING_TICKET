// backend/routes/movieRoutes.js
const express = require('express');
const router = express.Router();
const movieController = require('../controllers/movieController');

// GET /api/movies - Lấy danh sách tất cả phim (đang chiếu)
router.get('/', movieController.getAllMovies);

// GET /api/movies/now-showing - Lấy danh sách phim đang chiếu
router.get('/now-showing', movieController.getNowShowingMovies);

// GET /api/movies/coming-soon - Lấy danh sách phim sắp chiếu
router.get('/coming-soon', movieController.getComingSoonMovies);

// GET /api/movies/:id - Lấy chi tiết một phim bằng ID
router.get('/:id', movieController.getMovieById);

// GET /api/movies/:id/showtimes - Lấy lịch chiếu của một phim
router.get('/:id/showtimes', movieController.getShowtimesByMovieId);

module.exports = router;
