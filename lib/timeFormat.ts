import { formatDistanceToNow, parseISO } from 'date-fns';
import { ro } from 'date-fns/locale';

export function formatTimeAgo(dateString: string): string {
    const date = parseISO(dateString);
    return formatDistanceToNow(date, { addSuffix: true, locale: ro });
}
