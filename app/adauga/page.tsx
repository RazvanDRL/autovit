"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { toast, Toaster } from 'sonner';

import { Check, ChevronDown, CirclePlus, Loader2, Plus, X } from "lucide-react"

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
import { Input } from '@/components/ui/input';
import { InputCustom } from '@/components/ui/inputCustom';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/lib/supabaseClient'
import { User as UserType } from '@supabase/supabase-js';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Textarea } from '@/components/ui/textarea';
import { useRouter } from 'next/navigation';
import { delay } from '@/lib/delay';
import Navbar from '@/components/navbar';
import Tiptap from '@/components/tiptap';
import Image from 'next/image';
import Loading from '@/components/loading';
import cities from '@/lib/cities.json';
import { County, fetchCounties } from '@/lib/index';
import { carBrands } from '@/lib/carBrands';
import DropdownSelect from '@/components/dropdownSelect';
import { body_types, BodyType, fuel_types, FuelType } from '@/types/schema';
import { equipment_types } from '@/types/schema';
import { Checkbox } from "@/components/ui/checkbox"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"

const years = Array.from({ length: new Date().getFullYear() - 1900 + 1 }, (_, i) => new Date().getFullYear() - i);

const MAX_FILES = 40;
const MAX_UPLOAD_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_LENGTH = 30;

const formSchema = z.object({
    id: z.string(),
    user_id: z.string(),
    user_full_name: z.string(),
    user_phone: z.string(),
    is_company: z.boolean(),
    vin: z.string().min(16).max(17).optional(),
    brand: z.string().min(2).max(50),
    model: z.string().min(2).max(50),
    year: z.number().int().min(1900).max(new Date().getFullYear()),
    price: z.number().int().min(1, {
        message: "Pretul trebuie sa fie mai mare decat 0"
    }).transform(val =>
        val > 1000000 ? Number(val.toString().slice(0, -3) + "000") : val
    ),
    engine_size: z.number().int().min(1).max(9999, {
        message: "Capacitatea cilindrica trebuie sa fie intre 1 si 9999 cm³"
    }),
    power: z.number().int().min(1).max(2000, {
        message: "Puterea trebuie sa fie intre 1 si 2000 CP"
    }),
    km: z.number().int().min(0).max(999999, {
        message: "Kilometrajul trebuie sa fie intre 0 si 999,999 km"
    }),
    transmission: z.string().min(2).max(50),
    fuel_type: z.string().min(2).max(50),
    body_type: z.string().min(2).max(50),
    location_city: z.string().min(2).max(50),
    location_county: z.string().min(2).max(50),
    description: z.string().min(30).max(9000),
    short_description: z.string().min(3).max(MAX_LENGTH),
    photos: z.array(z.string()).min(1).max(MAX_FILES),
    doors: z.string().min(3).max(3),
    brand_id: z.number().int().min(1),
    model_id: z.number().int().min(1),
    equipment: z.array(z.string()),
}).refine(data => {
    if (data.year === new Date().getFullYear() && data.km > 10000) {
        return false;
    }
    return true;
}, {
    message: "Kilometrajul pare prea mare pentru un vehicul din anul curent",
    path: ["km"]
});


