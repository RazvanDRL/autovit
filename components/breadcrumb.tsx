"use client";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface BreadcrumbProps {
    brand: string;
    model?: string;
}

export default function Breadcrumb({ brand, model }: BreadcrumbProps) {
    return (
        <nav className="flex" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
                <li className="inline-flex items-center">
                    <Link href="/" className="inline-flex items-center text-sm hover:font-bold text-black/50 hover:text-black/90">
                        Acasa
                    </Link>
                </li>
                <li>
                    <div className="flex items-center">
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                        <Link href={`/${brand}`} className="ml-1 text-sm hover:font-bold text-black/50 hover:text-black/90 md:ml-2">
                            {brand}
                        </Link>
                    </div>
                </li>
                {model && (
                    <li aria-current="page">
                        <div className="flex items-center">
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                            <Link href={`/${brand}/${encodeURIComponent(model)}`} className="ml-1 text-sm hover:font-bold text-black/50 hover:text-black/90 md:ml-2">
                                {model}
                            </Link>
                        </div>
                    </li>
                )}
            </ol>
        </nav>
    );
}
