import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MapPin } from "lucide-react";

const SearchSection = () => {
  const navigate = useNavigate();
  const [selectedLocation, setSelectedLocation] = useState("Jakarta Selatan");
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="bg-secondary/30 py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center gap-4 max-w-4xl mx-auto">
          {/* Location Selector */}
          <div className="flex items-center space-x-2 min-w-fit">
            <MapPin className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
              Lokasi Anda:
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
            onClick={() => {
              const params = new URLSearchParams();
              if (searchQuery) params.set("query", searchQuery);
              params.set("location", selectedLocation);
              navigate(`/search?${params.toString()}`);
            }}
          >
            Cari
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SearchSection;