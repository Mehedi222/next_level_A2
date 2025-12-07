import { Request, Response } from "express";
import { vehicleServices } from "./vehicle.service";

const createVehicle = async (req: Request, res: Response) => {
    try {
        const result = await vehicleServices.createVehicleIntoDB(req.body);

        res.status(201).json({
            success: true,
            message: "Vehicle added successfully",
            data: result,
        });
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const getAllVehicles = async (req: Request, res: Response) => {
    try {
        const result = await vehicleServices.getAllVehiclesFromDB();

        res.status(200).json({
            success: true,
            message: "Vehicles retrieved successfully",
            data: result,
        });
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const updateVehicle = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = await vehicleServices.updateVehicleInDB(Number(id), req.body);

        if (!result) {
            return res.status(404).json({ success: false, message: "Vehicle not found" });
        }

        res.status(200).json({
            success: true,
            message: "Vehicle updated successfully",
            data: result,
        });
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const deleteVehicle = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = await vehicleServices.deleteVehicleFromDB(Number(id));

        if (!result) {
            return res.status(404).json({ success: false, message: "Vehicle not found" });
        }

        res.status(200).json({
            success: true,
            message: "Vehicle deleted successfully",
            data: null,
        });
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const vehicleControllers = {
    createVehicle,
    getAllVehicles,
    updateVehicle,
    deleteVehicle,
};