import Image from "next/image";
import Logo from "@/public/logo.svg";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, MessageCircle, User, UserRound } from "lucide-react";

import {
    CreditCard,
    LifeBuoy,
    LogOut,
    MessageSquare,
    Plus,
    Settings,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { User as UserType } from '@supabase/supabase-js';
// Add this near the top of the file, outside the component
export const FAVORITES_UPDATED_EVENT = 'favoritesUpdated' as const;

declare global {
    interface WindowEventMap {
        [FAVORITES_UPDATED_EVENT]: CustomEvent<{ count: number }>;
    }
}

export default function Navbar() {
    const router = useRouter();
    const [user, setUser] = useState<UserType | null>(null);
    const [credits, setCredits] = useState(0);
    const [favoritesCount, setFavoritesCount] = useState(0);

    async function logout() {
        await supabase.auth.signOut();
        router.push("/");
    }

    async function getCredits() {
        const storedUser = localStorage.getItem('user');
        let user;

        if (storedUser) {
            user = JSON.parse(storedUser);
        } else {
            const { data: { user: fetchedUser } } = await supabase.auth.getUser();
            if (fetchedUser) {
                localStorage.setItem('user', JSON.stringify(fetchedUser));
                user = fetchedUser;
            }
        }

        if (!user) {
            return;
        }
        const { data, error } = await supabase
            .from('profiles')
            .select('credits')
            .eq('id', user.id);

        if (error) {
            toast.error(error.message);
        }

        if (data && data.length > 0) {
            if (data[0].credits)
                setCredits(Number(data[0].credits));
        }
    }

    useEffect(() => {
        const initializeData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);

            if (user) {
                const { count, error } = await supabase
                    .from('favorites')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', user.id);

                if (error) {
                    console.error('Error fetching favorites:', error);
                    return;
                }

                setFavoritesCount(count || 0);
            }
        };

        initializeData();

        // Listen for favorites updates
        const handleFavoritesUpdate = (e: CustomEvent) => {
            setFavoritesCount(e.detail.count);
        };

        window.addEventListener(FAVORITES_UPDATED_EVENT, handleFavoritesUpdate as EventListener);

        return () => {
            window.removeEventListener(FAVORITES_UPDATED_EVENT, handleFavoritesUpdate as EventListener);
        };
    }, []);

    const handleAccountClick = () => {
        if (!user) {
            router.push("/login");
        }
    };

    return (
        <div className="w-full top-0 left-0 right-0 z-50 bg-white shadow-md border-b border-gray-200 sticky">
            <div className="container mx-auto flex justify-between items-center py-2 sm:py-3 px-4 sm:px-8 md:px-16 bg-inherit text-black">
                <Link href="/" className="flex-shrink-0">
                    <Image src={Logo} alt="Logo" width={80} height={90} className="w-[80px] sm:w-[90px]" />
                </Link>

                <div className="flex items-center gap-2 sm:gap-4">
                    <Link href="/profile/messages">
                        <Button variant="ghost" size="sm" className="hidden sm:flex items-center justify-center">
                            <MessageCircle className="text-black mr-2 stroke-[2.2] h-5 w-5" />
                            <span className="text-black font-[600]">Mesaje</span>
                        </Button>
                        <Button variant="ghost" size="icon" className="sm:hidden w-9 h-9">
                            <MessageCircle className="text-black stroke-[2.2] h-5 w-5" />
                        </Button>
                    </Link>

                    <Link href="/profile/favorites">
                        <Button variant="ghost" size="icon" className="w-9 h-9 sm:w-10 sm:h-10 relative">
                            <Heart className="text-black stroke-[2.2] h-5 w-5" />
                            {favoritesCount > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 bg-[#E83B3B] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                    {favoritesCount > 99 ? '99+' : favoritesCount}
                                </span>
                            )}
                        </Button>
                    </Link>

                    <div className="flex items-center">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <div className="flex items-center">
                                    <Button variant="ghost" size="sm" className="hidden sm:flex items-center" onClick={handleAccountClick}>
                                        <UserRound className="text-black mr-2 stroke-[2.2] h-5 w-5" />
                                        <span className="text-black font-[600] select-none">Contul tău</span>
                                    </Button>
                                    <Button variant="ghost" size="icon" className="sm:hidden w-9 h-9" onClick={handleAccountClick}>
                                        <UserRound className="text-black stroke-[2.2] h-5 w-5" />
                                    </Button>
                                </div>
                            </DropdownMenuTrigger>
                            {user && (
                                <DropdownMenuContent className="w-64 md:w-72" align="end" sideOffset={8}>
                                    <DropdownMenuLabel className="font-normal">
                                        <div className="flex flex-col space-y-1">
                                            <p className="text-sm font-medium leading-none">Cont</p>
                                            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuGroup>
                                        <Link href="/profile">
                                            <DropdownMenuItem className="cursor-pointer focus:bg-gray-100">
                                                <User className="mr-2 h-4 w-4" />
                                                <span>Profil</span>
                                            </DropdownMenuItem>
                                        </Link>
                                        <Link href="/profile/myads">
                                            <DropdownMenuItem className="cursor-pointer focus:bg-gray-100">
                                                <CreditCard className="mr-2 h-4 w-4" />
                                                <span>Anunțurile mele</span>
                                            </DropdownMenuItem>
                                        </Link>
                                        <Link href="/profile/settings">
                                            <DropdownMenuItem className="cursor-pointer focus:bg-gray-100">
                                                <Settings className="mr-2 h-4 w-4" />
                                                <span>Setări cont</span>
                                            </DropdownMenuItem>
                                        </Link>
                                    </DropdownMenuGroup>

                                    <DropdownMenuSeparator />

                                    <DropdownMenuGroup>
                                        <Link href="/ajutor">
                                            <DropdownMenuItem className="cursor-pointer focus:bg-gray-100">
                                                <LifeBuoy className="mr-2 h-4 w-4" />
                                                <span>Ajutor</span>
                                            </DropdownMenuItem>
                                        </Link>
                                        <Link href="/contact">
                                            <DropdownMenuItem className="cursor-pointer focus:bg-gray-100">
                                                <MessageSquare className="mr-2 h-4 w-4" />
                                                <span>Contactează-ne</span>
                                            </DropdownMenuItem>
                                        </Link>
                                    </DropdownMenuGroup>

                                    <DropdownMenuSeparator />

                                    <DropdownMenuItem
                                        onClick={logout}
                                        className="cursor-pointer focus:bg-gray-100 text-red-600 focus:text-red-600"
                                    >
                                        <LogOut className="mr-2 h-4 w-4" />
                                        <span>Deconectare</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            )}
                        </DropdownMenu>
                    </div>

                    <Link href="/adauga">
                        <Button variant="outline" className="select-none hidden sm:flex font-semibold text-primary py-2 px-4 sm:py-3 sm:px-5 items-center justify-center rounded-md group relative overflow-hidden transition-all duration-300 hover:bg-primary hover:text-white transform hover:scale-105 hover:shadow-lg before:absolute before:inset-0 before:bg-primary/10 before:scale-x-0 hover:before:scale-x-100 before:transition-transform before:duration-300 before:origin-left">
                            <Plus className="mr-2 h-5 w-5 transition-transform group-hover:rotate-90 duration-300" />
                            Adaugă un anunț
                        </Button>
                        <Button variant="outline" size="icon" className="sm:hidden w-9 h-9">
                            <Plus className="h-5 w-5" />
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}