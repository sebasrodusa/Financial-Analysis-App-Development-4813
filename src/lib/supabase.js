import { createClient } from '@supabase/supabase-js'

// Default fallback values for development
const DEFAULT_SUPABASE_URL = 'https://clbshhnjniekomqcteum.supabase.co'
const DEFAULT_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNsYnNoaG5qbmlla29tcWN0ZXVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1MDkyNjgsImV4cCI6MjA2NzA4NTI2OH0.i84Yfym-6m1S_M1i8VqPiQkzUsQhieoICLoojc2nxDE'

// Use environment variables if available, otherwise use defaults
const SUPABASE_URL = import.meta.env?.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env?.VITE_SUPABASE_ANON_KEY || DEFAULT_ANON_KEY

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