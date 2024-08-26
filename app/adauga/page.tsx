"use client";
// eautoaz
import React, { useState, useEffect, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { toast } from 'sonner';

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

const brands = ['BMW', 'Mercedes', 'Audi', 'Toyota', 'Ford'];
const models: { [key: string]: string[] } = {
    BMW: ['3 Series', '5 Series', 'X5', 'i8'],
    Mercedes: ['C-Class', 'E-Class', 'S-Class', 'GLE'],
    Audi: ['A4', 'A6', 'Q5', 'e-tron'],
    Toyota: ['Corolla', 'Camry', 'RAV4', 'Prius'],
    Ford: ['Focus', 'Mustang', 'Explorer', 'F-150']
};

const years = Array.from({ length: new Date().getFullYear() - 1900 + 1 }, (_, i) => new Date().getFullYear() - i);

const months = Array.from({ length: 12 }, (_, i) => new Date(0, i).toLocaleString('default', { month: 'long' }));

const MAX_FILES = 10;
const MAX_UPLOAD_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_LENGTH = 30;

const formSchema = z.object({
    vin: z.string().min(16).max(17).optional(),
    brand: z.string().min(2).max(50),
    model: z.string().min(2).max(50),
    year: z.number().int().min(1900).max(new Date().getFullYear()),
    month: z.string().min(2).max(50),
    price: z.number().int().min(0),
    engineSize: z.number().min(0),
    power: z.number().int().min(0),
    km: z.number().int().min(0),
    transmission: z.string().min(2).max(50),
    fuelType: z.string().min(2).max(50),
    location: z.string().min(2).max(50),
    description: z.string().min(30).max(9000),
    shortDescription: z.string().min(3).max(MAX_LENGTH),
    category: z.string().min(2).max(50),
    title: z.string().min(16).max(50),
    photos: z.array(z.string()).min(1).max(MAX_FILES),
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
    const [selectedBrand, setSelectedBrand] = useState("");
    const [selectedModel, setSelectedModel] = useState("");
    const [selectedYear, setSelectedYear] = useState("");
    const [selectedMonth, setSelectedMonth] = useState("");
    const [selectedKm, setSelectedKm] = useState("");
    const [selectedEngineSize, setSelectedEngineSize] = useState("");
    const [selectedPower, setSelectedPower] = useState("");
    const [selectedTransmission, setSelectedTransmission] = useState("");
    const [selectedFuelType, setSelectedFuelType] = useState("");
    const [selectedLocation, setSelectedLocation] = useState("");
    const [selectedDoors, setSelectedDoors] = useState<"2/3" | "4/5" | "6/7" | "">("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedTitle, setSelectedTitle] = useState("");
    const [selectedDescription, setSelectedDescription] = useState("");
    const [selectedShortDescription, setSelectedShortDescription] = useState("");
    const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
    const [selectedPhotosUrls, setSelectedPhotosUrls] = useState<string[]>([]);
    const [selectedPrice, setSelectedPrice] = useState("");
    const [selectedVin, setSelectedVin] = useState("");

    console.log(selectedPhotos);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            vin: '',
            brand: '',
            model: '',
            year: new Date().getFullYear(),
            month: '',
            price: 0,
            engineSize: 0,
            power: 0,
            km: 0,
            transmission: '',
            fuelType: '',
            location: '',
            description: '',
            shortDescription: '',
            category: '',
            title: '',
            photos: [],
        },
    });

    const onSubmit = async (values: any) => {
        // Simulating API call
        await new Promise((resolve) => setTimeout(resolve, 2000));
        console.log(values);
    };

    return (
        <div className="min-h-screen bg-white p-8">
            <div className="max-w-4xl mx-auto bg-white   rounded-sm">
                <h1 className='text-[32px] font-bold'>
                    Adauga un anunt nou
                </h1>

                {/* Brand */}
                <div>
                    <Label className="block mt-8 text-sm font-semibold text-gray-600">Marca</Label>
                    <div className='flex items-center'>
                        <DropdownSelect
                            options={brands.map((brand) => ({ value: brand, label: brand }))}
                            placeholder="Selecteaza o marca"
                            value={selectedBrand}
                            onChange={(value) => {
                                setSelectedBrand(value);
                                form.setValue("brand", value);
                                setSelectedModel("");
                                form.setValue("model", "");
                            }}
                            className="mt-1 p-6 w-2/3"
                        />
                        <Check className={cn("ml-3 h-6 w-6 text-green-500", selectedBrand ? "opacity-100" : "opacity-0")} />
                    </div>
                </div>

                {/* Model */}
                <div>
                    <Label className="block mt-8 text-sm font-semibold text-gray-600">Model</Label>
                    <div className='flex items-center'>
                        <DropdownSelect
                            options={selectedBrand ? models[selectedBrand].map((model) => ({ value: model, label: model })) : []}
                            placeholder="Selecteaza un model..."
                            value={selectedModel}
                            onChange={(value) => {
                                setSelectedModel(value);
                                form.setValue("model", value);
                            }}
                            className="mt-1 p-6 w-2/3"
                            disabled={!selectedBrand}
                        />
                        <Check className={cn("ml-3 h-6 w-6 text-green-500", selectedModel ? "opacity-100" : "opacity-0")} />
                    </div>
                </div>

                {/* Year & Month */}
                <div className='flex justify-between w-2/3 gap-12'>
                    {/* Year */}
                    <div className="w-1/2">
                        <Label className="block mt-8 text-sm font-semibold text-gray-600">Anul fabricatiei</Label>
                        <div className='flex items-center'>
                            <DropdownSelect
                                options={years.map((year) => ({ value: year.toString(), label: year.toString() }))}
                                placeholder="Selecteaza un an"
                                value={selectedYear}
                                onChange={(value) => {
                                    setSelectedYear(value);
                                    form.setValue("year", parseInt(value, 10));
                                }}
                                className="mt-1 p-6 w-full"
                            />
                            <Check className={cn("ml-3 h-6 w-6 text-green-500", selectedYear ? "block" : "hidden")} />
                        </div>
                    </div>
                    {/* Month */}
                    <div className="w-1/2">
                        <Label className="block mt-8 text-sm font-semibold text-gray-600">Luna</Label>
                        <div className='flex items-center'>
                            <DropdownSelect
                                options={months.map((month) => ({ value: month, label: month }))}
                                placeholder="Selecteaza o luna"
                                value={selectedMonth}
                                onChange={(value) => {
                                    setSelectedMonth(value);
                                    form.setValue("month", value);
                                }}
                                className="mt-1 p-6 w-full"
                            />
                            <Check className={cn("ml-3 h-6 w-6 text-green-500", selectedMonth ? "block" : "hidden")} />
                        </div>
                    </div>
                </div>

                {/* Km */}
                <div className='mt-8'>
                    <Label className='block text-sm font-semibold text-gray-600'>Km</Label>
                    <div className='flex items-center'>
                        <div className='relative w-1/3'>
                            <InputCustom
                                id="km"
                                type="number"
                                placeholder="0"
                                className="p-6 pr-11"
                                onBlur={(e) => {
                                    setSelectedKm(e.target.value);
                                    form.setValue("km", parseInt(e.target.value, 10));
                                    console.log(e.target.value);
                                }}
                            />
                            <span className="opacity-50 absolute inset-y-0 right-3 flex items-center">km</span>
                        </div>
                        <Check className={cn("ml-3 h-6 w-6 text-green-500", Number(selectedKm) > 0 ? "block" : "hidden")} />
                    </div>
                </div>

                <h1 className='text-[16px] mt-16 font-bold mb-4'>Detaliile modelului</h1>
                <Separator className="mb-10" />

                {/* Number of Doors*/}
                <div>
                    <Label className='mt-8 block text-sm font-semibold mb-1'>Numar de portiere</Label>
                    <div className='p-1 flex border w-2/3 justify-between rounded-md items-center h-12'>
                        <Button
                            variant={"ghost"}
                            onClick={() => {
                                setSelectedDoors("2/3");
                            }}
                            className='w-1/3'
                        >
                            2/3
                        </Button>
                        <Separator orientation="vertical" className='mx-1' />
                        <Button
                            variant={"ghost"}
                            onClick={() => {
                                setSelectedDoors("4/5");
                            }}
                            className='w-1/3'
                        >
                            4/5
                        </Button>
                        <Separator orientation="vertical" className='mx-1' />
                        <Button
                            variant={"ghost"}
                            onClick={() => {
                                setSelectedDoors("6/7");
                            }}
                            className='w-1/3'
                        >
                            6/7</Button>
                    </div>
                </div>

                {/* Fuel type */}
                <div>
                    <Label className="block mt-8 text-sm font-semibold text-gray-600">Tipul de combustibil</Label>
                    <div className='flex items-center'>
                        <DropdownSelect
                            options={[
                                { value: "Benzina", label: "Benzina" },
                                { value: "Motorina", label: "Motorina" },
                                { value: "Hibrid", label: "Hibrid" },
                                { value: "Electric", label: "Electric" },
                            ]}
                            placeholder="Selecteaza un tip de combustibil"
                            value={selectedFuelType}
                            onChange={(value) => {
                                setSelectedFuelType(value);
                                form.setValue("fuelType", value);
                            }}
                            className="mt-1 p-6 w-2/3"
                        />
                        <Check className={cn("ml-3 h-6 w-6 text-green-500", selectedFuelType ? "block" : "hidden")} />
                    </div>
                </div>

                <div className='flex justify-between w-2/3'>
                    {/* Power */}
                    <div className='mt-8'>
                        <Label className='block text-sm font-semibold text-gray-600'>Putere</Label>
                        <div className='flex items-center'>
                            <div className='relative'>
                                <InputCustom
                                    id="power"
                                    type="number"
                                    placeholder="0"
                                    className="p-6 pr-20 w-full"
                                    onBlur={(e) => {
                                        setSelectedPower(e.target.value);
                                        form.setValue("power", parseInt(e.target.value, 10));
                                        console.log(e.target.value);
                                    }}
                                />
                                <span className="opacity-50 absolute inset-y-0 right-3 flex items-center">CP</span>
                            </div>
                            <Check className={cn("ml-3 h-6 w-6 text-green-500", Number(selectedPower) > 0 ? "block" : "hidden")} />
                        </div>
                    </div>

                    {/* Engine Size */}
                    <div className='mt-8'>
                        <Label className='block text-sm font-semibold text-gray-600'>Capacitate cilindrica</Label>
                        <div className='flex items-center'>
                            <div className='relative'>
                                <InputCustom
                                    id="engineSize"
                                    type="number"
                                    placeholder="0"
                                    className="p-6 pr-20 w-full"
                                    onBlur={(e) => {
                                        setSelectedEngineSize(e.target.value);
                                        form.setValue("engineSize", parseInt(e.target.value, 10));
                                        console.log(e.target.value);
                                    }}
                                />
                                <span className="opacity-50 absolute inset-y-0 right-3 flex items-center">cm3</span>
                            </div>
                            <Check className={cn("ml-3 h-6 w-6 text-green-500", Number(selectedEngineSize) > 0 ? "block" : "hidden")} />
                        </div>
                    </div>
                </div>

                {/* Transmission */}
                <div>
                    <Label className='mt-8 block text-sm font-semibold mb-1'>Cutia de viteze</Label>
                    <div className='p-1 flex border w-2/3 justify-between rounded-md items-center h-12'>
                        <Button
                            variant={"ghost"}
                            onClick={() => {
                                setSelectedTransmission("Manual");
                            }}
                            className='w-1/2'
                        >
                            Manuala
                        </Button>
                        <Separator orientation="vertical" className='mx-1' />
                        <Button
                            variant={"ghost"}
                            onClick={() => {
                                setSelectedTransmission("Automatic");
                            }}
                            className='w-1/2'
                        >
                            Automata
                        </Button>
                    </div>
                </div>

                {/* Images */}
                <div className="mt-8">
                    <Label className="block text-sm font-semibold text-gray-600 mb-2">Fotografii</Label>
                    <div className="flex flex-wrap gap-4">
                        {selectedPhotos.map((photo, index) => (
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
                                    const newPhotos = [...selectedPhotos];
                                    const [movedItem] = newPhotos.splice(fromIndex, 1);
                                    newPhotos.splice(toIndex, 0, movedItem);
                                    setSelectedPhotos(newPhotos);
                                    form.setValue("photos", newPhotos);
                                }}
                            >
                                <img src={"https://pub-5e0f9c3c28524b78a12ca8f84bfb76d5.r2.dev/user-id-here/" + photo + ".webp"} alt={`Photo ${index + 1}`} className="w-full h-full object-cover" />
                                {index === 0 && (
                                    <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded-md text-sm">
                                        Poza principala
                                    </div>
                                )}
                                <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded-md text-xs">
                                    {index + 1}/{selectedPhotos.length}
                                </div>
                                <button
                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                                    onClick={() => {
                                        const newPhotos = selectedPhotos.filter((_, i) => i !== index);
                                        setSelectedPhotos(newPhotos);
                                        form.setValue("photos", newPhotos);
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
                                        setSelectedPhotos([...selectedPhotos, ...newPhotoIds]);
                                        form.setValue("photos", [...selectedPhotos, ...newPhotoIds]);
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
                </div>

                {/* Submit Button */}
                <Button className="mt-8 bg-blue-600 justify-end" onClick={form.handleSubmit(onSubmit)}>
                    Creeaza anuntul
                </Button>
            </div>
        </div>
    );
}
