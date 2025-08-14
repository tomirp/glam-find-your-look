// src/contexts/AuthContext.tsx

import { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

// --- PERBAIKAN 1: Samakan tipe Profile dengan skema database ---
type Profile = {
  id: string;
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  user_type: 'customer' | 'mua' | 'admin'; // Menggunakan user_type, bukan role
  // tambahkan properti lain dari profil Anda jika ada
};
// -------------------------------------------------------------

type RedirectLocation = {
  pathname: string;
  state: any;
};

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  role: 'customer' | 'mua' | null;
  loading: boolean;
  muaProfileExists: boolean | null;
  loginRedirect: RedirectLocation | null;
  setLoginRedirect: (location: RedirectLocation | null) => void;
  clearLoginRedirect: () => void;
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

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<'customer' | 'mua' | null>(null);
  const [muaProfileExists, setMuaProfileExists] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [loginRedirect, setLoginRedirectState] = useState<RedirectLocation | null>(() => {
    const storedRedirect = sessionStorage.getItem('loginRedirect');
    return storedRedirect ? JSON.parse(storedRedirect) : null;
  });

  const setLoginRedirect = (location: RedirectLocation | null) => {
    if (location) {
      sessionStorage.setItem('loginRedirect', JSON.stringify(location));
    } else {
      sessionStorage.removeItem('loginRedirect');
    }
    setLoginRedirectState(location);
  };

  const clearLoginRedirect = () => {
    sessionStorage.removeItem('loginRedirect');
    setLoginRedirectState(null);
  };

  useEffect(() => {
    const fetchSessionAndProfile = async () => {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      setSession(session);
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (sessionError || !currentUser) {
        setProfile(null);
        setRole(null);
        setMuaProfileExists(null);
        setLoading(false);
        return;
      }
      
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", currentUser.id)
        .single();

      if (profileError) {
        console.error("AuthContext Error: Gagal mengambil profil.", profileError);
        setProfile(null);
        setRole(null);
        setMuaProfileExists(null);
      } else if (profileData) {
        // --- PERBAIKAN 1: Gunakan properti yang benar dari database ---
        const typedProfile = profileData as Profile;
        setProfile(typedProfile);
        setRole(typedProfile.user_type as 'customer' | 'mua'); // Menggunakan user_type
        // -------------------------------------------------------------

        if (typedProfile.user_type === 'mua') {
          // --- PERBAIKAN 2: Gunakan query yang lebih aman untuk TypeScript ---
          const { data: muaProfile, error: muaProfileError } = await supabase
            .from('mua_profiles')
            .select('id')
            .eq('profile_id', typedProfile.id)
            .limit(1)
            .single();
          
          setMuaProfileExists(!!muaProfile && !muaProfileError);
          // -----------------------------------------------------------------
        } else {
          setMuaProfileExists(null);
        }
      }
      setLoading(false);
    };

    fetchSessionAndProfile();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        fetchSessionAndProfile();
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    // ... (fungsi signIn tidak berubah)
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    return { error };
  };

  const signUp = async (email: string, password: string, userData: { fullName: string; userType: 'customer' | 'mua'; phone?: string; }) => {
    // ... (fungsi signUp tidak berubah)
    const { error } = await supabase.auth.signUp({
        email, password,
        options: {
          data: {
            full_name: userData.fullName,
            user_type: userData.userType,
            phone: userData.phone
          }
        }
      });
      return { error };
  };

   const signOut = async () => {
    // ... (fungsi signOut tidak berubah)
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    
    setUser(null);
    setProfile(null);
    setSession(null);
    setRole(null);
    setMuaProfileExists(null);

    setLoading(false);
    return { error };
  };
  
  const value = { user, profile, session, role, loading, muaProfileExists, loginRedirect, setLoginRedirect, clearLoginRedirect, signIn, signUp, signOut };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};