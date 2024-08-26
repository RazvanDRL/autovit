import { cn } from "@/lib/utils";
import { Calendar, Fuel, Gauge, Heart, User } from "lucide-react";
import Image from "next/image";

interface CardProps {
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
    date: string;
    className?: string;
}

function formatNumberWithSpace(number: number) {
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(number).replace(/,/g, ' ');
}

export default function Card({ id, title, price, engine_size, power, description, km, fuelType, year, location, date, className }: CardProps) {
    return (
        <a href={`/anunt/${id}`} className={cn("p-4 border border-gray-200 bg-white rounded-sm max-w-[1000px] cursor-pointer", className)}>
            <div className="flex items-start"> {/* Ensure items are aligned at the start */}
                <div className="w-[240px] h-[180px] relative">
                    <Image
                        src={`https://pub-6d5910db9c3d49d386074d553c5f4af0.r2.dev/${id}.webp`}
                        alt="Placeholder"
                        fill
                        className="rounded-sm object-cover"
                        priority
                        quality={20}
                    />
                </div>
                <div className="flex-1 pl-4">
                    <div className="flex justify-between">
                        <div className="">
                            <h3 className="text-primary font-[600] text-base">
                                {title}
                            </h3>
                            <span className="text-black/50 text-xs">
                                {formatNumberWithSpace(engine_size)} cm<sup>3</sup>
                                <span className="pl-1">&nbsp;-&nbsp;&nbsp;</span>
                                {power} CP
                                <span className="pl-1">&nbsp;-&nbsp;&nbsp;</span>
                                {description}
                            </span>
                            <div className="flex my-2">
                                <div className="flex items-center mr-6">
                                    <Gauge size={16} className="text-[#7F7F7F] mr-2" />
                                    <span className="text-black/80 text-sm"> {formatNumberWithSpace(km)} km</span>
                                </div>
                                <div className="flex items-center mr-6">
                                    <Fuel size={16} className="text-[#7F7F7F] mr-2" />
                                    <span className="text-black/80 text-sm">{fuelType}</span>
                                </div>
                                <div className="flex items-center mr-6">
                                    <Calendar size={16} className="text-[#7F7F7F] mr-2" />
                                    <span className="text-black/80 text-sm">{year}</span>
                                </div>
                            </div>
                            <div className="mt-4 text-xs text-black/80">
                                {location}
                            </div>
                            <div className="mt-2 text-xs text-black/80">
                                {date}
                            </div>
                            <div className="mt-4 flex items-center mr-6">
                                <User size={16} className="text-[#7F7F7F] mr-2" />
                                <span className="text-black/80 text-xs">Privat</span>
                            </div>
                        </div>
                        <span className="text-black font-[500] text-[24px]">
                            {formatNumberWithSpace(price)}
                            <span className="pl-[4px] text-[12px]">EUR</span>
                        </span>
                    </div>
                </div>
            </div>
        </a>
    );
}
