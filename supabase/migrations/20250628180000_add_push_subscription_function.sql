
-- Create a function to handle push subscription upserts
CREATE OR REPLACE FUNCTION public.upsert_push_subscription(
  p_user_id UUID,
  p_endpoint TEXT,
  p_p256dh_key TEXT,
  p_auth_key TEXT
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  subscription_id UUID;
BEGIN
  INSERT INTO public.push_subscriptions (
    user_id, endpoint, p256dh_key, auth_key, is_active
  ) VALUES (
    p_user_id, p_endpoint, p_p256dh_key, p_auth_key, true
  )
  ON CONFLICT (user_id, endpoint) 
  DO UPDATE SET 
    p256dh_key = EXCLUDED.p256dh_key,
    auth_key = EXCLUDED.auth_key,
    is_active = EXCLUDED.is_active,
    updated_at = now()
  RETURNING id INTO subscription_id;
  
  RETURN subscription_id;
END;
$$;
