/*
  # Automatic Approval Email Triggers

  1. Purpose
    - Automatically send approval emails when submissions are approved
    - Triggers fire when status changes from any value to 'approved'

  2. New Functions
    - `send_stationery_approval_email()` - Triggers email for stationery vouchers
    - `send_office_items_approval_email()` - Triggers email for office items requests

  3. New Triggers
    - `trigger_stationery_approval_email` - On stationery_voucher_submissions table
    - `trigger_office_items_approval_email` - On office_items_requests table

  4. How It Works
    - When admin changes status to 'approved', trigger fires automatically
    - Trigger calls the edge function via HTTP request
    - Email is sent to the user's email address
    - Works for both form types: stationery vouchers and office items

  5. Security
    - Uses Supabase service role for secure function invocation
    - Only triggers on UPDATE operations when status becomes 'approved'
*/

-- Function to send stationery voucher approval email
CREATE OR REPLACE FUNCTION send_stationery_approval_email()
RETURNS TRIGGER AS $$
DECLARE
  supabase_url text;
  service_role_key text;
  function_url text;
BEGIN
  -- Only proceed if status changed to 'approved' and email exists
  IF NEW.status = 'approved' AND OLD.status != 'approved' AND NEW.email IS NOT NULL THEN
    -- Get Supabase URL and service role key from environment
    supabase_url := current_setting('app.settings.supabase_url', true);
    service_role_key := current_setting('app.settings.service_role_key', true);
    
    -- Construct the edge function URL
    function_url := supabase_url || '/functions/v1/send-approval-notification';
    
    -- Make HTTP request to edge function (fire and forget)
    PERFORM net.http_post(
      url := function_url,
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || service_role_key
      ),
      body := jsonb_build_object(
        'email', NEW.email,
        'formType', 'stationery'
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to send office items approval email
CREATE OR REPLACE FUNCTION send_office_items_approval_email()
RETURNS TRIGGER AS $$
DECLARE
  supabase_url text;
  service_role_key text;
  function_url text;
BEGIN
  -- Only proceed if status changed to 'approved' and email exists
  IF NEW.status = 'approved' AND OLD.status != 'approved' AND NEW.email IS NOT NULL THEN
    -- Get Supabase URL and service role key from environment
    supabase_url := current_setting('app.settings.supabase_url', true);
    service_role_key := current_setting('app.settings.service_role_key', true);
    
    -- Construct the edge function URL
    function_url := supabase_url || '/functions/v1/send-approval-notification';
    
    -- Make HTTP request to edge function (fire and forget)
    PERFORM net.http_post(
      url := function_url,
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || service_role_key
      ),
      body := jsonb_build_object(
        'email', NEW.email,
        'formType', 'office-items'
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for stationery voucher submissions
DROP TRIGGER IF EXISTS trigger_stationery_approval_email ON stationery_voucher_submissions;
CREATE TRIGGER trigger_stationery_approval_email
  AFTER UPDATE ON stationery_voucher_submissions
  FOR EACH ROW
  EXECUTE FUNCTION send_stationery_approval_email();

-- Create trigger for office items requests
DROP TRIGGER IF EXISTS trigger_office_items_approval_email ON office_items_requests;
CREATE TRIGGER trigger_office_items_approval_email
  AFTER UPDATE ON office_items_requests
  FOR EACH ROW
  EXECUTE FUNCTION send_office_items_approval_email();
