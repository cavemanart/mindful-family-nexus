
-- Phase 1: Create a household_join_codes table for expiring join codes
CREATE TABLE public.household_join_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add RLS for secure access
ALTER TABLE public.household_join_codes ENABLE ROW LEVEL SECURITY;

-- Admins (household owner/admin) can select/generate join codes for their household
CREATE POLICY "Admins can view codes for their household"
  ON public.household_join_codes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM household_members
      WHERE household_members.household_id = household_join_codes.household_id
        AND household_members.user_id = auth.uid()
        AND household_members.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Admins can insert codes for their household"
  ON public.household_join_codes
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM household_members
      WHERE household_members.household_id = household_join_codes.household_id
        AND household_members.user_id = auth.uid()
        AND household_members.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Mark code used (update used_at) if not expired & not already used"
  ON public.household_join_codes
  FOR UPDATE
  USING (
    used_at IS NULL AND expires_at > now()
    AND EXISTS (
      SELECT 1 FROM household_members
      WHERE household_members.household_id = household_join_codes.household_id
        AND household_members.user_id = auth.uid()
        AND household_members.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Allow delete by owner"
  ON public.household_join_codes
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM household_members
      WHERE household_members.household_id = household_join_codes.household_id
        AND household_members.user_id = auth.uid()
        AND household_members.role IN ('owner', 'admin')
    )
  );

-- Phase 1: Device-based login for children
-- 1. Remove pin from profiles (handled in data migration step, keep for now if needed for old code)
-- 2. Add device_id to profiles (unique for child device authentication), set nullable to true
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS device_id TEXT;

-- Phase 1: Remove/disable old PIN-based logic (migration step)
-- (Do not remove yet for safety, but all code will drop references and not rely on pin)

-- Phase 2: Function that generates a secure, human-readable code (~6-8 chars)
CREATE OR REPLACE FUNCTION public.generate_household_join_code(_household_id uuid)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  code TEXT;
  expires TIMESTAMPTZ := now() + interval '1 hour';
BEGIN
  -- Generate simple code: 3 color names + number (e.g. RED-BLUE-GREEN-42), change as desired
  code := 
    (SELECT initcap((array['red','blue','yellow','green','orange','violet','rose','teal','lime','mint','coral'])[floor(random()*11)+1]) || '-' ||
            initcap((array['sun','moon','star','cloud','snow','rain','leaf','wind','frog','owl','fox'])[floor(random()*11)+1]) || '-' ||
            LPAD((floor(random()*100)::int)::text, 2, '0'));
  INSERT INTO public.household_join_codes (code, household_id, expires_at, created_by)
    VALUES (code, _household_id, expires, auth.uid());
  RETURN code;
END; 
$$ SECURITY DEFINER;

-- Phase 2: Function to redeem/join a household with code
CREATE OR REPLACE FUNCTION public.join_household_with_code(_code text, _name text, _avatar_selection text, _device_id text)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
  code_row RECORD;
  child_id UUID := gen_random_uuid();
BEGIN
  SELECT * INTO code_row
    FROM public.household_join_codes
    WHERE code = _code AND expires_at > now() AND used_at IS NULL
    LIMIT 1;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid or expired code';
  END IF;

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


-- Allow function execution for joining for unauthenticated clients (children joining for the first time)
GRANT EXECUTE ON FUNCTION public.join_household_with_code(text, text, text, text) TO anon, authenticated;

-- Cleanup: advice/reminder to remove pin logic/code from app after code changes

