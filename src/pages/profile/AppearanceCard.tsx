
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Separator } from "@/components/ui/card";
import { Palette } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface AppearanceCardProps {
  theme: string;
  setTheme: (value: string) => void;
}

const AppearanceCard: React.FC<AppearanceCardProps> = ({ theme, setTheme }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Palette className="h-5 w-5" />
        Appearance
      </CardTitle>
      <CardDescription>
        Customize how the app looks and feels
      </CardDescription>
    </CardHeader>
    <CardContent className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Label>Dark Mode</Label>
          <p className="text-sm text-muted-foreground">
            Toggle between light and dark themes
          </p>
        </div>
        <Switch
          checked={theme === "dark"}
          onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
        />
      </div>
      <Separator />
      <div className="space-y-2">
        <Label>Current Theme</Label>
        <div className="flex items-center gap-2">
          <div className={`w-4 h-4 rounded-full ${theme === "dark" ? "bg-slate-800" : "bg-white border"}`} />
          <span className="capitalize font-medium">{theme} Mode</span>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default AppearanceCard;
