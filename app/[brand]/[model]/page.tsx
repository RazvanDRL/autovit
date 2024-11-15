"use client";
import CardHorizontal from "@/components/cardHorizontal";
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/navbar";
import Breadcrumb from "@/components/breadcrumb";
import { Ad } from "@/types/schema";
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
    const [fuelType, setFuelType] = useState(searchParams.get('fuel_type') || "");
    const [bodyType, setBodyType] = useState(searchParams.get('body_type') || "");
    const [availableModels, setAvailableModels] = useState<{ value: string, label: string }[]>([]);
    const router = useRouter();
    // Get query parameters
    const sortOrder = searchParams.get('sort') || 'created_at:desc';

    const fetchAds = useCallback(async (filter: string) => {
        let query = supabase
            .from('listings')
            .select('*')
            .ilike('brand', params.brand)
            .ilike('model', decodeURIComponent(params.model))
            .limit(10);

        if (price) {
            query = query.gte('price', price);
        }

        if (year) {
            query = query.gte('year', year);
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
    }, [params.brand]);

    useEffect(() => {
        fetchAds(sortOrder);
    }, [sortOrder, fetchAds]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();

        // Create URLSearchParams object for query parameters
        const searchParams = new URLSearchParams();

        // Add non-empty parameters
        if (price) searchParams.append('price', price);
        if (year) searchParams.append('year', year);
        if (fuelType) searchParams.append('fuel_type', fuelType);
        if (bodyType) searchParams.append('body_type', bodyType);
        if (sortOrder) searchParams.append('sort', sortOrder);
        // Construct the URL with query parameters
        const queryString = searchParams.toString();
        const url = `/${brand}/${encodeURIComponent(model)}${queryString ? `?${queryString}` : ''}`;

        router.push(url);
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
                        fuelType={fuelType}
                        setFuelType={setFuelType}
                        bodyType={bodyType}
                        setBodyType={setBodyType}
                        availableModels={availableModels}
                        onSubmit={handleSearch}
                    />
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
            </div>
            <Footer />
        </div>
    );
}