const DropdownSelectt = ({ options, placeholder, value, onChange, className, disabled }: {
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

const EquipmentGrid = ({ options, value, onChange }: {
    options: { value: string; label: string; category: string }[];
    value: string[];
    onChange: (value: string[]) => void;
}) => {
    const groupedOptions = options.reduce((acc, curr) => {
        if (!acc[curr.category]) {
            acc[curr.category] = [];
        }
        acc[curr.category].push(curr);
        return acc;
    }, {} as Record<string, typeof options>);

    return (
        <Accordion type="multiple" className="w-full">
            {Object.entries(groupedOptions).map(([category, items]) => (
                <AccordionItem value={category} key={category}>
                    <AccordionTrigger className="text-base font-semibold justify-between no-underline hover:no-underline">
                        <div className="flex items-center">
                            {category}
                            <span className="text-sm font-normal text-gray-500 ml-2">
                                ({items.filter(item => value.includes(item.value)).length}/{items.length})
                            </span>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 select-none">
                            {items.map((item) => (
                                <div key={item.value} className="flex items-center space-x-3">
                                    <Checkbox
                                        id={item.value}
                                        checked={value.includes(item.value)}
                                        onCheckedChange={(checked) => {
                                            if (checked) {
                                                onChange([...value, item.value]);
                                            } else {
                                                onChange(value.filter((v) => v !== item.value));
                                            }
                                        }}
                                    />
                                    <label
                                        htmlFor={item.value}
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                    >
                                        {item.label}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
    );
};

export default function CarAdForm() {
    const router = useRouter();
    const [isUploading, setIsUploading] = useState(false);
    const [user, setUser] = useState<UserType | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [listingId, setListingId] = useState("");
    const [loading, setLoading] = useState(true);
    const [counties, setCounties] = useState<County[]>([]);
    const [availableModels, setAvailableModels] = useState<{ value: string; label: string; id?: number; group?: boolean; groupId?: number, subModel?: boolean }[]>([]);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            id: listingId || "",
            user_id: '',
            user_full_name: user?.user_metadata.full_name || '',
            user_phone: user?.phone || '',
            is_company: false,
            vin: '',
            brand: '',
            model: '',
            year: new Date().getFullYear(),
            description: '',
            transmission: '',
            fuel_type: '',
            location_city: '',
            location_county: '',
            short_description: '',
            photos: [],
            doors: '',
            price: undefined,
            engine_size: undefined,
            power: undefined,
            km: undefined,
            brand_id: 0,
            model_id: 0,
            equipment: [],
        },
    });

    useEffect(() => {
        async function fetchUserData() {
            const { data: { user } } = await supabase.auth.getUser();
            const { data: { session } } = await supabase.auth.getSession();
            setUser(user);
            setAccessToken(session?.access_token || null);
            setLoading(false);
        }

        fetchUserData();
    }, []);

    useEffect(() => {
        if (user?.id) {
            form.setValue('user_id', user.id);
        }
    }, [user, form]);

    async function onSubmit(data: z.infer<typeof formSchema>) {
        console.log(data);
        data.id = listingId || '';
        if (!user?.id) {
            toast.error('Eroare la adaugarea anuntului!');
            return;
        }

        const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('name')
            .eq('id', user?.id)
            .single();

        if (profileError) {
            toast.error('Eroare la adaugarea anuntului!');
            console.error(profileError);
        }

        if (!profileData) {
            toast.error('Eroare la adaugarea anuntului!');
            return;
        }

        data.is_company = false;
        data.user_phone = '0770429755';

        if (data.user_full_name === '') {
            data.user_full_name = profileData.name || '';
        }

        // Find the selected model from availableModels
        const selectedModel = availableModels.find(m => m.label === data.model);

        // Find the parent group for subModels
        let group = null;
        let group_id = null;
        if (selectedModel?.subModel) {
            const parentGroup = availableModels.slice(0, availableModels.indexOf(selectedModel))
                .reverse()
                .find(m => m.group === true);
            group = parentGroup?.label || null;
            group_id = parentGroup?.id || null;
        }

        // Transform selected equipment values into full objects with all metadata
        const equipmentByCategory = equipment_types.reduce((acc, item) => {
            if (data.equipment.includes(item.value)) {
                if (!acc[item.category]) {
                    acc[item.category] = [];
                }
                acc[item.category].push({
                    value: item.value,
                    label: item.label,
                    category: item.category
                });
            }
            return acc;
        }, {} as Record<string, Array<{
            value: string;
            label: string;
            category: string;
        }>>);

        const { data: anuntData, error: anuntError } = await supabase
            .from('listings')
            .insert([{
                ...data,
                equipment: equipmentByCategory,
                user_id: user?.id,
                group: group,
                group_id: group_id
            }])

        if (anuntError) {
            toast.error('Eroare la adaugarea anuntului!');
            console.error(anuntError);
        } else {
            toast.success('Anuntul a fost adaugat cu succes! Veti fi redirectat la pagina anuntului.');
            await delay(2000);
            if (data.id) {
                router.replace(`/a/${data.id}`);
            }
        }
    }

    const fuelTypes = fuel_types
        .filter(Boolean)
        .map(type => ({ value: type as string, label: type as string }));

    const bodyTypes = body_types
        .filter(Boolean)
        .map(type => ({ value: type as string, label: type as string }));

    if (loading) return <Loading />;

    return (
        <div className="min-h-screen bg-white">
            <Navbar />
            <div className="p-4 sm:p-8">
                <Toaster richColors position="top-right" />
                {user ? (
                    <div className="max-w-4xl mx-auto bg-white rounded-sm">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <h1 className='text-[28px] sm:text-[32px] font-bold'>
                                    Adauga un anunt nou
                                </h1>

                                {/* VIN */}
                                <FormField
                                    control={form.control}
                                    name="vin"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="block text-sm font-semibold text-gray-600">VIN (seria de șasiu)</FormLabel>
                                            <FormControl>
                                                <div className='flex items-center w-full sm:w-2/3'>
                                                    <Input
                                                        placeholder="Introduceți VIN-ul..."
                                                        className="p-4 sm:p-6 w-full text-md bg-[#EBECEF] rounded-sm border-none"
                                                        {...field}
                                                    />
                                                    <Check className={cn("ml-3 h-6 w-6 text-green-500", field.value ? "opacity-100" : "opacity-0")} />
                                                </div>
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
                                                <div className='flex items-center w-full sm:w-2/3'>
                                                    <DropdownSelect
                                                        options={carBrands}
                                                        placeholder="Selecteaza o marca"
                                                        value={field.value}
                                                        onChange={async (value) => {
                                                            field.onChange(value);
                                                            form.setValue('model', '');

                                                            // Set brand_id
                                                            const selectedBrand = carBrands.find(b => b.label === value);
                                                            if (selectedBrand?.value) {
                                                                form.setValue('brand_id', parseInt(selectedBrand.value, 10));
                                                            }

                                                            // Fetch models for selected brand
                                                            if (selectedBrand) {
                                                                const { data: modelsData } = await supabase
                                                                    .from('models')
                                                                    .select('data')
                                                                    .eq('value', selectedBrand.value)
                                                                    .single();

                                                                if (modelsData?.data) {
                                                                    setAvailableModels(modelsData.data.map((model: any) => ({
                                                                        value: model.displayName,
                                                                        label: model.displayName,
                                                                        id: model.id,
                                                                        group: model.group || false,
                                                                        subModel: model.subModel || false
                                                                    })));
                                                                }
                                                            }
                                                        }}
                                                        className="mt-1 p-4 sm:p-6 w-full"
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
                                                <div className='flex items-center w-full sm:w-2/3'>
                                                    <div className="relative w-full">
                                                        <select
                                                            id="model-select"
                                                            value={field.value}
                                                            onChange={(e) => {
                                                                field.onChange(e.target.value);
                                                                // Set model_id
                                                                const selectedModel = availableModels.find(m => m.label === e.target.value);
                                                                if (selectedModel?.id) {
                                                                    form.setValue('model_id', selectedModel.id);
                                                                }
                                                            }}
                                                            disabled={!form.watch("brand")}
                                                            className={`w-full appearance-none text-md justify-between rounded-sm font-[400] p-3 pl-6 pr-12 ${!form.watch("brand")
                                                                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                                                : "bg-[#EBECEF] border-[#EBECEF]"
                                                                }`}
                                                        >
                                                            <option value="">Selectează modelul</option>
                                                            {availableModels.map((option) => (
                                                                <option
                                                                    key={option.value}
                                                                    value={option.value}
                                                                    disabled={option.group}
                                                                >
                                                                    {option.group ? option.label : `\u00A0\u00A0\u00A0\u00A0${option.label}`}
                                                                </option>
                                                            ))}
                                                        </select>
                                                        <ChevronDown className={`absolute right-6 top-1/2 -translate-y-1/2 h-8 w-8 shrink-0 pointer-events-none ${!form.watch("brand") ? "text-gray-400" : ""
                                                            }`} />
                                                    </div>
                                                    <Check className={cn("ml-3 h-6 w-6 text-green-500", field.value ? "opacity-100" : "opacity-0")} />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Year */}
                                <div className='flex justify-between w-full sm:w-2/3 gap-4 sm:gap-12'>
                                    <FormField
                                        control={form.control}
                                        name="year"
                                        render={({ field }) => (
                                            <FormItem className="w-full sm:w-1/2">
                                                <FormLabel className="block mt-8 text-sm font-semibold text-gray-600">Anul fabricatiei</FormLabel>
                                                <FormControl>
                                                    <div className='flex items-center w-full sm:w-2/3'>
                                                        <DropdownSelect
                                                            options={years.map((year) => ({ value: year.toString(), label: year.toString() }))}
                                                            placeholder="Selecteaza un an"
                                                            value={field.value.toString()}
                                                            onChange={(value) => field.onChange(parseInt(value, 10))}
                                                            className="mt-1 p-4 sm:p-6 w-full"
                                                        />
                                                        <Check className={cn("ml-3 h-6 w-6 text-green-500", field.value ? "opacity-100" : "opacity-0")} />
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
                                                <div className='flex items-center w-2/3 font-mono'>
                                                    <div className='relative w-full sm:w-1/3'>
                                                        <InputCustom
                                                            id="km"
                                                            type="number"
                                                            placeholder="0"
                                                            className="p-4 sm:p-6 pr-11 w-full"
                                                            {...field}
                                                            value={field.value || ''}
                                                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value, 10) : undefined)}
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

                                <h1 className='text-[24px] pt-12 font-bold mb-4'>Detaliile modelului</h1>
                                <Separator className="mb-10" />

                                {/* Doors */}
                                <FormField
                                    control={form.control}
                                    name="doors"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className='mt-8 block text-sm font-semibold mb-1'>Numar de portiere</FormLabel>
                                            <FormControl>
                                                <div className='flex items-center w-2/3'>
                                                    <div className='p-1 bg-[#EBECEF] flex w-full justify-between rounded-md items-center h-12'>
                                                        <Button
                                                            type="button"
                                                            variant={field.value === "2/3" ? "secondary" : "ghost"}
                                                            onClick={() => field.onChange("2/3")}
                                                            className={`w-1/3 ${field.value === "2/3" ? "bg-white/80" : "bg-[#EBECEF]"}`}
                                                        >
                                                            2/3
                                                        </Button>
                                                        <Separator orientation="vertical" className='mx-1 bg-black/20' />
                                                        <Button
                                                            type="button"
                                                            variant={field.value === "4/5" ? "secondary" : "ghost"}
                                                            onClick={() => field.onChange("4/5")}
                                                            className={`w-1/3 ${field.value === "4/5" ? "bg-white/80" : "bg-[#EBECEF]"}`}
                                                        >
                                                            4/5
                                                        </Button>
                                                        <Separator orientation="vertical" className='mx-1 bg-black/20' />
                                                        <Button
                                                            type="button"
                                                            variant={field.value === "6/7" ? "secondary" : "ghost"}
                                                            onClick={() => field.onChange("6/7")}
                                                            className={`w-1/3 ${field.value === "6/7" ? "bg-white/80" : "bg-[#EBECEF]"}`}
                                                        >
                                                            6/7
                                                        </Button>
                                                    </div>
                                                    <Check className={cn("ml-3 h-6 w-6 text-green-500", field.value ? "opacity-100" : "opacity-0")} />
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
                                                <div className='flex items-center w-2/3'>
                                                    <DropdownSelect
                                                        options={fuelTypes}
                                                        placeholder="Selecteaza un tip de combustibil"
                                                        value={field.value}
                                                        onChange={field.onChange}
                                                        className="mt-1 p-6 w-full"
                                                    />
                                                    <Check className={cn("ml-3 h-6 w-6 text-green-500", field.value ? "opacity-100" : "opacity-0")} />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="body_type"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="block mt-8 text-sm font-semibold text-gray-600">Tipul de caroserie</FormLabel>
                                            <FormControl>
                                                <div className='flex items-center w-2/3'>
                                                    <DropdownSelect
                                                        options={bodyTypes}
                                                        placeholder="Selecteaza un tip de caroserie"
                                                        value={field.value}
                                                        onChange={field.onChange}
                                                        className="mt-1 p-6 w-full"
                                                    />
                                                    <Check className={cn("ml-3 h-6 w-6 text-green-500", field.value ? "opacity-100" : "opacity-0")} />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Power */}
                                <div className='flex gap-8'>
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
                                                                value={field.value || ''}
                                                                onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value, 10) : undefined)}
                                                            />
                                                            <span className="opacity-50 absolute inset-y-0 right-3 flex items-center">CP</span>
                                                        </div>
                                                        <Check className={cn("ml-3 h-6 w-6 text-green-500", field.value > 0 ? "opacity-100" : "opacity-0")} />
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
                                                                value={field.value || ''}
                                                                onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value, 10) : undefined)}
                                                            />
                                                            <span className="opacity-50 absolute inset-y-0 right-3 flex items-center">cm<sup>3</sup></span>
                                                        </div>
                                                        <Check className={cn("ml-3 h-6 w-6 text-green-500", field.value > 0 ? "opacity-100" : "opacity-0")} />
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
                                                <div className='flex items-center w-2/3'>
                                                    <div className='p-1 flex bg-[#EBECEF] justify-between rounded-md items-center h-12'>
                                                        <Button
                                                            type="button"
                                                            variant={field.value === "Manual" ? "secondary" : "ghost"}
                                                            onClick={() => field.onChange("Manual")}
                                                            className={`w-1/2 ${field.value === "Manual" ? "bg-white/80" : "bg-[#EBECEF]"}`}
                                                        >
                                                            Manuala
                                                        </Button>
                                                        <Separator orientation="vertical" className='mx-1 bg-black/20' />
                                                        <Button
                                                            type="button"
                                                            variant={field.value === "Automatic" ? "secondary" : "ghost"}
                                                            onClick={() => field.onChange("Automatic")}
                                                            className={`w-1/2 ${field.value === "Automatic" ? "bg-white/80" : "bg-[#EBECEF]"}`}
                                                        >
                                                            Automata
                                                        </Button>
                                                    </div>
                                                    <Check className={cn("ml-3 h-6 w-6 text-green-500", field.value ? "opacity-100" : "opacity-0")} />
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
                                            <FormLabel className="block mt-8 text-sm font-semibold text-gray-600 mb-2">Fotografii (minim 3)</FormLabel>
                                            <FormControl>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                                    {field.value.map((photo, index) => (
                                                        <div
                                                            key={index}
                                                            className={`relative ${index === 0
                                                                ? 'col-span-1 sm:col-span-2 lg:col-span-3 h-[200px] sm:h-[300px]'
                                                                : 'h-[150px] sm:h-[200px]'
                                                                } border rounded-md overflow-hidden cursor-move`}
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
                                                            <Image
                                                                src={`https://pub-5e0f9c3c28524b78a12ca8f84bfb76d5.r2.dev/${listingId}/${photo}-thumbnail.webp`}
                                                                alt={`Photo ${index + 1}`}
                                                                className="w-full h-full object-cover"
                                                                fill
                                                            />
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
                                                    <label className="h-[150px] sm:h-[200px] border-2 border-dashed rounded-md flex items-center justify-center cursor-pointer">
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            multiple
                                                            className="hidden"
                                                            onChange={async (e) => {
                                                                const files = Array.from(e.target.files || []);
                                                                setIsUploading(true);
                                                                let lisd = "";
                                                                if (!listingId) {
                                                                    lisd = crypto.randomUUID();
                                                                    setListingId(lisd);
                                                                }
                                                                try {
                                                                    const uploadPromises = files.map(async (file) => {
                                                                        const reader = new FileReader();
                                                                        const fileDataPromise = new Promise((resolve) => {
                                                                            reader.onload = (e) => resolve(e.target?.result);
                                                                        });
                                                                        reader.readAsDataURL(file);
                                                                        const fileData = await fileDataPromise;
                                                                        const fileUuid = crypto.randomUUID();

                                                                        return { listingId: listingId || lisd, fileUuid, contentType: file.type, data: (fileData as string).split(',')[1] };
                                                                    });

                                                                    const filesData = await Promise.all(uploadPromises);
                                                                    const response = await fetch('/api/upload', {
                                                                        method: 'POST',
                                                                        headers: {
                                                                            'Content-Type': 'application/json',
                                                                            Authorization: accessToken ?? '',
                                                                        },
                                                                        body: JSON.stringify({ files: filesData }),
                                                                    });

                                                                    if (!response.ok) {
                                                                        throw new Error('Upload failed');
                                                                    }

                                                                    const { fileUrls } = await response.json();
                                                                    // Each fileUrl object now contains originalUrl and thumbnailUrl
                                                                    const newPhotoIds = filesData.map(data => data.fileUuid);
                                                                    field.onChange([...field.value, ...newPhotoIds]);

                                                                } catch (error) {
                                                                    console.error('Error uploading files:', error);
                                                                    toast.error('Eroare la încărcarea fișierelor!');
                                                                } finally {
                                                                    setIsUploading(false);
                                                                }
                                                            }
                                                            }
                                                        />
                                                        {isUploading ? (
                                                            <div className="flex flex-col items-center">
                                                                <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
                                                                <span className="mt-2 text-sm text-gray-500">Încărcare...</span>
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
                                                <Tiptap
                                                    value={field.value}
                                                    onChange={(newValue) => field.onChange(newValue)}
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
                                                <InputCustom
                                                    placeholder="Scrie o descriere scurta pentru anunt..."
                                                    className="mt-1 p-4 sm:p-6 w-2/3"
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
                                                <div className='flex items-center w-full sm:w-2/3 pr-8'>
                                                    <div className='relative w-full sm:w-1/3'>
                                                        <InputCustom
                                                            id="km"
                                                            type="number"
                                                            placeholder="0"
                                                            min={0}
                                                            className="p-4 sm:p-6 pr-12 w-full"
                                                            {...field}
                                                            value={field.value || ''}
                                                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value, 10) : undefined)}
                                                        />
                                                        <span className="opacity-50 absolute inset-y-0 font-[500] right-3 flex items-center">EUR</span>
                                                    </div>
                                                    <Check className={cn("ml-3 h-6 w-6 text-green-500", field.value > 0 ? "block" : "hidden")} />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Location */}
                                <div className='flex flex-col sm:flex-row w-full gap-4 sm:gap-8'>
                                    <FormField
                                        control={form.control}
                                        name="location_city"
                                        render={({ field }) => (
                                            <FormItem className="w-full sm:w-1/2">
                                                <FormLabel className="block mt-8 text-sm font-semibold text-gray-600">Oras</FormLabel>
                                                <FormControl>
                                                    <div className='flex items-center w-full'>
                                                        <DropdownSelectt
                                                            options={cities.map((city: { auto: string; nume: string }) => ({ value: city.auto, label: city.nume }))}
                                                            placeholder="Selecteaza un oras"
                                                            value={cities.find(city => city.auto === field.value)?.nume || field.value}
                                                            onChange={async (value) => {
                                                                field.onChange(value)
                                                                const countiesData = await fetchCounties(value);
                                                                setCounties(countiesData);
                                                            }}
                                                            className="mt-1 p-4 sm:p-6 w-full"
                                                        />
                                                        <Check className={cn("ml-3 h-6 w-6 text-green-500", field.value ? "opacity-100" : "opacity-0")} />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="location_county"
                                        render={({ field }) => (
                                            <FormItem className="w-full sm:w-1/2">
                                                <FormLabel className="block mt-8 text-sm font-semibold text-gray-600">Judet</FormLabel>
                                                <FormControl>
                                                    <div className='flex items-center w-full'>
                                                        <DropdownSelectt
                                                            options={counties
                                                                .filter((county: County) => county.nume !== undefined)
                                                                .reduce((unique: County[], current: County) => {
                                                                    if (!unique.some(item => item.nume === current.nume)) {
                                                                        unique.push(current);
                                                                    }
                                                                    return unique;
                                                                }, [])
                                                                .sort((a, b) => (a.nume || '').localeCompare(b.nume || ''))
                                                                .map((county: County) => ({
                                                                    value: county.nume as string,
                                                                    label: county.nume
                                                                }))}
                                                            placeholder="Selecteaza un judet"
                                                            value={counties.find(county => county.nume === field.value)?.nume || field.value}
                                                            onChange={field.onChange}
                                                            className="mt-1 p-4 sm:p-6 w-full"
                                                            disabled={!form.watch('location_city')}
                                                        />
                                                        <Check className={cn("ml-3 h-6 w-6 text-green-500", field.value ? "opacity-100" : "opacity-0")} />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                {/* Equipment */}
                                <FormField
                                    control={form.control}
                                    name="equipment"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="block mt-8 text-sm font-semibold text-gray-600">Dotări</FormLabel>
                                            <FormControl>
                                                <EquipmentGrid
                                                    options={equipment_types.map(type => ({
                                                        value: type.value,
                                                        label: type.label,
                                                        category: type.category
                                                    }))}
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Submit Button */}
                                <div className='flex justify-center sm:justify-end w-full'>
                                    <Button type="submit" size="lg" className="mt-8 bg-[#EB2126] hover:bg-[#EB2126]/90 hover:scale-105 transition-all duration-300 w-full sm:w-auto">
                                        <CirclePlus className="mr-2 h-4 w-4" />
                                        Creează anunțul
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </div>
                ) : (
                    <div className="max-w-4xl mx-auto bg-white rounded-sm">
                        <h1 className='text-[32px] font-bold'>Trebuie sa fii logat pentru a pune un anunt!</h1>
                    </div>
                )}
            </div>
        </div >
    )
}
