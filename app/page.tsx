"use client";
import Navbar from '@/components/navbar';
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import DropdownSelect from '@/components/dropdownSelect';
import Card from '@/components/card';
import { supabase } from '@/lib/supabaseClient';
import { carBrands } from '@/lib/carBrands';
import { years } from '@/lib/years';
import { colors } from '@/lib/colors';
import { useRouter } from 'next/navigation';
import Loading from '@/components/loading';
import { toast, Toaster } from 'sonner';
import { User as UserType } from '@supabase/supabase-js';
import { FAVORITES_UPDATED_EVENT } from '@/components/navbar';
import Footer from '@/components/footer';
import CarSearch from '@/components/CarSearch';

const fuelTypes = [
    { value: "Petrol", label: "Petrol" },
    { value: "Diesel", label: "Diesel" },
    { value: "Electric", label: "Electric" },
    { value: "Hybrid", label: "Hybrid" },
];

const transmissions = [
    { value: "Automatic", label: "Automatic" },
    { value: "Manual", label: "Manual" },
    { value: "Semi-automatic", label: "Semi-automatic" },
];

type Ad = {
    id: string;
    brand: string;
    model: string;
    price: number;
    location: string;
    date: string;
    photos: string[];
    year: number;
    km: number;
    fuelType: string;
}

const ITEMS_PER_PAGE = 12;

