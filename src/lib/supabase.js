import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://clbshhnjniekomqcteum.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNsYnNoaG5qbmlla29tcWN0ZXVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1MDkyNjgsImV4cCI6MjA2NzA4NTI2OH0.i84Yfym-6m1S_M1i8VqPiQkzUsQhieoICLoojc2nxDE'

if (SUPABASE_URL === 'https://<PROJECT-ID>.supabase.co' || SUPABASE_ANON_KEY === '<ANON_KEY>') {
  throw new Error('Missing Supabase variables');
}

const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
});

// Test connection and create tables if needed
const initializeDatabase = async () => {
  try {
    console.log('Initializing Supabase database...');
    
    // Test connection
    const { data, error } = await supabaseClient
      .from('users_pt2024')
      .select('count', { count: 'exact', head: true });
    
    if (error && error.code === '42P01') {
      console.log('Tables do not exist, they need to be created in Supabase dashboard');
      console.log('Please create the required tables in your Supabase dashboard');
    } else if (error) {
      console.error('Database connection error:', error);
    } else {
      console.log('Database connection successful');
    }
  } catch (error) {
    console.error('Database initialization error:', error);
  }
};

// Initialize on import
initializeDatabase();

export default supabaseClient;