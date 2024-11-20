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
    const [isLoading, setIsLoading] = useState(true);

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
        setIsLoading(true);
        try {
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
        } finally {
            setIsLoading(false);
        }
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
                    {isLoading ? (
                        // Skeleton loading state that matches CardHorizontal layout
                        Array(6).fill(0).map((_, index) => (
                            <div key={index} className="relative py-4 md:py-8 border-b border-gray-200 bg-white rounded-sm max-w-[55rem] animate-pulse">
                                <div className="flex flex-col md:flex-row md:items-start">
                                    {/* Image skeleton */}
                                    <div className="w-full md:w-[280px] md:h-[210px] aspect-[4/3] h-auto relative bg-gray-200 rounded-sm" />

                                    {/* Content skeleton */}
                                    <div className="flex-1 pt-4 md:pt-0 md:pl-4">
                                        <div className="flex flex-col md:flex-row md:justify-between">
                                            <div>
                                                {/* Title */}
                                                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2" />
                                                {/* Subtitle */}
                                                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4" />

                                                {/* Stats row */}
                                                <div className="flex flex-wrap items-center gap-2 md:gap-4 mt-4 mb-4">
                                                    <div className="h-4 bg-gray-200 rounded w-20" />
                                                    <div className="h-4 bg-gray-200 rounded w-24" />
                                                    <div className="h-4 bg-gray-200 rounded w-20" />
                                                </div>

                                                {/* Location */}
                                                <div className="h-4 bg-gray-200 rounded w-40 mb-4 md:mb-10" />

                                                {/* Time and dealer status */}
                                                <div className="h-3 bg-gray-200 rounded w-32 mb-2" />
                                                <div className="h-3 bg-gray-200 rounded w-24" />
                                            </div>

                                            {/* Price */}
                                            <div className="h-8 bg-gray-200 rounded w-32 mt-4 md:mt-0" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : ads.length > 0 ? (
                        // Existing ads mapping
                        ads.map((ad) => (
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
                        ))
                    ) : (
                        // Enhanced empty state with CTA
                        <div className="col-span-full py-16 flex flex-col items-center justify-center text-center border rounded-lg bg-white">
                            <div className="mb-4">
                                <svg
                                    className="mx-auto h-12 w-12 text-gray-400"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    aria-hidden="true"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M15.182 16.318A4.486 4.486 0 0012.016 15a4.486 4.486 0 00-3.198 1.318M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z"
                                    />
                                </svg>
                            </div>
                            <h3 className="mt-2 text-sm font-medium text-gray-900">Nu am găsit anunțuri</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Nu există anunțuri care să corespundă criteriilor tale de căutare.
                            </p>
                            <div className="mt-6">
                                <a
                                    href="/adauga"
                                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                >
                                    <svg
                                        className="-ml-1 mr-2 h-5 w-5"
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                        aria-hidden="true"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                    Adaugă primul anunț
                                </a>
                            </div>
                        </div>
                    )}
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
