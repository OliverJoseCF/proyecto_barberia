-- ============================================
-- REPORTES DE CITAS - CONSULTAS ÚTILES
-- ============================================

-- ============================================
-- CITAS DE HOY
-- ============================================

-- Todas las citas de hoy
SELECT 
    id,
    fecha,
    hora,
    cliente_nombre,
    cliente_telefono,
    barbero,
    servicio,
    estado,
    created_at
FROM citas
WHERE TO_DATE(fecha, 'YYYY-MM-DD') = CURRENT_DATE
ORDER BY hora ASC;

-- Citas de hoy por barbero
SELECT 
    barbero,
    COUNT(*) as total_citas,
    COUNT(*) FILTER (WHERE estado = 'confirmada') as confirmadas,
    COUNT(*) FILTER (WHERE estado = 'pendiente') as pendientes
FROM citas
WHERE TO_DATE(fecha, 'YYYY-MM-DD') = CURRENT_DATE
GROUP BY barbero;

-- ============================================
-- CITAS POR RANGO DE FECHAS
-- ============================================

-- Citas de esta semana
SELECT 
    fecha,
    hora,
    cliente_nombre,
    barbero,
    servicio,
    estado
FROM citas
WHERE TO_DATE(fecha, 'YYYY-MM-DD') >= DATE_TRUNC('week', CURRENT_DATE)
  AND TO_DATE(fecha, 'YYYY-MM-DD') < DATE_TRUNC('week', CURRENT_DATE) + INTERVAL '7 days'
ORDER BY fecha, hora;

-- Citas de este mes
SELECT 
    fecha,
    COUNT(*) as total,
    COUNT(*) FILTER (WHERE estado = 'completada') as completadas,
    COUNT(*) FILTER (WHERE estado = 'cancelada') as canceladas
FROM citas
WHERE TO_DATE(fecha, 'YYYY-MM-DD') >= DATE_TRUNC('month', CURRENT_DATE)
  AND TO_DATE(fecha, 'YYYY-MM-DD') < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'
GROUP BY fecha
ORDER BY fecha;

-- Citas entre dos fechas específicas
SELECT 
    fecha,
    hora,
    cliente_nombre,
    cliente_telefono,
    barbero,
    servicio,
    estado
FROM citas
WHERE TO_DATE(fecha, 'YYYY-MM-DD') BETWEEN '2025-10-01' AND '2025-10-31'
ORDER BY fecha, hora;

-- ============================================
-- BUSCAR CITAS ESPECÍFICAS
-- ============================================

-- Buscar por nombre de cliente (parcial)
SELECT *
FROM citas
WHERE LOWER(cliente_nombre) LIKE LOWER('%juan%')
ORDER BY fecha DESC
LIMIT 20;

-- Buscar por teléfono
SELECT *
FROM citas
WHERE cliente_telefono = '5512345678'
ORDER BY fecha DESC;

-- Buscar por email
SELECT *
FROM citas
WHERE LOWER(cliente_email) LIKE LOWER('%email%')
ORDER BY fecha DESC;

-- ============================================
-- CITAS PENDIENTES
-- ============================================

-- Todas las citas pendientes futuras
SELECT 
    fecha,
    hora,
    cliente_nombre,
    cliente_telefono,
    barbero,
    servicio
FROM citas
WHERE estado = 'pendiente'
  AND TO_DATE(fecha, 'YYYY-MM-DD') >= CURRENT_DATE
ORDER BY fecha, hora;

-- Citas pendientes por barbero
SELECT 
    barbero,
    COUNT(*) as total_pendientes,
    MIN(fecha) as primera_fecha,
    MAX(fecha) as ultima_fecha
FROM citas
WHERE estado = 'pendiente'
  AND TO_DATE(fecha, 'YYYY-MM-DD') >= CURRENT_DATE
GROUP BY barbero;

-- ============================================
-- ÚLTIMAS CITAS CREADAS
-- ============================================

SELECT 
    id,
    fecha,
    hora,
    cliente_nombre,
    barbero,
    servicio,
    estado,
    created_at
FROM citas
ORDER BY created_at DESC
LIMIT 20;

-- ============================================
-- CITAS DUPLICADAS (mismo cliente, mismo día)
-- ============================================

SELECT 
    cliente_nombre,
    cliente_telefono,
    fecha,
    COUNT(*) as cantidad
FROM citas
WHERE TO_DATE(fecha, 'YYYY-MM-DD') >= CURRENT_DATE
GROUP BY cliente_nombre, cliente_telefono, fecha
HAVING COUNT(*) > 1;
