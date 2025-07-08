export interface MUAProfile {
  id: string;
  business_name: string | null;
  location_city: string;
  location_address: string | null;
  rating: number | null;
  total_reviews: number | null;
  total_bookings: number | null;
  is_available: boolean | null;
  portfolio_images: string[] | null;
  profile_id: string;
}

export interface UserProfile {
  id: string;
  full_name: string;
  phone: string | null;
  avatar_url: string | null;
  bio: string | null;
}

export interface Booking {
  id: string;
  booking_date: string;
  booking_time: string;
  status: string;
  total_price: number;
  customer_notes: string | null;
  profiles: { full_name: string; };
  services: { name: string; };
}

export interface Service {
  id: string;
  name: string;
  description: string | null;
  price_min: number;
  price_max: number | null;
  duration_minutes: number | null;
  is_active: boolean | null;
  image_url: string | null;
}

export interface EditForm {
  business_name: string;
  full_name: string;
  phone: string;
  location_city: string;
  location_address: string;
  bio: string;
}