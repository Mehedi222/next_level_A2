import { Request, Response } from "express";
import { userServices } from "./user.service";

// Create User
const createUser = async (req: Request, res: Response) => {
    try {
        // Validation logic should go here or in a middleware

        const result = await userServices.createUserIntoDB(req.body);

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: result,
        });
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Get All Users
const getAllUsers = async (req: Request, res: Response) => {
    try {
        const result = await userServices.getAllUsersFromDB();
        res.status(200).json({
            success: true,
            message: "Users retrieved successfully",
            data: result,
        });
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Get Single User
const getSingleUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // FIX: Convert string 'id' to Number
        // FIX: Removed invalid syntax "id: string" from the call
        const result = await userServices.getSingleUserFromDB(Number(id));

        if (!result) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.status(200).json({
            success: true,
            message: "User fetched successfully",
            data: result,
        });
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Update User
const updateUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updatedData = req.body;

        // FIX: Convert string 'id' to Number
        const result = await userServices.updateUserInDB(Number(id), updatedData);

        if (!result) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.status(200).json({
            success: true,
            message: "User updated successfully",
            data: result,
        });
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Delete User
const deleteUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // FIX: Convert string 'id' to Number
        const result = await userServices.deleteUserFromDB(Number(id));

        // If rowCount is 0 or null, no user was deleted
        if (!result) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.status(200).json({
            success: true,
            message: "User deleted successfully",
            data: null,
        });
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const userControllers = {
    createUser,
    getAllUsers,
    getSingleUser,
    updateUser,
    deleteUser,
};