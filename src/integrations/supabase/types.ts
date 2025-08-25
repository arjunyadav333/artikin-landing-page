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
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      connections: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: []
      }
      conversation_participants: {
        Row: {
          conversation_id: string
          created_at: string | null
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          conversation_id: string
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          conversation_id?: string
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      conversation_states: {
        Row: {
          created_at: string
          id: string
          is_blocked: boolean
          is_muted: boolean
          is_pinned: boolean
          other_user_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_blocked?: boolean
          is_muted?: boolean
          is_pinned?: boolean
          other_user_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_blocked?: boolean
          is_muted?: boolean
          is_pinned?: boolean
          other_user_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      conversations: {
        Row: {
          created_at: string | null
          creator_id: string | null
          id: string
          title: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          creator_id?: string | null
          id?: string
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          creator_id?: string | null
          id?: string
          title?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      draft_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      group_members: {
        Row: {
          added_by: string | null
          group_id: string
          id: string
          joined_at: string
          permissions: Json | null
          role: string
          user_id: string
        }
        Insert: {
          added_by?: string | null
          group_id: string
          id?: string
          joined_at?: string
          permissions?: Json | null
          role?: string
          user_id: string
        }
        Update: {
          added_by?: string | null
          group_id?: string
          id?: string
          joined_at?: string
          permissions?: Json | null
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      groups: {
        Row: {
          avatar_url: string | null
          created_at: string
          created_by: string
          description: string | null
          id: string
          invite_link_code: string | null
          is_announcement_only: boolean | null
          max_members: number | null
          member_count: number | null
          name: string
          settings: Json | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          invite_link_code?: string | null
          is_announcement_only?: boolean | null
          max_members?: number | null
          member_count?: number | null
          name: string
          settings?: Json | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          invite_link_code?: string | null
          is_announcement_only?: boolean | null
          max_members?: number | null
          member_count?: number | null
          name?: string
          settings?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      message_rate_limits: {
        Row: {
          created_at: string
          id: string
          message_count: number
          user_id: string
          window_start: string
        }
        Insert: {
          created_at?: string
          id?: string
          message_count?: number
          user_id: string
          window_start?: string
        }
        Update: {
          created_at?: string
          id?: string
          message_count?: number
          user_id?: string
          window_start?: string
        }
        Relationships: []
      }
      message_reactions: {
        Row: {
          created_at: string
          emoji: string
          id: string
          message_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          emoji: string
          id?: string
          message_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          emoji?: string
          id?: string
          message_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_reactions_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      message_receipts: {
        Row: {
          id: string
          message_id: string
          status: string
          timestamp: string
          user_id: string
        }
        Insert: {
          id?: string
          message_id: string
          status: string
          timestamp?: string
          user_id: string
        }
        Update: {
          id?: string
          message_id?: string
          status?: string
          timestamp?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_receipts_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string
          deleted_at: string | null
          delivered_at: string | null
          duration: number | null
          edited_at: string | null
          file_name: string | null
          file_size: number | null
          forward_count: number | null
          id: string
          is_forwarded: boolean | null
          is_starred: boolean | null
          media_type: string | null
          media_url: string | null
          message_type: string | null
          read_at: string | null
          recipient_id: string
          reply_to_id: string | null
          sender_id: string
          status: string | null
          thumbnail_url: string | null
        }
        Insert: {
          content: string
          created_at?: string
          deleted_at?: string | null
          delivered_at?: string | null
          duration?: number | null
          edited_at?: string | null
          file_name?: string | null
          file_size?: number | null
          forward_count?: number | null
          id?: string
          is_forwarded?: boolean | null
          is_starred?: boolean | null
          media_type?: string | null
          media_url?: string | null
          message_type?: string | null
          read_at?: string | null
          recipient_id: string
          reply_to_id?: string | null
          sender_id: string
          status?: string | null
          thumbnail_url?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          deleted_at?: string | null
          delivered_at?: string | null
          duration?: number | null
          edited_at?: string | null
          file_name?: string | null
          file_size?: number | null
          forward_count?: number | null
          id?: string
          is_forwarded?: boolean | null
          is_starred?: boolean | null
          media_type?: string | null
          media_url?: string | null
          message_type?: string | null
          read_at?: string | null
          recipient_id?: string
          reply_to_id?: string | null
          sender_id?: string
          status?: string | null
          thumbnail_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_reply_to_id_fkey"
            columns: ["reply_to_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          actor_id: string
          created_at: string
          id: string
          metadata: Json | null
          opportunity_id: string | null
          post_id: string | null
          read: boolean
          recipient_id: string
          type: Database["public"]["Enums"]["notification_type"]
        }
        Insert: {
          actor_id: string
          created_at?: string
          id?: string
          metadata?: Json | null
          opportunity_id?: string | null
          post_id?: string | null
          read?: boolean
          recipient_id: string
          type: Database["public"]["Enums"]["notification_type"]
        }
        Update: {
          actor_id?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          opportunity_id?: string | null
          post_id?: string | null
          read?: boolean
          recipient_id?: string
          type?: Database["public"]["Enums"]["notification_type"]
        }
        Relationships: []
      }
      opportunities: {
        Row: {
          art_form: Database["public"]["Enums"]["art_form"]
          company: string
          created_at: string
          deadline: string | null
          description: string
          experience_level: string | null
          gender_preference: string | null
          id: string
          location: string | null
          opportunity_type: Database["public"]["Enums"]["opportunity_type"]
          posted_by: string
          requirements: string[] | null
          salary_range: string | null
          saves: number | null
          status: Database["public"]["Enums"]["opportunity_status"] | null
          title: string
          updated_at: string
          views: number | null
        }
        Insert: {
          art_form: Database["public"]["Enums"]["art_form"]
          company: string
          created_at?: string
          deadline?: string | null
          description: string
          experience_level?: string | null
          gender_preference?: string | null
          id?: string
          location?: string | null
          opportunity_type: Database["public"]["Enums"]["opportunity_type"]
          posted_by: string
          requirements?: string[] | null
          salary_range?: string | null
          saves?: number | null
          status?: Database["public"]["Enums"]["opportunity_status"] | null
          title: string
          updated_at?: string
          views?: number | null
        }
        Update: {
          art_form?: Database["public"]["Enums"]["art_form"]
          company?: string
          created_at?: string
          deadline?: string | null
          description?: string
          experience_level?: string | null
          gender_preference?: string | null
          id?: string
          location?: string | null
          opportunity_type?: Database["public"]["Enums"]["opportunity_type"]
          posted_by?: string
          requirements?: string[] | null
          salary_range?: string | null
          saves?: number | null
          status?: Database["public"]["Enums"]["opportunity_status"] | null
          title?: string
          updated_at?: string
          views?: number | null
        }
        Relationships: []
      }
      "opportunities applications": {
        Row: {
          applicant_id: string
          applied_at: string
          cover_letter: string | null
          id: string
          opportunity_id: string
          portfolio_url: string | null
          resume_url: string | null
          status: Database["public"]["Enums"]["application_status"] | null
          updated_at: string
        }
        Insert: {
          applicant_id: string
          applied_at?: string
          cover_letter?: string | null
          id?: string
          opportunity_id: string
          portfolio_url?: string | null
          resume_url?: string | null
          status?: Database["public"]["Enums"]["application_status"] | null
          updated_at?: string
        }
        Update: {
          applicant_id?: string
          applied_at?: string
          cover_letter?: string | null
          id?: string
          opportunity_id?: string
          portfolio_url?: string | null
          resume_url?: string | null
          status?: Database["public"]["Enums"]["application_status"] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      performance_metrics: {
        Row: {
          created_at: string | null
          id: string
          metadata: Json | null
          metric_type: string
          metric_value: number
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          metadata?: Json | null
          metric_type: string
          metric_value: number
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          metadata?: Json | null
          metric_type?: string
          metric_value?: number
          user_id?: string | null
        }
        Relationships: []
      }
      post_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          post_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          post_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          post_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_likes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_shares: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: []
      }
      posts: {
        Row: {
          comments_count: number | null
          content: string | null
          created_at: string
          id: string
          image_url: string | null
          likes_count: number | null
          media_type: string | null
          post_type: string | null
          shares_count: number | null
          updated_at: string
          user_id: string
          video_url: string | null
        }
        Insert: {
          comments_count?: number | null
          content?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          likes_count?: number | null
          media_type?: string | null
          post_type?: string | null
          shares_count?: number | null
          updated_at?: string
          user_id: string
          video_url?: string | null
        }
        Update: {
          comments_count?: number | null
          content?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          likes_count?: number | null
          media_type?: string | null
          post_type?: string | null
          shares_count?: number | null
          updated_at?: string
          user_id?: string
          video_url?: string | null
        }
        Relationships: []
      }
      profile_view_logs: {
        Row: {
          id: string
          ip_address: unknown | null
          user_agent: string | null
          viewed_at: string
          viewed_profile_id: string
          viewer_id: string | null
        }
        Insert: {
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          viewed_at?: string
          viewed_profile_id: string
          viewer_id?: string | null
        }
        Update: {
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          viewed_at?: string
          viewed_profile_id?: string
          viewer_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          age: number | null
          art_form: Database["public"]["Enums"]["art_form"] | null
          avatar_url: string | null
          awards: string[] | null
          background_image_url: string | null
          bio: string | null
          certificates: string[] | null
          collaborations_available: boolean | null
          company_type: string | null
          contact_person_name: string | null
          created_at: string
          display_name: string | null
          email: string | null
          eye_color: string | null
          gender: string | null
          hair_color: string | null
          height: string | null
          id: string
          languages_spoken: string[] | null
          location: string | null
          looking_for: Json | null
          organization_name: string | null
          past_projects: Json | null
          phone_number: string | null
          portfolio_images: string[] | null
          skin_tone: string | null
          social_links: Json | null
          team_size: string | null
          updated_at: string
          user_id: string
          username: string | null
          website_url: string | null
          weight: string | null
        }
        Insert: {
          age?: number | null
          art_form?: Database["public"]["Enums"]["art_form"] | null
          avatar_url?: string | null
          awards?: string[] | null
          background_image_url?: string | null
          bio?: string | null
          certificates?: string[] | null
          collaborations_available?: boolean | null
          company_type?: string | null
          contact_person_name?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          eye_color?: string | null
          gender?: string | null
          hair_color?: string | null
          height?: string | null
          id?: string
          languages_spoken?: string[] | null
          location?: string | null
          looking_for?: Json | null
          organization_name?: string | null
          past_projects?: Json | null
          phone_number?: string | null
          portfolio_images?: string[] | null
          skin_tone?: string | null
          social_links?: Json | null
          team_size?: string | null
          updated_at?: string
          user_id: string
          username?: string | null
          website_url?: string | null
          weight?: string | null
        }
        Update: {
          age?: number | null
          art_form?: Database["public"]["Enums"]["art_form"] | null
          avatar_url?: string | null
          awards?: string[] | null
          background_image_url?: string | null
          bio?: string | null
          certificates?: string[] | null
          collaborations_available?: boolean | null
          company_type?: string | null
          contact_person_name?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          eye_color?: string | null
          gender?: string | null
          hair_color?: string | null
          height?: string | null
          id?: string
          languages_spoken?: string[] | null
          location?: string | null
          looking_for?: Json | null
          organization_name?: string | null
          past_projects?: Json | null
          phone_number?: string | null
          portfolio_images?: string[] | null
          skin_tone?: string | null
          social_links?: Json | null
          team_size?: string | null
          updated_at?: string
          user_id?: string
          username?: string | null
          website_url?: string | null
          weight?: string | null
        }
        Relationships: []
      }
      saved_opportunities: {
        Row: {
          id: string
          opportunity_id: string
          saved_at: string
          user_id: string
        }
        Insert: {
          id?: string
          opportunity_id: string
          saved_at?: string
          user_id: string
        }
        Update: {
          id?: string
          opportunity_id?: string
          saved_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_opportunities_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: true
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_posts: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: []
      }
      saved_profiles: {
        Row: {
          id: string
          saved_at: string
          saved_profile_id: string
          user_id: string
        }
        Insert: {
          id?: string
          saved_at?: string
          saved_profile_id: string
          user_id: string
        }
        Update: {
          id?: string
          saved_at?: string
          saved_profile_id?: string
          user_id?: string
        }
        Relationships: []
      }
      starred_messages: {
        Row: {
          id: string
          message_id: string
          starred_at: string
          user_id: string
        }
        Insert: {
          id?: string
          message_id: string
          starred_at?: string
          user_id: string
        }
        Update: {
          id?: string
          message_id?: string
          starred_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "starred_messages_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      tags: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      typing_indicators: {
        Row: {
          conversation_with: string
          created_at: string
          id: string
          is_typing: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          conversation_with: string
          created_at?: string
          id?: string
          is_typing?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          conversation_with?: string
          created_at?: string
          id?: string
          is_typing?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          activity_status_visible: boolean
          connection_visibility: string
          content_visibility: string
          created_at: string
          email_notifications: boolean
          follow_notifications: boolean
          id: string
          message_notifications: boolean
          message_permissions: string
          opportunity_notifications: boolean
          profile_visibility: string
          push_notifications: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          activity_status_visible?: boolean
          connection_visibility?: string
          content_visibility?: string
          created_at?: string
          email_notifications?: boolean
          follow_notifications?: boolean
          id?: string
          message_notifications?: boolean
          message_permissions?: string
          opportunity_notifications?: boolean
          profile_visibility?: string
          push_notifications?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          activity_status_visible?: boolean
          connection_visibility?: string
          content_visibility?: string
          created_at?: string
          email_notifications?: boolean
          follow_notifications?: boolean
          id?: string
          message_notifications?: boolean
          message_permissions?: string
          opportunity_notifications?: boolean
          profile_visibility?: string
          push_notifications?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_view_basic_profile: {
        Args: { profile_user_id: string }
        Returns: boolean
      }
      can_view_content: {
        Args: { profile_user_id: string }
        Returns: boolean
      }
      can_view_profile: {
        Args: { profile_user_id: string }
        Returns: boolean
      }
      can_view_sensitive_profile_data: {
        Args: { profile_user_id: string }
        Returns: boolean
      }
      check_auth_security_settings: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      check_message_rate_limit: {
        Args: { max_messages?: number; user_uuid: string }
        Returns: boolean
      }
      enable_leaked_password_protection: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      get_applications_with_profiles: {
        Args: { opportunity_uuid: string }
        Returns: {
          applicant_id: string
          application_id: string
          applied_at: string
          art_form: Database["public"]["Enums"]["art_form"]
          avatar_url: string
          bio: string
          cover_letter: string
          display_name: string
          location: string
          portfolio_url: string
          profile_id: string
          resume_url: string
          status: Database["public"]["Enums"]["application_status"]
          username: string
        }[]
      }
      get_conversation_messages: {
        Args: { limit_count?: number; user1_id: string; user2_id: string }
        Returns: {
          content: string
          created_at: string
          file_name: string
          file_size: number
          id: string
          media_type: string
          media_url: string
          read_at: string
          recipient_id: string
          sender_id: string
        }[]
      }
      get_followers_with_profiles: {
        Args: { user_id: string }
        Returns: {
          created_at: string
          follower_id: string
          follower_profile: Json
        }[]
      }
      get_following_with_profiles: {
        Args: { user_id: string }
        Returns: {
          created_at: string
          following_id: string
          following_profile: Json
        }[]
      }
      get_optimized_connections: {
        Args: {
          limit_count?: number
          offset_count?: number
          user_uuid?: string
        }
        Returns: {
          art_form: Database["public"]["Enums"]["art_form"]
          avatar_url: string
          bio: string
          connected_at: string
          connection_id: string
          display_name: string
          is_following: boolean
          location: string
          mutual_connections: number
          user_id: string
          username: string
        }[]
      }
      get_optimized_home_feed: {
        Args: {
          limit_count?: number
          offset_count?: number
          user_uuid?: string
        }
        Returns: {
          avatar_url: string
          comments_count: number
          content: string
          created_at: string
          display_name: string
          image_url: string
          is_liked: boolean
          is_saved: boolean
          likes_count: number
          post_id: string
          shares_count: number
          user_id: string
          username: string
          video_url: string
        }[]
      }
      get_optimized_opportunities: {
        Args: {
          art_form_filter?: Database["public"]["Enums"]["art_form"]
          limit_count?: number
          location_filter?: string
          offset_count?: number
          user_uuid?: string
        }
        Returns: {
          art_form: Database["public"]["Enums"]["art_form"]
          company: string
          created_at: string
          deadline: string
          description: string
          is_saved: boolean
          location: string
          opportunity_id: string
          posted_by: string
          poster_avatar: string
          poster_name: string
          salary_range: string
          saves: number
          title: string
          views: number
        }[]
      }
      get_optimized_user_profile: {
        Args: { profile_user_id: string }
        Returns: {
          art_form: Database["public"]["Enums"]["art_form"]
          avatar_url: string
          background_image_url: string
          bio: string
          can_view_profile: boolean
          connections_count: number
          display_name: string
          followers_count: number
          following_count: number
          is_following: boolean
          location: string
          opportunities_posted: number
          posts_count: number
          profile_id: string
          user_id: string
          username: string
          website_url: string
        }[]
      }
      get_otp_expiry_settings: {
        Args: Record<PropertyKey, never>
        Returns: {
          expiry_seconds: number
          provider: string
        }[]
      }
      get_posts_with_profiles_optimized: {
        Args: { limit_count?: number; offset_count?: number }
        Returns: {
          art_form: string
          avatar_url: string
          comments_count: number
          company_type: string
          content: string
          created_at: string
          display_name: string
          id: string
          image_url: string
          likes_count: number
          organization_name: string
          shares_count: number
          user_id: string
          username: string
          video_url: string
        }[]
      }
      get_posts_with_profiles_optimized_v2: {
        Args: { limit_count?: number; offset_count?: number }
        Returns: {
          art_form: string
          avatar_url: string
          comments_count: number
          company_type: string
          content: string
          created_at: string
          display_name: string
          id: string
          image_url: string
          likes_count: number
          organization_name: string
          shares_count: number
          user_id: string
          username: string
          video_url: string
        }[]
      }
      get_safe_profile_data: {
        Args: { profile_user_id: string }
        Returns: {
          age: number
          art_form: string
          avatar_url: string
          awards: string[]
          background_image_url: string
          bio: string
          certificates: string[]
          collaborations_available: boolean
          company_type: string
          contact_person_name: string
          created_at: string
          display_name: string
          email: string
          eye_color: string
          gender: string
          hair_color: string
          height: string
          id: string
          languages_spoken: string[]
          location: string
          looking_for: Json
          organization_name: string
          past_projects: Json
          phone_number: string
          portfolio_images: string[]
          skin_tone: string
          social_links: Json
          team_size: string
          user_id: string
          username: string
          website_url: string
          weight: string
        }[]
      }
      get_safe_profile_fields: {
        Args: { profile_user_id: string }
        Returns: {
          art_form: Database["public"]["Enums"]["art_form"]
          avatar_url: string
          background_image_url: string
          bio: string
          collaborations_available: boolean
          company_type: string
          created_at: string
          display_name: string
          id: string
          location: string
          organization_name: string
          user_id: string
          username: string
          website_url: string
        }[]
      }
      get_unread_messages_count: {
        Args: { user_uuid: string }
        Returns: number
      }
      get_user_notifications: {
        Args: { limit_count?: number; offset_count?: number; user_uuid: string }
        Returns: {
          actor_avatar_url: string
          actor_display_name: string
          actor_id: string
          actor_username: string
          created_at: string
          id: string
          metadata: Json
          opportunity_id: string
          post_id: string
          read: boolean
          type: Database["public"]["Enums"]["notification_type"]
        }[]
      }
      get_user_notifications_optimized: {
        Args: { limit_count?: number; offset_count?: number; user_uuid: string }
        Returns: {
          actor_avatar_url: string
          actor_display_name: string
          actor_username: string
          created_at: string
          id: string
          metadata: Json
          opportunity_id: string
          post_id: string
          read: boolean
          type: Database["public"]["Enums"]["notification_type"]
        }[]
      }
      get_user_posts_count: {
        Args: { profile_user_id: string }
        Returns: number
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_opportunity_views: {
        Args: { opportunity_id: string }
        Returns: undefined
      }
      insert_performance_metrics: {
        Args: { metrics_data: Json }
        Returns: undefined
      }
      is_user_blocked: {
        Args: { recipient_uuid: string; sender_uuid: string }
        Returns: boolean
      }
      log_profile_view: {
        Args: { viewed_user_id: string }
        Returns: boolean
      }
      set_auth_config: {
        Args: { config: Json } | { config_param: string; config_value: string }
        Returns: undefined
      }
      update_message_status_to_delivered: {
        Args: { recipient_user_id: string; sender_user_id: string }
        Returns: undefined
      }
      update_messages_to_read: {
        Args: { recipient_user_id: string; sender_user_id: string }
        Returns: undefined
      }
      validate_message_content: {
        Args: { content_text: string; max_length?: number }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      application_status:
        | "Pending"
        | "Accepted"
        | "Rejected"
        | "Withdrawn"
        | "Shortlisted"
      art_form:
        | "Photography"
        | "Dance"
        | "Acting"
        | "Music"
        | "Visual Arts"
        | "Voice Acting"
        | "Videography"
        | "Modeling"
        | "Singing"
      notification_type:
        | "like"
        | "comment"
        | "profile_visit"
        | "opportunity_posted"
        | "application_status_changed"
        | "application_submitted"
      opportunity_status: "Open" | "Urgent" | "Closed"
      opportunity_type:
        | "Contract"
        | "Freelance"
        | "Project"
        | "Full-time"
        | "Part-time"
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
      app_role: ["admin", "moderator", "user"],
      application_status: [
        "Pending",
        "Accepted",
        "Rejected",
        "Withdrawn",
        "Shortlisted",
      ],
      art_form: [
        "Photography",
        "Dance",
        "Acting",
        "Music",
        "Visual Arts",
        "Voice Acting",
        "Videography",
        "Modeling",
        "Singing",
      ],
      notification_type: [
        "like",
        "comment",
        "profile_visit",
        "opportunity_posted",
        "application_status_changed",
        "application_submitted",
      ],
      opportunity_status: ["Open", "Urgent", "Closed"],
      opportunity_type: [
        "Contract",
        "Freelance",
        "Project",
        "Full-time",
        "Part-time",
      ],
    },
  },
} as const
