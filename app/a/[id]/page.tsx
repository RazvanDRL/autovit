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
import { Share2, Heart, ChevronRight, Calendar, Gauge, Fuel, Power, MapPin, Maximize2, X, Zap, Droplet, Car } from "lucide-react";
import Link from "next/link";
import { formatNumberWithSpace } from "@/lib/numberFormat";
import { Separator } from "@/components/ui/separator";
import { formatTimeAgo } from "@/lib/timeFormat";
import { User as UserType } from "@supabase/supabase-js";
import Loading from "@/components/loading";
import Footer from "@/components/footer";
import { useParams } from "next/navigation";
type Ad = {
    id: string,
    brand: string,
    model: string,
    price: number,
    engine_size: number,
    power: number,
    km: number,
    fuel_type: string,
    year: number,
    location: string,
    description: string,
    short_description: string,
    created_at?: string,
    photos: string[]
}

export default function Page() {
    const params = useParams<{ id: string }>();
    const [ad, setAd] = useState<Ad | null>(null);
    const [user, setUser] = useState<UserType | null>(null);
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
    const [api, setApi] = useState<CarouselApi>();
    const [thumbnailApi, setThumbnailApi] = useState<CarouselApi>();
    const [isFavourite, setIsFavourite] = useState(false);
    const [isOverlayOpen, setIsOverlayOpen] = useState(false);
    const carouselRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        async function fetchAd() {
            const { data, error } = await supabase
                .from('listings')
                .select('*')
                .eq('id', params.id)
                .single()
            if (error) console.log('error', error)
            if (data) {
                setAd(data);
            }
        }

        async function fetchUser() {
            const { data, error } = await supabase.auth.getUser();
            if (error) console.log('error', error)
            if (data) setUser(data.user);
        }

        fetchAd();
        fetchUser();
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

    if (!ad || !user) {
        return <Loading />;
    }

    return (
        <div>
            <Navbar />
            <div className="container mx-auto p-4 max-w-6xl">
                <Toaster richColors position='top-center' />
                <div className="mb-6 flex justify-between items-center w-full">
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
                        <Button onClick={handleFavorite} variant="ghost" size="icon" className="bg-white">
                            <Heart className={`h-5 w-5 ${isFavourite ? 'fill-current text-red-500' : ''}`} />
                        </Button>
                        <Button onClick={handleShare} variant="ghost" size="icon" className="bg-white">
                            <Share2 className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
                {/* add the price and title here */}
                <Separator className="mb-6" />
                <div className="flex justify-between mb-6">
                    <div className="flex flex-col">
                        <h1 className="text-3xl font-bold text-gray-900">{ad.brand}{" "}{ad.model}{" - "}{ad.short_description}</h1>
                        <p className="text-xs opacity-50 mt-1">
                            Postat cu {ad.created_at ? formatTimeAgo(ad.created_at) : ''}
                        </p>
                    </div>
                    <p className="text-3xl font-semibold mt-2 text-[#EB2126]">{formatNumberWithSpace(ad.price)} EUR</p>
                </div>
                <div className="flex flex-col">
                    <div className="flex justify-between">
                        <div>
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
                                                                    src={`https://pub-5e0f9c3c28524b78a12ca8f84bfb76d5.r2.dev/${user.id}/${photo}.webp`}
                                                                    alt={`${ad.brand} ${ad.model}`}
                                                                    layout="fill"
                                                                    objectFit="cover"
                                                                    loading="eager"
                                                                    fetchPriority="high"
                                                                    priority
                                                                    className="rounded-sm"
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
                                        <CarouselContent>
                                            {ad.photos.map((photo, index) => (
                                                <CarouselItem key={index} className="pl-4" style={{ flex: '0 0 auto', width: `${100 / Math.min(ad.photos.length, 8) + 1.2}%` }}>
                                                    <div
                                                        className={`rounded-md aspect-[4/3] relative cursor-pointer ${index === currentPhotoIndex ? 'border-2 border-blue-500' : ''}`}
                                                        onClick={() => {
                                                            setCurrentPhotoIndex(index);
                                                            api?.scrollTo(index);
                                                            thumbnailApi?.scrollTo(index);
                                                        }}
                                                    >
                                                        <Image
                                                            src={`https://pub-5e0f9c3c28524b78a12ca8f84bfb76d5.r2.dev/${user.id}/${photo}.webp`}
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
                            <Separator className="my-8" />
                            <div>
                                {/* Stats */}
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 mt-4">
                                    <div className="bg-white shadow-md border border-gray-200 p-3 rounded-lg flex flex-col items-center justify-center h-32">
                                        <Gauge className="w-8 h-8 mb-1 text-gray-500" />
                                        <p className="text-xs text-gray-500 mb-1.5">Km</p>
                                        <p className="text-sm font-bold text-gray-900">{formatNumberWithSpace(ad.km)} km</p>
                                    </div>
                                    <div className="bg-white shadow-md border border-gray-200 p-3 rounded-lg flex flex-col items-center justify-center h-32">
                                        <Fuel className="w-8 h-8 mb-1 text-gray-500" />
                                        <p className="text-xs text-gray-500 mb-1.5">Combustibil</p>
                                        <p className="text-sm font-bold text-gray-900">{ad.fuel_type}</p>
                                    </div>
                                    <div className="bg-white shadow-md border border-gray-200 p-3 rounded-lg flex flex-col items-center justify-center h-32">
                                        <Zap className="w-8 h-8 mb-1 text-gray-500" />
                                        <p className="text-xs text-gray-500 mb-1.5">Putere</p>
                                        <p className="text-sm font-bold text-gray-900">{formatNumberWithSpace(ad.power)} CP</p>
                                    </div>
                                    <div className="bg-white shadow-md border border-gray-200 p-3 rounded-lg flex flex-col items-center justify-center h-32">
                                        <Car className="w-8 h-8 mb-1 text-gray-500" />
                                        <p className="text-xs text-gray-500 mb-1.5">Capacitate</p>
                                        <p className="text-sm font-bold text-gray-900">{formatNumberWithSpace(ad.engine_size)} cm<sup>3</sup></p>
                                    </div>
                                    <div className="bg-white shadow-md border border-gray-200 p-3 rounded-lg flex flex-col items-center justify-center h-32">
                                        <Calendar className="w-8 h-8 mb-1 text-gray-500" />
                                        <p className="text-xs text-gray-500 mb-1.5">An fabricație</p>
                                        <p className="text-sm font-bold text-gray-900">{ad.year}</p>
                                    </div>
                                </div>
                                <Separator className="my-8" />
                                {/* Description */}
                                <div>
                                    <h2 className="text-3xl font-semibold mb-6">Descriere</h2>
                                    <div
                                        className="font-[350] opacity-90"
                                        dangerouslySetInnerHTML={{
                                            __html: ad.description.replace(/<p>\s*<\/p>/g, '<br>')
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="flex-shrink-0">
                            <ContactCard phoneNumber={"0770429755"} />
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div >
    )
}
