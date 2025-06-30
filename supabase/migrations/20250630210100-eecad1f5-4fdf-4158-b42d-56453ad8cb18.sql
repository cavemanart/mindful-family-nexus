
-- Fix the schema issue by making generated_for_week nullable and providing a default value for existing functionality
ALTER TABLE public.mini_coach_moments 
ALTER COLUMN generated_for_week DROP NOT NULL;

-- Update the generate_daily_coaching_moment function to handle the schema properly
CREATE OR REPLACE FUNCTION public.generate_daily_coaching_moment(p_household_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  today_date DATE := CURRENT_DATE;
BEGIN
  -- Check if a daily moment already exists for today
  IF EXISTS (
    SELECT 1 FROM public.mini_coach_moments 
    WHERE household_id = p_household_id 
    AND generated_for_date = today_date 
    AND is_daily_auto = true
  ) THEN
    RETURN; -- Already generated for today
  END IF;
  
  -- Insert a daily coaching moment with proper schema handling
  INSERT INTO public.mini_coach_moments (
    household_id,
    content,
    coaching_type,
    generated_for_date,
    generated_for_week,
    is_daily_auto,
    expires_at
  ) VALUES (
    p_household_id,
    '🌟 Ready to make today amazing! Every small step forward is progress worth celebrating.',
    'motivation',
    today_date,
    NULL, -- Weekly generation not used for daily auto-generated moments
    true,
    now() + interval '24 hours'
  );
END;
$$;
