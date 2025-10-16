import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface Barbero {
  id: string;
  nombre: string;
  especialidad: string;
  activo: boolean;
  telefono?: string;
  email?: string;
  foto_url?: string;
  biografia?: string;
  horario_preferido?: string;
  orden?: number;
  created_at?: string;
  updated_at?: string;
}

export function useBarberos() {
  const [barberos, setBarberos] = useState<Barbero[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBarberos();
  }, []);

  const fetchBarberos = async () => {
    try {
      setLoading(true);
      console.log('🔍 Cargando barberos desde Supabase...');
      
      const { data, error: fetchError } = await supabase
        .from('barberos')
        .select('*')
        .eq('activo', true)
        .order('nombre');

      if (fetchError) {
        throw fetchError;
      }

      console.log('✅ Barberos cargados:', data);
      setBarberos(data || []);
      setError(null);
    } catch (err: any) {
      console.error('❌ Error al cargar barberos:', err);
      setError(err.message);
      setBarberos([]);
    } finally {
      setLoading(false);
    }
  };

  return {
    barberos,
    loading,
    error,
    refetch: fetchBarberos
  };
}
