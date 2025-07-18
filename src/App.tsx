import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import SearchResults from "./pages/SearchResults";
import MUADetail from "./pages/MUADetail";
import Checkout from "./pages/Checkout";
import Payment from "./pages/Payment";
import Confirmation from "./pages/Confirmation";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import MUAProfile from "./pages/MUAProfile";
import CustomerProfile from "./pages/CustomerProfile";
import MUAOnboarding from "./pages/MUAOnboarding";
import WaitingForPayment from "./pages/WaitingForPayment"; // Impor halaman baru
import ProtectedRoute from "./components/ProtectedRoute";
import CustomerProtectedRoute from "./components/CustomerProtectedRoute";
import Activity from "./pages/Activity"; // PERUBAHAN: Impor halaman baru

const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false } },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/search" element={<SearchResults />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/mua/profile" element={<MUAProfile />} />
              <Route path="/mua/onboarding" element={<MUAOnboarding />} />
            </Route>
            <Route element={<CustomerProtectedRoute />}>
              <Route path="/customer/profile" element={<CustomerProfile />} />
              
              <Route path="/aktivitas" element={<Activity />} />
            </Route>
            <Route path="/mua/:id" element={<MUADetail />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/waiting-for-payment/:paymentId" element={<WaitingForPayment />} /> {/* Tambah route baru */}
            <Route path="/confirmation" element={<Confirmation />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);
export default App;