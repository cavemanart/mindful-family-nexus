
-- Update RLS policies for child_points to allow point operations when completing chores

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Parents can update child points" ON public.child_points;
DROP POLICY IF EXISTS "Parents can insert child points" ON public.child_points;

-- Create new policies that allow household members to manage points for children in their household
CREATE POLICY "Household members can update child points" ON public.child_points
  FOR UPDATE USING (
    public.is_household_member(household_id) AND
    (
      -- Allow parents/admins to update any child points in their household
      public.is_household_owner_or_admin(household_id) OR
      -- Allow the child to update their own points (for chore completion)
      child_id = auth.uid()
    )
  );

CREATE POLICY "Household members can insert child points" ON public.child_points
  FOR INSERT WITH CHECK (
    public.is_household_member(household_id) AND
    (
      -- Allow parents/admins to create child points
      public.is_household_owner_or_admin(household_id) OR
      -- Allow system operations for chore completion
      child_id = auth.uid()
    )
  );

-- Also update point transactions to allow children to create transactions when completing chores
DROP POLICY IF EXISTS "System can insert transactions" ON public.point_transactions;

CREATE POLICY "Household members can insert transactions" ON public.point_transactions
  FOR INSERT WITH CHECK (
    public.is_household_member(household_id) AND
    (
      -- Allow parents/admins to create transactions
      public.is_household_owner_or_admin(household_id) OR
      -- Allow children to create transactions for their own points
      child_id = auth.uid()
    )
  );
