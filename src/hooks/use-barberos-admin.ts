import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface Barbero {
  id: string;
  nombre: string;
  especialidad: string | null;
  telefono: string | null;
  email: string | null;
  foto_url: string | null;
  biografia: string | null;
  horario_preferido: string | null;
  activo: boolean;
  orden: number;
  created_at?: string;
  updated_at?: string;
}

export function useBarberos(incluirInactivos: boolean = false) {
  const [barberos, setBarberos] = useState<Barbero[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBarberos();

    // Suscripción a cambios en tiempo real
    const channel = supabase
      .channel('barberos-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'barberos' },
        (payload) => {
          console.log('🔄 Cambio detectado en barberos:', payload.eventType, payload);

          if (payload.eventType === 'INSERT') {
            const nuevoBarbero = payload.new as Barbero;
            console.log('➕ Barbero insertado:', nuevoBarbero);
            
            setBarberos(prev => {
              // Evitar duplicados
              const existe = prev.some(b => b.id === nuevoBarbero.id);
              if (existe) {
                console.log('⚠️ Barbero ya existe, ignorando');
                return prev;
              }
              
              // Agregar y ordenar
              const updated = [...prev, nuevoBarbero].sort((a, b) => a.orden - b.orden);
              console.log('✅ Barbero agregado al estado:', updated.length, 'barberos');
              return updated;
            });
          } else if (payload.eventType === 'UPDATE') {
            const barberoActualizado = payload.new as Barbero;
            console.log('📝 Barbero actualizado:', barberoActualizado);
            
            setBarberos(prev => {
              const updated = prev
                .map(b => b.id === barberoActualizado.id ? barberoActualizado : b)
                .sort((a, b) => a.orden - b.orden);
              console.log('✅ Estado actualizado');
              return updated;
            });
          } else if (payload.eventType === 'DELETE') {
            const idEliminado = payload.old.id;
            console.log('🗑️ Barbero eliminado:', idEliminado);
            
            setBarberos(prev => {
              const updated = prev.filter(b => b.id !== idEliminado);
              console.log('✅ Barbero eliminado del estado:', updated.length, 'restantes');
              return updated;
            });
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 Canal barberos-changes:', status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [incluirInactivos]);

  const fetchBarberos = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('barberos')
        .select('*')
        .order('orden', { ascending: true });

      // Filtrar por activos si se requiere
      if (!incluirInactivos) {
        query = query.eq('activo', true);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      console.log(`📋 ${data?.length || 0} barberos cargados (incluirInactivos: ${incluirInactivos})`);
      setBarberos(data || []);
      setError(null);
    } catch (err: any) {
      console.error('❌ Error al cargar barberos:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const agregarBarbero = async (barbero: Omit<Barbero, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      console.log('➕ Agregando barbero:', barbero);

      const { data, error: insertError } = await supabase
        .from('barberos')
        .insert([barbero])
        .select()
        .single();

      if (insertError) throw insertError;

      console.log('✅ Barbero agregado exitosamente:', data);

      // Actualización optimista
      setBarberos(prev => {
        const updated = [...prev, data as Barbero].sort((a, b) => a.orden - b.orden);
        console.log('📋 Lista actualizada:', updated.length, 'barberos');
        return updated;
      });

      return data;
    } catch (err: any) {
      console.error('❌ Error al agregar barbero:', err);
      throw err;
    }
  };

  const actualizarBarbero = async (id: string, updates: Partial<Barbero>) => {
    try {
      console.log('📝 Actualizando barbero:', id, updates);

      // Actualización optimista
      const barberoOriginal = barberos.find(b => b.id === id);
      setBarberos(prev =>
        prev
          .map(b => b.id === id ? { ...b, ...updates } : b)
          .sort((a, b) => a.orden - b.orden)
      );

      const { data, error: updateError } = await supabase
        .from('barberos')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) {
        // Revertir en caso de error
        console.error('❌ Error al actualizar, revirtiendo...');
        if (barberoOriginal) {
          setBarberos(prev =>
            prev
              .map(b => b.id === id ? barberoOriginal : b)
              .sort((a, b) => a.orden - b.orden)
          );
        }
        throw updateError;
      }

      console.log('✅ Barbero actualizado exitosamente');
      return data;
    } catch (err: any) {
      console.error('❌ Error al actualizar barbero:', err);
      throw err;
    }
  };

  const eliminarBarbero = async (id: string) => {
    try {
      console.log('🗑️ Eliminando barbero:', id);

      // Actualización optimista
      const barberoEliminado = barberos.find(b => b.id === id);
      setBarberos(prev => prev.filter(b => b.id !== id));

      const { error: deleteError } = await supabase
        .from('barberos')
        .delete()
        .eq('id', id);

      if (deleteError) {
        console.error('❌ Error al eliminar, revirtiendo...');
        // Revertir
        if (barberoEliminado) {
          setBarberos(prev => [...prev, barberoEliminado].sort((a, b) => a.orden - b.orden));
        }
        throw deleteError;
      }

      console.log('✅ Barbero eliminado exitosamente');
      return true;
    } catch (err: any) {
      console.error('❌ Error al eliminar barbero:', err);
      throw err;
    }
  };

  const toggleActivo = async (id: string, activo: boolean) => {
    try {
      return await actualizarBarbero(id, { activo });
    } catch (err: any) {
      console.error('❌ Error al cambiar estado activo:', err);
      throw err;
    }
  };

  const reordenar = async (barberoId: string, nuevoOrden: number) => {
    try {
      console.log(`🔄 Reordenando barbero ${barberoId} a posición ${nuevoOrden}`);
      return await actualizarBarbero(barberoId, { orden: nuevoOrden });
    } catch (err: any) {
      console.error('❌ Error al reordenar:', err);
      throw err;
    }
  };

  return {
    barberos,
    loading,
    error,
    agregarBarbero,
    actualizarBarbero,
    eliminarBarbero,
    toggleActivo,
    reordenar,
    refetch: fetchBarberos
  };
}
