export type _Book = {
    title: string;
    authors: string[];
    publication_year: number;
    ratings_count: number;
    average_rating: number;
};

export type Ad = {
    id: string,
    user_id: string,
    brand: string,
    model: string,
    price: number,
    engine_size: number,
    power: number,
    km: number,
    fuel_type: string,
    body_type: string,
    year: number,
    location_city: string,
    location_county: string,
    description: string,
    short_description: string,
    created_at: string,
    photos: string[],
    user_full_name: string,
    user_phone: string,
    is_company: boolean,
    brand_id: number,
    model_id: number,
}

export type BodyType = "Sedan" | "Hatchback" | "SUV" | "Coupe" | "Cabriolet" | "Pickup"; 
export type FuelType = "Diesel" | "Benzina" | "Electric" | "Hybrid";

export const body_types = ["Sedan", "Hatchback", "SUV", "Coupe", "Cabriolet", "Pickup"] as const;
export const fuel_types = ["Diesel", "Benzina", "Electric", "Hybrid"] as const;