// src/pages/SearchResults.tsx

import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Filter } from "lucide-react";
import Navbar from "@/components/Navbar";
import MUACard, { MUAProfileForCard } from "@/components/MUACard";
import MUACardSkeleton from "@/components/MUACardSkeleton";
import FilterSidebar, { Filters } from "@/components/FilterSidebar";

const useQuery = () => new URLSearchParams(useLocation().search);

const SearchResults = () => {
  const query = useQuery().get("q") || "";
  const [results, setResults] = useState<MUAProfileForCard[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State untuk filter yang dipilih pengguna secara langsung
  const [filters, setFilters] = useState<Filters>({
    price: [0, 5000000],
    rating: 0,
    specializations: [],
  });
  
  // PERUBAHAN: State baru untuk filter yang sudah di-debounce
  const [debouncedFilters, setDebouncedFilters] = useState<Filters>(filters);
  const [sortBy, setSortBy] = useState('popular');

  // PERUBAHAN: useEffect ini akan berjalan setiap kali 'filters' berubah
  // dan akan memperbarui 'debouncedFilters' setelah jeda 500ms.
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedFilters(filters);
    }, 500); // Jeda 500 milidetik

    // Bersihkan timeout jika 'filters' berubah lagi sebelum 500ms berlalu
    return () => {
      clearTimeout(handler);
    };
  }, [filters]);


  // PERUBAHAN: useEffect utama sekarang bergantung pada 'debouncedFilters'
  useEffect(() => {
    const performSearch = async () => {
      setLoading(true);
      
      const { data, error } = await supabase.rpc('advanced_mua_search', {
        p_query: query,
        p_min_price: debouncedFilters.price[0],
        p_max_price: debouncedFilters.price[1],
        p_min_rating: debouncedFilters.rating,
        p_specializations: debouncedFilters.specializations,
        p_sort_by: sortBy
      });

      if (error) {
        console.error("Error performing search:", error);
        setResults([]);
      } else {
        const mappedData = data.map((item: any) => ({
            ...item,
            price_range: `mulai dari Rp ${item.min_service_price.toLocaleString('id-ID')}`
        }));
        setResults(mappedData);
      }
      setLoading(false);
    };
    performSearch();
  }, [query, debouncedFilters, sortBy]); // Bergantung pada debouncedFilters, bukan filters

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Hasil Pencarian</h1>
            <p className="text-muted-foreground">Menampilkan hasil untuk "{query}"</p>
          </div>
          
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="md:hidden">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                {/* PERUBAHAN: Kirim state dan fungsi update ke FilterSidebar */}
                <FilterSidebar filters={filters} onFiltersChange={setFilters} />
              </SheetContent>
            </Sheet>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Urutkan" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="popular">Paling Populer</SelectItem>
                <SelectItem value="price_asc">Harga Terendah</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="hidden md:block md:col-span-1">
            <div className="sticky top-24">
                <h3 className="text-lg font-semibold mb-4">Filter Hasil</h3>
                <FilterSidebar filters={filters} onFiltersChange={setFilters} />
            </div>
          </div>
          <div className="md:col-span-3">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => <MUACardSkeleton key={i} />)}
              </div>
            ) : results.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.map(mua => (
                  <Link key={mua.id} to={`/mua/${mua.id}`}><MUACard {...mua} /></Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-24">
                <h2 className="text-xl font-semibold">Tidak Ada Hasil Ditemukan</h2>
                <p className="text-muted-foreground mt-2">Coba ubah kata kunci atau filter Anda.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchResults;