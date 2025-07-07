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

  // Session timeout - 24 hours
  const SESSION_TIMEOUT = 24 * 60 * 60 * 1000;

  useEffect(() => {
    const fetchSessionAndRole = async () => {
      console.log("Mulai mengambil sesi...");
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("Error mengambil sesi:", sessionError);
        setLoading(false);
        return;
      }
      
      // Check session expiry
      if (session && session.expires_at) {
        const expiresAt = session.expires_at * 1000; // Convert to milliseconds
        const now = Date.now();
        
        if (now >= expiresAt) {
          console.log("Session expired, signing out");
          await supabase.auth.signOut();
          setSession(null);
          setUser(null);
          setRole(null);
          setLoading(false);
          return;
        }
      }
      
      setSession(session);
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        console.log("Sesi ditemukan untuk:", currentUser.email);
        
        // Check if email is verified (if email confirmation is enabled)
        if (currentUser.email_confirmed_at === null) {
          console.warn("Email belum diverifikasi untuk user:", currentUser.email);
          // You might want to redirect to email verification page here
        }
        
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
      
      setLoading(false);
      console.log("Proses autentikasi awal selesai.");
    };

    fetchSessionAndRole();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        console.log("Status Auth berubah, event:", _event);
        fetchSessionAndRole();
      }
    );

    // Set up session timeout check
    const sessionTimeoutInterval = setInterval(() => {
      if (session && session.expires_at) {
        const expiresAt = session.expires_at * 1000;
        const now = Date.now();
        
        if (now >= expiresAt) {
          console.log("Session timeout, signing out");
          supabase.auth.signOut();
        }
      }
    }, 60000); // Check every minute

    return () => {
      subscription.unsubscribe();
      clearInterval(sessionTimeoutInterval);
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    
    // Basic input validation and sanitization
    const sanitizedEmail = email.trim().toLowerCase();
    
    if (!sanitizedEmail || !password) {
      setLoading(false);
      return { error: { message: "Email dan password harus diisi" } };
    }
    
    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sanitizedEmail)) {
      setLoading(false);
      return { error: { message: "Format email tidak valid" } };
    }
    
    const { error } = await supabase.auth.signInWithPassword({ 
      email: sanitizedEmail, 
      password 
    });
    
    return { error };
  };

  const signUp = async (email: string, password: string, userData: { fullName: string; userType: 'customer' | 'mua'; phone?: string; }) => {
    // Input validation and sanitization
    const sanitizedEmail = email.trim().toLowerCase();
    const sanitizedFullName = userData.fullName.trim();
    const sanitizedPhone = userData.phone?.trim();
    
    if (!sanitizedEmail || !password || !sanitizedFullName) {
      return { error: { message: "Semua field wajib harus diisi" } };
    }
    
    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sanitizedEmail)) {
      return { error: { message: "Format email tidak valid" } };
    }
    
    // Password strength validation
    if (password.length < 8) {
      return { error: { message: "Password minimal 8 karakter" } };
    }
    
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return { error: { message: "Password harus mengandung huruf besar, huruf kecil, dan angka" } };
    }
    
    // Phone validation if provided
    if (sanitizedPhone && !/^\d{10,15}$/.test(sanitizedPhone.replace(/\D/g, ''))) {
      return { error: { message: "Format nomor telepon tidak valid" } };
    }
    
    const { data, error } = await supabase.auth.signUp({
      email: sanitizedEmail, 
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth`,
        data: {
          full_name: sanitizedFullName,
          user_type: userData.userType,
          phone: sanitizedPhone
        }
      }
    });

    if (error) {
      return { error };
    }
    
    if (data.user) {
        const { error: profileError } = await supabase.from('profiles').insert({
            user_id: data.user.id,
            full_name: sanitizedFullName,
            user_type: userData.userType,
            phone: sanitizedPhone,
        });
        if (profileError) return { error: profileError };
    }

    return { error: null };
  };

  const signOut = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const value = { user, session, role, loading, signIn, signUp, signOut };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
