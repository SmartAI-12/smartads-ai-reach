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
      activities: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          entity_id: string | null
          entity_name: string | null
          entity_type: string
          id: string
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_name?: string | null
          entity_type: string
          id?: string
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_name?: string | null
          entity_type?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_insights: {
        Row: {
          actionable_recommendations: string[] | null
          campaign_id: string | null
          confidence_score: number | null
          created_at: string
          data_used: Json | null
          description: string
          id: string
          insight_type: string
          title: string
        }
        Insert: {
          actionable_recommendations?: string[] | null
          campaign_id?: string | null
          confidence_score?: number | null
          created_at?: string
          data_used?: Json | null
          description: string
          id?: string
          insight_type: string
          title: string
        }
        Update: {
          actionable_recommendations?: string[] | null
          campaign_id?: string | null
          confidence_score?: number | null
          created_at?: string
          data_used?: Json | null
          description?: string
          id?: string
          insight_type?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_insights_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_reports: {
        Row: {
          campaign_id: string
          created_at: string
          data_snapshot: Json | null
          email_sent: boolean | null
          generated_for: string
          id: string
          pdf_url: string | null
          report_type: string
        }
        Insert: {
          campaign_id: string
          created_at?: string
          data_snapshot?: Json | null
          email_sent?: boolean | null
          generated_for: string
          id?: string
          pdf_url?: string | null
          report_type: string
        }
        Update: {
          campaign_id?: string
          created_at?: string
          data_snapshot?: Json | null
          email_sent?: boolean | null
          generated_for?: string
          id?: string
          pdf_url?: string | null
          report_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_reports_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          actual_performance: Json | null
          assigned_to: string | null
          budget: number | null
          channel_type: Database["public"]["Enums"]["btl_channel"] | null
          city: string | null
          client_id: string
          created_at: string
          created_by: string
          description: string | null
          end_date: string | null
          geo_coordinates: unknown | null
          id: string
          kpi_targets: Json | null
          kpis: Json | null
          name: string
          objectives: string | null
          priority: string | null
          start_date: string | null
          status: Database["public"]["Enums"]["campaign_status"] | null
          target_audience: string | null
          updated_at: string
          vendor_id: string | null
        }
        Insert: {
          actual_performance?: Json | null
          assigned_to?: string | null
          budget?: number | null
          channel_type?: Database["public"]["Enums"]["btl_channel"] | null
          city?: string | null
          client_id: string
          created_at?: string
          created_by: string
          description?: string | null
          end_date?: string | null
          geo_coordinates?: unknown | null
          id?: string
          kpi_targets?: Json | null
          kpis?: Json | null
          name: string
          objectives?: string | null
          priority?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["campaign_status"] | null
          target_audience?: string | null
          updated_at?: string
          vendor_id?: string | null
        }
        Update: {
          actual_performance?: Json | null
          assigned_to?: string | null
          budget?: number | null
          channel_type?: Database["public"]["Enums"]["btl_channel"] | null
          city?: string | null
          client_id?: string
          created_at?: string
          created_by?: string
          description?: string | null
          end_date?: string | null
          geo_coordinates?: unknown | null
          id?: string
          kpi_targets?: Json | null
          kpis?: Json | null
          name?: string
          objectives?: string | null
          priority?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["campaign_status"] | null
          target_audience?: string | null
          updated_at?: string
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaigns_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaigns_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaigns_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          address: string | null
          contact_person: string | null
          created_at: string
          created_by: string
          email: string | null
          id: string
          is_active: boolean | null
          name: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          contact_person?: string | null
          created_at?: string
          created_by: string
          email?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          contact_person?: string | null
          created_at?: string
          created_by?: string
          email?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clients_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          content: string
          created_at: string
          created_by: string
          entity_id: string
          entity_type: string
          id: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          created_by: string
          entity_id: string
          entity_type: string
          id?: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string
          entity_id?: string
          entity_type?: string
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      execution_reports: {
        Row: {
          activities_completed: string[] | null
          campaign_id: string
          challenges: string | null
          created_at: string
          created_by: string
          id: string
          metrics: Json | null
          next_steps: string | null
          photos: string[] | null
          report_date: string
          updated_at: string
        }
        Insert: {
          activities_completed?: string[] | null
          campaign_id: string
          challenges?: string | null
          created_at?: string
          created_by: string
          id?: string
          metrics?: Json | null
          next_steps?: string | null
          photos?: string[] | null
          report_date: string
          updated_at?: string
        }
        Update: {
          activities_completed?: string[] | null
          campaign_id?: string
          challenges?: string | null
          created_at?: string
          created_by?: string
          id?: string
          metrics?: Json | null
          next_steps?: string | null
          photos?: string[] | null
          report_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "execution_reports_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "execution_reports_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          amount: number
          approved_at: string | null
          approved_by: string | null
          campaign_id: string
          category: string
          created_at: string
          created_by: string
          description: string
          expense_date: string
          id: string
          receipt_url: string | null
          status: Database["public"]["Enums"]["expense_status"] | null
          updated_at: string
        }
        Insert: {
          amount: number
          approved_at?: string | null
          approved_by?: string | null
          campaign_id: string
          category: string
          created_at?: string
          created_by: string
          description: string
          expense_date: string
          id?: string
          receipt_url?: string | null
          status?: Database["public"]["Enums"]["expense_status"] | null
          updated_at?: string
        }
        Update: {
          amount?: number
          approved_at?: string | null
          approved_by?: string | null
          campaign_id?: string
          category?: string
          created_at?: string
          created_by?: string
          description?: string
          expense_date?: string
          id?: string
          receipt_url?: string | null
          status?: Database["public"]["Enums"]["expense_status"] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "expenses_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      geo_checkins: {
        Row: {
          address: string | null
          campaign_id: string
          checkin_type: Database["public"]["Enums"]["checkin_type"]
          created_at: string
          id: string
          latitude: number
          longitude: number
          notes: string | null
          photos: string[] | null
          user_id: string
        }
        Insert: {
          address?: string | null
          campaign_id: string
          checkin_type: Database["public"]["Enums"]["checkin_type"]
          created_at?: string
          id?: string
          latitude: number
          longitude: number
          notes?: string | null
          photos?: string[] | null
          user_id: string
        }
        Update: {
          address?: string | null
          campaign_id?: string
          checkin_type?: Database["public"]["Enums"]["checkin_type"]
          created_at?: string
          id?: string
          latitude?: number
          longitude?: number
          notes?: string | null
          photos?: string[] | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "geo_checkins_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          campaign_id: string
          converted_at: string | null
          created_at: string
          created_by: string
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          score: number | null
          source: string | null
          status: Database["public"]["Enums"]["lead_status"] | null
          updated_at: string
        }
        Insert: {
          campaign_id: string
          converted_at?: string | null
          created_at?: string
          created_by: string
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          score?: number | null
          source?: string | null
          status?: Database["public"]["Enums"]["lead_status"] | null
          updated_at?: string
        }
        Update: {
          campaign_id?: string
          converted_at?: string | null
          created_at?: string
          created_by?: string
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          score?: number | null
          source?: string | null
          status?: Database["public"]["Enums"]["lead_status"] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          message: string
          read_at: string | null
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          message: string
          read_at?: string | null
          title: string
          type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          message?: string
          read_at?: string | null
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          is_active: boolean | null
          phone: string | null
          role: Database["public"]["Enums"]["app_role"] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name: string
          id?: string
          is_active?: boolean | null
          phone?: string | null
          role?: Database["public"]["Enums"]["app_role"] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean | null
          phone?: string | null
          role?: Database["public"]["Enums"]["app_role"] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          assigned_to: string | null
          campaign_id: string
          created_at: string
          created_by: string
          description: string | null
          due_date: string | null
          id: string
          priority: Database["public"]["Enums"]["task_priority"] | null
          status: Database["public"]["Enums"]["task_status"] | null
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          campaign_id: string
          created_at?: string
          created_by: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: Database["public"]["Enums"]["task_priority"] | null
          status?: Database["public"]["Enums"]["task_status"] | null
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          campaign_id?: string
          created_at?: string
          created_by?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: Database["public"]["Enums"]["task_priority"] | null
          status?: Database["public"]["Enums"]["task_status"] | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      vendors: {
        Row: {
          address: string | null
          company_name: string
          contact_person: string
          created_at: string
          created_by: string
          email: string
          gst_number: string | null
          id: string
          phone: string
          service_areas: string[] | null
          specializations: Database["public"]["Enums"]["btl_channel"][] | null
          status: Database["public"]["Enums"]["vendor_status"] | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          company_name: string
          contact_person: string
          created_at?: string
          created_by: string
          email: string
          gst_number?: string | null
          id?: string
          phone: string
          service_areas?: string[] | null
          specializations?: Database["public"]["Enums"]["btl_channel"][] | null
          status?: Database["public"]["Enums"]["vendor_status"] | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          company_name?: string
          contact_person?: string
          created_at?: string
          created_by?: string
          email?: string
          gst_number?: string | null
          id?: string
          phone?: string
          service_areas?: string[] | null
          specializations?: Database["public"]["Enums"]["btl_channel"][] | null
          status?: Database["public"]["Enums"]["vendor_status"] | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_notification: {
        Args: {
          p_user_id: string
          p_entity_type: string
          p_entity_id: string
          p_title: string
          p_message: string
          p_type?: string
        }
        Returns: string
      }
      get_user_role: {
        Args: { user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          user_id: string
          required_role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      log_activity: {
        Args: {
          p_user_id: string
          p_action: string
          p_entity_type: string
          p_entity_id: string
          p_entity_name: string
          p_details?: Json
        }
        Returns: string
      }
    }
    Enums: {
      app_role: "admin" | "manager" | "executive"
      btl_channel:
        | "metro_branding"
        | "mall_activation"
        | "pamphlet_distribution"
        | "street_branding"
        | "transit_advertising"
        | "experiential_marketing"
      campaign_status: "draft" | "active" | "paused" | "completed" | "cancelled"
      checkin_type:
        | "campaign_start"
        | "campaign_end"
        | "milestone_update"
        | "issue_report"
      expense_status: "pending" | "approved" | "rejected"
      lead_status: "new" | "contacted" | "qualified" | "converted" | "lost"
      task_priority: "low" | "medium" | "high" | "urgent"
      task_status: "pending" | "in_progress" | "completed" | "cancelled"
      vendor_status: "active" | "inactive" | "suspended"
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
      app_role: ["admin", "manager", "executive"],
      btl_channel: [
        "metro_branding",
        "mall_activation",
        "pamphlet_distribution",
        "street_branding",
        "transit_advertising",
        "experiential_marketing",
      ],
      campaign_status: ["draft", "active", "paused", "completed", "cancelled"],
      checkin_type: [
        "campaign_start",
        "campaign_end",
        "milestone_update",
        "issue_report",
      ],
      expense_status: ["pending", "approved", "rejected"],
      lead_status: ["new", "contacted", "qualified", "converted", "lost"],
      task_priority: ["low", "medium", "high", "urgent"],
      task_status: ["pending", "in_progress", "completed", "cancelled"],
      vendor_status: ["active", "inactive", "suspended"],
    },
  },
} as const
