import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { carBrands } from "@/lib/carBrands";

export interface FiltersProps {
    filters: {
        brand?: string;
        model?: string;
        trim?: string;
        price__gte?: number;
        price__lte?: number;
        year__gte?: number;
        year__lte?: number;
        km__gte?: number;
        km__lte?: number;
        fuelType?: string;
    };
    onChange: (filters: FiltersProps['filters']) => void;
}

export default function Filters({ filters, onChange }: FiltersProps) {
    return (
        <div className="my-8 flex flex-col gap-4 p-4 bg-white rounded-sm border border-gray-200">
            <FilterSelect
                label="Brand"
                value={filters.brand}
                options={carBrands}
                onChange={(value) => onChange({ ...filters, brand: value })}
            />
        </div>
    );
}

function FilterSelect({
    label,
    options,
    value,
    onChange
}: {
    label: string,
    options: { value: string, label: string }[],
    value?: string,
    onChange: (value: string) => void
}) {
    return (
        <Select onValueChange={onChange} value={value}>
            <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={label} />
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                    <SelectLabel>{label}</SelectLabel>
                    {options.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                            {option.label}
                        </SelectItem>
                    ))}
                </SelectGroup>
            </SelectContent>
        </Select>
    );
}
