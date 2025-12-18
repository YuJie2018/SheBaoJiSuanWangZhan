export interface EnvConfig {
  supabaseUrl: string | null;
  supabaseAnonKey: string | null;
  supabaseServiceKey: string | null;
  isConfigured: boolean;
  missingVars: string[];
}

export function getEnvConfig(): EnvConfig {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || null;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || null;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || null;

  const missingVars: string[] = [];

  if (!supabaseUrl || supabaseUrl.trim() === '') {
    missingVars.push('NEXT_PUBLIC_SUPABASE_URL');
  }
  if (!supabaseAnonKey || supabaseAnonKey.trim() === '') {
    missingVars.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }
  if (!supabaseServiceKey || supabaseServiceKey.trim() === '') {
    missingVars.push('SUPABASE_SERVICE_ROLE_KEY');
  }

  return {
    supabaseUrl,
    supabaseAnonKey,
    supabaseServiceKey,
    isConfigured: missingVars.length === 0,
    missingVars,
  };
}

export function validateEnvConfig(): { isValid: boolean; error?: string } {
  const config = getEnvConfig();

  if (!config.isConfigured) {
    return {
      isValid: false,
      error: `Missing required environment variables: ${config.missingVars.join(', ')}`,
    };
  }

  // 验证 URL 格式
  try {
    if (config.supabaseUrl) {
      new URL(config.supabaseUrl);
    }
  } catch {
    return {
      isValid: false,
      error: 'Invalid NEXT_PUBLIC_SUPABASE_URL format',
    };
  }

  return { isValid: true };
}