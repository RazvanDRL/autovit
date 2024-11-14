import { useState, useEffect, useRef } from "react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { ButtonDropdown } from '@/components/ui/buttonDropdown';

type Option = {
    value: string;
    label: string;
}

interface DropdownSelectProps {
    options: Option[];
    label?: string;
    placeholder: string;
    value: string;
    onChange: (value: string) => void;
    className?: string;
    disabled?: boolean;
}

export default function DropdownSelect({ options, label, placeholder, value, onChange, className, disabled }: DropdownSelectProps) {
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
                <div className="flex flex-col gap-2 w-full">
                    <label htmlFor={`dropdown-${label}`} className="text-sm font-[400]">{label}</label>
                    <ButtonDropdown
                        type="button"
                        id={`dropdown-${label}`}
                        ref={buttonRef}
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        aria-label={label || placeholder}
                        className={cn("w-full text-md justify-between bg-[#EBECEF] border-[#EBECEF] rounded-sm font-[400]", className)}
                        disabled={disabled}
                    >
                        {value || placeholder}
                        <ChevronDown className="ml-2 h-8 w-8 shrink-0" />
                    </ButtonDropdown>
                </div>
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
                                    value={option.label}
                                    onSelect={(currentValue) => {
                                        onChange(currentValue === value ? "" : currentValue);
                                        setOpen(false);
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === option.label ? "opacity-100" : "opacity-0"
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