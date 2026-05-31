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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      article_revisions: {
        Row: {
          article_id: string
          body: string
          created_at: string
          editor_id: string | null
          editor_name: string | null
          excerpt: string
          id: string
          title: string
        }
        Insert: {
          article_id: string
          body?: string
          created_at?: string
          editor_id?: string | null
          editor_name?: string | null
          excerpt?: string
          id?: string
          title: string
        }
        Update: {
          article_id?: string
          body?: string
          created_at?: string
          editor_id?: string | null
          editor_name?: string | null
          excerpt?: string
          id?: string
          title?: string
        }
        Relationships: []
      }
      articles: {
        Row: {
          ai_analysis: Json | null
          author_id: string | null
          author_name: string
          body: string
          category: string
          confidence: Database["public"]["Enums"]["confidence_level"]
          cover_image: string | null
          created_at: string
          excerpt: string
          id: string
          published_at: string | null
          read_minutes: number
          scheduled_at: string | null
          slug: string
          sources: Json
          status: Database["public"]["Enums"]["article_status"]
          tags: string[]
          title: string
          trust_score: number
          updated_at: string
          verification: Database["public"]["Enums"]["verification_status"]
        }
        Insert: {
          ai_analysis?: Json | null
          author_id?: string | null
          author_name?: string
          body?: string
          category?: string
          confidence?: Database["public"]["Enums"]["confidence_level"]
          cover_image?: string | null
          created_at?: string
          excerpt?: string
          id?: string
          published_at?: string | null
          read_minutes?: number
          scheduled_at?: string | null
          slug: string
          sources?: Json
          status?: Database["public"]["Enums"]["article_status"]
          tags?: string[]
          title: string
          trust_score?: number
          updated_at?: string
          verification?: Database["public"]["Enums"]["verification_status"]
        }
        Update: {
          ai_analysis?: Json | null
          author_id?: string | null
          author_name?: string
          body?: string
          category?: string
          confidence?: Database["public"]["Enums"]["confidence_level"]
          cover_image?: string | null
          created_at?: string
          excerpt?: string
          id?: string
          published_at?: string | null
          read_minutes?: number
          scheduled_at?: string | null
          slug?: string
          sources?: Json
          status?: Database["public"]["Enums"]["article_status"]
          tags?: string[]
          title?: string
          trust_score?: number
          updated_at?: string
          verification?: Database["public"]["Enums"]["verification_status"]
        }
        Relationships: []
      }
      comments: {
        Row: {
          article_id: string
          body: string
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          article_id: string
          body: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          article_id?: string
          body?: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
        ]
      }
      community_reports: {
        Row: {
          contact: string | null
          created_at: string
          details: string
          evidence: Json
          id: string
          kind: string
          reporter_id: string | null
          severity: string
          status: string
          subject: string
        }
        Insert: {
          contact?: string | null
          created_at?: string
          details: string
          evidence?: Json
          id?: string
          kind?: string
          reporter_id?: string | null
          severity?: string
          status?: string
          subject: string
        }
        Update: {
          contact?: string | null
          created_at?: string
          details?: string
          evidence?: Json
          id?: string
          kind?: string
          reporter_id?: string | null
          severity?: string
          status?: string
          subject?: string
        }
        Relationships: []
      }
      contributor_profiles: {
        Row: {
          accepted_count: number
          bio: string | null
          created_at: string
          email_verified: boolean
          face_verified: boolean
          id: string
          id_document_path: string | null
          id_verified: boolean
          location: string | null
          onboarding_complete: boolean
          payout_method: Json
          phone: string | null
          phone_verified: boolean
          referral_code: string | null
          referred_by: string | null
          rejected_count: number
          selfie_path: string | null
          specialty: Database["public"]["Enums"]["contributor_specialty"]
          tier: Database["public"]["Enums"]["contributor_tier"]
          trust_score: number
          updated_at: string
          user_id: string
          wallet_balance_kobo: number
        }
        Insert: {
          accepted_count?: number
          bio?: string | null
          created_at?: string
          email_verified?: boolean
          face_verified?: boolean
          id?: string
          id_document_path?: string | null
          id_verified?: boolean
          location?: string | null
          onboarding_complete?: boolean
          payout_method?: Json
          phone?: string | null
          phone_verified?: boolean
          referral_code?: string | null
          referred_by?: string | null
          rejected_count?: number
          selfie_path?: string | null
          specialty?: Database["public"]["Enums"]["contributor_specialty"]
          tier?: Database["public"]["Enums"]["contributor_tier"]
          trust_score?: number
          updated_at?: string
          user_id: string
          wallet_balance_kobo?: number
        }
        Update: {
          accepted_count?: number
          bio?: string | null
          created_at?: string
          email_verified?: boolean
          face_verified?: boolean
          id?: string
          id_document_path?: string | null
          id_verified?: boolean
          location?: string | null
          onboarding_complete?: boolean
          payout_method?: Json
          phone?: string | null
          phone_verified?: boolean
          referral_code?: string | null
          referred_by?: string | null
          rejected_count?: number
          selfie_path?: string | null
          specialty?: Database["public"]["Enums"]["contributor_specialty"]
          tier?: Database["public"]["Enums"]["contributor_tier"]
          trust_score?: number
          updated_at?: string
          user_id?: string
          wallet_balance_kobo?: number
        }
        Relationships: []
      }
      contributor_submissions: {
        Row: {
          ai_analysis: Json | null
          body: string
          category: string
          contributor_id: string
          cover_image: string | null
          created_at: string
          duplicate_of: string | null
          editor_feedback: string | null
          evidence: Json
          excerpt: string
          geo: Json | null
          id: string
          plagiarism_score: number | null
          published_article_id: string | null
          reviewed_at: string | null
          reviewer_id: string | null
          seo_description: string | null
          seo_title: string | null
          sources: Json
          status: Database["public"]["Enums"]["submission_status"]
          submitted_at: string | null
          tags: string[]
          title: string
          updated_at: string
        }
        Insert: {
          ai_analysis?: Json | null
          body?: string
          category?: string
          contributor_id: string
          cover_image?: string | null
          created_at?: string
          duplicate_of?: string | null
          editor_feedback?: string | null
          evidence?: Json
          excerpt?: string
          geo?: Json | null
          id?: string
          plagiarism_score?: number | null
          published_article_id?: string | null
          reviewed_at?: string | null
          reviewer_id?: string | null
          seo_description?: string | null
          seo_title?: string | null
          sources?: Json
          status?: Database["public"]["Enums"]["submission_status"]
          submitted_at?: string | null
          tags?: string[]
          title: string
          updated_at?: string
        }
        Update: {
          ai_analysis?: Json | null
          body?: string
          category?: string
          contributor_id?: string
          cover_image?: string | null
          created_at?: string
          duplicate_of?: string | null
          editor_feedback?: string | null
          evidence?: Json
          excerpt?: string
          geo?: Json | null
          id?: string
          plagiarism_score?: number | null
          published_article_id?: string | null
          reviewed_at?: string | null
          reviewer_id?: string | null
          seo_description?: string | null
          seo_title?: string | null
          sources?: Json
          status?: Database["public"]["Enums"]["submission_status"]
          submitted_at?: string | null
          tags?: string[]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      corrections: {
        Row: {
          article_id: string
          created_at: string
          editor_id: string | null
          editor_name: string | null
          id: string
          note: string
        }
        Insert: {
          article_id: string
          created_at?: string
          editor_id?: string | null
          editor_name?: string | null
          id?: string
          note: string
        }
        Update: {
          article_id?: string
          created_at?: string
          editor_id?: string | null
          editor_name?: string | null
          id?: string
          note?: string
        }
        Relationships: [
          {
            foreignKeyName: "corrections_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
        ]
      }
      monthly_awards: {
        Row: {
          award: string
          contributor_id: string
          created_at: string
          id: string
          metric_value: number | null
          month: string
          note: string | null
        }
        Insert: {
          award: string
          contributor_id: string
          created_at?: string
          id?: string
          metric_value?: number | null
          month: string
          note?: string | null
        }
        Update: {
          award?: string
          contributor_id?: string
          created_at?: string
          id?: string
          metric_value?: number | null
          month?: string
          note?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          kind: string
          link: string | null
          read: boolean
          title: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          kind: string
          link?: string | null
          read?: boolean
          title: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          kind?: string
          link?: string | null
          read?: boolean
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      payout_accounts: {
        Row: {
          account_number_masked: string | null
          bank_name: string | null
          contributor_id: string
          created_at: string
          currency: string
          details: Json
          display_name: string
          id: string
          is_default: boolean
          provider: Database["public"]["Enums"]["payout_provider"]
          verified: boolean
        }
        Insert: {
          account_number_masked?: string | null
          bank_name?: string | null
          contributor_id: string
          created_at?: string
          currency?: string
          details?: Json
          display_name: string
          id?: string
          is_default?: boolean
          provider: Database["public"]["Enums"]["payout_provider"]
          verified?: boolean
        }
        Update: {
          account_number_masked?: string | null
          bank_name?: string | null
          contributor_id?: string
          created_at?: string
          currency?: string
          details?: Json
          display_name?: string
          id?: string
          is_default?: boolean
          provider?: Database["public"]["Enums"]["payout_provider"]
          verified?: boolean
        }
        Relationships: []
      }
      payout_rate_cards: {
        Row: {
          active: boolean
          amount_kobo: number
          description: string | null
          id: string
          kind: Database["public"]["Enums"]["submission_rate_kind"]
          label: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          active?: boolean
          amount_kobo?: number
          description?: string | null
          id?: string
          kind: Database["public"]["Enums"]["submission_rate_kind"]
          label: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          active?: boolean
          amount_kobo?: number
          description?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["submission_rate_kind"]
          label?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      reactions: {
        Row: {
          article_id: string
          created_at: string
          id: string
          type: Database["public"]["Enums"]["reaction_type"]
          user_id: string
        }
        Insert: {
          article_id: string
          created_at?: string
          id?: string
          type: Database["public"]["Enums"]["reaction_type"]
          user_id: string
        }
        Update: {
          article_id?: string
          created_at?: string
          id?: string
          type?: Database["public"]["Enums"]["reaction_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reactions_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
        ]
      }
      reading_history: {
        Row: {
          article_id: string
          id: string
          read_at: string
          user_id: string
        }
        Insert: {
          article_id: string
          id?: string
          read_at?: string
          user_id: string
        }
        Update: {
          article_id?: string
          id?: string
          read_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reading_history_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          created_at: string
          id: string
          referred_kind: string
          referred_user_id: string
          referrer_id: string
          reward_kobo: number
          rewarded: boolean
        }
        Insert: {
          created_at?: string
          id?: string
          referred_kind: string
          referred_user_id: string
          referrer_id: string
          reward_kobo?: number
          rewarded?: boolean
        }
        Update: {
          created_at?: string
          id?: string
          referred_kind?: string
          referred_user_id?: string
          referrer_id?: string
          reward_kobo?: number
          rewarded?: boolean
        }
        Relationships: []
      }
      revenue_events: {
        Row: {
          amount_kobo: number
          article_id: string
          contributor_id: string
          created_at: string
          id: string
          occurred_on: string
          source: string
          units: number
        }
        Insert: {
          amount_kobo?: number
          article_id: string
          contributor_id: string
          created_at?: string
          id?: string
          occurred_on?: string
          source: string
          units?: number
        }
        Update: {
          amount_kobo?: number
          article_id?: string
          contributor_id?: string
          created_at?: string
          id?: string
          occurred_on?: string
          source?: string
          units?: number
        }
        Relationships: []
      }
      saved_articles: {
        Row: {
          article_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          article_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          article_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_articles_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
        ]
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
          role: Database["public"]["Enums"]["app_role"]
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
      wallet_ledger: {
        Row: {
          amount_kobo: number
          contributor_id: string
          created_at: string
          created_by: string | null
          id: string
          kind: Database["public"]["Enums"]["wallet_entry_kind"]
          note: string | null
          submission_id: string | null
        }
        Insert: {
          amount_kobo: number
          contributor_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          kind: Database["public"]["Enums"]["wallet_entry_kind"]
          note?: string | null
          submission_id?: string | null
        }
        Update: {
          amount_kobo?: number
          contributor_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["wallet_entry_kind"]
          note?: string | null
          submission_id?: string | null
        }
        Relationships: []
      }
      withdrawal_requests: {
        Row: {
          amount_kobo: number
          contributor_id: string
          fee_kobo: number
          fraud_flags: Json
          fraud_score: number
          gateway_reference: string | null
          id: string
          paid_at: string | null
          payout_account_id: string
          requested_at: string
          reviewed_at: string | null
          reviewer_id: string | null
          reviewer_note: string | null
          status: Database["public"]["Enums"]["withdrawal_status"]
          tax_kobo: number
        }
        Insert: {
          amount_kobo: number
          contributor_id: string
          fee_kobo?: number
          fraud_flags?: Json
          fraud_score?: number
          gateway_reference?: string | null
          id?: string
          paid_at?: string | null
          payout_account_id: string
          requested_at?: string
          reviewed_at?: string | null
          reviewer_id?: string | null
          reviewer_note?: string | null
          status?: Database["public"]["Enums"]["withdrawal_status"]
          tax_kobo?: number
        }
        Update: {
          amount_kobo?: number
          contributor_id?: string
          fee_kobo?: number
          fraud_flags?: Json
          fraud_score?: number
          gateway_reference?: string | null
          id?: string
          paid_at?: string | null
          payout_account_id?: string
          requested_at?: string
          reviewed_at?: string | null
          reviewer_id?: string | null
          reviewer_note?: string | null
          status?: Database["public"]["Enums"]["withdrawal_status"]
          tax_kobo?: number
        }
        Relationships: []
      }
    }
    Views: {
      contributor_leaderboard: {
        Row: {
          accepted_count: number | null
          avatar_url: string | null
          contributor_id: string | null
          display_name: string | null
          lifetime_earned_kobo: number | null
          tier: Database["public"]["Enums"]["contributor_tier"] | null
          trust_score: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "admin"
        | "editor"
        | "super_admin"
        | "journalist"
        | "fact_checker"
        | "moderator"
        | "contributor_manager"
        | "contributor"
      article_status: "draft" | "scheduled" | "published"
      confidence_level: "High" | "Medium" | "Preliminary"
      contributor_specialty:
        | "citizen_reporter"
        | "freelance_journalist"
        | "verified_correspondent"
        | "investigative_reporter"
        | "photojournalist"
        | "videographer"
      contributor_tier: "beginner" | "trusted" | "verified" | "elite"
      payout_provider:
        | "paystack"
        | "flutterwave"
        | "opay"
        | "palmpay"
        | "bank_transfer"
        | "stripe"
        | "wise"
        | "paypal"
      reaction_type: "like" | "insightful" | "disagree"
      submission_rate_kind:
        | "standard"
        | "breaking"
        | "exclusive"
        | "photo"
        | "video"
        | "opinion"
      submission_status:
        | "draft"
        | "pending"
        | "ai_review"
        | "editor_review"
        | "approved"
        | "rejected"
        | "published"
      verification_status:
        | "Verified"
        | "Under Review"
        | "Developing"
        | "Fact-Checked"
        | "Opinion"
        | "Sponsored"
      wallet_entry_kind:
        | "earning"
        | "payout"
        | "bonus"
        | "adjustment"
        | "referral_bonus"
        | "revenue_share"
        | "tax_withhold"
        | "payout_pending"
        | "payout_failed"
      withdrawal_status:
        | "pending"
        | "approved"
        | "processing"
        | "paid"
        | "rejected"
        | "failed"
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
      app_role: [
        "admin",
        "editor",
        "super_admin",
        "journalist",
        "fact_checker",
        "moderator",
        "contributor_manager",
        "contributor",
      ],
      article_status: ["draft", "scheduled", "published"],
      confidence_level: ["High", "Medium", "Preliminary"],
      contributor_specialty: [
        "citizen_reporter",
        "freelance_journalist",
        "verified_correspondent",
        "investigative_reporter",
        "photojournalist",
        "videographer",
      ],
      contributor_tier: ["beginner", "trusted", "verified", "elite"],
      payout_provider: [
        "paystack",
        "flutterwave",
        "opay",
        "palmpay",
        "bank_transfer",
        "stripe",
        "wise",
        "paypal",
      ],
      reaction_type: ["like", "insightful", "disagree"],
      submission_rate_kind: [
        "standard",
        "breaking",
        "exclusive",
        "photo",
        "video",
        "opinion",
      ],
      submission_status: [
        "draft",
        "pending",
        "ai_review",
        "editor_review",
        "approved",
        "rejected",
        "published",
      ],
      verification_status: [
        "Verified",
        "Under Review",
        "Developing",
        "Fact-Checked",
        "Opinion",
        "Sponsored",
      ],
      wallet_entry_kind: [
        "earning",
        "payout",
        "bonus",
        "adjustment",
        "referral_bonus",
        "revenue_share",
        "tax_withhold",
        "payout_pending",
        "payout_failed",
      ],
      withdrawal_status: [
        "pending",
        "approved",
        "processing",
        "paid",
        "rejected",
        "failed",
      ],
    },
  },
} as const
