import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://zwynswfofeikaidhkdmw.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_HCke56XCxIcX1kSQzCGibg_W7V64m6a';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
