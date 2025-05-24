## Yêu cầu cài đặt

- [Node.js](https://nodejs.org/) (bao gồm npm)
- MySQL Server

## Hướng dẫn cài đặt và chạy dự án

### 1. Cơ sở dữ liệu

1.  Đảm bảo MySQL Server của bạn đang chạy.
2.  Tạo một cơ sở dữ liệu mới (ví dụ: `movie_booking_db`).
3.  Import file `database/booking_ticket.sql` vào cơ sở dữ liệu vừa tạo. Bạn có thể sử dụng một công cụ quản lý MySQL như phpMyAdmin hoặc dòng lệnh:
    ```bash
    mysql -u [username] -p [database_name] < database/booking_ticket.sql
    ```
    Thay `[username]` bằng tên người dùng MySQL của bạn và `[database_name]` bằng tên cơ sở dữ liệu bạn đã tạo.

### 2. Backend

1.  Đi đến thư mục `backend`:
    ```bash
    cd movie-booking/backend
    ```
2.  Cài đặt các dependencies:

    ```bash
    npm install
    ```

    Các dependencies chính cần có trong `package.json` (bạn sẽ cần tạo file này và thêm chúng vào):

    - `express`: Framework web
    - `mysql2`: Driver MySQL cho Node.js
    - `bcryptjs`: Để mã hóa mật khẩu
    - `jsonwebtoken`: Để tạo và xác thực token JWT (nếu dùng session token)
    - `cors`: Để cho phép cross-origin requests từ frontend
    - `dotenv`: Để quản lý biến môi trường (ví dụ: thông tin kết nối DB)

3.  Tạo file `.env` trong thư mục `backend/` với nội dung sau, thay thế bằng thông tin kết nối MySQL của bạn:

    ```
    DB_HOST=localhost
    DB_USER=root
    DB_PASSWORD=
    DB_NAME=movie_booking_db
    PORT=5000
    JWT_SECRET=your_jwt_secret_key # Cần thiết nếu dùng JWT
    ```

4.  Chạy server backend:
    ```bash
    node server.js
    ```
    Hoặc nếu bạn dùng `nodemon` để tự động restart server khi có thay đổi:
    ```bash
    nodemon server.js
    ```
    Backend sẽ chạy tại `http://localhost:5000` (hoặc cổng bạn cấu hình).

### 3. Frontend

1.  Mở các file HTML (ví dụ: `frontend/index.html`) trực tiếp bằng trình duyệt.
2.  Không cần bước build phức tạp vì đây là HTML/CSS/JS tĩnh. Frontend sẽ giao tiếp với backend qua API.

## Các chức năng chính (theo yêu cầu)

- **Xem danh sách phim đang chiếu:** Trang chủ (`index.html`).
- **Xem chi tiết phim và lịch chiếu:** Trang chi tiết phim (`movie.html`).
- **Đăng ký/Đăng nhập người dùng:** `login.html`, `register.html`. Sử dụng `localStorage` để lưu trạng thái đăng nhập.
- **Chọn suất chiếu, chọn ghế, đặt vé:** `booking.html`.
- **Thanh toán (online hoặc tại quầy):** `payment.html`. Thanh toán online sẽ được giả lập.
- **Hiển thị thông tin vé đã đặt:** `profile.html`.

## Luồng hoạt động (Sequence Diagram)

## Đã được cung cấp trong yêu cầu ban đầu. Backend API sẽ được thiết kế để hỗ trợ luồng này.

# CinemaHub - Movie Booking Website

A modern web application for booking movie tickets, built with HTML, CSS, and JavaScript.

## Features

- **Browse Movies**: View now showing and coming soon movies
- **User Authentication**: Register and login functionality
- **Movie Details**: View movie information and available showtimes
- **Seat Selection**: Interactive seat selection interface
- **Booking Process**: Select seats, proceed to payment, and receive tickets
- **User Profile**: View booked tickets and manage profile information

## Project Structure

- `/src/css/` - CSS styles
- `/src/js/` - JavaScript modules
  - `api.js` - API calls to backend
  - `auth.js` - Authentication handling
  - `components.js` - Reusable UI components
  - `main.js` - Main initialization code
  - `utils.js` - Utility functions

## Pages

1. `index.html` - Homepage with now showing and coming soon movies
2. `login.html` - User login page
3. `register.html` - User registration page
4. `movies.html` - All movies listing with search and filter
5. `movie.html` - Movie details and showtimes
6. `booking.html` - Seat selection interface
7. `payment.html` - Payment processing
8. `profile.html` - User profile and tickets

## Setup and Running

### Prerequisites

- [Bun](https://bun.sh/) or Node.js installed

### Installation

1. Clone the repository:

   ```
   git clone https://github.com/yourusername/movie-booking-website.git
   cd movie-booking-website
   ```

2. Install dependencies:

   ```
   bun install
   ```

3. Start the development server:

   ```
   bun run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

## Backend Integration

This front-end application is designed to work with a REST API backend. The backend should provide endpoints for:

- Movie listings and details
- User authentication
- Seat booking and management
- Payment processing

The API endpoints are defined in `src/js/api.js`. The default API base URL is set to `http://localhost:5000/api`.

## Notes

- The application uses a mock backend. In a production environment, you would need to connect to a real backend service.
- The payment processing is simulated and would need integration with actual payment gateways in production.
- All pages are responsive and work on mobile, tablet, and desktop screens.

## License

MIT
