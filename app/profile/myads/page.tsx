"use client";

import { useState, useEffect, Suspense } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { User } from '@supabase/supabase-js';
import Navbar from '@/components/navbar';
import { toast, Toaster } from 'sonner';
import Loading from '@/components/loading';
import { useRouter, useSearchParams } from 'next/navigation';
import { Ad } from '@/types/schema';
import Footer from '@/components/footer';
import CardHorizontal from '@/components/cardHorizontal';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, FileText } from 'lucide-react';

const ITEMS_PER_PAGE = 10;

function MyAdsContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [user, setUser] = useState<User | null>(null);
    const [ads, setAds] = useState<Ad[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalCount, setTotalCount] = useState(0);

    const currentPage = Number(searchParams.get('page')) || 1;

    const handlePageChange = (newPage: number) => {
        const params = new URLSearchParams(searchParams);
        params.set('page', newPage.toString());
        router.push(`/profile/myads?${params.toString()}`, { scroll: true });
    };

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.replace('/login?redirect=/profile/myads');
                return;
            }
            setUser(user);
        };

        fetchUser();
    }, [router]);

    useEffect(() => {
        const fetchAds = async () => {
            if (!user) return;

            try {
                setLoading(true);
                const { count } = await supabase
                    .from('listings')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', user.id);

                setTotalCount(count || 0);

                const { data, error } = await supabase
                    .from('listings')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false })
                    .range((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE - 1);

                if (error) throw error;

                setAds(data || []);
            } catch (error) {
                console.error('Error:', error);
                toast.error('An error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchAds();
    }, [user, currentPage]);

    const handleDeleteAd = async (adId: string) => {
        try {
            const { error } = await supabase
                .from('listings')
                .delete()
                .eq('id', adId)
                .eq('user_id', user?.id);

            if (error) throw error;

            setAds(ads.filter(ad => ad.id !== adId));
            setTotalCount(prev => prev - 1);

            const newTotalCount = totalCount - 1;
            const maxPages = Math.ceil(newTotalCount / ITEMS_PER_PAGE);
            if (currentPage > maxPages && currentPage > 1) {
                handlePageChange(currentPage - 1);
            }

            toast.success("Anunțul a fost șters cu succes!");
        } catch (error) {
            toast.error("A apărut o eroare!");
            console.error(error);
        }
    };

    if (loading) return (
        <>
            <Navbar />
            <div className="container mx-auto max-w-5xl p-4 mt-8">
                <h1 className="text-2xl font-bold mb-6">Anunțurile mele</h1>
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="border rounded-lg p-4">
                            <div className="flex space-x-4">
                                <div className="w-48 h-32 bg-gray-200 rounded animate-pulse" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
                                    <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
                                    <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <Footer />
        </>
    );

    return (
        <>
            <Navbar />
            <div className="container mx-auto max-w-5xl p-4 mt-8">
                <Toaster />
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Anunțurile mele</h1>
                </div>

                {ads.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                        <FileText className="w-16 h-16 mb-4" />
                        <p className="text-lg font-medium">Nu ai niciun anunț momentan</p>
                        <p className="text-sm mt-2">Anunțurile tale vor apărea aici</p>
                    </div>
                ) : (
                    <>
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

                        <div className="mt-6 flex items-center justify-between">
                            <div className="text-sm text-gray-500">
                                Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} of {totalCount} results
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                >
                                    Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage * ITEMS_PER_PAGE >= totalCount}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    </>
                )}
            </div>
            <Footer />
        </>
    );
}

export default function MyAdsPage() {
    return (
        <Suspense fallback={
            <>
                <Navbar />
                <div className="container mx-auto max-w-5xl p-4 mt-8">
                    <h1 className="text-2xl font-bold mb-6">Anunțurile mele</h1>
                    <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="border rounded-lg p-4">
                                <div className="flex space-x-4">
                                    <div className="w-48 h-32 bg-gray-200 rounded animate-pulse" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
                                        <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
                                        <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <Footer />
            </>
        }>
            <MyAdsContent />
        </Suspense>
    );
}
