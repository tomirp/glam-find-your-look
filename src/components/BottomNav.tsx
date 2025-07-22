// src/components/BottomNav.tsx

import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { Home, ClipboardList, User } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";

const BottomNav = () => {
    const { role } = useAuth();
    const { pathname } = useLocation();

    // PERBAIKAN 1: Tentukan halaman mana saja yang boleh menampilkan BottomNav
    const allowedPaths = ["/", "/search", "/aktivitas", "/customer/profile"];
    const isMUIDetailPage = /^\/mua\/[a-zA-Z0-9-]+$/.test(pathname);

    const isVisible = allowedPaths.includes(pathname) || isMUIDetailPage;

    // Sembunyikan jika tidak diizinkan atau jika pengguna adalah MUA
    if (!isVisible || role === 'mua') {
        return null;
    }

    const navItems = [
        { href: "/", icon: Home, label: "Home" },
        { href: "/aktivitas", icon: ClipboardList, label: "Aktivitas" },
        { href: "/customer/profile", icon: User, label: "Akun" },
    ];

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 h-16 bg-card border-t border-border shadow-t-lg">
            {/* PERBAIKAN 2: Grid sekarang menjadi 3 kolom */}
            <div className="grid h-full grid-cols-3 mx-auto">
                {navItems.map((item) => (
                    <NavLink
                        key={item.label}
                        to={item.href}
                        className={({ isActive }) =>
                            cn(
                                "inline-flex flex-col items-center justify-center px-2 hover:bg-accent group",
                                // Logika 'isActive' untuk menyorot ikon Home di halaman detail MUA atau profil
                                (isActive || (item.href === "/" && isMUIDetailPage)) ? "text-primary" : "text-muted-foreground"
                            )
                        }
                    >
                        <item.icon className="w-5 h-5 mb-1" />
                        <span className="text-xs">{item.label}</span>
                    </NavLink>
                ))}
            </div>
        </div>
    );
};

export default BottomNav;