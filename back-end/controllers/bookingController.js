const db = require('../config/db');

// Lấy thông tin ghế và trạng thái của một suất chiếu
exports.getSeatsForShowtime = async (req, res) => {
    const { showtimeId } = req.params;
    if (!req.user || !req.user.id) {
        return res.status(401).json({ message: 'Yêu cầu đăng nhập.' });
    }

    try {
        // 1. Lấy thông tin suất chiếu và phòng chiếu
        const [showtimeInfo] = await db.query(
            `SELECT s.id as showtime_id, s.theater_id, s.price as base_price, t.name as theater_name, t.num_rows, t.seats_per_row 
             FROM showtime s
             JOIN theater t ON s.theater_id = t.id
             WHERE s.id = ? AND s.status = 'open'`, // Chỉ lấy suất chiếu đang mở
            [showtimeId]
        );

        if (showtimeInfo.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy suất chiếu hoặc suất chiếu không hợp lệ.' });
        }
        const theater = showtimeInfo[0];

        // 2. Lấy tất cả các ghế trong phòng chiếu đó
        const [allSeatsInTheater] = await db.query(
            'SELECT id as seat_id, seat_row, number as seat_number, type as seat_type FROM seat WHERE theater_id = ? ORDER BY seat_row, seat_number',
            [theater.theater_id]
        );

        // 3. Lấy các ghế đã được đặt cho suất chiếu này từ bảng showtime_seat hoặc ticket
        // Giả sử showtime_seat lưu trạng thái ghế cho từng suất chiếu
        const [bookedSeatsForShowtime] = await db.query(
            'SELECT seat_id FROM showtime_seat WHERE showtime_id = ? AND is_available = 0',
            [showtimeId]
        );
        const bookedSeatIds = bookedSeatsForShowtime.map(s => s.seat_id);

        // 4. Kết hợp thông tin ghế và trạng thái
        const seatsWithStatus = allSeatsInTheater.map(seat => ({
            ...seat,
            is_available: !bookedSeatIds.includes(seat.seat_id),
            price: theater.base_price // Đoạn này có thể thay đổi nếu bạn có nhiều loại ghế với giá khác nhau nè nhưng t lười nên sẽ để giá ghế giống nhau 
        }));
        
        // Tạo cấu trúc sơ đồ ghế (ví dụ: một mảng các hàng, mỗi hàng là một mảng các ghế)
        // Điều này giúp frontend dễ dàng render hơn
        const seatLayout = [];
        let currentRow = null;
        let rowSeats = [];
        for (const seat of seatsWithStatus) {
            if (seat.seat_row !== currentRow) {
                if (currentRow !== null) {
                    seatLayout.push({ row_label: currentRow, seats: rowSeats });
                }
                currentRow = seat.seat_row;
                rowSeats = [];
            }
            rowSeats.push(seat);
        }
        if (currentRow !== null && rowSeats.length > 0) { // Đẩy hàng cuối cùng vào
             seatLayout.push({ row_label: currentRow, seats: rowSeats });
        }


        res.json({
            showtime_id: theater.showtime_id,
            theater_name: theater.theater_name,
            base_price: theater.base_price,
            num_rows: theater.num_rows,
            seats_per_row: theater.seats_per_row, // Số ghế mỗi hàng từ bảng theater
            seat_layout: seatLayout, // Sơ đồ ghế đã xử lý
            // seats: seatsWithStatus, // Hoặc trả về danh sách ghế phẳng nếu frontend tự xử lý layout
        });

    } catch (error) {
        console.error('Lỗi lấy thông tin ghế:', error);
        res.status(500).json({ message: 'Lỗi server khi lấy thông tin ghế.', error: error.message });
    }
};

