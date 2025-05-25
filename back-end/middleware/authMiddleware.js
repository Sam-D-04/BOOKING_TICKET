
const jwt = require('jsonwebtoken');
const db = require('../config/db'); // Đảm bảo bạn có kết nối DB ở đây

const JWT_SECRET = process.env.JWT_SECRET;

// Middleware bảo vệ các tuyến đường yêu cầu xác thực
exports.protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, JWT_SECRET);

            // Lấy thông tin người dùng từ DB
            const query = 'SELECT id, name, email, role FROM registered_user WHERE id = ?'; // Hoặc SELECT ..., is_admin FROM ...
            const [users] = await db.query(query, [decoded.id]);

            if (users.length === 0) {
                return res.status(401).json({ message: 'Không được phép, người dùng không tồn tại.' });
            }

            req.user = users[0]; // Gắn thông tin người dùng vào req
            next();
        } catch (error) {
            console.error('Lỗi xác thực token:', error);
            res.status(401).json({ message: 'Không được phép, token không hợp lệ.' });
        }
    }
    if (!token) {
        res.status(401).json({ message: 'Không được phép, không có token.' });
    }
};

// Middleware bảo vệ các tuyến đường yêu cầu quyền admin
exports.adminProtect = (req, res, next) => {
    // req.user phải được gắn bởi middleware 'protect' trước đó
    if (!req.user) {
        return res.status(401).json({ message: 'Không được phép, người dùng không xác định.' });
    }
    // Kiểm tra vai trò của người dùng
    if (req.user.role !== 'admin') { 
        return res.status(403).json({ message: 'Không được phép, bạn không có quyền admin.' });
    }
    next();
};