export interface EBook {
  id: string
  title: string
  title_lo: string
  description: string
  description_lo: string
  pages: string[]
  cover_image: string
  background_music?: string
  youtube_url?: string // Added YouTube URL field
  created_at: string
  updated_at: string
  is_public: boolean
  view_count: number
}

export interface Language {
  code: 'en' | 'lo'
  name: string
  nativeName: string
}
