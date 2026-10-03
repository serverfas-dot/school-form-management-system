/*
  # Create Admin Login Function

  ## Overview
  Creates a PostgreSQL function to handle admin authentication securely.

  ## 1. New Functions
  
  ### `admin_login`
  - Parameters:
    - `p_username` (text) - Admin username
    - `p_password` (text) - Plain text password (will be hashed and compared)
  - Returns: Table with admin user details if credentials are valid
  - Purpose: Securely authenticate admin users by comparing hashed passwords
  
  ## 2. Security
  - Uses pgcrypto's crypt function for secure password comparison
  - Only returns user data if password matches
  - Function is accessible to public (anon) for login purposes
  
  ## 3. Important Notes
  - Password is never stored in plain text
  - Uses bcrypt hashing algorithm via gen_salt('bf')
  - Returns empty set if credentials are invalid
*/

-- Create admin login function
CREATE OR REPLACE FUNCTION admin_login(p_username text, p_password text)
RETURNS TABLE (
  id uuid,
  username text,
  full_name text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    au.id,
    au.username,
    au.full_name
  FROM admin_users au
  WHERE au.username = p_username
    AND au.password_hash = crypt(p_password, au.password_hash);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to public for login
GRANT EXECUTE ON FUNCTION admin_login(text, text) TO public;