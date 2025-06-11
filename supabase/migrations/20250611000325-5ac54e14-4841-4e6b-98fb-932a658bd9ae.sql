
-- Drop the existing function first
DROP FUNCTION IF EXISTS public.create_child_profile(text, text, text, text, uuid, uuid);

-- Create an updated function that doesn't violate foreign key constraints
CREATE OR REPLACE FUNCTION public.create_child_profile(
  p_first_name text, 
  p_last_name text, 
  p_pin text, 
  p_avatar_selection text, 
  p_parent_id uuid, 
  p_household_id uuid
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_child_id UUID;
BEGIN
  -- Generate a new UUID for the child
  new_child_id := gen_random_uuid();
  
  -- Insert the child profile without the foreign key constraint to auth.users
  -- Since child accounts don't have corresponding auth users, we'll use a special approach
  INSERT INTO public.profiles (
    id,
    email,
    first_name,
    last_name,
    pin,
    avatar_selection,
    parent_id,
    role,
    is_child_account
  ) VALUES (
    new_child_id,
    CONCAT(lower(p_first_name), '.', lower(p_last_name), '+', substring(new_child_id::text, 1, 8), '@family.local'),
    p_first_name,
    p_last_name,
    p_pin,
    p_avatar_selection,
    p_parent_id,
    'child',
    true
  );
  
  -- Add child to household as a member
  INSERT INTO public.household_members (
    household_id,
    user_id,
    role
  ) VALUES (
    p_household_id,
    new_child_id,
    'member'
  );
  
  RETURN new_child_id;
END;
$$;
