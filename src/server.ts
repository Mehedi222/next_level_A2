import express, { NextFunction, Request, Response } from "express";
import initDB, { pool } from "./config/db";
import config from "./config";
import logger from "./middleware/logger";
import { userRoutes } from "./modules/users/user.routes";
import { vehicleRoutes } from "./modules/vehicles/vehicle.route";
import { bookingRoutes } from "./modules/bookings/booking.routes";
import { authRoutes } from "./modules/auth/auth.routers";

const app = express();
const port = config.port;
// parser
app.use(express.json());
// app.use(express.urlencoded());

// initializing DB
initDB();


// Logger middleware



app.get("/", logger, (req: Request, res: Response) => {
    res.send("Hello Next Level Developers!");
});

// ==========================
// 1. USERS CRUD
// ==========================
app.use("/users", userRoutes);
// ==========================
// 2. VEHICLES CRUD
// ==========================
app.use("/vehicles", vehicleRoutes);
// ==========================
// 3. BOOKINGS CRUD
// ==========================
app.use("/bookings", bookingRoutes);
//auth routes
app.use('/api/v1/auth', authRoutes);

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