// Tạo một đơn đặt vé mới
exports.createBooking = async (req, res) => {
    const { showtimeId, seatIds, totalAmount } = req.body; // seatIds là một mảng các ID của ghế được chọn
    const userId = req.user.id; // Lấy từ middleware protect

    if (!showtimeId || !seatIds || !seatIds.length || totalAmount === undefined) {
        return res.status(400).json({ message: 'Thông tin đặt vé không đầy đủ (thiếu suất chiếu, ghế hoặc tổng tiền).' });
    }

    const connection = await db.getConnection(); // Lấy một kết nối để thực hiện transaction

    try {
        await connection.beginTransaction(); // Bắt đầu transaction

        // 1. Kiểm tra xem suất chiếu có tồn tại và còn mở không
        const [showtimes] = await connection.query('SELECT id, price, theater_id FROM showtime WHERE id = ? AND status = \'open\' AND date_time >= NOW()', [showtimeId]);
        if (showtimes.length === 0) {
            await connection.rollback();
            return res.status(404).json({ message: 'Suất chiếu không hợp lệ, đã đóng hoặc không tồn tại.' });
        }
        const showtime = showtimes[0];

        // 2. Kiểm tra xem các ghế có hợp lệ và còn trống không
        // Đồng thời lấy thông tin chi tiết của từng ghế (ví dụ: loại ghế để tính giá nếu cần)
        const placeholders = seatIds.map(() => '?').join(','); 
        const [selectedSeatsDetails] = await connection.query(
            `SELECT s.id, s.type, ss.is_available 
             FROM seat s
             LEFT JOIN showtime_seat ss ON s.id = ss.seat_id AND ss.showtime_id = ?
             WHERE s.id IN (${placeholders}) AND s.theater_id = ?`,
            [showtimeId, ...seatIds, showtime.theater_id]
        );
        
        if (selectedSeatsDetails.length !== seatIds.length) {
            await connection.rollback();
            return res.status(400).json({ message: 'Một hoặc nhiều ghế không hợp lệ hoặc không thuộc phòng chiếu này.' });
        }

        for (const seat of selectedSeatsDetails) {
            // Nếu is_available là null (chưa có trong showtime_seat) hoặc là 1 (true) thì ghế còn trống
            // Nếu is_available là 0 (false) thì ghế đã được đặt
            if (seat.is_available === 0) {
                await connection.rollback();
                return res.status(409).json({ message: `Ghế ${seat.id} đã có người đặt. Vui lòng chọn ghế khác.` });
            }
        }
        
        // (Tùy chọn) Tính lại tổng tiền ở backend để đảm bảo chính xác
        const calculatedTotalAmount = seatIds.length * showtime.price; // Giả sử giá vé mỗi ghế như nhau
        if (parseFloat(totalAmount) !== calculatedTotalAmount) {
             await connection.rollback();
             return res.status(400).json({ message: 'Tổng tiền không khớp. Vui lòng thử lại.' });
         }


        // 3. Tạo đơn đặt vé (booking)
        const bookingQuery = 'INSERT INTO booking (user_id, showtime_id, total_amount, status) VALUES (?, ?, ?, ?)';
        const [bookingResult] = await connection.query(bookingQuery, [userId, showtimeId, totalAmount, 'pending']); // Mặc định là 'pending' chờ thanh toán
        const bookingId = bookingResult.insertId;

        // 4. Tạo các vé (tickets) và cập nhật trạng thái ghế trong showtime_seat
        const ticketInsertPromises = seatIds.map(seatId => {
            const ticketCode = `TICKET-${bookingId}-${seatId}-${Date.now().toString().slice(-4)}`; // Tạo mã vé đơn giản
            const ticketQuery = 'INSERT INTO ticket (booking_id, seat_id, price, ticket_code, status) VALUES (?, ?, ?, ?, ?)';
            // Giá vé có thể lấy từ thông tin suất chiếu hoặc thông tin ghế (nếu giá khác nhau)
            return connection.query(ticketQuery, [bookingId, seatId, showtime.price, ticketCode, 'active']); // Mặc định vé 'active' sau khi tạo booking
        });
        
        const showtimeSeatUpdatePromises = seatIds.map(seatId => {
            // Kiểm tra xem ghế đã có trong showtime_seat chưa, nếu chưa thì INSERT, rồi thì UPDATE
            // Ở đây giả định sẽ INSERT mới hoặc UPDATE nếu đã có (ví dụ, nếu trước đó ghế được giải phóng)
            const upsertQuery = `
                INSERT INTO showtime_seat (showtime_id, seat_id, is_available) 
                VALUES (?, ?, 0) 
                ON DUPLICATE KEY UPDATE is_available = 0;
            `;
            return connection.query(upsertQuery, [showtimeId, seatId]);
        });

        await Promise.all([...ticketInsertPromises, ...showtimeSeatUpdatePromises]);

        await connection.commit(); // Hoàn tất transaction

        res.status(201).json({
            message: 'Đặt vé thành công! Vui lòng tiến hành thanh toán.',
            bookingId: bookingId,
        });

    } catch (error) {
        await connection.rollback(); // Hoàn tác nếu có lỗi
        console.error('Lỗi tạo đơn đặt vé:', error);
        res.status(500).json({ message: 'Lỗi server khi tạo đơn đặt vé.', error: error.message });
    } finally {
        connection.release(); // Trả kết nối về pool
    }
};


