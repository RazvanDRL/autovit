"use client";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";
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
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

    useEffect(() => {
        async function fetchAd() {
            const { data, error } = await supabase
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

    const nextPhoto = () => {
        if (ad) {
            setCurrentPhotoIndex((prevIndex) =>
                prevIndex < ad.photos.length - 1 ? prevIndex + 1 : 0
            );
        }
    };

    const prevPhoto = () => {
        if (currentPhotoIndex > 0) {
            setCurrentPhotoIndex(currentPhotoIndex - 1);
        }
    };

    if (!ad) return <div>Loading...</div>;

    return (
        <div className="container mx-auto p-4">
            <div className="h-[36rem] w-[64rem] aspect-[16/9] bg-gray-100 flex justify-center items-center relative rounded-sm">
                <div className="relative w-[48rem] h-full aspect-[4/3]">
                    <Image
                        src={`https://pub-5e0f9c3c28524b78a12ca8f84bfb76d5.r2.dev/user-id-here/${ad.photos[currentPhotoIndex]}.webp`}
                        alt={`${ad.brand} ${ad.model}`}
                        layout="fill"
                        className="object-cover"
                    />
                    <div className="text-xs absolute bottom-4 right-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded">
                        {currentPhotoIndex + 1} / {ad.photos.length}
                    </div>
                </div>
                <button onClick={prevPhoto} className="absolute left-0 top-1/2 bg-black bg-opacity-50 text-white p-2">&lt;</button>
                <button onClick={nextPhoto} className="absolute right-0 top-1/2 bg-black bg-opacity-50 text-white p-2">&gt;</button>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <h1 className="text-3xl font-bold mb-2">{ad.brand} {ad.model}</h1>
                    <p className="text-xl mb-4">Price: ${ad.price}</p>
                    <p>Year: {ad.year}</p>
                    <p>Mileage: {ad.km} km</p>
                    <p>Fuel Type: {ad.fuelType}</p>
                    <p>Engine Size: {ad.engine_size} L</p>
                    <p>Power: {ad.power} HP</p>
                    <p>Location: {ad.location}</p>
                </div>
                <div>
                    <h2 className="text-2xl font-semibold mb-2">Description</h2>
                    <p>{ad.description}</p>
                </div>
            </div>
        </div>
    )
}