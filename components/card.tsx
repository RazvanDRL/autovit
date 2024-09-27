import { Heart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface CardProps {
    id: string;
    brand: string;
    model: string;
    price: number;
    location: string;
    date: string;
    photo: string;
    size?: 'small' | 'medium' | 'large';
}

export default function Card({ id, brand, model, price, location, date, photo, size = 'medium' }: CardProps) {
    const sizeClasses = {
        small: "w-40 h-48",
        medium: "w-64 h-80",
        large: "w-80 h-96"
    };

    const imageClasses = {
        small: "h-24",
        medium: "h-40",
        large: "h-56"
    };

    const textClasses = {
        small: "text-xs",
        medium: "text-sm",
        large: "text-base"
    };

    return (
        <Link href={`/a/${id}`} className={`bg-white hover:scale-105 transition-all duration-300 rounded-sm drop-shadow-xl ${sizeClasses[size]}`}>
            <div className={`relative aspect-[4/3] ${imageClasses[size]}`}>
                <Image
                    src={`https://pub-5e0f9c3c28524b78a12ca8f84bfb76d5.r2.dev/user-id-here/${photo}.webp`}
                    alt={`${brand} ${model} thumbnail`}
                    layout="fill"
                    objectFit="cover"
                    className="rounded-t-sm"
                    fetchPriority="high"
                    priority
                    loading="eager"
                    quality={10}
                />
            </div>
            <div className="py-3 px-2 text-left">
                <div className="flex justify-between items-center">
                    <h3 className={`text-primary font-[300] ${textClasses[size]}`}>
                        {brand} {model}
                    </h3>
                    <Heart size={size === 'small' ? 16 : 20} className="text-primary cursor-pointer" />
                </div>
                <p className={`font-[600] mt-1 ${textClasses[size]}`}>{price} lei</p>

                <div className={`${size === 'small' ? 'text-[9px]' : 'text-[11px]'} flex flex-col items-left text-left mt-2 text-primary/50`}>
                    <p className="">{location}</p>
                    <div className="">{date}</div>
                </div>
            </div>
        </Link>
    );
}