/*
  # Update Grade Column to Support New Grade Format

  1. Changes
    - Drop existing CHECK constraint on `grade` column
    - Convert `grade` column from integer to text in `stationery_voucher_submissions` table
    - This allows storing new grade formats like "9 SC", "9 BS", "9 BTECH", "10 SC", "10 BS", "10 BTECH"
    - Preserves existing data by converting integers to text format

  2. Notes
    - Existing numeric grades (1-8) will be preserved as text
    - New grades 9 and 10 will use the specialized format (SC, BS, BTECH streams)
    - No data loss during migration
*/

-- Drop the existing CHECK constraint
ALTER TABLE stationery_voucher_submissions 
DROP CONSTRAINT IF EXISTS stationery_voucher_submissions_grade_check;

-- Convert existing integer grades to text and change column type
ALTER TABLE stationery_voucher_submissions 
ALTER COLUMN grade TYPE text USING grade::text;