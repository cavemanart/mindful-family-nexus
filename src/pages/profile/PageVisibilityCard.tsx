
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Eye, Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface Page {
  key: string;
  label: string;
  description: string;
  alwaysVisible?: boolean;
  category: string;
}

interface PageVisibilityCardProps {
  preferencesLoading: boolean;
  groupedPages: Record<string, Page[]>;
  isPageVisible: (key: string) => boolean;
  togglePageVisibility: (key: string) => void;
}

const PageVisibilityCard: React.FC<PageVisibilityCardProps> = ({
  preferencesLoading,
  groupedPages,
  isPageVisible,
  togglePageVisibility,
}) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Eye className="h-5 w-5" />
        Page Visibility
      </CardTitle>
      <CardDescription>
        Choose which features appear in your navigation and quick actions
      </CardDescription>
    </CardHeader>
    <CardContent className="space-y-6">
      {preferencesLoading ? (
        <div className="text-center py-4">
          <Loader2 className="animate-spin h-6 w-6 mx-auto mb-2" />
          <p className="text-muted-foreground">Loading preferences...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedPages).map(([category, pages]) => (
            <div key={category} className="space-y-3">
              <h4 className="font-medium text-sm uppercase tracking-wide text-muted-foreground">
                {category} Features
              </h4>
              <div className="space-y-3">
                {pages.map((page) => (
                  <div 
                    key={page.key} 
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="space-y-1">
                      <Label className="font-medium">{page.label}</Label>
                      <p className="text-sm text-muted-foreground">{page.description}</p>
                    </div>
                    <Switch
                      checked={isPageVisible(page.key)}
                      onCheckedChange={() => togglePageVisibility(page.key)}
                      disabled={page.alwaysVisible}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </CardContent>
  </Card>
);

export default PageVisibilityCard;
