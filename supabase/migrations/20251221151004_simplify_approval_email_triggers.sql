/*
  # Simplify Automatic Approval Email Triggers

  1. Purpose
    - Simplify trigger functions with direct Supabase URL
    - Ensure reliable email delivery on approval

  2. Changes
    - Use hardcoded Supabase URL for reliability
    - Cleaner trigger logic
    - Better error handling
*/

-- Function to send stationery voucher approval email
CREATE OR REPLACE FUNCTION send_stationery_approval_email()
RETURNS TRIGGER AS $$
DECLARE
  function_url text := 'https://pvhpxmmssgdqqqndivnf.supabase.co/functions/v1/send-approval-notification';
  request_id bigint;
BEGIN
  -- Only proceed if status changed to 'approved' and email exists
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') AND NEW.email IS NOT NULL AND NEW.email != '' THEN
    -- Make HTTP request to edge function (async/fire and forget)
    BEGIN
      SELECT extensions.http_post(
        url := function_url,
        headers := '{"Content-Type": "application/json"}'::jsonb,
        body := json_build_object(
          'email', NEW.email,
          'formType', 'stationery'
        )::text
      ) INTO request_id;
      
      RAISE NOTICE 'Stationery approval email triggered for % (request_id: %)', NEW.email, request_id;
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'Failed to trigger email for %: %', NEW.email, SQLERRM;
    END;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to send office items approval email
CREATE OR REPLACE FUNCTION send_office_items_approval_email()
RETURNS TRIGGER AS $$
DECLARE
  function_url text := 'https://pvhpxmmssgdqqqndivnf.supabase.co/functions/v1/send-approval-notification';
  request_id bigint;
BEGIN
  -- Only proceed if status changed to 'approved' and email exists
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') AND NEW.email IS NOT NULL AND NEW.email != '' THEN
    -- Make HTTP request to edge function (async/fire and forget)
    BEGIN
      SELECT extensions.http_post(
        url := function_url,
        headers := '{"Content-Type": "application/json"}'::jsonb,
        body := json_build_object(
          'email', NEW.email,
          'formType', 'office-items'
        )::text
      ) INTO request_id;
      
      RAISE NOTICE 'Office items approval email triggered for % (request_id: %)', NEW.email, request_id;
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'Failed to trigger email for %: %', NEW.email, SQLERRM;
    END;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
