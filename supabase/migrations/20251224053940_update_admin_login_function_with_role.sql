/*
  # Update Admin Login Function to Return Role

  ## Overview
  Updates the admin_login function to return the role field, allowing differentiation between admin and super_admin users.

  ## Changes
  - Drop existing admin_login function
  - Recreate with role field in return table
*/

-- Drop the existing function
DROP FUNCTION IF EXISTS admin_login(text, text);

-- Recreate admin login function with role field
CREATE OR REPLACE FUNCTION admin_login(p_username text, p_password text)
RETURNS TABLE (
  id uuid,
  username text,
  full_name text,
  role text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    au.id,
    au.username,
    au.full_name,
    COALESCE(au.role, 'admin') as role
  FROM admin_users au
  WHERE au.username = p_username
    AND au.password_hash = crypt(p_password, au.password_hash);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to public for login
GRANT EXECUTE ON FUNCTION admin_login(text, text) TO public;
