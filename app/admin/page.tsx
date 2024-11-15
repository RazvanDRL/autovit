"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import Loading from '@/components/loading';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import Sidebar from "@/components/admin-sidebar";
const ADMIN_USER_ID = "6a6a37a7-46d5-4ab3-9b7e-1d7fe2a388ab";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
    className?: string;
}

export default function AdminPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalListings: 0,
        totalMessages: 0
    });

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user || user.id !== ADMIN_USER_ID) {
                router.replace('/');
                return;
            }

            setUser(user);
            fetchStats();
            setLoading(false);
        };

        checkUser();
    }, [router]);

    const fetchStats = async () => {
        const [
            { count: usersCount },
            { count: listingsCount },
            { count: messagesCount }
        ] = await Promise.all([
            supabase.from('profiles').select('*', { count: 'exact', head: true }).neq('id', ADMIN_USER_ID),
            supabase.from('listings').select('*', { count: 'exact', head: true }),
            supabase.from('messages').select('*', { count: 'exact', head: true })
        ]);

        setStats({
            totalUsers: usersCount || 0,
            totalListings: listingsCount || 0,
            totalMessages: messagesCount || 0
        });
    };

    if (loading) return <Loading />;

    if (!user || user.id !== ADMIN_USER_ID) {
        return null;
    }

    return (
        <div className="flex min-h-screen">
            <aside className="hidden lg:block w-64 border-r bg-gray-100/40">
                <ScrollArea className="h-full">
                    <Sidebar />
                </ScrollArea>
            </aside>
            <main className="flex-1 p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Users</CardTitle>
                            <CardDescription>Total registered users</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold">{stats.totalUsers}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Listings</CardTitle>
                            <CardDescription>Total car listings</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold">{stats.totalListings}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Messages</CardTitle>
                            <CardDescription>Total messages sent</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold">{stats.totalMessages}</p>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
