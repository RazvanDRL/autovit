"use client"
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';
import Navbar from '@/components/navbar';

const PricingPage = () => {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const fetchUser = async () => {
            const { data, error } = await supabase.auth.getUser();
            if (error) {
                console.error('Error fetching user:', error);
            } else {
                setUser(data.user);
            }
        };

        fetchUser();
    }, []);

    const plans = [
        {
            name: 'Basic',
            price: '$9.99',
            description: 'Perfect for individuals',
            features: ['100 credits', 'Basic support', 'Access to core features'],
            link: 'test_fZe8wZfobbXj1KE6oo'
        },
        {
            name: 'Pro',
            price: '$19.99',
            description: 'Ideal for professionals',
            features: ['500 credits', 'Priority support', 'Advanced features', 'API access'],
            link: 'test_fZe8wZfobbXj1KE6oo'
        },
        {
            name: 'Enterprise',
            price: '$49.99',
            description: 'For large teams and businesses',
            features: ['Unlimited credits', '24/7 support', 'Custom features', 'Dedicated account manager'],
            link: 'test_fZe8wZfobbXj1KE6oo'
        },
    ];

    return (
        <>
        <Navbar />
            <div className="container mx-auto py-12">
                <h1 className="text-3xl font-bold text-center mb-8">Choose Your Plan</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {plans.map((plan, index) => (
                    <Card key={index} className="flex flex-col">
                        <CardHeader>
                            <CardTitle>{plan.name}</CardTitle>
                            <CardDescription>{plan.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow">
                            <p className="text-3xl font-bold mb-4">{plan.price}<span className="text-sm font-normal">/month</span></p>
                            <ul className="list-disc list-inside">
                                {plan.features.map((feature, featureIndex) => (
                                    <li key={featureIndex}>{feature}</li>
                                ))}
                            </ul>
                        </CardContent>
                        <CardFooter>
                            <Link href={`https://buy.stripe.com/${plan.link}?prefilled_email=${user?.email}&client_reference_id=${user?.id}`}>
                                <Button className="w-full">Select Plan</Button>
                            </Link>
                        </CardFooter>
                    </Card>
                ))}
            </div>
            </div>
        </>
    );
};

export default PricingPage;
