
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Phone } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { EmergencyContact } from '@/hooks/useEmergencyContacts';

interface EmergencyContactsCardProps {
  contacts: EmergencyContact[];
}

const EmergencyContactsCard: React.FC<EmergencyContactsCardProps> = ({ contacts }) => {
  const handleCall = (phone: string) => {
    window.open(`tel:${phone}`, '_self');
  };

  return (
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 overflow-x-hidden">
      <CardHeader className="pb-3 sm:pb-4">
        <CardTitle className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl">
          <Phone className="h-5 w-5 sm:h-6 sm:w-6 text-red-500 flex-shrink-0" />
          <span className="truncate">Emergency Contacts</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-3 sm:space-y-4">
        {contacts.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">No emergency contacts available</p>
        ) : (
          contacts.map((contact) => (
            <div key={contact.id} className={`w-full border rounded-xl p-3 sm:p-4 ${contact.phone === '911' ? 'border-red-300 bg-red-50 dark:bg-red-950/30' : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700'}`}>
              <div className="space-y-2 sm:space-y-3">
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1 sm:mb-2">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-base sm:text-lg leading-tight break-words min-w-0 flex-1">{contact.name}</h4>
                    {contact.is_primary && (
                      <Badge variant="destructive" className="text-xs sm:text-sm font-medium flex-shrink-0">Primary</Badge>
                    )}
                  </div>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-1 sm:mb-2 break-words">{contact.relationship}</p>
                  <p className="text-base sm:text-lg font-mono text-gray-800 dark:text-gray-200 font-semibold tracking-wide break-all">{contact.phone}</p>
                </div>
                <Button
                  onClick={() => handleCall(contact.phone)}
                  size="lg"
                  className={`w-full min-h-[48px] sm:min-h-[52px] text-base sm:text-lg font-semibold ${
                    contact.phone === '911' 
                      ? 'bg-red-600 hover:bg-red-700 text-white' 
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  <Phone className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3" />
                  <span className="truncate">Call {contact.name}</span>
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default EmergencyContactsCard;
