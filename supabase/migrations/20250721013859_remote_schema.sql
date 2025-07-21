-- supabase/migrations/<timestamp>_votre_nom_de_migration.sql

CREATE TABLE "public"."bookings" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "mua_profile_id" uuid NOT NULL,
    "customer_id" uuid NOT NULL,
    "service_id" uuid NOT NULL,
    "booking_date" timestamp with time zone NOT NULL,
    "total_price" integer NOT NULL,
    "status" public.booking_status NOT NULL DEFAULT 'pending'::public.booking_status
);

CREATE TABLE "public"."mua_profiles" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "profile_id" uuid NOT NULL,
    "business_name" text,
    "location_city" text NOT NULL,
    "specializations" text[],
    "price_range" text,
    "rating" real,
    "total_reviews" integer,
    "cover_image_url" text
);

CREATE TABLE "public"."payments" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "booking_id" uuid NOT NULL,
    "customer_id" uuid NOT NULL,
    "amount" integer NOT NULL,
    "payment_status" public.payment_status NOT NULL,
    "created_at" timestamp with time zone DEFAULT now()
);

CREATE TABLE "public"."profiles" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "user_id" uuid NOT NULL,
    "full_name" text,
    "phone" text,
    "user_type" public.user_type,
    "avatar_url" text,
    "address" text,
    "bio" text
);

CREATE TABLE "public"."reviews" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "booking_id" uuid NOT NULL,
    "customer_id" uuid NOT NULL,
    "mua_profile_id" uuid NOT NULL,
    "rating" integer NOT NULL,
    "review_text" text,
    "created_at" timestamp with time zone DEFAULT now()
);

CREATE TABLE "public"."services" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "mua_profile_id" uuid NOT NULL,
    "name" text NOT NULL,
    "description" text,
    "price_min" integer NOT NULL,
    "price_max" integer,
    "duration_minutes" integer,
    "image_url" text,
    "is_active" boolean DEFAULT true
);