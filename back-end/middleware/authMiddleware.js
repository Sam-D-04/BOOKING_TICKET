//Tệp này sẽ chứa middleware để kiểm tra JSON Web Token (JWT) và bảo vệ các route yêu cầu người dùng phải đăng nhập.

const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    console.error("FATAL ERROR: JWT_SECRET is not defined in .env file.");
    process.exit(1); // Thoát ứng dụng nếu JWT_SECRET không được định nghĩa
}

const protect = (req, res, next) => {
    let token;
    // Kiểm tra xem token có trong header Authorization không và có bắt đầu bằng 'Bearer' không
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Lấy token từ header (loại bỏ 'Bearer ')
            token = req.headers.authorization.split(' ')[1];

            // Xác thực token
            const decoded = jwt.verify(token, JWT_SECRET);

            // Gắn thông tin người dùng đã giải mã vào đối tượng request
            // Bạn có thể muốn lấy thông tin người dùng đầy đủ từ DB ở đây nếu cần
            // Ví dụ: req.user = await User.findById(decoded.id).select('-password');
            req.user = decoded; // decoded sẽ chứa { id: userId, ... } mà bạn đã đặt khi tạo token

            next(); // Chuyển sang middleware hoặc controller tiếp theo
        } catch (error) {
            console.error('Lỗi xác thực token:', error.message);
            if (error.name === 'JsonWebTokenError') {
                return res.status(401).json({ message: 'Token không hợp lệ.' });
            }
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({ message: 'Token đã hết hạn.' });
            }
            res.status(401).json({ message: 'Không được phép, token thất bại.' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Không được phép, không tìm thấy token.' });
    }
};

// Middleware để kiểm tra vai trò admin (ví dụ, nếu bạn có)
const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') { // Giả sử token có chứa thông tin role
        next();
    } else {
        res.status(403).json({ message: 'Không được phép, yêu cầu quyền quản trị viên.' });
    }
};


module.exports = { protect, isAdmin };
