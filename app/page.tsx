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

import { Configure, Hits, InfiniteHits, InstantSearch, SearchBox } from 'react-instantsearch';
import { typesenseInstantsearchAdapter } from '@/lib/typesense';
import { _Book } from '@/types/schema';
import Card from '@/components/card';
import { supabase } from '@/lib/supabaseClient';

// Sample data with ad counts
const carBrands = [
  { value: "bmw", label: "BMW", ads: 500 },
  { value: "bercedes", label: "Mercedes", ads: 300 },
  { value: "audi", label: "Audi", ads: 200 },
  { value: "toyota", label: "Toyota", ads: 100 },
];

const carModels: { [key: string]: { name: string, ads: number }[] } = {
  bmw: [
    { name: "3 Series", ads: 200 },
    { name: "5 Series", ads: 150 },
    { name: "X5", ads: 100 },
    { name: "i3", ads: 50 },
  ],
  mercedes: [
    { name: "C-Class", ads: 100 },
    { name: "E-Class", ads: 80 },
    { name: "S-Class", ads: 70 },
    { name: "GLE", ads: 50 },
  ],
  audi: [
    { name: "A4", ads: 80 },
    { name: "A6", ads: 70 },
    { name: "Q5", ads: 30 },
    { name: "e-tron", ads: 20 },
  ],
  toyota: [
    { name: "Corolla", ads: 50 },
    { name: "Camry", ads: 30 },
    { name: "RAV4", ads: 15 },
    { name: "Prius", ads: 5 },
  ],
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

type Ad = {
  id: string;
  brand: string;
  model: string;
  price: number;
  location: string;
  date: string;
  photos: string[];
}

const DropdownSelect = ({ options, placeholder, value, onChange, className, disabled }: {
  options: { value: string; label: string; ads?: number }[];
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

export default function Home() {
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [color, setColor] = useState("");
  const [fuelType, setFuelType] = useState("");
  const [transmission, setTransmission] = useState("");
  const [totalAds, setTotalAds] = useState(0);
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
    console.log(cards);
    fetchAds();
  }, []);


  useEffect(() => {
    // Calculate the total ads from all brands when the component mounts
    const initialTotalAds = carBrands.reduce((sum, brand) => sum + brand.ads, 0);

    // Update the totalAds count based on the selected brand and model
    const selectedBrand = carBrands.find((b) => b.value === brand);
    const selectedModel = carModels[brand]?.find((m) => m.name === model);

    let adsCount = initialTotalAds;
    if (selectedBrand) {
      adsCount = selectedBrand.ads;
      if (selectedModel) {
        adsCount = selectedModel.ads;
      }
    }

    setTotalAds(adsCount);
  }, [brand, model]);

  return (
    <div>
      <Navbar />
      <main className="lg:max-w-6xl mx-auto">
        {/* <InstantSearch
          indexName='books'
          searchClient={typesenseInstantsearchAdapter.searchClient}
          future={{ preserveSharedStateOnUnmount: true }}
        >
          <div className='flex'>
            <main className='py-8'>
              <SearchBox />
              <Hits hitComponent={Hit} />
            </main>
          </div>
        </InstantSearch> */}
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
                options={brand ? carModels[brand].map((model) => ({ value: model.name, label: model.name, ads: model.ads })) : []}
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
            <Button type="submit" className="w-1/2 bg-[#C82814] font-semibold py-6 text-base">
              Caută {totalAds} anunțuri
            </Button>
          </div>
        </form>
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {cards.map((card) => (
            <Card key={card.id} id={card.id} photo={card.photos[0]} brand={card.brand} model={card.model} price={card.price} location={card.location} date={card.date} />
          ))}
        </div>
      </main>
    </div>
  );
}