// Lấy danh sách vé đã đặt của người dùng hiện tại
exports.getUserTickets = async (req, res) => {
    const userId = req.user.id;
    try {
        const query = `
            SELECT 
                b.id as booking_id, b.booking_date, b.total_amount, b.status as booking_status,
                s.date_time as showtime_date_time,
                m.title as movie_title, m.poster_url,
                th.name as theater_name,
                GROUP_CONCAT(CONCAT(st.seat_row, st.number) ORDER BY st.seat_row, st.number SEPARATOR ', ') as seats_booked,
                (SELECT GROUP_CONCAT(tk.ticket_code SEPARATOR ', ') FROM ticket tk WHERE tk.booking_id = b.id) as ticket_codes,
                p.status as payment_status, p.payment_method
            FROM booking b
            JOIN showtime s ON b.showtime_id = s.id
            JOIN movie m ON s.movie_id = m.id
            JOIN theater th ON s.theater_id = th.id
            JOIN ticket t ON b.id = t.booking_id  -- Join với bảng ticket để lấy seat_id
            JOIN seat st ON t.seat_id = st.id     -- Join với bảng seat để lấy thông tin ghế
            LEFT JOIN payment p ON b.id = p.booking_id -- Left join với payment để lấy trạng thái thanh toán
            WHERE b.user_id = ?
            GROUP BY b.id -- Nhóm theo booking_id để mỗi booking chỉ xuất hiện một lần
            ORDER BY b.booking_date DESC
        `;
        const [tickets] = await db.query(query, [userId]);
        res.json(tickets);
    } catch (error) {
        console.error('Lỗi lấy vé đã đặt:', error);
        res.status(500).json({ message: 'Lỗi server khi lấy vé đã đặt.', error: error.message });
    }
};

