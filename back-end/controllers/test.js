// hash_password.js
const bcrypt = require('bcryptjs');

async function hashAdminPassword() {
    const password = 'admin123'; // Mật khẩu bạn muốn mã hóa
    const salt = await bcrypt.genSalt(10); // Tạo salt
    const hashedPassword = await bcrypt.hash(password, salt); // Mã hóa mật khẩu
    console.log('Mật khẩu "admin" đã mã hóa (hashed):', hashedPassword);
}

hashAdminPassword();