"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { User as UserType } from '@supabase/supabase-js';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Car, User } from 'lucide-react';
import Link from 'next/link';

export default function Profile() {
    const [user, setUser] = useState<UserType | null>(null);
    const [pastAds, setPastAds] = useState<any[]>([]);
    const [likedAds, setLikedAds] = useState<any[]>([]);

    useEffect(() => {
        fetchUserData();
        fetchPastAds();
        fetchLikedAds();
    }, []);

    const fetchUserData = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();
            if (data) setUser(data as UserType);
        }
    };

    const fetchPastAds = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data, error } = await supabase
                .from('listings')
                .select('*')
                .eq('user_id', user.id);
            if (data) setPastAds(data);
        }
    };

    const fetchLikedAds = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data, error } = await supabase
                .from('liked_ads')
                .select('ads(*)')
                .eq('user_id', user.id);
            if (data) setLikedAds(data.flatMap(item => item.ads));
        }
    };

    return (
        <div className="container mx-auto p-4">
            {user && (
                <div className="flex flex-col items-center mb-8">
                    <Image
                        src={"/image.png"}
                        alt="Profile"
                        width={100}
                        height={100}
                        className="rounded-full"
                    />
                    <h1 className="text-2xl font-bold mt-4">{"N/A"}</h1>
                    <p className="text-gray-600">{user?.email || "N/A"}</p>
                </div>
            )}

            <Tabs defaultValue="past-ads">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="past-ads">Past Ads</TabsTrigger>
                    <TabsTrigger value="liked-ads">Liked Ads</TabsTrigger>
                </TabsList>
                <TabsContent value="past-ads">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {pastAds.map((ad) => (
                            <Card key={ad.id}>
                                <CardHeader>
                                    <CardTitle>{ad.title}</CardTitle>
                                    <CardDescription>{ad.description}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-2xl font-bold">{ad.price} EUR</p>
                                </CardContent>
                                <CardFooter>
                                    <Link href={`/a/${ad.id}`}>
                                        <Button>View Ad</Button>
                                    </Link>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                </TabsContent>
                <TabsContent value="liked-ads">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {likedAds.map((ad) => (
                            <Card key={ad.id}>
                                <CardHeader>
                                    <CardTitle>{ad.title}</CardTitle>
                                    <CardDescription>{ad.description}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-2xl font-bold">{ad.price} EUR</p>
                                </CardContent>
                                <CardFooter>
                                    <Link href={`/a/${ad.id}`}>
                                        <Button>View Ad</Button>
                                    </Link>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}