import { useState, useEffect } from 'react';

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

// Simulación de citas ocupadas (esto vendría de la base de datos)
const CITAS_OCUPADAS = [
  { fecha: '2025-10-08', hora: '10:00', barbero: 'Ángel Ramírez' },
  { fecha: '2025-10-08', hora: '11:30', barbero: 'Emiliano Vega' },
  { fecha: '2025-10-08', hora: '14:00', barbero: 'Ángel Ramírez' },
  { fecha: '2025-10-09', hora: '09:00', barbero: 'Emiliano Vega' },
  { fecha: '2025-10-09', hora: '15:30', barbero: 'Ángel Ramírez' },
];

export const useAvailability = () => {
  const [loading, setLoading] = useState(false);
  const [availabilityData, setAvailabilityData] = useState<AvailabilityData | null>(null);

  const checkAvailability = async (fecha: string, barbero: string) => {
    if (!fecha || !barbero) {
      setAvailabilityData(null);
      return;
    }

    setLoading(true);
    
    // Simular llamada a API
    await new Promise(resolve => setTimeout(resolve, 500));
    
    try {
      // Horarios disponibles por defecto
      const horariosBase = [
        '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
        '12:00', '12:30', '14:00', '14:30', '15:00', '15:30',
        '16:00', '16:30', '17:00', '17:30', '18:00', '18:30'
      ];

      // Verificar qué horarios están ocupados
      const horariosConDisponibilidad: TimeSlot[] = horariosBase.map(hora => {
        const estaOcupado = CITAS_OCUPADAS.some(cita => 
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

  const isTimeSlotAvailable = (fecha: string, hora: string, barbero: string): boolean => {
    return !CITAS_OCUPADAS.some(cita => 
      cita.fecha === fecha && 
      cita.hora === hora && 
      cita.barbero === barbero
    );
  };

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