import { Request, Response } from 'express';
import { authServices } from './auth.service';

const handleRegister = async (req: Request, res: Response) => {
    try {
        const result = await authServices.registerUser(req.body);

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: result,
        });
    } catch (err: any) {
        res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};

const handleLogin = async (req: Request, res: Response) => {
    try {
        const result = await authServices.loginUser(req.body);

        res.status(200).json({
            success: true,
            message: 'User logged in successfully',
            data: result,
        });
    } catch (err: any) {
        // If user not found or password wrong, send 401 Unauthorized
        const statusCode = (err.message === 'User does not exist' || err.message === 'Password is incorrect')
            ? 401
            : 500;

        res.status(statusCode).json({
            success: false,
            message: err.message,
        });
    }
};

export const authControllers = {
    handleRegister,
    handleLogin,
};