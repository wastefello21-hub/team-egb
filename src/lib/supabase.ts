import { createClient } from '@supabase/supabase-js';

// Using hardcoded values so Vercel can deploy immediately without env var issues.
// NOTE: Supabase requires the Base URL, passing `/rest/v1/` directly breaks it.
const supabaseUrl = 'https://jiqztujpobafjvoukflt.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImppcXp0dWpwb2JhZmp2b3VrZmx0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyMTczMjMsImV4cCI6MjA5Mjc5MzMyM30.iBhklbiJ84K2xF6lF078mEKGzVxR8gifLScWd1hZ1Jo';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
