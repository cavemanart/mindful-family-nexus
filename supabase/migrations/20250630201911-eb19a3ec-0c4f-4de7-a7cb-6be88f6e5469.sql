
-- Create family_memories table to store text-based family memories
CREATE TABLE public.family_memories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  household_id UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  memory_type TEXT NOT NULL DEFAULT 'general',
  emotion_tags TEXT[] DEFAULT '{}',
  family_members TEXT[] DEFAULT '{}',
  added_by TEXT NOT NULL,
  added_by_user_id UUID,
  memory_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for family_memories table
ALTER TABLE public.family_memories ENABLE ROW LEVEL SECURITY;

-- Create policies for family_memories
CREATE POLICY "Users can view memories from their household" 
  ON public.family_memories 
  FOR SELECT 
  USING (
    household_id IN (
      SELECT household_id FROM public.household_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create memories in their household" 
  ON public.family_memories 
  FOR INSERT 
  WITH CHECK (
    household_id IN (
      SELECT household_id FROM public.household_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update memories in their household" 
  ON public.family_memories 
  FOR UPDATE 
  USING (
    household_id IN (
      SELECT household_id FROM public.household_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete memories in their household" 
  ON public.family_memories 
  FOR DELETE 
  USING (
    household_id IN (
      SELECT household_id FROM public.household_members 
      WHERE user_id = auth.uid()
    )
  );

-- Create index for better performance
CREATE INDEX idx_family_memories_household_date ON public.family_memories(household_id, memory_date DESC);
CREATE INDEX idx_family_memories_type ON public.family_memories(memory_type);
