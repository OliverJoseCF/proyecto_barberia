import { useState } from 'react';
import { supabase, TABLES, obtenerHorariosDisponibles, verificarDisponibilidadOptimizada } from '@/lib/supabase';

interface TimeSlot {
  hora: string;
  disponible: boolean;
  barbero?: string;
}

interface AvailabilityData {
  fecha: string;
  barbero: string;
  horarios: TimeSlot[];
}

export const useAvailability = () => {
  const [loading, setLoading] = useState(false);
  const [availabilityData, setAvailabilityData] = useState<AvailabilityData | null>(null);

  // ============================================
  // FUNCIÓN PRINCIPAL: Verificar disponibilidad (OPTIMIZADA)
  // ============================================
  const checkAvailability = async (fecha: string, barbero: string) => {
    if (!fecha || !barbero) {
      setAvailabilityData(null);
      return;
    }

    setLoading(true);
    
    try {
      console.log('🔄 Consultando disponibilidad OPTIMIZADA desde PostgreSQL...');
      
      // Usar la función optimizada de PostgreSQL
      const horariosData = await obtenerHorariosDisponibles(fecha, barbero);
      
      if (horariosData && horariosData.length > 0) {
        // Usar datos de la función de PostgreSQL
        const horariosConDisponibilidad: TimeSlot[] = horariosData.map(slot => ({
          hora: slot.hora,
          disponible: slot.disponible,
          barbero: !slot.disponible ? barbero : undefined
        }));

        console.log(`✅ Horarios obtenidos con función PostgreSQL optimizada`);
        
        setAvailabilityData({
          fecha,
          barbero,
          horarios: horariosConDisponibilidad
        });
      } else {
        // Fallback al método anterior si la función no existe aún
        console.log('⚠️ Función PostgreSQL no disponible, usando método tradicional...');
        await checkAvailabilityTraditional(fecha, barbero);
      }
    } catch (error) {
      console.error('Error checking availability:', error);
      // Fallback al método tradicional en caso de error
      await checkAvailabilityTraditional(fecha, barbero);
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // MÉTODO TRADICIONAL: Para retrocompatibilidad
  // ============================================
  const checkAvailabilityTraditional = async (fecha: string, barbero: string) => {
    try {
      // Horarios disponibles por defecto
      const horariosBase = [
        '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
        '12:00', '12:30', '14:00', '14:30', '15:00', '15:30',
        '16:00', '16:30', '17:00', '17:30', '18:00', '18:30'
      ];

      // Consultar citas ocupadas desde Supabase
      const { data, error } = await supabase
        .from(TABLES.CITAS)
        .select('fecha, hora, barbero')
        .eq('fecha', fecha)
        .eq('barbero', barbero)
        .in('estado', ['pendiente', 'confirmada']);

      if (error) {
        console.error('Error al consultar disponibilidad:', error);
        throw error;
      }

      const citasOcupadas = data || [];
      console.log(`✅ ${citasOcupadas.length} citas encontradas (método tradicional)`);

      // Verificar qué horarios están ocupados
      const horariosConDisponibilidad: TimeSlot[] = horariosBase.map(hora => {
        const estaOcupado = citasOcupadas.some(cita => 
          cita.fecha === fecha && 
          cita.hora === hora && 
          cita.barbero === barbero
        );

        return {
          hora,
          disponible: !estaOcupado,
          barbero: estaOcupado ? barbero : undefined
        };
      });

      setAvailabilityData({
        fecha,
        barbero,
        horarios: horariosConDisponibilidad
      });
    } catch (error) {
      console.error('Error en método tradicional:', error);
      setAvailabilityData(null);
    }
  };

  // ============================================
  // HELPER: Verificar si un horario específico está disponible (OPTIMIZADA)
  // ============================================
  const isTimeSlotAvailable = async (fecha: string, hora: string, barbero: string): Promise<boolean> => {
    try {
      // Intentar usar la función optimizada primero
      const disponible = await verificarDisponibilidadOptimizada(fecha, hora, barbero);
      return disponible;
    } catch (error) {
      console.warn('Función optimizada no disponible, usando consulta tradicional');
      // Fallback a consulta tradicional
      try {
        const { data, error: queryError } = await supabase
          .from(TABLES.CITAS)
          .select('id')
          .eq('fecha', fecha)
          .eq('hora', hora)
          .eq('barbero', barbero)
          .in('estado', ['pendiente', 'confirmada'])
          .limit(1);

        if (queryError) throw queryError;
        return !data || data.length === 0;
      } catch (fallbackError) {
        console.error('Error verificando disponibilidad:', fallbackError);
        return false;
      }
    }
  };

  // ============================================
  // HELPER: Obtener horarios disponibles
  // ============================================
  const getAvailableSlots = (fecha: string, barbero: string): string[] => {
    if (!availabilityData || availabilityData.fecha !== fecha || availabilityData.barbero !== barbero) {
      return [];
    }
    
    return availabilityData.horarios
      .filter(slot => slot.disponible)
      .map(slot => slot.hora);
  };

  return {
    loading,
    availabilityData,
    checkAvailability,
    isTimeSlotAvailable,
    getAvailableSlots
  };
};