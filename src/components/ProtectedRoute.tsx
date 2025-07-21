// src/components/ProtectedRoute.tsx

import { useAuth } from "@/contexts/AuthContext";
import { Navigate, Outlet } from "react-router-dom";

// PERUBAHAN: Komponen sekarang menerima prop 'allowedRoles'
interface ProtectedRouteProps {
  allowedRoles: Array<'mua' | 'customer'>;
}

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { role, loading } = useAuth();

  if (loading) {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <div>Memuat...</div>
        </div>
    );
  }

  // PERUBAHAN: Logika sekarang memeriksa apakah peran pengguna ada di dalam 'allowedRoles'
  if (!role || !allowedRoles.includes(role)) {
    // Jika tidak diizinkan, arahkan ke halaman login
    return <Navigate to="/auth" replace />;
  }

  // Jika diizinkan, tampilkan halamannya
  return <Outlet />;
};

export default ProtectedRoute;