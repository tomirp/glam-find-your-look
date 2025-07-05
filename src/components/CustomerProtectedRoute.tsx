
import { useAuth } from "@/contexts/AuthContext";
import { Navigate, Outlet } from "react-router-dom";

const CustomerProtectedRoute = () => {
  const { role, loading } = useAuth();

  // Jika data autentikasi masih dimuat, tampilkan pesan loading
  if (loading) {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <div>Loading...</div>
        </div>
    );
  }

  // Jika loading selesai dan pengguna BUKAN seorang 'customer',
  // arahkan mereka kembali ke halaman login.
  if (role !== 'customer') {
    return <Navigate to="/auth" replace />;
  }

  // Jika semua kondisi terpenuhi, izinkan akses ke halaman customer.
  return <Outlet />;
};

export default CustomerProtectedRoute;
