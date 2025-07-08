import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const AuthHandler = () => {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Jangan lakukan apa-apa jika proses autentikasi masih berjalan
    if (loading) {
      return;
    }

    // Hanya jalankan logika ini jika pengguna sudah login
    if (user) {
      // Jika pengguna adalah MUA dan belum berada di dashboard MUA, arahkan ke sana.
      if (role === 'mua' && location.pathname !== '/mua/dashboard') {
        console.log(`[AuthHandler] MUA terdeteksi. Mengarahkan ke /mua/dashboard...`);
        navigate('/mua/dashboard', { replace: true });
      }
      // Jika pengguna adalah customer dan berada di halaman login, arahkan ke beranda.
      else if (role === 'customer' && location.pathname === '/auth') {
        console.log(`[AuthHandler] Customer terdeteksi. Mengarahkan ke /...`);
        navigate('/', { replace: true });
      }
    }
  }, [user, role, loading, navigate, location.pathname]);

  // Komponen ini tidak merender apa pun, tugasnya hanya logika di latar belakang.
  return null;
};

export default AuthHandler;