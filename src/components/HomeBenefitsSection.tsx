
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Smartphone, Clock, Heart, Zap } from "lucide-react";

const HomeBenefitsSection: React.FC = () => (
  <section className="py-12 text-center">
    <h2 className="text-3xl font-bold tracking-tight mb-8">
      Why Choose Hublie?
    </h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <Card className="bg-white dark:bg-gray-800 border-none shadow-md hover:shadow-lg transition-shadow">
        <CardContent className="p-6 space-y-4">
          <Smartphone className="h-8 w-8 text-blue-500 mx-auto" />
          <h3 className="text-xl font-semibold text-center">Cross-Platform Access</h3>
          <p className="text-sm text-muted-foreground text-center">
            Access Hublie on any device, anywhere.
          </p>
        </CardContent>
      </Card>
      <Card className="bg-white dark:bg-gray-800 border-none shadow-md hover:shadow-lg transition-shadow">
        <CardContent className="p-6 space-y-4">
          <Clock className="h-8 w-8 text-green-500 mx-auto" />
          <h3 className="text-xl font-semibold text-center">Time-Saving Tools</h3>
          <p className="text-sm text-muted-foreground text-center">
            Streamline your daily routines and save valuable time.
          </p>
        </CardContent>
      </Card>
      <Card className="bg-white dark:bg-gray-800 border-none shadow-md hover:shadow-lg transition-shadow">
        <CardContent className="p-6 space-y-4">
          <Heart className="h-8 w-8 text-pink-500 mx-auto" />
          <h3 className="text-xl font-semibold text-center">Enhanced Communication</h3>
          <p className="text-sm text-muted-foreground text-center">
            Foster stronger family connections through seamless communication.
          </p>
        </CardContent>
      </Card>
      <Card className="bg-white dark:bg-gray-800 border-none shadow-md hover:shadow-lg transition-shadow">
        <CardContent className="p-6 space-y-4">
          <Zap className="h-8 w-8 text-yellow-500 mx-auto" />
          <h3 className="text-xl font-semibold text-center">Easy to Use</h3>
          <p className="text-sm text-muted-foreground text-center">
            Intuitive interface for all family members.
          </p>
        </CardContent>
      </Card>
    </div>
  </section>
);

export default HomeBenefitsSection;
