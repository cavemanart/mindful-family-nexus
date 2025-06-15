
-- Step 1: Remove duplicate user_subscriptions, keeping only the latest active paid plan if it exists.
-- We'll use a CTE to find the "record to keep" for each user, then delete the rest.

WITH ranked_subs AS (
  SELECT
    id,
    user_id,
    plan_type,
    is_active,
    subscription_end_date,
    ROW_NUMBER() OVER (
      PARTITION BY user_id
      ORDER BY 
        -- Prioritize paid plans
        (CASE 
          WHEN plan_type = 'pro_annual' AND is_active THEN 1
          WHEN plan_type = 'pro' AND is_active THEN 2
          ELSE 3 
        END),
        -- More recent subscriptions take precedence
        subscription_end_date DESC NULLS LAST,
        updated_at DESC
    ) AS rn
  FROM user_subscriptions
),
to_delete AS (
  SELECT id FROM ranked_subs WHERE rn > 1
)
DELETE FROM user_subscriptions WHERE id IN (SELECT id FROM to_delete);


-- Step 2: Add a unique constraint on user_id in user_subscriptions
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes WHERE tablename = 'user_subscriptions' AND indexname = 'user_subscriptions_user_id_key'
    ) THEN
        ALTER TABLE user_subscriptions ADD CONSTRAINT user_subscriptions_user_id_key UNIQUE (user_id);
    END IF;
END $$;

