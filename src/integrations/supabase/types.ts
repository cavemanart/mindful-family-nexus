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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
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
          updated_at: string | null
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
          updated_at?: string | null
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
          updated_at?: string | null
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
      child_pins: {
        Row: {
          created_at: string
          created_by: string | null
          household_id: string
          id: string
          pin: string
          used_at: string | null
          used_by_profile_id: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          household_id: string
          id?: string
          pin: string
          used_at?: string | null
          used_by_profile_id?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          household_id?: string
          id?: string
          pin?: string
          used_at?: string | null
          used_by_profile_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "child_pins_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "child_pins_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "child_pins_used_by_profile_id_fkey"
            columns: ["used_by_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      child_points: {
        Row: {
          child_id: string
          created_at: string
          household_id: string
          id: string
          last_activity_date: string | null
          level: number
          streak_days: number
          total_points: number
          updated_at: string
        }
        Insert: {
          child_id: string
          created_at?: string
          household_id: string
          id?: string
          last_activity_date?: string | null
          level?: number
          streak_days?: number
          total_points?: number
          updated_at?: string
        }
        Update: {
          child_id?: string
          created_at?: string
          household_id?: string
          id?: string
          last_activity_date?: string | null
          level?: number
          streak_days?: number
          total_points?: number
          updated_at?: string
        }
        Relationships: []
      }
      chore_submissions: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          child_id: string
          chore_id: string
          household_id: string
          id: string
          points_awarded: number | null
          rejection_reason: string | null
          status: string
          submission_note: string | null
          submitted_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          child_id: string
          chore_id: string
          household_id: string
          id?: string
          points_awarded?: number | null
          rejection_reason?: string | null
          status?: string
          submission_note?: string | null
          submitted_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          child_id?: string
          chore_id?: string
          household_id?: string
          id?: string
          points_awarded?: number | null
          rejection_reason?: string | null
          status?: string
          submission_note?: string | null
          submitted_at?: string
        }
        Relationships: []
      }
      chores: {
        Row: {
          approval_status: string | null
          approved_at: string | null
          approved_by: string | null
          assigned_to: string
          completed: boolean
          created_at: string
          created_by: string | null
          created_by_name: string | null
          description: string
          due_date: string
          household_id: string
          id: string
          is_assigned_by_parent: boolean | null
          is_shared_with_family: boolean | null
          points: number
          recurrence_interval: number | null
          recurrence_type: string | null
          requires_approval: boolean | null
          submission_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          assigned_to: string
          completed?: boolean
          created_at?: string
          created_by?: string | null
          created_by_name?: string | null
          description: string
          due_date: string
          household_id: string
          id?: string
          is_assigned_by_parent?: boolean | null
          is_shared_with_family?: boolean | null
          points?: number
          recurrence_interval?: number | null
          recurrence_type?: string | null
          requires_approval?: boolean | null
          submission_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          assigned_to?: string
          completed?: boolean
          created_at?: string
          created_by?: string | null
          created_by_name?: string | null
          description?: string
          due_date?: string
          household_id?: string
          id?: string
          is_assigned_by_parent?: boolean | null
          is_shared_with_family?: boolean | null
          points?: number
          recurrence_interval?: number | null
          recurrence_type?: string | null
          requires_approval?: boolean | null
          submission_id?: string | null
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
      family_challenges: {
        Row: {
          created_at: string
          created_by: string | null
          current_points: number
          description: string | null
          end_date: string
          household_id: string
          id: string
          is_active: boolean
          reward_description: string | null
          start_date: string
          target_points: number
          title: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          current_points?: number
          description?: string | null
          end_date: string
          household_id: string
          id?: string
          is_active?: boolean
          reward_description?: string | null
          start_date: string
          target_points: number
          title: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          current_points?: number
          description?: string | null
          end_date?: string
          household_id?: string
          id?: string
          is_active?: boolean
          reward_description?: string | null
          start_date?: string
          target_points?: number
          title?: string
        }
        Relationships: []
      }
      family_memories: {
        Row: {
          added_by: string
          added_by_user_id: string | null
          content: string
          created_at: string
          emotion_tags: string[] | null
          family_members: string[] | null
          household_id: string
          id: string
          memory_date: string
          memory_type: string
          title: string
          updated_at: string
        }
        Insert: {
          added_by: string
          added_by_user_id?: string | null
          content: string
          created_at?: string
          emotion_tags?: string[] | null
          family_members?: string[] | null
          household_id: string
          id?: string
          memory_date?: string
          memory_type?: string
          title: string
          updated_at?: string
        }
        Update: {
          added_by?: string
          added_by_user_id?: string | null
          content?: string
          created_at?: string
          emotion_tags?: string[] | null
          family_members?: string[] | null
          household_id?: string
          id?: string
          memory_date?: string
          memory_type?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
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
      household_join_codes: {
        Row: {
          code: string
          created_at: string
          created_by: string | null
          expires_at: string
          household_id: string
          id: string
          used_at: string | null
        }
        Insert: {
          code: string
          created_at?: string
          created_by?: string | null
          expires_at: string
          household_id: string
          id?: string
          used_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          created_by?: string | null
          expires_at?: string
          household_id?: string
          id?: string
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "household_join_codes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "household_join_codes_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
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
      mini_coach_moments: {
        Row: {
          coaching_type: string
          content: string
          created_at: string
          expires_at: string
          generated_for_date: string | null
          generated_for_week: string | null
          household_id: string
          id: string
          is_daily_auto: boolean | null
          is_read: boolean
        }
        Insert: {
          coaching_type?: string
          content: string
          created_at?: string
          expires_at?: string
          generated_for_date?: string | null
          generated_for_week?: string | null
          household_id: string
          id?: string
          is_daily_auto?: boolean | null
          is_read?: boolean
        }
        Update: {
          coaching_type?: string
          content?: string
          created_at?: string
          expires_at?: string
          generated_for_date?: string | null
          generated_for_week?: string | null
          household_id?: string
          id?: string
          is_daily_auto?: boolean | null
          is_read?: boolean
        }
        Relationships: []
      }
      mvp_nominations: {
        Row: {
          created_at: string
          emoji: string | null
          household_id: string
          id: string
          nominated_by: string
          nominated_by_user_id: string | null
          nominated_for: string
          nominated_for_user_id: string | null
          nomination_date: string
          reason: string
        }
        Insert: {
          created_at?: string
          emoji?: string | null
          household_id: string
          id?: string
          nominated_by: string
          nominated_by_user_id?: string | null
          nominated_for: string
          nominated_for_user_id?: string | null
          nomination_date?: string
          reason: string
        }
        Update: {
          created_at?: string
          emoji?: string | null
          household_id?: string
          id?: string
          nominated_by?: string
          nominated_by_user_id?: string | null
          nominated_for?: string
          nominated_for_user_id?: string | null
          nomination_date?: string
          reason?: string
        }
        Relationships: []
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
      notification_preferences: {
        Row: {
          created_at: string
          email_enabled: boolean
          id: string
          push_enabled: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email_enabled?: boolean
          id?: string
          push_enabled?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email_enabled?: boolean
          id?: string
          push_enabled?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      personal_goals: {
        Row: {
          completed: boolean
          created_at: string
          created_by: string
          created_by_name: string
          description: string
          household_id: string
          id: string
          is_shared_with_family: boolean
          target_date: string | null
          title: string
          updated_at: string
        }
        Insert: {
          completed?: boolean
          created_at?: string
          created_by: string
          created_by_name: string
          description: string
          household_id: string
          id?: string
          is_shared_with_family?: boolean
          target_date?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          completed?: boolean
          created_at?: string
          created_by?: string
          created_by_name?: string
          description?: string
          household_id?: string
          id?: string
          is_shared_with_family?: boolean
          target_date?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      point_goals: {
        Row: {
          child_id: string
          created_at: string
          current_points: number
          goal_date: string
          goal_type: string
          household_id: string
          id: string
          is_completed: boolean
          target_points: number
        }
        Insert: {
          child_id: string
          created_at?: string
          current_points?: number
          goal_date: string
          goal_type: string
          household_id: string
          id?: string
          is_completed?: boolean
          target_points: number
        }
        Update: {
          child_id?: string
          created_at?: string
          current_points?: number
          goal_date?: string
          goal_type?: string
          household_id?: string
          id?: string
          is_completed?: boolean
          target_points?: number
        }
        Relationships: []
      }
      point_transactions: {
        Row: {
          child_id: string
          created_at: string
          created_by: string | null
          description: string
          household_id: string
          id: string
          points_change: number
          related_chore_id: string | null
          related_reward_id: string | null
          transaction_type: string
        }
        Insert: {
          child_id: string
          created_at?: string
          created_by?: string | null
          description: string
          household_id: string
          id?: string
          points_change: number
          related_chore_id?: string | null
          related_reward_id?: string | null
          transaction_type: string
        }
        Update: {
          child_id?: string
          created_at?: string
          created_by?: string | null
          description?: string
          household_id?: string
          id?: string
          points_change?: number
          related_chore_id?: string | null
          related_reward_id?: string | null
          transaction_type?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_selection: string | null
          avatar_url: string | null
          created_at: string | null
          device_id: string | null
          email: string | null
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
          email?: string | null
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
          email?: string | null
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
      push_subscriptions: {
        Row: {
          auth_key: string | null
          created_at: string
          endpoint: string
          id: string
          is_active: boolean
          p256dh_key: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          auth_key?: string | null
          created_at?: string
          endpoint: string
          id?: string
          is_active?: boolean
          p256dh_key?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          auth_key?: string | null
          created_at?: string
          endpoint?: string
          id?: string
          is_active?: boolean
          p256dh_key?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      reward_redemptions: {
        Row: {
          child_id: string
          fulfilled_at: string | null
          fulfilled_by: string | null
          household_id: string
          id: string
          points_spent: number
          redeemed_at: string
          reward_id: string
          status: string
        }
        Insert: {
          child_id: string
          fulfilled_at?: string | null
          fulfilled_by?: string | null
          household_id: string
          id?: string
          points_spent: number
          redeemed_at?: string
          reward_id: string
          status?: string
        }
        Update: {
          child_id?: string
          fulfilled_at?: string | null
          fulfilled_by?: string | null
          household_id?: string
          id?: string
          points_spent?: number
          redeemed_at?: string
          reward_id?: string
          status?: string
        }
        Relationships: []
      }
      rewards_catalog: {
        Row: {
          age_restriction: string | null
          category: string
          created_at: string
          created_by: string | null
          description: string | null
          household_id: string
          id: string
          is_active: boolean
          name: string
          point_cost: number
          updated_at: string
        }
        Insert: {
          age_restriction?: string | null
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          household_id: string
          id?: string
          is_active?: boolean
          name: string
          point_cost: number
          updated_at?: string
        }
        Update: {
          age_restriction?: string | null
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          household_id?: string
          id?: string
          is_active?: boolean
          name?: string
          point_cost?: number
          updated_at?: string
        }
        Relationships: []
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
          canceled_at: string | null
          created_at: string
          household_id: string | null
          id: string
          is_active: boolean
          plan_type: string
          refund_id: string | null
          refunded_at: string | null
          status: string | null
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
          canceled_at?: string | null
          created_at?: string
          household_id?: string | null
          id?: string
          is_active?: boolean
          plan_type?: string
          refund_id?: string | null
          refunded_at?: string | null
          status?: string | null
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
          canceled_at?: string | null
          created_at?: string
          household_id?: string | null
          id?: string
          is_active?: boolean
          plan_type?: string
          refund_id?: string | null
          refunded_at?: string | null
          status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_end_date?: string | null
          subscription_start_date?: string | null
          trial_end_date?: string | null
          trial_start_date?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
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
          created_by: string | null
          created_by_name: string | null
          description: string
          household_id: string
          id: string
          is_assigned_by_parent: boolean | null
          is_shared_with_family: boolean | null
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to: string
          completed?: boolean
          created_at?: string
          created_by?: string | null
          created_by_name?: string | null
          description: string
          household_id: string
          id?: string
          is_assigned_by_parent?: boolean | null
          is_shared_with_family?: boolean | null
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string
          completed?: boolean
          created_at?: string
          created_by?: string | null
          created_by_name?: string | null
          description?: string
          household_id?: string
          id?: string
          is_assigned_by_parent?: boolean | null
          is_shared_with_family?: boolean | null
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
      user_households: {
        Row: {
          household_id: string | null
          user_id: string | null
        }
        Insert: {
          household_id?: string | null
          user_id?: string | null
        }
        Update: {
          household_id?: string | null
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
    }
    Functions: {
      can_edit_calendar_event: {
        Args: { _event_id: string; _user_id: string }
        Returns: boolean
      }
      can_manage_household_subscription: {
        Args: { p_user_id: string; p_household_id: string }
        Returns: boolean
      }
      can_view_calendar_event: {
        Args: { _event_id: string; _user_id: string }
        Returns: boolean
      }
      check_household_admin: {
        Args: { target_household_id: string; current_user_id: string }
        Returns: boolean
      }
      check_household_membership: {
        Args: { target_household_id: string; current_user_id: string }
        Returns: boolean
      }
      check_profile_access: {
        Args: { target_user_id: string; current_user_id: string }
        Returns: boolean
      }
      cleanup_expired_coaching_moments: {
        Args: Record<PropertyKey, never>
        Returns: number
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
      generate_child_pin: {
        Args: { _household_id: string }
        Returns: string
      }
      generate_daily_coaching_moment: {
        Args: { p_household_id: string }
        Returns: undefined
      }
      generate_household_join_code: {
        Args: { _household_id: string }
        Returns: string
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
      get_household_subscription_status: {
        Args: { p_household_id: string }
        Returns: {
          has_subscription: boolean
          plan_type: string
          is_trial_active: boolean
          subscription_end_date: string
          owner_user_id: string
        }[]
      }
      get_user_household: {
        Args: { user_id: string }
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
      join_household_with_code: {
        Args:
          | {
              _code: string
              _name: string
              _avatar_selection: string
              _device_id: string
            }
          | {
              _code: string
              _name: string
              _avatar_selection: string
              _device_id: string
              _role?: string
            }
        Returns: string
      }
      join_household_with_pin: {
        Args: {
          _pin: string
          _name: string
          _avatar_selection: string
          _device_id: string
        }
        Returns: string
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
