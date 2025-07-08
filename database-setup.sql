-- ProsperTrack™ Database Setup Script
-- This script creates all the necessary tables and security policies for the ProsperTrack application

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table
CREATE TABLE users_pt2024 (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
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

-- Create policies for users table
CREATE POLICY "Users can view their own data" 
  ON users_pt2024 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Admin can view all users" 
  ON users_pt2024 
  FOR SELECT 
  USING ((SELECT role FROM users_pt2024 WHERE id = auth.uid()) = 'admin');

-- Initial admin user (password: admin1234)
INSERT INTO users_pt2024 (
  email, 
  password_hash, 
  first_name, 
  last_name, 
  role, 
  is_active, 
  has_completed_onboarding
) VALUES (
  'sebasrodus+admin@gmail.com',
  '$2b$10$XdR5Mfl6nA8CXHGXE1Uqz.SjVoam.nWjolSbQpIy5keN5XvbIlGk6', -- hashed 'admin1234'
  'Admin',
  'User',
  'admin',
  true,
  true
);

-- Initial advisor user (password: advisor123)
INSERT INTO users_pt2024 (
  email, 
  password_hash, 
  first_name, 
  last_name, 
  role, 
  is_active, 
  has_completed_onboarding
) VALUES (
  'advisor@prospertrack.com',
  '$2b$10$vhj5TgZGHfYmHxpJ0A6FYOS8J.xZLBXKJdS7CZzHt1Zi3.qWShcUO', -- hashed 'advisor123'
  'Financial',
  'Advisor',
  'financial_professional',
  true,
  true
);

-- Clients Table (if you want to store in database instead of localStorage)
CREATE TABLE clients (
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
  USING ((SELECT role FROM users_pt2024 WHERE id = auth.uid()) = 'admin');

-- Financial Analyses Table (if you want to store in database instead of localStorage)
CREATE TABLE financial_analyses (
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
  USING ((SELECT role FROM users_pt2024 WHERE id = auth.uid()) = 'admin');

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
