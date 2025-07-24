// src/App.tsx

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
import WaitingForPayment from "./pages/WaitingForPayment";
import Activity from "./pages/Activity";
import ChatPage from "./pages/ChatPage";
import ProtectedRoute from "./components/ProtectedRoute"; // Pastikan impor ini benar
import BottomNav from "./components/BottomNav"; // PERUBAHAN: Impor BottomNav
import LeaveReview from "./pages/LeaveReview"; // Impor halaman baru


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
                {/* Rute Publik */}
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/search" element={<SearchResults />} />
                <Route path="/mua/:id" element={<MUADetail />} />

                {/* PERUBAHAN: Grup rute hanya untuk MUA */}
                <Route element={<ProtectedRoute allowedRoles={['mua']} />}>
                  <Route path="/mua/profile" element={<MUAProfile />} />
                  <Route path="/mua/onboarding" element={<MUAOnboarding />} />
                </Route>

                {/* PERUBAHAN: Grup rute hanya untuk Customer */}
                <Route element={<ProtectedRoute allowedRoles={['customer']} />}>
                  <Route path="/customer/profile" element={<CustomerProfile />} />
                  <Route path="/aktivitas" element={<Activity />} />
                  <Route path="/review/:bookingId" element={<LeaveReview />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/payment" element={<Payment />} />
                  <Route path="/waiting-for-payment/:paymentId" element={<WaitingForPayment />} />
                  <Route path="/confirmation" element={<Confirmation />} />
                </Route>

                {/* PERUBAHAN: Grup rute untuk MUA dan Customer */}
                <Route element={<ProtectedRoute allowedRoles={['mua', 'customer']} />}>
                  <Route path="/chat/:conversationId" element={<ChatPage />} />
                </Route>
                
                {/* Rute Not Found */}
                <Route path="*" element={<NotFound />} />
              </Routes>
          <BottomNav />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);
export default App;