"use client";
import { supabase } from "@/lib/supabaseClient";
import { useState, useEffect } from "react";

type Ad = {
    id: string,
    brand: string,
    model: string,
    price: number,
    engine_size: number,
    power: number,
    km: number,
    fuelType: string,
    year: number,
    location: string,
    description: string,
    photos: string[]
}

export default function Page({ params }: { params: { id: string } }) {
    const [ad, setAd] = useState<Ad | null>(null);

    useEffect(() => {
        async function fetchAd() {
            let { data, error } = await supabase
                .from('anunt')
                .select('*')
                .eq('id', params.id)
                .single()
            if (error) console.log('error', error)
            if (data) {
                setAd(data);
            }
        }

        fetchAd();
    }, [params.id]);

    return (
        <div>
            <div className="container mx-auto grid grid-rows-10 gap-3">
                {ad?.photos.map((photo, index) => (
                    <img key={index} src={`https://pub-5e0f9c3c28524b78a12ca8f84bfb76d5.r2.dev/user-id-here/${photo}.webp`} alt={`car ${index + 1}`} />
                ))}
            </div>
        </div>
    )
}