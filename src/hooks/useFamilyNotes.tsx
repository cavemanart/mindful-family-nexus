
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface FamilyNote {
  id: string;
  title: string;
  content: string;
  author: string;
  is_pinned: boolean;
  color: string;
  created_at: string;
  updated_at: string;
  household_id: string;
}

export const useFamilyNotes = (householdId: string | null) => {
  const [notes, setNotes] = useState<FamilyNote[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchNotes = async () => {
    if (!householdId) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('family_notes')
        .select('*')
        .eq('household_id', householdId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotes(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching notes",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addNote = async (noteData: Omit<FamilyNote, 'id' | 'created_at' | 'updated_at' | 'household_id'>) => {
    if (!householdId) return false;

    try {
      const { error } = await supabase
        .from('family_notes')
        .insert([{ ...noteData, household_id: householdId }]);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Note added successfully!",
      });
      
      fetchNotes();
      return true;
    } catch (error: any) {
      toast({
        title: "Error adding note",
        description: error.message,
        variant: "destructive"
      });
      return false;
    }
  };

  const updateNote = async (id: string, updates: Partial<FamilyNote>) => {
    try {
      const { error } = await supabase
        .from('family_notes')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      fetchNotes();
      return true;
    } catch (error: any) {
      toast({
        title: "Error updating note",
        description: error.message,
        variant: "destructive"
      });
      return false;
    }
  };

  const deleteNote = async (id: string) => {
    try {
      const { error } = await supabase
        .from('family_notes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchNotes();
      return true;
    } catch (error: any) {
      toast({
        title: "Error deleting note",
        description: error.message,
        variant: "destructive"
      });
      return false;
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [householdId]);

  return {
    notes,
    loading,
    addNote,
    updateNote,
    deleteNote,
    refetch: fetchNotes
  };
};
