import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HandCashProvider, useHandCash } from "@/contexts/HandCashContext";
import { HandCashConnectModal } from "@/components/HandCashConnectModal";
import Landing from "./pages/Landing";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import TrustSafety from "./pages/TrustSafety";
import MyVault from "./pages/MyVault";
import TheVault from "./pages/TheVault";
import Treasury from "./pages/Treasury";

const queryClient = new QueryClient();

function AppContent() {
  const { showConnectModal, setShowConnectModal, connect } = useHandCash();

  return (
    <>
      <HandCashConnectModal 
        isOpen={showConnectModal}
        onClose={() => setShowConnectModal(false)}
        onConnect={connect}
      />
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
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HandCashProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </TooltipProvider>
    </HandCashProvider>
  </QueryClientProvider>
);

export default App;
