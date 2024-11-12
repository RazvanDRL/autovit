import judete from "./judete.json";

const fetchOrase = async () => {
    try {
        // const results = await Promise.all(
        //     judete.map(async (judet) => {
        //         const response = await fetch(`https://roloca.coldfuse.io/orase/${judet.auto}`);
        //         if (!response.ok) {
        //             throw new Error(`HTTP error! status: ${response.status}`);
        //         }
        //         const data = await response.json();
        //         console.log(data);
        //         return { judet, orase: data };
        //     })
        // );
        // return results;

        const response = await fetch("https://roloca.coldfuse.io/orase/AR");
        const data = await response.json();
        console.log(data);
    } catch (error) {
        console.error("Error fetching cities:", error);
        return [];
    }
};

fetchOrase();