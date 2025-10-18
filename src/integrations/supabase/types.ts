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
      applicant_history: {
        Row: {
          application_id: string
          changed_at: string
          changed_by_user_id: string
          created_at: string
          id: string
          new_status: string
          old_status: string | null
          reason: string | null
        }
        Insert: {
          application_id: string
          changed_at?: string
          changed_by_user_id: string
          created_at?: string
          id?: string
          new_status: string
          old_status?: string | null
          reason?: string | null
        }
        Update: {
          application_id?: string
          changed_at?: string
          changed_by_user_id?: string
          created_at?: string
          id?: string
          new_status?: string
          old_status?: string | null
          reason?: string | null
        }
        Relationships: []
      }
      comments: {
        Row: {
          content: string
          created_at: string | null
          id: string
          likes_count: number | null
          post_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          likes_count?: number | null
          post_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          likes_count?: number | null
          post_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts_with_profiles_secure"
            referencedColumns: ["id"]
          },
        ]
      }
      connections: {
        Row: {
          created_at: string | null
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string | null
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string | null
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: []
      }
      conversation_participants: {
        Row: {
          archived: boolean | null
          conversation_id: string
          created_at: string | null
          deleted: boolean | null
          drafted_text: string | null
          last_read_message_id: string | null
          muted: boolean | null
          pinned: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          archived?: boolean | null
          conversation_id: string
          created_at?: string | null
          deleted?: boolean | null
          drafted_text?: string | null
          last_read_message_id?: string | null
          muted?: boolean | null
          pinned?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          archived?: boolean | null
          conversation_id?: string
          created_at?: string | null
          deleted?: boolean | null
          drafted_text?: string | null
          last_read_message_id?: string | null
          muted?: boolean | null
          pinned?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_participants_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_participants_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations_secure"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string | null
          id: string
          last_message_at: string | null
          last_message_id: string | null
          last_message_type: string | null
          opportunity_id: string | null
          participant_a: string
          participant_b: string
          unread_count_user1: number | null
          unread_count_user2: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          last_message_id?: string | null
          last_message_type?: string | null
          opportunity_id?: string | null
          participant_a: string
          participant_b: string
          unread_count_user1?: number | null
          unread_count_user2?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          last_message_id?: string | null
          last_message_type?: string | null
          opportunity_id?: string | null
          participant_a?: string
          participant_b?: string
          unread_count_user1?: number | null
          unread_count_user2?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_last_message_id_fkey"
            columns: ["last_message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_last_message_id_fkey"
            columns: ["last_message_id"]
            isOneToOne: false
            referencedRelation: "messages_with_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_conversations_last_message"
            columns: ["last_message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_conversations_last_message"
            columns: ["last_message_id"]
            isOneToOne: false
            referencedRelation: "messages_with_details"
            referencedColumns: ["id"]
          },
        ]
      }
      follows: {
        Row: {
          created_at: string | null
          followed_id: string
          follower_id: string
        }
        Insert: {
          created_at?: string | null
          followed_id: string
          follower_id: string
        }
        Update: {
          created_at?: string | null
          followed_id?: string
          follower_id?: string
        }
        Relationships: []
      }
      likes: {
        Row: {
          comment_id: string | null
          created_at: string | null
          id: string
          post_id: string | null
          user_id: string
        }
        Insert: {
          comment_id?: string | null
          created_at?: string | null
          id?: string
          post_id?: string | null
          user_id: string
        }
        Update: {
          comment_id?: string | null
          created_at?: string | null
          id?: string
          post_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "likes_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts_with_profiles_secure"
            referencedColumns: ["id"]
          },
        ]
      }
      message_attachments: {
        Row: {
          created_at: string | null
          duration: number | null
          file_size: number | null
          file_url: string
          height: number | null
          id: string
          message_id: string
          mime_type: string
          width: number | null
        }
        Insert: {
          created_at?: string | null
          duration?: number | null
          file_size?: number | null
          file_url: string
          height?: number | null
          id?: string
          message_id: string
          mime_type: string
          width?: number | null
        }
        Update: {
          created_at?: string | null
          duration?: number | null
          file_size?: number | null
          file_url?: string
          height?: number | null
          id?: string
          message_id?: string
          mime_type?: string
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "message_attachments_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_attachments_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages_with_details"
            referencedColumns: ["id"]
          },
        ]
      }
      message_reactions: {
        Row: {
          created_at: string | null
          emoji: string
          id: string
          message_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          emoji: string
          id?: string
          message_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
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
          {
            foreignKeyName: "message_reactions_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages_with_details"
            referencedColumns: ["id"]
          },
        ]
      }
      message_receipts: {
        Row: {
          message_id: string
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          message_id: string
          status: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          message_id?: string
          status?: string
          updated_at?: string | null
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
          {
            foreignKeyName: "message_receipts_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages_with_details"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          body: string | null
          client_id: string | null
          conversation_id: string
          created_at: string | null
          deleted: boolean | null
          deleted_for_everyone: boolean | null
          delivered_at: string | null
          edited: boolean | null
          edited_at: string | null
          id: string
          kind: string
          link_preview: Json | null
          media_url: string | null
          message_type: string | null
          meta: Json | null
          pending: boolean | null
          replied_to_message_id: string | null
          reply_to: string | null
          seen_at: string | null
          sender_id: string
        }
        Insert: {
          body?: string | null
          client_id?: string | null
          conversation_id: string
          created_at?: string | null
          deleted?: boolean | null
          deleted_for_everyone?: boolean | null
          delivered_at?: string | null
          edited?: boolean | null
          edited_at?: string | null
          id?: string
          kind: string
          link_preview?: Json | null
          media_url?: string | null
          message_type?: string | null
          meta?: Json | null
          pending?: boolean | null
          replied_to_message_id?: string | null
          reply_to?: string | null
          seen_at?: string | null
          sender_id: string
        }
        Update: {
          body?: string | null
          client_id?: string | null
          conversation_id?: string
          created_at?: string | null
          deleted?: boolean | null
          deleted_for_everyone?: boolean | null
          delivered_at?: string | null
          edited?: boolean | null
          edited_at?: string | null
          id?: string
          kind?: string
          link_preview?: Json | null
          media_url?: string | null
          message_type?: string | null
          meta?: Json | null
          pending?: boolean | null
          replied_to_message_id?: string | null
          reply_to?: string | null
          seen_at?: string | null
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
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations_secure"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_replied_to_message_id_fkey"
            columns: ["replied_to_message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_replied_to_message_id_fkey"
            columns: ["replied_to_message_id"]
            isOneToOne: false
            referencedRelation: "messages_with_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_reply_to_fkey"
            columns: ["reply_to"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_reply_to_fkey"
            columns: ["reply_to"]
            isOneToOne: false
            referencedRelation: "messages_with_details"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          actor_id: string | null
          created_at: string | null
          id: string
          link: string | null
          message: string
          opportunity_id: string | null
          post_id: string | null
          read: boolean | null
          title: string
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          actor_id?: string | null
          created_at?: string | null
          id?: string
          link?: string | null
          message: string
          opportunity_id?: string | null
          post_id?: string | null
          read?: boolean | null
          title: string
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          actor_id?: string | null
          created_at?: string | null
          id?: string
          link?: string | null
          message?: string
          opportunity_id?: string | null
          post_id?: string | null
          read?: boolean | null
          title?: string
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts_with_profiles_secure"
            referencedColumns: ["id"]
          },
        ]
      }
      opportunities: {
        Row: {
          applications_count: number | null
          art_forms: string[] | null
          city: string | null
          company: string | null
          created_at: string | null
          deadline: string | null
          description: string
          experience_level: string | null
          gender_preference: string[] | null
          id: string
          image_url: string | null
          language_preference: string[] | null
          location: string | null
          organization_name: string | null
          salary_max: number | null
          salary_min: number | null
          state: string | null
          status: string | null
          tags: string[] | null
          title: string
          type: string
          updated_at: string | null
          user_id: string
          views_count: number | null
        }
        Insert: {
          applications_count?: number | null
          art_forms?: string[] | null
          city?: string | null
          company?: string | null
          created_at?: string | null
          deadline?: string | null
          description: string
          experience_level?: string | null
          gender_preference?: string[] | null
          id?: string
          image_url?: string | null
          language_preference?: string[] | null
          location?: string | null
          organization_name?: string | null
          salary_max?: number | null
          salary_min?: number | null
          state?: string | null
          status?: string | null
          tags?: string[] | null
          title: string
          type: string
          updated_at?: string | null
          user_id: string
          views_count?: number | null
        }
        Update: {
          applications_count?: number | null
          art_forms?: string[] | null
          city?: string | null
          company?: string | null
          created_at?: string | null
          deadline?: string | null
          description?: string
          experience_level?: string | null
          gender_preference?: string[] | null
          id?: string
          image_url?: string | null
          language_preference?: string[] | null
          location?: string | null
          organization_name?: string | null
          salary_max?: number | null
          salary_min?: number | null
          state?: string | null
          status?: string | null
          tags?: string[] | null
          title?: string
          type?: string
          updated_at?: string | null
          user_id?: string
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_opportunities_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      opportunity_applications: {
        Row: {
          accepted_at: string | null
          accepted_by_org_id: string | null
          cover_letter: string | null
          created_at: string | null
          id: string
          opportunity_id: string
          rejected_at: string | null
          rejected_by_org_id: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          accepted_at?: string | null
          accepted_by_org_id?: string | null
          cover_letter?: string | null
          created_at?: string | null
          id?: string
          opportunity_id: string
          rejected_at?: string | null
          rejected_by_org_id?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          accepted_at?: string | null
          accepted_by_org_id?: string | null
          cover_letter?: string | null
          created_at?: string | null
          id?: string
          opportunity_id?: string
          rejected_at?: string | null
          rejected_by_org_id?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_opportunity_applications_opportunity_id"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_opportunity_applications_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "opportunity_applications_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      opportunity_views: {
        Row: {
          id: string
          opportunity_id: string
          viewed_at: string
          viewer_id: string
        }
        Insert: {
          id?: string
          opportunity_id: string
          viewed_at?: string
          viewer_id: string
        }
        Update: {
          id?: string
          opportunity_id?: string
          viewed_at?: string
          viewer_id?: string
        }
        Relationships: []
      }
      portfolios: {
        Row: {
          created_at: string
          description: string | null
          featured: boolean | null
          id: string
          likes_count: number | null
          media_meta: Json | null
          media_types: string[]
          media_urls: string[]
          tags: string[] | null
          title: string
          updated_at: string
          user_id: string
          views_count: number | null
          visibility: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          featured?: boolean | null
          id?: string
          likes_count?: number | null
          media_meta?: Json | null
          media_types?: string[]
          media_urls?: string[]
          tags?: string[] | null
          title: string
          updated_at?: string
          user_id: string
          views_count?: number | null
          visibility?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          featured?: boolean | null
          id?: string
          likes_count?: number | null
          media_meta?: Json | null
          media_types?: string[]
          media_urls?: string[]
          tags?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string
          views_count?: number | null
          visibility?: string | null
        }
        Relationships: []
      }
      posts: {
        Row: {
          comments_count: number | null
          content: string
          created_at: string | null
          id: string
          likes_count: number | null
          media_type: string | null
          media_types: string[] | null
          media_urls: string[] | null
          shares_count: number | null
          tags: string[] | null
          title: string | null
          updated_at: string | null
          user_id: string
          visibility: string | null
        }
        Insert: {
          comments_count?: number | null
          content: string
          created_at?: string | null
          id?: string
          likes_count?: number | null
          media_type?: string | null
          media_types?: string[] | null
          media_urls?: string[] | null
          shares_count?: number | null
          tags?: string[] | null
          title?: string | null
          updated_at?: string | null
          user_id: string
          visibility?: string | null
        }
        Update: {
          comments_count?: number | null
          content?: string
          created_at?: string | null
          id?: string
          likes_count?: number | null
          media_type?: string | null
          media_types?: string[] | null
          media_urls?: string[] | null
          shares_count?: number | null
          tags?: string[] | null
          title?: string | null
          updated_at?: string | null
          user_id?: string
          visibility?: string | null
        }
        Relationships: []
      }
      posts_backup_phase1: {
        Row: {
          comments_count: number | null
          content: string | null
          created_at: string | null
          id: string | null
          likes_count: number | null
          media_type: string | null
          media_types: string[] | null
          media_urls: string[] | null
          shares_count: number | null
          tags: string[] | null
          title: string | null
          updated_at: string | null
          user_id: string | null
          visibility: string | null
        }
        Insert: {
          comments_count?: number | null
          content?: string | null
          created_at?: string | null
          id?: string | null
          likes_count?: number | null
          media_type?: string | null
          media_types?: string[] | null
          media_urls?: string[] | null
          shares_count?: number | null
          tags?: string[] | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
          visibility?: string | null
        }
        Update: {
          comments_count?: number | null
          content?: string | null
          created_at?: string | null
          id?: string | null
          likes_count?: number | null
          media_type?: string | null
          media_types?: string[] | null
          media_urls?: string[] | null
          shares_count?: number | null
          tags?: string[] | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
          visibility?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          artform: Database["public"]["Enums"]["artform_type"] | null
          avatar_url: string | null
          bio: string | null
          cover_url: string | null
          created_at: string | null
          display_name: string
          follower_count: number | null
          following_count: number | null
          full_name: string | null
          headline: string | null
          id: string
          location: string | null
          organization_type:
            | Database["public"]["Enums"]["organization_type"]
            | null
          phone_number: string | null
          posts_count: number | null
          privacy: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          social_links: Json | null
          updated_at: string | null
          user_id: string
          username: string
          website: string | null
        }
        Insert: {
          artform?: Database["public"]["Enums"]["artform_type"] | null
          avatar_url?: string | null
          bio?: string | null
          cover_url?: string | null
          created_at?: string | null
          display_name: string
          follower_count?: number | null
          following_count?: number | null
          full_name?: string | null
          headline?: string | null
          id?: string
          location?: string | null
          organization_type?:
            | Database["public"]["Enums"]["organization_type"]
            | null
          phone_number?: string | null
          posts_count?: number | null
          privacy?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          social_links?: Json | null
          updated_at?: string | null
          user_id: string
          username: string
          website?: string | null
        }
        Update: {
          artform?: Database["public"]["Enums"]["artform_type"] | null
          avatar_url?: string | null
          bio?: string | null
          cover_url?: string | null
          created_at?: string | null
          display_name?: string
          follower_count?: number | null
          following_count?: number | null
          full_name?: string | null
          headline?: string | null
          id?: string
          location?: string | null
          organization_type?:
            | Database["public"]["Enums"]["organization_type"]
            | null
          phone_number?: string | null
          posts_count?: number | null
          privacy?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          social_links?: Json | null
          updated_at?: string | null
          user_id?: string
          username?: string
          website?: string | null
        }
        Relationships: []
      }
      shares: {
        Row: {
          created_at: string | null
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shares_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shares_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts_with_profiles_secure"
            referencedColumns: ["id"]
          },
        ]
      }
      starred_messages: {
        Row: {
          created_at: string | null
          message_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          message_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          message_id?: string
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
          {
            foreignKeyName: "starred_messages_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages_with_details"
            referencedColumns: ["id"]
          },
        ]
      }
      user_blocks: {
        Row: {
          blocked_id: string
          blocker_id: string
          created_at: string | null
        }
        Insert: {
          blocked_id: string
          blocker_id: string
          created_at?: string | null
        }
        Update: {
          blocked_id?: string
          blocker_id?: string
          created_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      conversations_secure: {
        Row: {
          created_at: string | null
          id: string | null
          last_message_body: string | null
          last_message_created_at: string | null
          last_message_deleted: boolean | null
          last_message_id: string | null
          last_message_kind: string | null
          last_message_sender_id: string | null
          participant_a: string | null
          participant_a_avatar: string | null
          participant_a_name: string | null
          participant_a_username: string | null
          participant_b: string | null
          participant_b_avatar: string | null
          participant_b_name: string | null
          participant_b_username: string | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_last_message_id_fkey"
            columns: ["last_message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_last_message_id_fkey"
            columns: ["last_message_id"]
            isOneToOne: false
            referencedRelation: "messages_with_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_conversations_last_message"
            columns: ["last_message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_conversations_last_message"
            columns: ["last_message_id"]
            isOneToOne: false
            referencedRelation: "messages_with_details"
            referencedColumns: ["id"]
          },
        ]
      }
      messages_with_details: {
        Row: {
          body: string | null
          client_id: string | null
          conversation_id: string | null
          created_at: string | null
          deleted: boolean | null
          deleted_for_everyone: boolean | null
          delivered_at: string | null
          edited: boolean | null
          edited_at: string | null
          id: string | null
          kind: string | null
          link_preview: Json | null
          media_url: string | null
          message_type: string | null
          meta: Json | null
          pending: boolean | null
          reactions: Json | null
          replied_to_message_id: string | null
          reply_to: string | null
          seen_at: string | null
          sender_avatar_url: string | null
          sender_display_name: string | null
          sender_id: string | null
          sender_username: string | null
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
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations_secure"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_replied_to_message_id_fkey"
            columns: ["replied_to_message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_replied_to_message_id_fkey"
            columns: ["replied_to_message_id"]
            isOneToOne: false
            referencedRelation: "messages_with_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_reply_to_fkey"
            columns: ["reply_to"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_reply_to_fkey"
            columns: ["reply_to"]
            isOneToOne: false
            referencedRelation: "messages_with_details"
            referencedColumns: ["id"]
          },
        ]
      }
      posts_with_profiles_secure: {
        Row: {
          comments_count: number | null
          content: string | null
          created_at: string | null
          id: string | null
          likes_count: number | null
          media_types: string[] | null
          media_urls: string[] | null
          profile_artform: Database["public"]["Enums"]["artform_type"] | null
          profile_avatar_url: string | null
          profile_bio: string | null
          profile_display_name: string | null
          profile_location: string | null
          profile_organization_type:
            | Database["public"]["Enums"]["organization_type"]
            | null
          profile_role: Database["public"]["Enums"]["user_role"] | null
          profile_username: string | null
          shares_count: number | null
          tags: string[] | null
          title: string | null
          updated_at: string | null
          user_id: string | null
          visibility: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      create_message_with_client_id: {
        Args: {
          body_param?: string
          client_id_param: string
          conversation_id_param: string
          kind_param?: string
          sender_id_param: string
        }
        Returns: {
          client_id: string
          created_at: string
          id: string
          server_timestamp: string
        }[]
      }
      create_or_get_conversation: {
        Args: { user_a: string; user_b: string }
        Returns: {
          conversation_id: string
          existing: boolean
        }[]
      }
      delete_message_for_everyone: {
        Args: { message_id_param: string }
        Returns: boolean
      }
      get_conversation_messages: {
        Args: { conversation_id_param: string }
        Returns: {
          body: string
          client_id: string
          conversation_id: string
          created_at: string
          deleted: boolean
          deleted_for_everyone: boolean
          delivered_at: string
          edited: boolean
          edited_at: string
          id: string
          kind: string
          link_preview: Json
          media_url: string
          message_type: string
          meta: Json
          pending: boolean
          reactions: Json
          replied_to_message_id: string
          reply_to: string
          seen_at: string
          sender_avatar_url: string
          sender_display_name: string
          sender_id: string
          sender_username: string
        }[]
      }
      get_current_user_profile_secure: {
        Args: Record<PropertyKey, never>
        Returns: {
          artform: Database["public"]["Enums"]["artform_type"]
          avatar_url: string
          bio: string
          contact_email: string
          cover_url: string
          created_at: string
          display_name: string
          follower_count: number
          following_count: number
          full_name: string
          headline: string
          id: string
          location: string
          organization_type: Database["public"]["Enums"]["organization_type"]
          phone_number: string
          posts_count: number
          privacy: string
          pronouns: string
          role: Database["public"]["Enums"]["user_role"]
          social_links: Json
          updated_at: string
          user_id: string
          username: string
          website: string
        }[]
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["user_role"]
      }
      get_or_create_conversation: {
        Args: { user1_id: string; user2_id: string }
        Returns: string
      }
      get_profile_by_username: {
        Args: { username_param: string }
        Returns: {
          artform: Database["public"]["Enums"]["artform_type"]
          avatar_url: string
          bio: string
          cover_url: string
          created_at: string
          display_name: string
          follower_count: number
          following_count: number
          full_name: string
          headline: string
          id: string
          location: string
          organization_type: Database["public"]["Enums"]["organization_type"]
          posts_count: number
          privacy: string
          role: Database["public"]["Enums"]["user_role"]
          social_links: Json
          updated_at: string
          user_id: string
          username: string
          website: string
        }[]
      }
      get_profile_public_info: {
        Args: { profile_user_id: string }
        Returns: {
          artform: Database["public"]["Enums"]["artform_type"]
          avatar_url: string
          bio: string
          display_name: string
          full_name: string
          id: string
          location: string
          phone_number: string
          privacy: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
          username: string
        }[]
      }
      get_user_conversations_secure: {
        Args: { user_id_param: string }
        Returns: {
          created_at: string
          id: string
          last_message_id: string
          participant_a: string
          participant_b: string
          updated_at: string
        }[]
      }
      get_user_profile: {
        Args: { user_uuid?: string }
        Returns: {
          artform: Database["public"]["Enums"]["artform_type"]
          avatar_url: string
          bio: string
          display_name: string
          full_name: string
          id: string
          location: string
          organization_type: Database["public"]["Enums"]["organization_type"]
          privacy: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
          username: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      mark_conversation_messages_read: {
        Args: {
          conversation_id_param: string
          up_to_message_id: string
          user_id_param: string
        }
        Returns: number
      }
      mark_message_seen_debounced: {
        Args: { message_id_param: string }
        Returns: boolean
      }
      track_opportunity_view: {
        Args: { opportunity_id_param: string; viewer_id_param: string }
        Returns: boolean
      }
      user_has_role: {
        Args: {
          check_role: Database["public"]["Enums"]["user_role"]
          user_uuid: string
        }
        Returns: boolean
      }
      user_is_following: {
        Args: { target_user_id: string }
        Returns: boolean
      }
      username_available: {
        Args: { candidate: string }
        Returns: Json
      }
    }
    Enums: {
      app_role: "artist" | "organization"
      artform_type:
        | "actor"
        | "dancer"
        | "model"
        | "photographer"
        | "videographer"
        | "instrumentalist"
        | "singer"
        | "drawing"
        | "painting"
      organization_type:
        | "director"
        | "producer"
        | "production_house"
        | "casting_agency"
        | "casting_director"
        | "event_management"
        | "individual_hirer"
        | "institution"
        | "others"
      user_role: "artist" | "organization"
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
      app_role: ["artist", "organization"],
      artform_type: [
        "actor",
        "dancer",
        "model",
        "photographer",
        "videographer",
        "instrumentalist",
        "singer",
        "drawing",
        "painting",
      ],
      organization_type: [
        "director",
        "producer",
        "production_house",
        "casting_agency",
        "casting_director",
        "event_management",
        "individual_hirer",
        "institution",
        "others",
      ],
      user_role: ["artist", "organization"],
    },
  },
} as const
