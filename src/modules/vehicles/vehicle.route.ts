import express from 'express';
import { vehicleControllers } from './vehicle.controller';

const router = express.Router();

router.post("/", vehicleControllers.createVehicle);
router.get("/", vehicleControllers.getAllVehicles);
router.put("/:id", vehicleControllers.updateVehicle);
router.delete("/:id", vehicleControllers.deleteVehicle);

export const vehicleRoutes = router;