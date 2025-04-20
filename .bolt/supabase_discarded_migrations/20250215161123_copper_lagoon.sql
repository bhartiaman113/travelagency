/*
  # Initial Schema for Travel Agency Management System

  1. New Tables
    - profiles
      - Stores user profile information
    - hotels
      - Stores hotel information
    - buses
      - Stores bus service information
    - cabs
      - Stores cab service information
    - bookings
      - Stores all booking information
    - service_providers
      - Stores service provider information
    - packages
      - Stores package information

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name text,
  phone_number text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create hotels table
CREATE TABLE IF NOT EXISTS hotels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  location text NOT NULL,
  description text,
  price_per_night decimal NOT NULL,
  amenities jsonb,
  images text[],
  provider_id uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now()
);

-- Create buses table
CREATE TABLE IF NOT EXISTS buses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  operator text NOT NULL,
  source text NOT NULL,
  destination text NOT NULL,
  departure_time timestamptz NOT NULL,
  arrival_time timestamptz NOT NULL,
  price decimal NOT NULL,
  available_seats integer NOT NULL,
  provider_id uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now()
);

-- Create cabs table
CREATE TABLE IF NOT EXISTS cabs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_type text NOT NULL,
  base_price decimal NOT NULL,
  price_per_km decimal NOT NULL,
  available boolean DEFAULT true,
  provider_id uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now()
);

-- Create service_providers table
CREATE TABLE IF NOT EXISTS service_providers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES profiles(id),
  business_name text NOT NULL,
  business_type text NOT NULL,
  documents jsonb,
  verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create packages table
CREATE TABLE IF NOT EXISTS packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('regular', 'premium', 'luxury')),
  description text,
  price decimal NOT NULL,
  duration_days integer NOT NULL,
  inclusions jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id),
  booking_type text NOT NULL CHECK (type IN ('hotel', 'bus', 'cab', 'package')),
  service_id uuid NOT NULL,
  start_date timestamptz NOT NULL,
  end_date timestamptz,
  total_amount decimal NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  payment_status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE hotels ENABLE ROW LEVEL SECURITY;
ALTER TABLE buses ENABLE ROW LEVEL SECURITY;
ALTER TABLE cabs ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Anyone can view hotels"
  ON hotels FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service providers can manage their hotels"
  ON hotels FOR ALL
  TO authenticated
  USING (provider_id = auth.uid());

CREATE POLICY "Anyone can view buses"
  ON buses FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service providers can manage their buses"
  ON buses FOR ALL
  TO authenticated
  USING (provider_id = auth.uid());

CREATE POLICY "Anyone can view cabs"
  ON cabs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service providers can manage their cabs"
  ON cabs FOR ALL
  TO authenticated
  USING (provider_id = auth.uid());

CREATE POLICY "Users can view their own bookings"
  ON bookings FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own bookings"
  ON bookings FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Anyone can view packages"
  ON packages FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service providers can view their status"
  ON service_providers FOR SELECT
  TO authenticated
  USING (profile_id = auth.uid());