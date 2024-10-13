import { Facebook, Twitter, Instagram, Youtube, Mail } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import logo from "@/public/logo.svg"

export default function Footer() {
    return (
        <footer className="bg-background text-foreground mt-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
                    <div className="col-span-1 md:col-span-2">
                        <Link href="/">
                            <Image src={logo} alt="AutoAZ" width={100} height={100} className="mb-4" />
                        </Link>
                        <p className="mb-4 text-muted-foreground">Găsește mașina visurilor tale sau vinde-ți vehiculul cu ușurință. Alătură-te celei mai mari piețe online de mașini astăzi!</p>
                        <div className="flex space-x-4">
                            <Link href="#" className="text-muted-foreground hover:text-primary">
                                <Facebook className="h-6 w-6" />
                                <span className="sr-only">Facebook</span>
                            </Link>
                            <Link href="#" className="text-muted-foreground hover:text-primary">
                                <Twitter className="h-6 w-6" />
                                <span className="sr-only">Twitter</span>
                            </Link>
                            <Link href="#" className="text-muted-foreground hover:text-primary">
                                <Instagram className="h-6 w-6" />
                                <span className="sr-only">Instagram</span>
                            </Link>
                            <Link href="#" className="text-muted-foreground hover:text-primary">
                                <Youtube className="h-6 w-6" />
                                <span className="sr-only">YouTube</span>
                            </Link>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Linkuri Rapide</h3>
                        <ul className="space-y-2">
                            <li><Link href="#" className="text-muted-foreground hover:text-primary">Acasă</Link></li>
                            <li><Link href="#" className="text-muted-foreground hover:text-primary">Caută Mașini</Link></li>
                            <li><Link href="#" className="text-muted-foreground hover:text-primary">Vinde-ți Mașina</Link></li>
                            <li><Link href="#" className="text-muted-foreground hover:text-primary">Despre Noi</Link></li>
                            <li><Link href="#" className="text-muted-foreground hover:text-primary">Contact</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Categorii de Mașini</h3>
                        <ul className="space-y-2">
                            <li><Link href="#" className="text-muted-foreground hover:text-primary">Sedan-uri</Link></li>
                            <li><Link href="#" className="text-muted-foreground hover:text-primary">SUV-uri</Link></li>
                            <li><Link href="#" className="text-muted-foreground hover:text-primary">Camioane</Link></li>
                            <li><Link href="#" className="text-muted-foreground hover:text-primary">Mașini de Lux</Link></li>
                            <li><Link href="#" className="text-muted-foreground hover:text-primary">Vehicule Electrice</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Newsletter</h3>
                        <p className="mb-4 text-muted-foreground">Rămâi la curent cu cele mai recente oferte și știri auto.</p>
                        <form className="space-y-2">
                            <Input
                                type="email"
                                placeholder="Introdu adresa ta de email"
                                className="bg-input text-foreground placeholder-muted-foreground"
                            />
                            <Button type="submit" className="w-full">
                                Abonează-te
                            </Button>
                        </form>
                    </div>
                </div>
                <div className="mt-8 pt-8 border-t border-border text-sm text-center">
                    <p className="text-muted-foreground">&copy; {new Date().getFullYear()} AutoAZ. Toate drepturile rezervate.</p>
                    <p className="mt-2">
                        <Link href="#" className="text-muted-foreground hover:text-primary">Politica de Confidențialitate</Link> |
                        <Link href="#" className="text-muted-foreground hover:text-primary ml-2">Termeni și Condiții</Link>
                    </p>
                </div>
            </div>
        </footer>
    )
}
