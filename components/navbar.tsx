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

    async function logout() {
        console.log("Logout");
        await supabase.auth.signOut();
        router.push("/");
    }

    async function getCredits() {
        console.log("Get credits");
        const id = (await supabase.auth.getUser()).data?.user?.id;

        if (!id) {
            return;
        }

        const { data, error } = await supabase
            .from('profiles')
            .select('credits,avatar')
            .eq('id', id);

        if (error) {
            toast.error(error.message);
        }

        if (data && data.length > 0) {
            if (data[0].avatar) {
                setAvatar(data[0].avatar);
                // localStorage.setItem(`avatar_${id}`, data[0].avatar);
            }
            if (data[0].credits)
                setCredits(Number(data[0].credits));
        }
    }

    useEffect(() => {
        getCredits();
    }, []);

    return (
        <div className="w-full top-0 left-0 right-0 z-50 bg-primary">
            <Toaster richColors position='top-center' />
            <div className="container mx-auto flex justify-between items-center py-3 px-16 bg-primary text-black">
                <div className="">
                    <Image src={Logo} alt="Logo" width={100} height={100} />
                </div>

                <div className="flex items-center justify-center gap-10">
                    <div className="flex items-center justify-center">
                        <MessageCircle className="text-white mr-4 stroke-[2.2]" size={24} />
                        <span className="text-white font-[600]">Mesaje</span>
                    </div>
                    <Heart className="text-white stroke-[2.2]" size={24} />
                    <div className="flex items-center justify-center">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="flex items-center justify-center cursor-pointer">
                                    {avatar ? <Image src={avatar} alt="Avatar" quality={20} width={24} height={24} className="rounded-full mr-2" /> : <UserRound className="text-white mr-4 stroke-[2.2]" size={24} />}
                                    <span className="text-white font-[600]">Contul tău</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56">
                                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuGroup>
                                    <DropdownMenuItem>
                                        <User className="mr-2 h-4 w-4" />
                                        <span>Profile</span>
                                        <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        <CreditCard className="mr-2 h-4 w-4" />
                                        <span>Billing</span>
                                        <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        <Settings className="mr-2 h-4 w-4" />
                                        <span>Settings</span>
                                        <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        <Keyboard className="mr-2 h-4 w-4" />
                                        <span>Keyboard shortcuts</span>
                                        <DropdownMenuShortcut>⌘K</DropdownMenuShortcut>
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
                        </DropdownMenu>
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