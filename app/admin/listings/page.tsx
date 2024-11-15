"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import Loading from '@/components/loading';
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import Sidebar from "@/components/admin-sidebar";
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import Image from 'next/image';

const ADMIN_USER_ID = "6a6a37a7-46d5-4ab3-9b7e-1d7fe2a388ab";

interface Listing {
    id: string;
    created_at: string;
    brand: string;
    model: string;
    price: number;
    engine_size: number;
    power: number;
    km: number;
    fuel_type: string;
    year: number;
    location_city: string;
    location_county: string;
    vin: string;
    transmission: string;
    user_id: string;
    user_full_name: string;
    is_company: boolean;
    user_phone: string;
    photos: string[];
}

type SortField = 'created_at' | 'price' | 'brand';
type SortOrder = 'asc' | 'desc';

// Add this helper component for sort headers
const SortableHeader = ({
    field,
    label,
    currentSort,
    currentOrder,
    onSort
}: {
    field: SortField;
    label: string;
    currentSort: SortField;
    currentOrder: SortOrder;
    onSort: (field: SortField) => void;
}) => (
    <button
        onClick={() => onSort(field)}
        className="flex items-center space-x-1 hover:text-gray-700"
    >
        <span>{label}</span>
        <span className="text-gray-400">
            {field === currentSort
                ? (currentOrder === 'asc' ? '↑' : '↓')
                : '↕'}
        </span>
    </button>
);

export default function ListingsPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [listings, setListings] = useState<Listing[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const itemsPerPage = 10;
    const [sortField, setSortField] = useState<SortField>('created_at');
    const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user || user.id !== ADMIN_USER_ID) {
                router.replace('/');
                return;
            }

            setUser(user);
            const urlParams = new URLSearchParams(window.location.search);
            const page = parseInt(urlParams.get('page') || '1');
            const sort = urlParams.get('sort') as SortField || 'created_at';
            const order = urlParams.get('order') as SortOrder || 'desc';

            setCurrentPage(page);
            setSortField(sort);
            setSortOrder(order);
            fetchListings(page, sort, order);
            setLoading(false);
        };

        checkUser();
    }, [router]);

    const fetchListings = async (
        page: number,
        sort: SortField = sortField,
        order: SortOrder = sortOrder
    ) => {
        const from = (page - 1) * itemsPerPage;
        const to = from + itemsPerPage - 1;

        const { count } = await supabase
            .from('listings')
            .select('*', { count: 'exact', head: true });

        const { data, error } = await supabase
            .from('listings')
            .select('*')
            .order(sort, { ascending: order === 'asc' })
            .range(from, to);

        if (error) {
            console.error('Error fetching listings:', error);
            return;
        }

        setTotalCount(count || 0);
        setListings(data || []);
    };

    const handleSort = (field: SortField) => {
        const newOrder = field === sortField && sortOrder === 'desc' ? 'asc' : 'desc';
        setSortField(field);
        setSortOrder(newOrder);

        const newParams = new URLSearchParams(window.location.search);
        newParams.set('sort', field);
        newParams.set('order', newOrder);
        router.push(`/admin/listings?${newParams.toString()}`);

        fetchListings(currentPage, field, newOrder);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        const newParams = new URLSearchParams(window.location.search);
        newParams.set('page', page.toString());
        router.push(`/admin/listings?${newParams.toString()}`);
        fetchListings(page);
    };

    const deleteListing = async (listingId: string) => {
        const confirmed = window.confirm("Are you sure you want to delete this listing?");
        if (!confirmed) return;

        const { error } = await supabase
            .from('listings')
            .delete()
            .eq('id', listingId);

        if (error) {
            console.error('Error deleting listing:', error);
            return;
        }

        fetchListings(currentPage);
    };

    if (loading) return <Loading />;

    if (!user || user.id !== ADMIN_USER_ID) {
        return null;
    }

    return (
        <div className="flex min-h-screen">
            <aside className="hidden lg:block w-64 border-r bg-gray-100/40">
                <ScrollArea className="h-full">
                    <Sidebar />
                </ScrollArea>
            </aside>
            <main className="flex-1 p-8">
                <Card className="p-6">
                    <h2 className="text-2xl font-bold mb-6">Listings</h2>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>
                                    <SortableHeader
                                        field="brand"
                                        label="Vehicle"
                                        currentSort={sortField}
                                        currentOrder={sortOrder}
                                        onSort={handleSort}
                                    />
                                </TableHead>
                                <TableHead>
                                    <SortableHeader
                                        field="price"
                                        label="Price"
                                        currentSort={sortField}
                                        currentOrder={sortOrder}
                                        onSort={handleSort}
                                    />
                                </TableHead>
                                <TableHead>Details</TableHead>
                                <TableHead>Location</TableHead>
                                <TableHead>Seller</TableHead>
                                <TableHead>
                                    <SortableHeader
                                        field="created_at"
                                        label="Created"
                                        currentSort={sortField}
                                        currentOrder={sortOrder}
                                        onSort={handleSort}
                                    />
                                </TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {listings.map((listing) => (
                                <TableRow key={listing.id}>
                                    <TableCell>
                                        <div className="space-y-1">
                                            {listing.photos && listing.photos[0] && (
                                                <div className="relative w-40 h-28 mb-2">
                                                    <Image
                                                        src={`https://pub-5e0f9c3c28524b78a12ca8f84bfb76d5.r2.dev/${listing.id}/${listing.photos[0]}-thumbnail.webp`}
                                                        alt={`${listing.brand} ${listing.model}`}
                                                        fill
                                                        className="rounded-sm object-cover"
                                                        loading="eager"
                                                        fetchPriority="high"
                                                        priority
                                                        quality={20}
                                                    />
                                                </div>
                                            )}
                                            <div className="font-medium">{listing.brand} {listing.model}</div>
                                            <div className="text-sm text-gray-500">{listing.year}</div>
                                        </div>
                                    </TableCell>
                                    <TableCell>€{listing.price?.toLocaleString()}</TableCell>
                                    <TableCell>
                                        <div className="space-y-1 text-sm">
                                            <div>{listing.engine_size}cc • {listing.power}hp</div>
                                            <div>{listing.km?.toLocaleString()} km • {listing.fuel_type}</div>
                                            <div>{listing.transmission}</div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="space-y-1 text-sm">
                                            <div>{listing.location_city}</div>
                                            <div className="text-gray-500">{listing.location_county}</div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="space-y-1 text-sm">
                                            <div>{listing.user_full_name}</div>
                                            <div>{listing.user_phone}</div>
                                            {listing.is_company && (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                                    Company
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {new Date(listing.created_at).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>
                                        <div className="space-y-2">
                                            <Link href={`/a/${listing.id}`}>
                                                <Button size="sm" variant="outline" className="w-full">
                                                    View
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => deleteListing(listing.id)}
                                                className="w-full"
                                            >
                                                Delete
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    <div className="mt-4 flex items-center justify-between">
                        <div className="text-sm text-gray-500">
                            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount} results
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                            >
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage * itemsPerPage >= totalCount}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                </Card>
            </main>
        </div>
    );
}
