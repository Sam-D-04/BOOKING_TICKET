const db = require('../config/db');
const bcrypt = require('bcryptjs'); // Nếu bạn muốn cho admin đổi mật khẩu người dùng

// --- Quản lý phim ---
exports.getAllMovies = async (req, res) => {
    try {
        const [movie] = await db.query('SELECT * FROM movie');
        res.json(movie);
    } catch (error) {
        console.error('Lỗi khi lấy tất cả phim:', error);
        res.status(500).json({ message: 'Lỗi server khi lấy phim.', error: error.message });
    }
};

exports.createMovie = async (req, res) => {
    const { title, description, genre, duration, poster_url, release_date,status } = req.body;
    try {
        const query = 'INSERT INTO movie (title, description, genre, duration, poster_url, release_date,  status) VALUES (?, ?, ?, ?, ?, ?, ?)';
        const [result] = await db.query(query, [title, description, genre, duration, poster_url, release_date,  status]);
        res.status(201).json({ message: 'Phim đã được tạo thành công', movieId: result.insertId });
    } catch (error) {
        console.error('Lỗi khi tạo phim:', error);
        res.status(500).json({ message: 'Lỗi server khi tạo phim.', error: error.message });
    }
};

exports.updateMovie = async (req, res) => {
    const { id } = req.params;
    const { title, description, genre, duration, poster_url, release_date, status } = req.body;
    try {
        const query = 'UPDATE movie SET title=?, description=?, genre=?, duration=?, poster_url=?, release_date=?, status=? WHERE id=?';
        const [result] = await db.query(query, [title, description, genre, duration, poster_url, release_date, status, id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Không tìm thấy phim để cập nhật.' });
        }
        res.json({ message: 'Phim đã được cập nhật thành công!' });
    } catch (error) {
        console.error('Lỗi khi cập nhật phim:', error);
        res.status(500).json({ message: 'Lỗi server khi cập nhật phim.', error: error.message });
    }
};

exports.deleteMovie = async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await db.query('DELETE FROM movie WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Không tìm thấy phim để xóa.' });
        }
        res.json({ message: 'Phim đã được xóa thành công!' });
    } catch (error) {
        console.error('Lỗi khi xóa phim:', error);
        res.status(500).json({ message: 'Lỗi server khi xóa phim.', error: error.message });
    }
};

// --- Quản lý người dùng ---
exports.getAllUsers = async (req, res) => {
    try {
        // Không nên trả về mật khẩu
        const [users] = await db.query('SELECT id, name, email, phone, role FROM registered_user');
        res.json(users);
    } catch (error) {
        console.error('Lỗi khi lấy tất cả người dùng:', error);
        res.status(500).json({ message: 'Lỗi server khi lấy người dùng.', error: error.message });
    }
};

exports.updateUser = async (req, res) => {
    const { id } = req.params;
    const { name, email, phone, role, password } = req.body; 
    let updateFields = { name, email, phone, role }; 

    try {
        if (password) {
            const salt = await bcrypt.genSalt(10);
            updateFields.password = await bcrypt.hash(password, salt);
        }

        const setClauses = Object.keys(updateFields).map(key => `${key} = ?`).join(', ');
        const values = Object.values(updateFields);
        values.push(id); 

        const query = `UPDATE registered_user SET ${setClauses} WHERE id = ?`;
        const [result] = await db.query(query, values);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng để cập nhật.' });
        }
        res.json({ message: 'Người dùng đã được cập nhật thành công!' });
    } catch (error) {
        console.error('Lỗi khi cập nhật người dùng:', error);
        res.status(500).json({ message: 'Lỗi server khi cập nhật người dùng.', error: error.message });
    }
};

exports.deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await db.query('DELETE FROM registered_user WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng để xóa.' });
        }
        res.json({ message: 'Người dùng đã được xóa thành công!' });
    } catch (error) {
        console.error('Lỗi khi xóa người dùng:', error);
        res.status(500).json({ message: 'Lỗi server khi xóa người dùng.', error: error.message });
    }
};

exports.getUserById = async (req, res) => {
    const { id } = req.params; // Lấy ID từ URL
    try {
        const query = 'SELECT id, name, email, phone, role FROM registered_user WHERE id = ?';
        const [users] = await db.query(query, [id]);

        if (users.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng.', user_id: id });
        }
        res.json(users[0]);
    } catch (error) {
        console.error('Lỗi server khi lấy người dùng theo ID:', error);
        // Rất quan trọng: Luôn trả về JSON khi có lỗi server
        res.status(500).json({ message: 'Lỗi server khi lấy người dùng.', error: error.message });
    }
};