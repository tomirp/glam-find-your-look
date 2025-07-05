// src/contexts/AuthContext.tsx

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  role: 'customer' | 'mua' | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, userData: {
    fullName: string;
    userType: 'customer' | 'mua';
    phone?: string;
  }) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any; }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<'customer' | 'mua' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSessionAndRole = async () => {
      console.log("Mulai mengambil sesi...");
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("Error mengambil sesi:", sessionError);
        setLoading(false);
        return;
      }
      
      setSession(session);
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        console.log("Sesi ditemukan untuk:", currentUser.email);
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('user_type')
            .eq('user_id', currentUser.id)
            .single();

          if (error) {
            console.error("Gagal mengambil peran pengguna:", error.message);
            throw error;
          }

          if (data) {
            console.log("Peran pengguna ditemukan:", data.user_type);
            setRole(data.user_type);
          } else {
            console.warn("Profil tidak ditemukan untuk user:", currentUser.id);
            setRole(null);
          }
        } catch (e) {
          setRole(null);
        }
      } else {
        console.log("Tidak ada sesi aktif.");
        setRole(null);
      }
      // Pastikan loading selesai di semua skenario
      setLoading(false);
      console.log("Proses autentikasi awal selesai.");
    };

    fetchSessionAndRole();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        console.log("Status Auth berubah, event:", _event);
        // Panggil kembali fungsi utama untuk memuat ulang semua data jika ada perubahan
        fetchSessionAndRole();
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    // `onAuthStateChange` akan menangani sisanya, kita hanya perlu menunggu loading selesai.
    return { error };
  };

  const signUp = async (email: string, password: string, userData: { fullName: string; userType: 'customer' | 'mua'; phone?: string; }) => {
    // PENTING: Supabase sekarang merekomendasikan menyimpan data tambahan di 'options.data'
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: {
        data: {
          full_name: userData.fullName,
          user_type: userData.userType,
          phone: userData.phone
        }
      }
    });

    if (error) {
      return { error };
    }
    
    // Kita tidak perlu insert manual lagi jika menggunakan `options.data` DAN
    // Anda memiliki trigger di database yang memindahkan data dari `auth.users.raw_user_meta_data` ke tabel `profiles`.
    // Jika tidak ada trigger, insert manual masih diperlukan. Anggap saja kita tetap insert manual untuk keamanan.
    if (data.user) {
        const { error: profileError } = await supabase.from('profiles').insert({
            user_id: data.user.id,
            full_name: userData.fullName,
            user_type: userData.userType,
            phone: userData.phone,
        });
        if (profileError) return { error: profileError };
    }

    return { error: null };
  };

  const signOut = async () => {
    setLoading(true); // Mulai loading saat proses logout
    const { error } = await supabase.auth.signOut();
    // `onAuthStateChange` akan mendeteksi logout dan membersihkan state.
    return { error };
  };

  const value = { user, session, role, loading, signIn, signUp, signOut };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};