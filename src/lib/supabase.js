import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://epzpmhlwwwivxtqxulys.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwenBtaGx3d3dpdnh0cXh1bHlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3MzAyNDEsImV4cCI6MjA2NzMwNjI0MX0.XMtl9-jsFVexWwkuHSNfyQIuIwmtI-TsxS50Gcrgz64'

if (SUPABASE_URL === 'https://<PROJECT-ID>.supabase.co' || SUPABASE_ANON_KEY === '<ANON_KEY>') {
  throw new Error('Missing Supabase variables');
}

export default createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
})