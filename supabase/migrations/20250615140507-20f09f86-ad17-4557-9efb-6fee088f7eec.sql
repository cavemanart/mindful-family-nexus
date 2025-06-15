
-- Redefine join_household_with_code to bypass RLS when validating join codes,
-- enabling kids (unauthenticated/anonymous users) to join with a valid, unused, and unexpired code.
CREATE OR REPLACE FUNCTION public.join_household_with_code(_code text, _name text, _avatar_selection text, _device_id text)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
  code_row RECORD;
  child_id UUID := gen_random_uuid();
BEGIN
  -- Bypass RLS for code lookup to allow anonymous "join"
  EXECUTE 'SET LOCAL row_security = off';

  SELECT * INTO code_row
    FROM public.household_join_codes
    WHERE code = _code AND expires_at > now() AND used_at IS NULL
    LIMIT 1;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid or expired code';
  END IF;

  -- Re-enable RLS (default for transaction)
  -- Mark the code as used
  UPDATE public.household_join_codes
    SET used_at = now()
    WHERE id = code_row.id;
  
  -- Add child profile (no email, device_id for login)
  INSERT INTO public.profiles (
    id, first_name, last_name, avatar_selection, is_child_account, device_id, role
  ) VALUES (
    child_id, _name, NULL, _avatar_selection, true, _device_id, 'child'
  );

  -- Household membership
  INSERT INTO public.household_members (
    household_id, user_id, role
  ) VALUES (
    code_row.household_id, child_id, 'member'
  );

  RETURN child_id;
END;
$$ SECURITY DEFINER;
