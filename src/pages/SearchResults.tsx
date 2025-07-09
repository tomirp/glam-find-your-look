import { useState, useEffect } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Search, Filter, MapPin } from "lucide-react";
import MUACard, { MUAProfileForCard } from "@/components/MUACard";
import { supabase } from "@/integrations/supabase/client";

const SearchResults = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState(searchParams.get("query") || "");
  const [selectedLocation, setSelectedLocation] = useState(searchParams.get("location") || "Jakarta Selatan");
  const [sortBy, setSortBy] = useState("rating");
  
  const [filteredMUAs, setFilteredMUAs] = useState<MUAProfileForCard[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchMUAData = async () => {
      setLoading(true);
      
      let query = supabase
        .from('mua_profiles')
        // **PERBAIKAN DI SINI: Menambahkan cover_image_url**
        .select(`
          id,
          business_name,
          rating,
          total_reviews,
          location_city,
          specializations,
          price_range,
          cover_image_url
        `);

      // Filter berdasarkan query pencarian
      if (searchQuery) {
        query = query.ilike('business_name', `%${searchQuery}%`);
      }
      
      // Filter berdasarkan lokasi
      if (selectedLocation) {
        query = query.eq('location_city', selectedLocation);
      }
      
      // Urutkan hasil
      if (sortBy === 'rating') {
        query = query.order('rating', { ascending: false, nullsFirst: false });
      } else if (sortBy === 'price-low') {
        // Pengurutan berdasarkan harga memerlukan penanganan lebih lanjut
        // karena price_range adalah string. Untuk saat ini, kita urutkan berdasarkan nama.
        query = query.order('business_name', { ascending: true });
      } else if (sortBy === 'price-high') {
        query = query.order('business_name', { ascending: false });
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching search results:", error);
      } else {
        setFilteredMUAs(data || []);
      }
      setLoading(false);
    };

    fetchMUAData();
  }, [searchQuery, selectedLocation, sortBy]);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("query", searchQuery);
    if (selectedLocation) params.set("location", selectedLocation);
    navigate(`/search?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-background border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4 mb-4">
            <Link to="/">
              <Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button>
            </Link>
            <h1 className="text-2xl font-bold text-foreground font-heading">Hasil Pencarian MUA</h1>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-4 max-w-4xl">
            <div className="flex items-center space-x-2 min-w-fit">
              <MapPin className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">Lokasi:</span>
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger className="w-40 border-0 bg-transparent font-medium text-foreground"><SelectValue /></SelectTrigger>
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
            <div className="flex-1 w-full md:max-w-lg relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Cari MUA atau gaya makeup..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10 pr-4 py-3 w-full bg-background border-border focus:border-primary"
              />
            </div>
            <Button onClick={handleSearch} className="px-8 py-3 bg-primary hover:bg-primary/90 text-primary-foreground">Cari</Button>
          </div>
        </div>
      </div>

      <div className="bg-secondary/20 py-4">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Filter className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">{filteredMUAs.length} MUA ditemukan</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Urutkan:</span>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
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

      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <p className="text-center">Mencari...</p>
        ) : filteredMUAs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredMUAs.map((mua) => (
              <Link key={mua.id} to={`/mua/${mua.id}`}>
                <MUACard {...mua} />
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Tidak ada MUA ditemukan</h3>
            <p className="text-muted-foreground">Coba ubah kata kunci pencarian atau filter yang digunakan</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResults;