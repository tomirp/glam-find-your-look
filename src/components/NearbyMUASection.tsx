// src/components/NearbyMUASection.tsx

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

const NearbyMUASection = () => {
  const [nearbyMUAs, setNearbyMUAs] = useState<MUAProfileForCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNearbyMUAs = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("mua_profiles")
        .select(`id, business_name, rating, total_reviews, location_city, specializations, cover_image_url, services(price_min)`)
        .limit(4);

      if (error) {
        console.error("Error fetching nearby MUAs:", error);
        setNearbyMUAs([]);
      } else {
        const processedData = (data as MUAProfileWithServices[]).map((mua) => ({
            ...mua,
            price_range: formatPriceRange(mua.services)
        }));
        setNearbyMUAs(processedData);
      }
      setLoading(false);
    };
    fetchNearbyMUAs();
  }, []);

  return (
    <section className="py-16 bg-secondary/20">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-12 font-heading">
          MUA yang Dekat Dengan Anda
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {loading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <MUACardSkeleton key={index} />
            ))
          ) : (
            nearbyMUAs.map((mua) => (
              <Link key={mua.id} to={`/mua/${mua.id}`}><MUACard {...mua} /></Link>
            ))
          )}
        </div>
      </div>
    </section>
  );
};
export default NearbyMUASection;