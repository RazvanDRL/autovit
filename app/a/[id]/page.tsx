"use client";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";
import { useState, useEffect, useCallback, useRef } from "react";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
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
import Breadcrumb from "@/components/breadcrumb";
import { Ad } from "@/types/schema";

export default function Page() {
    const params = useParams<{ id: string }>();
    const [ad, setAd] = useState<Ad | null>(null);
    const [user, setUser] = useState<UserType | null>(null);
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
    const [api, setApi] = useState<CarouselApi>();
    const [thumbnailApi, setThumbnailApi] = useState<CarouselApi>();
    const [isFavourite, setIsFavourite] = useState(false);
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

    useKeyPress("ArrowLeft", handlePrevious);
    useKeyPress("ArrowRight", handleNext);

    const handlePhotoChange = (index: number) => {
        setCurrentPhotoIndex(index);
        api?.scrollTo(index);
    };

    useEffect(() => {
        if (!api) return;

        api.on("select", () => {
            const selectedIndex = api.selectedScrollSnap();
            setCurrentPhotoIndex(selectedIndex);
            thumbnailApi?.scrollTo(selectedIndex);
        });
    }, [api, thumbnailApi]);

    if (!ad) {
        return <Loading />;
    }

    return (
        <div>
            <Navbar />
            <div className="mt-[8rem] container overflow-x-hidden mx-auto p-4 max-w-6xl">
                <Toaster richColors position='top-center' />
                <div className="mb-6 flex justify-between items-center w-full">
                    <Breadcrumb brand={ad.brand} model={ad.model} />
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
                <div className="flex flex-col sm:flex-row justify-between mb-4 sm:mb-6 gap-2 sm:gap-0">
                    <div className="flex flex-col">
                        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 break-words">
                            {ad.brand}{" "}{ad.model}{" - "}{ad.short_description}
                        </h1>
                        <p className="text-[11px] sm:text-xs opacity-50 mt-0.5 sm:mt-1">
                            Postat cu {ad.created_at ? formatTimeAgo(ad.created_at) : ''}
                        </p>
                    </div>
                    <p className="text-xl sm:text-2xl md:text-3xl font-semibold sm:mt-2 text-[#EB2126] whitespace-nowrap">
                        {formatNumberWithSpace(ad.price)} EUR
                    </p>
                </div>
                <div className="flex flex-col">
                    <div className="flex justify-between">
                        <div>
                            <div className="rounded-sm flex items-center gap-4 justify-center w-full relative overflow-hidden md:bg-gray-200/50 bg-transparent">
                                <Button
                                    variant="ghost"
                                    onClick={handlePrevious}
                                    className="hidden md:flex bg-black/80 hover:text-white text-white rounded-full hover:bg-black/75 w-10 h-10 p-0 items-center justify-center"
                                >
                                    <ChevronLeft className="h-5 w-5" />
                                </Button>

                                <div ref={carouselRef} className="w-full aspect-[4/3] max-w-[100vw] md:max-w-[36rem] flex justify-center items-center overflow-hidden cursor-pointer">
                                    {ad.photos && ad.photos.length > 0 ? (
                                        <>
                                            <Carousel className="aspect-[4/3] w-full h-full" opts={{ loop: true }} setApi={setApi} onChangeCapture={() => {
                                                console.log('changed')
                                            }} >
                                                <Button
                                                    variant="ghost"
                                                    onClick={handlePrevious}
                                                    className="md:hidden absolute z-[999] top-1/2 -translate-y-1/2 left-2 bg-black/80 hover:text-white text-white rounded-full hover:bg-black/75 w-10 h-10 p-0 flex items-center justify-center"
                                                >
                                                    <ChevronLeft className="h-5 w-5" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    onClick={handleNext}
                                                    className="md:hidden absolute z-[999] top-1/2 -translate-y-1/2 right-2 bg-black/80 hover:text-white text-white rounded-full hover:bg-black/75 w-10 h-10 p-0 flex items-center justify-center"
                                                >
                                                    <ChevronRight className="h-5 w-5" />
                                                </Button>
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
                                                <div className="flex md:hidden items-center text-xs absolute bottom-2 right-2 bg-black bg-opacity-50 opacity-90 text-white px-2 py-1 rounded">
                                                    <Camera className="w-4 h-4 mr-1.5" />
                                                    {currentPhotoIndex + 1} / {ad.photos.length}
                                                </div>
                                            </Carousel>
                                        </>
                                    ) : (
                                        <p>No photos available</p>
                                    )}
                                </div>
                                <div className="hidden md:flex items-center text-xs absolute bottom-2 right-2 bg-black bg-opacity-50 opacity-90 text-white px-2 py-1 rounded">
                                    <Camera className="w-4 h-4 mr-1.5" />
                                    {currentPhotoIndex + 1} / {ad.photos.length}
                                </div>

                                <Button
                                    variant="ghost"
                                    onClick={handleNext}
                                    className="hidden md:flex bg-black/80 hover:text-white text-white rounded-full hover:bg-black/75 w-10 h-10 p-0 items-center justify-center"
                                >
                                    <ChevronRight className="h-5 w-5" />
                                </Button>
                            </div>
                            {ad.photos && ad.photos.length > 0 && (
                                <div className="mt-4 w-full max-w-full overflow-hidden px-2 sm:px-4 md:px-0">
                                    <Carousel
                                        className="w-full"
                                        opts={{
                                            loop: true,
                                            align: "start",
                                            slidesToScroll: 1
                                        }}
                                        setApi={setThumbnailApi}
                                    >
                                        <CarouselContent className="-ml-2 sm:-ml-4">
                                            {ad.photos.map((photo, index) => (
                                                <CarouselItem key={index} className="pl-2 sm:pl-4 basis-1/5 xs:basis-1/6 sm:basis-1/6 md:basis-1/8">
                                                    <div
                                                        className={`rounded-md aspect-[4/3] relative cursor-pointer hover:opacity-90 transition-opacity
                                                            ${index === currentPhotoIndex ? 'border-2 border-blue-500' : 'border-1 border-gray-200'}`}
                                                        onClick={() => {
                                                            handlePhotoChange(index);
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
                        <div className="pl-8 flex-shrink-0 lg:block hidden">
                            <ContactCard user_id={ad.user_id} user_phone={ad.user_phone} user_full_name={ad.user_full_name} is_company={ad.is_company} />
                        </div>
                        <div className="fixed bottom-0 left-0 right-0 lg:hidden">
                            <ContactCard user_id={ad.user_id} user_phone={ad.user_phone} user_full_name={ad.user_full_name} is_company={ad.is_company} />
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div >
    )
}