// Lấy chi tiết một đơn đặt vé
exports.getBookingDetails = async (req, res) => {
    const { bookingId } = req.params;
    const userId = req.user.id; // Để kiểm tra xem người dùng có quyền xem booking này không

    try {
        // Lấy thông tin booking cơ bản
        const [bookingDetails] = await db.query(
            `SELECT b.*, u.name as user_name, u.email as user_email, 
                    s.date_time as showtime_date_time, m.title as movie_title, th.name as theater_name
             FROM booking b 
             JOIN registered_user u ON b.user_id = u.id
             JOIN showtime s ON b.showtime_id = s.id
             JOIN movie m ON s.movie_id = m.id
             JOIN theater th ON s.theater_id = th.id
             WHERE b.id = ?`,
            [bookingId]
        );

        if (bookingDetails.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy đơn đặt vé.' });
        }

        // Kiểm tra quyền: chỉ chủ nhân của booking hoặc admin mới được xem 
        if (bookingDetails[0].user_id !== userId /* && req.user.role !== 'admin' */) {
            return res.status(403).json({ message: 'Bạn không có quyền xem đơn đặt vé này.' });
        }

        // Lấy thông tin các vé và ghế thuộc booking này
        const [ticketsInBooking] = await db.query(
            `SELECT t.id as ticket_id, t.ticket_code, t.price as ticket_price, t.status as ticket_status,
                    st.seat_row, st.number as seat_number, st.type as seat_type
             FROM ticket t
             JOIN seat st ON t.seat_id = st.id
             WHERE t.booking_id = ?`,
            [bookingId]
        );
        
        // Lấy thông tin thanh toán (nếu có)
        const [paymentInfo] = await db.query('SELECT * FROM payment WHERE booking_id = ?', [bookingId]);

        res.json({
            booking: bookingDetails[0],
            tickets: ticketsInBooking,
            payment: paymentInfo.length > 0 ? paymentInfo[0] : null
        });

    } catch (error) {
        console.error('Lỗi lấy chi tiết đơn đặt vé:', error);
        res.status(500).json({ message: 'Lỗi server khi lấy chi tiết đơn đặt vé.', error: error.message });
    }
};
exports.cancelBooking = async (req, res) => {
    const { bookingId } = req.params;
    const userId = req.user.id; // Người dùng yêu cầu hủy

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Kiểm tra xem đặt vé có tồn tại, thuộc về người dùng và có thể hủy được (trạng thái 'pending')
        const [bookings] = await connection.query(
            'SELECT status FROM booking WHERE id = ? AND user_id = ?',
            [bookingId, userId]
        );

        if (bookings.length === 0) {
            await connection.rollback();
            return res.status(404).json({ message: 'Không tìm thấy đặt vé hoặc bạn không có quyền hủy.' });
        }

        const booking = bookings[0];
        if (booking.status !== 'pending') {
            await connection.rollback();
            return res.status(400).json({ message: 'Chỉ các đặt vé đang chờ xử lý mới có thể hủy thủ công.' });
        }

        // 2. Cập nhật trạng thái đặt vé thành 'cancelled'
        await connection.query(
            'UPDATE booking SET status = ? WHERE id = ?',
            ['cancelled', bookingId]
        );

        // 3. Giải phóng ghế (Nếu bạn có bảng `showtime_seats` với cột `is_available`, bạn cần cập nhật nó ở đây)
        // Lấy các seat_id liên quan đến booking này
        const [bookedSeats] = await connection.query(
            'SELECT seat_id FROM booking_seats WHERE booking_id = ?',
            [bookingId]
        );
        const seatIdsToFree = bookedSeats.map(s => s.seat_id);

        // Cập nhật trạng thái ghế trong showtime_seats (nếu có)
        if (seatIdsToFree.length > 0) {
            // Bạn cần biết showtime_id để cập nhật showtime_seats
            const [showtimeInfo] = await connection.query(
                'SELECT showtime_id FROM booking WHERE id = ?',
                [bookingId]
            );
            const showtimeId = showtimeInfo[0].showtime_id;

            await connection.query(
                'UPDATE showtime_seats SET is_available = TRUE WHERE showtime_id = ? AND seat_id IN (?)',
                [showtimeId, seatIdsToFree]
            );
        }

        await connection.commit();
        res.json({ message: 'Đặt vé đã được hủy thành công!' });

    } catch (error) {
        await connection.rollback();
        console.error('Lỗi khi hủy đặt vé:', error);
        res.status(500).json({ message: 'Lỗi server khi hủy đặt vé.', error: error.message });
    } finally {
        connection.release();
    }
};