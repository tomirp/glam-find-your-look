import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { User, ChevronDown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const Navbar = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  return (
    <nav className="sticky top-0 z-50 bg-background border-b border-border shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-8">
          <h1 className="text-2xl font-bold text-primary font-heading">
            GlamFind
          </h1>
          
          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <a href="#" className="text-foreground hover:text-primary transition-colors font-medium">
              Beranda
            </a>
            <a href="#" className="text-foreground hover:text-primary transition-colors font-medium">
              Promo
            </a>
            <a href="#" className="text-foreground hover:text-primary transition-colors font-medium">
              Jadi Partner
            </a>
          </div>
        </div>

        {/* User Menu */}
        <div className="flex items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-2">
                <User className="w-5 h-5" />
                <span className="hidden sm:inline">
                  {user ? "Akun Saya" : "Akun"}
                </span>
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {!user ? (
                <>
                  <DropdownMenuItem 
                    onClick={() => navigate("/auth")}
                    className="cursor-pointer"
                  >
                    Masuk
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => navigate("/auth")}
                    className="cursor-pointer"
                  >
                    Daftar
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem className="cursor-pointer">
                    Profil Saya
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer">
                    Pesanan Saya
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={async () => {
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
                        navigate("/");
                      }
                    }}
                    className="cursor-pointer text-destructive"
                  >
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