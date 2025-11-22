import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HandCashProvider, useHandCash } from "@/contexts/HandCashContext";
import { HandCashConnectModal } from "@/components/HandCashConnectModal";
import Landing from "./pages/Landing";
import Scan from "./pages/scan";
import Vault from "./pages/TheVault";
import MyVault from "./pages/MyVault";
import Treasury from "./pages/Treasury";
import NotFound from "./pages/NotFound";

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
        <Route path="/scan" element={<Scan />} />
        <Route path="/vault" element={<Vault />} />
        <Route path="/my-vault" element={<MyVault />} />
        <Route path="/treasury" element={<Treasury />} />
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
