
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface MUAProfile {
  id: string;
  business_name: string;
  location_city: string;
  location_address: string;
  rating: number;
  total_reviews: number;
  specializations: string[];
  price_range: string;
  is_available: boolean;
  portfolio_images: string[];
  profile: {
    full_name: string;
    avatar_url: string;
  };
}

export const useMUAProfiles = (filters?: {
  city?: string;
  search?: string;
  distance?: number;
  sortBy?: string;
}) => {
  return useQuery({
    queryKey: ['mua-profiles', filters],
    queryFn: async () => {
      let query = supabase
        .from('mua_profiles')
        .select(`
          id,
          business_name,
          location_city,
          location_address,
          rating,
          total_reviews,
          specializations,
          price_range,
          is_available,
          portfolio_images,
          profile:profiles(
            full_name,
            avatar_url
          )
        `)
        .eq('is_available', true);

      // Apply filters
      if (filters?.city) {
        query = query.eq('location_city', filters.city);
      }

      if (filters?.search) {
        query = query.or(`business_name.ilike.%${filters.search}%,specializations.cs.{${filters.search}}`);
      }

      // Apply sorting
      switch (filters?.sortBy) {
        case 'rating':
          query = query.order('rating', { ascending: false });
          break;
        case 'price-low':
          query = query.order('price_range', { ascending: true });
          break;
        case 'price-high':
          query = query.order('price_range', { ascending: false });
          break;
        default:
          query = query.order('rating', { ascending: false });
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching MUA profiles:', error);
        throw error;
      }

      return data as MUAProfile[];
    },
  });
};

export const useMUAProfile = (id: string) => {
  return useQuery({
    queryKey: ['mua-profile', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mua_profiles')
        .select(`
          *,
          profile:profiles(*),
          services(*)
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching MUA profile:', error);
        throw error;
      }

      return data;
    },
    enabled: !!id,
  });
};
