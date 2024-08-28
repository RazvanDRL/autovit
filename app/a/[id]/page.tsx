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
import { ContactCard } from "@/components/contact";
import { toast, Toaster } from "sonner";
import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Share2, Heart, ChevronRight } from "lucide-react";
import Link from "next/link";

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
    const [thumbnailApi, setThumbnailApi] = useState<CarouselApi>();
    const [isFavorite, setIsFavorite] = useState(false);

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
            const newIndex = (currentPhotoIndex - 1 + ad.photos.length) % ad.photos.length;
            setCurrentPhotoIndex(newIndex);
            api?.scrollPrev();
            thumbnailApi?.scrollTo(newIndex);
        }
    }, [ad, api, thumbnailApi, currentPhotoIndex]);

    const handleNext = useCallback(() => {
        if (ad && ad.photos) {
            const newIndex = (currentPhotoIndex + 1) % ad.photos.length;
            setCurrentPhotoIndex(newIndex);
            api?.scrollNext();
            thumbnailApi?.scrollTo(newIndex);
        }
    }, [ad, api, thumbnailApi, currentPhotoIndex]);

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        toast.success('Link-ul a fost copiat');
    };

    const handleFavorite = async () => {
        setIsFavorite(!isFavorite);
        // if (isFavorite) {
        //     await supabase
        //         .from('favorites')
        //         .insert({
        //             user_id: user.id,
        //             ad_id: ad.id,
        //         });
        // }
    };

    useKeyPress("ArrowLeft", handlePrevious);
    useKeyPress("ArrowRight", handleNext);

    if (!ad) return <div>Loading...</div>;

    return (
        <div>
            <Navbar />
            <div className="container mx-auto p-4">
                <Toaster />
                <div className="mb-4 flex justify-between items-center w-[48rem]">
                    <nav className="flex" aria-label="Breadcrumb">
                        <ol className="inline-flex items-center space-x-1 md:space-x-3">
                            <li className="inline-flex items-center">
                                <Link href="/" className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600">
                                    Home
                                </Link>
                            </li>
                            <li>
                                <div className="flex items-center">
                                    <ChevronRight className="w-4 h-4 text-gray-400" />
                                    <Link href="/cars" className="ml-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2">
                                        Cars
                                    </Link>
                                </div>
                            </li>
                            <li aria-current="page">
                                <div className="flex items-center">
                                    <ChevronRight className="w-4 h-4 text-gray-400" />
                                    <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">{ad.brand} {ad.model}</span>
                                </div>
                            </li>
                        </ol>
                    </nav>
                    <div className="flex space-x-2">
                        <Button onClick={handleFavorite} variant="outline" className="bg-white">
                            <Heart className={`h-4 w-4 mr-2 ${isFavorite ? 'fill-current text-red-500' : ''}`} />
                            {isFavorite ? 'Sterge de la favorite' : 'Adauga la favorite'}
                        </Button>
                        <Button onClick={handleShare} variant="outline" className="bg-white">
                            <Share2 className="h-4 w-4 mr-2" />
                            Share
                        </Button>
                    </div>
                </div>
                <div className="flex flex-col">
                    <div className="flex">
                        <div className="">
                            <div className="w-[48em] h-[27rem] aspect-[16/9] bg-gray-100 flex justify-center items-center relative rounded-sm overflow-hidden">
                                {ad.photos && ad.photos.length > 0 ? (
                                    <>
                                        <Carousel className="aspect-[4/3] w-[36rem] h-full" opts={{ loop: true }} setApi={setApi}>
                                            <CarouselContent>
                                                {ad.photos.map((photo, index) => (
                                                    <CarouselItem key={index}>
                                                        <Card>
                                                            <CardContent className="p-0 aspect-[4/3] relative">
                                                                <Image
                                                                    src={`https://pub-5e0f9c3c28524b78a12ca8f84bfb76d5.r2.dev/user-id-here/${photo}.webp`}
                                                                    alt={`${ad.brand} ${ad.model}`}
                                                                    layout="fill"
                                                                    objectFit="cover"
                                                                    loading="eager"
                                                                    fetchPriority="high"
                                                                    priority
                                                                />
                                                            </CardContent>
                                                        </Card>
                                                    </CarouselItem>
                                                ))}
                                            </CarouselContent>
                                            <CarouselPrevious onClick={handlePrevious} className="absolute left-4 top-1/2 transform -translate-y-1/2" />
                                            <CarouselNext onClick={handleNext} className="absolute right-4 top-1/2 transform -translate-y-1/2" />
                                        </Carousel>
                                        <div className="text-xs absolute bottom-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded">
                                            {currentPhotoIndex + 1} / {ad.photos.length}
                                        </div>
                                    </>
                                ) : (
                                    <p>No photos available</p>
                                )}
                            </div>
                            {ad.photos && ad.photos.length > 0 && (
                                <div className="mt-4">
                                    <Carousel className="w-full" opts={{ loop: true, align: "start" }} setApi={setThumbnailApi}>
                                        <CarouselContent className="-ml-1">
                                            {ad.photos.map((photo, index) => (
                                                <CarouselItem key={index} className="pl-1" style={{ flex: '0 0 auto', width: `${100 / Math.min(ad.photos.length, 8) + 1.2}%` }}>
                                                    <div
                                                        className={`rounded-md aspect-[4/3] relative cursor-pointer ${index === currentPhotoIndex ? 'border-2 border-blue-500' : ''}`}
                                                        onClick={() => {
                                                            setCurrentPhotoIndex(index);
                                                            api?.scrollTo(index);
                                                            thumbnailApi?.scrollTo(index);
                                                        }}
                                                    >
                                                        <Image
                                                            src={`https://pub-5e0f9c3c28524b78a12ca8f84bfb76d5.r2.dev/user-id-here/${photo}.webp`}
                                                            alt={`${ad.brand} ${ad.model} thumbnail`}
                                                            layout="fill"
                                                            objectFit="cover"
                                                            className="rounded-sm"
                                                            loading="lazy"
                                                            quality={10}
                                                        />
                                                    </div>
                                                </CarouselItem>
                                            ))}
                                        </CarouselContent>
                                    </Carousel>
                                </div>
                            )}
                        </div>
                        <div className="ml-4 flex-shrink-0">
                            <ContactCard phoneNumber={"0770429755"} />
                        </div>
                    </div>
                </div>
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
        </div>
    )
}