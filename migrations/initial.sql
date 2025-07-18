-- ProsperTrack™ Database Setup Script
-- This script creates all the necessary tables and security policies for the ProsperTrack application

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table
CREATE TABLE IF NOT EXISTS users_pt2024 (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  clerk_id TEXT UNIQUE,
  password_hash TEXT NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'financial_professional')),
  is_active BOOLEAN DEFAULT true,
  has_completed_onboarding BOOLEAN DEFAULT false,
  profile_photo TEXT,
  company VARCHAR(255),
  phone VARCHAR(50),
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security on users table
ALTER TABLE users_pt2024 ENABLE ROW LEVEL SECURITY;

-- Table to track admin users without causing RLS recursion
CREATE TABLE IF NOT EXISTS admin_users (
  user_id UUID PRIMARY KEY REFERENCES users_pt2024(id)
);

-- RLS is disabled on this helper table
ALTER TABLE admin_users DISABLE ROW LEVEL SECURITY;

-- Helper function to check if a user is an admin
CREATE OR REPLACE FUNCTION public.is_admin(p_user_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_users au WHERE au.user_id = p_user_id
  );
$$;
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO anon;

-- Create policies for users table
CREATE POLICY "Users can view their own data" 
  ON users_pt2024 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Admin can view all users"
  ON users_pt2024
  FOR SELECT
  USING (is_admin(auth.uid()));

-- Initial admin user (password: admin1234)
INSERT INTO users_pt2024 (
  email,
  clerk_id,
  password_hash,
  first_name,
  last_name,
  role,
  is_active,
  has_completed_onboarding
  ) VALUES (
  'sebasrodus+admin@gmail.com',
  'admin_clerk_id',
  '$2b$10$XdR5Mfl6nA8CXHGXE1Uqz.SjVoam.nWjolSbQpIy5keN5XvbIlGk6', -- hashed 'admin1234'
  'Admin',
  'User',
  'admin',
  true,
  true
  )
  ON CONFLICT DO NOTHING;

-- Register admin user in admin_users table
INSERT INTO admin_users (user_id)
SELECT id FROM users_pt2024 WHERE email = 'sebasrodus+admin@gmail.com'
ON CONFLICT DO NOTHING;

-- Initial advisor user (password: advisor123)
INSERT INTO users_pt2024 (
  email,
  clerk_id,
  password_hash,
  first_name,
  last_name,
  role,
  is_active,
  has_completed_onboarding
) VALUES (
  'advisor@prospertrack.com',
  'advisor_clerk_id',
  '$2b$10$vhj5TgZGHfYmHxpJ0A6FYOS8J.xZLBXKJdS7CZzHt1Zi3.qWShcUO', -- hashed 'advisor123'
  'Financial',
  'Advisor',
  'financial_professional',
  true,
  true
  )
  ON CONFLICT DO NOTHING;

-- Clients Table (if you want to store in database instead of localStorage)
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users_pt2024(id),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(50),
  zip_code VARCHAR(20),
  date_of_birth DATE,
  occupation VARCHAR(100),
  employer VARCHAR(100),
  marital_status VARCHAR(20) CHECK (marital_status IN ('single', 'married', 'divorced', 'widowed')),
  spouse_first_name VARCHAR(100),
  spouse_last_name VARCHAR(100),
  spouse_date_of_birth DATE,
  spouse_occupation VARCHAR(100),
  spouse_employer VARCHAR(100),
  spouse_phone VARCHAR(50),
  spouse_email VARCHAR(255),
  children JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security on clients table
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Create policies for clients table
CREATE POLICY "Users can view their own clients" 
  ON clients 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own clients" 
  ON clients 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own clients" 
  ON clients 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own clients" 
  ON clients 
  FOR DELETE 
  USING (auth.uid() = user_id);

CREATE POLICY "Admin can view all clients"
  ON clients
  FOR SELECT
  USING (is_admin(auth.uid()));

