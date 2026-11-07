// Shared helpers for the Vercel functions. Files under a leading-underscore folder are not
// deployed as routes.
import { createClient } from '@supabase/supabase-js';
import { createHmac } from 'node:crypto';

export const TARGET = 15;

export interface StatusPayload {
  currentScans: number;
  target: typeof TARGET;
  isOverloaded: boolean;
}

export interface ScanPayload extends StatusPayload {
  /** false when this visitor was already counted (or their IP could not be read). */
  recorded: boolean;
}

const SUPABASE_URL = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
// Prefer the server-only service role key; the anon key is public and needs the
// anon policies from supabase/schema.sql (section 4).
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error('Missing VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY / VITE_SUPABASE_ANON_KEY');
}

// Module scope: reused across invocations while the function instance stays warm.
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const HASH_SALT = process.env.SCAN_HASH_SALT;
if (!HASH_SALT) {
  console.warn('[scans] SCAN_HASH_SALT is not set; using an insecure default. Set it in Vercel env vars.');
}

/** Salted HMAC: an unsalted SHA-256 of an IPv4 address can be brute-forced in seconds. */
export const hashIp = (ip: string): string =>
  createHmac('sha256', HASH_SALT ?? 'puerta-18-dev-salt').update(ip).digest('hex');

/** Client IP as set by Vercel's edge (first X-Forwarded-For entry), or null if absent. */
export const clientIp = (request: Request): string | null => {
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  return forwarded || request.headers.get('x-real-ip')?.trim() || null;
};

export const getUniqueCount = async (): Promise<number> => {
  const { data, error } = await supabase.rpc('scan_count');
  if (error) throw error;
  if (typeof data !== 'number') throw new Error('scan_count() returned a non-number');
  return data;
};

/** Inserts the visitor. The UNIQUE(ip_hash) constraint makes repeat scans a no-op. */
export const registerScan = async (ipHash: string): Promise<boolean> => {
  const { error } = await supabase.from('scans').insert({ ip_hash: ipHash });
  if (!error) return true;
  if (error.code === '23505') return false; // unique_violation: already counted
  throw error;
};

export const toStatus = (currentScans: number): StatusPayload => ({
  currentScans,
  target: TARGET,
  isOverloaded: currentScans >= TARGET,
});

export const json = (body: unknown, status = 200): Response =>
  Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
