export function CardSkeleton() {
    return (
        <div className="animate-pulse">
            <div className="h-48 bg-gray-200 rounded-lg mb-4" />
            <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
                <div className="h-4 bg-gray-200 rounded w-1/4" />
            </div>
        </div>
    );
}