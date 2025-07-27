import { createClient } from '@supabase/supabase-js'

// Use service role key for admin operations
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://gtqwixzhujviivnfkaaj.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE || import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0cXdpeHpodWp2aWl2bmZrYWFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2MDcyMDIsImV4cCI6MjA2OTE4MzIwMn0.EjvaS4AH10-zmKx8NxpF2J0fkwtALZa9VxsKabew1g0'

export const supabase = createClient(supabaseUrl, supabaseKey)

export type Database = {
  public: {
    Tables: {
      ebooks: {
        Row: {
          id: string
          title: string
          title_lo: string
          description: string
          description_lo: string
          pages: string[]
          cover_image: string
          background_music?: string
          created_at: string
          updated_at: string
          is_public: boolean
          view_count: number
        }
        Insert: {
          id?: string
          title: string
          title_lo: string
          description: string
          description_lo: string
          pages: string[]
          cover_image: string
          background_music?: string
          created_at?: string
          updated_at?: string
          is_public?: boolean
          view_count?: number
        }
        Update: {
          id?: string
          title?: string
          title_lo?: string
          description?: string
          description_lo?: string
          pages?: string[]
          cover_image?: string
          background_music?: string
          updated_at?: string
          is_public?: boolean
          view_count?: number
        }
      }
    }
  }
}
