const NUM_MOCKS = process.argv[2] ? parseInt(process.argv[2]) : 10;
const OPTION = process.argv[3] ? parseInt(process.argv[3]) : 2;

import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { carBrands } from "@/lib/carBrands";
import { faker } from '@faker-js/faker/locale/ro';
import { v4 as uuidv4 } from 'uuid';

function getRandomItem<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}



const fuelTypes = ["Benzină", "Motorină", "Hibrid", "Electric", "GPL"];
const transmissionTypes = ["Manuală", "Automată", "Semi-automată"];
const counties = ["București", "Cluj", "Iași", "Timiș", "Brașov", "Constanța"];
const cities = {
    "București": ["Sector 1", "Sector 2", "Sector 3", "Sector 4", "Sector 5", "Sector 6"],
    "Cluj": ["Cluj-Napoca", "Turda", "Dej", "Câmpia Turzii"],
    "Iași": ["Iași", "Pașcani", "Hârlău", "Târgu Frumos"],
    "Timiș": ["Timișoara", "Lugoj", "Sânnicolau Mare"],
    "Brașov": ["Brașov", "Făgăraș", "Săcele", "Codlea"],
    "Constanța": ["Constanța", "Mangalia", "Medgidia", "Năvodari"]
};

async function generateMockData() {
    const brand = carBrands.find(b => b.value === "3500");
    if (!brand) {
        throw new Error("Brand not found");
    }
    const brandId = parseInt(brand.value);

    // Fetch models for the selected brand
    const { data: modelsData, error } = await supabaseAdmin
        .from('models')
        .select('data')
        .eq('value', brand.value)
        .single();

    if (error) {
        console.error('Error fetching models:', error);
        throw error;
    }

    // Get a random model from the fetched data
    let modelName = faker.vehicle.model(); // fallback
    let modelId = faker.number.int({ min: 1, max: 1000 }); // fallback

    if (modelsData?.data && modelsData.data.length > 0) {
        const randomModel = getRandomItem(modelsData.data) as { displayName: string; id: number };
        modelName = randomModel.displayName;
        modelId = randomModel.id;
    }

    const county = getRandomItem(Object.keys(cities));
    const city = getRandomItem(cities[county as keyof typeof cities]);

    const year = faker.number.int({ min: 2000, max: 2024 });
    const km = faker.number.int({ min: 0, max: 300000 });
    const engineSize = faker.number.int({ min: 998, max: 5000 });
    const power = faker.number.int({ min: 65, max: 500 });
    const price = faker.number.int({ min: 2000, max: 100000 });
    const photos = ["84838f87-dbbe-4994-84be-ffe71618d225", "c75bdec3-42e9-4bab-8e81-84a1235f4ac8", "23912da5-8f3a-40bb-8989-be19a1169add", "823db91e-4eab-4af9-8b66-31b0a2edb398", "a127d00d-c5b6-4ec5-90af-e11451798b96", "c274d6d8-8e87-4849-9000-2f26618412a6", "9b284efb-b9f6-40d8-8fd4-16d5f07bd983", "07356b7d-6289-429d-ae15-4f3c6ba49c7e", "f9b343e4-1ead-4bad-bdd4-245b82aa12b7"];

    return {
        user_id: "6a6a37a7-46d5-4ab3-9b7e-1d7fe2a388ab",
        brand: brand.label,
        model: modelName,
        price: price,
        engine_size: engineSize,
        power: power,
        km: km,
        fuel_type: getRandomItem(fuelTypes),
        transmission: getRandomItem(transmissionTypes),
        year: year,
        location_city: city,
        location_county: county,
        description: faker.lorem.paragraphs(3),
        short_description: faker.lorem.sentence(),
        photos: photos,
        vin: faker.vehicle.vin(),
        doors: faker.helpers.arrayElement(['2', '3', '4', '5']),
        user_full_name: faker.person.fullName(),
        user_phone: faker.phone.number({ style: "human" }),
        is_company: faker.datatype.boolean(),
        brand_id: brandId,
        model_id: modelId,
        created_at: new Date().toISOString()
    };
}

async function insertMockData() {
    const mockData = await generateMockData();

    if (OPTION == 1) {
        for (let i = 0; i < NUM_MOCKS; i++) {
            const { data, error } = await supabaseAdmin
                .from('listings')
                .insert([mockData]);

            if (error) {
                console.error('Error inserting mock data:', error);
            } else {
                console.log('Mock data inserted successfully:', data);
            }
        }
    } else if (OPTION == 2) {
        const { data, error } = await supabaseAdmin
            .from('listings')
            .insert([mockData]);

        if (error) {
            console.error('Error inserting mock data:', error);
        } else {
            console.log('Mock data inserted successfully:', data);
        }
    }

    
}

async function main() {
    console.log(`Inserting ${NUM_MOCKS} mock listings...`);

    if (OPTION == 1) {
        await insertMockData();

    } else if (OPTION == 2) {
        for (let i = 0; i < NUM_MOCKS; i++) {
            await insertMockData();
        }
    }

    console.log('Mock data insertion completed');
}

main();