-- Financial Analyses Table (if you want to store in database instead of localStorage)
CREATE TABLE IF NOT EXISTS financial_analyses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id),
  income JSONB,
  expenses JSONB,
  assets JSONB,
  liabilities JSONB,
  financial_goals JSONB,
  life_insurance JSONB,
  net_income NUMERIC,
  net_worth NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security on financial_analyses table
ALTER TABLE financial_analyses ENABLE ROW LEVEL SECURITY;

-- Create policies for financial_analyses table
CREATE POLICY "Users can view analyses for their clients" 
  ON financial_analyses 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM clients 
    WHERE clients.id = financial_analyses.client_id 
    AND clients.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert analyses for their clients" 
  ON financial_analyses 
  FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM clients 
    WHERE clients.id = financial_analyses.client_id 
    AND clients.user_id = auth.uid()
  ));

CREATE POLICY "Users can update analyses for their clients" 
  ON financial_analyses 
  FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM clients 
    WHERE clients.id = financial_analyses.client_id 
    AND clients.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete analyses for their clients" 
  ON financial_analyses 
  FOR DELETE 
  USING (EXISTS (
    SELECT 1 FROM clients 
    WHERE clients.id = financial_analyses.client_id 
    AND clients.user_id = auth.uid()
  ));

CREATE POLICY "Admin can view all analyses"
  ON financial_analyses
  FOR SELECT
  USING (is_admin(auth.uid()));

