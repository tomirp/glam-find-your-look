-- Create enum for user types
CREATE TYPE public.user_type AS ENUM ('customer', 'mua');

-- Create enum for booking status
CREATE TYPE public.booking_status AS ENUM ('pending', 'accepted', 'rejected', 'completed', 'cancelled');

-- Create enum for payment status
CREATE TYPE public.payment_status AS ENUM ('pending', 'paid', 'refunded', 'failed');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  user_type user_type NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  avatar_url TEXT,
  bio TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create MUA profiles table (extends profiles for MUA-specific data)
CREATE TABLE public.mua_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  business_name TEXT,
  experience_years INTEGER,
  price_range TEXT,
  location_city TEXT NOT NULL,
  location_address TEXT,
  specializations TEXT[],
  portfolio_images TEXT[],
  instagram_url TEXT,
  whatsapp_number TEXT,
  bank_account_number TEXT,
  bank_name TEXT,
  bank_account_name TEXT,
  rating DECIMAL(3,2) DEFAULT 0.00,
  total_reviews INTEGER DEFAULT 0,
  total_bookings INTEGER DEFAULT 0,
  is_available BOOLEAN DEFAULT TRUE,
  cover_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create services table
CREATE TABLE public.services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mua_profile_id UUID NOT NULL REFERENCES public.mua_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price_min INTEGER NOT NULL,
  price_max INTEGER,
  duration_minutes INTEGER,
  is_active BOOLEAN DEFAULT TRUE,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create bookings table
CREATE TABLE public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  mua_profile_id UUID NOT NULL REFERENCES public.mua_profiles(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  booking_date DATE NOT NULL,
  booking_time TIME NOT NULL,
  status booking_status DEFAULT 'pending',
  total_price INTEGER NOT NULL,
  customer_notes TEXT,
  mua_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create reviews table
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID NOT NULL UNIQUE REFERENCES public.bookings(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  mua_profile_id UUID NOT NULL REFERENCES public.mua_profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  review_images TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create payments table
CREATE TABLE public.payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID NOT NULL UNIQUE REFERENCES public.bookings(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  payment_method TEXT,
  payment_status payment_status DEFAULT 'pending',
  payment_provider TEXT,
  transaction_id TEXT,
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mua_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- RLS policies for mua_profiles
CREATE POLICY "Anyone can view MUA profiles" ON public.mua_profiles FOR SELECT USING (true);
CREATE POLICY "MUA can insert their own profile" ON public.mua_profiles FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = profile_id AND user_id = auth.uid() AND user_type = 'mua'));
CREATE POLICY "MUA can update their own profile" ON public.mua_profiles FOR UPDATE USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = profile_id AND user_id = auth.uid()));

-- RLS policies for services
CREATE POLICY "Anyone can view active services" ON public.services FOR SELECT USING (is_active = true);
CREATE POLICY "MUA can manage their own services" ON public.services FOR ALL USING (EXISTS (SELECT 1 FROM public.mua_profiles mp JOIN public.profiles p ON mp.profile_id = p.id WHERE mp.id = mua_profile_id AND p.user_id = auth.uid()));

-- RLS policies for bookings
CREATE POLICY "Users can view their own bookings" ON public.bookings FOR SELECT USING (
  -- Customer can see their bookings
  (EXISTS (SELECT 1 FROM public.profiles WHERE id = bookings.customer_id AND user_id = auth.uid())) OR
  -- MUA can see bookings assigned to them
  (EXISTS (
    SELECT 1 FROM public.mua_profiles mp
    JOIN public.profiles p ON mp.profile_id = p.id
    WHERE mp.id = bookings.mua_profile_id AND p.user_id = auth.uid()
  ))
);

CREATE POLICY "Authenticated users can create bookings" ON public.bookings FOR INSERT TO authenticated WITH CHECK (true);

-- PERBAIKAN UTAMA: Kebijakan UPDATE yang lebih spesifik
CREATE POLICY "Users can update their own bookings (customer or MUA)" ON public.bookings FOR UPDATE USING (
  -- Customer can update their own booking
  (EXISTS (SELECT 1 FROM public.profiles WHERE id = bookings.customer_id AND user_id = auth.uid())) OR
  -- MUA can update a booking assigned to them
  (EXISTS (
    SELECT 1 FROM public.mua_profiles mp
    JOIN public.profiles p ON mp.profile_id = p.id
    WHERE mp.id = bookings.mua_profile_id AND p.user_id = auth.uid()
  ))
);

