import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { User, ChevronDown } from "lucide-react";

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName] = useState("Sarah");

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
                  {isLoggedIn ? `Hello, ${userName}` : "Akun"}
                </span>
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {!isLoggedIn ? (
                <>
                  <DropdownMenuItem 
                    onClick={() => setIsLoggedIn(true)}
                    className="cursor-pointer"
                  >
                    Sign In
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer">
                    Sign Up
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
                    onClick={() => setIsLoggedIn(false)}
                    className="cursor-pointer text-destructive"
                  >
                    Logout
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