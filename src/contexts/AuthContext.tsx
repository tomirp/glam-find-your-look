import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

// Tipe data untuk lokasi redirect
type RedirectLocation = {
  pathname: string;
  state: any;
};

interface AuthContextType {
  user: User | null;
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

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<'customer' | 'mua' | null>(null);
  const [muaProfileExists, setMuaProfileExists] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  
  // **PERBAIKAN: Gunakan sessionStorage untuk menyimpan redirect**
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

      if (sessionError) {
        setRole(null);
        setMuaProfileExists(null);
      } else if (currentUser) {
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("id, user_type")
          .eq("user_id", currentUser.id)
          .single();

        if (profileError) {
          setRole(null);
          setMuaProfileExists(null);
        } else if (profile) {
          setRole(profile.user_type);
          if (profile.user_type === 'mua') {
            const { data: muaProfile, error: muaProfileError } = await supabase
              .from('mua_profiles')
              .select('id')
              .eq('profile_id', profile.id)
              .single();
            setMuaProfileExists(!!muaProfile && !muaProfileError);
          } else {
            setMuaProfileExists(null);
          }
        } else {
          setRole(null);
          setMuaProfileExists(null);
        }
      } else {
        setRole(null);
        setMuaProfileExists(null);
      }
      setLoading(false);
    };

    fetchSessionAndProfile();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (_event !== 'SIGNED_OUT') {
          fetchSessionAndProfile();
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    return { error };
  };

  const signUp = async (email: string, password: string, userData: { fullName: string; userType: 'customer' | 'mua'; phone?: string; }) => {
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
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    
    // PERBAIKAN: Selalu bersihkan state lokal setelah logout
    // untuk memastikan UI diperbarui secara instan.
    setUser(null);
    setSession(null);
    setRole(null);
    setMuaProfileExists(null);

    setLoading(false);
    return { error };
  };
  
  const value = { user, session, role, loading, muaProfileExists, loginRedirect, setLoginRedirect, clearLoginRedirect, signIn, signUp, signOut };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};