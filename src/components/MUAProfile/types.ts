// src/components/MUAProfile/types.ts

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
  vehicle_availability: 'none' | 'motorcycle' | 'car';
  profile_id: string;
  specializations: string[] | null;
  cover_image_url: string | null;
}

export interface UserProfile {
  id: string;
  full_name: string;
  phone: string | null;
  avatar_url: string | null;
  bio: string | null;
  email?: string; // Tambahkan email untuk MUAOnboardingForm
}

export interface Booking {
  id: string;
  booking_date: string;
  booking_time: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';
  total_price: number;
  customer_notes: string | null;
  profiles: { // This is the customer's profile
    full_name: string | null;
  } | null;
  services: { // This is the service booked
    name: string | null;
  } | null;
  // This is the corrected part:
  payments: { payment_status: string; } | null; // Can be an object or null
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
  vehicle_availability: 'none' | 'motorcycle' | 'car'; // Pastikan ini ada
}

export interface Review {
  id: string;
  rating: number;
  review_text: string | null;
  created_at: string;
  profiles: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}