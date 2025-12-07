export type TCreateBookingPayload = {
    customer_id: string; // or number, depending on your user ID type
    vehicle_id: number;
    rent_start_date: string;
    rent_end_date: string;
};