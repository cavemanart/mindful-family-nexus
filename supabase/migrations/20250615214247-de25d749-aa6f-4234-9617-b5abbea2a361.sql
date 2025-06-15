
-- Update join_household_with_code to fail transparently instead of silently
CREATE OR REPLACE FUNCTION public.join_household_with_code(
  _code text,
  _name text,
  _avatar_selection text,
  _device_id text
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
  code_row RECORD;
  this_user UUID := auth.uid();
  already_member BOOLEAN;
BEGIN
  -- Bypass RLS for code lookup to allow anonymous "join"
  EXECUTE 'SET LOCAL row_security = off';

  -- Find unused, unexpired code
  SELECT * INTO code_row
    FROM public.household_join_codes
    WHERE code = _code AND expires_at > now() AND used_at IS NULL
    LIMIT 1;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid or expired join code';
  END IF;

  -- Check if the user is already a member of this household
  SELECT EXISTS (
    SELECT 1 FROM public.household_members
    WHERE household_id = code_row.household_id AND user_id = this_user
  ) INTO already_member;

  IF already_member THEN
    RAISE EXCEPTION 'User is already a member of this household.';
  END IF;

  -- Mark the code as used
  UPDATE public.household_join_codes
    SET used_at = now()
    WHERE id = code_row.id;

  -- Update the existing authenticated user's profile to mark as child
  UPDATE public.profiles
    SET first_name = _name,
        avatar_selection = _avatar_selection,
        is_child_account = true,
        role = 'child',
        device_id = _device_id
    WHERE id = this_user;

  -- Insert as member; if insert fails, raise error
  INSERT INTO public.household_members (
    household_id, user_id, role
  ) VALUES (
    code_row.household_id, this_user, 'member'
  );

  RETURN this_user;
END;
$$ SECURITY DEFINER;

-- Grant execution to anon and authenticated clients
GRANT EXECUTE ON FUNCTION public.join_household_with_code(text, text, text, text) TO anon, authenticated;
