import { cn } from "@/lib/utils";
import { Building2, Calendar, Fuel, Gauge, Heart, MapPin, User } from "lucide-react";
import Image from "next/image";
import { formatNumberWithSpace } from "@/lib/numberFormat";
import { formatTimeAgo } from "@/lib/timeFormat";

interface CardProps {
    listingId: string;
    id: string;
    title: string;
    price: number;
    engine_size: number;
    power: number;
    description?: string;
    km: number;
    fuelType: string;
    year: number;
    location: string;
    created_at: string;
    is_company: boolean;
    className?: string;
}

export default function CardHorizontal({ listingId, id, title, price, engine_size, power, description, km, fuelType, year, location, created_at, is_company, className }: CardProps) {
    return (
        <a href={`/a/${listingId}`} className={cn("py-4 md:py-8 border-b border-gray-200 bg-white rounded-sm max-w-[55rem] cursor-pointer", className)}>
            <div className="flex flex-col md:flex-row md:items-start">
                <div className="w-full md:w-[280px] md:h-[210px] aspect-[4/3] h-auto relative">
                    <Image
                        src={`https://pub-5e0f9c3c28524b78a12ca8f84bfb76d5.r2.dev/${listingId}/${id}.webp`}
                        alt="Placeholder"
                        fill
                        className="rounded-sm object-cover border border-gray-100 aspect-[4/3]"
                        priority
                        quality={20}
                    />
                </div>
                <div className="flex-1 pt-4 md:pt-0 md:pl-4">
                    <div className="flex flex-col md:flex-row md:justify-between">
                        <div>
                            <h3 className="text-primary font-[600] text-[16px] md:text-[18px]">
                                {title}
                            </h3>
                            <p className="text-[13px] md:text-[14px] text-black/50">
                                <span>
                                    {formatNumberWithSpace(engine_size)}&nbsp;
                                </span>
                                <span className="text-[11px] md:text-[12px]">cm<sup>3</sup></span>
                                <span>
                                    &nbsp;-&nbsp;
                                </span>
                                <span>{power} CP</span>
                                <span>
                                    &nbsp;-&nbsp;
                                </span>
                                <span>{description}</span>
                            </p>
                            <div>
                                <div className="flex flex-wrap items-center gap-2 md:gap-4 mt-4 mb-4 text-[13px] md:text-[14px] text-black/80">
                                    <div className="flex items-center justify-center">
                                        <Calendar size={16} className="mr-2" />
                                        {year}
                                    </div>
                                    <div className="flex items-center justify-center">
                                        <Gauge size={16} className="mr-2" />
                                        {formatNumberWithSpace(km)} km
                                    </div>
                                    <div className="flex items-center justify-center">
                                        <Fuel size={16} className="mr-2" />
                                        {fuelType}
                                    </div>
                                </div>
                                <div className="flex items-center text-[13px] md:text-[14px] text-black/80 mb-4 md:mb-10">
                                    <MapPin size={16} className="mr-1" />
                                    {location}
                                </div>
                                <span className="flex items-center text-[11px] md:text-[12px] text-black/50 mb-2">
                                    {"Reactualizat cu " + formatTimeAgo(created_at)}
                                </span>
                                {is_company ?
                                    <span className="flex items-center text-[11px] md:text-[12px] text-black/50 mb-2">
                                        <Building2 size={16} className="mr-1" />
                                        Dealer
                                    </span>
                                    :
                                    <span className="flex items-center text-[11px] md:text-[12px] text-black/50 mb-2">
                                        <User size={16} className="mr-1" />
                                        Privat
                                    </span>
                                }
                            </div>
                        </div>
                        <span className="text-[#E83B3B] font-[700] text-[24px] mt-4 md:mt-0">
                            {formatNumberWithSpace(price)}
                            <span className="pl-[4px] text-[12px]">EUR</span>
                        </span>
                    </div>
                </div>
            </div>
        </a>
    );
}
