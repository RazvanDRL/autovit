"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { User } from '@supabase/supabase-js';
import Card from '@/components/card';
import Navbar from '@/components/navbar';
import { toast, Toaster } from 'sonner';
import Loading from '@/components/loading';
import { useRouter } from 'next/navigation';
import { FAVORITES_UPDATED_EVENT } from '@/components/navbar';
import CardHorizontal from '@/components/cardHorizontal';

export default function FavoritesPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [favorites, setFavorites] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingFavorites, setProcessingFavorites] = useState<Set<string>>(new Set());

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.replace('/login');
                return;
            }
            setUser(user);
        };

        fetchUser();
    }, [router]);

    useEffect(() => {
        const fetchFavorites = async () => {
            if (!user) return;

            const { data, error } = await supabase
                .from('favorites')
                .select(`
                    ad_id,
                    listings:ad_id (
                        id,
                        brand,
                        model,
                        price,
                        location_city,
                        location_county,
                        created_at,
                        photos,
                        year,
                        km,
                        fuel_type,
                        engine_size,
                        power,
                        description,
                        is_company
                    )
                `)
                .eq('user_id', user.id);

            if (error) {
                console.error('Error fetching favorites:', error);
                toast.error('Error fetching favorites');
                return;
            }

            // Filter out any null listings (in case an ad was deleted)
            const validFavorites = data
                .filter(fav => fav.listings)
                .map(fav => fav.listings);

            setFavorites(validFavorites);
            setLoading(false);
        };

        fetchFavorites();
    }, [user]);

    const handleFavorite = async (e: React.MouseEvent, adId: string) => {
        e.preventDefault();

        if (processingFavorites.has(adId)) {
            return;
        }

        try {
            setProcessingFavorites(prev => new Set(prev).add(adId));

            const { error } = await supabase
                .from('favorites')
                .delete()
                .eq('ad_id', adId)
                .eq('user_id', user?.id);

            if (error) {
                console.error(error);
                toast.error("A apărut o eroare!");
                return;
            }

            setFavorites(favorites.filter(ad => ad.id !== adId));
            toast.success("Anunț eliminat de la favorite");
            window.dispatchEvent(new Event(FAVORITES_UPDATED_EVENT));

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

    if (loading) return <Loading />;

    return (
        <>
            <Navbar />
            <div className="container mx-auto max-w-5xl p-4 mt-8">
                <Toaster />
                <h1 className="text-2xl font-bold mb-6">Anunțurile mele favorite</h1>
                {favorites.length === 0 ? (
                    <div className="text-center text-gray-500 mt-8">
                        <p>Nu ai niciun anunț favorit momentan.</p>
                    </div>
                ) : (
                    <div className="flex flex-row gap-8">
                        {favorites.map((ad) => (
                            <Card
                                key={ad.id}
                                id={ad.id}
                                brand={ad.brand}
                                model={ad.model}
                                price={ad.price}
                                location={`${ad.location_city}, ${ad.location_county}`}
                                photo={ad.photos[0]}
                                year={ad.year}
                                km={ad.km}
                                fuelType={ad.fuel_type}
                                isFavorite={true}
                                onFavoriteClick={(e) => handleFavorite(e, ad.id)}
                                isProcessing={processingFavorites.has(ad.id)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}
