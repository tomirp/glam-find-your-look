import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import MUACard, { MUAProfileForCard } from "./MUACard";
import { supabase } from "@/integrations/supabase/client";

const PopularMUASection = () => {
  const [popularMUAs, setPopularMUAs] = useState<MUAProfileForCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPopularMUAs = async () => {
      setLoading(true);
      // Mengambil MUA dan mengurutkannya berdasarkan rating tertinggi
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
        .order('rating', { ascending: false, nullsFirst: false })
        .limit(4);

      if (error) {
        console.error("Error fetching popular MUAs:", error);
      } else {
        setPopularMUAs(data || []);
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
        
        {loading ? (
          <p className="text-center">Memuat MUA populer...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularMUAs.map((mua) => (
              <Link key={mua.id} to={`/mua/${mua.id}`}>
                <MUACard {...mua} isPopular={true} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default PopularMUASection;