
-- Remove all child accounts from every household and delete their profiles

-- First, get all child user IDs (from profiles)
WITH child_profiles AS (
  SELECT id FROM public.profiles WHERE is_child_account = true
)
-- Delete from household_members
DELETE FROM public.household_members
WHERE user_id IN (SELECT id FROM child_profiles);

-- Optionally, delete all child profiles themselves (uncomment the next statement to fully remove children from the app)
-- DELETE FROM public.profiles WHERE is_child_account = true;
