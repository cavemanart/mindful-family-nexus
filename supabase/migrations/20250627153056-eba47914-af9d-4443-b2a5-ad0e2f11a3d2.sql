
-- Add columns to user_subscriptions table for refund tracking
ALTER TABLE public.user_subscriptions 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active',
ADD COLUMN IF NOT EXISTS refunded_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS refund_id TEXT,
ADD COLUMN IF NOT EXISTS canceled_at TIMESTAMPTZ;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON public.user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_refund_id ON public.user_subscriptions(refund_id);
