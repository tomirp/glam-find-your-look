// src/components/Footer.tsx

import { Phone, Instagram, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Kolom Tentang Kami */}
          <div className="md:col-span-2">
            <h3 className="text-2xl font-bold font-heading text-primary mb-4">GlamFind</h3>
            <p className="text-muted-foreground max-w-md">
              GlamFind adalah platform terdepan yang menghubungkan Anda dengan makeup artist profesional terbaik di kota Anda. Temukan gaya yang sempurna dan pesan jadwal dengan mudah untuk setiap momen spesial Anda.
            </p>
          </div>
          
          {/* Kolom Kontak */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Hubungi Kami</h4>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-center gap-2 hover:text-primary transition-colors">
                <Phone className="h-4 w-4" />
                <span>+62 812 3456 7890</span>
              </li>
              <li className="flex items-center gap-2 hover:text-primary transition-colors">
                <Instagram className="h-4 w-4" />
                <span>@glamfind.id</span>
              </li>
              <li className="flex items-center gap-2 hover:text-primary transition-colors">
                <MessageCircle className="h-4 w-4" />
                <span>WhatsApp</span>
              </li>
            </ul>
          </div>

          {/* Kolom Perusahaan */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Perusahaan</h4>
            <ul className="space-y-3 text-muted-foreground">
              <li><Link to="/terms" className="hover:text-primary transition-colors">Syarat & Ketentuan</Link></li>
              <li><Link to="/privacy" className="hover:text-primary transition-colors">Kebijakan Privasi</Link></li>
              <li><Link to="/contact" className="hover:text-primary transition-colors">Kontak Kami</Link></li>
              <li><Link to="/career" className="hover:text-primary transition-colors">Karir</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-border pt-6 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} GlamFind. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;