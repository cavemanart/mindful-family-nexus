
-- Create the MVP of the Day table
CREATE TABLE public.mvp_nominations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  household_id UUID NOT NULL,
  nominated_by TEXT NOT NULL,
  nominated_for TEXT NOT NULL,
  reason TEXT NOT NULL,
  emoji TEXT DEFAULT '🏆',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  nomination_date DATE NOT NULL DEFAULT CURRENT_DATE,
  nominated_by_user_id UUID,
  nominated_for_user_id UUID
);

-- Add unique constraint to ensure one nomination per user per day
ALTER TABLE public.mvp_nominations 
ADD CONSTRAINT unique_daily_nomination 
UNIQUE (household_id, nominated_by_user_id, nomination_date);

-- Enable RLS
ALTER TABLE public.mvp_nominations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for MVP nominations
CREATE POLICY "Users can view MVP nominations in their household" 
  ON public.mvp_nominations 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.household_members 
      WHERE household_id = mvp_nominations.household_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create MVP nominations in their household" 
  ON public.mvp_nominations 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.household_members 
      WHERE household_id = mvp_nominations.household_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own MVP nominations" 
  ON public.mvp_nominations 
  FOR UPDATE 
  USING (nominated_by_user_id = auth.uid());

CREATE POLICY "Users can delete their own MVP nominations" 
  ON public.mvp_nominations 
  FOR DELETE 
  USING (nominated_by_user_id = auth.uid());

-- Drop old appreciation tables and related data
DROP TABLE IF EXISTS public.appreciation_comments CASCADE;
DROP TABLE IF EXISTS public.appreciation_reactions CASCADE;
DROP TABLE IF EXISTS public.appreciations CASCADE;

-- Add index for better performance on date-based queries
CREATE INDEX idx_mvp_nominations_date_household 
ON public.mvp_nominations(household_id, nomination_date DESC);
