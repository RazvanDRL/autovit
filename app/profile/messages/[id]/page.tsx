'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { format, isToday, isYesterday } from 'date-fns'
import { z } from 'zod'
import DOMPurify from 'dompurify'
import { v4 as uuidv4 } from 'uuid'
import { Loader2, Paperclip, X, FileIcon, ImageIcon, ChevronLeft } from 'lucide-react'

import { supabase } from '@/lib/supabaseClient'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from 'sonner'
import Loading from '@/components/loading'
import Navbar from '@/components/navbar'

import type { User } from '@supabase/supabase-js'

interface Message {
    id: string
    content: string
    sender_id: string
    receiver_id: string
    created_at: string
    read: boolean
    file_url?: string
    file_type?: string
    file_name?: string
}

interface UserProfile {
    id: string
    name: string
    avatar: string
}

const messageSchema = z.object({
    content: z.string()
        .min(1, "Mesajul nu poate fi gol")
        .max(2000, "Mesajul este prea lung (maxim 2000 caractere)")
        .transform(str => str.trim())
        .refine(str => !/<script\b[^>]*>[\s\S]*?<\/script>/gi.test(str), {
            message: "Conținut mesaj invalid"
        })
})

const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString)
    if (isToday(date)) return format(date, 'HH:mm')
    if (isYesterday(date)) return 'Yesterday ' + format(date, 'HH:mm')
    return format(date, 'dd/MM/yyyy HH:mm')
}

const sanitizeMessage = (content: string) => {
    return DOMPurify.sanitize(content, {
        ALLOWED_TAGS: [],
        ALLOWED_ATTR: [],
    }).trim()
}

