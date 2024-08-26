import Image from "next/image";
import Logo from "@/public/next.svg";
import React from "react";
import Link from "next/link";
import { Heart, MessageCircle, User, UserRound } from "lucide-react";



export default function Navbar() {
    return (
        <div className="w-full top-0 left-0 right-0 z-50 bg-primary">
            <div className="container mx-auto flex justify-between items-center py-3 px-16 bg-primary text-black">
                <div className="text-white">
                    eVandSiCumpar
                </div>

                <div className="flex items-center justify-center gap-10">
                    <div className="flex items-center justify-center">
                        <MessageCircle className="text-white mr-4 stroke-[2.2]" size={24} />
                        <span className="text-white font-[600]">Mesaje</span>
                    </div>
                    <Heart className="text-white stroke-[2.2]" size={24} />
                    <div className="flex items-center justify-center">
                        <UserRound className="text-white mr-4 stroke-[2.2]" size={24} />
                        <span className="text-white font-[600]">Contul tău</span>
                    </div>
                    <button
                        className="bg-[#F2F4F5] hover:bg-primary hover:text-[#F2F4F5] font-semibold text-primary py-3 px-5 flex items-center justify-center rounded-md group relative overflow-hidden"
                    >
                        <Link href="/adauga">
                            <span className="absolute inset-[0px] rounded-md border-[5px] border-transparent group-hover:border-[#F2F4F5]">
                            </span>
                            <span className="relative z-10">
                                Adauga un anunt nou
                            </span>
                        </Link>
                    </button>
                </div>
            </div>
        </div>
    );
}