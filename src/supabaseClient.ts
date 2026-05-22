import { createClient } from '@supabase/supabase-js';

// Robust helper to sanitize environment variables
const sanitizeUrl = (val: any, fallback: string): string => {
  if (typeof val !== 'string') return fallback;
  const cleaned = val.trim().replace(/^["']|["']$/g, '').trim();
  if (!cleaned || (!cleaned.startsWith('http://') && !cleaned.startsWith('https://'))) {
    return fallback;
  }
  return cleaned;
};

const sanitizeKey = (val: any, fallback: string): string => {
  if (typeof val !== 'string') return fallback;
  const cleaned = val.trim().replace(/^["']|["']$/g, '').trim();
  if (!cleaned || cleaned.toLowerCase().includes('placeholder') || cleaned === 'sb_publishable_placeholder') {
    return fallback;
  }
  return cleaned;
};

// Retrieve and sanitize credentials
const rawUrl = (import.meta as any).env ? (import.meta as any).env.VITE_SUPABASE_URL : undefined;
const rawKey = (import.meta as any).env ? (import.meta as any).env.VITE_SUPABASE_ANON_KEY : undefined;

const supabaseUrl = sanitizeUrl(rawUrl, 'https://rduirrzhdrgyxyvtrrox.supabase.co');
const supabaseAnonKey = sanitizeKey(rawKey, 'sb_publishable_hl4it0yfAuOTKlVJeMSk2Q_B01_JP-v');

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
