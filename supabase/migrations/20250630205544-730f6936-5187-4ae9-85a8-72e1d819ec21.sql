
-- Update the mini_coach_moments table to support daily generation
ALTER TABLE public.mini_coach_moments 
ADD COLUMN generated_for_date DATE DEFAULT CURRENT_DATE,
ADD COLUMN is_daily_auto BOOLEAN DEFAULT false;

-- Update the index to use date instead of week
DROP INDEX IF EXISTS idx_mini_coach_moments_household_week;
CREATE INDEX idx_mini_coach_moments_household_date ON public.mini_coach_moments(household_id, generated_for_date);

-- Update the cleanup function to delete moments older than 24 hours
CREATE OR REPLACE FUNCTION public.cleanup_expired_coaching_moments()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count INTEGER := 0;
BEGIN
  -- Delete moments older than 24 hours (daily cleanup)
  DELETE FROM public.mini_coach_moments 
  WHERE created_at < now() - interval '24 hours';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- Create function to generate daily coaching moment
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
  
  -- Insert a daily coaching moment (this will be enhanced by the edge function)
  INSERT INTO public.mini_coach_moments (
    household_id,
    content,
    coaching_type,
    generated_for_date,
    is_daily_auto,
    expires_at
  ) VALUES (
    p_household_id,
    '🌟 Ready to make today amazing! Every small step forward is progress worth celebrating.',
    'motivation',
    today_date,
    true,
    now() + interval '24 hours'
  );
END;
$$;
