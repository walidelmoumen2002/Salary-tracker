import { createClient } from "@supabase/supabase-js";

// Attempt to get Supabase credentials from environment variables.
// These variables should be configured in your deployment environment.
const supabaseUrl = "https://tmqsmvdpewuumchynvku.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtcXNtdmRwZXd1dW1jaHludmt1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3NjI1NjIsImV4cCI6MjA3NzMzODU2Mn0.yQQXNwRTdaskj0Xe0z2axPxtUjLZfFuil10f7F_wldk";

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL and Anon Key must be provided in environment variables.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
