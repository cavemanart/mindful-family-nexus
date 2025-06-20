
-- Add ownership and visibility columns to existing tables
ALTER TABLE public.weekly_goals 
ADD COLUMN created_by uuid REFERENCES auth.users(id),
ADD COLUMN created_by_name text,
ADD COLUMN is_shared_with_family boolean DEFAULT true,
ADD COLUMN is_assigned_by_parent boolean DEFAULT false;

ALTER TABLE public.chores 
ADD COLUMN created_by uuid REFERENCES auth.users(id),
ADD COLUMN created_by_name text,
ADD COLUMN is_shared_with_family boolean DEFAULT true,
ADD COLUMN is_assigned_by_parent boolean DEFAULT false;

-- Update existing records to have reasonable defaults
UPDATE public.weekly_goals 
SET created_by_name = 'Parent', 
    is_assigned_by_parent = true 
WHERE created_by_name IS NULL;

UPDATE public.chores 
SET created_by_name = 'Parent', 
    is_assigned_by_parent = true 
WHERE created_by_name IS NULL;

-- Create a new table for personal goals that kids can create
CREATE TABLE public.personal_goals (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text NOT NULL,
  created_by uuid NOT NULL REFERENCES auth.users(id),
  created_by_name text NOT NULL,
  household_id uuid NOT NULL,
  completed boolean NOT NULL DEFAULT false,
  is_shared_with_family boolean NOT NULL DEFAULT false,
  target_date date,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS for personal goals
ALTER TABLE public.personal_goals ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for personal goals
CREATE POLICY "users_can_view_personal_goals" 
ON public.personal_goals 
FOR SELECT 
USING (
  created_by = auth.uid() OR 
  (is_shared_with_family = true AND public.check_household_membership(household_id, auth.uid()))
);

CREATE POLICY "users_can_create_personal_goals" 
ON public.personal_goals 
FOR INSERT 
WITH CHECK (created_by = auth.uid() AND public.check_household_membership(household_id, auth.uid()));

CREATE POLICY "users_can_update_own_personal_goals" 
ON public.personal_goals 
FOR UPDATE 
USING (created_by = auth.uid());

CREATE POLICY "users_can_delete_own_personal_goals" 
ON public.personal_goals 
FOR DELETE 
USING (created_by = auth.uid());

-- Add updated_at trigger for personal_goals
CREATE TRIGGER update_personal_goals_updated_at 
  BEFORE UPDATE ON public.personal_goals 
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_updated_at_column();
