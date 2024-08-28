"use client";
import CardHorizontal from "@/components/cardHorizontal";
import { supabase } from "@/lib/supabaseClient";
import { useState } from "react";

type Ad = {
    id: string,
    brand: string,
    model: string,
    price: number,
    engine_size: number,
    power: number,
    km: number,
    fuelType: string,
    year: number,
    location: string,
    description: string
}


export default function Page({ params }: { params: { brand: string } }) {
    const [ad, setAd] = useState<Array<Ad>>([])

    console.log(params)

    async function fetchAds() {
        let { data: ads, error } = await supabase
            .from('anunt')
            .select('*')
            .ilike('brand', params.brand)
        if (error) console.log('error', error)
        setAd(ads!);
    }

    fetchAds()

    return (
        <div>
            <div className="container mx-auto grid grid-rows-10 gap-3">

                {ad.map((ad) => (
                    <CardHorizontal
                        id={ad.brand}
                        key={ad.id}
                        className="row-span-1"
                        title={ad.brand + " " + ad.model}
                        price={ad.price}
                        engine_size={ad.engine_size}
                        power={ad.power}
                        km={ad.km}
                        fuelType={ad.fuelType}
                        year={ad.year}
                        location={ad.location}
                        description={ad.description}
                        date="Reactualizat acum 2 zile"
                    />
                ))}
            </div>
        </div>
    )
}