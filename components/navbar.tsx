import Image from "next/image";
import Logo from "@/public/logo.svg";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, MessageCircle, User, UserRound } from "lucide-react";

import {
    Cloud,
    CreditCard,
    Keyboard,
    LifeBuoy,
    LogOut,
    Mail,
    MessageSquare,
    Plus,
    PlusCircle,
    Settings,
    UserPlus,
    Users,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuPortal,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { toast, Toaster } from "sonner";



export default function Navbar() {
    const router = useRouter();
    const [credits, setCredits] = useState(0);
    const [avatar, setAvatar] = useState("");
    const [email, setEmail] = useState("");
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    async function logout() {
        await supabase.auth.signOut();
        localStorage.removeItem('user');
        localStorage.removeItem('avatar');
        setIsLoggedIn(false);
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
            setIsLoggedIn(false);
            return;
        }

        setIsLoggedIn(true);
        setEmail(user.email || "");

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
        getCredits();
    }, []);

    const handleAccountClick = () => {
        if (!isLoggedIn) {
            router.push("/login");
        }
    };

    return (
        <div className="w-full top-0 left-0 right-0 z-50 bg-white shadow-sm">
            <Toaster richColors position='top-center' />
            <div className="container mx-auto flex justify-between items-center py-3 px-16 bg-inherit text-black">
                <Link href="/">
                    <Image src={Logo} alt="Logo" width={100} height={100} />
                </Link>

                <div className="flex items-center justify-center gap-4">
                    <Button variant="ghost" className="flex items-center justify-center cursor-pointer">
                        <MessageCircle className="text-black mr-2 stroke-[2.2] h-5 w-5" />
                        <span className="text-black font-[600]">Mesaje</span>
                    </Button>
                    <Button variant="ghost" size="icon" className="flex items-center justify-center cursor-pointer">
                        <Heart className="text-black stroke-[2.2] h-5 w-5" />
                    </Button>
                    <div className="flex items-center justify-center">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="flex items-center justify-center cursor-pointer" onClick={handleAccountClick}>
                                    <UserRound className="text-black mr-2 stroke-[2.2] h-5 w-5" />
                                    <span className="text-black font-[600]">Contul tău</span>
                                </Button>
                            </DropdownMenuTrigger>
                            {isLoggedIn && (
                                <DropdownMenuContent className="w-56">
                                    <DropdownMenuLabel>{email}</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuGroup>
                                        <DropdownMenuItem>
                                            <User className="mr-2 h-4 w-4" />
                                            <span>Profil</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem>
                                            <CreditCard className="mr-2 h-4 w-4" />
                                            <span>Anunturi</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem>
                                            <Settings className="mr-2 h-4 w-4" />
                                            <span>Settings</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem>
                                            <Keyboard className="mr-2 h-4 w-4" />
                                            <span>Keyboard shortcuts</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuGroup>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuGroup>
                                        <DropdownMenuItem>
                                            <Users className="mr-2 h-4 w-4" />
                                            <span>Team</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuSub>
                                            <DropdownMenuSubTrigger>
                                                <UserPlus className="mr-2 h-4 w-4" />
                                                <span>Invite users</span>
                                            </DropdownMenuSubTrigger>
                                            <DropdownMenuPortal>
                                                <DropdownMenuSubContent>
                                                    <DropdownMenuItem>
                                                        <Mail className="mr-2 h-4 w-4" />
                                                        <span>Email</span>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem>
                                                        <MessageSquare className="mr-2 h-4 w-4" />
                                                        <span>Message</span>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem>
                                                        <PlusCircle className="mr-2 h-4 w-4" />
                                                        <span>More...</span>
                                                    </DropdownMenuItem>
                                                </DropdownMenuSubContent>
                                            </DropdownMenuPortal>
                                        </DropdownMenuSub>
                                        <DropdownMenuItem>
                                            <Plus className="mr-2 h-4 w-4" />
                                            <span>New Team</span>
                                            <DropdownMenuShortcut>⌘+T</DropdownMenuShortcut>
                                        </DropdownMenuItem>
                                    </DropdownMenuGroup>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem>
                                        <LifeBuoy className="mr-2 h-4 w-4" />
                                        <span>Support</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem disabled>
                                        <Cloud className="mr-2 h-4 w-4" />
                                        <span>API</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={logout} className="cursor-pointer">
                                        <LogOut className="mr-2 h-4 w-4" />
                                        <span>Log out</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            )}
                        </DropdownMenu>
                    </div>
                    <Button variant="outline" className="font-semibold text-primary py-3 px-5 flex items-center justify-center rounded-md group relative overflow-hidden">
                        <Plus className="mr-2 h-5 w-5" /> Adaugă un anunț
                    </Button>
                </div>
            </div>
        </div>
    );
}