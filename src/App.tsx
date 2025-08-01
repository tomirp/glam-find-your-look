// src/App.tsx

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { BottomNavProvider, useBottomNav } from "@/contexts/BottomNavContext";

// Import Halaman
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
import ProtectedRoute from "./components/ProtectedRoute";
import BottomNav from "./components/BottomNav";
import LeaveReview from "./pages/LeaveReview";
import AuthHandler from "./components/AuthHandler";
import Navbar from "./components/Navbar";

const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false } },
});

const AppLayout = () => {
  const { isBottomNavVisible } = useBottomNav();
  const location = useLocation();

  const checkPath = (pathname: string) => {
    // Rute dengan path yang sama persis
    const exactShowRoutes = ['/', '/search', '/aktivitas', '/customer/profile'];
    if (exactShowRoutes.includes(pathname)) return true;

    // PERBAIKAN: Tampilkan juga di halaman detail MUA
    if (pathname.startsWith('/mua/')) return true;
    
    return false;
  };

  const shouldShowBottomNav = checkPath(location.pathname) && isBottomNavVisible;

  return (
    <>
      <Navbar />
      <AuthHandler />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/mua/:id" element={<MUADetail />} />
        <Route element={<ProtectedRoute allowedRoles={['mua']} />}>
          <Route path="/mua/profile" element={<MUAProfile />} />
          <Route path="/mua/dashboard" element={<MUAProfile />} />
          <Route path="/mua/onboarding" element={<MUAOnboarding />} />
        </Route>
        <Route element={<ProtectedRoute allowedRoles={['customer']} />}>
          <Route path="/customer/profile" element={<CustomerProfile />} />
          <Route path="/aktivitas" element={<Activity />} />
          <Route path="/review/:bookingId" element={<LeaveReview />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/waiting-for-payment/:paymentId" element={<WaitingForPayment />} />
          <Route path="/confirmation" element={<Confirmation />} />
        </Route>
        <Route element={<ProtectedRoute allowedRoles={['mua', 'customer']} />}>
          <Route path="/chat/:conversationId" element={<ChatPage />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
      {shouldShowBottomNav && <BottomNav />}
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BottomNavProvider>
          <BrowserRouter>
            <AppLayout />
          </BrowserRouter>
        </BottomNavProvider>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;