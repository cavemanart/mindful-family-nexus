-- 1) Ensure households table exists (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname = 'households' AND c.relkind = 'r' AND n.nspname = 'public'
  ) THEN
    CREATE TABLE public.households (
      id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      invite_code TEXT NOT NULL DEFAULT 'temp-' || gen_random_uuid()::text,
      created_by UUID NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
      user_id UUID NOT NULL
    );
  END IF;
END $$;

-- 2) Enable RLS (safe to run multiple times)
ALTER TABLE public.households ENABLE ROW LEVEL SECURITY;

-- 3) Backfill missing household rows for any ids referenced by household_members
INSERT INTO public.households (id, name, description, invite_code, created_by, user_id)
SELECT hm.household_id,
       'Recovered Household ' || left(hm.household_id::text, 8),
       'Auto-recovered after restore',
       'REC-' || left(encode(gen_random_bytes(4), 'hex'), 8),
       COALESCE((SELECT hm2.user_id FROM public.household_members hm2 WHERE hm2.household_id = hm.household_id ORDER BY hm2.joined_at NULLS LAST LIMIT 1), gen_random_uuid()),
       COALESCE((SELECT hm3.user_id FROM public.household_members hm3 WHERE hm3.household_id = hm.household_id ORDER BY hm3.joined_at NULLS LAST LIMIT 1), gen_random_uuid())
FROM public.household_members hm
LEFT JOIN public.households h ON h.id = hm.household_id
WHERE hm.household_id IS NOT NULL AND h.id IS NULL
GROUP BY hm.household_id;

-- 4) Create RLS policies for households (idempotent via guards)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='households' AND policyname='Users can view households they are members of'
  ) THEN
    CREATE POLICY "Users can view households they are members of" 
    ON public.households 
    FOR SELECT 
    USING (
      EXISTS (
        SELECT 1 FROM public.household_members 
        WHERE household_id = households.id AND user_id = auth.uid()
      )
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='households' AND policyname='Users can create households'
  ) THEN
    CREATE POLICY "Users can create households" 
    ON public.households 
    FOR INSERT 
    WITH CHECK (created_by = auth.uid());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='households' AND policyname='Household owners can update households'
  ) THEN
    CREATE POLICY "Household owners can update households" 
    ON public.households 
    FOR UPDATE 
    USING (
      EXISTS (
        SELECT 1 FROM public.household_members 
        WHERE household_id = households.id 
        AND user_id = auth.uid() 
        AND role IN ('owner', 'admin')
      )
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='households' AND policyname='Household owners can delete households'
  ) THEN
    CREATE POLICY "Household owners can delete households" 
    ON public.households 
    FOR DELETE 
    USING (
      EXISTS (
        SELECT 1 FROM public.household_members 
        WHERE household_id = households.id 
        AND user_id = auth.uid() 
        AND role = 'owner'
      )
    );
  END IF;
END $$;

-- 5) Trigger for updated_at (idempotent)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_households_updated_at'
  ) THEN
    CREATE TRIGGER update_households_updated_at
    BEFORE UPDATE ON public.households
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- 6) Create FK household_members.household_id -> households.id (add NOT VALID first, then validate)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'household_members_household_id_fkey'
  ) THEN
    ALTER TABLE public.household_members 
    ADD CONSTRAINT household_members_household_id_fkey 
    FOREIGN KEY (household_id) REFERENCES public.households(id) ON DELETE CASCADE NOT VALID;
    ALTER TABLE public.household_members VALIDATE CONSTRAINT household_members_household_id_fkey;
  END IF;
END $$;