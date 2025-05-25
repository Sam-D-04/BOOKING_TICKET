
const db = require('../config/db'); // Import pool kết nối đã được promise hóa

// Lấy tất cả phim 
exports.getAllMovies = async (req, res) => {
    try {
        const [movies] = await db.query('SELECT id, title, description, genre, duration, release_date, status, poster_url FROM movie');

        res.json(movies);
    } catch (error) {
        console.error('Lỗi lấy danh sách phim:', error);
        res.status(500).json({ message: 'Lỗi server khi lấy danh sách phim.', error: error.message });
    }
};

// Lấy danh sách phim đang chiếu
exports.getNowShowingMovies = async (req, res) => {
    try {
        const query = "SELECT id, title, description, genre, duration, release_date, status, poster_url FROM movie WHERE status = 'now_showing'";
        const [movies] = await db.query(query);
        res.json(movies);
    } catch (error) {
        console.error('Lỗi lấy phim đang chiếu:', error);
        res.status(500).json({ message: 'Lỗi server khi lấy phim đang chiếu.', error: error.message });
    }
};

// Lấy danh sách phim sắp chiếu
exports.getComingSoonMovies = async (req, res) => {
    try {
        const query = "SELECT id, title, description, genre, duration, release_date, status, poster_url FROM movie WHERE status = 'coming_soon'";
        const [movies] = await db.query(query);
        res.json(movies);
    } catch (error) {
        console.error('Lỗi lấy phim sắp chiếu:', error);
        res.status(500).json({ message: 'Lỗi server khi lấy phim sắp chiếu.', error: error.message });
    }
};


// Lấy chi tiết một phim bằng ID
exports.getMovieById = async (req, res) => {
    try {
        const movieId = req.params.id;
        const query = 'SELECT id, title, description, genre, duration, release_date, status, poster_url FROM movie WHERE id = ?';
        const [movies] = await db.query(query, [movieId]);

        if (movies.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy phim.' });
        }
        res.json(movies[0]);
    } catch (error) {
        console.error('Lỗi lấy chi tiết phim:', error);
        res.status(500).json({ message: 'Lỗi server khi lấy chi tiết phim.', error: error.message });
    }
};

// Lấy lịch chiếu của một phim
exports.getShowtimesByMovieId = async (req, res) => {
    try {
        const movieId = req.params.id;
        // Truy vấn này cần join với bảng theater để lấy tên phòng chiếu
        const query = `
            SELECT s.id as showtime_id, s.date_time, s.price, s.status as showtime_status,
                   t.id as theater_id, t.name as theater_name
            FROM showtime s
            JOIN theater t ON s.theater_id = t.id
            WHERE s.movie_id = ? AND s.status = 'open' AND s.date_time >= NOW()
            ORDER BY s.date_time ASC
        `;
        const [showtimes] = await db.query(query, [movieId]);

        if (showtimes.length === 0) {
            return res.status(404).json({ message: 'Phim này hiện chưa có lịch chiếu hoặc đã hết lịch chiếu.' });
        }
        res.json(showtimes);
    } catch (error) {
        console.error('Lỗi lấy lịch chiếu:', error);
        res.status(500).json({ message: 'Lỗi server khi lấy lịch chiếu.', error: error.message });
    }
};
