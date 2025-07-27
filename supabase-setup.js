import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

// Read .env.example manually
const envFile = fs.readFileSync('.env.example', 'utf8')
const envVars = envFile
  .split('\n')
  .filter(line => line && !line.startsWith('#'))
  .reduce((acc, line) => {
    const [key, value] = line.split('=')
    acc[key] = value
    return acc
  }, {})

const supabaseUrl = envVars.VITE_SUPABASE_URL
const supabaseKey = envVars.VITE_SUPABASE_SERVICE_ROLE || envVars.VITE_SUPABASE_ANON_KEY


if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase credentials in .env.example')
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function setupSupabase() {
  // Create storage bucket using direct API call (bypasses RLS)
  console.log('Creating storage bucket via API...')
  const bucketName = 'ebook-images'
  
  try {
    const response = await fetch(`${supabaseUrl}/storage/v1/bucket`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey
      },
      body: JSON.stringify({
        name: bucketName,
        public: true,
        allowed_mime_types: ['image/*'],
        file_size_limit: 5 * 1024 * 1024 // 5MB in bytes
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Failed to create bucket')
    }

    console.log(`Bucket '${bucketName}' created successfully`)
  } catch (apiError) {
    console.error('Error creating bucket via API:', apiError.message)
    return
  }

  // Create eBooks table
  const { data: table, error: tableError } = await supabase
    .from('ebooks')
    .insert([
      {
        definition: {
          cover_image: 'text',
          background_music: 'text',
          pages: 'jsonb',
          youtube_url: 'text',
          created_at: 'timestamp with time zone default now()'
        }
      }
    ])

  if (tableError) {
    console.error('Error creating table:', tableError.message)
    return
  }

  // Set RLS policies
  // Create RLS policy for ebooks table
  const { error: rlsError } = await supabase
    .rpc('create_policy', {
      policy_name: 'enable_ebooks_access',
      table_name: 'ebooks',
      using: 'true',
      check: 'true'
    })

  if (rlsError) {
    console.error('Error setting RLS:', rlsError.message)
    return
  }

  console.log('Supabase setup completed successfully!')
  console.log('- Created bucket: ebook-images')
  console.log('- Created table: ebooks')
  console.log('- Applied RLS policies')
}

await setupSupabase()
