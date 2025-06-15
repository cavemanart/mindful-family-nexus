
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface SubscriptionRefreshButtonProps {
  onRefresh: () => void;
  loading: boolean;
}

const SubscriptionRefreshButton: React.FC<SubscriptionRefreshButtonProps> = ({
  onRefresh,
  loading,
}) => (
  <Card>
    <CardContent className="p-4">
      <Button variant="outline" onClick={onRefresh} disabled={loading}>
        Refresh Subscription Status
      </Button>
    </CardContent>
  </Card>
);

export default SubscriptionRefreshButton;
