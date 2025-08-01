import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const AuthHandler = () => {
  const { user, role, loading, muaProfileExists, loginRedirect, clearLoginRedirect } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Jangan lakukan apa-apa jika proses autentikasi masih berjalan
    if (loading) {
      return;
    }

    // Hanya jalankan logika ini jika pengguna sudah login
    if (user && role) {
      // Handle redirect after successful login
      if (loginRedirect && location.pathname === '/auth') {
        clearLoginRedirect();
        navigate(loginRedirect.pathname, { state: loginRedirect.state, replace: true });
        return;
      }

      // MUA specific routing
      if (role === 'mua') {
        // If MUA doesn't have complete profile, redirect to onboarding
        if (muaProfileExists === false && location.pathname !== '/mua/onboarding') {
          console.log(`[AuthHandler] MUA without profile. Redirecting to onboarding...`);
          navigate('/mua/onboarding', { replace: true });
        }
        // If MUA has profile and is on auth page, redirect to dashboard
        else if (muaProfileExists === true && location.pathname === '/auth') {
          console.log(`[AuthHandler] MUA detected. Redirecting to dashboard...`);
          navigate('/mua/dashboard', { replace: true });
        }
      }
      // Customer specific routing
      else if (role === 'customer' && location.pathname === '/auth') {
        console.log(`[AuthHandler] Customer detected. Redirecting to home...`);
        navigate('/', { replace: true });
      }
    }
  }, [user, role, loading, muaProfileExists, loginRedirect, navigate, location.pathname, clearLoginRedirect]);

  // Komponen ini tidak merender apa pun, tugasnya hanya logika di latar belakang.
  return null;
};

export default AuthHandler;