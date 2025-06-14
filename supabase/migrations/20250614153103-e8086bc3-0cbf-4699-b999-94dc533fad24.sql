
-- First, drop the specific policy that depends on the archived column
DROP POLICY IF EXISTS "Users can view non-archived appreciations in their household" ON public.appreciations;

-- Drop any other existing policies to ensure clean state
DROP POLICY IF EXISTS "Users can view appreciations in their household" ON public.appreciations;
DROP POLICY IF EXISTS "Users can insert appreciations in their household" ON public.appreciations;
DROP POLICY IF EXISTS "Users can update their own appreciations" ON public.appreciations;
DROP POLICY IF EXISTS "Users can delete their own appreciations" ON public.appreciations;

-- Remove the unused archive_old_appreciations function
DROP FUNCTION IF EXISTS public.archive_old_appreciations();

-- Remove the archived and archived_at columns from appreciations table using CASCADE
ALTER TABLE public.appreciations 
DROP COLUMN IF EXISTS archived CASCADE,
DROP COLUMN IF EXISTS archived_at CASCADE;

-- Create a new RLS policy for viewing appreciations without archive filtering
CREATE POLICY "Users can view appreciations in their household" 
ON public.appreciations 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.household_members 
    WHERE household_id = appreciations.household_id 
    AND user_id = auth.uid()
  )
);

-- Create policy for inserting appreciations
CREATE POLICY "Users can insert appreciations in their household" 
ON public.appreciations 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.household_members 
    WHERE household_id = appreciations.household_id 
    AND user_id = auth.uid()
  )
);

-- Create policy for updating appreciations (only own appreciations)
CREATE POLICY "Users can update their own appreciations" 
ON public.appreciations 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.household_members hm
    JOIN public.profiles p ON p.id = hm.user_id
    WHERE hm.household_id = appreciations.household_id 
    AND hm.user_id = auth.uid()
    AND CONCAT(p.first_name, ' ', p.last_name) = appreciations.from_member
  )
);

-- Create policy for deleting appreciations (only own appreciations)
CREATE POLICY "Users can delete their own appreciations" 
ON public.appreciations 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.household_members hm
    JOIN public.profiles p ON p.id = hm.user_id
    WHERE hm.household_id = appreciations.household_id 
    AND hm.user_id = auth.uid()
    AND CONCAT(p.first_name, ' ', p.last_name) = appreciations.from_member
  )
);

-- Enable RLS on the table
ALTER TABLE public.appreciations ENABLE ROW LEVEL SECURITY;
