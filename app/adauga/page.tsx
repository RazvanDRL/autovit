"use client";
// eautoaz
import React, { useState, useEffect, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { toast, Toaster } from 'sonner';

import { Check, ChevronDown, ChevronsUpDown, Loader2, Plus, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { ButtonDropdown } from '@/components/ui/buttonDropdown';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { InputCustom } from '@/components/ui/inputCustom';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/lib/supabaseClient'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Textarea } from '@/components/ui/textarea';

const brands = ['BMW', 'Mercedes', 'Audi', 'Toyota', 'Ford'];
const models: { [key: string]: string[] } = {
    BMW: ['3 Series', '5 Series', 'X5', 'i8'],
    Mercedes: ['C-Class', 'E-Class', 'S-Class', 'GLE'],
    Audi: ['A4', 'A6', 'Q5', 'e-tron'],
    Toyota: ['Corolla', 'Camry', 'RAV4', 'Prius'],
    Ford: ['Focus', 'Mustang', 'Explorer', 'F-150']
};

const years = Array.from({ length: new Date().getFullYear() - 1900 + 1 }, (_, i) => new Date().getFullYear() - i);

const MAX_FILES = 10;
const MAX_UPLOAD_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_LENGTH = 30;

const formSchema = z.object({
    vin: z.string().min(16).max(17).optional(),
    brand: z.string().min(2).max(50),
    model: z.string().min(2).max(50),
    year: z.number().int().min(1900).max(new Date().getFullYear()),
    price: z.number().int().min(0),
    engine_size: z.number().int().min(0),
    power: z.number().int().min(0),
    km: z.number().int().min(0),
    transmission: z.string().min(2).max(50),
    fuel_type: z.string().min(2).max(50),
    location: z.string().min(2).max(50),
    description: z.string().min(30).max(9000),
    short_description: z.string().min(3).max(MAX_LENGTH),
    photos: z.array(z.string()).min(1).max(MAX_FILES),
    doors: z.string().min(3).max(3),
});

const DropdownSelect = ({ options, placeholder, value, onChange, className, disabled }: {
    options: { value: string; label: string; ads?: number }[];
    placeholder: string;
    value: string | number;
    onChange: (value: string) => void;
    className: string;
    disabled?: boolean;
}) => {
    const [open, setOpen] = useState(false);
    const buttonRef = useRef<HTMLButtonElement | null>(null);
    const [popoverWidth, setPopoverWidth] = useState<string>("auto");

    useEffect(() => {
        if (buttonRef.current) {
            setPopoverWidth(`${buttonRef.current.offsetWidth}px`);
        }
    }, [open]);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <ButtonDropdown
                    ref={buttonRef}
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn("w-full text-md justify-between bg-[#EBECEF] border-[#EBECEF] rounded-sm font-[400]", className)}
                    disabled={disabled}
                >
                    {value || placeholder}
                    <ChevronDown className="ml-2 h-8 w-8 shrink-0" />
                </ButtonDropdown>
            </PopoverTrigger>
            <PopoverContent className="p-0" style={{ width: popoverWidth }}>
                <Command>
                    <CommandInput placeholder={`Cauta ${placeholder.toLowerCase()}...`} />
                    <CommandList>
                        <CommandEmpty>No {placeholder.toLowerCase()} found.</CommandEmpty>
                        <CommandGroup>
                            {options.map((option) => (
                                <CommandItem
                                    key={option.value}
                                    value={option.value}
                                    onSelect={(currentValue) => {
                                        onChange(currentValue === value ? "" : currentValue);
                                        setOpen(false);
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === option.value ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {option.label} {option.ads !== undefined && `(${option.ads})`}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
};

export default function CarAdForm() {
    const [isUploading, setIsUploading] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            vin: '',
            brand: '',
            model: '',
            year: new Date().getFullYear(),
            price: 1,
            engine_size: 1,
            power: 1,
            km: 1,
            transmission: '',
            fuel_type: '',
            location: '',
            description: '',
            short_description: '',
            photos: [],
            doors: '',
        },
    });

    async function onSubmit(data: z.infer<typeof formSchema>) {
        // upload data to supabase
        const { data: anuntData, error: anuntError } =
            await supabase
                .from('anunt')
                .insert([data]);
        if (anuntError) {
            toast.error('Eroare la adaugarea anuntului!');
        } else {
            toast.success('Anuntul a fost adaugat cu succes!');
        }
    }

    return (
        <div className="min-h-screen bg-white p-8">
            <Toaster richColors position="top-right" />
            <div className="max-w-4xl mx-auto bg-white rounded-sm">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="">
                        <h1 className='text-[32px] font-bold'>
                            Adauga un anunt nou
                        </h1>

                        {/* VIN */}
                        <FormField
                            control={form.control}
                            name="vin"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="block mt-8 text-sm font-semibold text-gray-600">VIN</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Introduceți VIN-ul..."
                                            className="mt-1 p-6 w-full"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Brand */}
                        <FormField
                            control={form.control}
                            name="brand"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="block mt-8 text-sm font-semibold text-gray-600">Marca</FormLabel>
                                    <FormControl>
                                        <div className='flex items-center'>
                                            <DropdownSelect
                                                options={brands.map((brand) => ({ value: brand, label: brand }))}
                                                placeholder="Selecteaza o marca"
                                                value={field.value}
                                                onChange={field.onChange}
                                                className="mt-1 p-6 w-2/3"
                                            />
                                            <Check className={cn("ml-3 h-6 w-6 text-green-500", field.value ? "opacity-100" : "opacity-0")} />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Model */}
                        <FormField
                            control={form.control}
                            name="model"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="block mt-8 text-sm font-semibold text-gray-600">Model</FormLabel>
                                    <FormControl>
                                        <div className='flex items-center'>
                                            <DropdownSelect
                                                options={form.watch("brand") ? models[form.watch("brand")].map((model) => ({ value: model, label: model })) : []}
                                                placeholder="Selecteaza un model..."
                                                value={field.value}
                                                onChange={field.onChange}
                                                className="mt-1 p-6 w-2/3"
                                                disabled={!form.watch("brand")}
                                            />
                                            <Check className={cn("ml-3 h-6 w-6 text-green-500", field.value ? "opacity-100" : "opacity-0")} />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Year */}
                        <div className='flex justify-between w-2/3 gap-12'>
                            <FormField
                                control={form.control}
                                name="year"
                                render={({ field }) => (
                                    <FormItem className="w-1/2">
                                        <FormLabel className="block mt-8 text-sm font-semibold text-gray-600">Anul fabricatiei</FormLabel>
                                        <FormControl>
                                            <div className='flex items-center'>
                                                <DropdownSelect
                                                    options={years.map((year) => ({ value: year.toString(), label: year.toString() }))}
                                                    placeholder="Selecteaza un an"
                                                    value={field.value.toString()}
                                                    onChange={(value) => field.onChange(parseInt(value, 10))}
                                                    className="mt-1 p-6 w-full"
                                                />
                                                <Check className={cn("ml-3 h-6 w-6 text-green-500", field.value ? "block" : "hidden")} />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Km */}
                        <FormField
                            control={form.control}
                            name="km"
                            render={({ field }) => (
                                <FormItem className='mt-8'>
                                    <FormLabel className='block text-sm font-semibold text-gray-600'>Km</FormLabel>
                                    <FormControl>
                                        <div className='flex items-center'>
                                            <div className='relative w-1/3'>
                                                <InputCustom
                                                    id="km"
                                                    type="number"
                                                    placeholder="0"
                                                    className="p-6 pr-11"
                                                    {...field}
                                                    onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                                                />
                                                <span className="opacity-50 absolute inset-y-0 right-3 flex items-center">km</span>
                                            </div>
                                            <Check className={cn("ml-3 h-6 w-6 text-green-500", field.value > 0 ? "block" : "hidden")} />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <h1 className='text-[16px] mt-16 font-bold mb-4'>Detaliile modelului</h1>
                        <Separator className="mb-10" />

                        {/* Doors */}
                        <FormField
                            control={form.control}
                            name="doors"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className='mt-8 block text-sm font-semibold mb-1'>Numar de portiere</FormLabel>
                                    <FormControl>
                                        <div className='p-1 flex border w-2/3 justify-between rounded-md items-center h-12'>
                                            <Button
                                                type="button"
                                                variant={field.value === "2/3" ? "secondary" : "ghost"}
                                                onClick={() => field.onChange("2/3")}
                                                className='w-1/3'
                                            >
                                                2/3
                                            </Button>
                                            <Separator orientation="vertical" className='mx-1' />
                                            <Button
                                                type="button"
                                                variant={field.value === "4/5" ? "secondary" : "ghost"}
                                                onClick={() => field.onChange("4/5")}
                                                className='w-1/3'
                                            >
                                                4/5
                                            </Button>
                                            <Separator orientation="vertical" className='mx-1' />
                                            <Button
                                                type="button"
                                                variant={field.value === "6/7" ? "secondary" : "ghost"}
                                                onClick={() => field.onChange("6/7")}
                                                className='w-1/3'
                                            >
                                                6/7
                                            </Button>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Fuel Type */}
                        <FormField
                            control={form.control}
                            name="fuel_type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="block mt-8 text-sm font-semibold text-gray-600">Tipul de combustibil</FormLabel>
                                    <FormControl>
                                        <div className='flex items-center'>
                                            <DropdownSelect
                                                options={[
                                                    { value: "Benzina", label: "Benzina" },
                                                    { value: "Motorina", label: "Motorina" },
                                                    { value: "Hibrid", label: "Hibrid" },
                                                    { value: "Electric", label: "Electric" },
                                                ]}
                                                placeholder="Selecteaza un tip de combustibil"
                                                value={field.value}
                                                onChange={field.onChange}
                                                className="mt-1 p-6 w-2/3"
                                            />
                                            <Check className={cn("ml-3 h-6 w-6 text-green-500", field.value ? "block" : "hidden")} />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Power */}
                        <div className='flex justify-between w-2/3'>
                            <FormField
                                control={form.control}
                                name="power"
                                render={({ field }) => (
                                    <FormItem className='mt-8'>
                                        <FormLabel className='block text-sm font-semibold text-gray-600'>Putere</FormLabel>
                                        <FormControl>
                                            <div className='flex items-center'>
                                                <div className='relative'>
                                                    <InputCustom
                                                        id="power"
                                                        type="number"
                                                        placeholder="0"
                                                        className="p-6 pr-20 w-full"
                                                        {...field}
                                                        onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                                                    />
                                                    <span className="opacity-50 absolute inset-y-0 right-3 flex items-center">CP</span>
                                                </div>
                                                <Check className={cn("ml-3 h-6 w-6 text-green-500", field.value > 0 ? "block" : "hidden")} />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="engine_size"
                                render={({ field }) => (
                                    <FormItem className='mt-8'>
                                        <FormLabel className='block text-sm font-semibold text-gray-600'>Capacitate cilindrica</FormLabel>
                                        <FormControl>
                                            <div className='flex items-center'>
                                                <div className='relative'>
                                                    <InputCustom
                                                        id="engine_size"
                                                        type="number"
                                                        placeholder="0"
                                                        className="p-6 pr-20 w-full"
                                                        {...field}
                                                        onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                                                    />
                                                    <span className="opacity-50 absolute inset-y-0 right-3 flex items-center">cm3</span>
                                                </div>
                                                <Check className={cn("ml-3 h-6 w-6 text-green-500", field.value > 0 ? "block" : "hidden")} />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Transmission */}
                        <FormField
                            control={form.control}
                            name="transmission"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className='mt-8 block text-sm font-semibold mb-1'>Cutia de viteze</FormLabel>
                                    <FormControl>
                                        <div className='p-1 flex border w-2/3 justify-between rounded-md items-center h-12'>
                                            <Button
                                                type="button"
                                                variant={field.value === "Manual" ? "secondary" : "ghost"}
                                                onClick={() => field.onChange("Manual")}
                                                className='w-1/2'
                                            >
                                                Manuala
                                            </Button>
                                            <Separator orientation="vertical" className='mx-1' />
                                            <Button
                                                type="button"
                                                variant={field.value === "Automatic" ? "secondary" : "ghost"}
                                                onClick={() => field.onChange("Automatic")}
                                                className='w-1/2'
                                            >
                                                Automata
                                            </Button>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Photos */}
                        <FormField
                            control={form.control}
                            name="photos"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="block mt-8 text-sm font-semibold text-gray-600 mb-2">Fotografii</FormLabel>
                                    <FormControl>
                                        <div className="flex flex-wrap gap-4">
                                            {field.value.map((photo, index) => (
                                                <div
                                                    key={index}
                                                    className={`relative ${index === 0 ? 'w-[24rem] h-[18rem]' : 'w-[11rem] h-[8.5rem]'} border rounded-md overflow-hidden cursor-move`}
                                                    draggable
                                                    onDragStart={(e) => e.dataTransfer.setData('text/plain', index.toString())}
                                                    onDragOver={(e) => e.preventDefault()}
                                                    onDrop={(e) => {
                                                        e.preventDefault();
                                                        const fromIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
                                                        const toIndex = index;
                                                        const newPhotos = [...field.value];
                                                        const [movedItem] = newPhotos.splice(fromIndex, 1);
                                                        newPhotos.splice(toIndex, 0, movedItem);
                                                        field.onChange(newPhotos);
                                                    }}
                                                >
                                                    <img src={`https://pub-5e0f9c3c28524b78a12ca8f84bfb76d5.r2.dev/user-id-here/${photo}.webp`} alt={`Photo ${index + 1}`} className="w-full h-full object-cover" />
                                                    {index === 0 && (
                                                        <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded-md text-sm">
                                                            Poza principala
                                                        </div>
                                                    )}
                                                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded-md text-xs">
                                                        {index + 1}/{field.value.length}
                                                    </div>
                                                    <button
                                                        type="button"
                                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                                                        onClick={() => {
                                                            const newPhotos = field.value.filter((_, i) => i !== index);
                                                            field.onChange(newPhotos);
                                                        }}
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}
                                            <label className="w-[11rem] h-[8.5rem] border-2 border-dashed rounded-md flex items-center justify-center cursor-pointer">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    multiple
                                                    className="hidden"
                                                    onChange={async (e) => {
                                                        const files = Array.from(e.target.files || []);
                                                        setIsUploading(true);
                                                        try {
                                                            const uploadPromises = files.map(async (file) => {
                                                                const reader = new FileReader();
                                                                const fileDataPromise = new Promise((resolve) => {
                                                                    reader.onload = (e) => resolve(e.target?.result);
                                                                });
                                                                reader.readAsDataURL(file);
                                                                const fileData = await fileDataPromise;
                                                                const fileUuid = crypto.randomUUID();
                                                                return { fileUuid, contentType: file.type, data: (fileData as string).split(',')[1] };
                                                            });
                                                            const filesData = await Promise.all(uploadPromises);
                                                            const response = await fetch('/api/upload', {
                                                                method: 'POST',
                                                                headers: {
                                                                    'Content-Type': 'application/json',
                                                                    'X-User-Id': 'user-id-here', // Replace with actual user ID
                                                                },
                                                                body: JSON.stringify({ files: filesData }),
                                                            });
                                                            if (!response.ok) {
                                                                throw new Error('Upload failed');
                                                            }
                                                            const { fileUrls } = await response.json();
                                                            const newPhotoIds = fileUrls.map((url: string) => {
                                                                const parts = url.split('/');
                                                                return parts[parts.length - 1].split('.')[0]; // Extract the UUID
                                                            });
                                                            field.onChange([...field.value, ...newPhotoIds]);
                                                        } catch (error) {
                                                            console.error('Error uploading files:', error);
                                                            // Handle error (e.g., show error message to user)
                                                        } finally {
                                                            setIsUploading(false);
                                                        }
                                                    }}
                                                />
                                                {isUploading ? (
                                                    <div className="flex flex-col items-center">
                                                        <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
                                                        <span className="mt-2 text-sm text-gray-500">Uploading...</span>
                                                    </div>
                                                ) : (
                                                    <Plus className="w-8 h-8 text-gray-400" />
                                                )}
                                            </label>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Description */}
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="block mt-8 text-sm font-semibold text-gray-600">Descriere</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Scrie o descriere pentru anunt..."
                                            className="mt-1 p-6 w-full"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Short Description */}
                        <FormField
                            control={form.control}
                            name="short_description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="block mt-8 text-sm font-semibold text-gray-600">Descriere scurta</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Scrie o descriere scurta pentru anunt..."
                                            className="mt-1 p-6 w-full"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Price */}
                        <FormField
                            control={form.control}
                            name="price"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="block mt-8 text-sm font-semibold text-gray-600">Pret</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Introduceți pretul..."
                                            className="mt-1 p-6 w-full"
                                            type="number"
                                            {...field}
                                            onChange={(e) => field.onChange(Number(e.target.value))}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Location */}
                        <FormField
                            control={form.control}
                            name="location"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="block mt-8 text-sm font-semibold text-gray-600">Locatie</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Introduceți locatia..."
                                            className="mt-1 p-6 w-full"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />


                        {/* Submit Button */}
                        <Button type="submit" size="lg" className="mt-8 bg-blue-600 w-full">
                            Creeaza anuntul
                        </Button>
                    </form>
                </Form>
            </div>
        </div>
    )
}



