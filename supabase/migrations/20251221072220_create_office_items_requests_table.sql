/*
  # Create Office Items Request Form Table

  ## Overview
  This migration adds a new table for managing office items requests submitted by organizations or individuals.

  ## 1. New Tables
  
  ### `office_items_requests`
  - `id` (uuid, primary key) - Unique request identifier
  - `date` (date) - Date of the request
  - `name` (text) - Requester's full name
  - `address` (text) - Requester's address
  - `nid_number` (text) - National ID number
  - `phone_number` (text) - Contact phone number
  - `email` (text) - Email address for notifications
  - `organization_name` (text) - Name of the organization
  - `items_requested` (text) - Description of items requested
  - `quantity_required` (text) - Quantity needed
  - `purpose_of_request` (text) - Purpose/reason for the request
  - `date_required_by` (date) - Date by which items are needed
  - `submitted_at` (timestamptz) - Timestamp of submission
  - `status` (text) - Status of the request (pending, reviewed, approved)
  
  ## 2. Security
  - Enable RLS on the table
  - Public can insert (submit forms)
  - Authenticated users (admins) can view, update, and delete
  
  ## 3. Indexes
  - Index on status for filtering
  - Index on submitted_at for sorting
  - Index on email for notification lookups
  
  ## 4. Important Notes
  - Email field is required for sending approval notifications
  - All submissions are timestamped automatically
  - Default status is 'pending'
*/

-- Create office_items_requests table
CREATE TABLE IF NOT EXISTS office_items_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL,
  name text NOT NULL,
  address text NOT NULL,
  nid_number text NOT NULL,
  phone_number text NOT NULL,
  email text NOT NULL,
  organization_name text NOT NULL,
  items_requested text NOT NULL,
  quantity_required text NOT NULL,
  purpose_of_request text NOT NULL,
  date_required_by date NOT NULL,
  submitted_at timestamptz DEFAULT now(),
  status text DEFAULT 'pending'
);

-- Enable Row Level Security
ALTER TABLE office_items_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for office_items_requests
CREATE POLICY "Anyone can submit office items requests"
  ON office_items_requests FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view all office items requests"
  ON office_items_requests FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update office items requests"
  ON office_items_requests FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete office items requests"
  ON office_items_requests FOR DELETE
  TO authenticated
  USING (true);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_office_requests_status ON office_items_requests(status);
CREATE INDEX IF NOT EXISTS idx_office_requests_submitted_at ON office_items_requests(submitted_at);
CREATE INDEX IF NOT EXISTS idx_office_requests_email ON office_items_requests(email);
