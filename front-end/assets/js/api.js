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
            console.error('Lỗi API:', data.message || response.statusText);
            throw new Error(data.message || `Lỗi ${response.status}`);
        }
        return data;
    } catch (error) {
        console.error(`Lỗi khi gọi API ${method} ${endpoint}:`, error);   
        DisplayMessage(error.message || 'Không thể kết nối đến server.', 'error');
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
    // API này cần được tạo ở backend, ví dụ: /bookings/showtimes/:showtimeId/seats
    return fetchAPI(`/bookings/showtimes/${showtimeId}/seats`, 'GET', null, token);
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

