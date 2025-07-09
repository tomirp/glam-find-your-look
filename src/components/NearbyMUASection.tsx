import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import MUACard, { MUAProfileForCard } from "./MUACard";
import { supabase } from "@/integrations/supabase/client";

const NearbyMUASection = () => {
  const [nearbyMUAs, setNearbyMUAs] = useState<MUAProfileForCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNearbyMUAs = async () => {
      setLoading(true);
      // Mengambil 4 MUA secara acak sebagai simulasi "terdekat"
      const { data, error } = await supabase
        .from("mua_profiles")
        .select(`
          id,
          business_name,
          rating,
          total_reviews,
          location_city,
          specializations,
          price_range
        `)
        .limit(4);

      if (error) {
        console.error("Error fetching nearby MUAs:", error);
      } else {
        setNearbyMUAs(data || []);
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
        
        {loading ? (
          <p className="text-center">Memuat MUA terdekat...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {nearbyMUAs.map((mua) => (
              <Link key={mua.id} to={`/mua/${mua.id}`}>
                <MUACard {...mua} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default NearbyMUASection;