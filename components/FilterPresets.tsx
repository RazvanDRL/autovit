type FilterPreset = {
    id: string;
    name: string;
    filters: Record<string, string>;
};

type FilterPresetsProps = {
    onApplyPreset: (filters: Record<string, string>) => void;
};

export function FilterPresets({ onApplyPreset }: FilterPresetsProps) {
    const presets: FilterPreset[] = [
        {
            id: 'new-cars',
            name: 'Mașini noi',
            filters: {
                year: new Date().getFullYear().toString(),
                km: '10000',
            }
        },
        {
            id: 'good-deals',
            name: 'Oferte bune',
            filters: {
                priceRange: '10000-20000',
                km: '100000',
            }
        },
    ];

    return (
        <div className="flex gap-2 mb-4">
            {presets.map(preset => (
                <button
                    key={preset.id}
                    onClick={() => onApplyPreset(preset.filters)}
                    className="px-4 py-2 text-sm bg-gray-100 rounded-full hover:bg-gray-200"
                >
                    {preset.name}
                </button>
            ))}
        </div>
    );
}
