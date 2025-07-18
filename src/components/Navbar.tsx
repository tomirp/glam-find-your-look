import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator, // Penting: tambahkan import ini
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { User, ChevronDown, Activity as ActivityIcon } from "lucide-react"; // Impor ikon Activity
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const Navbar = () => {
  // Ambil state yang relevan dari context, termasuk 'role'
  const { user, role, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fungsi untuk navigasi ke halaman profil yang sesuai
  const handleProfileClick = () => {
    if (role === 'mua') {
      navigate('/mua/profile');
    } else if (role === 'customer') {
      navigate('/customer/profile');
    } else {
      // Jika role tidak ditemukan, fallback ke halaman login
      toast({ title: "Role tidak ditemukan", description: "Silakan login kembali.", variant: "destructive" });
      navigate('/auth');
    }
  };

  // Fungsi khusus untuk menangani proses logout
  const handleLogout = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Berhasil",
        description: "Anda berhasil keluar.",
      });
      // WAJIB: Arahkan ke halaman utama setelah logout
      navigate("/");
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-background border-b border-border shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <h1 onClick={() => navigate('/')} className="text-2xl font-bold text-primary font-heading cursor-pointer">
            GlamFind
          </h1>
        </div>

        <div className="flex items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-2">
                <User className="w-5 h-5" />
                <span className="hidden sm:inline">
                  {user ? "Akun Saya" : "Masuk"}
                </span>
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {!user ? (
                <DropdownMenuItem onClick={() => navigate("/auth")} className="cursor-pointer">
                  Masuk / Daftar
                </DropdownMenuItem>
              ) : (
                <>
                  <DropdownMenuItem onClick={handleProfileClick} className="cursor-pointer">
                    Profil Saya
                  </DropdownMenuItem>

                  {/* Tambahkan menu "Aktivitas" hanya untuk customer */}
                  {role === 'customer' && (
                    <DropdownMenuItem onClick={() => navigate("/aktivitas")} className="cursor-pointer">
                      <ActivityIcon className="h-4 w-4 mr-2" />
                      Aktivitas
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:bg-destructive focus:text-destructive-foreground">
                    Keluar
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;