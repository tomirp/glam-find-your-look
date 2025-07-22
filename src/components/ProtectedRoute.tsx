// src/components/ProtectedRoute.tsx

import { useAuth } from "@/contexts/AuthContext";
import { Navigate, Outlet, useLocation } from "react-router-dom";

interface ProtectedRouteProps {
  allowedRoles: Array<'mua' | 'customer'>;
}

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { role, loading, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <div>Memuat...</div>
        </div>
    );
  }

  // PERBAIKAN UTAMA:
  // 1. Cek apakah pengguna sudah login (user ada).
  // 2. Cek apakah peran pengguna termasuk dalam peran yang diizinkan.
  const isAuthorized = user && role && allowedRoles.includes(role);

  // Jika pengguna sudah diotorisasi, tampilkan halaman yang diminta.
  // Jika tidak, arahkan ke halaman login sambil menyimpan halaman tujuan mereka.
  return isAuthorized ? (
    <Outlet />
  ) : (
    <Navigate to="/auth" state={{ from: location }} replace />
  );
};

export default ProtectedRoute;