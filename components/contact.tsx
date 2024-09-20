"use client";
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import WhatsAppLogo from '@/public/whatsapp_logo.svg';
import Image from 'next/image';
import { MessageSquareMore } from 'lucide-react';

interface ContactCardProps {
    phoneNumber: string;
}

interface User {
    id: string;
    name: string;
    email: string;
    phone: string;
}

export const ContactCard = (props: ContactCardProps) => {
    const [showPhone, setShowPhone] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const { phoneNumber } = props;

    useEffect(() => {
        const fetchUser = async () => {
            const { data, error } = await supabase.auth.getUser();
            if (error) {
                console.error('Error fetching user:', error);
            } else {
                const { data: userData, error: userError } = await supabase.from('profiles').select('*').eq('id', data.user.id);
                if (userError) {
                    console.error('Error fetching user:', userError);
                } else {
                    setUser(userData[0]);
                    console.log('User:', userData[0]);
                }
            }
        };

        fetchUser();
    }, []);

    const handleRevealPhone = () => {
        setShowPhone(true);
    };

    const handleWhatsApp = () => {
        window.open(`https://wa.me/${phoneNumber.replace(/\D/g, '')}`, '_blank');
    };

    const handleInHouseChat = () => {
        // Implement in-house chat functionality
        console.log('Open in-house chat');
    };

    return (
        <div className="p-4 border rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xs opacity-50">Postat de</h3>
                    <Link className="hover:text-blue-600" href={`/profile/${user?.id}`}>{user?.name}</Link>
                </div>
                <Image src={"/image.png"} alt="Avatar" height={50} width={50} className="" />
            </div>
            <div className="space-y-4">
                <div>
                    <p className="font-medium mt-6">Telefon</p>
                    <a href={`tel:${phoneNumber}`}>{phoneNumber}</a>
                </div>
                <div className="flex space-x-4">
                    <Button onClick={handleWhatsApp}>
                        <Image src={WhatsAppLogo} alt="WhatsApp" height={20} width={20} className="mr-2" /> WhatsApp
                    </Button>
                    <Button onClick={handleInHouseChat}>
                        <MessageSquareMore className="mr-2" /> Chat Now
                    </Button>
                </div>
            </div>
        </div>
    );
};