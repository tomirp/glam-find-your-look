// src/components/Navbar.tsx

import { Link, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, LogOut } from "lucide-react";
import NotificationBell from "./NotificationBell";
import { useToast } from "@/hooks/use-toast"; // <-- 1. Impor useToast

const Navbar = () => {
  const { user, role, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast(); // <-- 2. Inisialisasi hook toast

  const handleSignOut = async () => {
    try {
      await signOut();
      // --- 3. Tambahkan notifikasi di sini ---
      toast({
        title: "Logout Berhasil",
        description: "Anda telah berhasil keluar dari akun.",
      });
      // ------------------------------------
      navigate('/');
    } catch (error: any) {
      toast({
        title: "Logout Gagal",
        description: error.message || "Terjadi kesalahan saat mencoba keluar.",
        variant: "destructive",
      });
    }
  };

  const profileLink = role === 'mua' ? '/mua/dashboard' : '/customer/profile';

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container h-16 flex items-center">
        <Link to="/" className="text-2xl font-bold font-heading text-primary mr-6">
          GlamFind
        </Link>
        <nav className="flex-1">
          {/* Bisa ditambahkan link navigasi lain di sini jika perlu */}
        </nav>
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <NotificationBell />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar>
                      <AvatarImage src={user.user_metadata.avatar_url} />
                      <AvatarFallback>{user.email?.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Akun Saya</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate(profileLink)}>
                    <User className="w-4 h-4 mr-2" /> Profil
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="w-4 h-4 mr-2" /> Keluar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button onClick={() => navigate('/auth')}>Masuk / Daftar</Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;