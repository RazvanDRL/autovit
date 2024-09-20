"use client";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";
import { useState, useEffect, useCallback, useRef } from "react";
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
import { Share2, Heart, ChevronRight, Calendar, Gauge, Fuel, Power, MapPin, Maximize2, X } from "lucide-react";
import Link from "next/link";
import { formatNumberWithSpace } from "@/lib/numberFormat";

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
    const [isFavourite, setIsFavourite] = useState(false);
    const [isOverlayOpen, setIsOverlayOpen] = useState(false);
    const carouselRef = useRef<HTMLDivElement>(null);

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
        setIsFavourite(!isFavourite);
        if (ad) {
            if (!isFavourite) {
                const { data, error } = await supabase
                    .from('profiles')
                    .insert({
                        favourite_ads: [ad.id]
                    })
                if (error) console.log('error', error)
                if (data) {
                    console.log('data', data)
                }
            } else {
                const { data, error } = await supabase
                    .from('profiles')
                    .delete()
                    .eq('favourite_ads', ad.id);
                if (error) console.log('error', error)
                if (data) {
                    console.log('data', data)
                }
            }
        }
    };

    const toggleOverlay = () => {
        setIsOverlayOpen(!isOverlayOpen);
    };

    useKeyPress("ArrowLeft", handlePrevious);
    useKeyPress("ArrowRight", handleNext);
    useKeyPress("Escape", () => setIsOverlayOpen(false));

    if (!ad) {
        return (
            <div className="flex justify-center items-center h-64">
                <svg className="animate-spin h-8 w-8 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                </svg>
                <span className="ml-2 text-gray-600">Loading...</span>
            </div>
        );
    }

    return (
        <div>
            <Navbar />
            <div className="container mx-auto p-4">
                <Toaster richColors position='top-center' />
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
                            <Heart className={`h-4 w-4 mr-2 ${isFavourite ? 'fill-current text-red-500' : ''}`} />
                            {isFavourite ? 'Sterge de la favorite' : 'Adauga la favorite'}
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
                            <div ref={carouselRef} className="aspect-[4/3] w-[48rem] h-[36rem] bg-gray-100 flex justify-center items-center relative rounded-sm overflow-hidden">
                                {ad.photos && ad.photos.length > 0 ? (
                                    <>
                                        <Carousel className="aspect-[4/3] w-full h-full" opts={{ loop: true }} setApi={setApi}>
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
                                            <CarouselPrevious onClick={handlePrevious} className="bg-white text-black hover:bg-gray-100 absolute opacity-80 left-4 top-1/2 transform -translate-y-1/2" />
                                            <CarouselNext onClick={handleNext} className="bg-white text-black hover:bg-gray-100 absolute opacity-80 right-4 top-1/2 transform -translate-y-1/2" />
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
                                                <CarouselItem key={index} className="pl-6" style={{ flex: '0 0 auto', width: `${100 / Math.min(ad.photos.length, 8) + 1.2}%` }}>
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
                                                            quality={0}
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
                {/* Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8 bg-white rounded-lg shadow-lg p-6">
                    <div className="space-y-6">
                        <h1 className="text-4xl font-bold text-gray-800 mb-2">{ad.brand} {ad.model}</h1>
                        <p className="text-3xl font-semibold text-green-600">€{ad.price.toLocaleString()}</p>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center p-3 bg-gray-100 rounded-lg">
                                <Calendar className="w-6 h-6 mr-3 text-blue-500" />
                                <div>
                                    <p className="text-sm text-gray-500">Year</p>
                                    <p className="font-semibold">{ad.year}</p>
                                </div>
                            </div>
                            <div className="flex items-center p-3 bg-gray-100 rounded-lg">
                                <Gauge className="w-6 h-6 mr-3 text-blue-500" />
                                <div>
                                    <p className="text-sm text-gray-500">Mileage</p>
                                    <p className="font-semibold">{formatNumberWithSpace(ad.km)} km</p>
                                </div>
                            </div>
                            <div className="flex items-center p-3 bg-gray-100 rounded-lg">
                                <Fuel className="w-6 h-6 mr-3 text-blue-500" />
                                <div>
                                    <p className="text-sm text-gray-500">Fuel Type</p>
                                    <p className="font-semibold">{ad.fuelType}</p>
                                </div>
                            </div>
                            <div className="flex items-center p-3 bg-gray-100 rounded-lg">
                                <Fuel className="w-6 h-6 mr-3 text-blue-500" />
                                <div>
                                    <p className="text-sm text-gray-500">Engine Size</p>
                                    <p className="font-semibold">{formatNumberWithSpace(ad.engine_size)} cm<sup>3</sup></p>
                                </div>
                            </div>
                            <div className="flex items-center p-3 bg-gray-100 rounded-lg">
                                <Power className="w-6 h-6 mr-3 text-blue-500" />
                                <div>
                                    <p className="text-sm text-gray-500">Power</p>
                                    <p className="font-semibold">{formatNumberWithSpace(ad.power)} HP</p>
                                </div>
                            </div>
                            <div className="flex items-center p-3 bg-gray-100 rounded-lg">
                                <MapPin className="w-6 h-6 mr-3 text-blue-500" />
                                <div>
                                    <p className="text-sm text-gray-500">Location</p>
                                    <p className="font-semibold">{ad.location}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Description</h2>
                        <p className="text-gray-700 leading-relaxed">{ad.description}</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
