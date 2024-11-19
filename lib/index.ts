import { supabase } from "./supabaseClient";

export interface County {
    nume: string;
    simplu?: string;
    comuna?: string;
}

export const fetchCounties = async (countyCode: string) => {
    try {
        const { data, error } = await supabase
            .from('cities')
            .select('name')
            .eq('county_code', countyCode);

        if (error) throw error;

        return data.map(city => ({
            nume: city.name,
            simplu: city.name
        }));
    } catch (error) {
        console.error("Error fetching counties:", error);
        return [];
    }
};