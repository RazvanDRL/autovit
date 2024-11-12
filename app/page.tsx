"use client";
import Navbar from '@/components/navbar';
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import DropdownSelect from '@/components/dropdownSelect';
import Card from '@/components/card';
import { supabase } from '@/lib/supabaseClient';
import { carBrands } from '@/lib/carBrands';
import { carModels } from '@/lib/carModels';
import { years } from '@/lib/years';
import { colors } from '@/lib/colors';
import { useRouter } from 'next/navigation';
import Loading from '@/components/loading';
import { toast, Toaster } from 'sonner';
import { User as UserType } from '@supabase/supabase-js';

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
  const [favorites, setFavorites] = useState<string[]>([]);
  const [user, setUser] = useState<UserType | null>(null);

  useEffect(() => {
    const fetchAds = async () => {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        if (user) {
          const { data: favoritesData } = await supabase
            .from('favorites')
            .select('ad_id')
            .eq('user_id', user.id);
          if (favoritesData) {
            setFavorites(favoritesData.map(fav => fav.ad_id));
          }
        }
        const { data, error } = await supabase
          .from('listings')
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

  const handleFavorite = async (e: React.MouseEvent, adId: string) => {
    e.preventDefault();
    if (!user) {
      toast.error("Trebuie să fii autentificat pentru a salva anunțuri!");
      return;
    }

    try {
      const { data: existingFavorite } = await supabase
        .from('favorites')
        .select('*')
        .eq('ad_id', adId)
        .eq('user_id', user.id)
        .single();

      if (existingFavorite) {
        // Remove from favorites
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('ad_id', adId)
          .eq('user_id', user.id);
        if (error) {
          console.error(error);
          toast.error("A apărut o eroare!");
          return;
        }
        // Update local state by removing the ad from favorites
        setFavorites(favorites.filter(id => id !== adId));
        toast.success("Anunț eliminat de la favorite");
      } else {
        // Add to favorites
        const { error } = await supabase
          .from('favorites')
          .insert([
            { ad_id: adId, user_id: user.id }
          ]);
        if (error) {
          console.error(error);
          toast.error("A apărut o eroare!");
          return;
        }
        // Update local state by adding the ad to favorites
        setFavorites([...favorites, adId]);
        toast.success("Anunț salvat la favorite");
      }
    } catch (error) {
      toast.error("A apărut o eroare!");
      console.error(error);
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div>
      <Navbar />
      <Toaster />
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
              isFavorite={favorites.includes(card.id)}
              onFavoriteClick={handleFavorite}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
