import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface Servicio {
  id: string;
  nombre: string;
  descripcion: string;
  duracion: number; // minutos
  precio: number;
  activo: boolean;
}

export function useServicios() {
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchServicios();
  }, []);

  const fetchServicios = async () => {
    try {
      setLoading(true);
      console.log('🔍 Cargando servicios desde Supabase...');
      
      const { data, error: fetchError } = await supabase
        .from('servicios')
        .select('*')
        .eq('activo', true)
        .order('nombre');

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
