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

import Card from '@/components/card';
import { supabase } from '@/lib/supabaseClient';
import { carBrands } from '@/lib/carBrands';
import { carModels } from '@/lib/carModels';
import { years } from '@/lib/years';
import { colors } from '@/lib/colors';
import { useRouter } from 'next/navigation';
import Loading from '@/components/loading';

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

type Ad = {
  id: string;
  brand: string;
  model: string;
  price: number;
  location: string;
  date: string;
  photos: string[];
  year: number;
  km: number;
  fuelType: string;
}

const DropdownSelect = ({ options, placeholder, value, onChange, className, disabled }: {
  options: { value: string; label: string }[];
  placeholder: string;
  value: string;
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
          {options.find(option => option.value === value)?.label || placeholder}
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
  const router = useRouter();
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [color, setColor] = useState("");
  const [fuelType, setFuelType] = useState("");
  const [transmission, setTransmission] = useState("");
  const [cards, setCards] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAds = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('anunt')
          .select('*')
          .limit(10);

        if (error) {
          throw error;
        }

        setCards(data);
      } catch (error) {
        console.error('Error fetching ads:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAds();
  }, []);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // route is /search?brand=brand&model=model&year=year&color=color&fuelType=fuelType&transmission=transmission
    const route = `/${brand}/${model}`;
    router.push(route);
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div>
      <Navbar />
      <main className="mt-16 lg:max-w-6xl mx-auto">
        <form onSubmit={handleSearch} className="w-full p-8 drop-shadow-xl bg-white rounded-sm">
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
                options={brand ? carModels[brand as keyof typeof carModels].map(model => ({ value: model, label: model })) : []}
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
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {cards.map((card) => (
            <Card
              key={card.id}
              id={card.id}
              photo={card.photos[0]}
              brand={card.brand}
              model={card.model}
              price={card.price}
              location={card.location}
              date={card.date}
              year={card.year}
              km={card.km}
              fuelType={card.fuelType}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