-- RPC function to fetch minimal user info for login
CREATE OR REPLACE FUNCTION public.get_user_for_login(p_email TEXT)
RETURNS TABLE (
  id UUID,
  email VARCHAR,
  password_hash TEXT,
  first_name VARCHAR,
  last_name VARCHAR,
  role VARCHAR,
  is_active BOOLEAN,
  has_completed_onboarding BOOLEAN,
  profile_photo TEXT,
  company VARCHAR,
  phone VARCHAR,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT id,
         email,
         password_hash,
         first_name,
         last_name,
         role,
         is_active,
         has_completed_onboarding,
         profile_photo,
         company,
         phone,
         bio,
         created_at
  FROM users_pt2024
  WHERE email = p_email;
$$;

-- Allow anonymous execution for login purposes
GRANT EXECUTE ON FUNCTION public.get_user_for_login(TEXT) TO anon;

-- RPC function to create a new user account with default values
CREATE OR REPLACE FUNCTION public.create_user_account(
  p_email TEXT,
  p_password_hash TEXT,
  p_first_name TEXT,
  p_last_name TEXT,
  p_role TEXT DEFAULT 'financial_professional',
  p_company TEXT DEFAULT '',
  p_phone TEXT DEFAULT '',
  p_bio TEXT DEFAULT ''
)
RETURNS TABLE (
  id UUID,
  email VARCHAR,
  first_name VARCHAR,
  last_name VARCHAR,
  role VARCHAR,
  is_active BOOLEAN,
  has_completed_onboarding BOOLEAN,
  profile_photo TEXT,
  company VARCHAR,
  phone VARCHAR,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE SQL VOLATILE SECURITY DEFINER
AS $$
  INSERT INTO users_pt2024 (
    email,
    password_hash,
    first_name,
    last_name,
    role,
    is_active,
    has_completed_onboarding,
    company,
    phone,
    bio,
    created_at,
    updated_at
  ) VALUES (
    p_email,
    p_password_hash,
    p_first_name,
    p_last_name,
    COALESCE(p_role, 'financial_professional'),
    TRUE,
    FALSE,
    p_company,
    p_phone,
    p_bio,
    NOW(),
    NOW()
  )
  RETURNING id,
            email,
            first_name,
            last_name,
            role,
            is_active,
            has_completed_onboarding,
            profile_photo,
            company,
            phone,
            bio,
            created_at;
$$;

-- Allow anonymous execution for sign up
GRANT EXECUTE ON FUNCTION public.create_user_account(
  TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT
) TO anon;

-- RPC function to insert a new client record bypassing RLS
CREATE OR REPLACE FUNCTION public.create_client_record(
  p_id UUID DEFAULT uuid_generate_v4(),
  p_user_id UUID,
  p_first_name TEXT,
  p_last_name TEXT,
  p_email TEXT DEFAULT NULL,
  p_phone TEXT DEFAULT NULL,
  p_address TEXT DEFAULT NULL,
  p_city TEXT DEFAULT NULL,
  p_state TEXT DEFAULT NULL,
  p_zip_code TEXT DEFAULT NULL,
  p_date_of_birth DATE DEFAULT NULL,
  p_occupation TEXT DEFAULT NULL,
  p_employer TEXT DEFAULT NULL,
  p_marital_status TEXT DEFAULT NULL,
  p_spouse_first_name TEXT DEFAULT NULL,
  p_spouse_last_name TEXT DEFAULT NULL,
  p_spouse_date_of_birth DATE DEFAULT NULL,
  p_spouse_occupation TEXT DEFAULT NULL,
  p_spouse_employer TEXT DEFAULT NULL,
  p_spouse_phone TEXT DEFAULT NULL,
  p_spouse_email TEXT DEFAULT NULL,
  p_children JSONB DEFAULT NULL
)
RETURNS clients
LANGUAGE SQL VOLATILE SECURITY DEFINER
AS $$
  INSERT INTO clients (
    id,
    user_id,
    first_name,
    last_name,
    email,
    phone,
    address,
    city,
    state,
    zip_code,
    date_of_birth,
    occupation,
    employer,
    marital_status,
    spouse_first_name,
    spouse_last_name,
    spouse_date_of_birth,
    spouse_occupation,
    spouse_employer,
    spouse_phone,
    spouse_email,
    children,
    created_at,
    updated_at
  ) VALUES (
    COALESCE(p_id, uuid_generate_v4()),
    p_user_id,
    p_first_name,
    p_last_name,
    p_email,
    p_phone,
    p_address,
    p_city,
    p_state,
    p_zip_code,
    p_date_of_birth,
    p_occupation,
    p_employer,
    p_marital_status,
    p_spouse_first_name,
    p_spouse_last_name,
    p_spouse_date_of_birth,
    p_spouse_occupation,
    p_spouse_employer,
    p_spouse_phone,
    p_spouse_email,
    p_children,
    NOW(),
    NOW()
  )
  RETURNING *;
$$;

GRANT EXECUTE ON FUNCTION public.create_client_record(
  UUID, UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT,
  DATE, TEXT, TEXT, TEXT, TEXT, TEXT, DATE, TEXT, TEXT, TEXT,
  TEXT, JSONB
) TO anon;

-- RPC function to insert a new financial analysis bypassing RLS
CREATE OR REPLACE FUNCTION public.create_financial_analysis_record(
  p_id UUID DEFAULT uuid_generate_v4(),
  p_client_id UUID,
  p_income JSONB DEFAULT NULL,
  p_expenses JSONB DEFAULT NULL,
  p_assets JSONB DEFAULT NULL,
  p_liabilities JSONB DEFAULT NULL,
  p_financial_goals JSONB DEFAULT NULL,
  p_life_insurance JSONB DEFAULT NULL,
  p_net_income NUMERIC DEFAULT NULL,
  p_net_worth NUMERIC DEFAULT NULL
)
RETURNS financial_analyses
LANGUAGE SQL VOLATILE SECURITY DEFINER
AS $$
  INSERT INTO financial_analyses (
    id,
    client_id,
    income,
    expenses,
    assets,
    liabilities,
    financial_goals,
    life_insurance,
    net_income,
    net_worth,
    created_at,
    updated_at
  ) VALUES (
    COALESCE(p_id, uuid_generate_v4()),
    p_client_id,
    p_income,
    p_expenses,
    p_assets,
    p_liabilities,
    p_financial_goals,
    p_life_insurance,
    p_net_income,
    p_net_worth,
    NOW(),
    NOW()
  )
  RETURNING *;
$$;

GRANT EXECUTE ON FUNCTION public.create_financial_analysis_record(
  UUID, UUID, JSONB, JSONB, JSONB, JSONB, JSONB, JSONB, NUMERIC, NUMERIC
) TO anon;
-- Grant permissions for anon role
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO anon;

