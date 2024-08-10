import Card from "@/components/card"


export default function Page({ params }: { params: { brand: string } }) {
    return (
        <div>
            My Post: {params.brand}
            <div className="container mx-auto grid grid-rows-10 gap-3">
                <Card
                    className="row-span-1"
                    title="Porsche Cayenne"
                    price={5600}
                    engineSize={3189}
                    power={250}
                    km={251000}
                    fuelType="Petrol"
                    year={2007}
                    location="Iasi (Iasi)"
                    description="Porsche cayenne stare impecabila"
                    date="Reactualizat acum 2 zile"
                />
            </div>
        </div>
    )
}