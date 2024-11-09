"use client";
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import WhatsAppLogo from '@/public/logos/whatsapp.svg';
import Image from 'next/image';
import { MessageSquareMore, Phone, Building2, User } from 'lucide-react';

interface ContactCardProps {
    user_id: string;
    user_phone: string;
    user_full_name: string;
    is_company: boolean;
}

export const ContactCard = (props: ContactCardProps) => {
    const [showPhone, setShowPhone] = useState(false);
    const { user_id, user_phone, user_full_name, is_company } = props;

    const handleRevealPhone = () => {
        setShowPhone(true);
    };

    const handleWhatsApp = () => {
        window.open(`https://wa.me/${user_phone.replace(/\D/g, '')}`, '_blank');
    };

    const handleInHouseChat = () => {
        // Implement in-house chat functionality
        console.log('Open in-house chat');
    };

    return (
        <div className="p-4 bg-white border rounded-lg shadow-sm lg:rounded-lg lg:shadow-sm lg:border lg:p-4 fixed-bottom">
            <div className="hidden lg:flex items-center justify-between">
                <div>
                    <h3 className="text-xs opacity-50">Postat de</h3>
                    <Link className="hover:text-red-600" href={`/profile/${user_id}`}>{user_full_name}</Link>
                    <div className="flex items-center mt-1">
                        {is_company ? (
                            <>
                                <Building2 className="h-4 w-4 mr-1 text-blue-500" />
                                <span className="text-sm text-red-500">Dealer</span>
                            </>
                        ) : (
                            <>
                                <User className="h-4 w-4 mr-1 text-gray-500" />
                                <span className="text-sm text-gray-500">Proprietar</span>
                            </>
                        )}
                    </div>
                </div>
                <Image src={"/image.png"} alt="Avatar" height={50} width={50} className="" />
            </div>

            <div className="space-y-2 lg:space-y-4">
                <div className="mt-4 lg:mt-16">
                    {showPhone ? (
                        <Link href={`tel:${user_phone}`}>
                            <Button variant="outline" className="w-full flex items-center">
                                <Phone className="mr-2 h-4 w-4" /> {user_phone}
                            </Button>
                        </Link>
                    ) : (
                        <Button onClick={handleRevealPhone} variant="outline" className="text-white hover:text-white bg-[#EB2126] hover:bg-[#EB2126]/90 hover:scale-105 transition-all duration-300 w-full flex items-center">
                            <Phone className="mr-2 h-4 w-4" /> Afișează numărul
                        </Button>
                    )}
                </div>
                <div className="flex space-x-2 lg:space-x-4">
                    <Button onClick={handleWhatsApp} variant="outline" className="flex-1 hover:scale-105 transition-all duration-300">
                        <Image src={WhatsAppLogo} alt="WhatsApp" height={20} width={20} className="mr-2" /> WhatsApp
                    </Button>
                    <Button onClick={handleInHouseChat} variant="outline" className="flex-1 hover:scale-105 transition-all duration-300">
                        <MessageSquareMore className="h-5 w-4 mr-2" /> Contactează
                    </Button>
                </div>
            </div>
        </div>
    );
};