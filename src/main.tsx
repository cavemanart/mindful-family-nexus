
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import SafeTooltipProvider from './components/SafeTooltipProvider.tsx'

createRoot(document.getElementById("root")!).render(
  <SafeTooltipProvider>
    <App />
  </SafeTooltipProvider>
);
