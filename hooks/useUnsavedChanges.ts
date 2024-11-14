import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export function useUnsavedChanges(isDirty: boolean) {
    const router = useRouter();
    const [showExitDialog, setShowExitDialog] = useState(false);
    const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);

    useEffect(() => {
        const onBeforeUnload = (e: BeforeUnloadEvent) => {
            if (isDirty) {
                e.preventDefault();
                e.returnValue = '';
            }
        };

        window.addEventListener('beforeunload', onBeforeUnload);
        return () => window.removeEventListener('beforeunload', onBeforeUnload);
    }, [isDirty]);

    const handleNavigation = useCallback((path: string) => {
        if (isDirty) {
            setPendingNavigation(path);
            setShowExitDialog(true);
        } else {
            router.push(path);
        }
    }, [isDirty, router]);

    return {
        showExitDialog,
        setShowExitDialog,
        pendingNavigation,
        setPendingNavigation,
        handleNavigation
    };
} 