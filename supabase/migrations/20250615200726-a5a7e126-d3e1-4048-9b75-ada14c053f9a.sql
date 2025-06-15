
-- 1. Create a new table for child pins (simple 4-digit PIN, unique per household, no expiration)
CREATE TABLE IF NOT EXISTS public.child_pins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pin TEXT NOT NULL,
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  used_by_profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  used_at TIMESTAMPTZ
);

-- 2. Enforce uniqueness: only one active (unused) PIN per value/household
CREATE UNIQUE INDEX IF NOT EXISTS unique_active_pin_per_household 
  ON public.child_pins(pin, household_id) 
  WHERE used_at IS NULL;

-- 3. Enable RLS for secure access - only let admins generate pins
ALTER TABLE public.child_pins ENABLE ROW LEVEL SECURITY;

-- Allow owner/admin to view/generate pins for their household
CREATE POLICY "Admins can view pins for their household"
  ON public.child_pins
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM household_members
      WHERE household_members.household_id = child_pins.household_id
        AND household_members.user_id = auth.uid()
        AND household_members.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Admins can insert pins for their household"
  ON public.child_pins
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM household_members
      WHERE household_members.household_id = child_pins.household_id
        AND household_members.user_id = auth.uid()
        AND household_members.role IN ('owner', 'admin')
    )
  );

-- Mark pin as used (for future, not enforced for now)
CREATE POLICY "Mark pin used if not already used"
  ON public.child_pins
  FOR UPDATE
  USING (
    used_at IS NULL
    AND EXISTS (
      SELECT 1 FROM household_members
      WHERE household_members.household_id = child_pins.household_id
        AND household_members.user_id = auth.uid()
        AND household_members.role IN ('owner', 'admin')
    )
  );

-- Allow delete by owner
CREATE POLICY "Allow delete by owner"
  ON public.child_pins
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM household_members
      WHERE household_members.household_id = child_pins.household_id
        AND household_members.user_id = auth.uid()
        AND household_members.role IN ('owner', 'admin')
    )
  );

-- 4. Create a function to generate a unique 4-digit PIN for a household
CREATE OR REPLACE FUNCTION public.generate_child_pin(_household_id uuid)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  pin TEXT;
  tries INT := 0;
BEGIN
  LOOP
    tries := tries + 1;
    -- Generate random 4-digit PIN between 1000 and 9999
    pin := lpad((floor(random() * 9000) + 1000)::text, 4, '0');
    -- Make sure this PIN is not already active for this household
    IF NOT EXISTS (
      SELECT 1 FROM public.child_pins 
      WHERE pin = pin AND household_id = _household_id AND used_at IS NULL
    ) THEN
      EXIT;
    END IF;
    IF tries > 100 THEN
      RAISE EXCEPTION 'Could not generate unique PIN after 100 tries';
    END IF;
  END LOOP;
  INSERT INTO public.child_pins (pin, household_id, created_by) VALUES (pin, _household_id, auth.uid());
  RETURN pin;
END;
$$ SECURITY DEFINER;

-- 5. Create a function to let a child join a household using a PIN
CREATE OR REPLACE FUNCTION public.join_household_with_pin(_pin text, _name text, _avatar_selection text, _device_id text)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
  pin_row RECORD;
  child_id UUID := gen_random_uuid();
BEGIN
  -- Bypass RLS for pin lookup, so anonymous clients can join
  EXECUTE 'SET LOCAL row_security = off';

  SELECT * INTO pin_row
    FROM public.child_pins
    WHERE pin = _pin AND used_at IS NULL
    LIMIT 1;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid or already used PIN';
  END IF;

  -- Mark the PIN as used
  UPDATE public.child_pins
    SET used_at = now(), used_by_profile_id = child_id
    WHERE id = pin_row.id;

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
    pin_row.household_id, child_id, 'member'
  );

  RETURN child_id;
END;
$$ SECURITY DEFINER;

-- Allow function execution for anon clients
GRANT EXECUTE ON FUNCTION public.join_household_with_pin(text, text, text, text) TO anon, authenticated;
