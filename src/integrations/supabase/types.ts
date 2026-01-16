export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      ai_response_logs: {
        Row: {
          contains_disclaimer: boolean | null
          id: string
          prompt_hash: string
          response_hash: string
          response_type: string
          session_id: string | null
          timestamp: string
          user_id: string | null
        }
        Insert: {
          contains_disclaimer?: boolean | null
          id?: string
          prompt_hash: string
          response_hash: string
          response_type: string
          session_id?: string | null
          timestamp?: string
          user_id?: string | null
        }
        Update: {
          contains_disclaimer?: boolean | null
          id?: string
          prompt_hash?: string
          response_hash?: string
          response_type?: string
          session_id?: string | null
          timestamp?: string
          user_id?: string | null
        }
        Relationships: []
      }
      balance_predictions: {
        Row: {
          account_id: string | null
          confidence_score: number | null
          created_at: string
          id: string
          predicted_balance: number
          prediction_date: string
          user_id: string
        }
        Insert: {
          account_id?: string | null
          confidence_score?: number | null
          created_at?: string
          id?: string
          predicted_balance: number
          prediction_date: string
          user_id: string
        }
        Update: {
          account_id?: string | null
          confidence_score?: number | null
          created_at?: string
          id?: string
          predicted_balance?: number
          prediction_date?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "balance_predictions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "connected_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      connected_accounts: {
        Row: {
          account_name: string
          account_type: string
          available_balance: number | null
          created_at: string
          currency: string
          current_balance: number
          id: string
          institution_logo_url: string | null
          institution_name: string
          is_active: boolean
          last_synced_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          account_name: string
          account_type: string
          available_balance?: number | null
          created_at?: string
          currency?: string
          current_balance?: number
          id?: string
          institution_logo_url?: string | null
          institution_name: string
          is_active?: boolean
          last_synced_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          account_name?: string
          account_type?: string
          available_balance?: number | null
          created_at?: string
          currency?: string
          current_balance?: number
          id?: string
          institution_logo_url?: string | null
          institution_name?: string
          is_active?: boolean
          last_synced_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      courses: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          estimated_duration: string | null
          id: string
          is_published: boolean
          level: string
          thumbnail_url: string | null
          title: string
          topic: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          estimated_duration?: string | null
          id?: string
          is_published?: boolean
          level?: string
          thumbnail_url?: string | null
          title: string
          topic: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          estimated_duration?: string | null
          id?: string
          is_published?: boolean
          level?: string
          thumbnail_url?: string | null
          title?: string
          topic?: string
          updated_at?: string
        }
        Relationships: []
      }
      holdings: {
        Row: {
          cost_basis: number
          created_at: string
          id: string
          purchase_date: string
          shares: number
          ticker: string
          updated_at: string
          user_id: string
        }
        Insert: {
          cost_basis: number
          created_at?: string
          id?: string
          purchase_date: string
          shares: number
          ticker: string
          updated_at?: string
          user_id: string
        }
        Update: {
          cost_basis?: number
          created_at?: string
          id?: string
          purchase_date?: string
          shares?: number
          ticker?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      impulse_prevention_logs: {
        Row: {
          created_at: string
          hours_of_work: number
          id: string
          item_name: string
          potential_future_value: number
          price: number
          user_id: string
        }
        Insert: {
          created_at?: string
          hours_of_work: number
          id?: string
          item_name: string
          potential_future_value: number
          price: number
          user_id: string
        }
        Update: {
          created_at?: string
          hours_of_work?: number
          id?: string
          item_name?: string
          potential_future_value?: number
          price?: number
          user_id?: string
        }
        Relationships: []
      }
      lessons: {
        Row: {
          content_markdown: string | null
          content_type: string
          created_at: string
          duration_minutes: number | null
          id: string
          is_generated: boolean
          module_id: string
          order_index: number
          title: string
          updated_at: string
        }
        Insert: {
          content_markdown?: string | null
          content_type?: string
          created_at?: string
          duration_minutes?: number | null
          id?: string
          is_generated?: boolean
          module_id: string
          order_index?: number
          title: string
          updated_at?: string
        }
        Update: {
          content_markdown?: string | null
          content_type?: string
          created_at?: string
          duration_minutes?: number | null
          id?: string
          is_generated?: boolean
          module_id?: string
          order_index?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lessons_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      modules: {
        Row: {
          course_id: string
          created_at: string
          description: string | null
          id: string
          order_index: number
          title: string
          updated_at: string
        }
        Insert: {
          course_id: string
          created_at?: string
          description?: string | null
          id?: string
          order_index?: number
          title: string
          updated_at?: string
        }
        Update: {
          course_id?: string
          created_at?: string
          description?: string | null
          id?: string
          order_index?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "modules_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          completed_onboarding: boolean | null
          created_at: string
          email: string
          experience_level: string | null
          first_name: string | null
          hourly_wage: number | null
          id: string
          investment_goals: string[] | null
          last_name: string | null
          quiz_completed_at: string | null
          risk_profile: string | null
          risk_score: number | null
          risk_tolerance: string | null
          time_horizon: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_onboarding?: boolean | null
          created_at?: string
          email: string
          experience_level?: string | null
          first_name?: string | null
          hourly_wage?: number | null
          id?: string
          investment_goals?: string[] | null
          last_name?: string | null
          quiz_completed_at?: string | null
          risk_profile?: string | null
          risk_score?: number | null
          risk_tolerance?: string | null
          time_horizon?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_onboarding?: boolean | null
          created_at?: string
          email?: string
          experience_level?: string | null
          first_name?: string | null
          hourly_wage?: number | null
          id?: string
          investment_goals?: string[] | null
          last_name?: string | null
          quiz_completed_at?: string | null
          risk_profile?: string | null
          risk_score?: number | null
          risk_tolerance?: string | null
          time_horizon?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      router_accounts: {
        Row: {
          account_id: string
          balance: number
          created_at: string
          currency: string
          id: string
          last_synced_at: string | null
          name: string
          provider: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          account_id: string
          balance?: number
          created_at?: string
          currency?: string
          id?: string
          last_synced_at?: string | null
          name: string
          provider: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          account_id?: string
          balance?: number
          created_at?: string
          currency?: string
          id?: string
          last_synced_at?: string | null
          name?: string
          provider?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      router_moves_sim: {
        Row: {
          created_at: string
          id: string
          moves_json: Json
          run_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          moves_json: Json
          run_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          moves_json?: Json
          run_at?: string
          user_id?: string
        }
        Relationships: []
      }
      router_rules: {
        Row: {
          config_json: Json
          created_at: string
          id: string
          is_active: boolean
          name: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          config_json: Json
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          config_json?: Json
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      spending_insights: {
        Row: {
          amount_involved: number | null
          category: string | null
          created_at: string
          description: string
          id: string
          insight_type: string
          is_dismissed: boolean | null
          is_read: boolean | null
          severity: string | null
          title: string
          user_id: string
        }
        Insert: {
          amount_involved?: number | null
          category?: string | null
          created_at?: string
          description: string
          id?: string
          insight_type: string
          is_dismissed?: boolean | null
          is_read?: boolean | null
          severity?: string | null
          title: string
          user_id: string
        }
        Update: {
          amount_involved?: number | null
          category?: string | null
          created_at?: string
          description?: string
          id?: string
          insight_type?: string
          is_dismissed?: boolean | null
          is_read?: boolean | null
          severity?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          stripe_customer_id: string | null
          subscribed: boolean
          subscription_end: string | null
          subscription_tier: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          ai_savings_suggestion: string | null
          billing_cycle: string | null
          category: string | null
          created_at: string
          detected_from_transaction_id: string | null
          id: string
          monthly_cost: number
          next_billing_date: string | null
          service_logo_url: string | null
          service_name: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_savings_suggestion?: string | null
          billing_cycle?: string | null
          category?: string | null
          created_at?: string
          detected_from_transaction_id?: string | null
          id?: string
          monthly_cost: number
          next_billing_date?: string | null
          service_logo_url?: string | null
          service_name: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_savings_suggestion?: string | null
          billing_cycle?: string | null
          category?: string | null
          created_at?: string
          detected_from_transaction_id?: string | null
          id?: string
          monthly_cost?: number
          next_billing_date?: string | null
          service_logo_url?: string | null
          service_name?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_detected_from_transaction_id_fkey"
            columns: ["detected_from_transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          account_id: string | null
          amount: number
          category: string
          created_at: string
          description: string | null
          id: string
          is_recurring: boolean | null
          is_subscription: boolean | null
          merchant_logo_url: string | null
          merchant_name: string
          transaction_date: string
          user_id: string
        }
        Insert: {
          account_id?: string | null
          amount: number
          category: string
          created_at?: string
          description?: string | null
          id?: string
          is_recurring?: boolean | null
          is_subscription?: boolean | null
          merchant_logo_url?: string | null
          merchant_name: string
          transaction_date: string
          user_id: string
        }
        Update: {
          account_id?: string | null
          amount?: number
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          is_recurring?: boolean | null
          is_subscription?: boolean | null
          merchant_logo_url?: string | null
          merchant_name?: string
          transaction_date?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "connected_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      user_progress: {
        Row: {
          completed_at: string | null
          course_id: string
          created_at: string
          id: string
          last_accessed_at: string | null
          lesson_id: string
          progress_percent: number
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          course_id: string
          created_at?: string
          id?: string
          last_accessed_at?: string | null
          lesson_id: string
          progress_percent?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          course_id?: string
          created_at?: string
          id?: string
          last_accessed_at?: string | null
          lesson_id?: string
          progress_percent?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_progress_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      watchlist: {
        Row: {
          added_at: string
          id: string
          ticker: string
          user_id: string
        }
        Insert: {
          added_at?: string
          id?: string
          ticker: string
          user_id: string
        }
        Update: {
          added_at?: string
          id?: string
          ticker?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
