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
}

export default function Card({ id, brand, model, price, location, date, photo }: CardProps) {
    return (
        <Link href={`/a/${id}`} className="bg-white hover:scale-105 transition-all duration-300 rounded-sm max-w-[16rem] drop-shadow-xl">
            <div className="relative h-[12rem] aspect-[4/3]">
                <Image
                    src={`https://pub-5e0f9c3c28524b78a12ca8f84bfb76d5.r2.dev/user-id-here/${photo}.webp`}
                    alt={`${brand} ${model} thumbnail`}
                    layout="responsive"
                    width={100}
                    height={100}
                    objectFit="cover"
                    className="rounded-t-sm"
                    fetchPriority="high"
                    priority
                    loading="eager"
                    quality={10}
                />
            </div>
            <div className="py-6 px-4 text-left">
                <div className="flex justify-between">
                    <h3 className="text-primary font-[300] text-sm">
                        {brand} {model}
                    </h3>
                    <Heart size={20} className="text-primary cursor-pointer" />
                </div>
                <p className="font-[600] mt-1">{price} lei</p>

                <div className="text-[11px] flex flex-col items-left text-left mt-6 text-primary/50">
                    <p className="">{location}</p>
                    <div className="">{date}</div>
                </div>
            </div>
        </Link>
    );
}