import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAdminKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseAdminKey) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_KEY is not set');
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseAdminKey);
