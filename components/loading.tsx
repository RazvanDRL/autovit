import { LoaderCircle } from "lucide-react";

export default function Loading() {
    return (
        <div className="flex justify-center items-center min-h-screen">
            <LoaderCircle className="w-12 h-12 animate-spin" />
        </div>
    );
}