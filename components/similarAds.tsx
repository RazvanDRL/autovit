"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Ad } from "@/types/schema";
import Image from "next/image";
import Link from "next/link";
import { formatNumberWithSpace } from "@/lib/numberFormat";
import { formatTimeAgo } from "@/lib/timeFormat";

export default function SimilarAds({ id }: { id: string }) {
    const [similarAds, setSimilarAds] = useState<Ad[]>([]);

    useEffect(() => {
        async function fetchSimilarAds() {
            // First get the current ad to match against
            const { data: currentAd } = await supabase
                .from('listings')
                .select('brand, model')
                .eq('id', id)
                .single();

            if (currentAd) {
                // Then fetch similar ads with the same brand and model
                const { data } = await supabase
                    .from('listings')
                    .select('*')
                    .eq('brand', currentAd.brand)
                    .eq('model', currentAd.model)
                    .neq('id', id) // Exclude current ad
                    .order('created_at', { ascending: false })
                    .limit(4);

                if (data) setSimilarAds(data);
            }
        }

        fetchSimilarAds();
    }, [id]);

    if (similarAds.length === 0) return null;

    return (
        <div>
            <h2 className="mt-28 text-3xl font-semibold mb-6">Anunțuri similare</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {similarAds.map((ad) => (
                    <Link href={`/a/${ad.id}`} key={ad.id} className="group">
                        <div className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                            <div className="aspect-[4/3] relative">
                                {ad.photos && ad.photos[0] && (
                                    <Image
                                        src={`https://pub-5e0f9c3c28524b78a12ca8f84bfb76d5.r2.dev/${ad.id}/${ad.photos[0]}-thumbnail.webp`}
                                        alt={`${ad.brand} ${ad.model}`}
                                        layout="fill"
                                        objectFit="cover"
                                        className="group-hover:scale-105 transition-transform duration-300"
                                    />
                                )}
                            </div>
                            <div className="p-4">
                                <h3 className="font-semibold text-lg truncate">
                                    {ad.brand} {ad.model}
                                </h3>
                                <p className="text-sm text-gray-600 truncate">{ad.short_description}</p>
                                <p className="text-lg font-semibold text-[#EB2126] mt-2">
                                    {formatNumberWithSpace(ad.price)} EUR
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    {formatTimeAgo(ad.created_at)}
                                </p>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
