
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
        <nav>
          <ul className="flex items-center space-x-6">
            <li>
              <Button variant="ghost" onClick={() => navigate("/auth")}>
                Login / Sign Up
              </Button>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default HomeHeader;
