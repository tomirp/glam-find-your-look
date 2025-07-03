import Navbar from "@/components/Navbar";
import SearchSection from "@/components/SearchSection";
import HeroSection from "@/components/HeroSection";
import BrandSection from "@/components/BrandSection";
import NearbyMUASection from "@/components/NearbyMUASection";
import PopularMUASection from "@/components/PopularMUASection";
import CategorySection from "@/components/CategorySection";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <SearchSection />
      <HeroSection />
      <BrandSection />
      <NearbyMUASection />
      <PopularMUASection />
      <CategorySection />
    </div>
  );
};

export default Index;
