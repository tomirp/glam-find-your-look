import { useAuth } from "@/contexts/AuthContext";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  const { role, loading } = useAuth();

  // Jika data autentikasi masih dimuat, tampilkan pesan loading
  // untuk mencegah redirect yang tidak perlu.
  if (loading) {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <div>Loading...</div>
        </div>
    );
  }

  // Jika loading selesai dan pengguna BUKAN seorang 'mua',
  // arahkan mereka kembali ke halaman login.
  if (role !== 'mua') {
    return <Navigate to="/auth" replace />;
  }

  // Jika semua kondisi terpenuhi (loading selesai dan role adalah 'mua'),
  // izinkan akses ke halaman dashboard.
  return <Outlet />;
};

export default ProtectedRoute;