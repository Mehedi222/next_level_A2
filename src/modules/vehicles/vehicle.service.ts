import { pool } from "../../config/db";
import { TVehicle } from "./vehicle.interface";

// Create Vehicle
const createVehicleIntoDB = async (payload: TVehicle) => {
    const { vehicle_name, type, registration_number, daily_rent_price, availability_status } = payload;

    const result = await pool.query(
        `INSERT INTO vehicles(vehicle_name, type, registration_number, daily_rent_price, availability_status)
     VALUES($1, $2, $3, $4, $5) RETURNING *`,
        [vehicle_name, type, registration_number, daily_rent_price, availability_status || 'available']
    );

    return result.rows[0];
};

// Get All Vehicles
const getAllVehiclesFromDB = async () => {
    const result = await pool.query(`SELECT * FROM vehicles`);
    return result.rows;
};

// Update Vehicle
const updateVehicleInDB = async (id: number, payload: Partial<TVehicle>) => {
    const { vehicle_name, type, daily_rent_price, availability_status } = payload;

    // Note: Your original code didn't update 'registration_number', so I kept that pattern
    const result = await pool.query(
        `UPDATE vehicles
     SET vehicle_name=$1, type=$2, daily_rent_price=$3, availability_status=$4
     WHERE id=$5 RETURNING *`,
        [vehicle_name, type, daily_rent_price, availability_status, id]
    );

    return result.rows[0];
};

// Delete Vehicle
const deleteVehicleFromDB = async (id: number) => {
    const result = await pool.query(`DELETE FROM vehicles WHERE id = $1`, [id]);
    return result.rowCount;
};

export const vehicleServices = {
    createVehicleIntoDB,
    getAllVehiclesFromDB,
    updateVehicleInDB,
    deleteVehicleFromDB,
};