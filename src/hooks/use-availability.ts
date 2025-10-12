import { useState } from 'react';
import { supabase, TABLES } from '@/lib/supabase';

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
  // FUNCIÓN PRINCIPAL: Verificar disponibilidad
  // ============================================
  const checkAvailability = async (fecha: string, barbero: string) => {
    if (!fecha || !barbero) {
      setAvailabilityData(null);
      return;
    }

    setLoading(true);
    
    try {
      // Horarios disponibles por defecto
      const horariosBase = [
        '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
        '12:00', '12:30', '14:00', '14:30', '15:00', '15:30',
        '16:00', '16:30', '17:00', '17:30', '18:00', '18:30'
      ];

      // Consultar citas ocupadas desde Supabase
      console.log('🔄 Consultando disponibilidad desde Supabase...');
      
      const { data, error } = await supabase
        .from(TABLES.CITAS)
        .select('fecha, hora, barbero')
        .eq('fecha', fecha)
        .eq('barbero', barbero)
        .in('estado', ['pendiente', 'confirmada']); // Solo citas activas

      if (error) {
        console.error('Error al consultar disponibilidad:', error);
        throw error;
      }

      const citasOcupadas = data || [];
      console.log(`✅ ${citasOcupadas.length} citas encontradas en Supabase`);

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
      console.error('Error checking availability:', error);
      setAvailabilityData(null);
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // HELPER: Verificar si un horario específico está disponible
  // ============================================
  const isTimeSlotAvailable = async (fecha: string, hora: string, barbero: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from(TABLES.CITAS)
        .select('id')
        .eq('fecha', fecha)
        .eq('hora', hora)
        .eq('barbero', barbero)
        .in('estado', ['pendiente', 'confirmada'])
        .limit(1);

      if (error) throw error;
      return !data || data.length === 0;
    } catch (error) {
      console.error('Error verificando disponibilidad:', error);
      return false;
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