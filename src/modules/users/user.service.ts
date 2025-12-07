import { pool } from "../../config/db";
import { TUser } from "./user.interface";
import bcrypt from 'bcryptjs';
// Create User
const createUserIntoDB = async (userData: TUser) => {
    const { name, email, password, phone, role } = userData;

    // 1. Guard clause: Ensure password exists
    if (!password) {
        throw new Error("Password is required for user creation");
    }

    // Now TypeScript knows 'password' is definitely a string
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
        `INSERT INTO users(name, email, password, phone, role) VALUES($1, $2, $3, $4, $5) RETURNING *`,
        [name, email.toLowerCase(), hashedPassword, phone, role]
    );
    return result.rows[0];
};

// Get All Users
const getAllUsersFromDB = async () => {
    const result = await pool.query(`SELECT * FROM users`);
    return result.rows;
};

// Get Single User
const getSingleUserFromDB = async (id: number) => {
    const result = await pool.query(`SELECT * FROM users WHERE id = $1`, [id]);
    // Returns the user object or undefined if not found
    return result.rows[0];
};

// Update User
const updateUserInDB = async (id: number, userData: Partial<TUser>) => {
    const { name, email, phone, role } = userData;
    // We explicitly check if the user exists via the UPDATE RETURNING clause
    const result = await pool.query(
        `UPDATE users SET name=$1, email=$2, phone=$3, role=$4 WHERE id=$5 RETURNING *`,
        [name, email, phone, role, id]
    );

    // Returns the updated user or undefined if the ID didn't exist
    return result.rows[0];
};

// Delete User
const deleteUserFromDB = async (id: number) => {
    const result = await pool.query(`DELETE FROM users WHERE id = $1`, [id]);
    // Return the rowCount to know if anything was actually deleted
    return result.rowCount;
};

export const userServices = {
    createUserIntoDB,
    getAllUsersFromDB,
    getSingleUserFromDB,
    updateUserInDB,
    deleteUserFromDB,
};