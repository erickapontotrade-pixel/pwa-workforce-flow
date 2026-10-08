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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      applications: {
        Row: {
          approved_at: string | null
          created_at: string
          first_contact_at: string | null
          hired_at: string | null
          id: string
          interview_at: string | null
          job_id: string
          notes: string | null
          professional_id: string
          stage: Database["public"]["Enums"]["application_stage"]
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          created_at?: string
          first_contact_at?: string | null
          hired_at?: string | null
          id?: string
          interview_at?: string | null
          job_id: string
          notes?: string | null
          professional_id: string
          stage?: Database["public"]["Enums"]["application_stage"]
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          created_at?: string
          first_contact_at?: string | null
          hired_at?: string | null
          id?: string
          interview_at?: string | null
          job_id?: string
          notes?: string | null
          professional_id?: string
          stage?: Database["public"]["Enums"]["application_stage"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          changes: Json | null
          company_id: string | null
          created_at: string
          id: string
          record_id: string | null
          table_name: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          changes?: Json | null
          company_id?: string | null
          created_at?: string
          id?: string
          record_id?: string | null
          table_name: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          changes?: Json | null
          company_id?: string | null
          created_at?: string
          id?: string
          record_id?: string | null
          table_name?: string
        }
        Relationships: []
      }
      availability: {
        Row: {
          end_time: string
          id: string
          kind: string
          professional_id: string
          region: string | null
          start_time: string
          weekday: number
        }
        Insert: {
          end_time: string
          id?: string
          kind?: string
          professional_id: string
          region?: string | null
          start_time: string
          weekday: number
        }
        Update: {
          end_time?: string
          id?: string
          kind?: string
          professional_id?: string
          region?: string | null
          start_time?: string
          weekday?: number
        }
        Relationships: [
          {
            foreignKeyName: "availability_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          city: string | null
          cnpj: string | null
          created_at: string
          created_by: string
          id: string
          name: string
          segment: string | null
          settings: Json
        }
        Insert: {
          city?: string | null
          cnpj?: string | null
          created_at?: string
          created_by: string
          id?: string
          name: string
          segment?: string | null
          settings?: Json
        }
        Update: {
          city?: string | null
          cnpj?: string | null
          created_at?: string
          created_by?: string
          id?: string
          name?: string
          segment?: string | null
          settings?: Json
        }
        Relationships: []
      }
      company_users: {
        Row: {
          company_id: string
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_users_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      document_types: {
        Row: {
          id: string
          name: string
          requires_expiry: boolean
        }
        Insert: {
          id?: string
          name: string
          requires_expiry?: boolean
        }
        Update: {
          id?: string
          name?: string
          requires_expiry?: boolean
        }
        Relationships: []
      }
      documents: {
        Row: {
          created_at: string
          document_type_id: string | null
          expires_at: string | null
          file_path: string | null
          id: string
          name: string
          professional_id: string
          review_note: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["doc_status"]
        }
        Insert: {
          created_at?: string
          document_type_id?: string | null
          expires_at?: string | null
          file_path?: string | null
          id?: string
          name: string
          professional_id: string
          review_note?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["doc_status"]
        }
        Update: {
          created_at?: string
          document_type_id?: string | null
          expires_at?: string | null
          file_path?: string | null
          id?: string
          name?: string
          professional_id?: string
          review_note?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["doc_status"]
        }
        Relationships: [
          {
            foreignKeyName: "documents_document_type_id_fkey"
            columns: ["document_type_id"]
            isOneToOne: false
            referencedRelation: "document_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
        ]
      }
      freelance_applications: {
        Row: {
          created_at: string
          id: string
          match_score: number | null
          opportunity_id: string
          professional_id: string
          status: Database["public"]["Enums"]["freela_app_status"]
        }
        Insert: {
          created_at?: string
          id?: string
          match_score?: number | null
          opportunity_id: string
          professional_id: string
          status?: Database["public"]["Enums"]["freela_app_status"]
        }
        Update: {
          created_at?: string
          id?: string
          match_score?: number | null
          opportunity_id?: string
          professional_id?: string
          status?: Database["public"]["Enums"]["freela_app_status"]
        }
        Relationships: [
          {
            foreignKeyName: "freelance_applications_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "freelance_opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "freelance_applications_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
        ]
      }
      freelance_assignments: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          checkin_at: string | null
          checkin_lat: number | null
          checkin_lng: number | null
          checkout_at: string | null
          checkout_lat: number | null
          checkout_lng: number | null
          company_id: string
          created_at: string
          ends_at: string
          executed: boolean | null
          execution_result: string | null
          id: string
          opportunity_id: string
          professional_id: string
          report: string | null
          starts_at: string
          status: Database["public"]["Enums"]["assignment_status"]
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          checkin_at?: string | null
          checkin_lat?: number | null
          checkin_lng?: number | null
          checkout_at?: string | null
          checkout_lat?: number | null
          checkout_lng?: number | null
          company_id: string
          created_at?: string
          ends_at: string
          executed?: boolean | null
          execution_result?: string | null
          id?: string
          opportunity_id: string
          professional_id: string
          report?: string | null
          starts_at: string
          status?: Database["public"]["Enums"]["assignment_status"]
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          checkin_at?: string | null
          checkin_lat?: number | null
          checkin_lng?: number | null
          checkout_at?: string | null
          checkout_lat?: number | null
          checkout_lng?: number | null
          company_id?: string
          created_at?: string
          ends_at?: string
          executed?: boolean | null
          execution_result?: string | null
          id?: string
          opportunity_id?: string
          professional_id?: string
          report?: string | null
          starts_at?: string
          status?: Database["public"]["Enums"]["assignment_status"]
        }
        Relationships: [
          {
            foreignKeyName: "freelance_assignments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "freelance_assignments_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "freelance_opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "freelance_assignments_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
        ]
      }
      freelance_earnings: {
        Row: {
          activity_type: string | null
          amount: number
          assignment_id: string
          company_id: string
          created_at: string
          id: string
          professional_id: string
          reference_date: string
          status: string
        }
        Insert: {
          activity_type?: string | null
          amount: number
          assignment_id: string
          company_id: string
          created_at?: string
          id?: string
          professional_id: string
          reference_date: string
          status?: string
        }
        Update: {
          activity_type?: string | null
          amount?: number
          assignment_id?: string
          company_id?: string
          created_at?: string
          id?: string
          professional_id?: string
          reference_date?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "freelance_earnings_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: true
            referencedRelation: "freelance_assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "freelance_earnings_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "freelance_earnings_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
        ]
      }
      freelance_evidence: {
        Row: {
          assignment_id: string
          created_at: string
          created_by: string
          file_path: string
          id: string
          kind: string
          note: string | null
          sku: string | null
        }
        Insert: {
          assignment_id: string
          created_at?: string
          created_by: string
          file_path: string
          id?: string
          kind: string
          note?: string | null
          sku?: string | null
        }
        Update: {
          assignment_id?: string
          created_at?: string
          created_by?: string
          file_path?: string
          id?: string
          kind?: string
          note?: string | null
          sku?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "freelance_evidence_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "freelance_assignments"
            referencedColumns: ["id"]
          },
        ]
      }
      freelance_opportunities: {
        Row: {
          activity_type: string
          address: string | null
          city: string | null
          company_id: string
          created_at: string
          created_by: string
          description: string
          ends_at: string
          id: string
          location_name: string | null
          min_experience_months: number
          notes: string | null
          pay_amount: number
          pay_unit: Database["public"]["Enums"]["pay_unit"]
          radius_km: number
          required_skills: string[]
          requirements: string | null
          requires_uniform: boolean
          requires_vehicle: boolean
          slots: number
          starts_at: string
          status: Database["public"]["Enums"]["freela_status"]
          store_id: string | null
          title: string
        }
        Insert: {
          activity_type: string
          address?: string | null
          city?: string | null
          company_id: string
          created_at?: string
          created_by: string
          description?: string
          ends_at: string
          id?: string
          location_name?: string | null
          min_experience_months?: number
          notes?: string | null
          pay_amount: number
          pay_unit?: Database["public"]["Enums"]["pay_unit"]
          radius_km?: number
          required_skills?: string[]
          requirements?: string | null
          requires_uniform?: boolean
          requires_vehicle?: boolean
          slots?: number
          starts_at: string
          status?: Database["public"]["Enums"]["freela_status"]
          store_id?: string | null
          title: string
        }
        Update: {
          activity_type?: string
          address?: string | null
          city?: string | null
          company_id?: string
          created_at?: string
          created_by?: string
          description?: string
          ends_at?: string
          id?: string
          location_name?: string | null
          min_experience_months?: number
          notes?: string | null
          pay_amount?: number
          pay_unit?: Database["public"]["Enums"]["pay_unit"]
          radius_km?: number
          required_skills?: string[]
          requirements?: string | null
          requires_uniform?: boolean
          requires_vehicle?: boolean
          slots?: number
          starts_at?: string
          status?: Database["public"]["Enums"]["freela_status"]
          store_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "freelance_opportunities_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "freelance_opportunities_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      freelance_reviews: {
        Row: {
          assignment_id: string
          comment: string | null
          created_at: string
          cumprimento: number
          evidencias: number
          execucao: number
          id: string
          organizacao: number
          pontualidade: number
          postura: number
          professional_id: string
          qualidade: number
          reviewer_id: string
        }
        Insert: {
          assignment_id: string
          comment?: string | null
          created_at?: string
          cumprimento: number
          evidencias: number
          execucao: number
          id?: string
          organizacao: number
          pontualidade: number
          postura: number
          professional_id: string
          qualidade: number
          reviewer_id: string
        }
        Update: {
          assignment_id?: string
          comment?: string | null
          created_at?: string
          cumprimento?: number
          evidencias?: number
          execucao?: number
          id?: string
          organizacao?: number
          pontualidade?: number
          postura?: number
          professional_id?: string
          qualidade?: number
          reviewer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "freelance_reviews_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: true
            referencedRelation: "freelance_assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "freelance_reviews_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
        ]
      }
      interviews: {
        Row: {
          application_id: string
          created_at: string
          created_by: string | null
          id: string
          interviewer: string | null
          location: string | null
          notes: string | null
          result: string | null
          scheduled_at: string
          status: string
        }
        Insert: {
          application_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          interviewer?: string | null
          location?: string | null
          notes?: string | null
          result?: string | null
          scheduled_at: string
          status?: string
        }
        Update: {
          application_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          interviewer?: string | null
          location?: string | null
          notes?: string | null
          result?: string | null
          scheduled_at?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "interviews_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          benefits: string | null
          city: string | null
          company_id: string
          created_at: string
          created_by: string
          description: string
          id: string
          openings: number
          published_at: string | null
          requirements: string | null
          salary: number | null
          schedule: string | null
          start_date: string | null
          status: Database["public"]["Enums"]["job_status"]
          title: string
          workload: string | null
        }
        Insert: {
          benefits?: string | null
          city?: string | null
          company_id: string
          created_at?: string
          created_by: string
          description?: string
          id?: string
          openings?: number
          published_at?: string | null
          requirements?: string | null
          salary?: number | null
          schedule?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["job_status"]
          title: string
          workload?: string | null
        }
        Update: {
          benefits?: string | null
          city?: string | null
          company_id?: string
          created_at?: string
          created_by?: string
          description?: string
          id?: string
          openings?: number
          published_at?: string | null
          requirements?: string | null
          salary?: number | null
          schedule?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["job_status"]
          title?: string
          workload?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "jobs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          link: string | null
          read_at: string | null
          title: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          link?: string | null
          read_at?: string | null
          title: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          link?: string | null
          read_at?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      professional_experiences: {
        Row: {
          company_name: string
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          professional_id: string
          role_title: string
          start_date: string | null
        }
        Insert: {
          company_name: string
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          professional_id: string
          role_title: string
          start_date?: string | null
        }
        Update: {
          company_name?: string
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          professional_id?: string
          role_title?: string
          start_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "professional_experiences_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
        ]
      }
      professional_skills: {
        Row: {
          level: number
          professional_id: string
          skill_id: string
        }
        Insert: {
          level?: number
          professional_id: string
          skill_id: string
        }
        Update: {
          level?: number
          professional_id?: string
          skill_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "professional_skills_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "professional_skills_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
        ]
      }
      professionals: {
        Row: {
          address: string | null
          city: string | null
          cpf: string | null
          created_at: string
          education: string | null
          email: string | null
          full_name: string
          has_vehicle: boolean
          headline: string | null
          id: string
          immediate_availability: boolean
          lat: number | null
          lng: number | null
          modality: Database["public"]["Enums"]["work_modality"] | null
          phone: string | null
          photo_url: string | null
          rate_activity: number | null
          rate_day: number | null
          rate_hour: number | null
          rating_avg: number
          rating_count: number
          region: string | null
          salary_expectation: number | null
          talent_pool_consent: boolean
          travel_radius_km: number
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          cpf?: string | null
          created_at?: string
          education?: string | null
          email?: string | null
          full_name?: string
          has_vehicle?: boolean
          headline?: string | null
          id?: string
          immediate_availability?: boolean
          lat?: number | null
          lng?: number | null
          modality?: Database["public"]["Enums"]["work_modality"] | null
          phone?: string | null
          photo_url?: string | null
          rate_activity?: number | null
          rate_day?: number | null
          rate_hour?: number | null
          rating_avg?: number
          rating_count?: number
          region?: string | null
          salary_expectation?: number | null
          talent_pool_consent?: boolean
          travel_radius_km?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          city?: string | null
          cpf?: string | null
          created_at?: string
          education?: string | null
          email?: string | null
          full_name?: string
          has_vehicle?: boolean
          headline?: string | null
          id?: string
          immediate_availability?: boolean
          lat?: number | null
          lng?: number | null
          modality?: Database["public"]["Enums"]["work_modality"] | null
          phone?: string | null
          photo_url?: string | null
          rate_activity?: number | null
          rate_day?: number | null
          rate_hour?: number | null
          rating_avg?: number
          rating_count?: number
          region?: string | null
          salary_expectation?: number | null
          talent_pool_consent?: boolean
          travel_radius_km?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string
          id: string
          lgpd_consent_at: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          id: string
          lgpd_consent_at?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          lgpd_consent_at?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      recruitment_history: {
        Row: {
          actor_id: string | null
          application_id: string
          channel: string | null
          created_at: string
          from_stage: Database["public"]["Enums"]["application_stage"] | null
          id: string
          kind: string
          next_contact_at: string | null
          note: string | null
          result: string | null
          to_stage: Database["public"]["Enums"]["application_stage"] | null
        }
        Insert: {
          actor_id?: string | null
          application_id: string
          channel?: string | null
          created_at?: string
          from_stage?: Database["public"]["Enums"]["application_stage"] | null
          id?: string
          kind?: string
          next_contact_at?: string | null
          note?: string | null
          result?: string | null
          to_stage?: Database["public"]["Enums"]["application_stage"] | null
        }
        Update: {
          actor_id?: string | null
          application_id?: string
          channel?: string | null
          created_at?: string
          from_stage?: Database["public"]["Enums"]["application_stage"] | null
          id?: string
          kind?: string
          next_contact_at?: string | null
          note?: string | null
          result?: string | null
          to_stage?: Database["public"]["Enums"]["application_stage"] | null
        }
        Relationships: [
          {
            foreignKeyName: "recruitment_history_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      skills: {
        Row: {
          category: string | null
          id: string
          name: string
        }
        Insert: {
          category?: string | null
          id?: string
          name: string
        }
        Update: {
          category?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      stores: {
        Row: {
          address: string | null
          city: string | null
          company_id: string
          created_at: string
          id: string
          lat: number | null
          lng: number | null
          name: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          company_id: string
          created_at?: string
          id?: string
          lat?: number | null
          lng?: number | null
          name: string
        }
        Update: {
          address?: string | null
          city?: string | null
          company_id?: string
          created_at?: string
          id?: string
          lat?: number | null
          lng?: number | null
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "stores_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      application_company: { Args: { _app_id: string }; Returns: string }
      application_owner: { Args: { _app_id: string }; Returns: string }
      become_professional: { Args: never; Returns: string }
      create_company: {
        Args: { _city: string; _cnpj: string; _name: string; _segment: string }
        Returns: string
      }
      freela_checkin: {
        Args: { _assignment_id: string; _lat: number; _lng: number }
        Returns: undefined
      }
      freela_checkout: {
        Args: {
          _assignment_id: string
          _lat: number
          _lng: number
          _report: string
          _result: string
        }
        Returns: undefined
      }
      freela_respond: {
        Args: { _accept: boolean; _assignment_id: string }
        Returns: undefined
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_any_company_member: { Args: { _user_id: string }; Returns: boolean }
      is_company_member: {
        Args: { _company_id: string; _user_id: string }
        Returns: boolean
      }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
      job_company: { Args: { _job_id: string }; Returns: string }
      my_professional_id: { Args: never; Returns: string }
      opportunity_company: { Args: { _id: string }; Returns: string }
      select_freelancer: { Args: { _application_id: string }; Returns: string }
    }
    Enums: {
      app_role:
        | "super_admin"
        | "admin_aponto"
        | "gestor_aponto"
        | "rh_aponto"
        | "gestor_empresa"
        | "empresa"
        | "profissional"
      application_stage:
        | "candidatura"
        | "triagem"
        | "contato"
        | "entrevista"
        | "aprovacao"
        | "documentos"
        | "contratacao"
        | "ativo"
        | "reprovado"
        | "desistiu"
      assignment_status:
        | "convidado"
        | "aceito"
        | "reservado"
        | "em_execucao"
        | "aguardando_aprovacao"
        | "aprovado"
        | "reprovado"
        | "cancelado"
      doc_status:
        | "pendente"
        | "enviado"
        | "analise"
        | "aprovado"
        | "recusado"
        | "expirado"
      freela_app_status:
        | "interessado"
        | "sem_interesse"
        | "selecionado"
        | "recusado"
      freela_status:
        | "rascunho"
        | "publicada"
        | "interessados"
        | "selecionados"
        | "confirmada"
        | "em_andamento"
        | "concluida"
        | "cancelada"
      job_status: "rascunho" | "publicada" | "pausada" | "encerrada"
      pay_unit: "diaria" | "hora" | "atividade"
      work_modality: "fixo" | "freelancer" | "ambos"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
        "super_admin",
        "admin_aponto",
        "gestor_aponto",
        "rh_aponto",
        "gestor_empresa",
        "empresa",
        "profissional",
      ],
      application_stage: [
        "candidatura",
        "triagem",
        "contato",
        "entrevista",
        "aprovacao",
        "documentos",
        "contratacao",
        "ativo",
        "reprovado",
        "desistiu",
      ],
      assignment_status: [
        "convidado",
        "aceito",
        "reservado",
        "em_execucao",
        "aguardando_aprovacao",
        "aprovado",
        "reprovado",
        "cancelado",
      ],
      doc_status: [
        "pendente",
        "enviado",
        "analise",
        "aprovado",
        "recusado",
        "expirado",
      ],
      freela_app_status: [
        "interessado",
        "sem_interesse",
        "selecionado",
        "recusado",
      ],
      freela_status: [
        "rascunho",
        "publicada",
        "interessados",
        "selecionados",
        "confirmada",
        "em_andamento",
        "concluida",
        "cancelada",
      ],
      job_status: ["rascunho", "publicada", "pausada", "encerrada"],
      pay_unit: ["diaria", "hora", "atividade"],
      work_modality: ["fixo", "freelancer", "ambos"],
    },
  },
} as const
