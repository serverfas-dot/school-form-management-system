/*
  # Create Volunteer Approval Email Trigger

  1. Purpose
    - Automatically send approval emails when volunteer registrations are approved
    - Triggers fire when status changes from any value to 'approved'

  2. New Functions
    - `send_volunteer_approval_email()` - Triggers email for volunteer registrations

  3. New Triggers
    - `trigger_volunteer_approval_email` - On volunteer_form_submissions table

  4. How It Works
    - When admin changes status to 'approved', trigger fires automatically
    - Trigger calls the edge function via HTTP request
    - Email is sent to the volunteer's email address

  5. Security
    - Uses Supabase service role for secure function invocation
    - Only triggers on UPDATE operations when status becomes 'approved'
*/

-- Function to send volunteer approval email
CREATE OR REPLACE FUNCTION send_volunteer_approval_email()
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
        'formType', 'volunteer'
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for volunteer form submissions
DROP TRIGGER IF EXISTS trigger_volunteer_approval_email ON volunteer_form_submissions;
CREATE TRIGGER trigger_volunteer_approval_email
  AFTER UPDATE ON volunteer_form_submissions
  FOR EACH ROW
  EXECUTE FUNCTION send_volunteer_approval_email();