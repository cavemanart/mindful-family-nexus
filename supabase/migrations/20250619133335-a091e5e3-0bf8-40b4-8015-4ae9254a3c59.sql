
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view profiles of household members" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Household admins can update member profiles" ON public.profiles;

-- Create RLS policies for household_members table
CREATE POLICY "Users can view household members of their households" 
ON public.household_members 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.household_members hm2 
    WHERE hm2.household_id = household_members.household_id 
    AND hm2.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert household members if they're admin/owner" 
ON public.household_members 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.household_members hm 
    WHERE hm.household_id = household_members.household_id 
    AND hm.user_id = auth.uid() 
    AND hm.role IN ('admin', 'owner')
  )
);

CREATE POLICY "Users can update household members if they're admin/owner" 
ON public.household_members 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.household_members hm 
    WHERE hm.household_id = household_members.household_id 
    AND hm.user_id = auth.uid() 
    AND hm.role IN ('admin', 'owner')
  )
);

CREATE POLICY "Users can delete household members if they're admin/owner" 
ON public.household_members 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.household_members hm 
    WHERE hm.household_id = household_members.household_id 
    AND hm.user_id = auth.uid() 
    AND hm.role IN ('admin', 'owner')
  )
);

-- Create RLS policies for profiles table
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can view profiles of household members" 
ON public.profiles 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.household_members hm1
    JOIN public.household_members hm2 ON hm1.household_id = hm2.household_id
    WHERE hm1.user_id = auth.uid() 
    AND hm2.user_id = profiles.id
  )
);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Household admins can update member profiles" 
ON public.profiles 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.household_members hm1
    JOIN public.household_members hm2 ON hm1.household_id = hm2.household_id
    WHERE hm1.user_id = auth.uid() 
    AND hm1.role IN ('admin', 'owner')
    AND hm2.user_id = profiles.id
  )
);
