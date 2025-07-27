#!/bin/bash

# Read .env file
source .env

# Create or update storage bucket
echo "Creating/updating storage bucket..."
curl -X POST "$VITE_SUPABASE_URL/storage/v1/bucket" \
  -H "apikey: $VITE_SUPABASE_SERVICE_ROLE" \
  -H "Authorization: Bearer $VITE_SUPABASE_SERVICE_ROLE" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "ebook-images",
    "public": true,
    "allowed_mime_types": ["image/*"],
    "file_size_limit": 5242880
  }' || echo "Bucket already exists, continuing..."

# Update bucket to ensure it's public
echo "Updating bucket permissions..."
curl -X PUT "$VITE_SUPABASE_URL/storage/v1/bucket/ebook-images" \
  -H "apikey: $VITE_SUPABASE_SERVICE_ROLE" \
  -H "Authorization: Bearer $VITE_SUPABASE_SERVICE_ROLE" \
  -H "Content-Type: application/json" \
  -d '{"public": true}' 

# Create ebooks table using SQL
echo "Creating ebooks table..."
curl -X POST "$VITE_SUPABASE_URL/rest/v1/rpc" \
  -H "apikey: $VITE_SUPABASE_SERVICE_ROLE" \
  -H "Authorization: Bearer $VITE_SUPABASE_SERVICE_ROLE" \
  -H "Content-Type: application/json" \
  -d '{
    "sql": "CREATE TABLE IF NOT EXISTS ebooks (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), title text NOT NULL, title_lo text NOT NULL, description text, description_lo text, cover_image text NOT NULL, pages jsonb NOT NULL, background_music text, youtube_url text, is_public boolean DEFAULT TRUE, view_count bigint DEFAULT 0, created_at timestamp DEFAULT now());"
  }'

# Add CORS configuration for localhost
echo "Configuring CORS..."
curl -X PUT "$VITE_SUPABASE_URL/storage/v1/cors" \
  -H "apikey: $VITE_SUPABASE_SERVICE_ROLE" \
  -H "Authorization: Bearer $VITE_SUPABASE_SERVICE_ROLE" \
  -H "Content-Type: application/json" \
  -d '[
    {
      "origin": "http://localhost:5173",
      "methods": ["GET", "POST", "PUT"],
      "max_age_seconds": 3600
    },
    {
      "origin": "https://your-production-domain.com",
      "methods": ["GET", "POST", "PUT"],
      "max_age_seconds": 3600
    }
  ]'

echo "Supabase setup completed!"
