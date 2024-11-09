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
    year: number,
    location: string,
    description: string,
    short_description: string,
    created_at?: string,
    photos: string[],
    user_full_name: string,
    user_phone: string,
    is_company: boolean,
}
