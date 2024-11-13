"use client";
import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useParams, useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from 'sonner';
import { User } from '@supabase/supabase-js';
import Loading from '@/components/loading';
import { format, isToday, isYesterday } from 'date-fns';
import DOMPurify from 'dompurify';
import { z } from 'zod';
import { Loader2, Paperclip, X, FileIcon, ImageIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { v4 as uuidv4 } from 'uuid';
import Navbar from '@/components/navbar';

interface Message {
    id: string;
    content: string;
    sender_id: string;
    receiver_id: string;
    created_at: string;
    read: boolean;
    file_url?: string;
    file_type?: string;
    file_name?: string;
}

interface UserProfile {
    id: string;
    name: string;
    avatar: string;
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
        .min(1, "Mesajul nu poate fi gol")
        .max(2000, "Mesajul este prea lung (maxim 2000 caractere)")
        .transform(str => str.trim())
        .refine(str => !/<script\b[^>]*>[\s\S]*?<\/script>/gi.test(str), {
            message: "Conținut mesaj invalid"
        })
});

export default function ChatPage() {
    const params = useParams<{ id: string }>();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [otherUser, setOtherUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [isSending, setIsSending] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});
    const router = useRouter();

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
            toast.error("Trimiți mesaje prea repede. Te rugăm să aștepți un moment.");
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

            if (!user) {
                router.replace('/login');
                return;
            }

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
    }, [currentUser, params.id, router]);

    useEffect(() => {
        if (messages.length > 0) {
            jumpToBottom();
        }
    }, [messages]);

    useEffect(() => {
        if (!currentUser) return;

        // Mark messages as read when they're viewed
        const markMessagesAsRead = async () => {
            const { error } = await supabase
                .from('messages')
                .update({ read: true })
                .eq('receiver_id', currentUser.id)
                .eq('sender_id', params.id)
                .eq('read', false);

            if (error) {
                console.error('Error marking messages as read:', error);
            }
        };

        markMessagesAsRead();

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

        fetchMessages();

        const channel = supabase
            .channel('messages')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    // filter: `sender_id=eq.${currentUser.id},receiver_id=eq.${params.id} or sender_id=eq.${params.id},receiver_id=eq.${currentUser.id}`,
                },
                (payload) => {
                    if (payload.new.sender_id === currentUser.id || payload.new.receiver_id === currentUser.id) {
                        setMessages(prev => [...prev, payload.new as Message]);
                        markMessagesAsRead();
                    }
                }
            )
            .subscribe();
        const channel2 = supabase
            .channel('messages2')
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'messages' }, (payload) => {
                if (payload.new.sender_id === currentUser.id || payload.new.receiver_id === currentUser.id) {
                    setMessages(prev => prev.map(message =>
                        message.id === payload.new.id ? payload.new as Message : message
                    ));
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
            supabase.removeChannel(channel2);
        };
    }, [currentUser, params.id, router]);


    const jumpToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'instant' });
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) { // 10MB limit
                toast.error("Fișierul este prea mare. Limita este de 10MB.");
                return;
            }
            setSelectedFile(file);
        }
    };

    const removeSelectedFile = () => {
        setSelectedFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const uploadFile = async (file: File): Promise<string | null> => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${uuidv4()}.${fileExt}`;
        const filePath = `${currentUser?.id}/${fileName}`;

        try {
            const { error: uploadError } = await supabase.storage
                .from('chat-attachments')
                .upload(filePath, file);

            if (uploadError) {
                throw uploadError;
            }

            const { data } = await supabase.storage
                .from('chat-attachments')
                .createSignedUrl(filePath, 60 * 60);

            return data?.signedUrl || null;
        } catch (error) {
            console.error('Error uploading file:', error);
            return null;
        }
    };

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSending || !currentUser) return;

        try {
            setIsSending(true);

            let fileUrl = '';
            let fileType = '';
            let fileName = '';

            if (selectedFile) {
                setIsUploading(true);
                const uploadedUrl = await uploadFile(selectedFile);
                if (!uploadedUrl) {
                    toast.error("Eroare la încărcarea fișierului");
                    return;
                }
                fileUrl = uploadedUrl;
                fileType = selectedFile.type;
                fileName = selectedFile.name;
            }

            // Validate message content
            if (!selectedFile && newMessage.trim().length === 0) {
                toast.error("Mesajul nu poate fi gol");
                return;
            }

            const sanitizedContent = sanitizeMessage(newMessage);

            const messageData = {
                content: sanitizedContent,
                sender_id: currentUser.id,
                receiver_id: params.id,
                file_url: fileUrl,
                file_type: fileType,
                file_name: fileName,
            };

            const { error } = await supabase
                .from('messages')
                .insert([messageData]);

            if (error) {
                throw error;
            }

            setNewMessage('');
            setSelectedFile(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            jumpToBottom();

        } catch (error) {
            console.error('Error sending message:', error);
            toast.error('Error sending message');
        } finally {
            setIsSending(false);
            setIsUploading(false);
        }
    };

    useEffect(() => {
        messages.forEach(async (message) => {
            if (message.file_url && !signedUrls[message.id]) {
                const path = message.file_url.split('/').slice(-2).join('/');
                const { data } = await supabase.storage
                    .from('chat-attachments')
                    .createSignedUrl(path, 60 * 60);

                if (data?.signedUrl) {
                    setSignedUrls(prev => ({
                        ...prev,
                        [message.id]: data.signedUrl
                    }));
                }
            }
        });
    }, [messages, currentUser, params.id, signedUrls]);

    // Update message display to handle URLs and special characters
    const formatMessageContent = (message: Message) => {
        if (message.file_url && signedUrls[message.id]) {
            const isImage = message.file_type?.startsWith('image/');
            return (
                <div className="space-y-2">
                    {message.content && (
                        <div className="whitespace-pre-wrap break-words">
                            {message.content}
                        </div>
                    )}
                    {isImage ? (
                        <div className="relative w-48 h-48">
                            <div className="absolute inset-0 bg-muted/10 animate-pulse rounded-md" />
                            <Link href={signedUrls[message.id]} target="_blank" rel="noopener noreferrer">
                                <Image
                                    src={signedUrls[message.id]}
                                    alt="Attached image"
                                    quality={10}
                                    fill
                                    priority
                                    className="object-cover rounded-md opacity-0 transition-opacity duration-300"
                                    onLoadingComplete={(image) => {
                                        image.classList.remove('opacity-0');
                                        image.classList.add('opacity-100');
                                    }}
                                />
                            </Link>
                        </div>
                    ) : (
                        <Link
                            href={signedUrls[message.id]}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-2 p-2 bg-background/10 rounded-md hover:bg-background/20 transition-colors"
                        >
                            <FileIcon className="h-4 w-4" />
                            <span className="text-sm truncate">{message.file_name}</span>
                        </Link>
                    )}
                </div>
            );
        }

        // Handle URLs in text messages
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        return (
            <div className="whitespace-pre-wrap break-words">
                {message.content.split(urlRegex).map((part, i) => {
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
                })}
            </div>
        );
    };

    if (loading) return <Loading />;

    return (
        <>
            <Navbar />
            <div className="flex flex-col h-[700px] w-[600px] border-2 border-input rounded-lg m-24">
                {/* Chat header */}
                <div className="border-b border-input p-4 flex items-center bg-background">
                    <Avatar className="h-10 w-10">
                        <Image
                            src={otherUser?.avatar || ''}
                            alt={otherUser?.name || ''}
                            width={40}
                            height={40}
                            className="rounded-full blur-sm transition-all duration-300"
                            onLoadingComplete={(image) => image.classList.remove('blur-sm')}
                        />
                        <AvatarFallback>{otherUser?.name?.[0] || 'U'}</AvatarFallback>
                    </Avatar>
                    <div className="ml-4">
                        <h2 className="font-semibold">{otherUser?.name || 'Utilizator'}</h2>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background">
                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={`flex ${message.sender_id === currentUser?.id ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className="max-w-[70%]">
                                <div
                                    className={`rounded-lg p-3 ${message.sender_id === currentUser?.id
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-muted text-foreground'
                                        }`}
                                >
                                    {formatMessageContent(message)}
                                </div>
                                <div
                                    className={`text-xs mt-1 text-muted-foreground ${message.sender_id === currentUser?.id ? 'text-right' : 'text-left'
                                        }`}
                                >
                                    {formatMessageTime(message.created_at)}
                                    {message.sender_id === currentUser?.id && (
                                        <span className="ml-2 text-muted-foreground">
                                            {message.read ? 'Vazut' : 'Trimis'}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                {/* Message input */}
                <form onSubmit={sendMessage} className="border-t border-input p-4 space-y-2 bg-background">
                    {selectedFile && (
                        <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                            {selectedFile.type.startsWith('image/') ? (
                                <ImageIcon className="h-4 w-4" />
                            ) : (
                                <FileIcon className="h-4 w-4" />
                            )}
                            <span className="text-sm truncate flex-1">{selectedFile.name}</span>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={removeSelectedFile}
                                className="h-8 w-8 p-0"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                    <div className="flex gap-2">
                        <Input
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Scrie un mesaj..."
                            className="flex-1"
                            disabled={isSending}
                            maxLength={2000}
                        />
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileSelect}
                            className="hidden"
                            accept="image/*,.pdf,.doc,.docx,.txt"
                        />
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isSending}
                        >
                            <Paperclip className="h-4 w-4" />
                        </Button>
                        <Button type="submit" disabled={isSending || isUploading}>
                            {isSending || isUploading ? (
                                <span className="flex items-center">
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    {isUploading ? 'Se încarcă' : 'Se trimite'}
                                </span>
                            ) : (
                                'Trimite'
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}
