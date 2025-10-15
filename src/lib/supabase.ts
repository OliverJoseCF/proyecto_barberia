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

export interface TokenReprogramacion {
  id: string;
  cita_id: string;
  token: string;
  expira_en: string;
  usado: boolean;
  created_at: string;
}

export interface AuditoriaCita {
  id: string;
  cita_id: string | null;
  accion: 'INSERT' | 'UPDATE' | 'DELETE';
  usuario_id: string | null;
  datos_anteriores: any;
  datos_nuevos: any;
  cambios_especificos: any;
  ip_address?: string;
  user_agent?: string;
  timestamp: string;
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
  TOKENS_REPROGRAMACION: 'tokens_reprogramacion',
  AUDITORIA_CITAS: 'auditoria_citas',
} as const;

// ============================================
// HELPERS: Utilidades de base de datos
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

// ============================================
// FUNCIONES DE BASE DE DATOS (MEJORAS)
// ============================================

/**
 * Verifica disponibilidad usando la función optimizada de PostgreSQL
 */
export const verificarDisponibilidadOptimizada = async (
  fecha: string,
  hora: string,
  barbero: string
): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc('verificar_disponibilidad_optimizada', {
      p_fecha: fecha,
      p_hora: hora,
      p_barbero: barbero,
    });

    if (error) throw error;
    return data as boolean;
  } catch (error) {
    console.error('Error al verificar disponibilidad:', error);
    return false;
  }
};

/**
 * Obtiene todos los horarios disponibles de un día usando función PostgreSQL
 */
export const obtenerHorariosDisponibles = async (
  fecha: string,
  barbero: string
): Promise<Array<{ hora: string; disponible: boolean }>> => {
  try {
    const { data, error } = await supabase.rpc('horarios_disponibles', {
      p_fecha: fecha,
      p_barbero: barbero,
    });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error al obtener horarios disponibles:', error);
    return [];
  }
};

/**
 * Genera un token seguro para reprogramar una cita
 */
export const generarTokenReprogramacion = async (citaId: string): Promise<string | null> => {
  try {
    const { data, error } = await supabase.rpc('generar_token_reprogramacion', {
      p_cita_id: citaId,
    });

    if (error) throw error;
    return data as string;
  } catch (error) {
    console.error('Error al generar token:', error);
    return null;
  }
};

/**
 * Valida un token de reprogramación y retorna el ID de la cita
 */
export const validarTokenReprogramacion = async (token: string): Promise<string | null> => {
  try {
    const { data, error } = await supabase.rpc('validar_token_reprogramacion', {
      p_token: token,
    });

    if (error) throw error;
    return data as string | null;
  } catch (error) {
    console.error('Error al validar token:', error);
    return null;
  }
};

/**
 * Marca un token como usado después de reprogramar
 */
export const marcarTokenUsado = async (token: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc('marcar_token_usado', {
      p_token: token,
    });

    if (error) throw error;
    return data as boolean;
  } catch (error) {
    console.error('Error al marcar token como usado:', error);
    return false;
  }
};

/**
 * Obtiene el historial completo de cambios de una cita
 */
export const obtenerHistorialCita = async (citaId: string) => {
  try {
    const { data, error } = await supabase.rpc('obtener_historial_cita', {
      p_cita_id: citaId,
    });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error al obtener historial:', error);
    return [];
  }
};

/**
 * Obtiene cambios recientes (últimas 24 horas)
 */
export const obtenerCambiosRecientes = async () => {
  try {
    const { data, error } = await supabase.rpc('cambios_recientes');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error al obtener cambios recientes:', error);
    return [];
  }
};

/**
 * Obtiene estadísticas de un barbero
 */
export const obtenerEstadisticasBarbero = async (
  barbero: string,
  desde?: string,
  hasta?: string
) => {
  try {
    const { data, error } = await supabase.rpc('estadisticas_barbero', {
      p_barbero: barbero,
      p_desde: desde || undefined,
      p_hasta: hasta || undefined,
    });

    if (error) throw error;
    return data?.[0] || null;
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    return null;
  }
};

/**
 * Obtiene citas próximas
 */
export const obtenerCitasProximas = async (dias: number = 7, limite: number = 50) => {
  try {
    const { data, error } = await supabase.rpc('citas_proximas', {
      p_dias: dias,
      p_limite: limite,
    });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error al obtener citas próximas:', error);
    return [];
  }
};

/**
 * Refresca las estadísticas materializadas
 */
export const refrescarEstadisticas = async (): Promise<boolean> => {
  try {
    const { error } = await supabase.rpc('refrescar_estadisticas');
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error al refrescar estadísticas:', error);
    return false;
  }
};
