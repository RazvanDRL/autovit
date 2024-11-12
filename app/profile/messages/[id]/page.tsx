"use client";
import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useParams } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from 'sonner';
import { User } from '@supabase/supabase-js';
import Loading from '@/components/loading';

interface Message {
    id: string;
    content: string;
    sender_id: string;
    receiver_id: string;
    created_at: string;
    read: boolean;
}

export default function ChatPage() {
    const params = useParams<{ id: string }>();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [otherUser, setOtherUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchUsers = async () => {
            // Get current user
            const { data: { user } } = await supabase.auth.getUser();
            setCurrentUser(user);

            // Get other user's profile
            const { data: otherUserData } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', params.id)
                .single();

            setOtherUser(otherUserData);
            setLoading(false);
        };

        fetchUsers();
    }, [params.id]);

    useEffect(() => {
        if (!currentUser) return;

        // Initial fetch of messages
        fetchMessages();

        // Subscribe to new messages
        const channel = supabase
            .channel('messages')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `sender_id=eq.${params.id},receiver_id=eq.${currentUser.id}`,
                },
                (payload) => {
                    setMessages(prev => [...prev, payload.new as Message]);
                    scrollToBottom();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [currentUser, params.id]);

    const fetchMessages = async () => {
        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .or(`sender_id.eq.${currentUser?.id},receiver_id.eq.${currentUser?.id}`)
            .or(`sender_id.eq.${params.id},receiver_id.eq.${params.id}`)
            .order('created_at', { ascending: true });

        if (error) {
            toast.error('Error fetching messages');
            return;
        }

        setMessages(data || []);
        scrollToBottom();
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !currentUser) return;

        const { error } = await supabase
            .from('messages')
            .insert([
                {
                    content: newMessage,
                    sender_id: currentUser.id,
                    receiver_id: params.id,
                }
            ]);

        if (error) {
            toast.error('Error sending message');
            return;
        }

        setNewMessage('');
    };

    if (loading) return <Loading />;

    return (
        <div className="flex flex-col h-screen">
            {/* Chat header */}
            <div className="border-b p-4 flex items-center">
                <Avatar className="h-10 w-10">
                    <AvatarImage src="/placeholder-avatar.jpg" />
                    <AvatarFallback>{otherUser?.name?.[0] || 'U'}</AvatarFallback>
                </Avatar>
                <div className="ml-4">
                    <h2 className="font-semibold">{otherUser?.name || 'User'}</h2>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`flex ${message.sender_id === currentUser?.id ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[70%] rounded-lg p-3 ${message.sender_id === currentUser?.id
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-100'
                                }`}
                        >
                            {message.content}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Message input */}
            <form onSubmit={sendMessage} className="border-t p-4 flex gap-2">
                <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1"
                />
                <Button type="submit">Send</Button>
            </form>
        </div>
    );
}
