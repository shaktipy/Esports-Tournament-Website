import { createClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://zwynswfofeikaidhkdmw.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_HCke56XCxIcX1kSQzCGibg_W7V64m6a';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || DEFAULT_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

