function createMessageArea() {
    const existingArea = document.getElementById('messageArea');
    if (existingArea) return existingArea;

    const area = document.createElement('div');
    area.id = 'messageArea';
    area.className = 'message-area';
    area.style.display = 'none';
    document.body.insertBefore(area, document.body.firstChild);
    return area;
}

function displayMessage(message, type = 'info', duration = 3000) {
    const messageArea = document.getElementById('messageArea') || createMessageArea();
    if (!messageArea) return;

    messageArea.textContent = message;
    messageArea.className = `message-area ${type}`; // success, error, info
    messageArea.style.display = 'block';

    if (duration > 0) {
        setTimeout(() => {
            messageArea.style.display = 'none';
        }, duration);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Kiểm tra trạng thái đăng nhập của người dùng mỗi khi trang tải
    updateUserAuthSection();

    const path = window.location.pathname;

    // Xác định trang nào đang được tải và gọi hàm phù hợp
    if (path.includes('index.html') || path === '/') {
        console.log('Đang tải nội dung trang chủ...');
        loadHomePageContent();
    } else if (path.includes('movie-detail.html')) {
        console.log('Đang tải trang chi tiết phim...');
        loadMovieDetailPage();
    } else if (path.includes('booking.html')) {
        console.log('Đang tải trang đặt vé...');
        loadBookingPage();
    } else if (path.includes('tickets.html')) {
        console.log('Đang tải trang vé của người dùng...');
        loadUserTicketsPage();
    } else if (path.includes('login.html')) {
        console.log('Đang thiết lập biểu mẫu đăng nhập...');
        setupLoginForm();
    } else if (path.includes('register.html')) {
        console.log('Đang thiết lập biểu mẫu đăng ký...');
        setupRegisterForm();
    } else if (path.includes('payment.html')) {
        console.log('Đang tải trang thanh toán...');
        loadPaymentPage();
    } else if (path.includes('admin.html')) { // Thêm điều kiện cho trang admin
        console.log('Đang tải trang quản trị...');
        loadAdminPage();
    }

    const adminLogoutBtn = document.getElementById('logoutBtn');
        if (adminLogoutBtn) {
            adminLogoutBtn.addEventListener('click', () => {
                handleLogoutAdmin(); 
            });
        }

    function handleLogoutAdmin() {
    // Xóa token JWT khỏi localStorage
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole'); // Xóa vai trò admin

    // Hiển thị thông báo đăng xuất thành công
    displayMessage('Bạn đã đăng xuất thành công khỏi Admin Dashboard!', 'success', 2000);

    setTimeout(() => {
        window.location.href = 'index.html'; 
    }, 2000);
}

    function updateUserAuthSection() {
        const userAuthSection = document.getElementById('userAuthSection');
        if (!userAuthSection) return;

        const token = localStorage.getItem('jwtToken');
        const userName = localStorage.getItem('userName');
        const userRole = localStorage.getItem('userRole'); // Lấy vai trò người dùng

        userAuthSection.innerHTML = ''; // Xóa các nút hiện có

        if (token && userName) {
            // Người dùng đã đăng nhập
            const userGreeting = document.createElement('span');
            userGreeting.textContent = `Xin chào, ${userName}!`;
            userGreeting.style.marginRight = '15px';
            userGreeting.style.fontWeight = 'bold';
            userAuthSection.appendChild(userGreeting);

            // Nếu là admin, hiển thị nút Admin Dashboard
            if (userRole === 'admin') {
                const adminDashboardButton = document.createElement('button');
                adminDashboardButton.textContent = 'Admin Dashboard';
                adminDashboardButton.className = 'bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out mr-2';
                adminDashboardButton.onclick = () => { location.href = 'admin.html'; };
                userAuthSection.appendChild(adminDashboardButton);
            }

            const logoutButton = document.createElement('button');
            logoutButton.textContent = 'Đăng xuất';
            logoutButton.onclick = () => {
                localStorage.removeItem('jwtToken');
                localStorage.removeItem('userName');
                localStorage.removeItem('userRole'); // Xóa vai trò khi đăng xuất
                displayMessage('Đã đăng xuất thành công!', 'success');
                setTimeout(() => {
                    window.location.href = 'index.html'; // Chuyển hướng về trang chủ hoặc trang đăng nhập
                }, 1000);
            };
            userAuthSection.appendChild(logoutButton);
        } else {
            // Người dùng chưa đăng nhập
            const loginButton = document.createElement('button');
            loginButton.textContent = 'Đăng nhập';
            loginButton.onclick = () => { location.href = 'login.html'; };

            const registerButton = document.createElement('button');
            registerButton.textContent = 'Đăng ký';
            registerButton.onclick = () => { location.href = 'register.html'; };

            userAuthSection.appendChild(loginButton);
            userAuthSection.appendChild(registerButton);
        }
    }

    // --- Chức năng trang chủ (index.html) ---
    /**
     * Tải và hiển thị phim "Đang chiếu" và "Sắp chiếu" trên trang chủ.
     */
    async function loadHomePageContent() {
        console.log('Đang tìm phim Đang chiếu...');
        try {
            await fetchAndDisplayMovies('nowShowingMovies', getNowShowingMovies);
        } catch (error) {
            console.error('Lỗi khi tải nội dung trang chủ (Đang chiếu):', error);
            displayMessage('Không thể tải phim đang chiếu. Vui lòng thử lại.', 'error');
        }

        console.log('Đang tìm phim Sắp chiếu...');
        try {
            await fetchAndDisplayMovies('comingSoonMovies', getComingSoonMovies);
        } catch (error) {
            console.error('Lỗi khi tải nội dung trang chủ (Sắp chiếu):', error);
            displayMessage('Không thể tải phim sắp chiếu. Vui lòng thử lại.', 'error');
        }
    }

    /**
     * Lấy phim bằng cách gọi API và hiển thị chúng trong vùng chứa được chỉ định.
     * @param {string} elementId - ID của phần tử HTML để hiển thị phim.
     * @param {function} apiCall - Hàm API để gọi (ví dụ: getNowShowingMovies).
     */
    async function fetchAndDisplayMovies(elementId, apiCall) {
        const container = document.getElementById(elementId);
        container.innerHTML = '<p class="text-center">Đang tải phim...</p>'; // Hiển thị thông báo tải
        try {
            const movies = await apiCall();
            console.log(`Cuộc gọi API cho ${elementId} đã trả về:`, movies); // Ghi lại phản hồi API
            if (movies && movies.length > 0) {
                container.innerHTML = ''; // Xóa thông báo tải
                movies.forEach(movie => {
                    const movieCard = createMovieCard(movie);
                    container.appendChild(movieCard);
                });
            } else {
                container.innerHTML = '<p class="text-center">Không có phim nào để hiển thị.</p>';
            }
        } catch (error) {
            // Xử lý lỗi hiện được thực hiện bởi hàm gọi (loadHomePageContent)
            throw error; // Ném lại lỗi để hàm gọi xử lý
        }
    }

    /**
     * Tạo phần tử thẻ phim HTML cho một đối tượng phim nhất định.
     * @param {object} movie - Đối tượng phim từ API.
     * @returns {HTMLElement} - Phần tử thẻ phim đã tạo.
     */
    function createMovieCard(movie) {
        const card = document.createElement('div');
        card.className = 'movie-card';

        // Tạo nút "Xem chi tiết & Đặt vé" có điều kiện
        let detailButtonHtml = '';
        if (movie.status === 'now_showing') { // Chỉ hiển thị nút nếu phim đang chiếu
            detailButtonHtml = `<a href="movie-detail.html?id=${movie.id}" class="btn-detail">Xem chi tiết & Đặt vé</a>`;
        }

        card.innerHTML = `
            <div class="movie-card-poster">
                <img src="${movie.poster_url || 'https://via.placeholder.com/250x380?text=No+Poster'}" alt="${movie.title}">
            </div>
            <div class="movie-card-info">
                <h3>${movie.title}</h3>
                <p>Thể loại: ${movie.genre || 'Đang cập nhật'}</p>
                <p>Thời lượng: ${movie.duration ? movie.duration + ' phút' : 'Đang cập nhật'}</p>
                ${detailButtonHtml}
            </div>
        `;
        return card;
    }

    // --- Chức năng trang chi tiết phim (movie-detail.html) ---
    /**
     * Tải và hiển thị chi tiết phim và các suất chiếu có sẵn cho một phim cụ thể.
     */
    async function loadMovieDetailPage() {
        const urlParams = new URLSearchParams(window.location.search);
        const movieId = urlParams.get('id');

        if (!movieId) {
            document.getElementById('movieDetailContainer').innerHTML = '<p class="text-center">Không tìm thấy ID phim.</p>';
            displayMessage('Không tìm thấy ID phim.', 'error');
            return;
        }

        const movieDetailContainer = document.getElementById('movieDetailContainer');
        const showtimeGrid = document.getElementById('showtimeGrid');
        const btnBookTickets = document.getElementById('btnBookTickets');

        let selectedShowtimeId = null;

        try {
            const movie = await getMovieById(movieId);
            console.log('API chi tiết phim đã trả về:', movie);
            if (movie) {
                document.getElementById('movieDetailPageTitle').textContent = movie.title + ' - Galaxy Cine';
                movieDetailContainer.innerHTML = `
                    <div class="movie-detail-poster">
                        <img src="${movie.poster_url || 'https://via.placeholder.com/400x600?text=No+Poster'}" alt="${movie.title}">
                    </div>
                    <div class="movie-detail-info">
                        <h1>${movie.title}</h1>
                        <p><strong>Đạo diễn:</strong> ${movie.director || 'Đang cập nhật'}</p>
                        <p><strong>Diễn viên:</strong> ${movie.cast || 'Đang cập nhật'}</p>
                        <p><strong>Thể loại:</strong> <span class="tags">${movie.genres ? movie.genres.map(g => `<span>${g}</span>`).join('') : 'Đang cập nhật'}</span></p>
                        <p><strong>Thời lượng:</strong> ${movie.duration_minutes ? movie.duration_minutes + ' phút' : 'Đang cập nhật'}</p>
                        <p><strong>Ngày phát hành:</strong> ${movie.release_date ? new Date(movie.release_date).toLocaleDateString('vi-VN') : 'Đang cập nhật'}</p>
                        <p><strong>IMDb:</strong> ${movie.imdb_rating || 'N/A'}</p>
                        <h3>Mô tả:</h3>
                        <p>${movie.description || 'Đang cập nhật mô tả.'}</p>
                    </div>
                `;

                // Tải các suất chiếu cho phim
                const showtimes = await getShowtimesByMovieId(movieId);
                console.log('API suất chiếu đã trả về:', showtimes);
                if (showtimes && showtimes.length > 0) {
                    showtimeGrid.innerHTML = ''; // Xóa thông báo mặc định
                    showtimes.forEach(showtime => {
                        const showtimeCard = document.createElement('div');
                        showtimeCard.className = 'showtime-card';
                        // Sử dụng showtime_id và date_time từ JSON của bạn
                        showtimeCard.dataset.showtimeId = showtime.showtime_id;

                        // date_time đã ở định dạng ISO 8601, không cần .replace()
                        const parsedDateTime = showtime.date_time ? new Date(showtime.date_time) : null;

                        // Kiểm tra nếu parsedDateTime hợp lệ trước khi sử dụng
                        if (parsedDateTime && !isNaN(parsedDateTime)) {
                            showtimeCard.dataset.showtimeDate = parsedDateTime.toLocaleDateString('vi-VN');
                            showtimeCard.dataset.showtimeTime = parsedDateTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

                            showtimeCard.innerHTML = `
                                <strong>${parsedDateTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</strong>
                                <span>${parsedDateTime.toLocaleDateString('vi-VN')}<br>${showtime.theater_name || 'Rạp'} - ${showtime.theater_name || 'Phòng'}</span>
                            `;
                        } else {
                            // Xử lý trường hợp ngày không hợp lệ
                            console.error('Ngày giờ không hợp lệ nhận được cho suất chiếu:', showtime.date_time);
                            showtimeCard.dataset.showtimeDate = 'Invalid Date';
                            showtimeCard.dataset.showtimeTime = 'Invalid Time';
                            showtimeCard.innerHTML = `
                                <strong>Không xác định</strong>
                                <span>Lỗi ngày/giờ<br>${showtime.theater_name || 'Rạp'} - ${showtime.theater_name || 'Phòng'}</span>
                            `;
                        }

                        showtimeCard.dataset.cinemaName = showtime.theater_name || 'Rạp A'; // Sử dụng theater_name
                        showtimeCard.dataset.roomName = showtime.theater_name || 'Phòng 1'; // Giả định theater_name cũng có thể là tên phòng nếu không có room_name riêng

                        showtimeCard.addEventListener('click', () => {
                            // Xóa lớp 'selected' khỏi tất cả các thẻ suất chiếu khác
                            document.querySelectorAll('.showtime-card').forEach(card => card.classList.remove('selected'));
                            // Thêm lớp 'selected' vào thẻ được nhấp
                            showtimeCard.classList.add('selected');
                            selectedShowtimeId = showtime.showtime_id; // Sử dụng showtime_id
                            btnBookTickets.disabled = false;

                            // Lưu chi tiết suất chiếu đã chọn vào session storage cho trang đặt vé
                            sessionStorage.setItem('selectedShowtimeDetails', JSON.stringify({
                                id: showtime.showtime_id, // Sử dụng showtime_id
                                movieId: movieId,
                                movieTitle: movie.title,
                                cinemaName: showtime.theater_name || 'Rạp A', // Sử dụng theater_name
                                roomName: showtime.theater_name || 'Phòng 1', // Giả định theater_name cũng có thể là tên phòng
                                startTime: showtime.date_time, // Lưu chuỗi gốc
                                posterUrl: movie.poster_url
                            }));
                        });
                        showtimeGrid.appendChild(showtimeCard);
                    });
                } else {
                    showtimeGrid.innerHTML = '<p class="text-center">Không có suất chiếu nào cho phim này.</p>';
                }

            } else {
                movieDetailContainer.innerHTML = '<p class="text-center">Không tìm thấy thông tin phim.</p>';
            }
        } catch (error) {
            displayMessage(`Lỗi khi tải chi tiết phim hoặc suất chiếu: ${error.message}`, 'error');
            console.error('Lỗi khi tải chi tiết phim hoặc suất chiếu:', error);
            movieDetailContainer.innerHTML = '<p class="text-center">Lỗi khi tải chi tiết phim.</p>';
            showtimeGrid.innerHTML = '<p class="text-center">Lỗi khi tải suất chiếu.</p>';
        }

        // Trình lắng nghe sự kiện cho nút "Đặt vé"
        btnBookTickets.addEventListener('click', () => {
            if (selectedShowtimeId) {
                const token = localStorage.getItem('jwtToken');
                if (!token) {
                    displayMessage('Vui lòng đăng nhập để đặt vé.', 'info');
                    setTimeout(() => {
                        window.location.href = 'login.html';
                    }, 1500);
                } else {
                    window.location.href = `booking.html?showtimeId=${selectedShowtimeId}`;
                }
            } else {
                displayMessage('Vui lòng chọn một suất chiếu.', 'info');
            }
        });
    }

    // --- Chức năng trang đặt vé (booking.html) ---
    /**
     * Tải và xử lý việc chọn ghế và xác nhận đặt vé.
     */
    async function loadBookingPage() {
        const urlParams = new URLSearchParams(window.location.search);
        const showtimeId = urlParams.get('showtimeId');
        const token = localStorage.getItem('jwtToken');

        if (!showtimeId || !token) {
            displayMessage('Thông tin suất chiếu không hợp lệ hoặc bạn chưa đăng nhập.', 'error');
            setTimeout(() => { window.location.href = 'index.html'; }, 2000);
            return;
        }

        const selectedShowtimeDetails = JSON.parse(sessionStorage.getItem('selectedShowtimeDetails'));
        // Xác thực nếu chi tiết session storage khớp với showtimeId hiện tại
        if (!selectedShowtimeDetails || selectedShowtimeDetails.id != showtimeId) {
             displayMessage('Không tìm thấy thông tin suất chiếu đã chọn. Vui lòng chọn lại.', 'error');
             setTimeout(() => {
                 // Chuyển hướng về trang chi tiết phim nếu ID phim gốc có sẵn
                 window.location.href = selectedShowtimeDetails ? `movie-detail.html?id=${selectedShowtimeDetails.movieId}` : 'index.html';
             }, 2000);
             return;
        }

        // Hiển thị chi tiết tóm tắt đặt vé
        document.getElementById('bookingMovieTitle').textContent = selectedShowtimeDetails.movieTitle;
        document.getElementById('bookingCinemaName').textContent = selectedShowtimeDetails.cinemaName;
        document.getElementById('bookingRoomName').textContent = selectedShowtimeDetails.roomName;
        // Sử dụng startTime (là date_time từ backend) từ session storage
        const bookingStartTime = selectedShowtimeDetails.startTime ? new Date(selectedShowtimeDetails.startTime) : null;
        if (bookingStartTime && !isNaN(bookingStartTime)) {
            document.getElementById('bookingShowtimeTime').textContent = bookingStartTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
            document.getElementById('bookingShowtimeDate').textContent = bookingStartTime.toLocaleDateString('vi-VN');
        } else {
            document.getElementById('bookingShowtimeTime').textContent = 'Invalid Time';
            document.getElementById('bookingShowtimeDate').textContent = 'Invalid Date';
        }

        const seatMapContainer = document.getElementById('seatMap');
        const selectedSeatsInfo = document.getElementById('selectedSeatsInfo');
        const totalAmountElement = document.getElementById('totalAmount');
        const btnConfirmBooking = document.getElementById('btnConfirmBooking');
        // const countdownElement = document.getElementById('countdownTimer'); // Đã loại bỏ đồng hồ đếm ngược trên trang booking

        let selectedSeats = [];
        let currentTicketPricePerSeat = 0; // Khởi tạo giá động

        function updateBookingSummary() {
            if (selectedSeats.length > 0 && currentTicketPricePerSeat > 0) {
                selectedSeatsInfo.textContent = selectedSeats.map(seat => seat.label).join(', ');
                totalAmountElement.textContent = `${(selectedSeats.length * currentTicketPricePerSeat).toLocaleString('vi-VN')} VND`;
                btnConfirmBooking.disabled = false;
            } else {
                selectedSeatsInfo.textContent = 'Chưa chọn ghế nào';
                totalAmountElement.textContent = '0 VND';
                btnConfirmBooking.disabled = true;
            }
        }

        try {
            const seatData = await getSeatsForShowtime(showtimeId, token);
            console.log('API dữ liệu ghế đã trả về:', seatData);

       
            if (seatData && seatData.seat_layout && seatData.num_rows && seatData.seats_per_row) {
                seatMapContainer.innerHTML = ''; // Xóa thông báo tải

                const { num_rows, seats_per_row, seat_layout, base_price } = seatData; // Trích xuất base_price
                currentTicketPricePerSeat = parseFloat(base_price); // Đặt giá động
                console.log('Giá cơ bản cho vé:', currentTicketPricePerSeat);


                // Đặt cột lưới dựa trên bố cục phòng
                seatMapContainer.style.gridTemplateColumns = `repeat(${seats_per_row}, 1fr)`;

                // Tạo một bản đồ để tra cứu nhanh trạng thái ghế bằng chuỗi hàng-cột
                const seatStatusMap = new Map();
                // Lặp qua seat_layout để xây dựng bản đồ
                seat_layout.forEach(rowObj => {
                    const rowChar = rowObj.row_label;
                    rowObj.seats.forEach((seat, colIndex) => {
                        // Đã sửa: Sử dụng seat.seat_number cho colNum, và ánh xạ is_available sang chuỗi trạng thái
                        const colNum = seat.seat_number; // Sử dụng seat_number trực tiếp cho cột
                        const seatKey = `${rowChar}-${colNum}`;
                        seatStatusMap.set(seatKey, {
                            id: seat.seat_id, // Đã sửa: Sử dụng seat.seat_id
                            status: seat.is_available ? 'available' : 'booked' // Đã sửa: Ánh xạ is_available sang chuỗi 'available'/'booked'
                        });
                    });
                });

                // Hiển thị ghế dựa trên bố cục phòng (num_rows và seats_per_row)
                for (let r = 0; r < num_rows; r++) {
                    for (let c = 0; c < seats_per_row; c++) {
                        const rowChar = String.fromCharCode(65 + r); // A, B, C...
                        const colNum = c + 1; // colNum này dùng để lặp qua lưới, không nhất thiết là seat_number
                        const seatLabel = `${rowChar}${colNum}`; // Nhãn này dùng để hiển thị

                        // Tìm dữ liệu ghế thực tế bằng cách sử dụng rowChar và colNum (seat_number)
                        const actualSeatData = seat_layout.find(row => row.row_label === rowChar)?.seats.find(s => s.seat_number === colNum);

                        const seatDiv = document.createElement('div');
                        seatDiv.className = 'seat';
                        seatDiv.textContent = colNum; // Hiển thị số cột
                        seatDiv.dataset.row = rowChar;
                        seatDiv.dataset.col = colNum;
                        seatDiv.dataset.label = seatLabel;

                        if (actualSeatData) {
                            const currentSeatStatus = actualSeatData.is_available ? 'available' : 'booked';

                            if (currentSeatStatus === 'booked') {
                                seatDiv.classList.add('unavailable');
                                seatDiv.title = 'Ghế đã được đặt';
                            } else {
                                seatDiv.classList.add('available');
                                // QUAN TRỌNG: Đảm bảo actualSeatData.seat_id là một số hợp lệ cho dataset.seatId
                                seatDiv.dataset.seatId = actualSeatData.seat_id; // Lưu seat_id thực tế từ backend

                                seatDiv.addEventListener('click', () => {
                                    if (seatDiv.classList.contains('unavailable')) {
                                        return; // Không làm gì nếu ghế không có sẵn
                                    }
                                    seatDiv.classList.toggle('selected');
                                    if (seatDiv.classList.contains('selected')) {
                                        selectedSeats.push({
                                            id: seatDiv.dataset.seatId,
                                            label: seatLabel
                                        });
                                    } else {
                                        selectedSeats = selectedSeats.filter(seat => seat.id !== seatDiv.dataset.seatId);
                                    }
                                    updateBookingSummary();
                                });
                            }
                        } else {
                            seatDiv.classList.add('unavailable'); // Coi là không có sẵn nếu không có dữ liệu
                            seatDiv.title = 'Không có dữ liệu ghế';
                            seatDiv.textContent = 'X'; // Đánh dấu ghế bị thiếu
                            console.warn(`Không tìm thấy dữ liệu ghế cho ${seatLabel}.`);
                        }
                        seatMapContainer.appendChild(seatDiv);
                    }
                }
            } else {
                // Thông báo lỗi cụ thể hơn cho console để giúp gỡ lỗi backend
                console.error('Cấu trúc dữ liệu ghế không như mong đợi:', seatData);
                seatMapContainer.innerHTML = '<p class="text-center">Không thể tải sơ đồ ghế. Cấu trúc dữ liệu không hợp lệ.</p>';
                displayMessage('Không thể tải sơ đồ ghế cho suất chiếu này. Vui lòng kiểm tra dữ liệu từ backend.', 'error');
            }
        } catch (error) {
            displayMessage(`Lỗi khi tải sơ đồ ghế: ${error.message}`, 'error');
            console.error('Lỗi khi tìm nạp ghế:', error);
            seatMapContainer.innerHTML = '<p class="text-center">Lỗi khi tải sơ đồ ghế.</p>';
        }

        // Trình lắng nghe sự kiện cho nút "Xác nhận đặt vé"
        btnConfirmBooking.addEventListener('click', async () => {
            if (selectedSeats.length === 0) {
                displayMessage('Vui lòng chọn ít nhất một ghế.', 'info');
                return;
            }

            const confirmBooking = window.confirm('Bạn có chắc chắn muốn đặt các ghế đã chọn?');
            if (!confirmBooking) {
                return;
            }

            // Xác định phương thức thanh toán để tạo đặt vé
            const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value || 'credit_card'; // Mặc định là credit_card nếu không có gì được chọn

            const bookingData = {
                showtimeId: parseInt(showtimeId),
                seatIds: selectedSeats.map(s => parseInt(s.id)),
                totalAmount: selectedSeats.length * currentTicketPricePerSeat,
                paymentMethod: paymentMethod 
            };

            try {
                displayMessage('Đang xử lý đặt vé...', 'info', 0); // Thông báo không giới hạn thời gian
                const newBooking = await createBooking(bookingData, token);
                console.log('API tạo đặt vé đã trả về:', newBooking);
                if (newBooking && newBooking.booking_id) { // Giả định backend trả về booking_id
                    displayMessage('Đặt vé thành công! Đang chuyển hướng...', 'success');
                    // Lưu chi tiết đặt vé cho trang thanh toán
                    sessionStorage.setItem('currentBookingDetails', JSON.stringify({
                        bookingId: newBooking.booking_id,
                        totalAmount: bookingData.totalAmount,
                        movieTitle: selectedShowtimeDetails.movieTitle,
                        cinemaName: selectedShowtimeDetails.cinemaName,
                        showtimeTime: selectedShowtimeDetails.startTime, // Lưu chuỗi gốc
                        selectedSeatsLabels: selectedSeats.map(s => s.label).join(', '),
                        paymentMethod: paymentMethod, 
                        bookingTime: newBooking.booking_time 
                    }));
                    sessionStorage.removeItem('selectedShowtimeDetails'); // Xóa chi tiết suất chiếu

                    // KHÔNG CÓ LOGIC DỪNG ĐỒNG HỒ ĐẾM NGƯỢC TRÊN TRANG BOOKING NỮA
                    // clearInterval(countdownInterval); 

                    // Nếu phương thức thanh toán là 'at_counter', chuyển hướng trực tiếp đến trang vé
                    if (paymentMethod === 'at_counter') {
                        setTimeout(() => {
                            window.location.href = 'tickets.html';
                        }, 1000);
                    } else {
                        // Ngược lại, tiếp tục đến trang thanh toán
                        setTimeout(() => {
                            window.location.href = `payment.html?bookingId=${newBooking.booking_id}`;
                        }, 1000);
                    }

                } else {
                    displayMessage(newBooking.message || 'Đặt vé thất bại. Vui lòng thử lại.', 'error');
                }
            } catch (error) {
                displayMessage(`Không thể đặt vé: ${error.message}`, 'error'); // Hiển thị lỗi từ backend
                console.error('Lỗi khi tạo đặt vé:', error);
            }
        });
    }

    // --- Chức năng trang thanh toán (payment.html) ---
    /**
     * Tải và xử lý quá trình thanh toán.
     */
    async function loadPaymentPage() {
        const urlParams = new URLSearchParams(window.location.search);
        const bookingId = urlParams.get('bookingId');
        const token = localStorage.getItem('jwtToken');

        if (!bookingId || !token) {
            displayMessage('Thông tin thanh toán không hợp lệ hoặc bạn chưa đăng nhập.', 'error');
            setTimeout(() => { window.location.href = 'index.html'; }, 2000);
            return;
        }

        const currentBookingDetails = JSON.parse(sessionStorage.getItem('currentBookingDetails'));
        if (!currentBookingDetails || currentBookingDetails.bookingId != bookingId) {
            displayMessage('Không tìm thấy thông tin đơn hàng. Vui lòng thử lại quá trình đặt vé.', 'error');
            setTimeout(() => { window.location.href = 'index.html'; }, 2000);
            return;
        }

        // Hiển thị tóm tắt đặt vé trên trang thanh toán
        document.getElementById('paymentMovieTitle').textContent = currentBookingDetails.movieTitle;
        document.getElementById('paymentCinemaName').textContent = currentBookingDetails.cinemaName;
        // Sử dụng showtimeTime (là date_time từ backend) từ session storage
        const paymentShowtimeTime = currentBookingDetails.showtimeTime ? new Date(currentBookingDetails.showtimeTime) : null;
        if (paymentShowtimeTime && !isNaN(paymentShowtimeTime)) {
            document.getElementById('paymentShowtimeTime').textContent = paymentShowtimeTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
        } else {
            document.getElementById('paymentShowtimeTime').textContent = 'Invalid Time';
        }
        document.getElementById('paymentSelectedSeats').textContent = currentBookingDetails.selectedSeatsLabels;
        document.getElementById('paymentTotalAmount').textContent = `${currentBookingDetails.totalAmount.toLocaleString('vi-VN')} VND`;

        const paymentForm = document.getElementById('paymentForm');
        const creditCardDetails = document.getElementById('creditCardDetails');
        const bankTransferDetails = document.getElementById('bankTransferDetails');
        const paymentMethodRadios = document.querySelectorAll('input[name="paymentMethod"]');

        // Thêm vùng chứa mã QR VietQR
        const vietQrContainer = document.createElement('div');
        vietQrContainer.id = 'vietQrContainer';
        vietQrContainer.className = 'hidden flex flex-col items-center justify-center p-4 bg-gray-100 rounded-lg shadow-inner mt-4';
        bankTransferDetails.appendChild(vietQrContainer); // Thêm vào bankTransferDetails

        // Chuyển đổi hiển thị chi tiết thanh toán dựa trên phương thức đã chọn
        paymentMethodRadios.forEach(radio => {
            radio.addEventListener('change', () => {
                if (radio.value === 'credit_card') {
                    creditCardDetails.classList.remove('hidden');
                    bankTransferDetails.classList.add('hidden');
                    vietQrContainer.classList.add('hidden'); // Ẩn QR VietQR
                } else if (radio.value === 'bank_transfer') {
                    creditCardDetails.classList.add('hidden');
                    bankTransferDetails.classList.remove('hidden');
                    vietQrContainer.classList.remove('hidden'); // Hiển thị QR VietQR
                    generateVietQrCode(currentBookingDetails, vietQrContainer); // Tạo QR
                }
            });
        });

        // Ban đầu kiểm tra phương thức thanh toán đã chọn khi tải (nếu có bất kỳ được chọn trước)
        const initialSelectedMethod = document.querySelector('input[name="paymentMethod"]:checked');
        if (initialSelectedMethod && initialSelectedMethod.value === 'bank_transfer') {
            bankTransferDetails.classList.remove('hidden');
            vietQrContainer.classList.remove('hidden');
            generateVietQrCode(currentBookingDetails, vietQrContainer);
        } else if (initialSelectedMethod && initialSelectedMethod.value === 'credit_card') {
            creditCardDetails.classList.remove('hidden');
            bankTransferDetails.classList.add('hidden');
            vietQrContainer.classList.add('hidden');
        }


        paymentForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const selectedMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
            let paymentData = {
                bookingId: parseInt(bookingId),
                paymentMethod: selectedMethod,
                amount: currentBookingDetails.totalAmount
            };

            // Đối với thẻ tín dụng, thu thập chi tiết thẻ và xác thực
            if (selectedMethod === 'credit_card') {
                const cardNumber = document.getElementById('cardNumber').value.replace(/\s/g, ''); // Xóa khoảng trắng
                const expiryDate = document.getElementById('expiryDate').value;
                const cvv = document.getElementById('cvv').value;

                // Xác thực cơ bản cho chi tiết thẻ tín dụng
                if (!/^\d{16}$/.test(cardNumber)) {
                    displayMessage('Số thẻ không hợp lệ (phải có 16 chữ số).', 'error');
                    return;
                }
                if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiryDate)) {
                    displayMessage('Ngày hết hạn không hợp lệ (MM/YY).', 'error');
                    return;
                }
                // Kiểm tra nếu ngày hết hạn ở tương lai
                const [expMonth, expYear] = expiryDate.split('/').map(Number);
                const currentYear = new Date().getFullYear() % 100; // Hai chữ số cuối
                const currentMonth = new Date().getMonth() + 1; // Tháng là 0-indexed

                if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
                    displayMessage('Ngày hết hạn đã qua.', 'error');
                    return;
                }

                if (!/^\d{3,4}$/.test(cvv)) {
                    displayMessage('Mã CVV không hợp lệ (3 hoặc 4 chữ số).', 'error');
                    return;
                }
            }

            try {
                displayMessage('Đang xử lý thanh toán...', 'info', 0); 
                const paymentResult = await processPayment(paymentData, token);
                console.log('API thanh toán đã trả về:', paymentResult);

                if (paymentResult.paymentStatus === 'completed') {
                    displayMessage('Thanh toán thành công, đưa mã QR bên phải cho nhân viên để xác nhận', 'completed');
                    sessionStorage.removeItem('currentBookingDetails'); 
                    setTimeout(() => {
                        window.location.href = 'tickets.html';
                    }, 3000);
                } else {
                    displayMessage(paymentResult.message || 'Thanh toán thất bại. Vui lòng thử lại.', 'error');
                }
            } catch (error) {
                displayMessage(`Lỗi khi xử lý thanh toán: ${error.message}`, 'error');
                console.error('Lỗi thanh toán:', error);
            }
        });
    }

    /**
     * Tạo và hiển thị mã QR VietQR.
     * @param {object} bookingDetails - Chi tiết đặt vé hiện tại từ session storage.
     * @param {HTMLElement} container - Phần tử HTML để thêm mã QR vào.
     */
    function generateVietQrCode(bookingDetails, container) {
        const bankAccountNumber = 'VCB-NGUYENHAIDANG2004'; // Mã tài khoản/ngân hàng như trong URL của bạn
        const bankName = 'Vietcombank'; // Tên ngân hàng
        const accountName = 'NGUYỄN HẢI ĐĂNG'; // Tên người nhận
        const amount = bookingDetails.totalAmount;

        // Định dạng nội dung cho ghi chú QR code
        const showtimeDate = bookingDetails.showtimeTime ? new Date(bookingDetails.showtimeTime) : null;
        let formattedTime = 'Khong ro gio';
        let formattedDate = 'Khong ro ngay';

        if (showtimeDate && !isNaN(showtimeDate)) {
            formattedTime = showtimeDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }).replace(':', 'h'); // ví dụ: "14h30"
            formattedDate = showtimeDate.toLocaleDateString('vi-VN').replace(/\//g, '-'); // ví dụ: "24-05-2025"
        }

        const cinemaName = bookingDetails.cinemaName || 'Rap';
        const seatsBooked = bookingDetails.selectedSeatsLabels || 'Ghe';

        // Nội dung cho ghi chú VietQR: "Thời gian-Rạp chiếu-Số ghế"
        const noteContent = `${formattedTime}-${cinemaName}-${seatsBooked}`;
        const encodedNote = encodeURIComponent(noteContent);
        const encodedAccountName = encodeURIComponent(accountName); // Mã hóa tên người nhận

        // URL API VietQR
        const vietQrUrl = `https://img.vietqr.io/image/VCB-NGUYENHAIDANG2004-compact2.jpg?amount=${amount}&addInfo=${encodedNote}&accountName=${encodedAccountName}`;

        container.innerHTML = `
            <h4 class="text-xl font-semibold mb-3 text-gray-800">Quét mã QR để chuyển khoản qua ngân hàng</h4>
            <img src="${vietQrUrl}" alt="VietQR Code" class="w-48 h-48 rounded-lg shadow-md mb-4">
            <p class="text-gray-700 text-center">
                <strong>Ngân hàng:</strong> <span class="font-medium text-blue-600">${bankName}</span><br>
                <strong>Số tài khoản:</strong> <span class="font-medium text-blue-600">${bankAccountNumber}</span><br>
                <strong>Tên tài khoản:</strong> <span class="font-medium text-blue-600">${accountName}</span><br>
                <strong>Số tiền:</strong> <span class="font-medium text-green-600">${amount.toLocaleString('vi-VN')} VND</span><br>
                <strong>Nội dung chuyển khoản:</strong> <span class="font-medium text-purple-600">${noteContent}</span>
            </p>
            <p class="text-sm text-gray-500 mt-2 text-center">Vui lòng kiểm tra kỹ thông tin trước khi chuyển khoản.</p>
        `;
    }

    /**
     * Tạo thẻ img HTML cho mã QR chung.
     * @param {string} data - Chuỗi dữ liệu để mã hóa trong mã QR.
     * @param {number} size - Kích thước của hình ảnh mã QR (chiều rộng và chiều cao).
     * @returns {string} Thẻ <img> HTML cho mã QR.
     */
    function generateGenericQrCodeHtml(data, size = 100) {
        return `<img src="https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(data)}" alt="Mã QR" class="w-${size/4} h-${size/4} rounded-lg shadow-sm">`;
    }


    // --- Chức năng trang vé của người dùng (tickets.html) ---
    /**
     * Tải và hiển thị các vé đã đặt của người dùng.
     */
