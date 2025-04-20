/*
  # Add payment and payout tables

  1. New Tables
    - `payments`
      - `id` (uuid, primary key)
      - `booking_id` (uuid, references bookings)
      - `amount` (numeric)
      - `currency` (text)
      - `status` (text)
      - `payment_method` (text)
      - `razorpay_payment_id` (text)
      - `razorpay_order_id` (text)
      - `created_at` (timestamptz)

    - `payouts`
      - `id` (uuid, primary key)
      - `provider_id` (uuid, references service_providers)
      - `amount` (numeric)
      - `status` (text)
      - `razorpay_payout_id` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users
*/

-- Create payments table
CREATE TABLE payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid REFERENCES bookings(id),
  amount numeric NOT NULL,
  currency text NOT NULL DEFAULT 'INR',
  status text NOT NULL CHECK (status IN ('pending', 'completed', 'failed')),
  payment_method text NOT NULL,
  razorpay_payment_id text,
  razorpay_order_id text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own payments"
  ON payments FOR SELECT
  TO authenticated
  USING (
    booking_id IN (
      SELECT id FROM bookings WHERE user_id = auth.uid()
    )
  );

-- Create payouts table
CREATE TABLE payouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid REFERENCES service_providers(id),
  amount numeric NOT NULL,
  status text NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  razorpay_payout_id text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service providers can view own payouts"
  ON payouts FOR SELECT
  TO authenticated
  USING (
    provider_id IN (
      SELECT id FROM service_providers WHERE profile_id = auth.uid()
    )
  );

-- Add bank account details to service_providers
ALTER TABLE service_providers ADD COLUMN bank_account jsonb;