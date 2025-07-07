import { createClient } from '@supabase/supabase-js'

// Project URL and key from environment variables or hardcoded for demo
const SUPABASE_URL = 'https://clbshhnjniekomqcteum.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNsYnNoaG5qbmlla29tcWN0ZXVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1MDkyNjgsImV4cCI6MjA2NzA4NTI2OH0.i84Yfym-6m1S_M1i8VqPiQkzUsQhieoICLoojc2nxDE'

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase credentials');
}

const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
});

export default supabaseClient;