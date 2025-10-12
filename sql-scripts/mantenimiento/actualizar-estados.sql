-- ============================================
-- ACTUALIZACIÓN MASIVA DE ESTADOS DE CITAS
-- ============================================
-- USO: Cambiar estado de múltiples citas
-- ============================================

-- Ver citas pendientes de fechas pasadas
SELECT 
    id,
    fecha,
    hora,
    cliente_nombre,
    barbero,
    estado
FROM citas
WHERE estado = 'pendiente'
  AND TO_DATE(fecha, 'YYYY-MM-DD') < CURRENT_DATE
ORDER BY fecha DESC;

-- ============================================
-- MARCAR COMO COMPLETADAS
-- ============================================

-- Completar citas confirmadas de ayer
/*
UPDATE citas
SET estado = 'completada'
WHERE estado = 'confirmada'
  AND TO_DATE(fecha, 'YYYY-MM-DD') = CURRENT_DATE - INTERVAL '1 day';
*/

-- Completar citas específicas por barbero
/*
UPDATE citas
SET estado = 'completada'
WHERE estado = 'confirmada'
  AND barbero = 'Angel Ramirez'
  AND TO_DATE(fecha, 'YYYY-MM-DD') = '2025-10-11';
*/

-- ============================================
-- MARCAR COMO CANCELADAS
-- ============================================

-- Cancelar citas pendientes de hace más de 7 días
/*
UPDATE citas
SET estado = 'cancelada'
WHERE estado = 'pendiente'
  AND TO_DATE(fecha, 'YYYY-MM-DD') < CURRENT_DATE - INTERVAL '7 days';
*/

-- ============================================
-- MARCAR COMO CONFIRMADAS
-- ============================================

-- Confirmar todas las pendientes de hoy
/*
UPDATE citas
SET estado = 'confirmada'
WHERE estado = 'pendiente'
  AND TO_DATE(fecha, 'YYYY-MM-DD') = CURRENT_DATE;
*/

-- Confirmar citas específicas de un cliente
/*
UPDATE citas
SET estado = 'confirmada'
WHERE cliente_telefono = '5512345678'
  AND estado = 'pendiente';
*/

-- ============================================
-- CAMBIO DE BARBERO
-- ============================================

-- Reasignar citas de un barbero a otro
/*
UPDATE citas
SET barbero = 'Nuevo Barbero'
WHERE barbero = 'Barbero Anterior'
  AND TO_DATE(fecha, 'YYYY-MM-DD') >= CURRENT_DATE
  AND estado != 'cancelada';
*/
