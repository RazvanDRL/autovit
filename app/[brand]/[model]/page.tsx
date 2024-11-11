"use client";
import CardHorizontal from "@/components/cardHorizontal";
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/navbar";
import Breadcrumb from "@/components/breadcrumb";
import { useQueryState } from "nuqs";
import { Ad } from "@/types/schema";
import DropdownSelect from "@/components/dropdownSelect";
import { carBrands } from "@/lib/carBrands";
import { carModels } from "@/lib/carModels";
import Footer from "@/components/footer";


export default function Page() {
    const params = useParams<{ brand: string, model: string }>();
    const [ads, setAds] = useState<Array<Ad>>([]);
    const [brand, setBrand] = useState(params.brand);
    const [model, setModel] = useState(params.model);
    const router = useRouter();

    // Replace searchParams with nuqs query states
    const [priceMin] = useQueryState('price_min', { parse: (v) => Number(v) });
    const [priceMax] = useQueryState('price_max', { parse: (v) => Number(v) });
    const [yearMin] = useQueryState('year_min', { parse: (v) => Number(v) });
    const [yearMax] = useQueryState('year_max', { parse: (v) => Number(v) });
    const [kmMin] = useQueryState('km_min', { parse: (v) => Number(v) });
    const [kmMax] = useQueryState('km_max', { parse: (v) => Number(v) });
    const [fuelType] = useQueryState('fuel_type');
    const [sortOrder] = useQueryState('sort', { defaultValue: 'created_at:desc' })

    const fetchAds = useCallback(async (filter: string) => {
        let query = supabase
            .from('listings')
            .select('*')
            .ilike('brand', params.brand)
            .ilike('model', params.model)
            .limit(10);

        const [column, order] = filter.split(':');
        query = query.order(column, { ascending: order === 'asc' });

        let { data: ads, error } = await query;
        if (error) console.log('error', error);
        setAds(ads || []);
    }, [params.brand, params.model]);


    useEffect(() => {
        fetchAds(sortOrder);
    }, [sortOrder, fetchAds]);

    return (
        <div>
            <Navbar />
            <div className="mt-[4rem] container mx-auto max-w-6xl px-4 sm:px-6">
                <Breadcrumb brand={params.brand.toUpperCase()} model={params.model.toUpperCase()} />
                {/* Filters */}
                <div className="w-full my-8 sm:my-16">
                    <div className="w-full sm:w-1/2 flex flex-col sm:flex-row gap-2">
                        <DropdownSelect
                            label="Marca"
                            options={carBrands}
                            placeholder="Selecteaza marca..."
                            value={brand}
                            onChange={(value) => router.push(`/${value.toLowerCase()}/${model}`)}
                            className="w-full"
                        />
                        <DropdownSelect
                            label="Model"
                            options={carModels[brand as keyof typeof carModels].map((model) => ({ value: model, label: model }))}
                            placeholder="Selecteaza model..."
                            value={model}
                            onChange={(value) => router.push(`/${brand}/${value}`)}
                            className="w-full"
                        />
                    </div>
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
                            location={ad.location}
                            description={ad.short_description}
                            created_at={ad.created_at}
                            is_company={ad.is_company}
                        />
                    ))}
                </div>
            </div>
            <Footer />
        </div >
    );
}
