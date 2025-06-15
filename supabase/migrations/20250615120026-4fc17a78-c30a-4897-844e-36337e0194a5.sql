
DO $$
DECLARE
  profile_id UUID;
BEGIN
  SELECT id INTO profile_id FROM public.profiles WHERE email = 'test3@email.com';

  IF profile_id IS NULL THEN
    RAISE NOTICE 'User not found for email: test3@email.com';
  ELSE
    IF EXISTS (
      SELECT 1 FROM public.user_subscriptions WHERE user_id = profile_id
    ) THEN
      UPDATE public.user_subscriptions
      SET
        plan_type = 'pro_annual',
        is_active = true,
        subscription_start_date = now(),
        subscription_end_date = (now() + interval '1 year'),
        updated_at = now()
      WHERE user_id = profile_id;
    ELSE
      INSERT INTO public.user_subscriptions (
        user_id, plan_type, is_active, subscription_start_date, subscription_end_date, created_at, updated_at
      )
      VALUES (
        profile_id, 'pro_annual', true, now(), (now() + interval '1 year'), now(), now()
      );
    END IF;
  END IF;
END $$;

