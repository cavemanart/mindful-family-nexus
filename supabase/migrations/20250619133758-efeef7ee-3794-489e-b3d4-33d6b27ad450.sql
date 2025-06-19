
-- Drop the problematic policies that cause infinite recursion
DROP POLICY IF EXISTS "Users can view household members of their households" ON public.household_members;
DROP POLICY IF EXISTS "Users can insert household members if they're admin/owner" ON public.household_members;
DROP POLICY IF EXISTS "Users can update household members if they're admin/owner" ON public.household_members;
DROP POLICY IF EXISTS "Users can delete household members if they're admin/owner" ON public.household_members;

-- Create security definer functions to avoid recursion
CREATE OR REPLACE FUNCTION public.is_user_household_member(target_household_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.household_members 
    WHERE household_id = target_household_id 
    AND user_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.is_user_household_admin(target_household_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.household_members 
    WHERE household_id = target_household_id 
    AND user_id = auth.uid() 
    AND role IN ('admin', 'owner')
  );
$$;

-- Create new RLS policies using the security definer functions
CREATE POLICY "Users can view household members of their households" 
ON public.household_members 
FOR SELECT 
USING (public.is_user_household_member(household_id));

CREATE POLICY "Users can insert household members if they're admin/owner" 
ON public.household_members 
FOR INSERT 
WITH CHECK (public.is_user_household_admin(household_id));

CREATE POLICY "Users can update household members if they're admin/owner" 
ON public.household_members 
FOR UPDATE 
USING (public.is_user_household_admin(household_id));

CREATE POLICY "Users can delete household members if they're admin/owner" 
ON public.household_members 
FOR DELETE 
USING (public.is_user_household_admin(household_id));

-- Also fix the profiles policies to use security definer functions
DROP POLICY IF EXISTS "Users can view profiles of household members" ON public.profiles;
DROP POLICY IF EXISTS "Household admins can update member profiles" ON public.profiles;

CREATE OR REPLACE FUNCTION public.can_user_view_profile(target_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.household_members hm1
    JOIN public.household_members hm2 ON hm1.household_id = hm2.household_id
    WHERE hm1.user_id = auth.uid() 
    AND hm2.user_id = target_user_id
  ) OR target_user_id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.can_user_admin_profile(target_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.household_members hm1
    JOIN public.household_members hm2 ON hm1.household_id = hm2.household_id
    WHERE hm1.user_id = auth.uid() 
    AND hm1.role IN ('admin', 'owner')
    AND hm2.user_id = target_user_id
  ) OR target_user_id = auth.uid();
$$;

CREATE POLICY "Users can view profiles of household members" 
ON public.profiles 
FOR SELECT 
USING (public.can_user_view_profile(id));

CREATE POLICY "Household admins can update member profiles" 
ON public.profiles 
FOR UPDATE 
USING (public.can_user_admin_profile(id));
