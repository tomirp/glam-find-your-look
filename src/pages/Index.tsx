import Navbar from "@/components/Navbar";
import SearchSection from "@/components/SearchSection";
import HeroSection from "@/components/HeroSection";
import BrandSection from "@/components/BrandSection";
import NearbyMUASection from "@/components/NearbyMUASection";
import PopularMUASection from "@/components/PopularMUASection";
import CategorySection from "@/components/CategorySection";
import Footer from "@/components/Footer"; // PERUBAHAN: Impor komponen Footer

const Index = () => {
  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <Navbar />
      <SearchSection />
      <HeroSection />
      <BrandSection />
      <NearbyMUASection />
      <PopularMUASection />
      <CategorySection />
      <Footer /> {/* PERUBAHAN: Tambahkan komponen Footer di sini */}

    </div>
  );
};

export default Index;
