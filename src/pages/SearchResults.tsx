
import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Search, Filter, MapPin } from "lucide-react";
import MUACard from "@/components/MUACard";
import { useMUAProfiles } from "@/hooks/useMUAProfiles";

const SearchResults = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("query") || "");
  const [selectedLocation, setSelectedLocation] = useState(searchParams.get("location") || "Jakarta Selatan");
  const [sortBy, setSortBy] = useState("rating");
  const [filterDistance, setFilterDistance] = useState("all");

  const { data: muaResults, isLoading, error } = useMUAProfiles({
    city: selectedLocation,
    search: searchQuery,
    sortBy: sortBy
  });

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("query", searchQuery);
    params.set("location", selectedLocation);
    setSearchParams(params);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-background border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4 mb-4">
            <Link to="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-foreground font-heading">
              Hasil Pencarian MUA
            </h1>
          </div>

          {/* Search Bar */}
          <div className="flex flex-col md:flex-row items-center gap-4 max-w-4xl">
            {/* Location Selector */}
            <div className="flex items-center space-x-2 min-w-fit">
              <MapPin className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                Lokasi:
              </span>
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger className="w-40 border-0 bg-transparent font-medium text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Jakarta Selatan">Jakarta Selatan</SelectItem>
                  <SelectItem value="Jakarta Pusat">Jakarta Pusat</SelectItem>
                  <SelectItem value="Jakarta Utara">Jakarta Utara</SelectItem>
                  <SelectItem value="Jakarta Barat">Jakarta Barat</SelectItem>
                  <SelectItem value="Jakarta Timur">Jakarta Timur</SelectItem>
                  <SelectItem value="Tangerang">Tangerang</SelectItem>
                  <SelectItem value="Bekasi">Bekasi</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Search Bar */}
            <div className="flex-1 w-full md:max-w-lg relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Cari MUA, gaya makeup, atau brand..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-10 pr-4 py-3 w-full bg-background border-border focus:border-primary"
              />
            </div>

            {/* Search Button */}
            <Button 
              className="px-8 py-3 bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={handleSearch}
            >
              Cari
            </Button>
          </div>
        </div>
      </div>

      {/* Filters & Sorting */}
      <div className="bg-secondary/20 py-4">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Filter className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">
                {isLoading ? "Mencari..." : `${muaResults?.length || 0} MUA ditemukan`}
              </span>
            </div>

            <div className="flex items-center gap-4">
              {/* Sort By */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Urutkan:</span>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rating">Rating Tertinggi</SelectItem>
                    <SelectItem value="price-low">Harga Terendah</SelectItem>
                    <SelectItem value="price-high">Harga Tertinggi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="container mx-auto px-4 py-8">
        {error ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Terjadi kesalahan
            </h3>
            <p className="text-muted-foreground">
              Gagal memuat data MUA. Silakan coba lagi.
            </p>
          </div>
        ) : isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="space-y-4">
                <Skeleton className="h-48 w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ))}
          </div>
        ) : muaResults && muaResults.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {muaResults.map((mua) => (
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
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Tidak ada MUA ditemukan
            </h3>
            <p className="text-muted-foreground">
              Coba ubah kata kunci pencarian atau lokasi yang dipilih
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResults;
