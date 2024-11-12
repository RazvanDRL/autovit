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
import { format, isToday, isYesterday } from 'date-fns';
import DOMPurify from 'dompurify';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';

interface Message {
    id: string;
    content: string;
    sender_id: string;
    receiver_id: string;
    created_at: string;
    read: boolean;
}

function formatMessageTime(dateString: string) {
    const date = new Date(dateString);

    if (isToday(date)) {
        return format(date, 'HH:mm');
    } else if (isYesterday(date)) {
        return 'Yesterday ' + format(date, 'HH:mm');
    } else {
        return format(date, 'dd/MM/yyyy HH:mm');
    }
}

// Message validation schema
const messageSchema = z.object({
    content: z.string()
        .min(1, "Message cannot be empty")
        .max(2000, "Message is too long (max 2000 characters)")
        .transform(str => str.trim())
        // Basic pattern to catch obvious malicious content
        .refine(str => !/<script\b[^>]*>[\s\S]*?<\/script>/gi.test(str), {
            message: "Invalid message content"
        })
});

export default function ChatPage() {
    const params = useParams<{ id: string }>();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [otherUser, setOtherUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [isSending, setIsSending] = useState(false);

    // Add rate limiting
    const messageTimeouts = useRef<{ [key: string]: NodeJS.Timeout }>({});
    const messageCount = useRef<number>(0);
    const lastMessageTime = useRef<number>(Date.now());

    // Rate limiting check
    const checkRateLimit = () => {
        const now = Date.now();
        const timeWindow = 60000; // 1 minute
        const maxMessages = 30; // Max 30 messages per minute

        if (now - lastMessageTime.current > timeWindow) {
            messageCount.current = 0;
        }

        if (messageCount.current >= maxMessages) {
            toast.error("You're sending messages too quickly. Please wait a moment.");
            return false;
        }

        messageCount.current++;
        lastMessageTime.current = now;
        return true;
    };

    // Sanitize message content
    const sanitizeMessage = (content: string) => {
        return DOMPurify.sanitize(content, {
            ALLOWED_TAGS: [], // No HTML tags allowed
            ALLOWED_ATTR: [], // No attributes allowed
        }).trim();
    };

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
        if (messages.length > 0) {
            jumpToBottom();
        }
    }, [messages]);

    useEffect(() => {
        if (!currentUser) return;

        fetchMessages();

        const channel = supabase
            .channel('messages')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `or(and(sender_id=eq.${currentUser.id},receiver_id=eq.${params.id}),and(sender_id=eq.${params.id},receiver_id=eq.${currentUser.id}))`,
                },
                (payload) => {
                    console.log('New message:', payload.new, 'from', payload.new.sender_id, 'to', payload.new.receiver_id);
                    setMessages(prev => [...prev, payload.new as Message]);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [currentUser, params.id]);

    const fetchMessages = async () => {
        if (!currentUser) return;

        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .or(
                `and(sender_id.eq.${currentUser.id},receiver_id.eq.${params.id}),` +
                `and(sender_id.eq.${params.id},receiver_id.eq.${currentUser.id})`
            )
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error fetching messages:', error);
            toast.error('Error fetching messages');
            return;
        }

        setMessages(data || []);
    };

    const jumpToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'instant' });
    };

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSending || !currentUser) return;

        try {
            setIsSending(true);

            // Check rate limiting
            if (!checkRateLimit()) {
                return;
            }

            // Validate message content
            const validationResult = messageSchema.safeParse({ content: newMessage });
            if (!validationResult.success) {
                toast.error(validationResult.error.errors[0].message);
                return;
            }

            // Sanitize the message content
            const sanitizedContent = sanitizeMessage(validationResult.data.content);

            // Additional checks
            if (sanitizedContent.length === 0) {
                toast.error("Message cannot be empty");
                return;
            }

            // Ensure we're sending to the correct user
            const messageData = {
                content: sanitizedContent,
                sender_id: currentUser.id,
                receiver_id: params.id,
            };

            const { error } = await supabase
                .from('messages')
                .insert([messageData]);

            if (error) {
                console.error('Error sending message:', error);
                toast.error('Error sending message');
                return;
            }

            setNewMessage('');
            jumpToBottom();

        } catch (error) {
            console.error('Error sending message:', error);
            toast.error('Error sending message');
        } finally {
            setIsSending(false);
        }
    };

    // Update message display to handle URLs and special characters
    const formatMessageContent = (content: string) => {
        // Convert URLs to clickable links
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        return content.split(urlRegex).map((part, i) => {
            if (part.match(urlRegex)) {
                return (
                    <a
                        key={i}
                        href={part}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-200 underline"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {part}
                    </a>
                );
            }
            return part;
        });
    };

    if (loading) return <Loading />;

    return (
        <div className="flex flex-col h-[50vh] w-[25vw] border-2 border-gray-300 rounded-lg m-24">
            {/* Chat header */}
            <div className="border-b p-4 flex items-center">
                <Avatar className="h-10 w-10">
                    <AvatarImage src="/placeholder-avatar.jpg" />
                    <AvatarFallback>{otherUser?.email?.[0] || 'U'}</AvatarFallback>
                </Avatar>
                <div className="ml-4">
                    <h2 className="font-semibold">{otherUser?.email || 'User'}</h2>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`flex ${message.sender_id === currentUser?.id ? 'justify-end' : 'justify-start'}`}
                    >
                        <div className="max-w-[70%]">
                            <div
                                className={`rounded-lg p-3 ${message.sender_id === currentUser?.id
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-100'
                                    }`}
                            >
                                {formatMessageContent(message.content)}
                            </div>
                            <div
                                className={`text-xs mt-1 text-gray-500 ${message.sender_id === currentUser?.id ? 'text-right' : 'text-left'
                                    }`}
                            >
                                {formatMessageTime(message.created_at)}
                            </div>
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
                    disabled={isSending}
                    maxLength={2000}
                />
                <Button type="submit" disabled={isSending}>
                    {isSending ? (
                        <span className="flex items-center">
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Sending
                        </span>
                    ) : (
                        'Send'
                    )}
                </Button>
            </form>
        </div>
    );
}