// main.js

// ... (các import và các hàm khác của bạn, bao gồm displayMessage và createMessageArea) ...

async function loadUserTicketsPage() {
    const token = localStorage.getItem('jwtToken');
    const ticketsListContainer = document.getElementById('userTicketsList');
    const noTicketsMessage = document.getElementById('noTicketsMessage');

    // Khởi tạo mảng activeTimers nếu chưa tồn tại
    if (!window.activeTimers) {
        window.activeTimers = [];
    }

    // Clear tất cả timers cũ trước khi tải lại
    window.activeTimers.forEach(timerId => clearInterval(timerId));
    window.activeTimers = [];

    // Hàm trợ giúp để kiểm tra Date object hợp lệ
    const isValidDate = (date) => date instanceof Date && !isNaN(date);

    // **KIỂM TRA NULL NGAY LẬP TỨC CHO CÁC PHẦN TỬ DOM QUAN TRỌNG**
    if (!ticketsListContainer) {
        console.error("Lỗi: Không tìm thấy phần tử 'userTicketsList'. Đảm bảo tickets.html có id này.");
        displayMessage('Lỗi tải trang: Không tìm thấy vùng hiển thị vé.', 'error');
        return;
    }

    if (!token) {
        displayMessage('Bạn cần đăng nhập để xem vé của mình.', 'info');
        ticketsListContainer.innerHTML = '<p class="text-center">Vui lòng <a href="login.html">đăng nhập</a> để xem vé đã đặt.</p>';
        if (noTicketsMessage) {
            noTicketsMessage.style.display = 'none';
        }
        return;
    }

    try {
        if (noTicketsMessage) {
            noTicketsMessage.style.display = 'none';
        }
        ticketsListContainer.innerHTML = '<p class="text-center">Đang tải vé của bạn...</p>';

        const tickets = await getUserTickets(token);
        console.log('API vé người dùng đã trả về:', tickets);

        if (tickets && tickets.length > 0) {
            ticketsListContainer.innerHTML = '';
            
            tickets.forEach(ticket => {
                console.log('Đang xử lý vé:', ticket);
                // Sử dụng booking_date thay vì booking_time
                console.log('Giá trị booking_date từ API:', ticket.booking_date); 
                const bookingTime = ticket.booking_date ? new Date(ticket.booking_date) : null;
                
                // Kiểm tra ticketShowtimeTime cũng bằng isValidDate
                const ticketShowtimeTime = ticket.showtime_date_time ? new Date(ticket.showtime_date_time) : null;


                // Kiểm tra nếu bookingTime không hợp lệ
                if (!isValidDate(bookingTime)) {
                    console.error('Lỗi: booking_date không hợp lệ cho vé:', ticket.booking_id, ticket.booking_date);
                    // Hiển thị một thông báo hoặc bỏ qua phần đếm ngược cho vé này
                    const ticketCard = document.createElement('div');
                    ticketCard.className = 'ticket-card';
                    ticketCard.innerHTML = `
                        <div class="ticket-card-poster">
                            <img src="${ticket.poster_url || 'https://via.placeholder.com/120x180?text=Movie+Poster'}" alt="${ticket.movie_title}">
                        </div>
                        <div class="ticket-info">
                            <h3>${ticket.movie_title || 'Đang cập nhật'}</h3>
                            <p><strong>Ngày chiếu:</strong> ${isValidDate(ticketShowtimeTime) ? ticketShowtimeTime.toLocaleDateString('vi-VN') : 'Đang cập nhật'}</p>
                            <p><strong>Giờ chiếu:</strong> ${isValidDate(ticketShowtimeTime) ? ticketShowtimeTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }).replace(':', 'h') : 'Đang cập nhật'}</p>
                            <p><strong>Rạp:</strong> ${ticket.theater_name || 'Đang cập nhật'}</p>
                            <p><strong>Phòng:</strong> ${ticket.theater_name || 'Đang cập nhật'}</p>
                            <p><strong>Ghế:</strong> ${ticket.seats_booked || 'Đang cập nhật'}</p>
                            <p><strong>Tổng tiền:</strong> ${ticket.total_amount ? parseFloat(ticket.total_amount).toLocaleString('vi-VN') + ' VND' : 'Đang cập nhật'}</p>
                            <p><strong>Trạng thái:</strong> <span style="color: ${ticket.booking_status === 'confirmed' ? 'var(--success-color)' : (ticket.booking_status === 'pending' ? 'var(--pending-color)' : 'var(--danger-color)')}">${ticket.booking_status === 'confirmed' ? 'Đã xác nhận' : (ticket.booking_status === 'pending' ? 'Đang chờ thanh toán' : 'Đã hủy')}</span></p>
                            <p class="text-red-500 italic mt-3">Lỗi: Thời gian đặt vé không hợp lệ.</p>
                            ${ticket.booking_status === 'pending' ? `
                                <div class="flex gap-3 mt-3">
                                    <button class="btn-pay-now bg-[#f17300] hover:bg-[#d86200] text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out"
                                    data-booking-id="${ticket.booking_id}"
                                    data-movie-title="${ticket.movie_title}"
                                    data-cinema-name="${ticket.theater_name}"
                                    data-showtime-time="${ticket.showtime_date_time}"
                                    data-seats-booked="${ticket.seats_booked}"
                                    data-total-amount="${ticket.total_amount}"
                                    data-poster-url="${ticket.poster_url}">
                                    Thanh toán ngay
                                    </button>
                                    <button class="btn-cancel-ticket bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out"
                                    data-booking-id="${ticket.booking_id}"
                                    data-movie-title="${ticket.movie_title}">
                                    Hủy vé
                                    </button>
                                </div>
                            ` : (ticket.booking_status === 'confirmed' ? `
                                <p class="text-green-600 font-semibold mt-3">Vé đã được xác nhận</p>
                            ` : `
                                <p class="text-red-500 italic mt-3">Vé đã bị hủy</p>
                            `)}
                        </div>
                        <div class="ticket-qr-code p-4 flex items-center justify-center">
                            ${ticket.booking_status === 'confirmed' ?
                                generateGenericQrCodeHtml('vé này được trả tiền rồi nha, legit legit', 150) : ''}
                            ${ticket.booking_status === 'pending' ?
                                generateGenericQrCodeHtml(qrContentForPendingTicket, 150) : ''}
                        </div>`;
                    ticketsListContainer.appendChild(ticketCard);
                    return; // Bỏ qua vé này khỏi logic đếm ngược
                }

                const now = new Date();
                const timeElapsed = now - bookingTime; // now và bookingTime đã được kiểm tra hợp lệ
                const countdownDuration = 3 * 60 * 1000; // 3 phút
                let timeLeft = countdownDuration - timeElapsed;

                // Nếu vé đã hết hạn và đang pending, hủy ngay
                if (timeLeft <= 0 && ticket.booking_status === 'pending') {
                    cancelBooking(ticket.booking_id, token)
                        .then(() => loadUserTicketsPage())
                        .catch(console.error);
                    return;
                }

                // Tạo phần tử đồng hồ đếm ngược
                const countdownElement = document.createElement('div');
                countdownElement.className = 'countdown-timer';
                countdownElement.style.cssText = `
                    size: 1rem;
                    color: #c62828;                  
                `;

                let countdownInterval = null;

                // Xử lý đếm ngược cho vé pending
                if (ticket.booking_status === 'pending' && timeLeft > 0) {
                    const updateCountdown = () => {
                        timeLeft -= 1000;

                        if (timeLeft <= 0) {
                            countdownElement.textContent = 'HẾT THỜI GIAN GIỮ VÉ - Đang hủy...';
                            countdownElement.style.background = '#ffcdd2';
                            
                            // Clear interval trước khi hủy
                            if (countdownInterval) {
                                clearInterval(countdownInterval);
                                window.activeTimers = window.activeTimers.filter(id => id !== countdownInterval);
                            }
                            
                            cancelBooking(ticket.booking_id, token)
                                .then(() => {
                                    displayMessage('Vé đã được hủy tự động do hết thời gian giữ chỗ', 'info');
                                    loadUserTicketsPage();
                                })
                                .catch(console.error);
                            return;
                        }

                        // Format phút:giây
                        const minutes = Math.floor(timeLeft / 60000);
                        const seconds = Math.floor((timeLeft % 60000) / 1000);
                        countdownElement.textContent = `Thời gian còn lại: ${minutes}:${seconds.toString().padStart(2, '0')}`;
                    };

                    // Bắt đầu đếm ngược
                    countdownInterval = setInterval(updateCountdown, 1000);
                    window.activeTimers.push(countdownInterval);
                    updateCountdown(); // Cập nhật ngay lập tức
                }

                // Tạo QR content cho vé pending
                let qrContentForPendingTicket = '';
                if (ticket.booking_status === 'pending') {
                    const movieTitle = ticket.movie_title || 'Phim';
                    let formattedTime = 'Không rõ giờ';
                    let formattedDate = 'Không rõ ngày';
                    if (isValidDate(ticketShowtimeTime)) {
                        formattedTime = ticketShowtimeTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }).replace(':', 'h');
                        formattedDate = ticketShowtimeTime.toLocaleDateString('vi-VN').replace(/\//g, '-');
                    }
                    const theaterName = ticket.theater_name || 'Rạp';
                    const seatsBooked = ticket.seats_booked || 'Ghế';
                    const totalAmount = ticket.total_amount ? parseFloat(ticket.total_amount).toLocaleString('vi-VN') : '0';

                    qrContentForPendingTicket = `${movieTitle}-${formattedTime}-${theaterName}-${seatsBooked}-${totalAmount}VND`;
                }

                // Tạo ticket card
                const ticketCard = document.createElement('div');
                ticketCard.className = 'ticket-card';
                ticketCard.innerHTML = `
                    <div class="ticket-card-poster">
                        <img src="${ticket.poster_url || 'https://via.placeholder.com/120x180?text=Movie+Poster'}" alt="${ticket.movie_title}">
                    </div>
                    <div class="ticket-info">
                        <h3>${ticket.movie_title || 'Đang cập nhật'}</h3>
                        <p><strong>Ngày chiếu:</strong> ${isValidDate(ticketShowtimeTime) ? ticketShowtimeTime.toLocaleDateString('vi-VN') : 'Đang cập nhật'}</p>
                        <p><strong>Giờ chiếu:</strong> ${isValidDate(ticketShowtimeTime) ? ticketShowtimeTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }).replace(':', 'h') : 'Đang cập nhật'}</p>
                        <p><strong>Rạp:</strong> ${ticket.theater_name || 'Đang cập nhật'}</p>
                        <p><strong>Phòng:</strong> ${ticket.theater_name || 'Đang cập nhật'}</p>
                        <p><strong>Ghế:</strong> ${ticket.seats_booked || 'Đang cập nhật'}</p>
                        <p><strong>Tổng tiền:</strong> ${ticket.total_amount ? parseFloat(ticket.total_amount).toLocaleString('vi-VN') + ' VND' : 'Đang cập nhật'}</p>
                        <p><strong>Trạng thái:</strong> <span style="color: ${ticket.booking_status === 'confirmed' ? 'var(--success-color)' : (ticket.booking_status === 'pending' ? 'var(--pending-color)' : 'var(--danger-color)')}">${ticket.booking_status === 'confirmed' ? 'Đã xác nhận' : (ticket.booking_status === 'pending' ? 'Đang chờ thanh toán' : 'Đã hủy')}</span></p>
                        ${ticket.booking_status === 'pending' ? `
                            <div class="flex gap-3 mt-3">
                                <button class="btn-pay-now bg-[#f17300] hover:bg-[#d86200] text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out"
                                data-booking-id="${ticket.booking_id}"
                                data-movie-title="${ticket.movie_title}"
                                data-cinema-name="${ticket.theater_name}"
                                data-showtime-time="${ticket.showtime_date_time}"
                                data-seats-booked="${ticket.seats_booked}"
                                data-total-amount="${ticket.total_amount}"
                                data-poster-url="${ticket.poster_url}">
                                Thanh toán ngay
                                </button>
                                <button class="btn-cancel-ticket bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out"
                                data-booking-id="${ticket.booking_id}"
                                data-movie-title="${ticket.movie_title}">
                                Hủy vé
                                </button>
                            </div>
                        ` : (ticket.booking_status === 'confirmed' ? `
                            <p class="text-green-600 font-semibold mt-3">Vé đã được xác nhận</p>
                        ` : `
                            <p class="text-red-500 italic mt-3">Vé đã bị hủy</p>
                        `)}
                    </div>
                    <div class="ticket-qr-code p-4 flex items-center justify-center">
                        ${ticket.booking_status === 'confirmed' ?
                            generateGenericQrCodeHtml('vé này được trả tiền rồi nha, legit legit', 150) : ''}
                        ${ticket.booking_status === 'pending' ?
                            generateGenericQrCodeHtml(qrContentForPendingTicket, 150) : ''}
                    </div>`;

                // Thêm countdown element vào ticket info nếu là vé pending
                if (ticket.booking_status === 'pending') {
                    const ticketInfo = ticketCard.querySelector('.ticket-info');
                    if (ticketInfo) {
                        ticketInfo.appendChild(countdownElement);
                    }
                }

                // Lưu interval ID để có thể clear sau này
                if (countdownInterval) {
                    ticketCard.dataset.intervalId = countdownInterval;
                }

                ticketsListContainer.appendChild(ticketCard);
            });

            // Event listeners cho nút "Thanh toán ngay"
            document.querySelectorAll('.btn-pay-now').forEach(button => {
                button.addEventListener('click', (e) => {
                    const btn = e.target;
                    const bookingId = btn.dataset.bookingId;
                    const movieTitle = btn.dataset.movieTitle;
                    const cinemaName = btn.dataset.cinemaName;
                    const showtimeTime = btn.dataset.showtimeTime;
                    const seatsBooked = btn.dataset.seatsBooked;
                    const totalAmount = btn.dataset.totalAmount;
                    const posterUrl = btn.dataset.posterUrl;

                    sessionStorage.setItem('currentBookingDetails', JSON.stringify({
                        bookingId: parseInt(bookingId),
                        totalAmount: parseFloat(totalAmount),
                        movieTitle: movieTitle,
                        cinemaName: cinemaName,
                        showtimeTime: showtimeTime,
                        selectedSeatsLabels: seatsBooked,
                        posterUrl: posterUrl
                    }));

                    window.location.href = `payment.html?bookingId=${bookingId}`;
                });
            });

            // Event listeners cho nút "Hủy vé"
            document.querySelectorAll('.btn-cancel-ticket').forEach(button => {
                button.addEventListener('click', async (e) => {
                    const btn = e.target;
                    const bookingId = btn.dataset.bookingId;
                    const movieTitle = btn.dataset.movieTitle;
                    const ticketCard = btn.closest('.ticket-card');
                    const intervalId = ticketCard?.dataset.intervalId;

                    const confirmCancel = confirm(`Bạn có chắc chắn muốn hủy vé cho phim "${movieTitle}"?\n\nHành động này không thể hoàn tác.`);

                    if (!confirmCancel) {
                        return;
                    }

                    // Clear countdown timer nếu có
                    if (intervalId) {
                        clearInterval(parseInt(intervalId));
                        window.activeTimers = window.activeTimers.filter(id => id !== parseInt(intervalId));
                    }

                    try {
                        btn.disabled = true;
                        btn.textContent = 'Đang hủy...';
                        btn.style.opacity = '0.5';
                        btn.style.cursor = 'not-allowed';

                        const result = await cancelBooking(parseInt(bookingId), token);
                        console.log('Kết quả hủy vé:', result);

                        displayMessage('Hủy vé thành công!', 'success');

                        setTimeout(() => {
                            loadUserTicketsPage();
                        }, 1000);
                    } catch (error) {
                        console.error('Lỗi khi hủy vé:', error);
                        displayMessage(`Không thể hủy vé: ${error.message}`, 'error');

                        btn.disabled = false;
                        btn.textContent = 'Hủy vé';
                        btn.style.opacity = '1';
                        btn.style.cursor = 'pointer';
                    }
                });
            });

        } else {
            ticketsListContainer.innerHTML = '';
            if (noTicketsMessage) {
                noTicketsMessage.style.display = 'block';
            }
        }
    } catch (error) {
        displayMessage(`Không thể tải vé của bạn: ${error.message}`, 'error');
        console.error('Lỗi khi tìm nạp vé người dùng:', error);
        ticketsListContainer.innerHTML = '<p class="text-center">Lỗi khi tải vé.</p>';
        if (noTicketsMessage) {
            noTicketsMessage.style.display = 'none';
        }
    }
}

    // --- Chức năng biểu mẫu xác thực (login.html, register.html) ---
    /**
     * Thiết lập trình lắng nghe sự kiện cho việc gửi biểu mẫu đăng nhập.
     */
    function setupLoginForm() {
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const email = document.getElementById('email').value;
                const password = document.getElementById('password').value;

                try {
                    displayMessage('Đang đăng nhập...', 'info', 0); // Thông báo không giới hạn thời gian
                    const result = await loginUser({ email, password });
                    console.log('API đăng nhập đã trả về:', result);
                    // Ghi lại tên người dùng nhận được từ backend để gỡ lỗi
                    console.log('Tên người dùng nhận được từ backend (result.user.name):', result.user?.name); // Cập nhật log
                    if (result && result.token) {
                        // Cập nhật để lấy tên từ result.user.name
                        localStorage.setItem('jwtToken', result.token);
                        localStorage.setItem('userName', result.user?.name || 'Người dùng'); // Lưu tên người dùng
                        localStorage.setItem('userRole', result.user?.role || 'user'); // Lưu vai trò người dùng
                        displayMessage('Đăng nhập thành công! Đang chuyển hướng...', 'success');
                        setTimeout(() => {
                            window.location.href = 'index.html'; // Chuyển hướng về trang chủ
                        }, 1000);
                    } else {
                        // Backend có thể trả về một thông báo lỗi cụ thể trong result.message
                        displayMessage(result.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại email và mật khẩu.', 'error');
                    }
                } catch (error) {
                    displayMessage(`Lỗi đăng nhập: ${error.message}`, 'error');
                    console.error('Lỗi đăng nhập:', error);
                }
            });
        }
    }

    /**
     * Thiết lập trình lắng nghe sự kiện cho việc gửi biểu mẫu đăng ký.
     */
    function setupRegisterForm() {
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const name = document.getElementById('regName').value;
                const email = document.getElementById('regEmail').value;
                const password = document.getElementById('regPassword').value;
                const phone = document.getElementById('regPhone').value;

                try {
                    displayMessage('Đang đăng ký...', 'info', 0); // Thông báo không giới hạn thời gian
                    const result = await registerUser({ name, email, password, phone });
                    console.log('API đăng ký đã trả về:', result);
                    if (result && result.message) {
                        displayMessage('Đăng ký thành công! Vui lòng đăng nhập.', 'success');
                        setTimeout(() => {
                            window.location.href = 'login.html';
                        }, 1500);
                    } else {
                         displayMessage(result.message || 'Đăng ký thất bại. Vui lòng thử lại.', 'error');
                    }
                } catch (error) {
                    displayMessage(`Lỗi đăng ký: ${error.message}`, 'error');
                    console.error('Lỗi đăng ký:', error);
                }
            });
        }
    }
});
