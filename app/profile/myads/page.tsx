"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { User } from '@supabase/supabase-js';
import Navbar from '@/components/navbar';
import { toast, Toaster } from 'sonner';
import Loading from '@/components/loading';
import { useRouter } from 'next/navigation';
import { Ad } from '@/types/schema';
import Footer from '@/components/footer';
import CardHorizontal from '@/components/cardHorizontal';

export default function MyAdsPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [ads, setAds] = useState<Ad[]>([]);
    const [loading, setLoading] = useState(true);

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
        const fetchAds = async () => {
            if (!user) return;

            const { data, error } = await supabase
                .from('listings')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching ads:', error);
                toast.error('Error fetching ads');
                return;
            }

            console.log(data);

            setAds(data || []);
            setLoading(false);
        };

        fetchAds();
    }, [user]);

    const handleDeleteAd = async (adId: string) => {
        try {
            const { error } = await supabase
                .from('listings')
                .delete()
                .eq('id', adId)
                .eq('user_id', user?.id);

            if (error) {
                console.error(error);
                toast.error("A apărut o eroare la ștergerea anunțului!");
                return;
            }

            setAds(ads.filter(ad => ad.id !== adId));
            toast.success("Anunțul a fost șters cu succes!");

        } catch (error) {
            toast.error("A apărut o eroare!");
            console.error(error);
        }
    };

    if (loading) return <Loading />;

    return (
        <>
            <Navbar />
            <div className="container mx-auto max-w-5xl p-4 mt-8">
                <Toaster />
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Anunțurile mele</h1>
                </div>

                {ads.length === 0 ? (
                    <div className="text-center text-gray-500 mt-8">
                        <p>Nu ai niciun anunț momentan.</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-6">
                        {ads.map((ad) => (
                            <CardHorizontal
                                key={ad.id}
                                listingId={ad.id}
                                id={ad.photos[0]}
                                title={`${ad.brand} ${ad.model}`}
                                price={ad.price}
                                engine_size={ad.engine_size}
                                power={ad.power}
                                description={ad.short_description}
                                km={ad.km}
                                fuelType={ad.fuel_type}
                                year={ad.year}
                                location={`${ad.location_city}, ${ad.location_county}`}
                                created_at={ad.created_at}
                                is_company={ad.is_company}
                                onDelete={() => handleDeleteAd(ad.id)}
                            />
                        ))}
                    </div>
                )}
            </div>
            <Footer />
        </>
    );
}
