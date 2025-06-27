
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const HomeCTASection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="text-center space-y-8 mt-16">
      <div className="space-y-4">
        <h2 className="text-3xl font-bold tracking-tight">Ready to Get Started?</h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Join thousands of families who have transformed their home organization with Hublie.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
        <Button
          size="lg"
          onClick={() => navigate("/auth")}
          className="flex-1"
        >
          Get Started Free
        </Button>

        <Button
          size="lg"
          variant="outline"
          onClick={() => navigate("/nanny-access")}
          className="flex-1"
        >
          🍼 Nanny Access
        </Button>
      </div>

      <p className="text-sm text-muted-foreground">
        No credit card required • Free 14-day trial
      </p>
    </section>
  );
};

export default HomeCTASection;
