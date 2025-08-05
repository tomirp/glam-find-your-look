export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      blocked_slots: {
        Row: {
          created_at: string
          end_time: string
          id: string
          mua_profile_id: string
          start_time: string
        }
        Insert: {
          created_at?: string
          end_time: string
          id?: string
          mua_profile_id: string
          start_time: string
        }
        Update: {
          created_at?: string
          end_time?: string
          id?: string
          mua_profile_id?: string
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "blocked_slots_mua_profile_id_fkey"
            columns: ["mua_profile_id"]
            isOneToOne: false
            referencedRelation: "mua_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          booking_date: string
          booking_time: string
          cancellation_reason: string | null
          created_at: string
          customer_address: string | null
          customer_id: string
          customer_notes: string | null
          id: string
          mua_notes: string | null
          mua_profile_id: string
          platform_fee: number
          service_id: string
          status: Database["public"]["Enums"]["booking_status"] | null
          total_price: number
          updated_at: string
        }
        Insert: {
          booking_date: string
          booking_time: string
          cancellation_reason?: string | null
          created_at?: string
          customer_address?: string | null
          customer_id: string
          customer_notes?: string | null
          id?: string
          mua_notes?: string | null
          mua_profile_id: string
          platform_fee?: number
          service_id: string
          status?: Database["public"]["Enums"]["booking_status"] | null
          total_price: number
          updated_at?: string
        }
        Update: {
          booking_date?: string
          booking_time?: string
          cancellation_reason?: string | null
          created_at?: string
          customer_address?: string | null
          customer_id?: string
          customer_notes?: string | null
          id?: string
          mua_notes?: string | null
          mua_profile_id?: string
          platform_fee?: number
          service_id?: string
          status?: Database["public"]["Enums"]["booking_status"] | null
          total_price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_mua_profile_id_fkey"
            columns: ["mua_profile_id"]
            isOneToOne: false
            referencedRelation: "mua_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          participant_ids: string[]
        }
        Insert: {
          created_at?: string
          id?: string
          participant_ids: string[]
        }
        Update: {
          created_at?: string
          id?: string
          participant_ids?: string[]
        }
        Relationships: []
      }
      favorites: {
        Row: {
          created_at: string
          customer_id: string
          id: number
          mua_profile_id: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          id?: number
          mua_profile_id: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          id?: number
          mua_profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_mua_profile_id_fkey"
            columns: ["mua_profile_id"]
            isOneToOne: false
            referencedRelation: "mua_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: number
          image_url: string | null
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: number
          image_url?: string | null
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: number
          image_url?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      mua_blocked_slots: {
        Row: {
          created_at: string
          end_time: string
          id: number
          mua_profile_id: string
          notes: string | null
          start_time: string
        }
        Insert: {
          created_at?: string
          end_time: string
          id?: number
          mua_profile_id: string
          notes?: string | null
          start_time: string
        }
        Update: {
          created_at?: string
          end_time?: string
          id?: number
          mua_profile_id?: string
          notes?: string | null
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "mua_blocked_slots_mua_profile_id_fkey"
            columns: ["mua_profile_id"]
            isOneToOne: false
            referencedRelation: "mua_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      mua_profiles: {
        Row: {
          bank_account_name: string | null
          bank_account_number: string | null
          bank_name: string | null
          business_name: string | null
          cover_image_url: string | null
          created_at: string
          experience_years: number | null
          id: string
          instagram_url: string | null
          is_available: boolean | null
          location_address: string | null
          location_city: string
          onboarding_completed: boolean
          portfolio_images: string[] | null
          price_range: string | null
          profile_id: string
          rating: number | null
          specializations: string[] | null
          tiktok_url: string | null
          total_bookings: number | null
          total_reviews: number | null
          updated_at: string
          vehicle_availability: Database["public"]["Enums"]["vehicle_type"]
          whatsapp_number: string | null
        }
        Insert: {
          bank_account_name?: string | null
          bank_account_number?: string | null
          bank_name?: string | null
          business_name?: string | null
          cover_image_url?: string | null
          created_at?: string
          experience_years?: number | null
          id?: string
          instagram_url?: string | null
          is_available?: boolean | null
          location_address?: string | null
          location_city: string
          onboarding_completed?: boolean
          portfolio_images?: string[] | null
          price_range?: string | null
          profile_id: string
          rating?: number | null
          specializations?: string[] | null
          tiktok_url?: string | null
          total_bookings?: number | null
          total_reviews?: number | null
          updated_at?: string
          vehicle_availability?: Database["public"]["Enums"]["vehicle_type"]
          whatsapp_number?: string | null
        }
        Update: {
          bank_account_name?: string | null
          bank_account_number?: string | null
          bank_name?: string | null
          business_name?: string | null
          cover_image_url?: string | null
          created_at?: string
          experience_years?: number | null
          id?: string
          instagram_url?: string | null
          is_available?: boolean | null
          location_address?: string | null
          location_city?: string
          onboarding_completed?: boolean
          portfolio_images?: string[] | null
          price_range?: string | null
          profile_id?: string
          rating?: number | null
          specializations?: string[] | null
          tiktok_url?: string | null
          total_bookings?: number | null
          total_reviews?: number | null
          updated_at?: string
          vehicle_availability?: Database["public"]["Enums"]["vehicle_type"]
          whatsapp_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mua_profiles_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: number
          is_read: boolean
          link: string | null
          message: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: number
          is_read?: boolean
          link?: string | null
          message: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: number
          is_read?: boolean
          link?: string | null
          message?: string
          user_id?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          booking_id: string
          created_at: string
          customer_id: string
          id: string
          paid_at: string | null
          payment_method: string | null
          payment_provider: string | null
          payment_status: Database["public"]["Enums"]["payment_status"] | null
          transaction_id: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          booking_id: string
          created_at?: string
          customer_id: string
          id?: string
          paid_at?: string | null
          payment_method?: string | null
          payment_provider?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          transaction_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          booking_id?: string
          created_at?: string
          customer_id?: string
          id?: string
          paid_at?: string | null
          payment_method?: string | null
          payment_provider?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          transaction_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: true
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          bio: string | null
          created_at: string
          full_name: string
          id: string
          is_verified: boolean | null
          phone: string | null
          updated_at: string
          user_id: string
          user_type: Database["public"]["Enums"]["user_type"]
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          full_name: string
          id?: string
          is_verified?: boolean | null
          phone?: string | null
          updated_at?: string
          user_id: string
          user_type: Database["public"]["Enums"]["user_type"]
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          full_name?: string
          id?: string
          is_verified?: boolean | null
          phone?: string | null
          updated_at?: string
          user_id?: string
          user_type?: Database["public"]["Enums"]["user_type"]
        }
        Relationships: []
      }
      reviews: {
        Row: {
          booking_id: string
          created_at: string
          customer_id: string
          id: string
          mua_profile_id: string
          rating: number
          review_images: string[] | null
          review_text: string | null
          updated_at: string
        }
        Insert: {
          booking_id: string
          created_at?: string
          customer_id: string
          id?: string
          mua_profile_id: string
          rating: number
          review_images?: string[] | null
          review_text?: string | null
          updated_at?: string
        }
        Update: {
          booking_id?: string
          created_at?: string
          customer_id?: string
          id?: string
          mua_profile_id?: string
          rating?: number
          review_images?: string[] | null
          review_text?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: true
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_mua_profile_id_fkey"
            columns: ["mua_profile_id"]
            isOneToOne: false
            referencedRelation: "mua_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          created_at: string
          description: string | null
          duration_minutes: number | null
          id: string
          image_url: string | null
          is_active: boolean | null
          mua_profile_id: string
          name: string
          price_max: number | null
          price_min: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          mua_profile_id: string
          name: string
          price_max?: number | null
          price_min: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          mua_profile_id?: string
          name?: string
          price_max?: number | null
          price_min?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "services_mua_profile_id_fkey"
            columns: ["mua_profile_id"]
            isOneToOne: false
            referencedRelation: "mua_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      advanced_mua_search: {
        Args: {
          p_query: string
          p_min_price?: number
          p_max_price?: number
          p_min_rating?: number
          p_specializations?: string[]
          p_sort_by?: string
        }
        Returns: {
          id: string
          business_name: string
          location_city: string
          specializations: string[]
          rating: number
          total_reviews: number
          cover_image_url: string
          min_service_price: number
        }[]
      }
      cancel_booking: {
        Args: { p_booking_id: string }
        Returns: undefined
      }
      cancel_booking_by_customer: {
        Args:
          | { p_booking_id: string }
          | { p_booking_id: string; cancellation_reason_param: string }
        Returns: undefined
      }
      complete_booking: {
        Args: { p_booking_id: string }
        Returns: undefined
      }
      confirm_payment: {
        Args: { p_payment_id: string }
        Returns: boolean
      }
      create_new_booking: {
        Args:
          | {
              p_mua_profile_id: string
              p_service_id: string
              p_booking_date: string
              p_booking_time: string
              p_total_price: number
              p_platform_fee: number
            }
          | {
              p_mua_profile_id: string
              p_service_id: string
              p_booking_date: string
              p_booking_time: string
              p_total_price: number
              p_platform_fee: number
              p_customer_notes?: string
            }
        Returns: string
      }
      get_all_specializations: {
        Args: Record<PropertyKey, never>
        Returns: {
          specialization: string
        }[]
      }
      get_customer_conversations: {
        Args: { customer_profile_id: string }
        Returns: {
          id: string
          profiles: Json
        }[]
      }
      get_mua_conversations: {
        Args: { mua_profile_id: string }
        Returns: {
          id: string
          profiles: Json
        }[]
      }
      update_booking_status_by_mua: {
        Args: {
          p_booking_id: string
          p_new_status: Database["public"]["Enums"]["booking_status"]
          cancellation_reason_param?: string
        }
        Returns: undefined
      }
    }
    Enums: {
      booking_status:
        | "pending"
        | "accepted"
        | "rejected"
        | "completed"
        | "cancelled"
      payment_status: "pending" | "paid" | "refunded" | "failed"
      user_type: "customer" | "mua"
      vehicle_type: "none" | "motorcycle" | "car"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      booking_status: [
        "pending",
        "accepted",
        "rejected",
        "completed",
        "cancelled",
      ],
      payment_status: ["pending", "paid", "refunded", "failed"],
      user_type: ["customer", "mua"],
      vehicle_type: ["none", "motorcycle", "car"],
    },
  },
} as const
