
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface FamilyNote {
  id: string;
  title: string;
  content: string;
  color: string;
  author: string;
  household_id: string;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
}

export const useFamilyNotes = (householdId?: string) => {
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
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        toast({
          title: "Error fetching notes",
          description: error.message,
          variant: "destructive"
        });
      } else {
        setNotes(data || []);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addNote = async (note: Omit<FamilyNote, 'id' | 'created_at' | 'updated_at' | 'is_pinned'>) => {
    try {
      const { data, error } = await supabase
        .from('family_notes')
        .insert([{ ...note, is_pinned: false }])
        .select()
        .single();

      if (error) {
        toast({
          title: "Error adding note",
          description: error.message,
          variant: "destructive"
        });
        return null;
      }

      fetchNotes();
      toast({
        title: "Success",
        description: "Note added successfully"
      });
      return data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
      return null;
    }
  };

  const updateNote = async (noteId: string, updates: Partial<FamilyNote>) => {
    try {
      const { data, error } = await supabase
        .from('family_notes')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', noteId)
        .select()
        .single();

      if (error) {
        toast({
          title: "Error updating note",
          description: error.message,
          variant: "destructive"
        });
        return null;
      }

      fetchNotes();
      toast({
        title: "Success",
        description: "Note updated successfully"
      });
      return data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
      return null;
    }
  };

  const deleteNote = async (noteId: string) => {
    try {
      const { error } = await supabase
        .from('family_notes')
        .delete()
        .eq('id', noteId);

      if (error) {
        toast({
          title: "Error deleting note",
          description: error.message,
          variant: "destructive"
        });
        return false;
      }

      fetchNotes();
      toast({
        title: "Success",
        description: "Note deleted successfully"
      });
      return true;
    } catch (error: any) {
      toast({
        title: "Error",
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
    fetchNotes,
    addNote,
    updateNote,
    deleteNote
  };
};
