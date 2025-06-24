
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StickyNote, Plus, Edit, Trash2, Pin, PinOff } from 'lucide-react';
import { useFamilyNotes } from '@/hooks/useFamilyNotes';

interface FamilyNotesProps {
  householdId: string;
  canEdit?: boolean;
}

const colorOptions = [
  { value: 'bg-yellow-100 border-yellow-300', label: 'Yellow', preview: 'bg-yellow-100' },
  { value: 'bg-pink-100 border-pink-300', label: 'Pink', preview: 'bg-pink-100' },
  { value: 'bg-blue-100 border-blue-300', label: 'Blue', preview: 'bg-blue-100' },
  { value: 'bg-green-100 border-green-300', label: 'Green', preview: 'bg-green-100' },
  { value: 'bg-purple-100 border-purple-300', label: 'Purple', preview: 'bg-purple-100' }
];

const FamilyNotes: React.FC<FamilyNotesProps> = ({ householdId, canEdit = true }) => {
  const { notes, addNote, updateNote, deleteNote } = useFamilyNotes(householdId);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingNote, setEditingNote] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    color: 'bg-yellow-100 border-yellow-300'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content) return;

    const noteData = {
      title: formData.title,
      content: formData.content,
      color: formData.color,
      household_id: householdId,
      author: 'Family Member'
    };

    if (editingNote) {
      await updateNote(editingNote.id, noteData);
      setEditingNote(null);
    } else {
      await addNote(noteData);
    }

    setFormData({ title: '', content: '', color: 'bg-yellow-100 border-yellow-300' });
    setShowAddDialog(false);
  };

  const handleEdit = (note: any) => {
    setFormData({
      title: note.title,
      content: note.content,
      color: note.color
    });
    setEditingNote(note);
    setShowAddDialog(true);
  };

  const handleDelete = async (noteId: string) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      await deleteNote(noteId);
    }
  };

  const handlePin = async (note: any) => {
    await updateNote(note.id, { is_pinned: !note.is_pinned });
  };

  const closeDialog = () => {
    setShowAddDialog(false);
    setEditingNote(null);
    setFormData({ title: '', content: '', color: 'bg-yellow-100 border-yellow-300' });
  };

  const pinnedNotes = notes.filter(note => note.is_pinned);
  const regularNotes = notes.filter(note => !note.is_pinned);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <StickyNote className="h-5 w-5 text-amber-500" />
            Family Notes
          </CardTitle>
          {canEdit && (
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Note
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingNote ? 'Edit Note' : 'Add New Note'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Note title"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="content">Content</Label>
                    <Textarea
                      id="content"
                      value={formData.content}
                      onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                      placeholder="Write your note here..."
                      rows={4}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="color">Color</Label>
                    <Select
                      value={formData.color}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, color: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a color" />
                      </SelectTrigger>
                      <SelectContent>
                        {colorOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center gap-2">
                              <div className={`w-4 h-4 rounded ${option.preview} border`}></div>
                              {option.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1">
                      {editingNote ? 'Update Note' : 'Add Note'}
                    </Button>
                    <Button type="button" variant="outline" onClick={closeDialog}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {notes.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <StickyNote className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No notes yet</p>
            {canEdit && <p className="text-sm mt-2">Click "Add Note" to create your first family note</p>}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Pinned Notes */}
            {pinnedNotes.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3 flex items-center gap-2">
                  <Pin className="h-4 w-4" />
                  Pinned Notes
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {pinnedNotes.map((note) => (
                    <div key={note.id} className={`${note.color} p-4 rounded-lg shadow-sm relative group`}>
                      {canEdit && (
                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            onClick={() => handlePin(note)}
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                          >
                            <PinOff className="h-3 w-3" />
                          </Button>
                          <Button
                            onClick={() => handleEdit(note)}
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            onClick={() => handleDelete(note.id)}
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                      <h3 className="font-semibold text-gray-800 mb-2 pr-8">{note.title}</h3>
                      <p className="text-gray-700 text-sm whitespace-pre-wrap mb-3">{note.content}</p>
                      <div className="text-xs text-gray-500">
                        By {note.author} • {new Date(note.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Regular Notes */}
            {regularNotes.length > 0 && (
              <div>
                {pinnedNotes.length > 0 && (
                  <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">
                    Other Notes
                  </h4>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {regularNotes.map((note) => (
                    <div key={note.id} className={`${note.color} p-4 rounded-lg shadow-sm relative group`}>
                      {canEdit && (
                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            onClick={() => handlePin(note)}
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                          >
                            <Pin className="h-3 w-3" />
                          </Button>
                          <Button
                            onClick={() => handleEdit(note)}
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            onClick={() => handleDelete(note.id)}
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                      <h3 className="font-semibold text-gray-800 mb-2 pr-8">{note.title}</h3>
                      <p className="text-gray-700 text-sm whitespace-pre-wrap mb-3">{note.content}</p>
                      <div className="text-xs text-gray-500">
                        By {note.author} • {new Date(note.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FamilyNotes;