export default function Home() {
    const router = useRouter();
    const [brand, setBrand] = useState("");
    const [model, setModel] = useState("");
    const [year, setYear] = useState("");
    const [price, setPrice] = useState("");
    const [color, setColor] = useState("");
    const [fuelType, setFuelType] = useState("");
    const [transmission, setTransmission] = useState("");
    const [bodyType, setBodyType] = useState("");
    const [cards, setCards] = useState<Ad[]>([]);
    const [loading, setLoading] = useState(false);
    const [favorites, setFavorites] = useState<string[]>([]);
    const [user, setUser] = useState<UserType | null>(null);
    const [processingFavorites, setProcessingFavorites] = useState<Set<string>>(new Set());
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [availableModels, setAvailableModels] = useState<{ value: string, label: string }[]>([]);

    useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true);
            try {
                // Parallel fetch for user and initial listings
                const [userResponse, listingsResponse] = await Promise.all([
                    supabase.auth.getUser(),
                    supabase
                        .from('listings')
                        .select('*')
                        .range(0, ITEMS_PER_PAGE - 1)
                        .order('created_at', { ascending: false })
                ]);

                const user = userResponse.data.user;
                setUser(user);

                if (user) {
                    const { data: favoritesData } = await supabase
                        .from('favorites')
                        .select('ad_id')
                        .eq('user_id', user.id);

                    if (favoritesData) {
                        setFavorites(favoritesData.map(fav => fav.ad_id));
                    }
                }

                if (listingsResponse.data) {
                    setCards(listingsResponse.data);
                    setHasMore(listingsResponse.data.length === ITEMS_PER_PAGE);
                }
            } catch (error) {
                console.error('Error fetching initial data:', error);
                toast.error("Couldn't load listings");
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, []);

    useEffect(() => {
        const fetchModels = async () => {
            if (!brand) {
                setAvailableModels([]);
                setModel("");
                return;
            }

            try {
                const selectedBrand = carBrands.find(b => b.label === brand);
                if (!selectedBrand) return;

                setModel("");

                const { data: modelsData, error } = await supabase
                    .from('models')
                    .select('data')
                    .eq('value', selectedBrand.value)
                    .single();

                if (error) {
                    console.error('Error fetching models:', error);
                    return;
                }

                if (modelsData?.data) {
                    // Create a Map to handle duplicates
                    const uniqueModels = new Map();

                    modelsData.data.forEach((model: any) => {
                        const key = `${model.displayName}_${model.id}`; // Combine name and ID for uniqueness
                        uniqueModels.set(key, {
                            value: model.displayName,
                            label: model.displayName,
                            id: model.id, // Keep the ID for reference
                            group: model.group || false
                        });
                    });

                    // Convert Map back to array
                    const modelOptions = Array.from(uniqueModels.values());
                    setAvailableModels(modelOptions);
                }
            } catch (error) {
                console.error('Error in fetchModels:', error);
            }
        };

        fetchModels();
    }, [brand]);

    const loadMore = async () => {
        if (!hasMore || loading) return;

        try {
            const from = page * ITEMS_PER_PAGE;
            const to = from + ITEMS_PER_PAGE - 1;

            const { data, error } = await supabase
                .from('listings')
                .select('*')
                .range(from, to)
                .order('created_at', { ascending: false });

            if (error) throw error;

            if (data) {
                setCards(prev => [...prev, ...data]);
                setHasMore(data.length === ITEMS_PER_PAGE);
                setPage(prev => prev + 1);
            }
        } catch (error) {
            console.error('Error loading more listings:', error);
            toast.error("Couldn't load more listings");
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();

        // Get the labels for the URL path
        const brandLabel = carBrands.find(b => b.label === brand)?.label || '';
        const modelLabel = availableModels.find(m => m.value === model)?.label || '';

        // Create base path
        const basePath = `/${brandLabel}/${encodeURIComponent(modelLabel)}`;

        // Create URLSearchParams object for query parameters
        const searchParams = new URLSearchParams();

        // Define parameters mapping
        const params: { [key: string]: string | undefined } = {
            price: price.replace(/[^0-9]/g, ''),
            year: year,
            body_type: bodyType,
            fuel_type: fuelType
        };

        // Add non-empty parameters to URLSearchParams
        Object.entries(params).forEach(([key, value]) => {
            if (value) {
                searchParams.append(key, value);
            }
        });

        // Construct final URL
        const queryString = searchParams.toString();
        const route = queryString ? `${basePath}?${queryString}` : basePath;

        router.push(route);
    };

    const handleFavorite = async (e: React.MouseEvent, adId: string) => {
        e.preventDefault();

        if (processingFavorites.has(adId)) {
            return;
        }

        if (!user) {
            toast.error("Trebuie să fii autentificat pentru a salva anunțuri!");
            return;
        }

        try {
            setProcessingFavorites(prev => new Set(prev).add(adId));

            const { data: existingFavorite } = await supabase
                .from('favorites')
                .select('*')
                .eq('ad_id', adId)
                .eq('user_id', user.id)
                .single();

            if (existingFavorite) {
                const { error } = await supabase
                    .from('favorites')
                    .delete()
                    .eq('ad_id', adId)
                    .eq('user_id', user.id);

                if (error) throw error;

                setFavorites(favorites.filter(id => id !== adId));
                toast.success("Anunț eliminat de la favorite");

                // Dispatch event with new count
                window.dispatchEvent(new CustomEvent(FAVORITES_UPDATED_EVENT, {
                    detail: { count: favorites.length - 1 }
                }));
            } else {
                const { error } = await supabase
                    .from('favorites')
                    .insert([{ ad_id: adId, user_id: user.id }]);

                if (error) throw error;

                setFavorites([...favorites, adId]);
                toast.success("Anunț salvat la favorite");

                // Dispatch event with new count
                window.dispatchEvent(new CustomEvent(FAVORITES_UPDATED_EVENT, {
                    detail: { count: favorites.length + 1 }
                }));
            }
        } catch (error) {
            toast.error("A apărut o eroare!");
            console.error(error);
        } finally {
            setProcessingFavorites(prev => {
                const next = new Set(prev);
                next.delete(adId);
                return next;
            });
        }
    };

    if (loading) {
        return <Loading />;
    }

    return (
        <div>
            <Navbar />
            <Toaster />
            <main className="mt-16 lg:max-w-6xl mx-auto">
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
                <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {cards.map((card) => (
                        <Card
                            key={card.id}
                            id={card.id}
                            photo={card.photos[0]}
                            brand={card.brand}
                            model={card.model}
                            price={card.price}
                            location={card.location}
                            year={card.year}
                            km={card.km}
                            fuelType={card.fuelType}
                            isFavorite={favorites.includes(card.id)}
                            onFavoriteClick={handleFavorite}
                            isProcessing={processingFavorites.has(card.id)}
                        />
                    ))}
                </div>
                {hasMore && (
                    <div className="flex justify-center mt-8">
                        <Button onClick={loadMore} variant="outline">
                            Load More
                        </Button>
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
}
