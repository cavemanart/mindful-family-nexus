
-- Add RLS policy to allow users to view their own notification preferences
CREATE POLICY "Users can view their own notification preferences"
  ON public.notification_preferences
  FOR SELECT
  USING (user_id = auth.uid());

-- The insert, update, and delete policies already exist from the migration
-- Let's verify they're working correctly by recreating them with proper names

-- Drop existing policies if they exist and recreate with clear names
DROP POLICY IF EXISTS "User can insert their own preferences" ON public.notification_preferences;
DROP POLICY IF EXISTS "User can update their own preferences" ON public.notification_preferences;
DROP POLICY IF EXISTS "User can delete their own preferences" ON public.notification_preferences;

-- Create comprehensive RLS policies
CREATE POLICY "Users can insert their own notification preferences"
  ON public.notification_preferences
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own notification preferences"
  ON public.notification_preferences
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own notification preferences"
  ON public.notification_preferences
  FOR DELETE
  USING (user_id = auth.uid());
