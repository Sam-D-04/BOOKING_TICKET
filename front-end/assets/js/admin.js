
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('admin.html')) {
     
    }
});


// Helper function để hiển thị thông báo (nếu chưa có trong api.js hoặc main.js)
// Nếu đã có trong api.js (như trong file bạn đã upload) thì KHÔNG cần khai báo lại ở đây
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

function createMessageArea() {
    const existingArea = document.getElementById('messageArea');
    if (existingArea) return existingArea;

    const area = document.createElement('div');
    area.id = 'messageArea';
    area.className = 'message-area'; // Add base class
    document.body.appendChild(area);
    return area;
}


/**
 * Hàm chính để tải và hiển thị trang quản trị.
 * Đây là hàm mà main.js sẽ gọi khi người dùng vào admin.html
 */
async function loadAdminPage() {
    console.log('--- Đang khởi tạo Admin Page ---');
    const token = localStorage.getItem('jwtToken');
    const userRole = localStorage.getItem('userRole');
    const adminContent = document.getElementById('adminContent');

    if (!token || userRole !== 'admin') {
        displayMessage('Bạn không có quyền truy cập trang quản trị. Vui lòng đăng nhập với tài khoản admin.', 'error');
        adminContent.innerHTML = '<p class="text-center text-red-500">Không có quyền truy cập.</p>';
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
        console.error('Không có quyền truy cập Admin Dashboard.');
        return;
    }

    // Nếu đã là admin, hiển thị cấu trúc HTML và gắn sự kiện
    adminContent.innerHTML = `
        <div class="flex justify-center space-x-4 mb-6">
            <button id="showMoviesBtn" class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out">Quản lý Phim</button>
            <button id="showUsersBtn" class="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out">Quản lý Người dùng</button>
        </div>

        <div id="moviesManagement" class="hidden">
            <h3 class="text-2xl font-semibold mb-4 text-gray-700">Quản lý Phim</h3>
            <button id="addMovieBtn" class="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out mb-4">Thêm Phim Mới</button>
            <div id="movieFormContainer" class="hidden bg-white p-6 rounded-lg shadow-inner mb-6">
                <h4 class="text-xl font-semibold mb-4">Thêm/Sửa Phim</h4>
                <form id="movieForm" class="space-y-4">
                    <input type="hidden" id="movieId">
                    <div>
                        <label for="movieTitle" class="block text-gray-700 text-sm font-bold mb-2">Tiêu đề:</label>
                        <input type="text" id="movieTitle" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required>
                    </div>
                    <div>
                        <label for="movieDescription" class="block text-gray-700 text-sm font-bold mb-2">Mô tả:</label>
                        <textarea id="movieDescription" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" rows="4"></textarea>
                    </div>
                    <div>
                        <label for="movieGenre" class="block text-gray-700 text-sm font-bold mb-2">Thể loại:</label>
                        <input type="text" id="movieGenre" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                    </div>
                    <div>
                        <label for="movieDuration" class="block text-gray-700 text-sm font-bold mb-2">Thời lượng (phút):</label>
                        <input type="number" id="movieDuration" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                    </div>
                    <div>
                        <label for="moviePosterUrl" class="block text-gray-700 text-sm font-bold mb-2">URL Poster:</label>
                        <input type="url" id="moviePosterUrl" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                    </div>
                    <div>
                        <label for="movieReleaseDate" class="block text-gray-700 text-sm font-bold mb-2">Ngày phát hành:</label>
                        <input type="date" id="movieReleaseDate" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                    </div>
                    <div>
                        <label for="movieStatus" class="block text-gray-700 text-sm font-bold mb-2">Trạng thái:</label>
                        <select id="movieStatus" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                            <option value="now_showing">Đang chiếu</option>
                            <option value="coming_soon">Sắp chiếu</option>
                        </select>
                    </div>
                    <div class="flex justify-end space-x-2">
                        <button type="submit" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">Lưu Phim</button>
                        <button type="button" id="cancelMovieFormBtn" class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg">Hủy</button>
                    </div>
                </form>
            </div>
            <div id="moviesList" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                </div>
        </div>

         <div id="usersManagement" class="hidden">
            <h3 class="text-2xl font-semibold mb-4 text-gray-700">Quản lý Người dùng</h3>
            <div id="userFormContainer" class="hidden bg-white p-6 rounded-lg shadow-inner mb-6">
                <h4 class="text-xl font-semibold mb-4">Sửa Người dùng</h4>
                <form id="userForm" class="space-y-4">
                    <input type="hidden" id="userId">
                    <div>
                        <label for="userName" class="block text-gray-700 text-sm font-bold mb-2">Tên:</label>
                        <input type="text" id="userName" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required>
                    </div>
                    <div>
                        <label for="userEmail" class="block text-gray-700 text-sm font-bold mb-2">Email:</label>
                        <input type="email" id="userEmail" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required>
                    </div>
                    <div>
                        <label for="userPhone" class="block text-gray-700 text-sm font-bold mb-2">Số điện thoại:</label>
                        <input type="text" id="userPhone" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                    </div>
                    <div>
                        <label for="userRole" class="block text-gray-700 text-sm font-bold mb-2">Vai trò:</label>
                        <select id="userRole" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                            <option value="user">Người dùng</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                    <div>
                        <label for="userPassword" class="block text-gray-700 text-sm font-bold mb-2">Mật khẩu mới (để trống nếu không đổi):</label>
                        <input type="password" id="userPassword" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                    </div>
                    <div class="flex justify-end space-x-2">
                        <button type="submit" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">Lưu Người dùng</button>
                        <button type="button" id="cancelUserFormBtn" class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg">Hủy</button>
                    </div>
                </form>
            </div>
            <div id="usersList" class="space-y-4">
                </div>
        </div>
    `;

    // Gắn sự kiện cho các nút chuyển đổi
    document.getElementById('showMoviesBtn').addEventListener('click', () => {
        document.getElementById('moviesManagement').classList.remove('hidden');
        document.getElementById('usersManagement').classList.add('hidden');
        loadMoviesForAdmin(); // Gọi hàm tải phim
    });

    document.getElementById('showUsersBtn').addEventListener('click', () => {
        document.getElementById('usersManagement').classList.remove('hidden');
        document.getElementById('moviesManagement').classList.add('hidden');
        loadUsersForAdmin(); // Gọi hàm tải người dùng
    });

    // Event listeners cho Movie Form
    document.getElementById('addMovieBtn').addEventListener('click', () => {
        document.getElementById('movieForm').reset(); // Reset form
        document.getElementById('movieId').value = ''; // Xóa ID cũ
        document.getElementById('movieFormContainer').classList.remove('hidden');
    });

    document.getElementById('cancelMovieFormBtn').addEventListener('click', () => {
        document.getElementById('movieFormContainer').classList.add('hidden');
    });

    document.getElementById('movieForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const movieId = document.getElementById('movieId').value;
        const movieData = {
            title: document.getElementById('movieTitle').value,
            description: document.getElementById('movieDescription').value,
            genre: document.getElementById('movieGenre').value,
            duration: parseInt(document.getElementById('movieDuration').value),
            poster_url: document.getElementById('moviePosterUrl').value,
            release_date: document.getElementById('movieReleaseDate').value,
            status: document.getElementById('movieStatus').value
        };
        const token = localStorage.getItem('jwtToken');

        try {
            if (movieId) {
                // Cập nhật phim
                await updateMovieAdmin(movieId, movieData, token);
                displayMessage('Phim đã được cập nhật thành công', 'success');
            } else {
                // Tạo phim mới
                await createMovieAdmin(movieData, token);
                displayMessage('Phim mới đã được thêm thành công', 'success');
            }
            document.getElementById('movieFormContainer').classList.add('hidden');
            loadMoviesForAdmin(); // Tải lại danh sách
        } catch (error) {
            displayMessage(`Lỗi khi lưu phim: ${error.message}`, 'error');
            console.error('Lỗi khi lưu phim:', error);
        }
    });

    // Event listeners cho User Form
    document.getElementById('cancelUserFormBtn').addEventListener('click', () => {
        document.getElementById('userFormContainer').classList.add('hidden');
    });

    document.getElementById('userForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const userId = document.getElementById('userId').value;
        const userData = {
            name: document.getElementById('userName').value,
            email: document.getElementById('userEmail').value,
            phone: document.getElementById('userPhone').value,
            role: document.getElementById('userRole').value,
        };
        // Chỉ thêm mật khẩu nếu có nhập (để trống nếu không đổi)
        const newPassword = document.getElementById('userPassword').value;
        if (newPassword) {
            userData.password = newPassword; // Mật khẩu này sẽ được hash ở backend
        }

        const token = localStorage.getItem('jwtToken');

        try {
            await updateUserAdmin(userId, userData, token);
            displayMessage('Thông tin người dùng đã được cập nhật thành công!', 'success');
            document.getElementById('userFormContainer').classList.add('hidden');
            loadUsersForAdmin(); // Tải lại danh sách
        } catch (error) {
            displayMessage(`Lỗi khi cập nhật người dùng: ${error.message}`, 'error');
            console.error('Lỗi khi cập nhật người dùng:', error);
        }
    });

    // Mặc định hiển thị phần quản lý phim khi tải trang
    document.getElementById('moviesManagement').classList.remove('hidden');
    loadMoviesForAdmin(); // Tải phim ngay lập tức khi trang admin được nạp
    console.log('--- Admin Page đã khởi tạo xong ---');
}

