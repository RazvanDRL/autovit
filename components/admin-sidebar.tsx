"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    LayoutDashboard,
    Settings,
    Package,
    Users,
    MessageSquare,
    LogOut,
    ChartBar
} from "lucide-react";
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
    className?: string;
}

const menuItems = [
    {
        title: "Overview",
        href: "/admin",
        icon: LayoutDashboard
    },
    {
        title: "Users",
        href: "/admin/users",
        icon: Users
    },
    {
        title: "Listings",
        href: "/admin/listings",
        icon: Package
    },
    {
        title: "Messages",
        href: "/admin/messages",
        icon: MessageSquare
    },
    {
        title: "Settings",
        href: "/admin/settings",
        icon: Settings
    },
    {
        title: "Analytics",
        href: "https://plausible.longtoshort.tech/copy-coach.com",
        icon: ChartBar
    }
];

export default function AdminSidebar({ className }: SidebarProps) {
    const pathname = usePathname();

    return (
        <div className={cn("pb-12", className)}>
            <div className="space-y-4 py-4">
                <div className="px-3 py-2">
                    <h2 className="mb-4 px-4 text-lg font-semibold">Admin Dashboard</h2>
                    <div className="">
                        {menuItems.map((item) => (
                            <Link key={item.href} href={item.href}>
                                <Button
                                    variant={pathname === item.href ? "outline" : "ghost"}
                                    className="w-full justify-start py-6"
                                >
                                    <item.icon className="mr-2 h-4 w-4" />
                                    {item.title}
                                </Button>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
            <div className="px-3 py-2">
                <Link href="/">
                    <Button variant="ghost" className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-100 py-6">
                        <LogOut className="mr-2 h-4 w-4" />
                        Exit Admin
                    </Button>
                </Link>
            </div>
        </div>
    );
}