/*
  # Disable Volunteer Email Trigger Temporarily

  ## Overview
  Temporarily disable the email trigger for volunteer form approvals
  until the environment variables are properly configured.

  ## 1. Changes
  - Drop the trigger that sends email notifications
  - Keep the function for future use

  ## 2. Reasoning
  - The trigger is causing errors due to missing environment configuration
  - Status updates should work without email notifications for now

  ## 3. Re-enabling
  - Once environment variables are configured, the trigger can be recreated
*/

-- Drop the trigger
DROP TRIGGER IF EXISTS trigger_volunteer_approval_email ON volunteer_form_submissions;