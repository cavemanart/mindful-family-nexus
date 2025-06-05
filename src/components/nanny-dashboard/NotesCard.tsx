
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StickyNote } from 'lucide-react';
import type { FamilyNote } from '@/hooks/useFamilyNotes';

interface NotesCardProps {
  nannyNotes: FamilyNote[];
}

const NotesCard: React.FC<NotesCardProps> = ({ nannyNotes }) => {
  return (
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 overflow-x-hidden">
      <CardHeader className="pb-3 sm:pb-4">
        <CardTitle className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl">
          <StickyNote className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-500 flex-shrink-0" />
          <span className="truncate">Important Notes & Routines</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {nannyNotes.length === 0 ? (
          <div className="text-center py-6 sm:py-8">
            <StickyNote className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 dark:text-gray-600 mx-auto mb-3 sm:mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">No specific notes for caregivers</p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {nannyNotes.map((note) => (
              <div key={note.id} className={`w-full ${note.color} p-3 sm:p-4 rounded-xl shadow-sm border`}>
                <h3 className="font-semibold text-gray-800 mb-2 sm:mb-3 text-base sm:text-lg leading-tight break-words">{note.title}</h3>
                <p className="text-gray-700 text-sm sm:text-base whitespace-pre-wrap mb-3 sm:mb-4 leading-relaxed break-words">{note.content}</p>
                <div className="text-xs sm:text-sm text-gray-500 font-medium">
                  By {note.author} • {new Date(note.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NotesCard;
