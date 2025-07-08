import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env?.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env?.VITE_SUPABASE_ANON_KEY

// Create a function to safely create the Supabase client with error handling
const createSupabaseClient = () => {
  try {
    // Validate URL and key
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY || 
        SUPABASE_URL === 'https://<PROJECT-ID>.supabase.co' || 
        SUPABASE_ANON_KEY === '<ANON_KEY>') {
      console.warn('Missing or invalid Supabase credentials. Using localStorage fallback.');
      return null;
    }
    
    return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      }
    });
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error);
    return null;
  }
};

const supabaseClient = createSupabaseClient();

export default supabaseClient;
