# Deployment Guide

## 1. Environment Setup

### Supabase Configuration
1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings → API and copy:
   - URL → Set as `VITE_SUPABASE_URL`
   - Service Role Key → Set as `VITE_SUPABASE_SERVICE_ROLE`
3. Enable Row Level Security for the `ebooks` table

### Local Environment
Create `.env` file in project root:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_SERVICE_ROLE=your_service_role_key
```

## 2. Database Setup
Run the setup script:
```bash
chmod +x supabase-setup.sh
./supabase-setup.sh
```

## 3. Build and Deploy

### Vercel (Recommended)
```bash
npm install -g vercel
vercel deploy
```

### Netlify
```bash
npm run build
netlify deploy --prod
```

### Static Hosting
```bash
npm run build
# Upload /dist folder to any static hosting
```

## 4. Required Settings
- Enable CORS for your domain in Supabase Storage
- Set bucket permissions to public-read

## 5. Admin Access
- Visit `/admin` route to manage eBooks
- Only authorized users can access the admin panel

## 6. Monitoring
- Use Supabase Dashboard for database monitoring
- Enable logging for production debugging
