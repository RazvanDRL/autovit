"use client";
import CardHorizontal from "@/components/cardHorizontal";
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/navbar";
import Breadcrumb from "@/components/breadcrumb";
import { Ad, FuelType, BodyType } from "@/types/schema";
import CarSearch from "@/components/CarSearch";
import Footer from "@/components/footer";
import { carBrands } from "@/lib/carBrands";

export default function Page() {
    const params = useParams<{ brand: string, model: string }>();
    const searchParams = useSearchParams();
    const [ads, setAds] = useState<Array<Ad>>([]);
    const [brand, setBrand] = useState(params.brand);
    const [model, setModel] = useState(decodeURIComponent(params.model));
    const [year, setYear] = useState(searchParams.get('year') || "");
    const [price, setPrice] = useState(searchParams.get('price') || "");
    const [fuelType, setFuelType] = useState<FuelType | null>(searchParams.get('fuel_type') as FuelType || null);
    const [bodyType, setBodyType] = useState<BodyType | null>(searchParams.get('body_type') as BodyType || null);
    const [availableModels, setAvailableModels] = useState<{ value: string, label: string, id: number, group?: boolean }[]>([]);
    const router = useRouter();
    const [sortOrder, setSortOrder] = useState(searchParams.get('sort') || 'created_at:desc');
    const [currentPage, setCurrentPage] = useState(Number(searchParams.get('page')) || 1);
    const itemsPerPage = 24;

    const sortOptions = [
        { value: 'created_at:desc', label: 'Cele mai noi' },
        { value: 'created_at:asc', label: 'Cele mai vechi' },
        { value: 'price:asc', label: 'Preț: Crescător' },
        { value: 'price:desc', label: 'Preț: Descrescător' },
        { value: 'km:asc', label: 'Kilometri: Crescător' },
        { value: 'km:desc', label: 'Kilometri: Descrescător' },
        { value: 'year:desc', label: 'An: Nou spre vechi' },
        { value: 'year:asc', label: 'An: Vechi spre nou' },
    ];

    const fetchAds = useCallback(async (filter: string) => {
        const modelIsGroup = availableModels.find(m => m.value === decodeURIComponent(params.model))?.group;

        let query = supabase
            .from('listings')
            .select('*')
            .ilike('brand', params.brand)
            .ilike(modelIsGroup ? 'group' : 'model', decodeURIComponent(params.model))
            .range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage - 1);

        if (price) {
            query = query.lte('price', price.replace(/[^0-9]/g, ''));
        }

        if (year) {
            query = query.lte('year', year);
        }

        if (fuelType) {
            query = query.eq('fuel_type', fuelType);
        }

        if (bodyType) {
            query = query.eq('body_type', bodyType);
        }

        // Add sorting
        const [column, order] = filter.split(':');
        query = query.order(column, { ascending: order === 'asc' });

        let { data: ads, error } = await query;
        if (error) console.log('error', error);
        setAds(ads || []);
    }, [params.brand, params.model, price, year, fuelType, bodyType, availableModels, currentPage]);

    useEffect(() => {
        fetchAds(sortOrder);
    }, [sortOrder, fetchAds, params.brand, params.model, price, year, fuelType, bodyType, availableModels, currentPage]);

    useEffect(() => {
        // Don't update URL during initial render
        if (!params.brand || !params.model) return;

        const searchParams = new URLSearchParams();
        if (price) searchParams.append('price', price);
        if (year) searchParams.append('year', year);
        if (fuelType) searchParams.append('fuel_type', fuelType);
        if (bodyType) searchParams.append('body_type', bodyType);
        if (sortOrder) searchParams.append('sort', sortOrder);
        if (currentPage > 1) searchParams.append('page', currentPage.toString());

        const queryString = searchParams.toString();
        const url = `/${brand}/${encodeURIComponent(model)}${queryString ? `?${queryString}` : ''}`;

        router.replace(url, { scroll: false });
    }, [price, year, fuelType, bodyType, sortOrder, brand, model, router, params.brand, params.model, currentPage]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        // The URL update is now handled by the useEffect above
    };

    // Fetch available models when brand changes
    useEffect(() => {
        const fetchModels = async () => {
            if (!brand) {
                setAvailableModels([]);
                return;
            }
            // @dev use brand id here
            try {
                const { data: modelsData, error } = await supabase
                    .from('models')
                    .select('data')
                    .eq('value', carBrands.find(b => b.label === brand)?.value)
                    .single();

                if (error) {
                    console.error('Error fetching models:', error);
                    return;
                }

                if (modelsData?.data) {
                    const uniqueModels = new Map();
                    modelsData.data.forEach((model: any) => {
                        const key = `${model.displayName}_${model.id}`;
                        uniqueModels.set(key, {
                            value: model.displayName,
                            label: model.displayName,
                            id: model.id,
                            group: model.group || false
                        });
                    });
                    setAvailableModels(Array.from(uniqueModels.values()));
                }
            } catch (error) {
                console.error('Error in fetchModels:', error);
            }
        };

        fetchModels();
    }, [brand]);

    return (
        <div>
            <Navbar />
            <div className="mt-[4rem] container mx-auto max-w-6xl px-4 sm:px-6">
                <Breadcrumb brand={params.brand} model={decodeURIComponent(params.model)} />
                <div className="w-full my-8">
                    <CarSearch
                        brand={brand}
                        setBrand={setBrand}
                        model={model}
                        setModel={setModel}
                        price={price}
                        setPrice={setPrice}
                        year={year}
                        setYear={setYear}
                        fuelType={fuelType as FuelType}
                        setFuelType={setFuelType}
                        bodyType={bodyType as BodyType}
                        setBodyType={setBodyType}
                        availableModels={availableModels}
                        onSubmit={handleSearch}
                    />
                </div>
                <div className="flex justify-end mb-4">
                    <select
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value)}
                        className="px-4 py-2 border rounded-md bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {sortOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="grid grid-rows-3 gap-3">
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
                            fuelType={ad.fuel_type}
                            year={ad.year}
                            location={ad.location_city + ", " + ad.location_county}
                            description={ad.short_description}
                            created_at={ad.created_at}
                            is_company={ad.is_company}
                        />
                    ))}
                </div>
                <div className="flex justify-center my-8">
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 mr-2 border rounded-md disabled:opacity-50"
                    >
                        Previous
                    </button>
                    <span className="px-4 py-2">Page {currentPage}</span>
                    <button
                        onClick={() => setCurrentPage(prev => prev + 1)}
                        disabled={ads.length < itemsPerPage}
                        className="px-4 py-2 ml-2 border rounded-md disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            </div>
            <Footer />
        </div>
    );
}
