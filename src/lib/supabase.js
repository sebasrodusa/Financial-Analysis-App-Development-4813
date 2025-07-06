import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://epzpmhlwwwivxtqxulys.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwenBtaGx3d3dpdnh0cXh1bHlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3MzAyNDEsImV4cCI6MjA2NzMwNjI0MX0.XMtl9-jsFVexWwkuHSNfyQIuIwmtI-TsxS50Gcrgz64'

// Simple fallback client for when Supabase is not needed
const createFallbackClient = () => ({
  auth: {
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    signInWithPassword: () => Promise.resolve({ data: null, error: { message: 'Using simplified auth' } }),
    signOut: () => Promise.resolve({ error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
  },
  from: () => ({
    select: () => ({ data: [], error: null }),
    insert: () => ({ data: null, error: { message: 'Using simplified storage' } }),
    update: () => ({ data: null, error: { message: 'Using simplified storage' } }),
    delete: () => ({ data: null, error: { message: 'Using simplified storage' } }),
    single: function() { return this; },
    eq: function() { return this; },
    order: function() { return this; },
    limit: function() { return this; }
  })
});

let supabaseClient;

try {
  if (SUPABASE_URL === 'https://<PROJECT-ID>.supabase.co' || SUPABASE_ANON_KEY === '<ANON_KEY>') {
    console.warn('Using fallback client - Supabase not configured');
    supabaseClient = createFallbackClient();
  } else {
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      }
    });
  }
} catch (error) {
  console.warn('Error creating Supabase client, using fallback:', error);
  supabaseClient = createFallbackClient();
}

export default supabaseClient;