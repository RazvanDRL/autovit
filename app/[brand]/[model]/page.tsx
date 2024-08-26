"use client";
import Card from "@/components/card";
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type Ad = {
    id: string,
    brand: string,
    model: string,
    price: number,
    engine_size: number,
    power: number,
    km: number,
    fuelType: string,
    year: number,
    location: string,
    description: string
};

const filterOptions = [
    { label: "Recomandate", value: "created_at:desc" },
    { label: "Noi", value: "created_at:asc" },
    { label: "Ieftine", value: "price:asc" },
    { label: "Scumpe", value: "price:desc" },
    { label: "Cel mai mic kilometraj", value: "km:asc" },
    { label: "Cel mai mare kilometraj", value: "km:desc" },
    { label: "Cea mai mica putere", value: "power:asc" },
    { label: "Cea mai mare putere", value: "power:desc" },
];

export default function Page({ params }: { params: { brand: string, model: string } }) {
    const [ads, setAds] = useState<Array<Ad>>([]);
    const router = useRouter();
    const searchParams = useSearchParams();

    const selectedFilter = searchParams.get('search[order]') || 'created_at:desc';

    async function fetchAds(filter: string) {
        let query = supabase
            .from('anunt')
            .select('*')
            .ilike('brand', params.brand)
            .ilike('model', params.model)
            .limit(10);

        const [column, order] = filter.split(':');
        query = query.order(column, { ascending: order === 'asc' });

        let { data: ads, error } = await query;
        if (error) console.log('error', error);
        setAds(ads || []);
    }

    useEffect(() => {
        fetchAds(selectedFilter);
    }, [selectedFilter, params.brand, params.model]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newFilter = e.target.value;
        router.push(`?search[order]=${encodeURIComponent(newFilter)}`);
    };

    return (
        <div>
            <div className="container mx-auto">
                <div className="flex justify-end p-4">
                    <select
                        value={selectedFilter}
                        onChange={handleFilterChange}
                        className="p-2 border rounded"
                    >
                        {filterOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="grid grid-rows-10 gap-3">
                    {ads.map((ad) => (
                        <Card
                            key={ad.id}
                            id={ad.brand}
                            className="row-span-1"
                            title={ad.brand + " " + ad.model}
                            price={ad.price}
                            engine_size={ad.engine_size}
                            power={ad.power}
                            km={ad.km}
                            fuelType={ad.fuelType}
                            year={ad.year}
                            location={ad.location}
                            description={ad.description}
                            date="Reactualizat acum 2 zile"
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
