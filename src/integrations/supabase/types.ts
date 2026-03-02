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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      manutencoes: {
        Row: {
          data_selada: string
          descricao: string
          dias_revisao: number | null
          foto_url: string | null
          id: string
          km_atual: number
          oficina: string
          user_id: string
          veiculo_id: string
          verificado: boolean
        }
        Insert: {
          data_selada?: string
          descricao: string
          dias_revisao?: number | null
          foto_url?: string | null
          id?: string
          km_atual: number
          oficina: string
          user_id: string
          veiculo_id: string
          verificado?: boolean
        }
        Update: {
          data_selada?: string
          descricao?: string
          dias_revisao?: number | null
          foto_url?: string | null
          id?: string
          km_atual?: number
          oficina?: string
          user_id?: string
          veiculo_id?: string
          verificado?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "manutencoes_veiculo_id_fkey"
            columns: ["veiculo_id"]
            isOneToOne: false
            referencedRelation: "veiculos"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          cnpj: string | null
          created_at: string
          display_name: string | null
          endereco: string | null
          id: string
          is_verified: boolean
          is_verified_admin: boolean | null
          onboarding_completed: boolean | null
          profile_type: string | null
          razao_social: string | null
          role: string | null
          subscription_expires_at: string | null
          subscription_status: string
          telefone: string | null
          updated_at: string
          user_id: string
          user_type: string | null
        }
        Insert: {
          cnpj?: string | null
          created_at?: string
          display_name?: string | null
          endereco?: string | null
          id?: string
          is_verified?: boolean
          is_verified_admin?: boolean | null
          onboarding_completed?: boolean | null
          profile_type?: string | null
          razao_social?: string | null
          role?: string | null
          subscription_expires_at?: string | null
          subscription_status?: string
          telefone?: string | null
          updated_at?: string
          user_id: string
          user_type?: string | null
        }
        Update: {
          cnpj?: string | null
          created_at?: string
          display_name?: string | null
          endereco?: string | null
          id?: string
          is_verified?: boolean
          is_verified_admin?: boolean | null
          onboarding_completed?: boolean | null
          profile_type?: string | null
          razao_social?: string | null
          role?: string | null
          subscription_expires_at?: string | null
          subscription_status?: string
          telefone?: string | null
          updated_at?: string
          user_id?: string
          user_type?: string | null
        }
        Relationships: []
      }
      vehicle_users: {
        Row: {
          created_at: string
          id: string
          invited_by: string | null
          permission: Database["public"]["Enums"]["vehicle_permission"]
          user_id: string
          vehicle_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          invited_by?: string | null
          permission?: Database["public"]["Enums"]["vehicle_permission"]
          user_id: string
          vehicle_id: string
        }
        Update: {
          created_at?: string
          id?: string
          invited_by?: string | null
          permission?: Database["public"]["Enums"]["vehicle_permission"]
          user_id?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_users_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "veiculos"
            referencedColumns: ["id"]
          },
        ]
      }
      veiculos: {
        Row: {
          ano: number | null
          cor: string | null
          created_at: string
          id: string
          marca: string | null
          modelo: string | null
          oficina_email: string | null
          placa: string
          proprietario_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ano?: number | null
          cor?: string | null
          created_at?: string
          id?: string
          marca?: string | null
          modelo?: string | null
          oficina_email?: string | null
          placa: string
          proprietario_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ano?: number | null
          cor?: string | null
          created_at?: string
          id?: string
          marca?: string | null
          modelo?: string | null
          oficina_email?: string | null
          placa?: string
          proprietario_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "veiculos_proprietario_id_fkey"
            columns: ["proprietario_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: never; Returns: boolean }
      is_vehicle_owner: {
        Args: { _user_id: string; _vehicle_id: string }
        Returns: boolean
      }
      user_has_vehicle_access: {
        Args: { _user_id: string; _vehicle_id: string }
        Returns: boolean
      }
    }
    Enums: {
      vehicle_permission: "owner" | "editor" | "viewer"
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
      vehicle_permission: ["owner", "editor", "viewer"],
    },
  },
} as const
