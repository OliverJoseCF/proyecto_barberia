import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface Servicio {
  id: string;
  nombre: string;
  descripcion: string;
  duracion: number; // minutos
  precio: number;
  activo: boolean;
  categoria?: string;
  creado_en?: string;
}

export function useServicios(incluirInactivos = false) {
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchServicios();

    // Suscripción a cambios en tiempo real
    const channel = supabase
      .channel('servicios-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'servicios'
        },
        (payload) => {
          console.log('🔄 Cambio detectado en servicios:', payload);
          
          if (payload.eventType === 'INSERT') {
            const newServicio = payload.new as Servicio;
            if (incluirInactivos || newServicio.activo) {
              setServicios(prev => [...prev, newServicio]);
            }
          } else if (payload.eventType === 'UPDATE') {
            const updatedServicio = payload.new as Servicio;
            setServicios(prev => {
              if (incluirInactivos || updatedServicio.activo) {
                return prev.map(s => s.id === updatedServicio.id ? updatedServicio : s);
              } else {
                return prev.filter(s => s.id !== updatedServicio.id);
              }
            });
          } else if (payload.eventType === 'DELETE') {
            setServicios(prev => prev.filter(s => s.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [incluirInactivos]);

  const fetchServicios = async () => {
    try {
      setLoading(true);
      console.log('🔍 Cargando servicios desde Supabase...');
      
      let query = supabase
        .from('servicios')
        .select('*')
        .order('nombre');

      if (!incluirInactivos) {
        query = query.eq('activo', true);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        throw fetchError;
      }

      console.log('✅ Servicios cargados:', data);
      setServicios(data || []);
      setError(null);
    } catch (err: any) {
      console.error('❌ Error al cargar servicios:', err);
      setError(err.message);
      setServicios([]);
    } finally {
      setLoading(false);
    }
  };

  return {
    servicios,
    loading,
    error,
    refetch: fetchServicios
  };
}
