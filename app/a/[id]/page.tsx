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
import { Share2, Heart, ChevronRight, Calendar, Gauge, Fuel, Power, MapPin, Maximize2, X, Zap, Droplet, Car, ChevronLeft, Camera, ChevronDown, ChevronUp } from "lucide-react";
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
    const [isExpanded, setIsExpanded] = useState(false);

    const stats = [
        {
            icon: <Gauge className="w-8 h-8 mb-1 text-gray-500" />,
            label: 'Km',
            value: formatNumberWithSpace(Number(ad?.km)) + ' km'
        },
        {
            icon: <Fuel className="w-8 h-8 mb-1 text-gray-500" />,
            label: 'Combustibil',
            value: ad?.fuel_type
        },
        {
            icon: <Zap className="w-8 h-8 mb-1 text-gray-500" />,
            label: 'Putere',
            value: formatNumberWithSpace(Number(ad?.power)) + ' CP'
        },
        {
            icon: <Car className="w-8 h-8 mb-1 text-gray-500" />,
            label: 'Capacitate',
            value: <>{formatNumberWithSpace(Number(ad?.engine_size))} cm<sup>3</sup></>
        },
        {
            icon: <Calendar className="w-8 h-8 mb-1 text-gray-500" />,
            label: 'An fabricație',
            value: ad?.year
        }
    ]

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
            <div className="mt-[8rem] container mx-auto p-4 max-w-6xl">
                <Toaster richColors position='top-center' />
                <div className="mb-6 flex justify-between items-center w-full">
                    <nav className="flex" aria-label="Breadcrumb">
                        <ol className="inline-flex items-center space-x-1 md:space-x-3">
                            <li className="inline-flex items-center">
                                <Link href="/" className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600">
                                    Acasa
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
                            <div className="rounded-sm flex items-center gap-4 bg-gray-200/50 justify-center max-w-[48rem] relative">
                                <Button
                                    variant="ghost"
                                    onClick={handlePrevious}
                                    className="bg-black/80 text-white rounded-full hover:bg-black/75 w-10 h-10 p-0 flex items-center justify-center"
                                >
                                    <ChevronLeft className="h-5 w-5" />
                                </Button>

                                <div ref={carouselRef} className="aspect-[4/3] w-[36rem] h-[27rem] flex justify-center items-center overflow-hidden cursor-pointer">
                                    {ad.photos && ad.photos.length > 0 ? (
                                        <>
                                            <Carousel className="aspect-[4/3] w-full h-full" opts={{ loop: true }} setApi={setApi}>
                                                <CarouselContent>
                                                    {ad.photos.map((photo, index) => (
                                                        <CarouselItem key={index}>
                                                            <Card>
                                                                <CardContent className="p-0 aspect-[4/3] relative">
                                                                    <Image
                                                                        src={`https://pub-5e0f9c3c28524b78a12ca8f84bfb76d5.r2.dev/${params.id}/${photo}.webp`}
                                                                        alt={`${ad.brand} ${ad.model}`}
                                                                        layout="fill"
                                                                        objectFit="cover"
                                                                        loading="eager"
                                                                        fetchPriority="high"
                                                                        priority
                                                                        className=""
                                                                    />
                                                                </CardContent>
                                                            </Card>
                                                        </CarouselItem>
                                                    ))}
                                                </CarouselContent>
                                            </Carousel>
                                        </>
                                    ) : (
                                        <p>No photos available</p>
                                    )}
                                </div>
                                <div className="flex items-center text-xs absolute bottom-2 right-2 bg-black bg-opacity-50 opacity-90 text-white px-2 py-1 rounded">
                                    <Camera className="w-4 h-4 mr-1.5" />
                                    {currentPhotoIndex + 1} / {ad.photos.length}
                                </div>

                                <Button
                                    variant="ghost"
                                    onClick={handleNext}
                                    className="bg-black/80 text-white rounded-full hover:bg-black/75 w-10 h-10 p-0 flex items-center justify-center"
                                >
                                    <ChevronRight className="h-5 w-5" />
                                </Button>
                            </div>
                            {ad.photos && ad.photos.length > 0 && (
                                <div className="mt-4 w-[48rem]">
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
                                                            src={`https://pub-5e0f9c3c28524b78a12ca8f84bfb76d5.r2.dev/${params.id}/${photo}-thumbnail.webp`}
                                                            alt={`${ad.brand} ${ad.model} thumbnail`}
                                                            layout="fill"
                                                            objectFit="cover"
                                                            className="rounded-sm"
                                                            loading="eager"
                                                            fetchPriority="high"
                                                            priority
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
                                <div className="flex flex-wrap md:grid md:grid-cols-5 gap-2 justify-between mt-4 px-4 sm:px-0">
                                    {stats.map((stat, index) => (
                                        <div key={index} className="bg-white md:shadow-md md:border md:border-gray-200 py-3 md:px-6 rounded-lg flex flex-col items-center justify-center">
                                            {stat.icon}
                                            <p className="text-[10px] md:text-xs text-gray-500">{stat.label}</p>
                                            <p className="text-xs md:text-sm font-bold text-gray-900">{stat.value}</p>
                                        </div>
                                    ))}
                                </div>
                                <Separator className="my-8" />
                                {/* Description */}
                                <div>
                                    <h2 className="text-3xl font-semibold mb-6">Descriere</h2>
                                    <div
                                        className={`font-[350] opacity-90 ${!isExpanded ? "max-h-[24em] overflow-hidden" : ""}`}
                                        dangerouslySetInnerHTML={{
                                            __html: ad.description.replace(/<p>\s*<\/p>/g, '<br>')
                                        }}
                                    />
                                    <button
                                        onClick={() => setIsExpanded(!isExpanded)}
                                        className="text-blue-500 font-semibold hover:text-blue-500/80 flex items-center"
                                    >
                                        {isExpanded ? "Vezi mai puțin" : "Vezi mai mult"}
                                        {isExpanded ? <ChevronUp className="w-5 h-5 ml-1" /> : <ChevronDown className="w-5 h-5 ml-1" />}
                                    </button>
                                </div>
                                <Separator className="my-8" />
                            </div>
                        </div>
                        <div className="flex-shrink-0 lg:block hidden">
                            <ContactCard phoneNumber={"0770429755"} />
                        </div>
                        <div className="fixed bottom-0 left-0 right-0 lg:hidden">
                            <ContactCard phoneNumber={"0770429755"} />
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div >
    )
}
