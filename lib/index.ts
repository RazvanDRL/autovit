export interface County {
    nume: string;
    simplu?: string;
    comuna?: string;
}

export const fetchCounties = async (countyCode: string) => {
    try {
        const response = await fetch(`https://roloca.coldfuse.io/orase/${countyCode}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: County[] = await response.json();
        return data.filter(county => !county.comuna).map(county => ({
            ...county,
            nume: county.simplu || county.nume
        }));
    } catch (error) {
        console.error("Error fetching counties:", error);
        return [];
    }
};