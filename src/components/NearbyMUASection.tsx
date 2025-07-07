
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import MUACard from "./MUACard";
import { useMUAProfiles } from "@/hooks/useMUAProfiles";

const NearbyMUASection = () => {
  const { data: nearbyMUAs, isLoading, error } = useMUAProfiles({
    sortBy: 'rating'
  });

  if (error) {
    return (
      <section className="py-16 bg-secondary/20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-12 font-heading">
            MUA yang Dekat Dengan Anda
          </h2>
          <div className="text-center py-8">
            <p className="text-muted-foreground">Gagal memuat data MUA. Silakan coba lagi.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-secondary/20">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-12 font-heading">
          MUA yang Dekat Dengan Anda
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading ? (
            // Loading skeletons
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="space-y-4">
                <Skeleton className="h-48 w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ))
          ) : nearbyMUAs && nearbyMUAs.length > 0 ? (
            nearbyMUAs.slice(0, 4).map((mua) => (
              <Link key={mua.id} to={`/mua/${mua.id}`}>
                <MUACard
                  id={mua.id}
                  name={mua.profile?.full_name || "MUA"}
                  businessName={mua.business_name}
                  rating={Number(mua.rating) || 0}
                  reviews={mua.total_reviews || 0}
                  location={mua.location_city}
                  address={mua.location_address}
                  specializations={mua.specializations || []}
                  priceRange={mua.price_range}
                  avatarUrl={mua.profile?.avatar_url}
                  portfolioImages={mua.portfolio_images}
                />
              </Link>
            ))
          ) : (
            <div className="col-span-full text-center py-8">
              <p className="text-muted-foreground">Belum ada MUA terdaftar di area ini.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default NearbyMUASection;
