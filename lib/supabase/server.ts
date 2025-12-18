import { createClient } from '@supabase/supabase-js';
import { getEnvConfig } from '../env';

const envConfig = getEnvConfig();

export function createServerClient() {
  if (!envConfig.isConfigured) {
    console.warn('Supabase server client is not configured. Some features may not work.');
    return null;
  }

  return createClient(envConfig.supabaseUrl!, envConfig.supabaseServiceKey!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export function isServerSupabaseConfigured(): boolean {
  return envConfig.isConfigured &&
         !!envConfig.supabaseUrl &&
         !!envConfig.supabaseServiceKey;
}
