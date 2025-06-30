
-- Create child_points table to track total points per child
CREATE TABLE public.child_points (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id uuid NOT NULL,
  household_id uuid NOT NULL,
  total_points integer NOT NULL DEFAULT 0,
  level integer NOT NULL DEFAULT 1,
  streak_days integer NOT NULL DEFAULT 0,
  last_activity_date date,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create chore_submissions table for approval workflow
CREATE TABLE public.chore_submissions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chore_id uuid NOT NULL,
  child_id uuid NOT NULL,
  household_id uuid NOT NULL,
  submission_note text,
  status text NOT NULL DEFAULT 'pending',
  submitted_at timestamp with time zone NOT NULL DEFAULT now(),
  approved_by uuid,
  approved_at timestamp with time zone,
  rejection_reason text,
  points_awarded integer DEFAULT 0
);

-- Create rewards_catalog table
CREATE TABLE public.rewards_catalog (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  household_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  point_cost integer NOT NULL,
  category text NOT NULL DEFAULT 'experience',
  is_active boolean NOT NULL DEFAULT true,
  age_restriction text,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create point_transactions table to log all point changes
CREATE TABLE public.point_transactions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id uuid NOT NULL,
  household_id uuid NOT NULL,
  transaction_type text NOT NULL,
  points_change integer NOT NULL,
  description text NOT NULL,
  related_chore_id uuid,
  related_reward_id uuid,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create family_challenges table for team challenges
CREATE TABLE public.family_challenges (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  household_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  target_points integer NOT NULL,
  current_points integer NOT NULL DEFAULT 0,
  start_date date NOT NULL,
  end_date date NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  reward_description text,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create point_goals table for daily/weekly goals
CREATE TABLE public.point_goals (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id uuid NOT NULL,
  household_id uuid NOT NULL,
  goal_type text NOT NULL,
  target_points integer NOT NULL,
  current_points integer NOT NULL DEFAULT 0,
  goal_date date NOT NULL,
  is_completed boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create reward_redemptions table to track when kids redeem rewards
CREATE TABLE public.reward_redemptions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id uuid NOT NULL,
  household_id uuid NOT NULL,
  reward_id uuid NOT NULL,
  points_spent integer NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  redeemed_at timestamp with time zone NOT NULL DEFAULT now(),
  fulfilled_by uuid,
  fulfilled_at timestamp with time zone
);

-- Add new columns to existing chores table
ALTER TABLE public.chores 
ADD COLUMN requires_approval boolean DEFAULT true,
ADD COLUMN approval_status text DEFAULT 'pending',
ADD COLUMN approved_by uuid,
ADD COLUMN approved_at timestamp with time zone,
ADD COLUMN submission_id uuid;

-- Enable RLS on new tables
ALTER TABLE public.child_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chore_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rewards_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.point_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.point_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reward_redemptions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for child_points
CREATE POLICY "Household members can view child points" ON public.child_points
  FOR SELECT USING (public.is_household_member(household_id));

CREATE POLICY "Parents can update child points" ON public.child_points
  FOR UPDATE USING (public.is_household_owner_or_admin(household_id));

CREATE POLICY "Parents can insert child points" ON public.child_points
  FOR INSERT WITH CHECK (public.is_household_owner_or_admin(household_id));

-- Create RLS policies for chore_submissions
CREATE POLICY "Household members can view chore submissions" ON public.chore_submissions
  FOR SELECT USING (public.is_household_member(household_id));

CREATE POLICY "Children can create submissions" ON public.chore_submissions
  FOR INSERT WITH CHECK (public.is_household_member(household_id));

CREATE POLICY "Parents can update submissions" ON public.chore_submissions
  FOR UPDATE USING (public.is_household_owner_or_admin(household_id));

-- Create RLS policies for rewards_catalog
CREATE POLICY "Household members can view rewards" ON public.rewards_catalog
  FOR SELECT USING (public.is_household_member(household_id));

CREATE POLICY "Parents can manage rewards" ON public.rewards_catalog
  FOR ALL USING (public.is_household_owner_or_admin(household_id));

-- Create RLS policies for point_transactions
CREATE POLICY "Household members can view transactions" ON public.point_transactions
  FOR SELECT USING (public.is_household_member(household_id));

CREATE POLICY "System can insert transactions" ON public.point_transactions
  FOR INSERT WITH CHECK (public.is_household_member(household_id));

-- Create RLS policies for family_challenges
CREATE POLICY "Household members can view challenges" ON public.family_challenges
  FOR SELECT USING (public.is_household_member(household_id));

CREATE POLICY "Parents can manage challenges" ON public.family_challenges
  FOR ALL USING (public.is_household_owner_or_admin(household_id));

-- Create RLS policies for point_goals
CREATE POLICY "Household members can view goals" ON public.point_goals
  FOR SELECT USING (public.is_household_member(household_id));

CREATE POLICY "Children can view their goals" ON public.point_goals
  FOR SELECT USING (child_id = auth.uid());

CREATE POLICY "Parents can manage goals" ON public.point_goals
  FOR ALL USING (public.is_household_owner_or_admin(household_id));

-- Create RLS policies for reward_redemptions
CREATE POLICY "Household members can view redemptions" ON public.reward_redemptions
  FOR SELECT USING (public.is_household_member(household_id));

CREATE POLICY "Children can create redemptions" ON public.reward_redemptions
  FOR INSERT WITH CHECK (public.is_household_member(household_id) AND child_id = auth.uid());

CREATE POLICY "Parents can update redemptions" ON public.reward_redemptions
  FOR UPDATE USING (public.is_household_owner_or_admin(household_id));

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_child_points_updated_at BEFORE UPDATE ON public.child_points
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_rewards_catalog_updated_at BEFORE UPDATE ON public.rewards_catalog
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
