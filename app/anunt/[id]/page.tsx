"use client";
import Card from "@/components/card"
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


export default function Page({ params }: { params: { id: string } }) {
    const [ad, setAd] = useState<Array<Ad>>([])

    console.log(params)

    async function fetchAds() {
        let { data: ads, error } = await supabase
            .from('anunt')
            .select('*')
            .ilike('id', params.id)
        if (error) console.log('error', error)
        setAd(ads!);
    }

    fetchAds()

    return (
        <div>
            <div className="container mx-auto grid grid-rows-10 gap-3">
                {params.id}
            </div>
        </div>
    )
}