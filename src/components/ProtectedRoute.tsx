// src/components/ProtectedRoute.tsx

import { useAuth } from "@/contexts/AuthContext";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { LoadingSpinner } from "./LoadingSpinner";

interface ProtectedRouteProps {
  allowedRoles: Array<'mua' | 'customer'>;
}

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { role, loading, user, setLoginRedirect } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // PERBAIKAN UTAMA:
  // 1. Cek apakah pengguna sudah login (user ada).
  // 2. Cek apakah peran pengguna termasuk dalam peran yang diizinkan.
  const isAuthorized = user && role && allowedRoles.includes(role);

  // Jika pengguna sudah diotorisasi, tampilkan halaman yang diminta.
  // Jika tidak, arahkan ke halaman login sambil menyimpan halaman tujuan mereka.
  if (isAuthorized) {
    return <Outlet />;
  }

  // Simpan redirect location dan arahkan ke auth
  setLoginRedirect({ pathname: location.pathname, state: location.state });
  return <Navigate to="/auth" replace />;
};

export default ProtectedRoute;