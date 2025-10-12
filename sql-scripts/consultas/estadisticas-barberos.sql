-- ============================================
-- ESTADÍSTICAS DE BARBEROS
-- ============================================

-- ============================================
-- RESUMEN GENERAL POR BARBERO
-- ============================================

SELECT 
    barbero,
    COUNT(*) as total_citas,
    COUNT(*) FILTER (WHERE estado = 'completada') as completadas,
    COUNT(*) FILTER (WHERE estado = 'confirmada') as confirmadas,
    COUNT(*) FILTER (WHERE estado = 'pendiente') as pendientes,
    COUNT(*) FILTER (WHERE estado = 'cancelada') as canceladas,
    ROUND(
        COUNT(*) FILTER (WHERE estado = 'completada')::NUMERIC / 
        NULLIF(COUNT(*), 0) * 100, 
        2
    ) as porcentaje_completadas
FROM citas
WHERE TO_DATE(fecha, 'YYYY-MM-DD') >= DATE_TRUNC('month', CURRENT_DATE)
GROUP BY barbero
ORDER BY total_citas DESC;

-- ============================================
-- DESEMPEÑO DEL MES ACTUAL
-- ============================================

SELECT 
    barbero,
    COUNT(*) FILTER (WHERE estado = 'completada') as citas_completadas,
    COUNT(DISTINCT cliente_telefono) as clientes_unicos,
    COUNT(*) FILTER (WHERE estado = 'completada') / 
        NULLIF(EXTRACT(DAY FROM CURRENT_DATE), 0) as promedio_diario
FROM citas
WHERE TO_DATE(fecha, 'YYYY-MM-DD') >= DATE_TRUNC('month', CURRENT_DATE)
  AND TO_DATE(fecha, 'YYYY-MM-DD') <= CURRENT_DATE
GROUP BY barbero
ORDER BY citas_completadas DESC;

-- ============================================
-- SERVICIOS MÁS SOLICITADOS POR BARBERO
-- ============================================

SELECT 
    barbero,
    servicio,
    COUNT(*) as cantidad,
    ROUND(
        COUNT(*)::NUMERIC / 
        SUM(COUNT(*)) OVER (PARTITION BY barbero) * 100, 
        2
    ) as porcentaje
FROM citas
WHERE TO_DATE(fecha, 'YYYY-MM-DD') >= DATE_TRUNC('month', CURRENT_DATE)
  AND estado IN ('completada', 'confirmada')
GROUP BY barbero, servicio
ORDER BY barbero, cantidad DESC;

-- ============================================
-- HORARIOS MÁS OCUPADOS POR BARBERO
-- ============================================

SELECT 
    barbero,
    CASE 
        WHEN CAST(SPLIT_PART(hora, ':', 1) AS INTEGER) BETWEEN 9 AND 11 THEN '09:00-11:00'
        WHEN CAST(SPLIT_PART(hora, ':', 1) AS INTEGER) BETWEEN 11 AND 13 THEN '11:00-13:00'
        WHEN CAST(SPLIT_PART(hora, ':', 1) AS INTEGER) BETWEEN 14 AND 16 THEN '14:00-16:00'
        WHEN CAST(SPLIT_PART(hora, ':', 1) AS INTEGER) BETWEEN 16 AND 18 THEN '16:00-18:00'
        WHEN CAST(SPLIT_PART(hora, ':', 1) AS INTEGER) BETWEEN 18 AND 20 THEN '18:00-20:00'
    END as rango_horario,
    COUNT(*) as total_citas
FROM citas
WHERE TO_DATE(fecha, 'YYYY-MM-DD') >= DATE_TRUNC('month', CURRENT_DATE)
  AND estado != 'cancelada'
  AND hora IS NOT NULL
GROUP BY barbero, rango_horario
HAVING rango_horario IS NOT NULL
ORDER BY barbero, total_citas DESC;

-- ============================================
-- TASA DE CANCELACIÓN POR BARBERO
-- ============================================

SELECT 
    barbero,
    COUNT(*) FILTER (WHERE estado = 'cancelada') as total_canceladas,
    COUNT(*) as total_citas,
    ROUND(
        COUNT(*) FILTER (WHERE estado = 'cancelada')::NUMERIC / 
        NULLIF(COUNT(*), 0) * 100, 
        2
    ) as porcentaje_cancelacion
FROM citas
WHERE TO_DATE(fecha, 'YYYY-MM-DD') >= DATE_TRUNC('month', CURRENT_DATE)
GROUP BY barbero
ORDER BY porcentaje_cancelacion DESC;

-- ============================================
-- CLIENTES FRECUENTES POR BARBERO
-- ============================================

SELECT 
    barbero,
    cliente_nombre,
    cliente_telefono,
    COUNT(*) as total_citas,
    MAX(fecha) as ultima_cita
FROM citas
WHERE estado IN ('completada', 'confirmada')
GROUP BY barbero, cliente_nombre, cliente_telefono
HAVING COUNT(*) >= 3
ORDER BY barbero, total_citas DESC;

-- ============================================
-- COMPARACIÓN ENTRE BARBEROS (ESTE MES VS MES ANTERIOR)
-- ============================================

WITH mes_actual AS (
    SELECT 
        barbero,
        COUNT(*) FILTER (WHERE estado = 'completada') as citas_mes_actual
    FROM citas
    WHERE TO_DATE(fecha, 'YYYY-MM-DD') >= DATE_TRUNC('month', CURRENT_DATE)
    GROUP BY barbero
),
mes_anterior AS (
    SELECT 
        barbero,
        COUNT(*) FILTER (WHERE estado = 'completada') as citas_mes_anterior
    FROM citas
    WHERE TO_DATE(fecha, 'YYYY-MM-DD') >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
      AND TO_DATE(fecha, 'YYYY-MM-DD') < DATE_TRUNC('month', CURRENT_DATE)
    GROUP BY barbero
)
SELECT 
    COALESCE(ma.barbero, mp.barbero) as barbero,
    COALESCE(ma.citas_mes_actual, 0) as mes_actual,
    COALESCE(mp.citas_mes_anterior, 0) as mes_anterior,
    COALESCE(ma.citas_mes_actual, 0) - COALESCE(mp.citas_mes_anterior, 0) as diferencia,
    CASE 
        WHEN mp.citas_mes_anterior > 0 THEN
            ROUND(
                (COALESCE(ma.citas_mes_actual, 0) - COALESCE(mp.citas_mes_anterior, 0))::NUMERIC / 
                mp.citas_mes_anterior * 100, 
                2
            )
        ELSE NULL
    END as porcentaje_cambio
FROM mes_actual ma
FULL OUTER JOIN mes_anterior mp ON ma.barbero = mp.barbero
ORDER BY mes_actual DESC;
