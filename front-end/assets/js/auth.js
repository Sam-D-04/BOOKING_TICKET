const LS_USER_KEY = 'movieAppUser';

// --- Helper Functions ---
function saveUserToLocalStorage(userData) {
    localStorage.setItem(LS_USER_KEY, JSON.stringify(userData));
}

function getUserFromLocalStorage() {
    const user = localStorage.getItem(LS_USER_KEY);
    return user ? JSON.parse(user) : null;
}

function removeUserFromLocalStorage() {
    localStorage.removeItem(LS_USER_KEY);
}

function getToken() {
    const user = getUserFromLocalStorage();
    return user ? user.token : null;
}

// --- UI Update Functions ---
function checkLoginState() {
    const user = getUserFromLocalStorage();
    const navLogin = document.getElementById('nav-login');
    const navRegister = document.getElementById('nav-register');
    const navProfile = document.getElementById('nav-profile');
    const navLogout = document.getElementById('nav-logout');

    if (user && user.token) {
        // User is logged in
        if (navLogin) navLogin.style.display = 'none';
        if (navRegister) navRegister.style.display = 'none';
        if (navProfile) navProfile.style.display = 'block';
        if (navLogout) navLogout.style.display = 'block';

        // Chào mừng người dùng (ví dụ, nếu có chỗ hiển thị tên)
        const welcomeMessage = document.getElementById('welcome-user');
        if (welcomeMessage) {
            welcomeMessage.textContent = `Chào, ${user.name || user.email}!`;
        }
    } else {
        // User is not logged in
        if (navLogin) navLogin.style.display = 'block';
        if (navRegister) navRegister.style.display = 'block';
        if (navProfile) navProfile.style.display = 'none';
        if (navLogout) navLogout.style.display = 'none';
    }
}

// --- Event Listeners ---
document.addEventListener('DOMContentLoaded', () => {
    checkLoginState(); // Initial check when page loads

    const logoutButton = document.getElementById('nav-logout');
    if (logoutButton) {
        logoutButton.addEventListener('click', (e) => {
            e.preventDefault();
            handleLogout();
        });
    }

    // Login Form (login.html)
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            await handleLogin({ email, password });
        });
    }

    // Register Form (register.html)
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const phone = document.getElementById('phone').value; // Optional
            await handleRegister({ name, email, password, phone });
        });
    }
});

// --- Handler Functions ---
async function handleLogin(credentials) {
    try {
        const response = await loginUser(credentials); // Gọi API từ api.js
        if (response && response.token && response.user) {
            saveUserToLocalStorage({
                token: response.token,
                id: response.user.id,
                name: response.user.name,
                email: response.user.email
            });
            displayMessage('Đăng nhập thành công!', 'success');
            checkLoginState(); // Update UI
            // Chuyển hướng đến trang chủ hoặc trang profile
            window.location.href = 'index.html';
        } else {
            displayMessage(response.message || 'Thông tin đăng nhập không đúng.', 'error');
        }
    } catch (error) {
        console.error('Lỗi đăng nhập:', error);
        displayMessage(error.message || 'Lỗi đăng nhập. Vui lòng thử lại.', 'error');
    }
}

async function handleRegister(userData) {
    try {
        const response = await registerUser(userData); // Gọi API từ api.js
        if (response && response.message.includes('thành công')) { // Kiểm tra message từ server
            displayMessage(response.message, 'success');
            // Tùy chọn: tự động đăng nhập sau khi đăng ký hoặc chuyển đến trang đăng nhập
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        } else {
             displayMessage(response.message || 'Đăng ký không thành công.', 'error');
        }
    } catch (error) {
        console.error('Lỗi đăng ký:', error);
        displayMessage(error.message || 'Lỗi đăng ký. Vui lòng thử lại.', 'error');
    }
}

function handleLogout() {
    removeUserFromLocalStorage();
    displayMessage('Bạn đã đăng xuất.', 'info');
    checkLoginState(); // Update UI
    // Chuyển hướng đến trang chủ
    window.location.href = 'index.html';
}
