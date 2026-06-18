import { createClient } from '@supabase/supabase-js';

// Load client-side environment variables
const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || '';

// Fallback warning in console if keys are missing during development
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase integration: Missing VITE_SUPABASE_URL and/or VITE_SUPABASE_ANON_KEY. ' +
    'Please set these environment variables to connect to your database.'
  );
}

// Create and export the Supabase Client
export const supabase = createClient(
  supabaseUrl || 'https://placeholder-url.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key'
);
