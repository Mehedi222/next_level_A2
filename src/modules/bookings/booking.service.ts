import { pool } from "../../config/db";
import { TCreateBookingPayload } from "./booking.interface";

// 1. Create Booking (Includes Logic: Check Vehicle -> Calc Price -> Insert -> Update Vehicle Status)
const createBookingIntoDB = async (payload: TCreateBookingPayload) => {
    const { customer_id, vehicle_id, rent_start_date, rent_end_date } = payload;

    // A. Validate Dates
    const start = new Date(rent_start_date);
    const end = new Date(rent_end_date);
    if (end <= start) {
        throw new Error("End date must be after start date");
    }

    // B. Check Vehicle Availability & Price
    const vehicleResult = await pool.query(
        `SELECT daily_rent_price, availability_status FROM vehicles WHERE id = $1`,
        [vehicle_id]
    );

    if (vehicleResult.rows.length === 0) {
        throw new Error("Vehicle not found");
    }

    const vehicle = vehicleResult.rows[0];

    if (vehicle.availability_status !== 'available') {
        throw new Error("Vehicle is currently not available");
    }

    // C. Calculate Total Price
    const durationInMs = end.getTime() - start.getTime();
    const durationInDays = Math.ceil(durationInMs / (1000 * 60 * 60 * 24));
    const total_price = durationInDays * parseFloat(vehicle.daily_rent_price);

    // D. Insert Booking
    // Note: ideally wrap these two queries in a BEGIN/COMMIT transaction block for safety
    const result = await pool.query(
        `INSERT INTO bookings(customer_id, vehicle_id, rent_start_date, rent_end_date, total_price, status)
     VALUES($1, $2, $3, $4, $5, 'active') RETURNING *`,
        [customer_id, vehicle_id, rent_start_date, rent_end_date, total_price]
    );

    // E. Update Vehicle Status to 'booked'
    await pool.query(`UPDATE vehicles SET availability_status = 'booked' WHERE id = $1`, [vehicle_id]);

    return result.rows[0];
};

// 2. Get All Bookings
const getAllBookingsFromDB = async () => {
    const result = await pool.query(`SELECT * FROM bookings`);
    return result.rows;
};

// 3. Return Vehicle (Update Booking Status -> Make Vehicle Available)
const returnBookingInDB = async (bookingId: number) => {
    // A. Update Booking Status to 'returned'
    const result = await pool.query(
        `UPDATE bookings SET status = 'returned' WHERE id = $1 RETURNING *`,
        [bookingId]
    );

    // If no booking found, return null
    if (result.rows.length === 0) {
        return null;
    }

    const booking = result.rows[0];

    // B. Make Vehicle Available again
    await pool.query(
        `UPDATE vehicles SET availability_status = 'available' WHERE id = $1`,
        [booking.vehicle_id]
    );

    return booking;
};

export const bookingServices = {
    createBookingIntoDB,
    getAllBookingsFromDB,
    returnBookingInDB,
};