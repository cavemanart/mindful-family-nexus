
import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, AlertCircle, Wifi, WifiOff } from "lucide-react";
import HouseholdJoinCodeCard from "./HouseholdJoinCodeCard";

interface ChildSelectorProps {
  childrenList: { id: string; first_name: string }[];
  selectedChild: string;
  setSelectedChild: (child: string) => void;
  selectedHousehold: { id: string } | null;
  handleManualRefresh: () => Promise<void>;
  isRefreshing: boolean;
  connectionStatus: { icon: React.ElementType; color: string; text: string };
  subscriptionStatus: string;
  lastRefreshTime: Date | null;
  householdId: string | undefined;
}

const ChildSelector: React.FC<ChildSelectorProps> = ({
  childrenList,
  selectedChild,
  setSelectedChild,
  selectedHousehold,
  handleManualRefresh,
  isRefreshing,
  connectionStatus,
  subscriptionStatus,
  lastRefreshTime,
  householdId,
}) => (
  <div className="text-center py-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 rounded-xl">
    <h2 className="text-3xl font-bold text-foreground mb-4">
      Kid's Dashboard 🎈
    </h2>
    <div className="flex justify-center gap-2 flex-wrap mb-4">
      {childrenList.map((child) => (
        <Button
          key={child.id}
          variant={selectedChild === child.first_name ? "default" : "outline"}
          onClick={() => setSelectedChild(child.first_name)}
          className={selectedChild === child.first_name ? "bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600" : ""}
        >
          {child.first_name}
          {child.id.startsWith('temp-') && (
            <AlertCircle className="ml-1 h-3 w-3 text-amber-500" />
          )}
        </Button>
      ))}
    </div>
    <div className="flex gap-2 justify-center mb-4">
      <Button 
        variant="outline" 
        size="sm"
        onClick={handleManualRefresh}
        disabled={isRefreshing}
      >
        {isRefreshing ? (
          <Loader2 className="mr-2 h-3 w-3 animate-spin" />
        ) : (
          <RefreshCw className="mr-2 h-3 w-3" />
        )}
        Refresh
      </Button>
    </div>

    {/* Generate Join Code Section */}
    {householdId && (
      <div className="mt-6 max-w-md mx-auto">
        <HouseholdJoinCodeCard householdId={householdId} />
      </div>
    )}

    <div className="max-w-md mx-auto bg-white/40 dark:bg-gray-900/30 rounded-md shadow-sm p-3 mb-4">
      <strong>To add more children:</strong>
      <ol className="list-decimal list-inside text-xs text-muted-foreground mt-1 space-y-1 text-left">
        <li>Child creates account at main sign-up page</li>
        <li>Generate join code above, share with child</li>
        <li>Child uses "Join Household" from their profile</li>
        <li>New child appears here automatically</li>
      </ol>
    </div>
    <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mb-2">
      <connectionStatus.icon className={`h-3 w-3 ${connectionStatus.color} ${subscriptionStatus === 'connecting' ? 'animate-spin' : ''}`} />
      <span>{connectionStatus.text}</span>
    </div>
    {lastRefreshTime && (
      <p className="text-xs text-muted-foreground">
        Last refresh: {lastRefreshTime.toLocaleTimeString()}
      </p>
    )}
  </div>
);

export default ChildSelector;
