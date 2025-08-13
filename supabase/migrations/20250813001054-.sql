-- Create the missing households table
CREATE TABLE public.households (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  invite_code TEXT NOT NULL DEFAULT 'temp-' || gen_random_uuid()::text,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_id UUID NOT NULL
);

-- Enable RLS on households
ALTER TABLE public.households ENABLE ROW LEVEL SECURITY;

-- Add foreign key constraint from household_members to households
ALTER TABLE public.household_members 
ADD CONSTRAINT household_members_household_id_fkey 
FOREIGN KEY (household_id) REFERENCES public.households(id) ON DELETE CASCADE;

-- Create RLS policies for households table
CREATE POLICY "Users can view households they are members of" 
ON public.households 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.household_members 
    WHERE household_id = households.id AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can create households" 
ON public.households 
FOR INSERT 
WITH CHECK (created_by = auth.uid());

CREATE POLICY "Household owners can update households" 
ON public.households 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.household_members 
    WHERE household_id = households.id 
    AND user_id = auth.uid() 
    AND role IN ('owner', 'admin')
  )
);

CREATE POLICY "Household owners can delete households" 
ON public.households 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.household_members 
    WHERE household_id = households.id 
    AND user_id = auth.uid() 
    AND role = 'owner'
  )
);

-- Add trigger for updated_at
CREATE TRIGGER update_households_updated_at
BEFORE UPDATE ON public.households
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();