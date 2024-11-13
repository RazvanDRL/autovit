"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { User } from '@supabase/supabase-js';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from 'next/link';
import { formatTimeAgo } from '@/lib/timeFormat';
import Loading from '@/components/loading';
import Navbar from '@/components/navbar';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Footer from '@/components/footer';

interface Conversation {
    id: string;
    other_user: {
        id: string;
        email: string;
        name: string;
        avatar: string;
    };
    last_message: {
        content: string;
        created_at: string;
        read: boolean;
    };
    unread_count: number;
}

export default function MessagesPage() {
    const router = useRouter();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCurrentUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                router.replace('/login');
                return;
            }

            setCurrentUser(user);
        };

        fetchCurrentUser();
    }, [router]);

    useEffect(() => {
        if (!currentUser) return;

        const fetchConversations = async () => {
            // First get all messages
            const { data: messages, error } = await supabase
                .from('messages')
                .select('*')
                .or(`sender_id.eq.${currentUser.id},receiver_id.eq.${currentUser.id}`)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching messages:', error);
                return;
            }

            // Get unique IDs of other users
            const otherUserIds = Array.from(new Set(
                messages?.map(message =>
                    message.sender_id === currentUser.id ? message.receiver_id : message.sender_id
                ) || []
            ));

            // Fetch profiles for other users
            const { data: profiles, error: profilesError } = await supabase
                .from('profiles')
                .select('*')
                .in('id', otherUserIds);

            if (profilesError) {
                console.error('Error fetching profiles:', profilesError);
                return;
            }

            // Create a map of profiles for easy lookup
            const profilesMap = new Map(
                profiles?.map(profile => [profile.id, profile]) || []
            );

            // Process messages to create conversations
            const conversationsMap = new Map();

            messages?.forEach(message => {
                const otherUserId = message.sender_id === currentUser.id
                    ? message.receiver_id
                    : message.sender_id;

                const otherUserProfile = profilesMap.get(otherUserId);

                if (!conversationsMap.has(otherUserId)) {
                    conversationsMap.set(otherUserId, {
                        id: message.id,
                        other_user: {
                            id: otherUserId,
                            email: otherUserProfile?.email,
                            name: otherUserProfile?.name,
                            avatar: otherUserProfile?.avatar,
                        },
                        last_message: {
                            content: message.content,
                            created_at: message.created_at,
                            read: message.read,
                        },
                        unread_count: !message.read && message.sender_id !== currentUser.id ? 1 : 0,
                    });
                } else if (!message.read && message.sender_id !== currentUser.id) {
                    conversationsMap.get(otherUserId).unread_count++;
                }
            });

            setConversations(Array.from(conversationsMap.values()));
            setLoading(false);
        };

        fetchConversations();

        // Subscribe to new messages
        const channel = supabase
            .channel('messages_channel')
            .on('postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'messages',
                    filter: `sender_id=eq.${currentUser.id},receiver_id=eq.${currentUser.id}`,
                },
                () => {
                    fetchConversations();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [currentUser]);

    if (loading) return <Loading />;

    return (
        <>
            <Navbar />
            <div className="container min-h-[65vh] mx-auto p-4 max-w-2xl mt-8">
                <h1 className="text-2xl font-bold mb-6">Mesaje</h1>
                <div className="space-y-2">
                    {conversations.map((conversation) => (
                        <Link
                            key={conversation.id}
                            href={`/profile/messages/${conversation.other_user.id}`}
                            className="block"
                        >
                            <div className="flex items-center justify-between p-4 border-2 border-gray-300 rounded-lg hover:bg-gray-100 transition-colors">
                                <div className="flex items-center space-x-4">
                                    <Avatar>
                                        <Image
                                            src={conversation.other_user.avatar}
                                            alt={conversation.other_user.name}
                                            width={40}
                                            height={40}
                                            className="rounded-full blur-sm transition-all duration-300"
                                            onLoadingComplete={
                                                (image) => image.classList.remove('blur-sm')
                                            }
                                        />
                                        <AvatarFallback>{conversation.other_user.name?.[0] || 'U'}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="text-sm font-medium">{conversation.other_user.name}</p>
                                        <p className="text-sm text-gray-500">{conversation.last_message.content}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space -x-2">
                                    <p className="text-sm text-gray-500">{formatTimeAgo(conversation.last_message.created_at)}</p>
                                    {conversation.unread_count > 0 && (
                                        <div className="w-8 h-8 ml-2 bg-red-500 text-white text-xs font-bold rounded-lg flex items-center justify-center">
                                            {conversation.unread_count}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
            <Footer />
        </>
    );
}
