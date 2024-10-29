"use client";
import CardHorizontal from "@/components/cardHorizontal";
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/navbar";
import { ChevronRight } from "lucide-react";
import Filters from "@/components/filters";
import { FiltersProps } from "@/components/filters";

type Ad = {
    id: string,
    brand: string,
    model: string,
    price: number,
    photos: string[],
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

export default function Page() {
    const params = useParams<{ brand: string, model: string }>();
    const [ads, setAds] = useState<Array<Ad>>([]);
    const router = useRouter();
    const searchParams = useSearchParams();
    const [filters, setFilters] = useState<{
        brand?: string;
        model?: string;
        trim?: string;
        price__gte?: number;
        price__lte?: number;
        year__gte?: number;
        year__lte?: number;
        km__gte?: number;
        km__lte?: number;
        fuelType?: string;
    }>(() => {
        // Initialize filters from URL params and route params
        return {
            brand: params.brand,
            model: params.model,
            trim: searchParams.get('trim') || undefined,
            price__gte: Number(searchParams.get('price_min')) || undefined,
            price__lte: Number(searchParams.get('price_max')) || undefined,
            year__gte: Number(searchParams.get('year_min')) || undefined,
            year__lte: Number(searchParams.get('year_max')) || undefined,
            km__gte: Number(searchParams.get('km_min')) || undefined,
            km__lte: Number(searchParams.get('km_max')) || undefined,
            fuelType: searchParams.get('fuel_type') || undefined,
        };
    });

    const selectedFilter = searchParams.get('search[order]') || 'created_at:desc';

    const fetchAds = useCallback(async (filter: string) => {
        let query = supabase
            .from('listings')
            .select('*')
            .ilike('brand', params.brand)
            .ilike('model', params.model)
            .limit(10);

        // Apply filters to query
        if (filters.price__gte) query = query.gte('price', filters.price__gte);
        if (filters.price__lte) query = query.lte('price', filters.price__lte);
        if (filters.year__gte) query = query.gte('year', filters.year__gte);
        if (filters.year__lte) query = query.lte('year', filters.year__lte);
        if (filters.km__gte) query = query.gte('km', filters.km__gte);
        if (filters.km__lte) query = query.lte('km', filters.km__lte);
        if (filters.fuelType) query = query.eq('fuelType', filters.fuelType);

        const [column, order] = filter.split(':');
        query = query.order(column, { ascending: order === 'asc' });

        let { data: ads, error } = await query;
        if (error) console.log('error', error);
        setAds(ads || []);
    }, [params.brand, params.model, filters]);

    const handleFiltersChange = (newFilters: FiltersProps['filters']) => {
        setFilters(newFilters);

        // Update URL with new filters
        const url_params = new URLSearchParams(window.location.search);

        if (newFilters.price__gte) url_params.set('price_min', newFilters.price__gte.toString());
        else url_params.delete('price_min');

        if (newFilters.price__lte) url_params.set('price_max', newFilters.price__lte.toString());
        else url_params.delete('price_max');

        if (newFilters.year__gte) url_params.set('year_min', newFilters.year__gte.toString());
        else url_params.delete('year_min');

        if (newFilters.year__lte) url_params.set('year_max', newFilters.year__lte.toString());
        else url_params.delete('year_max');

        if (newFilters.km__gte) url_params.set('km_min', newFilters.km__gte.toString());
        else url_params.delete('km_min');

        if (newFilters.km__lte) url_params.set('km_max', newFilters.km__lte.toString());
        else url_params.delete('km_max');

        if (newFilters.fuelType) url_params.set('fuel_type', newFilters.fuelType);
        else url_params.delete('fuel_type');

        // Handle brand and model changes
        if (newFilters.brand && newFilters.brand !== params.brand) {
            router.push(`/${newFilters.brand}`);
            return;
        }

        if (newFilters.model && newFilters.model !== params.model) {
            router.push(`/${params.brand}/${newFilters.model}`);
            return;
        }

        router.push(`?${params.toString()}`);
    };

    useEffect(() => {
        fetchAds(selectedFilter);
    }, [selectedFilter, fetchAds]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newFilter = e.target.value;
        const params = new URLSearchParams(window.location.search);
        params.set('search[order]', newFilter);
        router.push(`?${params.toString()}`);
    };

    return (
        <div>
            <Navbar />

            <div className="mt-[4rem] container mx-auto max-w-6xl">
                {/* Filters */}
                <div className="flex items-center space-x-2 text-xs">
                    <a href="/" className="text-blue-600 hover:underline">Acasă</a>
                    <ChevronRight size={12} className="text-black/50" />
                    <a href={`/${params.brand}`} className="text-blue-600 hover:underline">{params.brand}</a>
                    <ChevronRight size={12} className="text-black/50" />
                    <span className="text-gray-500">{params.model}</span>
                </div>
                {/* Filters */}
                <Filters filters={filters} onChange={handleFiltersChange} />
                <div className="grid grid-rows-10 gap-3">
                    {ads.map((ad) => (
                        <CardHorizontal
                            key={ad.id}
                            listingId={ad.id}
                            id={ad.photos[0]}
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
        </div >
    );
}
