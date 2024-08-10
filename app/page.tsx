"use client";
import Navbar from '@/components/navbar';
import React, { useState, useRef, useEffect } from 'react';
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ButtonDropdown } from '@/components/ui/buttonDropdown';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const carBrands = [
  { value: "bmw", label: "BMW" },
  { value: "mercedes", label: "Mercedes" },
  { value: "audi", label: "Audi" },
  { value: "toyota", label: "Toyota" },
];

const carModels: { [key: string]: string[] } = {
  bmw: ["3 Series", "5 Series", "X5", "i3"],
  mercedes: ["C-Class", "E-Class", "S-Class", "GLE"],
  audi: ["A4", "A6", "Q5", "e-tron"],
  toyota: ["Corolla", "Camry", "RAV4", "Prius"],
};

const years = Array.from({ length: 50 }, (_, i) => ({ value: (new Date().getFullYear() - i).toString(), label: (new Date().getFullYear() - i).toString() }));
const colors = [
  { value: "Black", label: "Black" },
  { value: "White", label: "White" },
  { value: "Silver", label: "Silver" },
  { value: "Red", label: "Red" },
  { value: "Blue", label: "Blue" },
  { value: "Green", label: "Green" },
];
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

const DropdownSelect = ({ options, placeholder, value, onChange, className }: {
  options: { value: string; label: string }[];
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  className: string;
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
        >
          {value || placeholder}
          <ChevronDown className="ml-2 h-8 w-8 shrink-0" />
        </ButtonDropdown>
      </PopoverTrigger>
      <PopoverContent className="p-0" style={{ width: popoverWidth }}>
        <Command>
          <CommandInput placeholder={`Search ${placeholder.toLowerCase()}...`} />
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
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default function Home() {
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [color, setColor] = useState("");
  const [fuelType, setFuelType] = useState("");
  const [transmission, setTransmission] = useState("");

  return (
    <div>
      <Navbar />
      <main className="lg:max-w-6xl mx-auto">
        <form className="w-full p-8 drop-shadow-xl bg-white rounded-sm">
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
                options={brand ? carModels[brand].map(model => ({ value: model, label: model })) : []}
                placeholder="Model"
                value={model}
                onChange={setModel}
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
              <Button type="submit" className="w-1/2 bg-[#C82814] font-semibold py-6 text-base">
                Caută 33 213 anunțuri
              </Button>
          </div>

        </form>
      </main>
    </div>
  );
}