/**
 * Tải và hiển thị danh sách phim cho trang quản trị.
 */
async function loadMoviesForAdmin() {
    console.log('Đang tải danh sách phim cho Admin...');
    const moviesList = document.getElementById('moviesList');
    moviesList.innerHTML = '<p class="text-center text-gray-500">Đang tải danh sách phim...</p>';
    const token = localStorage.getItem('jwtToken');

    try {
        const movies = await getMoviesAdmin(token); // Gọi API admin để lấy phim
        moviesList.innerHTML = ''; // Xóa thông báo tải

        if (movies && movies.length > 0) {
            movies.forEach(movie => {
                const movieCard = document.createElement('div');
                movieCard.className = 'bg-white p-4 rounded-lg shadow-md flex flex-col';
                movieCard.innerHTML = `
                    <h4 class="text-lg font-semibold">${movie.title}</h4>
                    <p class="text-sm text-gray-600">ID: ${movie.id}</p>
                    <p class="text-sm text-gray-600">Thể loại: ${movie.genre}</p>
                    <p class="text-sm text-gray-600">Thời lượng: ${movie.duration} phút</p>
                    <p class="text-sm text-gray-600">Trạng thái: ${movie.status}</p>
                    <div class="flex space-x-2 mt-3">
                        <button class="edit-movie-btn bg-yellow-500 hover:bg-yellow-600 text-white py-1 px-3 rounded-md text-sm" data-movie-id="${movie.id}">Sửa</button>
                        <button class="delete-movie-btn bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded-md text-sm" data-movie-id="${movie.id}">Xóa</button>
                    </div>
                `;
                moviesList.appendChild(movieCard);
            });

            // Gắn sự kiện cho các nút Sửa/Xóa phim (đảm bảo code này chạy sau khi movieCard được thêm vào DOM)
            document.querySelectorAll('.edit-movie-btn').forEach(button => {
                button.addEventListener('click', async (e) => {
                    const movieId = e.target.dataset.movieId;
                    try {
                        const movie = await getMovieById(movieId); // Sử dụng API getMovieById công khai
                        if (movie) {
                            document.getElementById('movieId').value = movie.id;
                            document.getElementById('movieTitle').value = movie.title;
                            document.getElementById('movieDescription').value = movie.description;
                            document.getElementById('movieGenre').value = movie.genre;
                            document.getElementById('movieDuration').value = movie.duration;
                            document.getElementById('moviePosterUrl').value = movie.poster_url;
                            document.getElementById('movieReleaseDate').value = movie.release_date ? new Date(movie.release_date).toISOString().split('T')[0] : ''; // Định dạng lại ngày YYYY-MM-DD         
                            document.getElementById('movieStatus').value = movie.status;
                            document.getElementById('movieFormContainer').classList.remove('hidden');
                            document.getElementById('movieTitle').focus();
                        } else {
                            displayMessage('Không tìm thấy thông tin phim để sửa.', 'error');
                        }
                    } catch (error) {
                        displayMessage(`Lỗi khi tải thông tin phim: ${error.message}`, 'error');
                        console.error('Lỗi khi tải thông tin phim:', error);
                    }
                });
            });

            document.querySelectorAll('.delete-movie-btn').forEach(button => {
                button.addEventListener('click', async (e) => {
                    const movieId = e.target.dataset.movieId;
                    if (window.confirm('Bạn có chắc chắn muốn xóa phim này?')) {
                        try {
                            await deleteMovieAdmin(movieId, token);
                            displayMessage('Phim đã được xóa thành công!', 'success');
                            loadMoviesForAdmin(); // Tải lại danh sách phim
                        } catch (error) {
                            displayMessage(`Lỗi khi xóa phim: ${error.message}`, 'error');
                            console.error('Lỗi khi xóa phim:', error);
                        }
                    }
                });
            });

        } else {
            moviesList.innerHTML = '<p class="text-center text-gray-500">Không có phim nào để quản lý.</p>';
        }
    } catch (error) {
        displayMessage(`Lỗi khi tải phim: ${error.message}`, 'error');
        console.error('Lỗi khi tải phim cho admin:', error);
        moviesList.innerHTML = '<p class="text-center text-red-500">Lỗi khi tải phim. Vui lòng kiểm tra kết nối và quyền truy cập.</p>';
    }
}

