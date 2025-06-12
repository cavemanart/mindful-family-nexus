
-- Remove the foreign key constraint that's causing the issue
-- This allows child profiles to have UUIDs that don't exist in auth.users
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profile_id_fkey;

-- Ensure the profiles table still has proper structure
-- The id column should remain as the primary key but without the foreign key constraint
