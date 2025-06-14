export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      appreciation_comments: {
        Row: {
          appreciation_id: string
          comment: string
          commenter_name: string
          commenter_user_id: string | null
          created_at: string
          household_id: string
          id: string
        }
        Insert: {
          appreciation_id: string
          comment: string
          commenter_name: string
          commenter_user_id?: string | null
          created_at?: string
          household_id: string
          id?: string
        }
        Update: {
          appreciation_id?: string
          comment?: string
          commenter_name?: string
          commenter_user_id?: string | null
          created_at?: string
          household_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "appreciation_comments_appreciation_id_fkey"
            columns: ["appreciation_id"]
            isOneToOne: false
            referencedRelation: "appreciations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appreciation_comments_commenter_user_id_fkey"
            columns: ["commenter_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appreciation_comments_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      appreciation_reactions: {
        Row: {
          appreciation_id: string
          created_at: string
          household_id: string
          id: string
          reactor_name: string
          reactor_user_id: string | null
        }
        Insert: {
          appreciation_id: string
          created_at?: string
          household_id: string
          id?: string
          reactor_name: string
          reactor_user_id?: string | null
        }
        Update: {
          appreciation_id?: string
          created_at?: string
          household_id?: string
          id?: string
          reactor_name?: string
          reactor_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appreciation_reactions_appreciation_id_fkey"
            columns: ["appreciation_id"]
            isOneToOne: false
            referencedRelation: "appreciations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appreciation_reactions_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appreciation_reactions_reactor_user_id_fkey"
            columns: ["reactor_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      appreciations: {
        Row: {
          created_at: string
          from_member: string
          from_user_id: string | null
          household_id: string
          id: string
          message: string
          to_member: string
          to_user_id: string | null
        }
        Insert: {
          created_at?: string
          from_member: string
          from_user_id?: string | null
          household_id: string
          id?: string
          message: string
          to_member: string
          to_user_id?: string | null
        }
        Update: {
          created_at?: string
          from_member?: string
          from_user_id?: string | null
          household_id?: string
          id?: string
          message?: string
          to_member?: string
          to_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appreciations_from_user_id_fkey"
            columns: ["from_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appreciations_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appreciations_to_user_id_fkey"
            columns: ["to_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      bills: {
        Row: {
          amount: number
          assigned_to: string
          category: string
          created_at: string
          due_date: string
          household_id: string
          id: string
          is_paid: boolean
          is_template: boolean | null
          name: string
          next_due_date: string | null
          parent_bill_id: string | null
          recurrence_interval: number | null
          recurrence_type: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          assigned_to: string
          category: string
          created_at?: string
          due_date: string
          household_id: string
          id?: string
          is_paid?: boolean
          is_template?: boolean | null
          name: string
          next_due_date?: string | null
          parent_bill_id?: string | null
          recurrence_interval?: number | null
          recurrence_type?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          assigned_to?: string
          category?: string
          created_at?: string
          due_date?: string
          household_id?: string
          id?: string
          is_paid?: boolean
          is_template?: boolean | null
          name?: string
          next_due_date?: string | null
          parent_bill_id?: string | null
          recurrence_interval?: number | null
          recurrence_type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bills_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bills_parent_bill_id_fkey"
            columns: ["parent_bill_id"]
            isOneToOne: false
            referencedRelation: "bills"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_events: {
        Row: {
          assigned_to: string[] | null
          category: string | null
          color: string | null
          created_at: string
          creator_id: string
          description: string | null
          end_datetime: string | null
          household_id: string
          id: string
          is_recurring: boolean | null
          recurrence_end: string | null
          recurrence_pattern: string | null
          start_datetime: string
          title: string
        }
        Insert: {
          assigned_to?: string[] | null
          category?: string | null
          color?: string | null
          created_at?: string
          creator_id: string
          description?: string | null
          end_datetime?: string | null
          household_id: string
          id?: string
          is_recurring?: boolean | null
          recurrence_end?: string | null
          recurrence_pattern?: string | null
          start_datetime: string
          title: string
        }
        Update: {
          assigned_to?: string[] | null
          category?: string | null
          color?: string | null
          created_at?: string
          creator_id?: string
          description?: string | null
          end_datetime?: string | null
          household_id?: string
          id?: string
          is_recurring?: boolean | null
          recurrence_end?: string | null
          recurrence_pattern?: string | null
          start_datetime?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_events_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_events_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      chores: {
        Row: {
          assigned_to: string
          completed: boolean
          created_at: string
          description: string
          due_date: string
          household_id: string
          id: string
          points: number
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to: string
          completed?: boolean
          created_at?: string
          description: string
          due_date: string
          household_id: string
          id?: string
          points?: number
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string
          completed?: boolean
          created_at?: string
          description?: string
          due_date?: string
          household_id?: string
          id?: string
          points?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chores_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      emergency_contacts: {
        Row: {
          created_at: string | null
          household_id: string
          id: string
          is_primary: boolean | null
          name: string
          phone: string
          relationship: string
        }
        Insert: {
          created_at?: string | null
          household_id: string
          id?: string
          is_primary?: boolean | null
          name: string
          phone: string
          relationship: string
        }
        Update: {
          created_at?: string | null
          household_id?: string
          id?: string
          is_primary?: boolean | null
          name?: string
          phone?: string
          relationship?: string
        }
        Relationships: [
          {
            foreignKeyName: "emergency_contacts_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      event_categories: {
        Row: {
          color: string
          created_at: string | null
          household_id: string
          icon: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          color?: string
          created_at?: string | null
          household_id: string
          icon?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          color?: string
          created_at?: string | null
          household_id?: string
          icon?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_categories_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      event_reminders: {
        Row: {
          created_at: string | null
          event_id: string
          id: string
          is_sent: boolean | null
          reminder_time: unknown
          user_id: string
        }
        Insert: {
          created_at?: string | null
          event_id: string
          id?: string
          is_sent?: boolean | null
          reminder_time: unknown
          user_id: string
        }
        Update: {
          created_at?: string | null
          event_id?: string
          id?: string
          is_sent?: boolean | null
          reminder_time?: unknown
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_reminders_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "calendar_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_reminders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      family_messages: {
        Row: {
          created_at: string
          from_member: string
          household_id: string
          id: string
          is_special: boolean
          message: string
          to_member: string | null
        }
        Insert: {
          created_at?: string
          from_member: string
          household_id: string
          id?: string
          is_special?: boolean
          message: string
          to_member?: string | null
        }
        Update: {
          created_at?: string
          from_member?: string
          household_id?: string
          id?: string
          is_special?: boolean
          message?: string
          to_member?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "family_messages_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      family_notes: {
        Row: {
          author: string
          color: string
          content: string
          created_at: string
          household_id: string
          id: string
          is_pinned: boolean
          title: string
          updated_at: string
        }
        Insert: {
          author: string
          color?: string
          content: string
          created_at?: string
          household_id: string
          id?: string
          is_pinned?: boolean
          title: string
          updated_at?: string
        }
        Update: {
          author?: string
          color?: string
          content?: string
          created_at?: string
          household_id?: string
          id?: string
          is_pinned?: boolean
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "family_notes_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      household_info: {
        Row: {
          created_at: string | null
          description: string | null
          household_id: string
          id: string
          info_type: string
          title: string
          updated_at: string | null
          value: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          household_id: string
          id?: string
          info_type: string
          title: string
          updated_at?: string | null
          value: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          household_id?: string
          id?: string
          info_type?: string
          title?: string
          updated_at?: string | null
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "household_info_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      household_invitations: {
        Row: {
          accepted_at: string | null
          created_at: string | null
          expires_at: string | null
          household_id: string | null
          id: string
          invite_code: string
          invited_by: string | null
          invited_email: string
          status: Database["public"]["Enums"]["invitation_status"] | null
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string | null
          expires_at?: string | null
          household_id?: string | null
          id?: string
          invite_code: string
          invited_by?: string | null
          invited_email: string
          status?: Database["public"]["Enums"]["invitation_status"] | null
        }
        Update: {
          accepted_at?: string | null
          created_at?: string | null
          expires_at?: string | null
          household_id?: string | null
          id?: string
          invite_code?: string
          invited_by?: string | null
          invited_email?: string
          status?: Database["public"]["Enums"]["invitation_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "household_invitations_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "household_invitations_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      household_members: {
        Row: {
          household_id: string | null
          id: string
          joined_at: string | null
          role: Database["public"]["Enums"]["household_role"] | null
          user_id: string | null
        }
        Insert: {
          household_id?: string | null
          id?: string
          joined_at?: string | null
          role?: Database["public"]["Enums"]["household_role"] | null
          user_id?: string | null
        }
        Update: {
          household_id?: string | null
          id?: string
          joined_at?: string | null
          role?: Database["public"]["Enums"]["household_role"] | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "household_members_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "household_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      households: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          invite_code: string | null
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          invite_code?: string | null
          name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          invite_code?: string | null
          name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "households_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      medications: {
        Row: {
          child_name: string
          created_at: string | null
          dosage: string
          frequency: string
          household_id: string
          id: string
          instructions: string | null
          medication_name: string
          prescribing_doctor: string | null
          updated_at: string | null
        }
        Insert: {
          child_name: string
          created_at?: string | null
          dosage: string
          frequency: string
          household_id: string
          id?: string
          instructions?: string | null
          medication_name: string
          prescribing_doctor?: string | null
          updated_at?: string | null
        }
        Update: {
          child_name?: string
          created_at?: string | null
          dosage?: string
          frequency?: string
          household_id?: string
          id?: string
          instructions?: string | null
          medication_name?: string
          prescribing_doctor?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "medications_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      nanny_access_tokens: {
        Row: {
          created_at: string
          created_by: string | null
          expires_at: string
          household_id: string
          id: string
          is_active: boolean
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          expires_at?: string
          household_id: string
          id?: string
          is_active?: boolean
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          expires_at?: string
          household_id?: string
          id?: string
          is_active?: boolean
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_selection: string | null
          avatar_url: string | null
          created_at: string | null
          device_id: string | null
          email: string
          first_name: string | null
          id: string
          is_child_account: boolean | null
          last_name: string | null
          parent_id: string | null
          pin: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          stripe_customer_id: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_selection?: string | null
          avatar_url?: string | null
          created_at?: string | null
          device_id?: string | null
          email: string
          first_name?: string | null
          id: string
          is_child_account?: boolean | null
          last_name?: string | null
          parent_id?: string | null
          pin?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          stripe_customer_id?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_selection?: string | null
          avatar_url?: string | null
          created_at?: string | null
          device_id?: string | null
          email?: string
          first_name?: string | null
          id?: string
          is_child_account?: boolean | null
          last_name?: string | null
          parent_id?: string | null
          pin?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          stripe_customer_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_page_preferences: {
        Row: {
          created_at: string
          id: string
          is_visible: boolean
          page_key: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_visible?: boolean
          page_key: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_visible?: boolean
          page_key?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_page_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_subscriptions: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          plan_type: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_end_date: string | null
          subscription_start_date: string | null
          trial_end_date: string | null
          trial_start_date: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          plan_type?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_end_date?: string | null
          subscription_start_date?: string | null
          trial_end_date?: string | null
          trial_start_date?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          plan_type?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_end_date?: string | null
          subscription_start_date?: string | null
          trial_end_date?: string | null
          trial_start_date?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          email: string | null
          fullname: string | null
          id: string
        }
        Insert: {
          email?: string | null
          fullname?: string | null
          id: string
        }
        Update: {
          email?: string | null
          fullname?: string | null
          id?: string
        }
        Relationships: []
      }
      weekly_goals: {
        Row: {
          assigned_to: string
          completed: boolean
          created_at: string
          description: string
          household_id: string
          id: string
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to: string
          completed?: boolean
          created_at?: string
          description: string
          household_id: string
          id?: string
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string
          completed?: boolean
          created_at?: string
          description?: string
          household_id?: string
          id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "weekly_goals_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      weekly_wins: {
        Row: {
          added_by: string
          created_at: string
          description: string
          household_id: string
          id: string
          title: string
        }
        Insert: {
          added_by: string
          created_at?: string
          description: string
          household_id: string
          id?: string
          title: string
        }
        Update: {
          added_by?: string
          created_at?: string
          description?: string
          household_id?: string
          id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "weekly_wins_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_edit_calendar_event: {
        Args: { _event_id: string; _user_id: string }
        Returns: boolean
      }
      can_view_calendar_event: {
        Args: { _event_id: string; _user_id: string }
        Returns: boolean
      }
      create_child_profile: {
        Args: {
          p_first_name: string
          p_last_name: string
          p_pin: string
          p_avatar_selection: string
          p_parent_id: string
          p_household_id: string
        }
        Returns: string
      }
      create_profile_and_household: {
        Args: {
          p_email: string
          p_first_name?: string
          p_last_name?: string
          p_household_name?: string
        }
        Returns: undefined
      }
      generate_invite_code: {
        Args:
          | Record<PropertyKey, never>
          | { length?: number }
          | { p_household_id: string; p_invited_email: string }
        Returns: string
      }
      generate_nanny_token: {
        Args: { p_household_id: string }
        Returns: string
      }
      generate_next_bill_instance: {
        Args: { p_bill_id: string }
        Returns: string
      }
      is_household_member: {
        Args: { household_id: string }
        Returns: boolean
      }
      is_household_owner: {
        Args: { household_id: string }
        Returns: boolean
      }
      is_household_owner_or_admin: {
        Args: { household_id: string }
        Returns: boolean
      }
      is_user_member_of_household: {
        Args: { hh_id: string } | { user_id: string; household_id: string }
        Returns: boolean
      }
      process_recurring_bills: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      verify_child_pin: {
        Args: { p_pin: string; p_household_id: string }
        Returns: {
          child_id: string
          child_name: string
          avatar_selection: string
          household_id: string
        }[]
      }
      verify_nanny_token: {
        Args: { p_token: string }
        Returns: string
      }
    }
    Enums: {
      event_type:
        | "task"
        | "meeting"
        | "milestone"
        | "appointment"
        | "reminder"
        | "social"
        | "sync"
      household_role: "owner" | "admin" | "member"
      invitation_status: "pending" | "accepted" | "declined" | "expired"
      rsvp_status: "pending" | "accepted" | "declined" | "maybe"
      user_role: "parent" | "nanny" | "child" | "grandparent"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      event_type: [
        "task",
        "meeting",
        "milestone",
        "appointment",
        "reminder",
        "social",
        "sync",
      ],
      household_role: ["owner", "admin", "member"],
      invitation_status: ["pending", "accepted", "declined", "expired"],
      rsvp_status: ["pending", "accepted", "declined", "maybe"],
      user_role: ["parent", "nanny", "child", "grandparent"],
    },
  },
} as const
