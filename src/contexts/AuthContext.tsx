
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

  const fetchUserRole = async (user: User | null) => {
    if (!user) {
      console.log("No user provided to fetchUserRole");
      setRole(null);
      setLoading(false);
      return null;
    }
    try {
      console.log("Fetching user role for user:", user.id);
      const { data, error } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('user_id', user.id)
        .single();
      
      if (error) {
        console.error("Error fetching user role:", error);
        throw error;
      }
      
      console.log("User role fetched:", data.user_type);
      return data.user_type;
    } catch (e) {
      console.error("Gagal mengambil peran pengguna:", e);
      return null;
    }
  };
  
  useEffect(() => {
    console.log("AuthProvider initializing...");
    setLoading(true);
    
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log("Initial session check:", session?.user?.email || "No session");
      setSession(session);
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      if (currentUser) {
        const userRole = await fetchUserRole(currentUser);
        setRole(userRole);
        console.log("Initial role set:", userRole);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state change:", event, session?.user?.email || "No session");
        setSession(session);
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        
        if (currentUser) {
          const userRole = await fetchUserRole(currentUser);
          setRole(userRole);
          console.log("Role updated:", userRole);
        } else {
          setRole(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    console.log("Attempting sign in for:", email);
    setLoading(true);
    
    const { data: loginData, error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error || !loginData.user) {
      console.error("Sign in error:", error);
      setLoading(false);
      return { error };
    }
    
    console.log("Sign in successful for:", loginData.user.email);
    const userRole = await fetchUserRole(loginData.user);
    setUser(loginData.user);
    setSession(loginData.session);
    setRole(userRole);
    setLoading(false);
    
    console.log("Final auth state - User:", loginData.user.email, "Role:", userRole);
    return { error: null };
  };

  const signUp = async (email: string, password: string, userData: { fullName: string; userType: 'customer' | 'mua'; phone?: string; }) => {
    console.log("Attempting sign up for:", email, "as", userData.userType);
    const redirectUrl = `${window.location.origin}/`;
    
    const { data, error } = await supabase.auth.signUp({
      email, password, options: { emailRedirectTo: redirectUrl, data: {
          full_name: userData.fullName, user_type: userData.userType, phone: userData.phone,
      }}
    });
    
    if (!error && data.user) {
      console.log("User created, creating profile...");
      const { error: profileError } = await supabase.from('profiles').insert({
          user_id: data.user.id, full_name: userData.fullName, user_type: userData.userType, phone: userData.phone,
      });
      if (profileError) { 
        console.error('Error creating profile:', profileError); 
      } else {
        console.log("Profile created successfully");
      }
    }
    return { error };
  };

  const signOut = async () => {
    console.log("Signing out...");
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setRole(null);
    setLoading(false);
    return { error };
  };

  const value = { user, session, role, loading, signIn, signUp, signOut };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
