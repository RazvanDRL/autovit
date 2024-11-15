"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import Loading from '@/components/loading';
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import Sidebar from "@/components/admin-sidebar";
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import Link from 'next/link';
const ADMIN_USER_ID = "6a6a37a7-46d5-4ab3-9b7e-1d7fe2a388ab";

interface Profile {
    id: string;
    avatar: string;
    email: string;
    name: string;
    created_at: string;
    last_sign_in_at: string;
}

export default function UsersPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState<Profile[]>([]);

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user || user.id !== ADMIN_USER_ID) {
                router.replace('/');
                return;
            }

            setUser(user);
            fetchUsers();
            setLoading(false);
        };

        checkUser();
    }, [router]);

    const fetchUsers = async () => {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .neq('id', ADMIN_USER_ID)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching users:', error);
            return;
        }

        setUsers(data || []);
    };

    const deleteUser = async (userId: string) => {
        const confirmed = window.confirm("Are you sure you want to delete this user?");
        if (!confirmed) return;

        const { error } = await supabase
            .from('profiles')
            .delete()
            .eq('id', userId);

        if (error) {
            console.error('Error deleting user:', error);
            return;
        }

        // Refresh the users list
        fetchUsers();
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
                <Card className="p-6">
                    <h2 className="text-2xl font-bold mb-6">Users</h2>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Avatar</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Joined</TableHead>
                                <TableHead>Profile</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.map((profile) => (
                                <TableRow key={profile.id}>
                                    <TableCell>
                                        <Image src={profile.avatar} alt={profile.name} width={32} height={32} className="rounded-full" />
                                    </TableCell>
                                    <TableCell>{profile.name}</TableCell>
                                    <TableCell>{profile.email}</TableCell>
                                    <TableCell>
                                        {new Date(profile.created_at).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>
                                        <Link href={`/profile/${profile.id}`}>
                                            <Button size="sm" variant="outline">
                                                View Profile
                                            </Button>
                                        </Link>
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => deleteUser(profile.id)}
                                        >
                                            Delete
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Card>
            </main>
        </div>
    );
}
