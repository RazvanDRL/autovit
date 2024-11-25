"use client";

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Navbar from '@/components/navbar';
import Loading from '@/components/loading';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast, Toaster } from "sonner";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { UserRoundCog } from 'lucide-react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Loader2 } from "lucide-react";

const formSchema = z.object({
    full_name: z.string().min(2, "Numele trebuie să aibă cel puțin 2 caractere"),
    phone: z.string().regex(/^(\+\d{1,3}[- ]?)?\d{10}$/, "Număr de telefon invalid"),
    // email_notifications: z.boolean(),
    is_company: z.boolean(),
    company_name: z.string().optional(),
    avatar: z.any().optional(),
});

export default function Settings() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [showExitDialog, setShowExitDialog] = useState(false);
    const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);
    const [initialValues, setInitialValues] = useState<z.infer<typeof formSchema> | null>(null);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            full_name: "",
            phone: "",
            // email_notifications: false,
            is_company: false,
            company_name: "",
        },
    });

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                router.replace('/login?redirect=/profile/settings');
                return;
            }

            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (profile) {
                const values = {
                    full_name: profile.name || "",
                    phone: profile.phone || "",
                    // email_notifications: profile.email_notifications || false,
                    is_company: profile.is_company || false,
                    company_name: profile.company_name || "",
                };
                setInitialValues(values);
                form.reset(values);
                setAvatarUrl(profile.avatar || null);
            }

            setUser(user);
            setLoading(false);
        };

        fetchUser();
    }, [router, form]);

    useEffect(() => {
        const subscription = form.watch((value) => {
            if (!initialValues) return;

            const fieldsToCheck = ['full_name', 'phone', 'is_company'];

            const hasChanges = fieldsToCheck.some(key => {
                if (value[key as keyof typeof value] === undefined) return false;
                if (value[key as keyof typeof value] === "" && initialValues[key as keyof typeof initialValues] === "") return false;

                return value[key as keyof typeof value] !== initialValues[key as keyof typeof initialValues];
            });

            setIsDirty(hasChanges);
        });
        return () => subscription.unsubscribe();
    }, [form, initialValues]);

    useEffect(() => {
        const onBeforeUnload = (e: BeforeUnloadEvent) => {
            if (isDirty) {
                e.preventDefault();
                e.returnValue = '';
            }
        };

        window.addEventListener('beforeunload', onBeforeUnload);
        return () => window.removeEventListener('beforeunload', onBeforeUnload);
    }, [isDirty]);

    const handleNavigation = useCallback((path: string) => {
        if (isDirty) {
            setPendingNavigation(path);
            setShowExitDialog(true);
        } else {
            router.push(path);
        }
    }, [isDirty, router]);

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        if (!user) return;

        setIsSaving(true);
        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    name: values.full_name,
                    phone: values.phone,
                    // email_notifications: values.email_notifications,
                    is_company: values.is_company,
                    company_name: values.company_name,
                })
                .eq('id', user.id);

            if (error) throw error;

            toast.success("Setările au fost actualizate cu succes");
            setInitialValues(values);
            setIsDirty(false);
        } catch (error) {
            console.error('Eroare la actualizarea profilului:', error);
            toast.error("Nu s-au putut actualiza setările");
        } finally {
            setIsSaving(false);
        }
    };

    const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !user) return;

        const fileType = file.type;
        const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
        if (!validTypes.includes(fileType)) {
            toast.error("Vă rugăm să încărcați o imagine în format JPG, JPEG, PNG sau WEBP");
            return;
        }

        const fileSize = file.size / 1024 / 1024;
        if (fileSize > 5) {
            toast.error("Imaginea trebuie să fie mai mică de 5MB. A fost încărcată o imagine de " + fileSize.toFixed(2) + "MB");
            return;
        }

        setUploadingAvatar(true);
        try {
            if (avatarUrl) {
                const oldAvatarPath = avatarUrl.split('/').pop();
                if (oldAvatarPath) {
                    await supabase.storage
                        .from('avatars')
                        .remove([`${user.id}/${oldAvatarPath}`]);
                }
            }

            const fileExt = file.name.split('.').pop();
            const fileName = `avatar-${Date.now()}.${fileExt}`;
            const filePath = `${user.id}/${fileName}`;
            const { error: uploadError, data } = await supabase.storage
                .from('avatars')
                .upload(filePath, file,
                    {
                        upsert: true,
                    }
                );

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            const { error: updateError } = await supabase
                .from('profiles')
                .update({ avatar: publicUrl })
                .eq('id', user.id);

            if (updateError) throw updateError;

            setAvatarUrl(publicUrl);
            toast.success("Avatarul a fost actualizat cu succes");
        } catch (error) {
            console.error('Error uploading avatar:', error);
            toast.error("Nu s-a putut încărca avatarul");
        } finally {
            setUploadingAvatar(false);
        }
    };

    if (loading) return <Loading />;

    return (
        <>
            <Navbar />
            <Toaster />
            <div className="container max-w-2xl mx-auto p-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mt-12 flex items-center">
                        <UserRoundCog className="mr-2 h-7 w-7" />
                        Setări
                    </h1>
                    <p className="text-gray-500 mt-2">
                        Gestionează setările și preferințele contului tău
                    </p>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <Card>
                            <CardHeader>
                                <CardTitle>Fotografie Profil</CardTitle>
                                <CardDescription>
                                    Schimbă imaginea ta de profil
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-col items-center space-y-4">
                                <div className="relative">
                                    <Avatar className="w-32 h-32">
                                        <AvatarImage
                                            src={avatarUrl || ""}
                                            alt="Avatar"
                                            className="object-cover"
                                        />
                                        <AvatarFallback>
                                            {form.watch("full_name")?.[0]?.toUpperCase() || "U"}
                                        </AvatarFallback>
                                    </Avatar>
                                    <label
                                        htmlFor="avatar-upload"
                                        className="absolute bottom-0 right-0 p-2 bg-background rounded-full border cursor-pointer hover:bg-accent transition-colors"
                                    >
                                        {uploadingAvatar ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Camera className="w-4 h-4" />
                                        )}
                                    </label>
                                    <input
                                        id="avatar-upload"
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        className="hidden"
                                        onChange={handleAvatarUpload}
                                        disabled={uploadingAvatar}
                                    />
                                </div>
                                <FormDescription>
                                    Imaginea trebuie să fie în format JPG, PNG sau WEBP și mai mică de 5MB
                                </FormDescription>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Informații Profil</CardTitle>
                                <CardDescription>
                                    Actualizează informațiile personale și modul în care ești văzut pe site
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="full_name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nume Complet</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Ion Popescu" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="phone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Număr de Telefon</FormLabel>
                                            <FormControl>
                                                <Input placeholder="07XXXXXXXX" {...field} />
                                            </FormControl>
                                            <FormDescription>
                                                Folosit doar pentru contact
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Tip Cont</CardTitle>
                                <CardDescription>
                                    Setează tipul contului și informațiile despre firmă
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="is_company"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                            <div className="space-y-0.5">
                                                <FormLabel className="text-base">
                                                    Cont Business
                                                </FormLabel>
                                                <FormDescription>
                                                    Activează dacă postezi anunțuri ca firmă
                                                </FormDescription>
                                            </div>
                                            <FormControl>
                                                <Switch
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />

                                {form.watch("is_company") && (
                                    <FormField
                                        control={form.control}
                                        name="company_name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Nume Firmă</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Firma Ta SRL" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                )}
                            </CardContent>
                        </Card>

                        {/* <Card>
                            <CardHeader>
                                <CardTitle>Notificări</CardTitle>
                                <CardDescription>
                                    Configurează modul în care primești notificări
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <FormField
                                    control={form.control}
                                    name="email_notifications"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                            <div className="space-y-0.5">
                                                <FormLabel className="text-base">
                                                    Notificări Email
                                                </FormLabel>
                                                <FormDescription>
                                                    Primește notificări pe email despre anunțurile și mesajele tale
                                                </FormDescription>
                                            </div>
                                            <FormControl>
                                                <Switch
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card> */}

                        <div className="flex justify-end space-x-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => handleNavigation('/profile')}
                            >
                                Anulează
                            </Button>
                            <Button type="submit" disabled={isSaving}>
                                {isSaving ? "Se salvează..." : "Salvează modificările"}
                            </Button>
                        </div>

                        <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Modificări nesalvate</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Ai modificări nesalvate. Ești sigur că vrei să părăsești această pagină?
                                        Toate modificările vor fi pierdute.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel onClick={() => {
                                        setShowExitDialog(false);
                                        setPendingNavigation(null);
                                    }}>
                                        Continuă editarea
                                    </AlertDialogCancel>
                                    <AlertDialogAction onClick={() => {
                                        if (pendingNavigation) {
                                            router.push(pendingNavigation);
                                        }
                                    }}>
                                        Părăsește pagina
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </form>
                </Form>
            </div>
        </>
    );
}
