export type TVehicle = {
    vehicle_name: string;
    type: string;
    registration_number: string;
    daily_rent_price: number;
    availability_status?: 'available' | 'rented' | 'maintenance'; // Optional with default
};