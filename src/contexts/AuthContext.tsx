// src/contexts/AuthContext.tsx

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
// --- PERBAIKAN ---
// Path import yang benar sesuai struktur folder Anda
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

  const fetchUserRole = async (user: User | null) => {
    if (!user) {
      console.log("No user provided to fetchUserRole");
      setRole(null);
      return null;
    }
    try {
      console.log("Fetching user role for user:", user.id);
      // Mengambil data dari tabel 'profiles' dimana 'user_id' sama dengan id user yang login
      const { data, error } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('user_id', user.id)
        .single();
      
      if (error) {
        console.error("Error fetching user role:", error);
        throw error;
      }
      
      const userRole = data?.user_type || null;
      console.log("User role fetched:", userRole);
      setRole(userRole);
      return userRole;
    } catch (e) {
      console.error("Gagal mengambil peran pengguna:", e);
      setRole(null);
      return null;
    }
  };
  
  useEffect(() => {
    setLoading(true);
    
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      if (currentUser) {
        await fetchUserRole(currentUser);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        
        // Atur loading kembali ke true saat state berubah untuk mengambil role
        setLoading(true);
        if (currentUser) {
          await fetchUserRole(currentUser);
        } else {
          setRole(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    const { data: loginData, error } = await supabase.auth.signInWithPassword({ email, password });
    if (!error && loginData.user) {
      await fetchUserRole(loginData.user);
    }
    setLoading(false);
    return { error };
  };

  const signUp = async (email: string, password: string, userData: { fullName: string; userType: 'customer' | 'mua'; phone?: string; }) => {
    const { data, error } = await supabase.auth.signUp({
      email, password
    });

    // Jika user berhasil dibuat, langsung insert ke tabel profiles
    if (!error && data.user) {
      console.log("User created, creating profile for:", data.user.id);
      const { error: profileError } = await supabase.from('profiles').insert({
          user_id: data.user.id,
          full_name: userData.fullName,
          user_type: userData.userType, // Pastikan nama kolom benar: 'user_type'
          phone: userData.phone,
      });
      if (profileError) { 
        console.error('Error creating profile:', profileError);
        // Mungkin perlu menghapus user yang baru dibuat jika profil gagal dibuat
        return { error: profileError };
      } else {
        console.log("Profile created successfully");
      }
    }
    return { error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setRole(null);
    return { error };
  };

  const value = { user, session, role, loading, signIn, signUp, signOut };

  // Menahan render children sampai loading selesai
  return (
    <AuthContext.Provider value={value}>
        {children}
    </AuthContext.Provider>
  );
};