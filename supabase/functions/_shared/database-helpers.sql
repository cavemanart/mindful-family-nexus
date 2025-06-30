
-- Function to get households with active subscriptions for cron processing
CREATE OR REPLACE FUNCTION public.get_households_with_active_subscriptions()
RETURNS TABLE(id uuid, name text)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT h.id, h.name
  FROM public.households h
  JOIN public.user_subscriptions us ON us.household_id = h.id
  WHERE us.is_active = true 
    AND (
      us.plan_type IN ('pro', 'pro_annual') 
      OR (us.trial_end_date IS NOT NULL AND us.trial_end_date > now())
    );
END;
$$;
