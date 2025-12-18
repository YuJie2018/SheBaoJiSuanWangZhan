import { createClient } from '@supabase/supabase-js';
import { getEnvConfig } from '../env';

const envConfig = getEnvConfig();

export const supabase = envConfig.supabaseUrl && envConfig.supabaseAnonKey
  ? createClient(envConfig.supabaseUrl, envConfig.supabaseAnonKey)
  : null;

export function isSupabaseConfigured(): boolean {
  return envConfig.isConfigured && supabase !== null;
}

export function getSupabaseClient() {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase client is not configured. Some features may not work.');
    return null;
  }
  return supabase;
}
