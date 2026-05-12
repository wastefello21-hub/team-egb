import { createClient } from '@supabase/supabase-js';

// Use environment variables when available (recommended).
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jiqztujpobafjvoukflt.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImppcXp0dWpwb2JhZmp2b3VrZmx0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyMTczMjMsImV4cCI6MjA5Mjc5MzMyM30.iBhklbiJ84K2xF6lF078mEKGzVxR8gifLScWd1hZ1Jo';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Optional server-side admin client (requires service role key).
// Set `SUPABASE_SERVICE_ROLE_KEY` in your environment for server-side operations.
export const supabaseAdmin = process.env.SUPABASE_SERVICE_ROLE_KEY
	? createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY)
	: null;
