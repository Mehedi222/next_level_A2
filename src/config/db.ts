
import { Pool } from "pg";
import config from ".";


//DB
export const pool = new Pool({
    connectionString: `${config.connection_str}`,
});


const initDB = async () => {
    // 1. Create Users Table
    await pool.query(`
        CREATE TABLE IF NOT EXISTS users(
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            phone VARCHAR(50) NOT NULL,
            role VARCHAR(20) CHECK(role IN('admin', 'customer')) NOT NULL
        );
    `);

    // 2. Create Vehicles Table
    await pool.query(`
        CREATE TABLE IF NOT EXISTS vehicles(
            id SERIAL PRIMARY KEY,
            vehicle_name VARCHAR(255) NOT NULL,
            type VARCHAR(50) CHECK(type IN('car', 'bike', 'van', 'SUV')) NOT NULL,
            registration_number VARCHAR(100) UNIQUE NOT NULL,
            daily_rent_price DECIMAL NOT NULL CHECK(daily_rent_price > 0),
            availability_status VARCHAR(50) CHECK(availability_status IN('available', 'booked')) DEFAULT 'available'
        );
    `);

    // 3. Create Bookings Table
    await pool.query(`
        CREATE TABLE IF NOT EXISTS bookings(
            id SERIAL PRIMARY KEY,
            customer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            vehicle_id INTEGER REFERENCES vehicles(id) ON DELETE CASCADE,
            rent_start_date TIMESTAMP NOT NULL,
            rent_end_date TIMESTAMP NOT NULL,
            total_price DECIMAL NOT NULL CHECK(total_price > 0),
            status VARCHAR(50) CHECK(status IN('active', 'cancelled', 'returned')) DEFAULT 'active'
        );
    `);

    console.log("Database tables initialized successfully");
};

export default initDB;