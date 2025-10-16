import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface ImagenGaleria {
  id: string;
  titulo: string;
  descripcion: string | null;
  imagen_url: string;
  categoria: string | null;
  activo: boolean;
  orden: number;
  created_at?: string;
  updated_at?: string;
}

export function useGaleria(incluirInactivos: boolean = false) {
  const [imagenes, setImagenes] = useState<ImagenGaleria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchImagenes();

    // Suscripción a cambios en tiempo real
    const channel = supabase
      .channel('galeria-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'galeria' },
        (payload) => {
          console.log('🔄 Cambio detectado en galería:', payload.eventType, payload);

          if (payload.eventType === 'INSERT') {
            const nuevaImagen = payload.new as ImagenGaleria;
            console.log('➕ Imagen insertada:', nuevaImagen);
            
            setImagenes(prev => {
              // Evitar duplicados
              const existe = prev.some(img => img.id === nuevaImagen.id);
              if (existe) {
                console.log('⚠️ Imagen ya existe, ignorando');
                return prev;
              }
              
              // Agregar y ordenar
              const updated = [...prev, nuevaImagen].sort((a, b) => a.orden - b.orden);
              console.log('✅ Imagen agregada al estado:', updated.length, 'imágenes');
              return updated;
            });
          } else if (payload.eventType === 'UPDATE') {
            const imagenActualizada = payload.new as ImagenGaleria;
            console.log('📝 Imagen actualizada:', imagenActualizada);
            
            setImagenes(prev => {
              const updated = prev
                .map(img => img.id === imagenActualizada.id ? imagenActualizada : img)
                .sort((a, b) => a.orden - b.orden);
              console.log('✅ Estado actualizado');
              return updated;
            });
          } else if (payload.eventType === 'DELETE') {
            const idEliminado = payload.old.id;
            console.log('🗑️ Imagen eliminada:', idEliminado);
            
            setImagenes(prev => {
              const updated = prev.filter(img => img.id !== idEliminado);
              console.log('✅ Imagen eliminada del estado:', updated.length, 'restantes');
              return updated;
            });
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 Canal galeria-changes:', status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [incluirInactivos]);

  const fetchImagenes = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('galeria')
        .select('*')
        .order('orden', { ascending: true });

      // Filtrar por activos si se requiere
      if (!incluirInactivos) {
        query = query.eq('activo', true);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      console.log(`📋 ${data?.length || 0} imágenes cargadas (incluirInactivos: ${incluirInactivos})`);
      setImagenes(data || []);
      setError(null);
    } catch (err: any) {
      console.error('❌ Error al cargar galería:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const agregarImagen = async (imagen: Omit<ImagenGaleria, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      console.log('➕ Agregando imagen a galería:', imagen);

      const { data, error: insertError } = await supabase
        .from('galeria')
        .insert([imagen])
        .select()
        .single();

      if (insertError) throw insertError;

      console.log('✅ Imagen agregada exitosamente:', data);

      // Actualización optimista
      setImagenes(prev => {
        const updated = [...prev, data as ImagenGaleria].sort((a, b) => a.orden - b.orden);
        console.log('📋 Lista actualizada:', updated.length, 'imágenes');
        return updated;
      });

      return data;
    } catch (err: any) {
      console.error('❌ Error al agregar imagen:', err);
      throw err;
    }
  };

  const actualizarImagen = async (id: string, updates: Partial<ImagenGaleria>) => {
    try {
      console.log('📝 Actualizando imagen:', id, updates);

      // Actualización optimista
      const imagenOriginal = imagenes.find(img => img.id === id);
      setImagenes(prev =>
        prev
          .map(img => img.id === id ? { ...img, ...updates } : img)
          .sort((a, b) => a.orden - b.orden)
      );

      const { data, error: updateError } = await supabase
        .from('galeria')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) {
        // Revertir en caso de error
        console.error('❌ Error al actualizar, revirtiendo...');
        if (imagenOriginal) {
          setImagenes(prev =>
            prev
              .map(img => img.id === id ? imagenOriginal : img)
              .sort((a, b) => a.orden - b.orden)
          );
        }
        throw updateError;
      }

      console.log('✅ Imagen actualizada exitosamente');
      return data;
    } catch (err: any) {
      console.error('❌ Error al actualizar imagen:', err);
      throw err;
    }
  };

  const eliminarImagen = async (id: string) => {
    try {
      console.log('🗑️ Eliminando imagen:', id);

      // Actualización optimista
      const imagenEliminada = imagenes.find(img => img.id === id);
      setImagenes(prev => prev.filter(img => img.id !== id));

      const { error: deleteError } = await supabase
        .from('galeria')
        .delete()
        .eq('id', id);

      if (deleteError) {
        console.error('❌ Error al eliminar, revirtiendo...');
        // Revertir
        if (imagenEliminada) {
          setImagenes(prev => [...prev, imagenEliminada].sort((a, b) => a.orden - b.orden));
        }
        throw deleteError;
      }

      console.log('✅ Imagen eliminada exitosamente');
      return true;
    } catch (err: any) {
      console.error('❌ Error al eliminar imagen:', err);
      throw err;
    }
  };

  const toggleActivo = async (id: string, activo: boolean) => {
    try {
      return await actualizarImagen(id, { activo });
    } catch (err: any) {
      console.error('❌ Error al cambiar estado activo:', err);
      throw err;
    }
  };

  const reordenar = async (imagenId: string, nuevoOrden: number) => {
    try {
      console.log(`🔄 Reordenando imagen ${imagenId} a posición ${nuevoOrden}`);
      return await actualizarImagen(imagenId, { orden: nuevoOrden });
    } catch (err: any) {
      console.error('❌ Error al reordenar:', err);
      throw err;
    }
  };

  const filtrarPorCategoria = (categoria: string | null) => {
    if (!categoria) return imagenes;
    return imagenes.filter(img => img.categoria === categoria);
  };

  const obtenerCategorias = (): string[] => {
    const categoriasUnicas = new Set(
      imagenes
        .map(img => img.categoria)
        .filter(cat => cat !== null) as string[]
    );
    return Array.from(categoriasUnicas).sort();
  };

  return {
    imagenes,
    loading,
    error,
    agregarImagen,
    actualizarImagen,
    eliminarImagen,
    toggleActivo,
    reordenar,
    filtrarPorCategoria,
    obtenerCategorias,
    refetch: fetchImagenes
  };
}
