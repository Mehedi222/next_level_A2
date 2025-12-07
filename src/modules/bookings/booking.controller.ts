import { Request, Response } from "express";
import { bookingServices } from "./booking.service";

const createBooking = async (req: Request, res: Response) => {
    try {
        const result = await bookingServices.createBookingIntoDB(req.body);

        res.status(201).json({
            success: true,
            message: "Booking created successfully",
            data: result,
        });
    } catch (err: any) {
        // If the service throws an error (e.g. "Vehicle not found"), we send 400 or 500
        // Simple error handling for now:
        res.status(400).json({ success: false, message: err.message });
    }
};

const getAllBookings = async (req: Request, res: Response) => {
    try {
        const result = await bookingServices.getAllBookingsFromDB();
        res.status(200).json({
            success: true,
            message: "Bookings retrieved successfully",
            data: result,
        });
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const returnBooking = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // We assume ID is a number (integer)
        const result = await bookingServices.returnBookingInDB(Number(id));

        if (!result) {
            return res.status(404).json({ success: false, message: "Booking not found" });
        }

        res.status(200).json({
            success: true,
            message: "Vehicle returned successfully",
            data: result
        });
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const bookingControllers = {
    createBooking,
    getAllBookings,
    returnBooking,
};