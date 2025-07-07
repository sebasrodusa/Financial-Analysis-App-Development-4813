-- ProsperTrack Database Schema - FIXED VERSION
-- Run these commands in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (to fix type issues)
DROP TABLE IF EXISTS analyses_pt2024;
DROP TABLE IF EXISTS clients_pt2024;
DROP TABLE IF EXISTS users_pt2024;

-- Users table
CREATE TABLE users_pt2024 (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  role VARCHAR(50) DEFAULT 'financial_professional',
  is_active BOOLEAN DEFAULT true,
  has_completed_onboarding BOOLEAN DEFAULT false,
  profile_photo TEXT,
  company VARCHAR(255),
  phone VARCHAR(50),
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Clients table - FIXED: Using UUID for id
CREATE TABLE clients_pt2024 (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users_pt2024(id) ON DELETE CASCADE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  zip_code VARCHAR(20),
  date_of_birth DATE,
  occupation VARCHAR(255),
  employer VARCHAR(255),
  marital_status VARCHAR(50) DEFAULT 'single',
  spouse_first_name VARCHAR(100),
  spouse_last_name VARCHAR(100),
  spouse_date_of_birth DATE,
  spouse_occupation VARCHAR(255),
  spouse_employer VARCHAR(255),
  spouse_phone VARCHAR(50),
  spouse_email VARCHAR(255),
  children JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Financial analyses table - FIXED: Using UUID for both id and client_id
CREATE TABLE analyses_pt2024 (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  client_id UUID REFERENCES clients_pt2024(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users_pt2024(id) ON DELETE CASCADE,
  income_data JSONB DEFAULT '{}',
  expenses_data JSONB DEFAULT '{}',
  assets_data JSONB DEFAULT '{}',
  liabilities_data JSONB DEFAULT '{}',
  financial_goals JSONB DEFAULT '[]',
  life_insurance JSONB DEFAULT '[]',
  net_income DECIMAL(15,2) DEFAULT 0,
  net_worth DECIMAL(15,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admin settings table
CREATE TABLE IF NOT EXISTS admin_settings_pt2024 (
  id SERIAL PRIMARY KEY,
  auto_approve_registrations BOOLEAN DEFAULT false,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pending user registrations table
CREATE TABLE IF NOT EXISTS pending_users_pt2024 (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  role VARCHAR(50) DEFAULT 'financial_professional',
  company VARCHAR(255),
  phone VARCHAR(50),
  bio TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users_pt2024 ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients_pt2024 ENABLE ROW LEVEL SECURITY;
ALTER TABLE analyses_pt2024 ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users_pt2024
CREATE POLICY "Users can view their own data" ON users_pt2024 
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own data" ON users_pt2024 
  FOR UPDATE USING (true);

CREATE POLICY "Allow user registration" ON users_pt2024 
  FOR INSERT WITH CHECK (true);

-- RLS Policies for clients_pt2024
CREATE POLICY "Users can view their own clients" ON clients_pt2024 
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own clients" ON clients_pt2024 
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own clients" ON clients_pt2024 
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete their own clients" ON clients_pt2024 
  FOR DELETE USING (true);

-- RLS Policies for analyses_pt2024
CREATE POLICY "Users can view their own analyses" ON analyses_pt2024 
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own analyses" ON analyses_pt2024 
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own analyses" ON analyses_pt2024 
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete their own analyses" ON analyses_pt2024 
  FOR DELETE USING (true);

-- Insert demo users
INSERT INTO users_pt2024 (
  email, password_hash, first_name, last_name, role, is_active, has_completed_onboarding
) VALUES 
(
  'sebasrodus+admin@gmail.com',
  'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f',
  'Admin',
  'User',
  'admin',
  true,
  true
),
(
  'advisor@prospertrack.com',
  'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f',
  'Financial',
  'Advisor',
  'financial_professional',
  true,
  true
) ON CONFLICT (email) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients_pt2024(user_id);
CREATE INDEX IF NOT EXISTS idx_clients_created_at ON clients_pt2024(created_at);
CREATE INDEX IF NOT EXISTS idx_analyses_client_id ON analyses_pt2024(client_id);
CREATE INDEX IF NOT EXISTS idx_analyses_user_id ON analyses_pt2024(user_id);
CREATE INDEX IF NOT EXISTS idx_analyses_created_at ON analyses_pt2024(created_at);
CREATE INDEX IF NOT EXISTS idx_users_email ON users_pt2024(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users_pt2024(role);

-- Update trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users_pt2024 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clients_updated_at 
  BEFORE UPDATE ON clients_pt2024 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_analyses_updated_at 
  BEFORE UPDATE ON analyses_pt2024 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Verify table creation
SELECT 'Tables created successfully' as status;