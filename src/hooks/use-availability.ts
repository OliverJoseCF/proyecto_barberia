import { useState } from 'react';
import { supabase, TABLES, obtenerHorariosDisponibles, verificarDisponibilidadOptimizada } from '@/lib/supabase';
import { useHorarios } from './use-horarios';
import { 
  obtenerDiaSemanaLocal, 
  fechaStringADateLocal, 
  obtenerNombreDia,
  obtenerFechaHoyLocal,
  obtenerMinutosActualesLocal,
  esFechaHoy,
  logInfoZonaHoraria
} from '@/lib/dateUtils';

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
  
  // Obtener configuración de horarios dinámicos
  const { horarios, diasFestivos, configuracion } = useHorarios();

  // ============================================
  // HELPER: Verificar si una fecha es día festivo
  // ============================================
  const esDiaFestivo = (fecha: string): boolean => {
    const fechaObj = fechaStringADateLocal(fecha);
    
    return diasFestivos.some(festivo => {
      const festivoObj = fechaStringADateLocal(festivo.fecha);
      
      if (festivo.recurrente) {
        // Para festivos recurrentes, solo comparar mes y día
        return festivoObj.getMonth() === fechaObj.getMonth() && 
               festivoObj.getDate() === fechaObj.getDate();
      } else {
        // Para festivos específicos, comparar fecha completa
        return festivo.fecha === fecha;
      }
    });
  };

  // ============================================
  // HELPER: Generar horarios disponibles según configuración
  // ============================================
  const generarHorariosDisponibles = (fecha: string): string[] => {
    console.log('📅 Generando horarios para:', fecha);
    
    // Log de información de zona horaria (solo en desarrollo)
    if (import.meta.env.DEV) {
      logInfoZonaHoraria();
    }
    
    // Verificar si es día festivo
    if (esDiaFestivo(fecha)) {
      console.log('🚫 Fecha bloqueada: Día festivo');
      return [];
    }

    // Obtener día de la semana usando zona horaria local
    const diaSemana = obtenerDiaSemanaLocal(fecha);
    const nombreDia = obtenerNombreDia(fecha);

    console.log(`📆 Día de la semana: ${nombreDia} (${diaSemana})`);
    console.log('📋 Horarios configurados:', horarios);

    // Buscar configuración del día
    const horarioDelDia = horarios.find(h => h.dia_semana === diaSemana);

    console.log('🔍 Horario encontrado para el día:', horarioDelDia);

    if (!horarioDelDia || !horarioDelDia.activo) {
      console.log(`🚫 Día cerrado: ${nombreDia}`);
      return [];
    }

    // Generar slots según intervalo configurado
    const intervalo = configuracion.intervalo_citas_minutos;
    console.log(`⏱️ Intervalo configurado: ${intervalo} minutos`);
    
    const slots: string[] = [];

    // Parsear horarios
    const [horaApertura, minutoApertura] = horarioDelDia.hora_apertura.split(':').map(Number);
    const [horaCierre, minutoCierre] = horarioDelDia.hora_cierre.split(':').map(Number);
    
    console.log(`🕐 Horario del día: ${horarioDelDia.hora_apertura} - ${horarioDelDia.hora_cierre}`);
    
    let horaActual = horaApertura * 60 + minutoApertura; // Convertir a minutos
    const minutoCierreTotal = horaCierre * 60 + minutoCierre;

    // Verificar si hay pausa
    let pausaInicio = 0;
    let pausaFin = 0;
    if (horarioDelDia.pausa_inicio && horarioDelDia.pausa_fin) {
      const [hPI, mPI] = horarioDelDia.pausa_inicio.split(':').map(Number);
      const [hPF, mPF] = horarioDelDia.pausa_fin.split(':').map(Number);
      pausaInicio = hPI * 60 + mPI;
      pausaFin = hPF * 60 + mPF;
      console.log(`⏸️ Pausa configurada: ${horarioDelDia.pausa_inicio} - ${horarioDelDia.pausa_fin}`);
    }

    // Generar slots
    while (horaActual < minutoCierreTotal) {
      // Saltar horarios en pausa
      if (pausaInicio > 0 && horaActual >= pausaInicio && horaActual < pausaFin) {
        horaActual = pausaFin; // Saltar al fin de la pausa
        continue;
      }

      // IMPORTANTE: Solo agregar el slot si NO excede la hora de cierre
      // El slot debe poder EMPEZAR antes del cierre (no necesariamente terminar)
      if (horaActual < minutoCierreTotal) {
        // Formatear hora
        const hora = Math.floor(horaActual / 60);
        const minuto = horaActual % 60;
        const horaFormateada = `${hora.toString().padStart(2, '0')}:${minuto.toString().padStart(2, '0')}`;
        
        slots.push(horaFormateada);
      }
      
      horaActual += intervalo;
    }

    console.log(`✅ ${slots.length} slots generados:`, slots);
    return slots;
  };

  // ============================================
  // HELPER: Validar anticipación mínima y máxima
  // ============================================
  const validarAnticipacion = (fecha: string): { valido: boolean; mensaje?: string } => {
    const hoy = obtenerFechaHoyLocal();
    
    console.log('⏱️ Validación de anticipación:', {
      fechaHoy: hoy,
      fechaCita: fecha,
      minimaRequerida: configuracion.anticipacion_minima_horas,
      maximaPermitida: configuracion.anticipacion_maxima_dias * 24
    });
    
    // Si es HOY, la validación de anticipación se hará a nivel de horario individual
    // (en el filtro de horarios pasados), así que permitimos la fecha
    if (fecha === hoy) {
      console.log('✅ Es hoy - validación de anticipación se hará por horario');
      return { valido: true };
    }
    
    // Para fechas futuras, validar anticipación en días
    const fechaCita = fechaStringADateLocal(fecha);
    const fechaHoy = fechaStringADateLocal(hoy);
    const diferenciaMs = fechaCita.getTime() - fechaHoy.getTime();
    const diferenciaHoras = diferenciaMs / (1000 * 60 * 60);
    const diferenciaDias = Math.ceil(diferenciaHoras / 24);
    
    console.log('📊 Diferencia calculada:', {
      diferenciaHoras: diferenciaHoras.toFixed(2),
      diferenciaDias
    });
    
    // Validar anticipación máxima
    if (diferenciaDias > configuracion.anticipacion_maxima_dias) {
      return {
        valido: false,
        mensaje: `Solo puedes agendar hasta ${configuracion.anticipacion_maxima_dias} días por adelantado`
      };
    }

    return { valido: true };
  };

  // ============================================
  // FUNCIÓN PRINCIPAL: Verificar disponibilidad con horarios dinámicos
  // ============================================
  const checkAvailability = async (fecha: string, barbero: string) => {
    if (!fecha || !barbero) {
      setAvailabilityData(null);
      return;
    }

    setLoading(true);
    
    try {
      console.log('🔄 Consultando disponibilidad con horarios dinámicos...');
      
      // Usar SIEMPRE el método con horarios dinámicos
      await checkAvailabilityTraditional(fecha, barbero);
    } catch (error) {
      console.error('Error checking availability:', error);
      setAvailabilityData(null);
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // MÉTODO TRADICIONAL: Para retrocompatibilidad (AHORA USA HORARIOS DINÁMICOS)
  // ============================================
  const checkAvailabilityTraditional = async (fecha: string, barbero: string) => {
    try {
      // Validar anticipación
      const validacion = validarAnticipacion(fecha);
      if (!validacion.valido) {
        console.warn('⚠️', validacion.mensaje);
        setAvailabilityData({
          fecha,
          barbero,
          horarios: []
        });
        return;
      }

      // Generar horarios disponibles según configuración dinámica
      const horariosBase = generarHorariosDisponibles(fecha);

      if (horariosBase.length === 0) {
        // Día cerrado o festivo
        setAvailabilityData({
          fecha,
          barbero,
          horarios: []
        });
        return;
      }

      // Si es hoy, filtrar horarios que ya pasaron Y aplicar anticipación mínima
      let horariosFiltrados = horariosBase;
      if (esFechaHoy(fecha)) {
        const minutosActuales = obtenerMinutosActualesLocal();
        const minutosAnticipacion = configuracion.anticipacion_minima_horas * 60;
        const minutosMinimos = minutosActuales + minutosAnticipacion;
        
        console.log(`⏰ Es hoy, filtrando horarios. Hora actual: ${Math.floor(minutosActuales / 60)}:${String(minutosActuales % 60).padStart(2, '0')}`);
        console.log(`⏱️ Anticipación mínima: ${configuracion.anticipacion_minima_horas} horas (${minutosAnticipacion} minutos)`);
        console.log(`⏰ Horarios válidos: después de ${Math.floor(minutosMinimos / 60)}:${String(minutosMinimos % 60).padStart(2, '0')}`);
        
        horariosFiltrados = horariosBase.filter(hora => {
          const [horas, minutos] = hora.split(':').map(Number);
          const minutoHorario = horas * 60 + minutos;
          const cumpleAnticipacion = minutoHorario >= minutosMinimos;
          
          if (!cumpleAnticipacion) {
            const razon = minutoHorario <= minutosActuales ? 'ya pasó' : 
                         `anticipación insuficiente (necesita ${configuracion.anticipacion_minima_horas}h)`;
            console.log(`  🚫 Horario ${hora} descartado (${razon})`);
          }
          
          return cumpleAnticipacion;
        });

        console.log(`✅ ${horariosFiltrados.length} horarios disponibles después de filtrar`);
      }

      if (horariosFiltrados.length === 0) {
        console.log('⚠️ No quedan horarios disponibles para hoy');
        setAvailabilityData({
          fecha,
          barbero,
          horarios: []
        });
        return;
      }

      // Consultar citas ocupadas desde Supabase
      const { data: citasData, error: citasError } = await supabase
        .from(TABLES.CITAS)
        .select('fecha, hora, barbero, servicio')
        .eq('fecha', fecha)
        .eq('barbero', barbero)
        .in('estado', ['pendiente', 'confirmada']);

      if (citasError) {
        console.error('Error al consultar disponibilidad:', citasError);
        throw citasError;
      }

      const citasOcupadas = citasData || [];
      console.log(`✅ ${citasOcupadas.length} citas encontradas para ${fecha}`);

      // Consultar información de servicios para obtener duraciones
      const { data: serviciosData, error: serviciosError } = await supabase
        .from(TABLES.SERVICIOS)
        .select('nombre, duracion');

      if (serviciosError) {
        console.warn('⚠️ Error al consultar servicios:', serviciosError);
      }

      // Crear mapa de servicios para búsqueda rápida
      const mapaServicios = new Map<string, number>();
      (serviciosData || []).forEach(servicio => {
        mapaServicios.set(servicio.nombre.toLowerCase(), servicio.duracion);
      });

      console.log(`📋 ${mapaServicios.size} servicios cargados con sus duraciones`);

      // Función helper: calcular todos los slots bloqueados por una cita
      const calcularSlotsOcupados = (horaCita: string, duracionMinutos: number): string[] => {
        const [horas, minutos] = horaCita.split(':').map(Number);
        const minutoInicio = horas * 60 + minutos;
        const intervalo = configuracion.intervalo_citas_minutos;
        const slotsOcupados: string[] = [];

        // Calcular cuántos slots ocupa esta cita
        const numSlots = Math.ceil(duracionMinutos / intervalo);
        
        for (let i = 0; i < numSlots; i++) {
          const minutoSlot = minutoInicio + (i * intervalo);
          const horaSlot = Math.floor(minutoSlot / 60);
          const minutoSlotResto = minutoSlot % 60;
          const slotFormateado = `${String(horaSlot).padStart(2, '0')}:${String(minutoSlotResto).padStart(2, '0')}`;
          slotsOcupados.push(slotFormateado);
        }

        return slotsOcupados;
      };

      // Calcular TODOS los horarios bloqueados considerando la duración de cada servicio
      const horariosBloquedos = new Set<string>();
      
      citasOcupadas.forEach(cita => {
        // Buscar duración del servicio en el mapa
        const duracion = mapaServicios.get(cita.servicio.toLowerCase()) || configuracion.intervalo_citas_minutos;
        const slotsOcupados = calcularSlotsOcupados(cita.hora, duracion);
        
        console.log(`📅 Cita ${cita.hora} - Servicio: "${cita.servicio}" - Duración: ${duracion}min - Bloquea slots: ${slotsOcupados.join(', ')}`);
        
        slotsOcupados.forEach(slot => horariosBloquedos.add(slot));
      });

      console.log(`🚫 Total de slots bloqueados: ${horariosBloquedos.size}`, Array.from(horariosBloquedos));

      // Verificar qué horarios están ocupados
      const horariosConDisponibilidad: TimeSlot[] = horariosFiltrados.map(hora => {
        const estaOcupado = horariosBloquedos.has(hora);

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
    getAvailableSlots,
    esDiaFestivo,
    validarAnticipacion,
    configuracion // Exportar configuración para uso externo
  };
};