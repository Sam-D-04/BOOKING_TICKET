const db = require('../config/db');

// Xử lý một yêu cầu thanh toán mới 
exports.processPayment = async (req, res) => {
    const { bookingId, paymentMethod, amount  } = req.body;
    const userId = req.user.id;

    if (!bookingId || !paymentMethod || amount === undefined) {
        return res.status(400).json({ message: 'Thông tin thanh toán không đầy đủ.' });
    }

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        //Kiểm tra xem booking có tồn tại và thuộc về người dùng này không, và có đang ở trạng thái pending không
        const [bookings] = await connection.query(
            'SELECT id, user_id, total_amount, status FROM booking WHERE id = ? AND user_id = ?',
            [bookingId, userId]
        );

        if (bookings.length === 0) {
            await connection.rollback();
            return res.status(404).json({ message: 'Không tìm thấy đơn đặt vé hoặc bạn không có quyền thanh toán.' });
        }
        const booking = bookings[0];

        if (booking.status !== 'pending') {
            await connection.rollback();
            return res.status(400).json({ message: `Đơn đặt vé này đã ở trạng thái ${booking.status}, không thể thanh toán.` });
        }
        
        // Kiểm tra số tiền
        if (parseFloat(amount) !== parseFloat(booking.total_amount)) {
            await connection.rollback();
            return res.status(400).json({ message: 'Số tiền thanh toán không khớp với tổng tiền của đơn đặt vé.' });
        }

        //Giả lập quá trình thanh toán
        let paymentStatus = 'failed'; 
        let transactionId = null;

        if (['momo', 'banking', 'zalopay', 'credit_card'].includes(paymentMethod)) {
            paymentStatus = 'completed';
            transactionId = `${paymentMethod.toUpperCase()}_${Date.now()}`;
        } else if (paymentMethod === 'cash') { // Thanh toán tại quầy
            paymentStatus = 'pending'; // Chờ xác nhận tại quầy
            transactionId = `COUNTER_${Date.now()}`;
        } else { 
            paymentStatus = 'failed';
        }


        //Tạo bản ghi payment trong database
        const paymentDate = paymentStatus === 'completed' ? new Date() : null;
        const paymentQuery = `
            INSERT INTO payment (booking_id, amount, payment_date, payment_method, transaction_id, status) 
            VALUES (?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE 
                amount = VALUES(amount), 
                payment_date = VALUES(payment_date), 
                payment_method = VALUES(payment_method), 
                transaction_id = VALUES(transaction_id), 
                status = VALUES(status)
        `;
        await connection.query(paymentQuery, [bookingId, amount, paymentDate, paymentMethod, transactionId, paymentStatus]);

        // Cập nhật trạng thái booking nếu thanh toán thành công
        let newBookingStatus = booking.status;
        if (paymentStatus === 'completed') {
            newBookingStatus = 'confirmed'; // Xác nhận booking
        } else if (paymentMethod === 'at_counter' && paymentStatus === 'pending') {
            newBookingStatus = 'pending_payment_at_counter'; // Đổi trạng thái booking để biết là chờ thanh toán tại quầy
        }
        // Nếu paymentStatus là 'failed', booking status vẫn là 'pending'
        
        if (newBookingStatus !== booking.status) {
             await connection.query('UPDATE booking SET status = ? WHERE id = ?', [newBookingStatus, bookingId]);
        }
       

        await connection.commit();

        res.status(201).json({
            message: `Xử lý thanh toán thành công. Trạng thái: ${paymentStatus}.`,
            bookingId: bookingId,
            paymentStatus: paymentStatus,
            bookingStatus: newBookingStatus,
            transactionId: transactionId
        });

    } catch (error) {
        await connection.rollback();
        console.error('Lỗi xử lý thanh toán:', error);
        res.status(500).json({ message: 'Lỗi server khi xử lý thanh toán.', error: error.message });
    } finally {
        connection.release();
    }

    
};

exports.getPaymentStatus = async (req, res) => {
    const bookingId = req.params.bookingId;
    const userId = req.user.id;

    const connection = await db.getConnection();
    try {
        // Kiểm tra quyền truy cập
        const [bookings] = await connection.query(
            'SELECT id FROM booking WHERE id = ? AND user_id = ?',
            [bookingId, userId]
        );

        if (bookings.length === 0) {
            return res.status(403).json({ message: 'Bạn không có quyền xem trạng thái thanh toán của đơn này.' });
        }

        // Lấy trạng thái thanh toán từ bảng payment
        const [payments] = await connection.query(
            'SELECT status, payment_method, payment_date, transaction_id, amount FROM payment WHERE booking_id = ?',
            [bookingId]
        );

        if (payments.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy thông tin thanh toán cho đơn này.' });
        }

        return res.json({
            bookingId,
            ...payments[0]  
        });

    } catch (err) {
        console.error('Lỗi khi lấy trạng thái thanh toán:', err);
        res.status(500).json({ message: 'Lỗi server khi lấy trạng thái thanh toán.' });
    } finally {
        connection.release();
    }
};

