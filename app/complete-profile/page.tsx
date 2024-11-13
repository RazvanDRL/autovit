"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Switch } from '@/components/ui/switch';
import { User } from '@supabase/supabase-js';
import Loading from '@/components/loading';
import { cn } from '@/lib/utils';
import Navbar from '@/components/navbar';
import { Trash, X } from 'lucide-react';
import Image from 'next/image';

const formSchema = z.object({
    phone: z.string().length(10, "Numărul de telefon trebuie să aibă 10 caractere"),
    isDealer: z.boolean(),
    avatar: z.any().optional(),
});

export default function CompleteProfile() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            phone: "",
            isDealer: false,
            avatar: undefined,
        },
    });

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.replace('/login');
                return;
            }

            // Check if profile is already completed
            const { data: profile } = await supabase
                .from('profiles')
                .select('phone, is_company, avatar')
                .eq('id', user.id)
                .single();

            if (profile?.phone && profile?.is_company && profile?.avatar) {
                router.replace('/');
                return;
            }

            setUser(user);
            setLoading(false);
        };
        checkUser();
    }, [router]);

    const handleAvatarChange = (files: FileList | null) => {
        if (files && files[0]) {
            const file = files[0];
            const preview = URL.createObjectURL(file);
            setAvatarPreview(preview);
            form.setValue('avatar', files);
        }
    };

    const removeAvatar = () => {
        setAvatarPreview(null);
        form.setValue('avatar', undefined);
    };

    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        if (!user) return;
        try {
            setUploading(true);
            let avatarUrl = null;

            // Handle avatar upload if provided
            if (data.avatar && data.avatar[0]) {
                const file = data.avatar[0];
                const fileExt = file.name.split('.').pop();
                const fileName = `avatar.${fileExt}`;
                const filePath = `${user.id}/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('avatars')
                    .upload(filePath, file);

                if (uploadError) {
                    toast.error('A apărut o eroare la încărcarea fotografiei');
                    throw uploadError;
                }

                const { data: { publicUrl } } = supabase.storage
                    .from('avatars')
                    .getPublicUrl(filePath);

                avatarUrl = publicUrl;
            }

            // Update profile
            const { error } = await supabase
                .from('profiles')
                .update({
                    phone: data.phone || "",
                    is_company: data.isDealer || false,
                    avatar: avatarUrl || null,
                })
                .eq('id', user.id);

            if (error) {
                toast.error('A apărut o eroare la actualizarea profilului');
                console.error(error);
                return;
            };

            toast.success('Profil actualizat cu succes!');
            router.push('/');
        } catch (error) {
            console.error('Error:', error);
            toast.error('A apărut o eroare la actualizarea profilului');
        } finally {
            setUploading(false);
        }
    };

    if (loading) {
        return <Loading />;
    }

    return (
        <>
            <Navbar />
            <div className="container mx-auto max-w-2xl p-4 mt-8">
                <h1 className="text-2xl font-bold mb-8 mt-24">👋 Completează-ți profilul</h1>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-12">
                        <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        <h3 className="text-lg font-semibold">1. Număr de telefon</h3>
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="07xxxxxxxx"
                                            type="tel"
                                            pattern="[0-9]{10}"
                                            maxLength={10}
                                            className="w-[150px] text-md py-5"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="isDealer"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        <h3 className="text-lg font-semibold">2. Ești dealer auto?</h3>
                                    </FormLabel>
                                    <FormControl>
                                        <div className="flex items-center gap-2">
                                            <span className={cn(field.value === false ? "font-bold" : "text-gray-400")}>Nu</span>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                            <span className={cn(field.value === true ? "font-bold" : "text-gray-400")}>Da</span>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="avatar"
                            render={({ field: { onChange, value, ...field } }) => (
                                <FormItem>
                                    <FormLabel>
                                        <h3 className="text-lg font-semibold">3. Fotografie de profil</h3>
                                    </FormLabel>
                                    <FormControl>
                                        <div className="flex items-center justify-left w-full">
                                            {avatarPreview ? (
                                                <div className="relative">
                                                    <Image
                                                        src={avatarPreview}
                                                        alt="Avatar preview"
                                                        width={128}
                                                        height={128}
                                                        className="rounded-full object-cover"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={removeAvatar}
                                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                                                    >
                                                        <Trash className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <label htmlFor="avatar-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                        <svg className="w-8 h-8 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
                                                        </svg>
                                                        <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click pentru a încărca</span> sau trage și plasează</p>
                                                        <p className="text-xs text-gray-500">PNG, JPG sau JPEG</p>
                                                    </div>
                                                    <Input
                                                        id="avatar-upload"
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={(e) => handleAvatarChange(e.target.files)}
                                                        className="hidden"
                                                        {...field}
                                                    />
                                                </label>
                                            )}
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={uploading}
                        >
                            {uploading ? "Se salvează..." : "Salvează profilul"}
                        </Button>
                    </form>
                </Form>
            </div>
        </>
    );
}
