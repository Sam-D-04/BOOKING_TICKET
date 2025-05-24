//Logic xử lý cho việc đăng ký, đăng nhập và lấy thông tin người dùng

const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '30d'; // Mặc định token hết hạn sau 30 ngày

if (!JWT_SECRET) {
    console.error("FATAL ERROR: JWT_SECRET is not defined in .env file for authController.");
    // Không nên process.exit(1) ở đây vì nó có thể đã được gọi ở middleware
}

// Hàm tạo JWT token
const generateToken = (userId, userName, userEmail) => {
    if (!JWT_SECRET) {
        throw new Error("JWT_SECRET is not configured.");
    }
    return jwt.sign({ id: userId, name: userName, email: userEmail }, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
    });
};

// Đăng ký người dùng mới
exports.registerUser = async (req, res) => {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Vui lòng cung cấp tên, email và mật khẩu.' });
    }

    try {
        // Kiểm tra xem email đã tồn tại chưa
        const [existingUsers] = await db.query('SELECT email FROM registered_user WHERE email = ?', [email]);
        if (existingUsers.length > 0) {
            return res.status(400).json({ message: 'Email này đã được sử dụng.' });
        }

        // Mã hóa mật khẩu
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Lưu người dùng vào database
        const query = 'INSERT INTO registered_user (name, email, password, phone) VALUES (?, ?, ?, ?)';
        const [result] = await db.query(query, [name, email, hashedPassword, phone || null]);

        if (result.insertId) {
            res.status(201).json({
                message: 'Đăng ký người dùng thành công!',
                userId: result.insertId,
                name: name,
                email: email,
            });
        } else {
            res.status(500).json({ message: 'Lỗi server khi đăng ký người dùng.' });
        }
    } catch (error) {
        console.error('Lỗi đăng ký người dùng:', error);
        res.status(500).json({ message: 'Lỗi server khi đăng ký người dùng.', error: error.message });
    }
};

// Đăng nhập người dùng
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Vui lòng cung cấp email và mật khẩu.' });
    }

    try {
        // Tìm người dùng bằng email và lấy cả trường 'role' (hoặc 'is_admin')
        const query = 'SELECT id, name, email, password, role FROM registered_user WHERE email = ?'; // Hoặc SELECT ..., is_admin FROM ...
        const [users] = await db.query(query, [email]);

        if (users.length === 0) {
            return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng.' });
        }

        const user = users[0];

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng.' });
        }

        const token = generateToken(user.id, user.name, user.email);

        res.json({
            message: 'Đăng nhập thành công!',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role, 
            },
        });
    } catch (error) {
        console.error('Lỗi đăng nhập:', error);
        res.status(500).json({ message: 'Lỗi server khi đăng nhập.', error: error.message });
    }
};

// Lấy thông tin profile người dùng (ví dụ)
exports.getUserProfile = async (req, res) => {
    // req.user được gắn từ middleware 'protect'
    if (!req.user || !req.user.id) {
        return res.status(401).json({ message: 'Không được phép, người dùng không xác định.' });
    }
    try {
        const userId = req.user.id;
        const query = 'SELECT id, name, email, phone FROM registered_user WHERE id = ?';
        const [users] = await db.query(query, [userId]);

        if (users.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng.' });
        }

        res.json(users[0]);
    } catch (error) {
        console.error('Lỗi lấy thông tin người dùng:', error);
        res.status(500).json({ message: 'Lỗi server khi lấy thông tin người dùng.', error: error.message });
    }
};