-- RLS policies for reviews
CREATE POLICY "Anyone can view reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Customers can create reviews for their completed bookings" ON public.reviews FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.bookings b 
    JOIN public.profiles p ON b.customer_id = p.id 
    WHERE b.id = booking_id AND p.user_id = auth.uid() AND b.status = 'completed'
  )
);

-- RLS policies for payments
CREATE POLICY "Users can view their own payments" ON public.payments FOR SELECT USING (
    -- Customer can see their own payments
    (EXISTS (SELECT 1 FROM public.profiles WHERE id = payments.customer_id AND user_id = auth.uid())) OR
    -- MUA can see payments related to their bookings
    (EXISTS (
        SELECT 1 FROM public.bookings b
        JOIN public.mua_profiles mp ON b.mua_profile_id = mp.id
        JOIN public.profiles p ON mp.profile_id = p.id
        WHERE b.id = payments.booking_id AND p.user_id = auth.uid()
    ))
);

CREATE POLICY "Users can update their own payments" ON public.payments FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = payments.customer_id AND profiles.user_id = auth.uid()
    )
);

-- **PERBAIKAN KEBIJAKAN INSERT PAYMENT DI SINI**
CREATE POLICY "Users can create payments for their own bookings" ON public.payments FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE public.profiles.id = customer_id AND public.profiles.user_id = auth.uid()
    )
);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_mua_profiles_updated_at BEFORE UPDATE ON public.mua_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('portfolio', 'portfolio', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('reviews', 'reviews', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('services', 'services', true) ON CONFLICT (id) DO NOTHING;

-- Create storage policies for avatars
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Users can upload their own avatar" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can update their own avatar" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create storage policies for portfolio
CREATE POLICY "Portfolio images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'portfolio');
CREATE POLICY "MUA can upload portfolio images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'portfolio' AND EXISTS (SELECT 1 FROM public.profiles WHERE profiles.user_id = auth.uid() AND profiles.user_type = 'mua'));
CREATE POLICY "MUA can update their own portfolio images" ON storage.objects FOR UPDATE USING (bucket_id = 'portfolio' AND auth.uid() = (storage.foldername(name))[1]::uuid);
CREATE POLICY "MUA can delete their own portfolio images" ON storage.objects FOR DELETE USING (bucket_id = 'portfolio' AND auth.uid() = (storage.foldername(name))[1]::uuid);

-- Create storage policies for review images
CREATE POLICY "Review images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'reviews');
CREATE POLICY "Authenticated users can upload review images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'reviews' and auth.role() = 'authenticated');

-- Create storage policies for services
CREATE POLICY "Service images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'services');
CREATE POLICY "MUA can upload service images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'services' AND EXISTS (SELECT 1 FROM public.profiles WHERE profiles.user_id = auth.uid() AND profiles.user_type = 'mua'));
CREATE POLICY "MUA can update their own service images" ON storage.objects FOR UPDATE USING (bucket_id = 'services' AND auth.uid() = (storage.foldername(name))[1]::uuid);

-- Create function to automatically create profile trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, user_type, phone)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    (NEW.raw_user_meta_data->>'user_type')::public.user_type,
    NEW.raw_user_meta_data->>'phone'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to execute the function on new user creation
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update MUA rating when review is added
CREATE OR REPLACE FUNCTION public.update_mua_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.mua_profiles 
  SET 
    rating = (
      SELECT COALESCE(AVG(rating::decimal), 0) 
      FROM public.reviews 
      WHERE mua_profile_id = NEW.mua_profile_id
    ),
    total_reviews = (
      SELECT COUNT(*) 
      FROM public.reviews 
      WHERE mua_profile_id = NEW.mua_profile_id
    )
  WHERE id = NEW.mua_profile_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update MUA rating when review is added
CREATE TRIGGER update_mua_rating_trigger
  AFTER INSERT ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_mua_rating();