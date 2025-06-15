
-- Make the email column nullable in the profiles table, so child accounts created via join code without an email do not violate NOT NULL constraints.
ALTER TABLE public.profiles ALTER COLUMN email DROP NOT NULL;

-- (Optional) Add a comment for documentation, if desired:
-- COMMENT ON COLUMN public.profiles.email IS 'Email can be NULL for device-based child accounts.';
