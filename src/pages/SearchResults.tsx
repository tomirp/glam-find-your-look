import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Search, Filter, MapPin } from "lucide-react";
import MUACard from "@/components/MUACard";

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("query") || "");
  const [selectedLocation, setSelectedLocation] = useState(searchParams.get("location") || "Jakarta Selatan");
  const [sortBy, setSortBy] = useState("rating");
  const [filterDistance, setFilterDistance] = useState("all");

  // Mock data for MUA search results
  const allMUAs = [
    {
      id: "1",
      name: "Sarah Makeup Artist",
      rating: 4.8,
      reviews: 127,
      location: "Kemang",
      distance: "2.5 km",
      specialty: "Bridal & Party Makeup",
      price: "Rp 300.000"
    },
    {
      id: "2",
      name: "Maya Beauty Studio",
      rating: 4.9,
      reviews: 89,
      location: "Pondok Indah",
      distance: "3.1 km",
      specialty: "Korean & Natural Look",
      price: "Rp 250.000"
    },
    {
      id: "3",
      name: "Dinda MUA",
      rating: 4.7,
      reviews: 156,
      location: "Cipete",
      distance: "1.8 km",
      specialty: "Graduation & Photoshoot",
      price: "Rp 200.000"
    },
    {
      id: "4",
      name: "Rika Professional",
      rating: 4.9,
      reviews: 203,
      location: "Senayan",
      distance: "4.2 km",
      specialty: "Editorial & Fashion",
      price: "Rp 400.000"
    },
    {
      id: "5",
      name: "Luna Beauty Expert",
      rating: 5.0,
      reviews: 342,
      location: "Menteng",
      distance: "5.2 km",
      specialty: "Celebrity & Red Carpet",
      price: "Rp 800.000",
      isPopular: true
    },
    {
      id: "6",
      name: "Aesthetic by Vina",
      rating: 4.9,
      reviews: 289,
      location: "Kelapa Gading",
      distance: "7.8 km",
      specialty: "Bridal & Pre-wedding",
      price: "Rp 600.000",
      isPopular: true
    }
  ];

  const [filteredMUAs, setFilteredMUAs] = useState(allMUAs);

  useEffect(() => {
    let results = allMUAs;

    // Filter by search query
    if (searchQuery) {
      results = results.filter(mua => 
        mua.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mua.specialty.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by distance
    if (filterDistance !== "all") {
      const maxDistance = parseFloat(filterDistance);
      results = results.filter(mua => 
        parseFloat(mua.distance.replace(" km", "")) <= maxDistance
      );
    }

    // Sort results
    results.sort((a, b) => {
      switch (sortBy) {
        case "rating":
          return b.rating - a.rating;
        case "price-low":
          return parseInt(a.price.replace(/[^0-9]/g, "")) - parseInt(b.price.replace(/[^0-9]/g, ""));
        case "price-high":
          return parseInt(b.price.replace(/[^0-9]/g, "")) - parseInt(a.price.replace(/[^0-9]/g, ""));
        case "distance":
          return parseFloat(a.distance.replace(" km", "")) - parseFloat(b.distance.replace(" km", ""));
        default:
          return 0;
      }
    });

    setFilteredMUAs(results);
  }, [searchQuery, sortBy, filterDistance]);

  const handleSearch = () => {
    // Search is handled by useEffect automatically
    console.log("Searching for:", searchQuery, "in", selectedLocation);
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
                {filteredMUAs.length} MUA ditemukan
              </span>
            </div>

            <div className="flex items-center gap-4">
              {/* Distance Filter */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Jarak:</span>
                <Select value={filterDistance} onValueChange={setFilterDistance}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua</SelectItem>
                    <SelectItem value="2">≤ 2 km</SelectItem>
                    <SelectItem value="5">≤ 5 km</SelectItem>
                    <SelectItem value="10">≤ 10 km</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sort By */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Urutkan:</span>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rating">Rating Tertinggi</SelectItem>
                    <SelectItem value="distance">Jarak Terdekat</SelectItem>
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
        {filteredMUAs.length > 0 ? (
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
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Tidak ada MUA ditemukan
            </h3>
            <p className="text-muted-foreground">
              Coba ubah kata kunci pencarian atau filter yang digunakan
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResults;