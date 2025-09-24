
import { createClient } from '@supabase/supabase-js';


const supabaseUrl = 'https://hjfygkjvqacebgadsqrn.supabase.co';
// Usa SOLO la anon key pública de Supabase en el frontend. Nunca uses la service_role ni claves secretas aquí.
const supabaseAnonKey = 'TU_ANON_KEY_AQUI'; // Reemplaza por tu anon key real
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

