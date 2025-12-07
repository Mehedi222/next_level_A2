import express from 'express';
import { bookingControllers } from './booking.controller';

const router = express.Router();

router.post("/", bookingControllers.createBooking);
router.get("/", bookingControllers.getAllBookings);
// Specific route for returning a vehicle
router.put("/:id/return", bookingControllers.returnBooking);

export const bookingRoutes = router;