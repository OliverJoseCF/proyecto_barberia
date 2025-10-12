-- ============================================
-- LIMPIEZA DE CITAS ANTIGUAS Y CANCELADAS
-- ============================================
-- USO: Eliminar citas viejas para liberar espacio
-- PRECAUCIÓN: ⚠️ Esto elimina datos permanentemente
-- ============================================

-- PASO 1: Ver cuántas citas se eliminarán (SIEMPRE EJECUTAR PRIMERO)
SELECT 
    COUNT(*) as total_a_eliminar,
    estado,
    DATE_PART('year', TO_DATE(fecha, 'YYYY-MM-DD')) as año
FROM citas
WHERE TO_DATE(fecha, 'YYYY-MM-DD') < CURRENT_DATE - INTERVAL '6 months'
  AND estado IN ('cancelada', 'completada')
GROUP BY estado, año
ORDER BY año DESC;

-- PASO 2: Ver las citas específicas que se eliminarán
SELECT 
    id,
    fecha,
    estado,
    cliente_nombre,
    barbero,
    servicio
FROM citas
WHERE TO_DATE(fecha, 'YYYY-MM-DD') < CURRENT_DATE - INTERVAL '6 months'
  AND estado IN ('cancelada', 'completada')
ORDER BY fecha DESC
LIMIT 50;

-- PASO 3: ⚠️ ELIMINAR (descomentar solo cuando estés SEGURO)
/*
DELETE FROM citas
WHERE TO_DATE(fecha, 'YYYY-MM-DD') < CURRENT_DATE - INTERVAL '6 months'
  AND estado IN ('cancelada', 'completada');
*/

-- ============================================
-- VARIANTES ÚTILES:
-- ============================================

-- Eliminar solo canceladas mayores a 1 año
/*
DELETE FROM citas
WHERE TO_DATE(fecha, 'YYYY-MM-DD') < CURRENT_DATE - INTERVAL '1 year'
  AND estado = 'cancelada';
*/

-- Eliminar solo completadas mayores a 2 años
/*
DELETE FROM citas
WHERE TO_DATE(fecha, 'YYYY-MM-DD') < CURRENT_DATE - INTERVAL '2 years'
  AND estado = 'completada';
*/

-- Eliminar citas de un barbero específico (antiguas)
/*
DELETE FROM citas
WHERE TO_DATE(fecha, 'YYYY-MM-DD') < CURRENT_DATE - INTERVAL '1 year'
  AND barbero = 'Nombre del Barbero'
  AND estado = 'cancelada';
*/
