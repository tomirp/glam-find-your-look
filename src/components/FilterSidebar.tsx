// src/components/FilterSidebar.tsx

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

export interface Filters {
  price: [number, number];
  rating: number;
  specializations: string[];
}

interface FilterSidebarProps {
  // PERUBAHAN: Prop diubah untuk menerima state dan fungsi update
  filters: Filters;
  onFiltersChange: (newFilters: Filters) => void;
}

const FilterSidebar = ({ filters, onFiltersChange }: FilterSidebarProps) => {
  const [availableSpecs, setAvailableSpecs] = useState<string[]>([]);

  useEffect(() => {
    const fetchSpecs = async () => {
      const { data } = await supabase.rpc('get_all_specializations');
      if (data) {
        setAvailableSpecs(data.map((s: any) => s.specialization));
      }
    };
    fetchSpecs();
  }, []);

  // PERUBAHAN: Fungsi sekarang langsung memanggil onFiltersChange
  const handlePriceChange = (newPrice: [number, number]) => {
    onFiltersChange({ ...filters, price: newPrice });
  };
  
  const handleRatingChange = (newRating: string) => {
    onFiltersChange({ ...filters, rating: Number(newRating) });
  };

  const handleSpecChange = (spec: string, checked: boolean) => {
    const newSpecs = checked 
      ? [...filters.specializations, spec] 
      : filters.specializations.filter(s => s !== spec);
    onFiltersChange({ ...filters, specializations: newSpecs });
  };

  return (
    <div className="p-4 space-y-6">
      <div>
        <h4 className="font-semibold mb-4">Rentang Harga</h4>
        {/* PERUBAHAN: onValueChange sekarang memanggil fungsi handle */}
        <Slider value={filters.price} onValueChange={handlePriceChange} max={5000000} step={100000} />
        <div className="flex justify-between text-sm text-muted-foreground mt-2">
          <span>Rp {filters.price[0].toLocaleString('id-ID')}</span>
          <span>Rp {filters.price[1].toLocaleString('id-ID')}</span>
        </div>
      </div>
      <div>
        <h4 className="font-semibold mb-2">Rating Minimum</h4>
        <RadioGroup value={String(filters.rating)} onValueChange={handleRatingChange}>
          <div className="flex items-center space-x-2"><RadioGroupItem value="4" id="r4" /><Label htmlFor="r4">4 Bintang ke atas</Label></div>
          <div className="flex items-center space-x-2"><RadioGroupItem value="3" id="r3" /><Label htmlFor="r3">3 Bintang ke atas</Label></div>
          <div className="flex items-center space-x-2"><RadioGroupItem value="0" id="r0" /><Label htmlFor="r0">Semua Rating</Label></div>
        </RadioGroup>
      </div>
      <div>
        <h4 className="font-semibold mb-2">Layanan</h4>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {availableSpecs.map(spec => (
            <div key={spec} className="flex items-center space-x-2">
              <Checkbox 
                id={spec} 
                checked={filters.specializations.includes(spec)}
                onCheckedChange={(checked) => handleSpecChange(spec, !!checked)} 
              />
              <Label htmlFor={spec}>{spec}</Label>
            </div>
          ))}
        </div>
      </div>
      {/* Tombol "Terapkan" sudah dihapus */}
    </div>
  );
};

export default FilterSidebar;