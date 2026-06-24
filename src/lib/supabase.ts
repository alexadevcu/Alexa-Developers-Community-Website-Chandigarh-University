import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key-here';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // sessionStorage clears when the tab/browser is closed
    // localStorage (default) persists indefinitely — not suitable for admin
    storage: sessionStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
});
