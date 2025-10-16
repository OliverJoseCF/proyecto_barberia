import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface HorarioSemanal {
  id: string;
  dia_semana: number; // 0=Domingo, 1=Lunes, ..., 6=Sábado
  activo: boolean;
  hora_apertura: string; // TIME format "HH:MM:SS"
  hora_cierre: string;
  pausa_inicio?: string;
  pausa_fin?: string;
  updated_at?: string;
}

export interface DiaFestivo {
  id: string;
  fecha: string; // DATE format "YYYY-MM-DD"
  descripcion: string;
  recurrente: boolean;
  created_at?: string;
}

export interface ConfiguracionHorarios {
  intervalo_citas_minutos: number;
  anticipacion_minima_horas: number;
  anticipacion_maxima_dias: number;
}

export function useHorarios() {
  const [horarios, setHorarios] = useState<HorarioSemanal[]>([]);
  const [diasFestivos, setDiasFestivos] = useState<DiaFestivo[]>([]);
  const [configuracion, setConfiguracion] = useState<ConfiguracionHorarios>({
    intervalo_citas_minutos: 30,
    anticipacion_minima_horas: 2,
    anticipacion_maxima_dias: 30
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHorarios();
    fetchDiasFestivos();
    fetchConfiguracion();

    // Suscripción a cambios en tiempo real
    const horariosChannel = supabase
      .channel('horarios-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'horarios_semanales' },
        (payload) => {
          console.log('🔄 Cambio en horarios detectado:', payload.eventType, payload);
          if (payload.eventType === 'UPDATE') {
            setHorarios(prev => {
              const updated = prev.map(h => 
                h.id === payload.new.id ? { ...h, ...(payload.new as HorarioSemanal) } : h
              );
              console.log('✅ Estado de horarios actualizado:', updated);
              return updated;
            });
          } else if (payload.eventType === 'INSERT') {
            setHorarios(prev => [...prev, payload.new as HorarioSemanal]);
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 Canal horarios-changes:', status);
      });

    const festivosChannel = supabase
      .channel('festivos-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'dias_festivos' },
        (payload) => {
          console.log('🔄 Cambio en festivos detectado:', payload.eventType, payload);
          
          if (payload.eventType === 'INSERT') {
            const nuevoFestivo = payload.new as DiaFestivo;
            console.log('➕ Festivo insertado vía Realtime:', nuevoFestivo);
            
            // Evitar duplicados: solo agregar si no existe ya
            setDiasFestivos(prev => {
              const existe = prev.some(d => d.id === nuevoFestivo.id);
              if (existe) {
                console.log('⚠️ Festivo ya existe en el estado, ignorando duplicado');
                return prev;
              }
              const updated = [...prev, nuevoFestivo];
              console.log('✅ Festivo agregado al estado:', updated.length, 'días');
              return updated;
            });
          } else if (payload.eventType === 'DELETE') {
            const idEliminado = payload.old.id;
            console.log('🗑️ Festivo eliminado vía Realtime:', idEliminado);
            
            setDiasFestivos(prev => {
              const updated = prev.filter(d => d.id !== idEliminado);
              console.log('✅ Festivo eliminado del estado:', updated.length, 'días restantes');
              return updated;
            });
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 Canal festivos-changes:', status);
      });

    const configChannel = supabase
      .channel('config-changes')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'configuracion' },
        () => {
          console.log('🔄 Cambio en configuración');
          fetchConfiguracion();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(horariosChannel);
      supabase.removeChannel(festivosChannel);
      supabase.removeChannel(configChannel);
    };
  }, []);

  const fetchHorarios = async () => {
    try {
      const { data, error } = await supabase
        .from('horarios_semanales')
        .select('*')
        .order('dia_semana');

      if (error) throw error;
      setHorarios(data || []);
    } catch (err: any) {
      console.error('Error al cargar horarios:', err);
      setError(err.message);
    }
  };

  const fetchDiasFestivos = async () => {
    try {
      const { data, error } = await supabase
        .from('dias_festivos')
        .select('*')
        .order('fecha');

      if (error) throw error;
      setDiasFestivos(data || []);
    } catch (err: any) {
      console.error('Error al cargar días festivos:', err);
      setError(err.message);
    }
  };

  const fetchConfiguracion = async () => {
    try {
      const { data, error } = await supabase
        .from('configuracion')
        .select('clave, valor')
        .in('clave', [
          'intervalo_citas_minutos',
          'anticipacion_minima_horas',
          'anticipacion_maxima_dias'
        ]);

      if (error) throw error;

      const config: any = {};
      data?.forEach(item => {
        config[item.clave] = parseInt(item.valor);
      });

      setConfiguracion(prev => ({ ...prev, ...config }));
      setLoading(false);
    } catch (err: any) {
      console.error('Error al cargar configuración:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  const actualizarHorario = async (id: string, updates: Partial<HorarioSemanal>) => {
    try {
      // Optimistic update - actualizar UI inmediatamente
      setHorarios(prev => prev.map(h => 
        h.id === id ? { ...h, ...updates } : h
      ));

      const { error } = await supabase
        .from('horarios_semanales')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      
      // Refrescar para asegurar sincronización
      await fetchHorarios();
      return true;
    } catch (err: any) {
      console.error('Error al actualizar horario:', err);
      // Revertir cambio optimista en caso de error
      await fetchHorarios();
      throw err;
    }
  };

  const agregarDiaFestivo = async (festivo: Omit<DiaFestivo, 'id' | 'created_at'>) => {
    try {
      console.log('➕ Agregando día festivo:', festivo);
      
      const { data, error } = await supabase
        .from('dias_festivos')
        .insert([festivo])
        .select()
        .single();

      if (error) throw error;
      
      console.log('✅ Día festivo agregado exitosamente:', data);
      
      // Actualización optimista inmediata
      setDiasFestivos(prev => {
        const updated = [...prev, data as DiaFestivo];
        console.log('📅 Lista de festivos actualizada:', updated.length, 'días');
        return updated;
      });
      
      return data;
    } catch (err: any) {
      console.error('❌ Error al agregar festivo:', err);
      throw err;
    }
  };

  const eliminarDiaFestivo = async (id: string) => {
    try {
      console.log('🗑️ Eliminando día festivo:', id);
      
      // Actualización optimista: eliminar inmediatamente de la UI
      const festivoEliminado = diasFestivos.find(f => f.id === id);
      setDiasFestivos(prev => {
        const updated = prev.filter(d => d.id !== id);
        console.log('📅 Lista actualizada (optimista):', updated.length, 'días');
        return updated;
      });

      const { error } = await supabase
        .from('dias_festivos')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('❌ Error al eliminar, revirtiendo...');
        // Revertir en caso de error
        if (festivoEliminado) {
          setDiasFestivos(prev => [...prev, festivoEliminado]);
        }
        throw error;
      }
      
      console.log('✅ Día festivo eliminado exitosamente');
      return true;
    } catch (err: any) {
      console.error('❌ Error al eliminar festivo:', err);
      throw err;
    }
  };

  const actualizarConfiguracion = async (clave: string, valor: string) => {
    try {
      // Optimistic update - actualizar UI inmediatamente
      setConfiguracion(prev => ({
        ...prev,
        [clave]: parseInt(valor)
      }));

      const { error } = await supabase
        .from('configuracion')
        .update({ valor })
        .eq('clave', clave);

      if (error) throw error;
      
      // Refrescar para asegurar sincronización
      await fetchConfiguracion();
      return true;
    } catch (err: any) {
      console.error('Error al actualizar configuración:', err);
      // Revertir cambio optimista en caso de error
      await fetchConfiguracion();
      throw err;
    }
  };

  return {
    horarios,
    diasFestivos,
    configuracion,
    loading,
    error,
    actualizarHorario,
    agregarDiaFestivo,
    eliminarDiaFestivo,
    actualizarConfiguracion,
    refetch: () => {
      fetchHorarios();
      fetchDiasFestivos();
      fetchConfiguracion();
    }
  };
}
