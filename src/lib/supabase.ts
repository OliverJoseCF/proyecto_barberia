import { createClient } from '@supabase/supabase-js';

// Obtener credenciales de variables de entorno
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validar que las credenciales estén configuradas
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    '❌ Error: Las credenciales de Supabase no están configuradas.\n' +
    'Asegúrate de tener un archivo .env con:\n' +
    'VITE_SUPABASE_URL=tu-url\n' +
    'VITE_SUPABASE_ANON_KEY=tu-key'
  );
}

// Crear cliente de Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ============================================
// TIPOS TYPESCRIPT PARA LA BASE DE DATOS
// ============================================

export interface Cita {
  id: string;
  cliente_nombre: string;
  cliente_telefono: string;
  fecha: string;
  hora: string;
  servicio: string;
  barbero: string;
  estado: 'pendiente' | 'confirmada' | 'completada' | 'cancelada';
  notas?: string;
  created_at: string;
  updated_at?: string;
}

export interface Servicio {
  id: string;
  nombre: string;
  descripcion?: string;
  precio: number;
  duracion: number; // minutos
  activo: boolean;
  created_at: string;
}

export interface Barbero {
  id: string;
  nombre: string;
  especialidad?: string;
  telefono?: string;
  email?: string;
  activo: boolean;
  created_at: string;
}

export interface Recordatorio {
  id: string;
  cita_id: string;
  tipo: 'confirmacion' | 'recordatorio' | 'seguimiento';
  estado: 'pendiente' | 'enviado' | 'fallido';
  fecha_envio?: string;
  mensaje?: string;
  created_at: string;
}

// ============================================
// TIPOS PARA INSERCIÓN (sin campos auto-generados)
// ============================================

export type NuevaCita = Omit<Cita, 'id' | 'created_at' | 'updated_at'>;
export type NuevoServicio = Omit<Servicio, 'id' | 'created_at'>;
export type NuevoBarbero = Omit<Barbero, 'id' | 'created_at'>;
export type NuevoRecordatorio = Omit<Recordatorio, 'id' | 'created_at'>;

// ============================================
// CONSTANTES DE TABLAS
// ============================================

export const TABLES = {
  CITAS: 'citas',
  SERVICIOS: 'servicios',
  BARBEROS: 'barberos',
  RECORDATORIOS: 'recordatorios',
} as const;

// ============================================
// HELPER: Verificar conexión
// ============================================

export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    const { error } = await supabase.from(TABLES.CITAS).select('count', { count: 'exact', head: true });
    if (error) throw error;
    console.log('✅ Conexión a Supabase exitosa');
    return true;
  } catch (error) {
    console.error('❌ Error al conectar con Supabase:', error);
    return false;
  }
};
