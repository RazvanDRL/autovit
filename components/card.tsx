import { formatNumberWithSpace } from "@/lib/numberFormat"
import { Heart, Calendar, MapPin, Fuel, Gauge } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface CardProps {
    id: string
    brand: string
    model: string
    price: number
    location: string
    photo: string
    size?: "small" | "medium" | "large"
    year: number
    km: number
    fuel_type: string
    isFavorite?: boolean
    onFavoriteClick?: (e: React.MouseEvent, id: string) => void
    isProcessing?: boolean
    isLoading?: boolean
}

export default function Card({
    id,
    brand,
    model,
    price,
    location,
    photo,
    size = "medium",
    year,
    km,
    fuel_type,
    isFavorite = false,
    onFavoriteClick,
    isProcessing = false,
    isLoading = false,
}: CardProps) {
    const sizeConfig = {
        small: {
            width: 160,
            imageHeight: 96,
            textBase: "text-xs",
            heartSize: 16,
            locationText: "text-[9px]",
            iconSize: 12,
        },
        medium: {
            width: 256,
            imageHeight: 160,
            textBase: "text-sm",
            heartSize: 20,
            locationText: "text-[11px]",
            iconSize: 14,
        },
        large: {
            width: 320,
            imageHeight: 224,
            textBase: "text-base",
            heartSize: 24,
            locationText: "text-xs",
            iconSize: 16,
        },
    }

    const config = sizeConfig[size]

    if (isLoading) {
        return (
            <div
                className="bg-white shadow-md border border-gray-100 rounded-lg overflow-hidden flex flex-col animate-pulse"
                style={{ width: config.width }}
            >
                <div className="relative bg-gray-200" style={{ height: config.imageHeight }} />
                <div className="p-3 flex-grow">
                    <div className="h-4 bg-gray-100 rounded w-3/4 mb-2" />
                    <div className="h-4 bg-gray-100 rounded w-1/2 mb-3" />
                    <div className="space-y-2">
                        <div className="h-3 bg-gray-100 rounded w-1/3" />
                        <div className="h-3 bg-gray-100 rounded w-2/5" />
                        <div className="h-3 bg-gray-100 rounded w-1/4" />
                    </div>
                    <div className="h-3 bg-gray-100 rounded w-2/3 mt-3" />
                </div>
            </div>
        )
    }

    return (
        <Link
            href={`/a/${id}`}
            className="bg-white shadow-md transition-all duration-300 rounded-lg overflow-hidden flex flex-col hover:shadow-md hover:-translate-y-1 hover:scale-[1.02]"
            style={{ width: config.width }}
        >
            <div className="relative" style={{ height: config.imageHeight }}>
                <Image
                    src={`https://pub-5e0f9c3c28524b78a12ca8f84bfb76d5.r2.dev/${id}/${photo}-thumbnail.webp`}
                    alt={`${brand} ${model} thumbnail`}
                    layout="fill"
                    objectFit="cover"
                    fetchPriority="high"
                    priority
                    loading="eager"
                    quality={50}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        if (onFavoriteClick) {
                            onFavoriteClick(e, id);
                        }
                    }}
                    disabled={isProcessing}
                    className={`absolute top-2 right-2 p-1 bg-white/80 rounded-full 
                        hover:bg-white transition-colors duration-200
                        ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                    aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                >
                    <Heart
                        size={config.iconSize + 4}
                        className={`${isFavorite ? 'fill-[#E83B3B]' : ''} 
                            text-[#E83B3B] hover:text-red-500 transition-colors duration-200
                            ${isProcessing ? 'opacity-50' : ''}`}
                    />
                </button>
            </div>
            <div className="p-3 flex-grow">
                <h3
                    className={`text-primary font-medium ${config.textBase} truncate`}
                >
                    {brand} {model}
                </h3>
                <p className={`font-bold mt-1 ${config.textBase} text-primary`}>
                    {formatNumberWithSpace(price)} EUR
                </p>
                <div className={`mt-2 ${config.textBase} text-primary/80`}>
                    <div className="flex items-center">
                        <Calendar size={config.iconSize} className="mr-1" />
                        <span>{year}</span>
                    </div>
                    <div className="flex items-center mt-1">
                        <Gauge size={config.iconSize} className="mr-1" />
                        <span>{formatNumberWithSpace(km)} km</span>
                    </div>
                    <div className="flex items-center mt-1">
                        <Fuel size={config.iconSize} className="mr-1" />
                        <span>{fuel_type}</span>
                    </div>
                </div>
                <div
                    className={`${config.locationText} flex justify-between items-center mt-2 text-primary/60`}
                >
                    <div className="flex items-center truncate flex-1">
                        <MapPin size={config.iconSize} className="mr-1 shrink-0" />
                        <p className="truncate">{location}</p>
                    </div>
                </div>
            </div>
        </Link>
    )
}