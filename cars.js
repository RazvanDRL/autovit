const brands = require('./brands.json');

async function fetchModelsForBrand(brand) {
    const url = `https://www.carqueryapi.com/api/0.3/?cmd=getModels&make=${encodeURIComponent(brand)}`;
    const response = await fetch(url);
    const data = await response.json();
    return data.Models;
}

async function main() {
    const allModels = {};

    for (const brand of brands) {
        try {
            const models = await fetchModelsForBrand(brand);
            allModels[brand] = models.map(model => model.model_name); // Extracting the model names
            console.log(`Fetched ${models.length} models for brand: ${brand}`);
        } catch (error) {
            console.error(`Error fetching models for brand: ${brand}`, error);
        }
    }

    console.log(allModels);
}

main();
