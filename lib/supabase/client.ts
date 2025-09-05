import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = "https://uyhgnqrtirnwaxqemacw.supabase.co"
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV5aGducXJ0aXJud2F4cWVtYWN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxNjM3MjMsImV4cCI6MjA3MTczOTcyM30.jKSZaCQYCl1BfilCR9jrm5l4z4M9BqYxCCQqhO0x4aU"

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
})