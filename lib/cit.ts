import cities from './cities.json';
import { County } from './index';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);

export const fetchAllCities = async () => {
  try {
    const allCities: { [key: string]: County[] } = {};
    
    for (const city of cities) {
      const cityData = await fetch(`https://roloca.coldfuse.io/orase/${city.auto}`);
      
      if (!cityData.ok) {
        throw new Error(`HTTP error! status: ${cityData.status}`);
      }
      
      const data: County[] = await cityData.json();
      allCities[city.auto] = data.filter(county => !county.comuna).map(county => ({
        ...county,
        nume: county.simplu || county.nume
      }));
    }
    
    return allCities;
  } catch (error) {
    console.error("Error fetching all cities:", error);
    return {};
  }
};

export const addCitiesToSupabase = async (supabase: any) => {
  try {
    const cities = await fetchAllCities();
    
    for (const [countyCode, cityList] of Object.entries(cities)) {
      for (const city of cityList) {
        const { error } = await supabase
          .from('cities')
          .upsert({
            county_code: countyCode,
            name: city.simplu || city.nume
          })

        if (error) {
          console.error(`Error adding city ${city.nume}:`, error);
        }
      }
    }

    console.log('Successfully added all cities to Supabase');
  } catch (error) {
    console.error('Error adding cities to Supabase:', error);
  }
};

addCitiesToSupabase(supabase);