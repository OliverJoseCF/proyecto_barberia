/**
 * Utilidades para manejo correcto de fechas y horas
 * Todas las funciones usan la zona horaria local del usuario
 */

/**
 * Obtiene la fecha actual en formato YYYY-MM-DD según la zona horaria local
 * @returns Fecha actual como string en formato YYYY-MM-DD
 */
export const obtenerFechaHoyLocal = (): string => {
  const ahora = new Date();
  const año = ahora.getFullYear();
  const mes = String(ahora.getMonth() + 1).padStart(2, '0');
  const dia = String(ahora.getDate()).padStart(2, '0');
  
  return `${año}-${mes}-${dia}`;
};

/**
 * Obtiene la hora actual en minutos desde medianoche (zona horaria local)
 * @returns Minutos desde las 00:00 (ej: 14:30 = 870 minutos)
 */
export const obtenerMinutosActualesLocal = (): number => {
  const ahora = new Date();
  return ahora.getHours() * 60 + ahora.getMinutes();
};

/**
 * Obtiene el día de la semana para una fecha (0=Domingo, 1=Lunes, ..., 6=Sábado)
 * Usa zona horaria local para evitar desfases
 * @param fecha - Fecha en formato YYYY-MM-DD
 * @returns Número del día de la semana (0-6)
 */
export const obtenerDiaSemanaLocal = (fecha: string): number => {
  // Parsear manualmente para evitar conversión UTC
  const [año, mes, dia] = fecha.split('-').map(Number);
  const fechaLocal = new Date(año, mes - 1, dia);
  
  return fechaLocal.getDay();
};

/**
 * Convierte una fecha YYYY-MM-DD a objeto Date en zona horaria local
 * @param fecha - Fecha en formato YYYY-MM-DD
 * @returns Objeto Date configurado a medianoche en zona horaria local
 */
export const fechaStringADateLocal = (fecha: string): Date => {
  const [año, mes, dia] = fecha.split('-').map(Number);
  return new Date(año, mes - 1, dia);
};

/**
 * Verifica si una fecha es hoy (comparación en zona horaria local)
 * @param fecha - Fecha en formato YYYY-MM-DD
 * @returns true si la fecha es hoy
 */
export const esFechaHoy = (fecha: string): boolean => {
  return fecha === obtenerFechaHoyLocal();
};

/**
 * Verifica si una fecha es futura (comparación en zona horaria local)
 * @param fecha - Fecha en formato YYYY-MM-DD
 * @returns true si la fecha es mayor a hoy
 */
export const esFechaFutura = (fecha: string): boolean => {
  return fecha > obtenerFechaHoyLocal();
};

/**
 * Verifica si una fecha es pasada (comparación en zona horaria local)
 * @param fecha - Fecha en formato YYYY-MM-DD
 * @returns true si la fecha es menor a hoy
 */
export const esFechaPasada = (fecha: string): boolean => {
  return fecha < obtenerFechaHoyLocal();
};

/**
 * Obtiene fecha y hora actual en zona horaria local
 * @returns Objeto con fecha (YYYY-MM-DD), hora (HH:MM), y minutos desde medianoche
 */
export const obtenerFechaHoraActual = () => {
  const ahora = new Date();
  
  const año = ahora.getFullYear();
  const mes = String(ahora.getMonth() + 1).padStart(2, '0');
  const dia = String(ahora.getDate()).padStart(2, '0');
  const hora = String(ahora.getHours()).padStart(2, '0');
  const minutos = String(ahora.getMinutes()).padStart(2, '0');
  
  return {
    fecha: `${año}-${mes}-${dia}`,
    hora: `${hora}:${minutos}`,
    minutos: ahora.getHours() * 60 + ahora.getMinutes(),
    timestamp: ahora.getTime(),
  };
};

/**
 * Compara dos fechas (formato YYYY-MM-DD) sin considerar hora
 * @param fecha1 - Primera fecha
 * @param fecha2 - Segunda fecha
 * @returns -1 si fecha1 < fecha2, 0 si iguales, 1 si fecha1 > fecha2
 */
export const compararFechas = (fecha1: string, fecha2: string): number => {
  if (fecha1 < fecha2) return -1;
  if (fecha1 > fecha2) return 1;
  return 0;
};

/**
 * Obtiene el nombre del día de la semana en español
 * @param fecha - Fecha en formato YYYY-MM-DD
 * @returns Nombre del día en español
 */
export const obtenerNombreDia = (fecha: string): string => {
  const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const diaSemana = obtenerDiaSemanaLocal(fecha);
  return dias[diaSemana];
};

/**
 * Formatea una fecha para mostrar al usuario (DD/MM/YYYY)
 * @param fecha - Fecha en formato YYYY-MM-DD
 * @returns Fecha formateada DD/MM/YYYY
 */
export const formatearFechaDisplay = (fecha: string): string => {
  const [año, mes, dia] = fecha.split('-');
  return `${dia}/${mes}/${año}`;
};

/**
 * Log de debugging con información de zona horaria
 */
export const logInfoZonaHoraria = () => {
  const ahora = new Date();
  const offsetMinutos = ahora.getTimezoneOffset();
  const offsetHoras = -offsetMinutos / 60;
  
  console.log('🌍 Información de Zona Horaria:');
  console.log('  ⏰ Hora local:', ahora.toLocaleString());
  console.log('  🕐 Hora UTC:', ahora.toISOString());
  console.log('  🌐 Offset UTC:', offsetHoras >= 0 ? `+${offsetHoras}` : offsetHoras, 'horas');
  console.log('  📅 Fecha local (YYYY-MM-DD):', obtenerFechaHoyLocal());
  console.log('  🕒 Minutos desde medianoche:', obtenerMinutosActualesLocal());
};
