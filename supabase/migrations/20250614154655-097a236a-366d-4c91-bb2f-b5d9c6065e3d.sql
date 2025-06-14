
-- Add Row Level Security policies for appreciation_comments table
ALTER TABLE public.appreciation_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view comments in their household" 
ON public.appreciation_comments 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.household_members 
    WHERE household_id = appreciation_comments.household_id 
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert comments in their household" 
ON public.appreciation_comments 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.household_members 
    WHERE household_id = appreciation_comments.household_id 
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own comments" 
ON public.appreciation_comments 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.household_members hm
    JOIN public.profiles p ON p.id = hm.user_id
    WHERE hm.household_id = appreciation_comments.household_id 
    AND hm.user_id = auth.uid()
    AND CONCAT(p.first_name, ' ', p.last_name) = appreciation_comments.commenter_name
  )
);

CREATE POLICY "Users can delete their own comments" 
ON public.appreciation_comments 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.household_members hm
    JOIN public.profiles p ON p.id = hm.user_id
    WHERE hm.household_id = appreciation_comments.household_id 
    AND hm.user_id = auth.uid()
    AND CONCAT(p.first_name, ' ', p.last_name) = appreciation_comments.commenter_name
  )
);

-- Add Row Level Security policies for appreciation_reactions table
ALTER TABLE public.appreciation_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view reactions in their household" 
ON public.appreciation_reactions 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.household_members 
    WHERE household_id = appreciation_reactions.household_id 
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert reactions in their household" 
ON public.appreciation_reactions 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.household_members 
    WHERE household_id = appreciation_reactions.household_id 
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their own reactions" 
ON public.appreciation_reactions 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.household_members hm
    JOIN public.profiles p ON p.id = hm.user_id
    WHERE hm.household_id = appreciation_reactions.household_id 
    AND hm.user_id = auth.uid()
    AND CONCAT(p.first_name, ' ', p.last_name) = appreciation_reactions.reactor_name
  )
);

-- Remove the unused reactions column from appreciations table
ALTER TABLE public.appreciations DROP COLUMN IF EXISTS reactions;

-- Add user_id columns to track actual users instead of names
ALTER TABLE public.appreciations 
ADD COLUMN IF NOT EXISTS from_user_id uuid REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS to_user_id uuid REFERENCES public.profiles(id);

ALTER TABLE public.appreciation_comments 
ADD COLUMN IF NOT EXISTS commenter_user_id uuid REFERENCES public.profiles(id);

ALTER TABLE public.appreciation_reactions 
ADD COLUMN IF NOT EXISTS reactor_user_id uuid REFERENCES public.profiles(id);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_appreciations_household_id ON public.appreciations(household_id);
CREATE INDEX IF NOT EXISTS idx_appreciations_from_user_id ON public.appreciations(from_user_id);
CREATE INDEX IF NOT EXISTS idx_appreciations_to_user_id ON public.appreciations(to_user_id);
CREATE INDEX IF NOT EXISTS idx_appreciation_comments_appreciation_id ON public.appreciation_comments(appreciation_id);
CREATE INDEX IF NOT EXISTS idx_appreciation_reactions_appreciation_id ON public.appreciation_reactions(appreciation_id);

-- Enable realtime for live updates
ALTER TABLE public.appreciations REPLICA IDENTITY FULL;
ALTER TABLE public.appreciation_comments REPLICA IDENTITY FULL;
ALTER TABLE public.appreciation_reactions REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.appreciations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.appreciation_comments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.appreciation_reactions;
