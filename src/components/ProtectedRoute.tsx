// src/components/ProtectedRoute.tsx

import { useAuth } from "@/contexts/AuthContext";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { LoadingSpinner } from "./LoadingSpinner";
import { useEffect } from "react";

interface ProtectedRouteProps {
  allowedRoles: Array<'mua' | 'customer'>;
}

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { role, loading, user, setLoginRedirect, loginRedirect } = useAuth();
  const location = useLocation();

  // Use useEffect to handle state updates safely
  useEffect(() => {
    if (!loading && !user && (!loginRedirect || loginRedirect.pathname !== location.pathname)) {
      setLoginRedirect({ pathname: location.pathname, state: location.state });
    }
  }, [loading, user, loginRedirect, location.pathname, location.state, setLoginRedirect]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Check if user is authorized
  const isAuthorized = user && role && allowedRoles.includes(role);

  if (isAuthorized) {
    return <Outlet />;
  }

  // If not authorized, redirect to auth
  return <Navigate to="/auth" replace />;
};

export default ProtectedRoute;