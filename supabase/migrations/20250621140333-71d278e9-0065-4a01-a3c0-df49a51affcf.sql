
-- Add household_id to user_subscriptions table to link subscriptions to households
ALTER TABLE public.user_subscriptions 
ADD COLUMN household_id UUID REFERENCES public.households(id) ON DELETE CASCADE;

-- Create index for better performance when querying household subscriptions
CREATE INDEX idx_user_subscriptions_household_id ON public.user_subscriptions(household_id);

-- Update existing subscriptions to link them to households (for users who already have subscriptions)
UPDATE public.user_subscriptions 
SET household_id = (
  SELECT hm.household_id 
  FROM public.household_members hm 
  WHERE hm.user_id = user_subscriptions.user_id 
  LIMIT 1
)
WHERE household_id IS NULL;

-- Create a function to get household subscription status
CREATE OR REPLACE FUNCTION public.get_household_subscription_status(p_household_id uuid)
RETURNS TABLE(
  has_subscription boolean,
  plan_type text,
  is_trial_active boolean,
  subscription_end_date timestamptz,
  owner_user_id uuid
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(us.is_active, false) as has_subscription,
    COALESCE(us.plan_type, 'free') as plan_type,
    CASE 
      WHEN us.trial_end_date IS NOT NULL AND us.trial_end_date > now() THEN true
      ELSE false
    END as is_trial_active,
    us.subscription_end_date,
    us.user_id as owner_user_id
  FROM public.user_subscriptions us
  WHERE us.household_id = p_household_id 
    AND us.is_active = true
    AND (us.plan_type = 'pro' OR us.plan_type = 'pro_annual' OR us.trial_end_date > now())
  ORDER BY 
    CASE 
      WHEN us.plan_type IN ('pro', 'pro_annual') THEN 1
      ELSE 2
    END,
    us.created_at DESC
  LIMIT 1;
  
  -- If no active subscription found, return default free values
  IF NOT FOUND THEN
    RETURN QUERY
    SELECT 
      false as has_subscription,
      'free'::text as plan_type,
      false as is_trial_active,
      null::timestamptz as subscription_end_date,
      null::uuid as owner_user_id;
  END IF;
END;
$$;

-- Create a function to check if user can manage household subscription
CREATE OR REPLACE FUNCTION public.can_manage_household_subscription(p_user_id uuid, p_household_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $$
BEGIN
  -- Check if user is household owner
  RETURN EXISTS (
    SELECT 1 
    FROM public.household_members hm
    WHERE hm.user_id = p_user_id 
      AND hm.household_id = p_household_id 
      AND hm.role = 'owner'
  );
END;
$$;
