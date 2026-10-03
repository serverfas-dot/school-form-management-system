/*
  # Fix Automatic Approval Email Triggers

  1. Purpose
    - Fix trigger functions to use correct pg_net schema
    - Use environment variables properly for Supabase URL

  2. Changes
    - Update trigger functions to use extensions.http_post
    - Simplify configuration access
    - Ensure triggers work with pg_net extension
*/

-- Function to send stationery voucher approval email
CREATE OR REPLACE FUNCTION send_stationery_approval_email()
RETURNS TRIGGER AS $$
DECLARE
  supabase_url text;
  anon_key text;
  function_url text;
  request_id bigint;
BEGIN
  -- Only proceed if status changed to 'approved' and email exists
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') AND NEW.email IS NOT NULL THEN
    -- Get Supabase URL from environment (this is automatically available)
    SELECT current_setting('request.headers', true)::json->>'host' INTO supabase_url;
    
    IF supabase_url IS NULL THEN
      -- Fallback: use a default pattern (will be replaced by actual URL in production)
      supabase_url := 'https://' || current_database() || '.supabase.co';
    ELSE
      supabase_url := 'https://' || supabase_url;
    END IF;
    
    -- Construct the edge function URL
    function_url := supabase_url || '/functions/v1/send-approval-notification';
    
    -- Make HTTP request to edge function (fire and forget)
    SELECT extensions.http_post(
      url := function_url,
      headers := '{"Content-Type": "application/json"}'::jsonb,
      body := json_build_object(
        'email', NEW.email,
        'formType', 'stationery'
      )::text
    ) INTO request_id;
    
    RAISE NOTICE 'Approval email triggered for % (request_id: %)', NEW.email, request_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to send office items approval email
CREATE OR REPLACE FUNCTION send_office_items_approval_email()
RETURNS TRIGGER AS $$
DECLARE
  supabase_url text;
  anon_key text;
  function_url text;
  request_id bigint;
BEGIN
  -- Only proceed if status changed to 'approved' and email exists
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') AND NEW.email IS NOT NULL THEN
    -- Get Supabase URL from environment
    SELECT current_setting('request.headers', true)::json->>'host' INTO supabase_url;
    
    IF supabase_url IS NULL THEN
      -- Fallback: use a default pattern
      supabase_url := 'https://' || current_database() || '.supabase.co';
    ELSE
      supabase_url := 'https://' || supabase_url;
    END IF;
    
    -- Construct the edge function URL
    function_url := supabase_url || '/functions/v1/send-approval-notification';
    
    -- Make HTTP request to edge function (fire and forget)
    SELECT extensions.http_post(
      url := function_url,
      headers := '{"Content-Type": "application/json"}'::jsonb,
      body := json_build_object(
        'email', NEW.email,
        'formType', 'office-items'
      )::text
    ) INTO request_id;
    
    RAISE NOTICE 'Approval email triggered for % (request_id: %)', NEW.email, request_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
