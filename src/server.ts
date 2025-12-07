import express, { NextFunction, Request, Response } from "express";
import initDB, { pool } from "./config/db";
import config from "./config";

const app = express();
const port = config.port;
// parser
app.use(express.json());
// app.use(express.urlencoded());

// initializing DB
initDB();


// Logger middleware
const logger = (req: Request, res: Response, next: NextFunction) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}\n`);
    next();
};

app.get("/", logger, (req: Request, res: Response) => {
    res.send("Hello Next Level Developers!");
});

// ==========================
// 1. USERS CRUD
// ==========================

app.post("/users", async (req: Request, res: Response) => {
    const { name, email, password, phone, role } = req.body;

    // Basic validation based on image requirements
    if (password && password.length < 6) {
        return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
    }
    if (role !== 'admin' && role !== 'customer') {
        return res.status(400).json({ success: false, message: "Role must be 'admin' or 'customer'" });
    }

    try {
        const result = await pool.query(
            `INSERT INTO users(name, email, password, phone, role) VALUES($1, $2, $3, $4, $5) RETURNING *`,
            [name, email.toLowerCase(), password, phone, role]
        );

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: result.rows[0],
        });
    } catch (err: any) {
        res.status(500).json({
            success: false,
            message: err.message,
        });
    }
});

app.get("/users", async (req: Request, res: Response) => {
    try {
        const result = await pool.query(`SELECT * FROM users`);
        res.status(200).json({
            success: true,
            message: "Users retrieved successfully",
            data: result.rows,
        });
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.get("/users/:id", async (req: Request, res: Response) => {
    try {
        const result = await pool.query(`SELECT * FROM users WHERE id = $1`, [req.params.id]);
        if (result.rows.length === 0) {
            res.status(404).json({ success: false, message: "User not found" });
        } else {
            res.status(200).json({ success: true, message: "User fetched successfully", data: result.rows[0] });
        }
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.put("/users/:id", async (req: Request, res: Response) => {
    const { name, email, phone, role } = req.body;
    try {
        // Note: We usually don't update passwords directly in a generic update route without hashing
        const result = await pool.query(
            `UPDATE users SET name=$1, email=$2, phone=$3, role=$4 WHERE id=$5 RETURNING *`,
            [name, email, phone, role, req.params.id]
        );

        if (result.rows.length === 0) {
            res.status(404).json({ success: false, message: "User not found" });
        } else {
            res.status(200).json({ success: true, message: "User updated successfully", data: result.rows[0] });
        }
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.delete("/users/:id", async (req: Request, res: Response) => {
    try {
        const result = await pool.query(`DELETE FROM users WHERE id = $1`, [req.params.id]);
        if (result.rowCount === 0) {
            res.status(404).json({ success: false, message: "User not found" });
        } else {
            res.status(200).json({ success: true, message: "User deleted successfully", data: null });
        }
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ==========================
// 2. VEHICLES CRUD
// ==========================

app.post("/vehicles", async (req: Request, res: Response) => {
    const { vehicle_name, type, registration_number, daily_rent_price, availability_status } = req.body;

    try {
        const result = await pool.query(
            `INSERT INTO vehicles(vehicle_name, type, registration_number, daily_rent_price, availability_status)
       VALUES($1, $2, $3, $4, $5) RETURNING *`,
            [vehicle_name, type, registration_number, daily_rent_price, availability_status || 'available']
        );

        res.status(201).json({
            success: true,
            message: "Vehicle added successfully",
            data: result.rows[0],
        });
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.get("/vehicles", async (req: Request, res: Response) => {
    try {
        const result = await pool.query(`SELECT * FROM vehicles`);
        res.status(200).json({
            success: true,
            message: "Vehicles retrieved successfully",
            data: result.rows,
        });
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.put("/vehicles/:id", async (req: Request, res: Response) => {
    const { vehicle_name, type, daily_rent_price, availability_status } = req.body;
    try {
        const result = await pool.query(
            `UPDATE vehicles SET vehicle_name=$1, type=$2, daily_rent_price=$3, availability_status=$4 WHERE id=$5 RETURNING *`,
            [vehicle_name, type, daily_rent_price, availability_status, req.params.id]
        );

        if (result.rows.length === 0) {
            res.status(404).json({ success: false, message: "Vehicle not found" });
        } else {
            res.status(200).json({ success: true, message: "Vehicle updated successfully", data: result.rows[0] });
        }
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.delete("/vehicles/:id", async (req: Request, res: Response) => {
    try {
        const result = await pool.query(`DELETE FROM vehicles WHERE id = $1`, [req.params.id]);
        if (result.rowCount === 0) {
            res.status(404).json({ success: false, message: "Vehicle not found" });
        } else {
            res.status(200).json({ success: true, message: "Vehicle deleted successfully", data: null });
        }
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ==========================
// 3. BOOKINGS CRUD
// ==========================

app.post("/bookings", async (req: Request, res: Response) => {
    const { customer_id, vehicle_id, rent_start_date, rent_end_date } = req.body;

    // 1. Validate dates
    const start = new Date(rent_start_date);
    const end = new Date(rent_end_date);

    if (end <= start) {
        return res.status(400).json({ success: false, message: "End date must be after start date" });
    }

    try {
        // 2. Fetch vehicle to get price and check availability
        const vehicleResult = await pool.query(`SELECT daily_rent_price, availability_status FROM vehicles WHERE id = $1`, [vehicle_id]);

        if (vehicleResult.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Vehicle not found" });
        }

        const vehicle = vehicleResult.rows[0];

        if (vehicle.availability_status !== 'available') {
            return res.status(400).json({ success: false, message: "Vehicle is currently not available" });
        }

        // 3. Calculate total price
        const durationInMs = end.getTime() - start.getTime();
        const durationInDays = Math.ceil(durationInMs / (1000 * 60 * 60 * 24));
        const total_price = durationInDays * parseFloat(vehicle.daily_rent_price);

        // 4. Create Booking
        const result = await pool.query(
            `INSERT INTO bookings(customer_id, vehicle_id, rent_start_date, rent_end_date, total_price, status)
       VALUES($1, $2, $3, $4, $5, 'active') RETURNING *`,
            [customer_id, vehicle_id, rent_start_date, rent_end_date, total_price]
        );

        // Optional: Update vehicle status to 'booked'
        await pool.query(`UPDATE vehicles SET availability_status = 'booked' WHERE id = $1`, [vehicle_id]);

        res.status(201).json({
            success: true,
            message: "Booking created successfully",
            data: result.rows[0],
        });
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.get("/bookings", async (req: Request, res: Response) => {
    try {
        const result = await pool.query(`SELECT * FROM bookings`);
        res.status(200).json({
            success: true,
            message: "Bookings retrieved successfully",
            data: result.rows,
        });
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Update booking status (e.g., when returning a vehicle)
app.put("/bookings/:id/return", async (req: Request, res: Response) => {
    try {
        // Update booking status
        const result = await pool.query(
            `UPDATE bookings SET status = 'returned' WHERE id = $1 RETURNING *`,
            [req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Booking not found" });
        }

        // Make vehicle available again
        const vehicleId = result.rows[0].vehicle_id;
        await pool.query(`UPDATE vehicles SET availability_status = 'available' WHERE id = $1`, [vehicleId]);

        res.status(200).json({
            success: true,
            message: "Vehicle returned successfully",
            data: result.rows[0]
        });

    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// 404 Handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found",
        path: req.path,
    });
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});