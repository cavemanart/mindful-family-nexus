
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const HomeHeader: React.FC = () => {
  const navigate = useNavigate();

  return (
    <header className="py-8">
      <div className="container mx-auto px-6 flex items-center justify-between">
        <div className="text-2xl font-bold">
          <span className="text-purple-600">Hub</span>lie
        </div>
        <nav className="hidden md:flex space-x-8 mr-8">
          <a href="/features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Features
          </a>
          <a href="/about" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            About
          </a>
          <a href="/help" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Help
          </a>
        </nav>
        <Button variant="default" onClick={() => navigate("/auth")}>
          Get Started Free
        </Button>
      </div>
    </header>
  );
};

export default HomeHeader;
