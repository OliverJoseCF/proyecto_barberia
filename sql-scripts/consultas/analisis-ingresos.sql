-- ============================================
-- ANÁLISIS DE INGRESOS
-- ============================================

-- ============================================
-- INGRESOS DEL MES ACTUAL
-- ============================================

SELECT 
    DATE_TRUNC('month', TO_DATE(fecha, 'YYYY-MM-DD')) as mes,
    COUNT(*) FILTER (WHERE estado = 'completada') as citas_completadas,
    SUM(s.precio) FILTER (WHERE c.estado = 'completada') as ingresos_totales,
    ROUND(AVG(s.precio) FILTER (WHERE c.estado = 'completada'), 2) as ticket_promedio
FROM citas c
JOIN servicios s ON c.servicio = s.nombre
WHERE TO_DATE(c.fecha, 'YYYY-MM-DD') >= DATE_TRUNC('month', CURRENT_DATE)
GROUP BY mes;

-- ============================================
-- INGRESOS POR BARBERO (MES ACTUAL)
-- ============================================

SELECT 
    c.barbero,
    COUNT(*) FILTER (WHERE c.estado = 'completada') as citas_completadas,
    SUM(s.precio) FILTER (WHERE c.estado = 'completada') as ingresos_totales,
    ROUND(AVG(s.precio) FILTER (WHERE c.estado = 'completada'), 2) as ticket_promedio
FROM citas c
JOIN servicios s ON c.servicio = s.nombre
WHERE TO_DATE(c.fecha, 'YYYY-MM-DD') >= DATE_TRUNC('month', CURRENT_DATE)
GROUP BY c.barbero
ORDER BY ingresos_totales DESC;

-- ============================================
-- INGRESOS POR SERVICIO (MES ACTUAL)
-- ============================================

SELECT 
    s.nombre as servicio,
    s.categoria,
    s.precio,
    COUNT(*) FILTER (WHERE c.estado = 'completada') as veces_realizado,
    SUM(s.precio) FILTER (WHERE c.estado = 'completada') as ingresos_totales,
    ROUND(
        SUM(s.precio) FILTER (WHERE c.estado = 'completada')::NUMERIC / 
        NULLIF(SUM(SUM(s.precio)) OVER (), 0) * 100, 
        2
    ) as porcentaje_ingresos
FROM servicios s
LEFT JOIN citas c ON s.nombre = c.servicio 
    AND TO_DATE(c.fecha, 'YYYY-MM-DD') >= DATE_TRUNC('month', CURRENT_DATE)
GROUP BY s.nombre, s.categoria, s.precio
HAVING COUNT(*) FILTER (WHERE c.estado = 'completada') > 0
ORDER BY ingresos_totales DESC;

-- ============================================
-- INGRESOS MENSUALES (ÚLTIMOS 6 MESES)
-- ============================================

SELECT 
    TO_CHAR(TO_DATE(c.fecha, 'YYYY-MM-DD'), 'YYYY-MM') as mes,
    TO_CHAR(TO_DATE(c.fecha, 'YYYY-MM-DD'), 'Mon YYYY') as mes_nombre,
    COUNT(*) FILTER (WHERE c.estado = 'completada') as citas_completadas,
    SUM(s.precio) FILTER (WHERE c.estado = 'completada') as ingresos_totales,
    ROUND(AVG(s.precio) FILTER (WHERE c.estado = 'completada'), 2) as ticket_promedio
FROM citas c
JOIN servicios s ON c.servicio = s.nombre
WHERE TO_DATE(c.fecha, 'YYYY-MM-DD') >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '5 months'
GROUP BY mes, mes_nombre
ORDER BY mes DESC;

-- ============================================
-- PROYECCIÓN DE INGRESOS (citas confirmadas futuras)
-- ============================================

SELECT 
    TO_CHAR(TO_DATE(c.fecha, 'YYYY-MM-DD'), 'YYYY-MM') as mes,
    COUNT(*) FILTER (WHERE c.estado IN ('confirmada', 'pendiente')) as citas_proyectadas,
    SUM(s.precio) FILTER (WHERE c.estado IN ('confirmada', 'pendiente')) as ingresos_proyectados
FROM citas c
JOIN servicios s ON c.servicio = s.nombre
WHERE TO_DATE(c.fecha, 'YYYY-MM-DD') >= CURRENT_DATE
GROUP BY mes
ORDER BY mes;

-- ============================================
-- INGRESOS POR DÍA DE LA SEMANA
-- ============================================

SELECT 
    TO_CHAR(TO_DATE(c.fecha, 'YYYY-MM-DD'), 'Day') as dia_semana,
    EXTRACT(DOW FROM TO_DATE(c.fecha, 'YYYY-MM-DD')) as num_dia,
    COUNT(*) FILTER (WHERE c.estado = 'completada') as citas_completadas,
    SUM(s.precio) FILTER (WHERE c.estado = 'completada') as ingresos_totales,
    ROUND(AVG(s.precio) FILTER (WHERE c.estado = 'completada'), 2) as ticket_promedio
FROM citas c
JOIN servicios s ON c.servicio = s.nombre
WHERE TO_DATE(c.fecha, 'YYYY-MM-DD') >= DATE_TRUNC('month', CURRENT_DATE)
GROUP BY dia_semana, num_dia
ORDER BY num_dia;

-- ============================================
-- TOP 10 CLIENTES QUE MÁS HAN GASTADO
-- ============================================

SELECT 
    c.cliente_nombre,
    c.cliente_telefono,
    COUNT(*) FILTER (WHERE c.estado = 'completada') as total_citas,
    SUM(s.precio) FILTER (WHERE c.estado = 'completada') as gasto_total,
    ROUND(AVG(s.precio) FILTER (WHERE c.estado = 'completada'), 2) as gasto_promedio,
    MAX(c.fecha) as ultima_visita
FROM citas c
JOIN servicios s ON c.servicio = s.nombre
WHERE c.estado = 'completada'
GROUP BY c.cliente_nombre, c.cliente_telefono
ORDER BY gasto_total DESC
LIMIT 10;

-- ============================================
-- COMPARACIÓN DE INGRESOS: ESTE MES VS MES ANTERIOR
-- ============================================

WITH mes_actual AS (
    SELECT 
        SUM(s.precio) FILTER (WHERE c.estado = 'completada') as ingresos
    FROM citas c
    JOIN servicios s ON c.servicio = s.nombre
    WHERE TO_DATE(c.fecha, 'YYYY-MM-DD') >= DATE_TRUNC('month', CURRENT_DATE)
),
mes_anterior AS (
    SELECT 
        SUM(s.precio) FILTER (WHERE c.estado = 'completada') as ingresos
    FROM citas c
    JOIN servicios s ON c.servicio = s.nombre
    WHERE TO_DATE(c.fecha, 'YYYY-MM-DD') >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
      AND TO_DATE(c.fecha, 'YYYY-MM-DD') < DATE_TRUNC('month', CURRENT_DATE)
)
SELECT 
    COALESCE(ma.ingresos, 0) as ingresos_mes_actual,
    COALESCE(mp.ingresos, 0) as ingresos_mes_anterior,
    COALESCE(ma.ingresos, 0) - COALESCE(mp.ingresos, 0) as diferencia,
    CASE 
        WHEN mp.ingresos > 0 THEN
            ROUND(
                (COALESCE(ma.ingresos, 0) - COALESCE(mp.ingresos, 0))::NUMERIC / 
                mp.ingresos * 100, 
                2
            )
        ELSE NULL
    END as porcentaje_cambio
FROM mes_actual ma, mes_anterior mp;
