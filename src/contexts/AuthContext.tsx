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
  signOut: () => Promise<{ error: any; }>; // Tipe sudah benar di sini
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
      setRole(null);
      setLoading(false);
      return null;
    }
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('user_id', user.id)
        .single();
      if (error) throw error;
      return data.user_type;
    } catch (e) {
      console.error("Gagal mengambil peran pengguna:", e);
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
        const userRole = await fetchUserRole(currentUser);
        setRole(userRole);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        if (currentUser) {
          const userRole = await fetchUserRole(currentUser);
          setRole(userRole);
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
    if (error || !loginData.user) {
      setLoading(false);
      return { error };
    }
    const userRole = await fetchUserRole(loginData.user);
    setUser(loginData.user);
    setSession(loginData.session);
    setRole(userRole);
    setLoading(false);
    return { error: null };
  };

  const signUp = async (email: string, password: string, userData: { fullName: string; userType: 'customer' | 'mua'; phone?: string; }) => {
    // ... (Fungsi signUp tetap sama)
    const redirectUrl = `${window.location.origin}/`;
    const { data, error } = await supabase.auth.signUp({
      email, password, options: { emailRedirectTo: redirectUrl, data: {
          full_name: userData.fullName, user_type: userData.userType, phone: userData.phone,
      }}
    });
    if (!error && data.user) {
      const { error: profileError } = await supabase.from('profiles').insert({
          user_id: data.user.id, full_name: userData.fullName, user_type: userData.userType, phone: userData.phone,
      });
      if (profileError) { console.error('Error creating profile:', profileError); }
    }
    return { error };
  };

  // --- PERBAIKAN UTAMA DI SINI ---
  const signOut = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setRole(null);
    setLoading(false);
    return { error }; // <-- Mengembalikan objek dengan properti 'error'
  };

  const value = { user, session, role, loading, signIn, signUp, signOut }; // <-- Disederhanakan

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};