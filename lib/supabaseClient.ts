import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true
  },
  global: {
    fetch: (...args) => {
      const [url, config] = args;
      if (!config) return fetch(url);
      
      const csrfToken = sessionStorage.getItem('csrfToken');
      if (csrfToken) {
        config.headers = {
          ...config.headers,
          'X-CSRF-Token': csrfToken
        };
      }
      
      return fetch(url, config);
    }
  }
});
