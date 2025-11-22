import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HandCashProvider } from "@/contexts/HandCashContext";
import Landing from "./pages/Landing";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import TrustSafety from "./pages/TrustSafety";
import MyVault from "./pages/MyVault";
import TheVault from "./pages/TheVault";
import Treasury from "./pages/Treasury";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HandCashProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/app" element={<Index />} />
            <Route path="/vault" element={<MyVault />} />
            <Route path="/the-vault" element={<TheVault />} />
            <Route path="/treasury" element={<Treasury />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/trust-safety" element={<TrustSafety />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </HandCashProvider>
  </QueryClientProvider>
);

export default App;
