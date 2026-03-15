export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)";
  };
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          extensions?: Json;
          operationName?: string;
          query?: string;
          variables?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      crew: {
        Row: {
          address: string | null;
          company: string | null;
          company_id: string | null;
          created_at: string | null;
          email: string | null;
          first_name: string;
          id: string;
          last_name: string;
          license_number: string | null;
          note: string | null;
          phone: string | null;
          updated_at: string | null;
          user_id: string | null;
        };
        Insert: {
          address?: string | null;
          company?: string | null;
          company_id?: string | null;
          created_at?: string | null;
          email?: string | null;
          first_name: string;
          id?: string;
          last_name: string;
          license_number?: string | null;
          note?: string | null;
          phone?: string | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Update: {
          address?: string | null;
          company?: string | null;
          company_id?: string | null;
          created_at?: string | null;
          email?: string | null;
          first_name?: string;
          id?: string;
          last_name?: string;
          license_number?: string | null;
          note?: string | null;
          phone?: string | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Relationships: [];
      };
      fleet: {
        Row: {
          category: string | null;
          created_at: string;
          engine_count: number | null;
          engine_type: string | null;
          id: string;
          is_simulator: boolean;
          manufacturer: string | null;
          model: string | null;
          note: string | null;
          operator: string | null;
          passenger_seats: number | null;
          registration: string;
          status: string | null;
          type: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          category?: string | null;
          created_at?: string;
          engine_count?: number | null;
          engine_type?: string | null;
          id?: string;
          is_simulator?: boolean;
          manufacturer?: string | null;
          model?: string | null;
          note?: string | null;
          operator?: string | null;
          passenger_seats?: number | null;
          registration: string;
          status?: string | null;
          type?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          category?: string | null;
          created_at?: string;
          engine_count?: number | null;
          engine_type?: string | null;
          id?: string;
          is_simulator?: boolean;
          manufacturer?: string | null;
          model?: string | null;
          note?: string | null;
          operator?: string | null;
          passenger_seats?: number | null;
          registration?: string;
          status?: string | null;
          type?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "fleet_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      flights: {
        Row: {
          aircraft_id: string;
          approaches: string[] | null;
          block_end: string;
          block_start: string;
          created_at: string;
          date: string;
          day_landings: number;
          day_takeoffs: number;
          departure_airport_code: string;
          departure_runway: string | null;
          destination_airport_code: string;
          destination_runway: string | null;
          duty_end: string | null;
          duty_start: string | null;
          duty_time_minutes: number;
          endorsement: string | null;
          flight_end: string;
          flight_number: string | null;
          flight_start: string;
          fuel: number | null;
          function: Database["public"]["Enums"]["pilot_function"];
          go_arounds: number;
          hobbs_end: number | null;
          hobbs_start: number | null;
          id: string;
          ifr_time_minutes: number;
          night_landings: number;
          night_takeoffs: number;
          night_time_minutes: number;
          passengers: number | null;
          pic_id: string | null;
          pic_is_self: boolean;
          pilot_flying: boolean;
          remarks: string | null;
          scheduled_end: string | null;
          scheduled_start: string | null;
          tach_end: number | null;
          tach_start: number | null;
          total_air_minutes: number;
          total_block_minutes: number;
          training_description: string | null;
          updated_at: string;
          user_id: string;
          xc_time_minutes: number;
        };
        Insert: {
          aircraft_id: string;
          approaches?: string[] | null;
          block_end: string;
          block_start: string;
          created_at?: string;
          date: string;
          day_landings?: number;
          day_takeoffs?: number;
          departure_airport_code: string;
          departure_runway?: string | null;
          destination_airport_code: string;
          destination_runway?: string | null;
          duty_end?: string | null;
          duty_start?: string | null;
          duty_time_minutes?: number;
          endorsement?: string | null;
          flight_end: string;
          flight_number?: string | null;
          flight_start: string;
          fuel?: number | null;
          function: Database["public"]["Enums"]["pilot_function"];
          go_arounds?: number;
          hobbs_end?: number | null;
          hobbs_start?: number | null;
          id?: string;
          ifr_time_minutes?: number;
          night_landings?: number;
          night_takeoffs?: number;
          night_time_minutes?: number;
          passengers?: number | null;
          pic_id?: string | null;
          pic_is_self?: boolean;
          pilot_flying?: boolean;
          remarks?: string | null;
          scheduled_end?: string | null;
          scheduled_start?: string | null;
          tach_end?: number | null;
          tach_start?: number | null;
          total_air_minutes: number;
          total_block_minutes: number;
          training_description?: string | null;
          updated_at?: string;
          user_id: string;
          xc_time_minutes?: number;
        };
        Update: {
          aircraft_id?: string;
          approaches?: string[] | null;
          block_end?: string;
          block_start?: string;
          created_at?: string;
          date?: string;
          day_landings?: number;
          day_takeoffs?: number;
          departure_airport_code?: string;
          departure_runway?: string | null;
          destination_airport_code?: string;
          destination_runway?: string | null;
          duty_end?: string | null;
          duty_start?: string | null;
          duty_time_minutes?: number;
          endorsement?: string | null;
          flight_end?: string;
          flight_number?: string | null;
          flight_start?: string;
          fuel?: number | null;
          function?: Database["public"]["Enums"]["pilot_function"];
          go_arounds?: number;
          hobbs_end?: number | null;
          hobbs_start?: number | null;
          id?: string;
          ifr_time_minutes?: number;
          night_landings?: number;
          night_takeoffs?: number;
          night_time_minutes?: number;
          passengers?: number | null;
          pic_id?: string | null;
          pic_is_self?: boolean;
          pilot_flying?: boolean;
          remarks?: string | null;
          scheduled_end?: string | null;
          scheduled_start?: string | null;
          tach_end?: number | null;
          tach_start?: number | null;
          total_air_minutes?: number;
          total_block_minutes?: number;
          training_description?: string | null;
          updated_at?: string;
          user_id?: string;
          xc_time_minutes?: number;
        };
        Relationships: [
          {
            foreignKeyName: "flights_aircraft_id_fkey";
            columns: ["aircraft_id"];
            isOneToOne: false;
            referencedRelation: "fleet";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "flights_pic_id_fkey";
            columns: ["pic_id"];
            isOneToOne: false;
            referencedRelation: "crew";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "flights_user_id_fkey1";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          company: string | null;
          company_id: string | null;
          created_at: string | null;
          email: string | null;
          first_name: string | null;
          id: string;
          last_name: string | null;
          license_number: string | null;
          phone: string | null;
          preferences: Json | null;
          updated_at: string | null;
        };
        Insert: {
          company?: string | null;
          company_id?: string | null;
          created_at?: string | null;
          email?: string | null;
          first_name?: string | null;
          id: string;
          last_name?: string | null;
          license_number?: string | null;
          phone?: string | null;
          preferences?: Json | null;
          updated_at?: string | null;
        };
        Update: {
          company?: string | null;
          company_id?: string | null;
          created_at?: string | null;
          email?: string | null;
          first_name?: string | null;
          id?: string;
          last_name?: string | null;
          license_number?: string | null;
          phone?: string | null;
          preferences?: Json | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      signatures: {
        Row: {
          id: string;
          ip_address: string | null;
          pilot_id: string | null;
          reference_id: string;
          reference_type: string;
          signature_data: string | null;
          timestamp: string | null;
          user_agent: string | null;
          verification_method: string | null;
          verified: boolean | null;
        };
        Insert: {
          id?: string;
          ip_address?: string | null;
          pilot_id?: string | null;
          reference_id: string;
          reference_type: string;
          signature_data?: string | null;
          timestamp?: string | null;
          user_agent?: string | null;
          verification_method?: string | null;
          verified?: boolean | null;
        };
        Update: {
          id?: string;
          ip_address?: string | null;
          pilot_id?: string | null;
          reference_id?: string;
          reference_type?: string;
          signature_data?: string | null;
          timestamp?: string | null;
          user_agent?: string | null;
          verification_method?: string | null;
          verified?: boolean | null;
        };
        Relationships: [
          {
            foreignKeyName: "signatures_pilot_id_fkey";
            columns: ["pilot_id"];
            isOneToOne: false;
            referencedRelation: "crew";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "signatures_reference_id_fkey";
            columns: ["reference_id"];
            isOneToOne: false;
            referencedRelation: "flights";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "signatures_reference_id_fkey1";
            columns: ["reference_id"];
            isOneToOne: false;
            referencedRelation: "simulator_sessions";
            referencedColumns: ["id"];
          },
        ];
      };
      simulator_sessions: {
        Row: {
          aircraft_id: string;
          created_at: string;
          date: string;
          duty_end: string | null;
          duty_start: string | null;
          duty_time_minutes: number;
          endorsement: string | null;
          hobbs_end: number | null;
          hobbs_start: number | null;
          id: string;
          instructor_id: string | null;
          instructor_is_self: boolean;
          remarks: string | null;
          session_minutes: number;
          signature: string | null;
          training_description: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          aircraft_id: string;
          created_at?: string;
          date: string;
          duty_end?: string | null;
          duty_start?: string | null;
          duty_time_minutes?: number;
          endorsement?: string | null;
          hobbs_end?: number | null;
          hobbs_start?: number | null;
          id?: string;
          instructor_id: string | null;
          instructor_is_self?: boolean;
          remarks?: string | null;
          session_minutes: number;
          signature?: string | null;
          training_description?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          aircraft_id?: string;
          created_at?: string;
          date?: string;
          duty_end?: string | null;
          duty_start?: string | null;
          duty_time_minutes?: number;
          endorsement?: string | null;
          hobbs_end?: number | null;
          hobbs_start?: number | null;
          id?: string;
          instructor_id?: string | null;
          instructor_is_self?: boolean;
          remarks?: string | null;
          session_minutes?: number;
          signature?: string | null;
          training_description?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "simulator_sessions_aircraft_id_fkey";
            columns: ["aircraft_id"];
            isOneToOne: false;
            referencedRelation: "fleet";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "simulator_sessions_instructor_id_fkey";
            columns: ["instructor_id"];
            isOneToOne: false;
            referencedRelation: "crew";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "simulator_sessions_user_id_fkey1";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      user_preferences: {
        Row: {
          created_at: string | null;
          favorite_airports: string[] | null;
          preferences: Json;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          favorite_airports?: string[] | null;
          preferences?: Json;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          favorite_airports?: string[] | null;
          preferences?: Json;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      _set_auth_user_full_name: {
        Args: { first_name: string; last_name: string; user_uuid: string };
        Returns: undefined;
      };
    };
    Enums: {
      pilot_function:
        | "PIC"
        | "Co-Pilot"
        | "Dual"
        | "Instructor"
        | "Solo"
        | "SPIC"
        | "PICUS";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      pilot_function: [
        "PIC",
        "Co-Pilot",
        "Dual",
        "Instructor",
        "Solo",
        "SPIC",
        "PICUS",
      ],
    },
  },
} as const;
