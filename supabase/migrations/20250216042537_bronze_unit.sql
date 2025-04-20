/*
  # Create tables for travel agency system

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key) - matches auth.users id
      - `full_name` (text)
      - `phone_number` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `service_providers`
      - `id` (uuid, primary key)
      - `profile_id` (uuid, foreign key to profiles)
      - `business_name` (text)
      - `business_type` (text) - enum: hotel, bus, cab
      - `documents` (jsonb) - store document references
      - `verified` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `hotels`
      - `id` (uuid, primary key)
      - `provider_id` (uuid, foreign key to service_providers)
      - `name` (text)
      - `location` (text)
      - `description` (text)
      - `price_per_night` (numeric)
      - `amenities` (text[])
      - `images` (text[])
      - `created_at` (timestamp)
    
    - `buses`
      - `id` (uuid, primary key)
      - `provider_id` (uuid, foreign key to service_providers)
      - `operator` (text)
      - `source` (text)
      - `destination` (text)
      - `departure_time` (timestamp)
      - `arrival_time` (timestamp)
      - `price` (numeric)
      - `available_seats` (integer)
      - `created_at` (timestamp)
    
    - `cabs`
      - `id` (uuid, primary key)
      - `provider_id` (uuid, foreign key to service_providers)
      - `vehicle_type` (text)
      - `base_price` (numeric)
      - `price_per_km` (numeric)
      - `available` (boolean)
      - `created_at` (timestamp)
    
    - `packages`
      - `id` (uuid, primary key)
      - `name` (text)
      - `type` (text) - enum: regular, premium, luxury
      - `description` (text)
      - `price` (numeric)
      - `duration_days` (integer)
      - `inclusions` (text[])
      - `created_at` (timestamp)
    
    - `bookings`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to profiles)
      - `booking_type` (text) - enum: hotel, bus, cab, package
      - `service_id` (uuid) - references the respective service table
      - `start_date` (timestamp)
      - `end_date` (timestamp)
      - `total_amount` (numeric)
      - `status` (text) - enum: pending, confirmed, cancelled
      - `payment_status` (text) - enum: pending, paid, refunded
      - `payment_id` (text) - Razorpay payment ID
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Add policies for service providers
*/

-- Create profiles table
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  full_name text,
  phone_number text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Create service_providers table
CREATE TABLE service_providers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES profiles(id),
  business_name text NOT NULL,
  business_type text NOT NULL CHECK (business_type IN ('hotel', 'bus', 'cab')),
  documents jsonb,
  verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE service_providers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service providers can view own data"
  ON service_providers FOR SELECT
  TO authenticated
  USING (auth.uid() = profile_id);

-- Create hotels table
CREATE TABLE hotels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid REFERENCES service_providers(id),
  name text NOT NULL,
  location text NOT NULL,
  description text,
  price_per_night numeric NOT NULL,
  amenities text[],
  images text[],
  created_at timestamptz DEFAULT now()
);

ALTER TABLE hotels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view hotels"
  ON hotels FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service providers can manage own hotels"
  ON hotels FOR ALL
  TO authenticated
  USING (
    provider_id IN (
      SELECT id FROM service_providers WHERE profile_id = auth.uid()
    )
  );

-- Create buses table
CREATE TABLE buses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid REFERENCES service_providers(id),
  operator text NOT NULL,
  source text NOT NULL,
  destination text NOT NULL,
  departure_time timestamptz NOT NULL,
  arrival_time timestamptz NOT NULL,
  price numeric NOT NULL,
  available_seats integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE buses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view buses"
  ON buses FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service providers can manage own buses"
  ON buses FOR ALL
  TO authenticated
  USING (
    provider_id IN (
      SELECT id FROM service_providers WHERE profile_id = auth.uid()
    )
  );

-- Create cabs table
CREATE TABLE cabs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid REFERENCES service_providers(id),
  vehicle_type text NOT NULL,
  base_price numeric NOT NULL,
  price_per_km numeric NOT NULL,
  available boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE cabs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view cabs"
  ON cabs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service providers can manage own cabs"
  ON cabs FOR ALL
  TO authenticated
  USING (
    provider_id IN (
      SELECT id FROM service_providers WHERE profile_id = auth.uid()
    )
  );

-- Create packages table
CREATE TABLE packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('regular', 'premium', 'luxury')),
  description text,
  price numeric NOT NULL,
  duration_days integer NOT NULL,
  inclusions text[],
  created_at timestamptz DEFAULT now()
);

ALTER TABLE packages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view packages"
  ON packages FOR SELECT
  TO authenticated
  USING (true);

-- Create bookings table
CREATE TABLE bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id),
  booking_type text NOT NULL CHECK (booking_type IN ('hotel', 'bus', 'cab', 'package')),
  service_id uuid NOT NULL,
  start_date timestamptz NOT NULL,
  end_date timestamptz,
  total_amount numeric NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  payment_status text NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
  payment_id text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bookings"
  ON bookings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Insert sample data
INSERT INTO packages (name, type, description, price, duration_days, inclusions) VALUES
('City Explorer', 'regular', 'Perfect for budget travelers who want to explore the city', 499, 3, ARRAY['Hotel stay', 'City tour', 'Airport transfer']),
('Premium Getaway', 'premium', 'Enhanced comfort and exclusive experiences', 999, 5, ARRAY['4-star hotel', 'All meals', 'Guided tours', 'Premium transport']),
('Luxury Escape', 'luxury', 'Ultimate luxury experience with premium amenities', 1999, 7, ARRAY['5-star resort', 'Private butler', 'Spa treatment', 'Fine dining', 'Helicopter tour']);

-- Insert sample hotels
INSERT INTO hotels (name, location, description, price_per_night, amenities, images) VALUES
('City Comfort Inn', 'New York', 'Comfortable stay in the heart of the city', 150, ARRAY['WiFi', 'AC', 'Restaurant'], ARRAY['https://images.unsplash.com/photo-1566073771259-6a8506099945']),
('Luxury Resort & Spa', 'Miami', 'Luxurious beachfront resort', 350, ARRAY['Pool', 'Spa', 'Gym', 'Restaurant'], ARRAY['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b']),
('Mountain View Lodge', 'Denver', 'Scenic mountain retreat', 200, ARRAY['Hiking trails', 'Restaurant', 'Fireplace'], ARRAY['https://images.unsplash.com/photo-1520250497591-112f2f40a3f4']);

-- Insert sample buses
INSERT INTO buses (operator, source, destination, departure_time, arrival_time, price, available_seats) VALUES
('Express Lines', 'New York', 'Boston', NOW() + interval '1 day', NOW() + interval '1 day 4 hours', 45, 30),
('Luxury Coach', 'Los Angeles', 'Las Vegas', NOW() + interval '2 days', NOW() + interval '2 days 6 hours', 65, 25),
('City Connect', 'Chicago', 'Detroit', NOW() + interval '3 days', NOW() + interval '3 days 5 hours', 55, 35);

-- Insert sample cabs
INSERT INTO cabs (vehicle_type, base_price, price_per_km, available) VALUES
('Economy', 10, 1.5, true),
('Premium Sedan', 20, 2.5, true),
('Luxury SUV', 30, 3.5, true);