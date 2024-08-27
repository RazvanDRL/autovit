"use client";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
    type CarouselApi,
} from "@/components/ui/carousel"
import { Card, CardContent } from "@/components/ui/card"
import { useKeyPress } from "@/hooks/useKeyPress";

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
    const [api, setApi] = useState<CarouselApi>();

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

    const handlePrevious = useCallback(() => {
        if (ad && ad.photos) {
            setCurrentPhotoIndex((prev) => (prev - 1 + ad.photos.length) % ad.photos.length);
            api?.scrollPrev();
        }
    }, [ad, api]);

    const handleNext = useCallback(() => {
        if (ad && ad.photos) {
            setCurrentPhotoIndex((prev) => (prev + 1) % ad.photos.length);
            api?.scrollNext();
        }
    }, [ad, api]);

    useKeyPress("ArrowLeft", handlePrevious);
    useKeyPress("ArrowRight", handleNext);

    if (!ad) return <div>Loading...</div>;

    return (
        <div className="container mx-auto p-4">
            <div className="h-[36rem] w-[64rem] aspect-[16/9] bg-gray-100 flex justify-center items-center relative rounded-sm overflow-hidden">
                {ad.photos && ad.photos.length > 0 ? (
                    <Carousel className="w-full h-full" opts={{ loop: true }} setApi={setApi}>
                        <CarouselContent>
                            {ad.photos.map((photo, index) => (
                                <CarouselItem key={index}>
                                    <Card>
                                        <CardContent className="p-0 aspect-[16/9] relative">
                                            <Image
                                                src={`https://pub-5e0f9c3c28524b78a12ca8f84bfb76d5.r2.dev/user-id-here/${photo}.webp`}
                                                alt={`${ad.brand} ${ad.model}`}
                                                layout="fill"
                                                objectFit="cover"
                                            />
                                        </CardContent>
                                    </Card>
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        <CarouselPrevious onClick={handlePrevious} className="absolute left-4 top-1/2 transform -translate-y-1/2" />
                        <CarouselNext onClick={handleNext} className="absolute right-4 top-1/2 transform -translate-y-1/2" />
                    </Carousel>
                ) : (
                    <p>No photos available</p>
                )}
            </div>
            {ad.photos && ad.photos.length > 0 && (
                <div className="mt-4 flex justify-center space-x-2 overflow-x-auto">
                    {ad.photos.map((photo, index) => (
                        <div
                            key={index}
                            className={`aspect-[4/3] w-24 h-18 relative cursor-pointer ${index === currentPhotoIndex ? 'border-2 border-blue-500' : ''}`}
                            onClick={() => {
                                setCurrentPhotoIndex(index);
                                api?.scrollTo(index);
                            }}
                        >
                            <Image
                                src={`https://pub-5e0f9c3c28524b78a12ca8f84bfb76d5.r2.dev/user-id-here/${photo}.webp`}
                                alt={`${ad.brand} ${ad.model} thumbnail`}
                                layout="fill"
                                objectFit="cover"
                            />
                        </div>
                    ))}
                </div>
            )}
            <div className="grid grid-cols-2 gap-4 mt-4">
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