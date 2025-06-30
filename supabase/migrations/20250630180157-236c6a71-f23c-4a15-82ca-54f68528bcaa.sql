
-- Add recurrence columns to chores table
ALTER TABLE public.chores 
ADD COLUMN recurrence_type text DEFAULT 'once',
ADD COLUMN recurrence_interval integer DEFAULT 1;

-- Update existing chores to have default recurrence values
UPDATE public.chores 
SET recurrence_type = 'once', recurrence_interval = 1 
WHERE recurrence_type IS NULL OR recurrence_interval IS NULL;
