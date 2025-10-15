import { useState, useEffect } from 'react';
import { supabase, TABLES, type Cita, type NuevaCita } from '@/lib/supabase';

interface UseCitasReturn {
  citas: Cita[];
  loading: boolean;
  error: string | null;
  fetchCitas: (filtros?: FiltrosCitas) => Promise<void>;
  getCitas: () => Promise<Cita[]>;
  createCita: (nuevaCita: NuevaCita) => Promise<{ data: Cita | null; error: string | null }>;
  updateCita: (id: string, actualizacion: Partial<Cita>) => Promise<{ error: string | null }>;
  deleteCita: (id: string) => Promise<{ error: string | null }>;
  getCitasByDate: (fecha: string) => Promise<Cita[]>;
  getCitasByBarbero: (barbero: string) => Promise<Cita[]>;
  getCitaByPhone: (telefono: string) => Promise<Cita | null>;
}

interface FiltrosCitas {
  fecha?: string;
  barbero?: string;
  estado?: Cita['estado'];
  fechaDesde?: string;
  fechaHasta?: string;
}

export const useCitas = (): UseCitasReturn => {
  const [citas, setCitas] = useState<Cita[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ============================================
  // FETCH: Obtener citas con filtros opcionales
  // ============================================
  const fetchCitas = async (filtros?: FiltrosCitas) => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase.from(TABLES.CITAS).select('*');

      // Aplicar filtros
      if (filtros?.fecha) {
        query = query.eq('fecha', filtros.fecha);
      }
      if (filtros?.barbero) {
        query = query.eq('barbero', filtros.barbero);
      }
      if (filtros?.estado) {
        query = query.eq('estado', filtros.estado);
      }
      if (filtros?.fechaDesde) {
        query = query.gte('fecha', filtros.fechaDesde);
      }
      if (filtros?.fechaHasta) {
        query = query.lte('fecha', filtros.fechaHasta);
      }

      // Ordenar por fecha y hora
      query = query.order('fecha', { ascending: true }).order('hora', { ascending: true });

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setCitas(data || []);
    } catch (err: any) {
      console.error('Error al obtener citas:', err);
      setError(err.message || 'Error al cargar las citas');
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // CREATE: Crear nueva cita
  // ============================================
  const createCita = async (nuevaCita: NuevaCita): Promise<{ data: Cita | null; error: string | null }> => {
    try {
      console.log('🔍 [use-citas] Intentando crear cita:', nuevaCita);
      
      const { data, error: insertError } = await supabase
        .from(TABLES.CITAS)
        .insert([nuevaCita])
        .select()
        .single();

      if (insertError) {
        console.error('❌ [use-citas] Error de Supabase:', insertError);
        throw insertError;
      }

      console.log('✅ [use-citas] Cita creada exitosamente:', data);

      // Actualizar lista local
      if (data) {
        setCitas(prev => [...prev, data]);
      }

      return { data, error: null };
    } catch (err: any) {
      console.error('❌ [use-citas] Error al crear cita:', err);
      return { data: null, error: err.message || 'Error al crear la cita' };
    }
  };

  // ============================================
  // UPDATE: Actualizar cita existente
  // ============================================
  const updateCita = async (id: string, actualizacion: Partial<Cita>): Promise<{ error: string | null }> => {
    try {
      console.log('🔄 [use-citas] Actualizando cita en Supabase:', { id, actualizacion });
      
      const { data, error: updateError } = await supabase
        .from(TABLES.CITAS)
        .update({ ...actualizacion, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select();

      if (updateError) {
        console.error('❌ [use-citas] Error de Supabase al actualizar:', updateError);
        throw updateError;
      }

      console.log('✅ [use-citas] Cita actualizada en Supabase:', data);

      // Actualizar lista local
      setCitas(prev => prev.map(cita => cita.id === id ? { ...cita, ...actualizacion } : cita));

      return { error: null };
    } catch (err: any) {
      console.error('❌ [use-citas] Error al actualizar cita:', err);
      return { error: err.message || 'Error al actualizar la cita' };
    }
  };

  // ============================================
  // DELETE: Eliminar cita
  // ============================================
  const deleteCita = async (id: string): Promise<{ error: string | null }> => {
    try {
      console.log('🗑️ [use-citas] Eliminando cita con ID:', id);
      
      const { error: deleteError } = await supabase
        .from(TABLES.CITAS)
        .delete()
        .eq('id', id);

      if (deleteError) {
        console.error('❌ [use-citas] Error al eliminar:', deleteError);
        throw deleteError;
      }

      console.log('✅ [use-citas] Cita eliminada exitosamente de Supabase');

      // Actualizar lista local
      setCitas(prev => prev.filter(cita => cita.id !== id));

      return { error: null };
    } catch (err: any) {
      console.error('❌ [use-citas] Error al eliminar cita:', err);
      return { error: err.message || 'Error al eliminar la cita' };
    }
  };

  // ============================================
  // HELPERS: Consultas específicas
  // ============================================
  const getCitas = async (): Promise<Cita[]> => {
    try {
      console.log('🔍 [getCitas] Obteniendo todas las citas...');
      
      const { data, error } = await supabase
        .from(TABLES.CITAS)
        .select('*')
        .order('fecha', { ascending: false })
        .order('hora', { ascending: true });

      if (error) {
        console.error('❌ [getCitas] Error de Supabase:', error);
        throw error;
      }
      
      console.log(`✅ [getCitas] Encontradas ${data?.length || 0} citas totales`);
      return data || [];
    } catch (err) {
      console.error('❌ [getCitas] Error al obtener todas las citas:', err);
      return [];
    }
  };

  const getCitasByDate = async (fecha: string): Promise<Cita[]> => {
    try {
      const { data, error } = await supabase
        .from(TABLES.CITAS)
        .select('*')
        .eq('fecha', fecha)
        .order('hora', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error al obtener citas por fecha:', err);
      return [];
    }
  };

  const getCitasByBarbero = async (barbero: string): Promise<Cita[]> => {
    try {
      console.log('🔍 [getCitasByBarbero] Buscando citas para barbero:', barbero);
      
      const { data, error } = await supabase
        .from(TABLES.CITAS)
        .select('*')
        .eq('barbero', barbero)
        .order('fecha', { ascending: true })
        .order('hora', { ascending: true });

      if (error) {
        console.error('❌ [getCitasByBarbero] Error de Supabase:', error);
        throw error;
      }
      
      console.log(`✅ [getCitasByBarbero] Encontradas ${data?.length || 0} citas:`, data);
      return data || [];
    } catch (err) {
      console.error('❌ [getCitasByBarbero] Error al obtener citas por barbero:', err);
      return [];
    }
  };

  const getCitaByPhone = async (telefono: string): Promise<Cita | null> => {
    try {
      const { data, error } = await supabase
        .from(TABLES.CITAS)
        .select('*')
        .eq('cliente_telefono', telefono)
        .order('fecha', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error al obtener cita por teléfono:', err);
      return null;
    }
  };

  return {
    citas,
    loading,
    error,
    fetchCitas,
    getCitas,
    createCita,
    updateCita,
    deleteCita,
    getCitasByDate,
    getCitasByBarbero,
    getCitaByPhone,
  };
};
