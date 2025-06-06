import React, { useState } from 'react';
import { Plus, Search, Pin, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useFamilyNotes } from '@/hooks/useFamilyNotes';
import { Household } from '@/hooks/useHouseholds';

interface FamilyNotesProps {
  selectedHousehold: Household;
}

const FamilyNotes: React.FC<FamilyNotesProps> = ({ selectedHousehold }) => {
  const { notes, loading, addNote, updateNote, deleteNote } = useFamilyNotes(selectedHousehold?.id);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNote, setEditingNote] = useState({ title: '', content: '' });
  const [newNote, setNewNote] = useState({ title: '', content: '' });
  const [searchTerm, setSearchTerm] = useState('');

  const colors = [
    'bg-yellow-50 border-yellow-300 dark:bg-yellow-950/30 dark:border-yellow-700',
    'bg-green-50 border-green-300 dark:bg-green-950/30 dark:border-green-700',
    'bg-blue-50 border-blue-300 dark:bg-blue-950/30 dark:border-blue-700',
    'bg-pink-50 border-pink-300 dark:bg-pink-950/30 dark:border-pink-700',
    'bg-purple-50 border-purple-300 dark:bg-purple-950/30 dark:border-purple-700',
  ];

  const handleAddNote = async () => {
    if (newNote.title.trim() && newNote.content.trim()) {
      const success = await addNote({
        title: newNote.title,
        content: newNote.content,
        author: 'You',
        is_pinned: false,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
      
      if (success) {
        setNewNote({ title: '', content: '' });
        setIsAddingNote(false);
      }
    }
  };

  const handleTogglePin = async (id: string, currentPinStatus: boolean) => {
    await updateNote(id, { is_pinned: !currentPinStatus });
  };

  const handleDeleteNote = async (id: string) => {
    await deleteNote(id);
  };

  const handleEditNote = (note: any) => {
    setEditingNoteId(note.id);
    setEditingNote({ title: note.title, content: note.content });
  };

  const handleSaveEdit = async () => {
    if (editingNoteId && editingNote.title.trim() && editingNote.content.trim()) {
      await updateNote(editingNoteId, editingNote);
      setEditingNoteId(null);
      setEditingNote({ title: '', content: '' });
    }
  };

  const handleCancelEdit = () => {
    setEditingNoteId(null);
    setEditingNote({ title: '', content: '' });
  };

  const renderNoteCard = (note: any) => (
    <Card 
      key={note.id} 
      className={`${note.color} hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1 cursor-pointer`}
      onClick={() => !editingNoteId ? handleEditNote(note) : undefined}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          {editingNoteId === note.id ? (
            <Input
              value={editingNote.title}
              onChange={(e) => setEditingNote({ ...editingNote, title: e.target.value })}
              className="font-semibold bg-transparent border-none p-0 focus:ring-0"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <CardTitle className="text-lg font-semibold text-foreground">{note.title}</CardTitle>
          )}
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleTogglePin(note.id, note.is_pinned);
              }}
              className={`${note.is_pinned ? 'text-yellow-600 hover:bg-yellow-200 dark:hover:bg-yellow-900/50' : 'text-muted-foreground hover:bg-muted'} p-1`}
            >
              <Pin size={14} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteNote(note.id);
              }}
              className="text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 p-1"
            >
              <Trash2 size={14} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {editingNoteId === note.id ? (
          <div className="space-y-3" onClick={(e) => e.stopPropagation()}>
            <Textarea
              value={editingNote.content}
              onChange={(e) => setEditingNote({ ...editingNote, content: e.target.value })}
              rows={4}
              className="resize-none bg-transparent border-gray-300 dark:border-gray-600"
            />
            <div className="flex gap-2">
              <Button onClick={handleSaveEdit} size="sm" className="bg-green-600 hover:bg-green-700">
                Save
              </Button>
              <Button onClick={handleCancelEdit} variant="outline" size="sm">
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-foreground text-sm mb-3">{note.content}</p>
            <div className="flex items-center justify-between">
              <Badge variant="secondary" className="text-xs">
                by {note.author}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {new Date(note.created_at).toLocaleDateString()}
              </span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pinnedNotes = filteredNotes.filter(note => note.is_pinned);
  const regularNotes = filteredNotes.filter(note => !note.is_pinned);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Family Notes</h2>
        <div className="flex gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
            <Input
              placeholder="Search notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button onClick={() => setIsAddingNote(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus size={16} className="mr-2" />
            Add Note
          </Button>
        </div>
      </div>

      {isAddingNote && (
        <Card className="border-2 border-dashed border-border">
          <CardHeader>
            <CardTitle>Add New Note</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Note title..."
              value={newNote.title}
              onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
            />
            <Textarea
              placeholder="Write your note here..."
              value={newNote.content}
              onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
              rows={3}
            />
            <div className="flex gap-2">
              <Button onClick={handleAddNote} className="bg-green-600 hover:bg-green-700">
                Save Note
              </Button>
              <Button variant="outline" onClick={() => setIsAddingNote(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {pinnedNotes.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
            <Pin size={18} className="text-muted-foreground" />
            Pinned Notes
          </h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {pinnedNotes.map(renderNoteCard)}
          </div>
        </div>
      )}

      {regularNotes.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-3">All Notes</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {regularNotes.map(renderNoteCard)}
          </div>
        </div>
      )}

      {filteredNotes.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">No notes found.</p>
          <p className="text-muted-foreground text-sm mt-2">Start by adding your first family note!</p>
        </div>
      )}
    </div>
  );
};

export default FamilyNotes;
