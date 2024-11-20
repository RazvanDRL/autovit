import React from 'react';
import { Button } from "@/components/ui/button";
import DropdownSelect from '@/components/dropdownSelect';
import { carBrands } from '@/lib/carBrands';
import { years } from '@/lib/years';
import { body_types, BodyType, fuel_types, FuelType } from '@/types/schema';
import { ChevronDown } from 'lucide-react';

const prices = [
    { value: "1000", label: "1000 EUR" },
    { value: "2000", label: "2000 EUR" },
    { value: "3000", label: "3000 EUR" },
    { value: "4000", label: "4000 EUR" },
    { value: "5000", label: "5000 EUR" },
    { value: "6000", label: "6000 EUR" },
    { value: "7000", label: "7000 EUR" },
    { value: "8000", label: "8000 EUR" },
    { value: "9000", label: "9000 EUR" },
    { value: "10000", label: "10000 EUR" },
    { value: "15000", label: "15000 EUR" },
    { value: "20000", label: "20000 EUR" },
    { value: "25000", label: "25000 EUR" },
    { value: "30000", label: "30000 EUR" },
    { value: "40000", label: "40000 EUR" },
    { value: "50000", label: "50000 EUR" },
    { value: "60000", label: "60000 EUR" },
    { value: "70000", label: "70000 EUR" },
    { value: "80000", label: "80000 EUR" },
    { value: "90000", label: "90000 EUR" },
    { value: "100000", label: "100000 EUR" },
];

const bodyTypes = body_types.map(type => ({ value: type, label: type }));
const fuelTypes = fuel_types.map(type => ({ value: type, label: type }));

interface CarSearchProps {
    brand: string;
    setBrand: (value: string) => void;
    model: string;
    setModel: (value: string) => void;
    price: string;
    setPrice: (value: string) => void;
    year: string;
    setYear: (value: string) => void;
    fuelType: FuelType;
    setFuelType: (value: FuelType) => void;
    bodyType: BodyType;
    setBodyType: (value: BodyType) => void;
    availableModels: { value: string, label: string, id: number, group?: boolean }[];
    onSubmit: (e: React.FormEvent) => void;
}

export default function CarSearch({
    brand,
    setBrand,
    model,
    setModel,
    price,
    setPrice,
    year,
    setYear,
    fuelType,
    setFuelType,
    bodyType,
    setBodyType,
    availableModels,
    onSubmit
}: CarSearchProps) {
    return (
        <form onSubmit={onSubmit} className="w-full p-8 drop-shadow-xl bg-white rounded-sm border border-gray-100">
            <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                <div className="col-span-2">
                    <DropdownSelect
                        options={carBrands}
                        placeholder="Marca"
                        value={brand}
                        onChange={setBrand}
                        className="p-6"
                    />
                </div>
                <div className="col-span-2 mt-2">
                    <div className="flex flex-col w-full">
                        <div className="relative">
                            <select
                                id="model-select"
                                value={model}
                                onChange={(e) => setModel(e.target.value)}
                                disabled={!brand || brand === "" || availableModels.length === 0}
                                className={`w-full appearance-none text-md justify-between rounded-sm font-[400] p-3 pr-12 ${!brand || brand === "" || availableModels.length === 0
                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                    : "bg-[#EBECEF] border-[#EBECEF]"
                                    }`}
                            >
                                <option value="">Selectează modelul</option>
                                {availableModels.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.group ? option.label : `\u00A0\u00A0\u00A0\u00A0${option.label}`}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 shrink-0 pointer-events-none ${!brand || brand === "" || availableModels.length === 0
                                ? "text-gray-400"
                                : ""
                                }`} />
                        </div>
                    </div>
                </div>
                <div className="col-span-1">
                    <DropdownSelect
                        options={prices}
                        placeholder="Pret pana la"
                        value={price}
                        onChange={setPrice}
                        className="p-6"
                    />
                </div>
                <div className="col-span-1">
                    <DropdownSelect
                        options={years}
                        placeholder="Anul de la"
                        value={year}
                        onChange={setYear}
                        className="p-6"
                    />
                </div>
                <div className="col-span-1">
                    <DropdownSelect
                        options={bodyTypes}
                        placeholder="Tip caroserie"
                        value={bodyType}
                        onChange={(value: string) => setBodyType(value as BodyType)}
                        className="p-6"
                    />
                </div>
                <div className="col-span-1">
                    <DropdownSelect
                        options={fuelTypes}
                        placeholder="Combustibil"
                        value={fuelType}
                        onChange={(value: string) => setFuelType(value as FuelType)}
                        className="p-6"
                    />
                </div>
            </div>
            <div className="flex justify-end mt-8 w-full">
                <Button
                    type="submit"
                    className="w-1/2 bg-[#C82814] font-semibold py-6 text-base"
                >
                    Caută anunțuri
                </Button>
            </div>
        </form>
    );
} 