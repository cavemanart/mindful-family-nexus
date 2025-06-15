
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart } from "lucide-react";

interface Message {
  id: string;
  from_member: string;
  message: string;
  is_special: boolean;
  created_at: string;
}

interface MessagesSectionProps {
  selectedChild: string;
  childMessages: Message[];
}

const MessagesSection: React.FC<MessagesSectionProps> = ({
  selectedChild,
  childMessages,
}) => (
  <div className="space-y-4">
    <h3 className="text-2xl font-bold text-foreground flex items-center gap-2">
      <Heart className="text-pink-500" size={24} />
      Messages for {selectedChild}
    </h3>
    <div className="grid gap-4">
      {childMessages.length === 0 ? (
        <Card className="bg-pink-50 dark:bg-pink-950/30 border-pink-200 dark:border-pink-700">
          <CardContent className="p-6 text-center">
            <Heart className="text-pink-300 mx-auto mb-4" size={48} />
            <p className="text-muted-foreground text-lg">No messages yet!</p>
            <p className="text-muted-foreground text-sm mt-2">Messages for {selectedChild} will appear here.</p>
          </CardContent>
        </Card>
      ) : (
        childMessages.map((message) => (
          <Card 
            key={message.id} 
            className={`${
              message.is_special 
                ? 'bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-950/30 dark:to-purple-950/30 border-pink-200 dark:border-pink-700' 
                : 'bg-card border-border'
            }`}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    message.is_special ? 'bg-pink-100 dark:bg-pink-800' : 'bg-muted'
                  }`}>
                    {message.is_special ? '💝' : '📝'}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">From {message.from_member}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(message.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {message.is_special && (
                  <Badge className="bg-pink-100 dark:bg-pink-800 text-pink-600 dark:text-pink-200">Special</Badge>
                )}
              </div>
              <p className="text-foreground">{message.message}</p>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  </div>
);

export default MessagesSection;