/**
 * Tải và hiển thị danh sách người dùng cho trang quản trị.
 */
// admin.js

async function loadUsersForAdmin() {
    console.log('Đang tải danh sách người dùng cho Admin...');
    const usersList = document.getElementById('usersList');
    usersList.innerHTML = '<p class="text-center text-gray-500">Đang tải danh sách người dùng...</p>';
    const token = localStorage.getItem('jwtToken');

    try {
        const users = await getUsersAdmin(token); // Gọi API admin để lấy người dùng
        usersList.innerHTML = ''; // Xóa thông báo tải

        if (users && users.length > 0) {
            users.forEach(user => {
                const userCard = document.createElement('div');
                userCard.className = 'bg-white p-4 rounded-lg shadow-md flex flex-col';
                userCard.innerHTML = `
                    <h4 class="text-lg font-semibold">${user.name}</h4>
                    <p class="text-sm text-gray-600">ID: ${user.id}</p>
                    <p class="text-sm text-gray-600">Email: ${user.email}</p>
                    <p class="text-sm text-gray-600">SĐT: ${user.phone || 'N/A'}</p>
                    <p class="text-sm text-gray-600">Vai trò: ${user.role}</p>
                    <div class="flex space-x-2 mt-3">
                        <button class="edit-user-btn bg-yellow-500 hover:bg-yellow-600 text-white py-1 px-3 rounded-md text-sm" data-user-id="${user.id}">Sửa</button>
                        <button class="delete-user-btn bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded-md text-sm" data-user-id="${user.id}">Xóa</button>
                    </div>
                `;
                usersList.appendChild(userCard);
            });

            // Gắn sự kiện cho các nút Sửa người dùng
            document.querySelectorAll('.edit-user-btn').forEach(button => {
                button.addEventListener('click', async (e) => {
                    const userId = e.target.dataset.userId;
                    try {
                        const user = await getUserProfileAdmin(userId, localStorage.getItem('jwtToken'));
                        if (user) {
                            document.getElementById('userId').value = user.id;
                            document.getElementById('userName').value = user.name;
                            document.getElementById('userEmail').value = user.email;
                            document.getElementById('userPhone').value = user.phone;
                            document.getElementById('userRole').value = user.role;
                            document.getElementById('userPassword').value = ''; // Luôn xóa mật khẩu khi sửa
                            document.getElementById('userFormContainer').classList.remove('hidden');
                            document.getElementById('userName').focus();
                        } else {
                            displayMessage('Không tìm thấy thông tin người dùng để sửa.', 'error');
                        }
                    } catch (error) {
                        displayMessage(`Lỗi khi tải thông tin người dùng: ${error.message}`, 'error');
                        console.error('Lỗi khi tải thông tin người dùng:', error);
                    }
                });
            });

            // Gắn sự kiện cho các nút Xóa người dùng (đã đưa ra ngoài vòng lặp foreach trước đó)
            document.querySelectorAll('.delete-user-btn').forEach(button => {
                button.addEventListener('click', async (e) => {
                    const userId = e.target.dataset.userId;
                    if (window.confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
                        try {
                            await deleteUserAdmin(userId, token);
                            displayMessage('Người dùng đã được xóa thành công!', 'success');
                            loadUsersForAdmin(); // Tải lại danh sách người dùng
                        } catch (error) {
                            displayMessage(`Lỗi khi xóa người dùng: ${error.message}`, 'error');
                            console.error('Lỗi khi xóa người dùng:', error);
                        }
                    }
                });
            });

        } else {
            usersList.innerHTML = '<p class="text-center text-gray-500">Không có người dùng nào để quản lý.</p>';
        }
    } catch (error) {
        displayMessage(`Lỗi khi tải người dùng: ${error.message}`, 'error');
        console.error('Lỗi khi tải người dùng cho admin:', error);
        usersList.innerHTML = '<p class="text-center text-red-500">Lỗi khi tải người dùng. Vui lòng kiểm tra kết nối và quyền truy cập.</p>';
    }
}