export default function ChatPage() {
    const params = useParams<{ id: string }>()
    const [messages, setMessages] = useState<Message[]>([])
    const [newMessage, setNewMessage] = useState('')
    const [currentUser, setCurrentUser] = useState<User | null>(null)
    const [otherUser, setOtherUser] = useState<UserProfile | null>(null)
    const [loading, setLoading] = useState(true)
    const [isSending, setIsSending] = useState(false)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [isUploading, setIsUploading] = useState(false)
    const [signedUrls, setSignedUrls] = useState<Record<string, string>>({})

    const messagesEndRef = useRef<HTMLDivElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const messageTimeouts = useRef<{ [key: string]: NodeJS.Timeout }>({})
    const messageCount = useRef<number>(0)
    const lastMessageTime = useRef<number>(Date.now())

    const checkRateLimit = useCallback(() => {
        const now = Date.now()
        const timeWindow = 60000 // 1 minute
        const maxMessages = 30 // Max 30 messages per minute

        if (now - lastMessageTime.current > timeWindow) {
            messageCount.current = 0
        }

        if (messageCount.current >= maxMessages) {
            toast.error("Trimiți mesaje prea repede. Te rugăm să aștepți un moment.")
            return false
        }

        messageCount.current++
        lastMessageTime.current = now
        return true
    }, [])

    const fetchUsers = useCallback(async () => {
        const { data: { user } } = await supabase.auth.getUser()
        setCurrentUser(user)

        const { data: otherUserData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', params.id)
            .single()

        setOtherUser(otherUserData)
        setLoading(false)
    }, [params.id])

    const fetchMessages = useCallback(async () => {
        if (!currentUser) return

        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .or(
                `and(sender_id.eq.${currentUser.id},receiver_id.eq.${params.id}),` +
                `and(sender_id.eq.${params.id},receiver_id.eq.${currentUser.id})`
            )
            .order('created_at', { ascending: true })

        if (error) {
            console.error('Error fetching messages:', error)
            toast.error('Error fetching messages')
            return
        }

        setMessages(data || [])
    }, [currentUser, params.id])

    const markMessagesAsRead = useCallback(async () => {
        if (!currentUser) return

        const { error } = await supabase
            .from('messages')
            .update({ read: true })
            .eq('receiver_id', currentUser.id)
            .eq('sender_id', params.id)
            .eq('read', false)

        if (error) {
            console.error('Error marking messages as read:', error)
        }
    }, [currentUser, params.id])

    const jumpToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [])

    const uploadFile = useCallback(async (file: File): Promise<string | null> => {
        const fileExt = file.name.split('.').pop()
        const fileName = `${uuidv4()}.${fileExt}`
        const filePath = `${currentUser?.id}/${fileName}`

        try {
            const { error: uploadError } = await supabase.storage
                .from('chat-attachments')
                .upload(filePath, file)

            if (uploadError) throw uploadError

            const { data } = await supabase.storage
                .from('chat-attachments')
                .createSignedUrl(filePath, 60 * 60)

            return data?.signedUrl || null
        } catch (error) {
            console.error('Error uploading file:', error)
            return null
        }
    }, [currentUser])

    const sendMessage = useCallback(async (e: React.FormEvent) => {
        e.preventDefault()
        if (isSending || !currentUser || !checkRateLimit()) return

        try {
            setIsSending(true)

            let fileUrl = ''
            let fileType = ''
            let fileName = ''

            if (selectedFile) {
                setIsUploading(true)
                const uploadedUrl = await uploadFile(selectedFile)
                if (!uploadedUrl) {
                    toast.error("Eroare la încărcarea fișierului")
                    return
                }
                fileUrl = uploadedUrl
                fileType = selectedFile.type
                fileName = selectedFile.name
            }

            if (!selectedFile && newMessage.trim().length === 0) {
                toast.error("Mesajul nu poate fi gol")
                return
            }

            const sanitizedContent = sanitizeMessage(newMessage)

            const messageData = {
                content: sanitizedContent,
                sender_id: currentUser.id,
                receiver_id: params.id,
                file_url: fileUrl,
                file_type: fileType,
                file_name: fileName,
            }

            const { error } = await supabase
                .from('messages')
                .insert([messageData])

            if (error) throw error

            setNewMessage('')
            setSelectedFile(null)
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
            jumpToBottom()
        } catch (error) {
            console.error('Error sending message:', error)
            toast.error('Error sending message')
        } finally {
            setIsSending(false)
            setIsUploading(false)
        }
    }, [isSending, currentUser, checkRateLimit, selectedFile, newMessage, params.id, uploadFile, jumpToBottom])

    useEffect(() => {
        fetchUsers()
    }, [fetchUsers])

    useEffect(() => {
        if (messages.length > 0) {
            jumpToBottom()
        }
    }, [messages, jumpToBottom])

    useEffect(() => {
        if (!currentUser) return

        markMessagesAsRead()
        fetchMessages()

        const channel = supabase
            .channel('messages')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                },
                (payload) => {
                    if (payload.new.sender_id === currentUser.id || payload.new.receiver_id === currentUser.id) {
                        setMessages(prev => [...prev, payload.new as Message])
                        markMessagesAsRead()
                    }
                }
            )
            .subscribe()

        const channel2 = supabase
            .channel('messages2')
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'messages' }, (payload) => {
                if (payload.new.sender_id === currentUser.id || payload.new.receiver_id === currentUser.id) {
                    setMessages(prev => prev.map(message =>
                        message.id === payload.new.id ? payload.new as Message : message
                    ))
                }
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
            supabase.removeChannel(channel2)
        }
    }, [currentUser, fetchMessages, markMessagesAsRead])

    useEffect(() => {
        messages.forEach(async (message) => {
            if (message.file_url && !signedUrls[message.id]) {
                const path = message.file_url.split('/').slice(-2).join('/')
                const { data } = await supabase.storage
                    .from('chat-attachments')
                    .createSignedUrl(path, 60 * 60)

                if (data?.signedUrl) {
                    setSignedUrls(prev => ({
                        ...prev,
                        [message.id]: data.signedUrl
                    }))
                }
            }
        })
    }, [messages])

    const formatMessageContent = useCallback((message: Message) => {
        if (message.file_url && signedUrls[message.id]) {
            const isImage = message.file_type?.startsWith('image/')
            return (
                <div className="space-y-2">
                    {message.content && (
                        <div className="whitespace-pre-wrap break-words">
                            {message.content}
                        </div>
                    )}
                    {isImage ? (
                        <div className="relative w-48 h-48">
                            <div className="absolute inset-0 bg-muted/10 rounded-md" />
                            <Link href={signedUrls[message.id]} target="_blank" rel="noopener noreferrer">
                                <Image
                                    src={signedUrls[message.id]}
                                    alt="Attached image"
                                    quality={10}
                                    fill
                                    priority
                                    className="object-cover rounded-md opacity-0 transition-opacity duration-300"
                                    onLoadingComplete={(image) => {
                                        image.classList.remove('opacity-0')
                                        image.classList.add('opacity-100')
                                        jumpToBottom()
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
            )
        }

        const urlRegex = /(https?:\/\/[^\s]+)/g
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
                        )
                    }
                    return part
                })}
            </div>
        )
    }, [signedUrls])

    if (loading) {
        return <Loading />
    }

    return (
        <>
            <Navbar />
            <div className="flex flex-col items-center justify-center container mx-auto px-4">
                <div className="w-full max-w-[600px] flex items-center justify-start mt-8 sm:mt-12 mb-2">
                    <Link href="/profile/messages" className="flex items-center space-x-2 cursor-pointer">
                        <Button variant="ghost">
                            <ChevronLeft className="h-6 w-6 mr-2" />
                            <span>Înapoi</span>
                        </Button>
                    </Link>
                </div>
                <div className="flex flex-col h-[calc(100vh-16rem)] sm:h-[700px] w-full max-w-[600px] border-2 border-input rounded-lg">
                    <div className="border-b border-input p-4 flex items-center bg-background">
                        {otherUser && (
                            <Link href={`/profile/${otherUser.id}`} className="flex items-center">
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={otherUser?.avatar || ''} alt={otherUser?.name || ''} />
                                    <AvatarFallback>{otherUser?.name?.[0] || 'U'}</AvatarFallback>
                                </Avatar>
                                <div className="ml-4">
                                    <h2 className="font-semibold">{otherUser?.name || 'Utilizator'}</h2>
                                </div>
                            </Link>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-4 bg-background">
                        {messages.map((message) => (
                            <div key={message.id} className={`flex ${message.sender_id === currentUser?.id ? 'justify-end' : 'justify-start'}`}>
                                <div className="max-w-[85%] sm:max-w-[70%]">
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

                    <form onSubmit={sendMessage} className="border-t border-input p-2 sm:p-4 space-y-2 bg-background">
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
                                    onClick={() => setSelectedFile(null)}
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
                                className="flex-1 text-sm sm:text-base"
                                disabled={isSending}
                                maxLength={2000}
                            />
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                                className="hidden"
                                accept="image/*,.pdf,.doc,.docx,.txt"
                            />
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="flex"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isSending}
                            >
                                <Paperclip className="h-4 w-4" />
                            </Button>
                            <Button type="submit" disabled={isSending || isUploading} className="whitespace-nowrap">
                                {isSending || isUploading ? (
                                    <span className="flex items-center">
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        <span className="hidden sm:inline">
                                            {isUploading ? 'Se încarcă' : 'Se trimite'}
                                        </span>
                                    </span>
                                ) : (
                                    'Trimite'
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    )
}