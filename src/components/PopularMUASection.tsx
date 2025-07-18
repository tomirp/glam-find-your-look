// src/components/PopularMUASection.tsx

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import MUACard, { MUAProfileForCard } from "./MUACard";
import { supabase } from "@/integrations/supabase/client";
import MUACardSkeleton from "./MUACardSkeleton";

type MUAProfileWithServices = Omit<MUAProfileForCard, 'price_range'> & {
    services: { price_min: number }[];
};

const formatPriceRange = (services: { price_min: number }[]): string => {
    if (!services || services.length === 0) {
        return "Layanan belum tersedia";
    }

    const prices = services.map(s => s.price_min);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    
    const format = (price: number) => new Intl.NumberFormat('id-ID').format(price);

    if (minPrice === maxPrice) {
        return `Rp ${format(minPrice)}`;
    }

    return `Rp ${format(minPrice)} - ${format(maxPrice)}`;
};

const PopularMUASection = () => {
  const [popularMUAs, setPopularMUAs] = useState<MUAProfileForCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPopularMUAs = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("mua_profiles")
        .select(`id, business_name, rating, total_reviews, location_city, specializations, cover_image_url, services(price_min)`)
        .order('rating', { ascending: false, nullsFirst: false })
        .limit(4);

      if (error) {
        console.error("Error fetching popular MUAs:", error);
        setPopularMUAs([]);
      } else {
        const processedData = (data as MUAProfileWithServices[]).map((mua) => ({
            ...mua,
            price_range: formatPriceRange(mua.services)
        }));
        setPopularMUAs(processedData);
      }
      setLoading(false);
    };
    fetchPopularMUAs();
  }, []);

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-12 font-heading">
          Jasa Make-Up Populer
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {loading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <MUACardSkeleton key={index} />
            ))
          ) : (
            popularMUAs.map((mua) => (
              <Link key={mua.id} to={`/mua/${mua.id}`}><MUACard {...mua} isPopular={true} /></Link>
            ))
          )}
        </div>
      </div>
    </section>
  );
};
export default PopularMUASection;