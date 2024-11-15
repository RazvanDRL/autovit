import React from 'react';
import { Button } from "@/components/ui/button";
import DropdownSelect from '@/components/dropdownSelect';
import { carBrands } from '@/lib/carBrands';
import { years } from '@/lib/years';
import { colors } from '@/lib/colors';

const fuelTypes = [
    { value: "Petrol", label: "Petrol" },
    { value: "Diesel", label: "Diesel" },
    { value: "Electric", label: "Electric" },
    { value: "Hybrid", label: "Hybrid" },
];

const transmissions = [
    { value: "Automatic", label: "Automatic" },
    { value: "Manual", label: "Manual" },
    { value: "Semi-automatic", label: "Semi-automatic" },
];

interface CarSearchProps {
    brand: string;
    setBrand: (value: string) => void;
    model: string;
    setModel: (value: string) => void;
    year: string;
    setYear: (value: string) => void;
    color: string;
    setColor: (value: string) => void;
    fuelType: string;
    setFuelType: (value: string) => void;
    transmission: string;
    setTransmission: (value: string) => void;
    availableModels: { value: string, label: string }[];
    onSubmit: (e: React.FormEvent) => void;
}

export default function CarSearch({
    brand,
    setBrand,
    model,
    setModel,
    year,
    setYear,
    color,
    setColor,
    fuelType,
    setFuelType,
    transmission,
    setTransmission,
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
                <div className="col-span-2">
                    <DropdownSelect
                        options={availableModels}
                        placeholder="Model"
                        value={model}
                        onChange={setModel}
                        disabled={!brand}
                        className="p-6"
                    />
                </div>
                <div className="col-span-1">
                    <DropdownSelect
                        options={years}
                        placeholder="Pret pana la"
                        value={year}
                        onChange={setYear}
                        className="p-6"
                    />
                </div>
                <div className="col-span-1">
                    <DropdownSelect
                        options={colors}
                        placeholder="Anul de la"
                        value={color}
                        onChange={setColor}
                        className="p-6"
                    />
                </div>
                <div className="col-span-1">
                    <DropdownSelect
                        options={fuelTypes}
                        placeholder="Tip caroserie"
                        value={fuelType}
                        onChange={setFuelType}
                        className="p-6"
                    />
                </div>
                <div className="col-span-1">
                    <DropdownSelect
                        options={transmissions}
                        placeholder="Combustibil"
                        value={transmission}
                        onChange={setTransmission}
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