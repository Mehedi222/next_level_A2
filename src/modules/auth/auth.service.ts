import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../../config/db';
import { userServices } from '../users/user.service';
import { TUser } from '../users/user.interface';
import { TLoginUser } from './auth.interface';

// 1. Register User
// We reuse the existing createUserIntoDB because it already handles password hashing!
const registerUser = async (payload: TUser) => {
    const result = await userServices.createUserIntoDB(payload);
    return result;
};

// 2. Login User
const loginUser = async (payload: TLoginUser) => {
    const { email, password } = payload;

    // A. Check if user exists
    const result = await pool.query(`SELECT * FROM users WHERE email = $1`, [email.toLowerCase()]);
    const user = result.rows[0];

    if (!user) {
        throw new Error('User does not exist');
    }

    // B. Compare password (Plain text vs Hash)
    const isPasswordMatched = await bcrypt.compare(password, user.password);

    if (!isPasswordMatched) {
        throw new Error('Password is incorrect');
    }

    // C. Create JWT Token
    // Ensure you have JWT_ACCESS_SECRET in your .env file
    const jwtPayload = {
        id: user.id,
        role: user.role,
        email: user.email
    };

    const accessToken = jwt.sign(
        jwtPayload,
        process.env.JWT_ACCESS_SECRET as string,
        { expiresIn: '1d' }
    );

    const { password: _, ...userData } = user;

    return {
        user: userData,
        accessToken,
    };
};

export const authServices = {
    registerUser,
    loginUser,
};