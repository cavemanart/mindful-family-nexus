
import React from "react";

const HomeFooter: React.FC = () => (
  <footer className="py-6 bg-muted text-center text-muted-foreground">
    <p className="text-sm">
      &copy; {new Date().getFullYear()} Hublie. All rights reserved.
    </p>
  </footer>
);

export default HomeFooter;
