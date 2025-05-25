// frontend/assets/js/api.js
const API_BASE_URL = 'http://localhost:5000/api'; // Địa chỉ backend của bạn

/**
 * Hàm fetch API chung
 * @param {string} endpoint - Đường dẫn API 
 * @param {string} method - Phương thức HTTP 
 * @param {object} [body=null] - Dữ liệu gửi đi
 * @param {string} [token=null] - JWT token 
 * @returns {Promise<object>} - Dữ liệu JSON từ server
 */
async function fetchAPI(endpoint, method = 'GET', body = null, token = null) {
    const headers = {
        'Content-Type': 'application/json',
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        method: method,
        headers: headers,
    };

    if (body && (method === 'POST' || method === 'PUT')) {
        config.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        if (response.status === 204) {
            return null; 
        }

        const data = await response.json();

        if (!response.ok) {
           displayMessage(`Lỗi API: ${data.message || response.statusText}`, 'error');
            throw new Error(data.message || response.statusText);
        }
        return data;
    } catch (error) {
        console.error(`Lỗi khi gọi API ${method} ${endpoint}:`, error);   
        displayMessage(error.message || 'Không thể kết nối đến server.', 'error');
        throw error; 
    }
}

// --- Movie API Calls ---
async function getNowShowingMovies() {
    return fetchAPI('/movies/now-showing');
}

async function getComingSoonMovies() {
    return fetchAPI('/movies/coming-soon');
}

async function getMovieById(movieId) {
    return fetchAPI(`/movies/${movieId}`);
}

async function getShowtimesByMovieId(movieId) {
    return fetchAPI(`/movies/${movieId}/showtimes`);
}

// --- Auth API Calls ---
async function loginUser(credentials) { // {email, password}
    return fetchAPI('/auth/login', 'POST', credentials);
}

async function registerUser(userData) { // {name, email, password, phone}
    return fetchAPI('/auth/register', 'POST', userData);
}

// --- Booking API Calls ---
/**
 * Lấy thông tin ghế cho một suất chiếu cụ thể
 * @param {number} showtimeId 
 * @param {string} token 
 * @returns {Promise<object>} - Thông tin ghế và sơ đồ phòng
 */
async function getSeatsForShowtime(showtimeId, token) {
    return fetchAPI(`/bookings/${showtimeId}/seats`, 'GET', null, token);
}

/**
 * Tạo một booking mới
 * @param {object} bookingData - { showtimeId, seatIds, totalAmount }
 * @param {string} token 
 * @returns {Promise<object>} - Thông tin booking đã tạo
 */
async function createBooking(bookingData, token) {
    return fetchAPI('/bookings', 'POST', bookingData, token);
}

/**
 * Lấy vé đã đặt của người dùng
 * @param {string} token 
 * @returns {Promise<Array>} - Danh sách vé
 */
async function getUserTickets(token) {
    return fetchAPI('/bookings/my-tickets', 'GET', null, token);
}

/**
 * Hủy một đơn đặt vé cụ thể.
 * @param {number} bookingId - ID của đơn đặt vé cần hủy.
 * @param {string} token - JWT token của người dùng.
 * @returns {Promise<object>} - Kết quả từ server.
 */
async function cancelBooking(bookingId, token) {
    // API endpoint của bạn là DELETE /api/bookings/:bookingId
    return fetchAPI(`/bookings/${bookingId}`, 'DELETE', null, token);
}

// --- Payment API Calls (Giả lập) ---
/**
 * Xử lý thanh toán
 * @param {object} paymentData - { bookingId, paymentMethod, amount }
 * @param {string} token 
 * @returns {Promise<object>} - Kết quả thanh toán
 */
async function processPayment(paymentData, token) {
    // API này cần được tạo ở backend, ví dụ: /payments/process
    return fetchAPI('/payments/process', 'POST', paymentData, token);
}

// --- Admin Movie API Calls ---

/**
 * Lấy tất cả phim (dành cho admin).
 * @param {string} token - JWT token của admin.
 * @returns {Promise<Array<object>>} - Danh sách phim.
 */
async function getMoviesAdmin(token) {
    return fetchAPI('/admin/movies', 'GET', null, token);
}

/**
 * Tạo phim mới (dành cho admin).
 * @param {object} movieData - Dữ liệu phim.
 * @param {string} token - JWT token của admin.
 * @returns {Promise<object>} - Phim mới được tạo.
 */
async function createMovieAdmin(movieData, token) {
    return fetchAPI('/admin/movies', 'POST', movieData, token);
}
/**
 * Cập nhật phim (dành cho admin).
 * @param {number} movieId - ID của phim cần cập nhật.
 * @param {object} movieData - Dữ liệu phim mới.
 * @param {string} token - JWT token của admin.
 * @returns {Promise<object>} - Phim đã cập nhật.
 */
async function updateMovieAdmin(movieId, movieData, token) {
    return fetchAPI(`/admin/movies/${movieId}`, 'PUT', movieData, token);
}

/**
 * Xóa phim (dành cho admin).
 * @param {number} movieId - ID của phim cần xóa.
 * @param {string} token - JWT token của admin.
 * @returns {Promise<null>}
 */
async function deleteMovieAdmin(movieId, token) {
    return fetchAPI(`/admin/movies/${movieId}`, 'DELETE', null, token);
}

// --- Admin User API Calls ---

/**
 * Lấy tất cả người dùng (dành cho admin).
 * @param {string} token - JWT token của admin.
 * @returns {Promise<Array<object>>} - Danh sách người dùng.
 */
async function getUsersAdmin(token) {
    return fetchAPI('/admin/users', 'GET', null, token);
}

/**
 * Lấy thông tin profile của một người dùng cụ thể (dành cho admin).
 * @param {number} userId - ID của người dùng.
 * @param {string} token - JWT token của admin.
 * @returns {Promise<object>} - Thông tin profile người dùng.
 */
async function getUserProfileAdmin(userId, token) {
    return fetchAPI(`/admin/users/${userId}`, 'GET', null, token);
}

/**
 * Cập nhật thông tin người dùng (dành cho admin).
 * @param {number} userId - ID của người dùng cần cập nhật.
 * @param {object} userData - Dữ liệu người dùng mới.
 * @param {string} token - JWT token của admin.
 * @returns {Promise<object>} - Người dùng đã cập nhật.
 */
async function updateUserAdmin(userId, userData, token) {
    return fetchAPI(`/admin/users/${userId}`, 'PUT', userData, token);
}

/**
 * Xóa người dùng (dành cho admin).
 * @param {number} userId - ID của người dùng cần xóa.
 * @param {string} token - JWT token của admin.
 * @returns {Promise<null>}
 */
async function deleteUserAdmin(userId, token) {
    return fetchAPI(`/admin/users/${userId}`, 'DELETE', null, token);
}



async function getMovieById(movieId) {
    return fetchAPI(`/movies/${movieId}`, 'GET');
}
