const NUM_MOCKS = 1;

import { supabaseAdmin } from "@/lib/supabaseAdmin";

const brands = ['BMW', 'Mercedes', 'Audi', 'Toyota', 'Ford'];
const models: { [key: string]: string[] } = {
    BMW: ['3 Series', '5 Series', 'X5', 'i8'],
    Mercedes: ['C-Class', 'E-Class', 'S-Class', 'GLE'],
    Audi: ['A4', 'A6', 'Q5', 'e-tron'],
    Toyota: ['Corolla', 'Camry', 'RAV4', 'Prius'],
    Ford: ['Focus', 'Mustang', 'Explorer', 'F-150']
};
const fuelTypes = ['Petrol', 'Diesel', 'Electric', 'Hybrid'];
const locations = ['Bucharest', 'Cluj-Napoca', 'Timisoara', 'Constanta', 'Iasi'];
const descriptions = [
    'Impecable condition, full service history.',
    'Well-maintained, low mileage.',
    'One owner, accident-free.',
    'Recently serviced, new tires.',
    'Garage kept, no rust.'
];

function getRandomItem(arr: any) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function generateMockData() {
    const brand = getRandomItem(brands);
    const model = getRandomItem(models[brand]);

    return {
        brand: brand,
        model: model,
        price: Math.floor(Math.random() * 30000) + 5000, // între 5.000 și 35.000
        engine_size: Math.floor(Math.random() * 2000) + 1000, // între 1.000 și 3.000
        power: Math.floor(Math.random() * 400) + 100, // între 100 și 500
        km: Math.floor(Math.random() * 200000) + 5000, // între 5.000 și 205.000
        fuelType: getRandomItem(fuelTypes),
        year: Math.floor(Math.random() * 20) + 2000, // între 2000 și 2020
        location: getRandomItem(locations),
        descriere: getRandomItem(descriptions)
    };
}

async function insertMockData() {
    const mockData = generateMockData();

    const { data, error } = await supabaseAdmin
        .from('anunt')
        .insert([mockData]);

    if (error) {
        console.error('Error inserting mock data:', error);
    } else {
        console.log('Mock data inserted successfully:', data);
    }
}
function main() {
    for (let i = 0; i < NUM_MOCKS; i++) {
        insertMockData();
    }
}

main();
