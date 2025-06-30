
-- Create mini_coach_moments table to store AI-generated coaching insights
CREATE TABLE public.mini_coach_moments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  household_id UUID NOT NULL,
  content TEXT NOT NULL,
  coaching_type TEXT NOT NULL DEFAULT 'general', -- 'motivation', 'achievement', 'improvement', 'celebration'
  generated_for_week DATE NOT NULL, -- The week this coaching is for
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '2 weeks') -- Auto-expire old moments
);

-- Add RLS policies
ALTER TABLE public.mini_coach_moments ENABLE ROW LEVEL SECURITY;

-- Users can only see coaching moments for their household
CREATE POLICY "Users can view coaching moments for their household" 
  ON public.mini_coach_moments 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.household_members hm 
      WHERE hm.household_id = mini_coach_moments.household_id 
      AND hm.user_id = auth.uid()
    )
  );

-- Users can mark coaching moments as read in their household
CREATE POLICY "Users can update coaching moments in their household" 
  ON public.mini_coach_moments 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.household_members hm 
      WHERE hm.household_id = mini_coach_moments.household_id 
      AND hm.user_id = auth.uid()
    )
  );

-- Create indexes for better performance (without problematic predicate)
CREATE INDEX idx_mini_coach_moments_household_week ON public.mini_coach_moments(household_id, generated_for_week);
CREATE INDEX idx_mini_coach_moments_expires ON public.mini_coach_moments(expires_at);

-- Function to clean up expired coaching moments
CREATE OR REPLACE FUNCTION public.cleanup_expired_coaching_moments()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count INTEGER := 0;
BEGIN
  DELETE FROM public.mini_coach_moments 
  WHERE expires_at < now();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;
