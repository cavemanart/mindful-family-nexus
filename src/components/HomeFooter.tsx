
import React from "react";

const HomeFooter: React.FC = () => (
  <footer className="py-6 bg-muted/50 border-t border-border text-center">
    <p className="text-sm text-muted-foreground">
      &copy; {new Date().getFullYear()} Hublie. All rights reserved.
    </p>
  </footer>
);

export default HomeFooter;
