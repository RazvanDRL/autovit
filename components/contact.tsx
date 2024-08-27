import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface ContactCardProps {
    phoneNumber: string;
}

export const ContactCard = (props: ContactCardProps) => {
    const [showPhone, setShowPhone] = useState(false);
    const { phoneNumber } = props;

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
            <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
            <h3>Posted by user</h3>
            <div className="space-y-4">
                <div>
                    <p className="font-medium">Phone:</p>
                    {showPhone ? (
                        <a href={`tel:${phoneNumber}`}>{phoneNumber}</a>
                    ) : (
                        <Button onClick={handleRevealPhone}>Reveal Phone Number</Button>
                    )}
                </div>
                <div className="flex space-x-4">
                    <Button onClick={handleWhatsApp}>
                        WhatsApp
                    </Button>
                    <Button onClick={handleInHouseChat}>
                        Chat Now
                    </Button>
                </div>
            </div>
        </div>
    );
};