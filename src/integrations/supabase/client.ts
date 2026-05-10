import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://abucbojsosfxdaufdapw.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFidWNib2pzb3NmeGRhdWZkYXB3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2Mjg4NTUsImV4cCI6MjA5MzIwNDg1NX0.IjswX2er9SYno_2l-c3IPuuT8o5PCxtP2Ms3EaECm1E";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: typeof window !== 'undefined' ? localStorage : undefined,
    persistSession: true,
    autoRefreshToken: true,
  }
});
