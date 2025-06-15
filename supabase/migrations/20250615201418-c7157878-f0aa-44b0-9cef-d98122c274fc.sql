
-- Fully re-define generate_child_pin to guarantee all columns are fully qualified and remove all ambiguity

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
    -- Ensure this PIN is not already active for this household (fully qualify columns)
    IF NOT EXISTS (
      SELECT 1 FROM public.child_pins 
      WHERE public.child_pins.pin = pin 
        AND public.child_pins.household_id = _household_id 
        AND public.child_pins.used_at IS NULL
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
