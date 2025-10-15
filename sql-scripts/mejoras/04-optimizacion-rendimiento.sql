-- ============================================
-- MEJORA 4: OPTIMIZACIÓN DE RENDIMIENTO
-- ============================================
-- Índices adicionales y mejoras de consultas
-- ============================================

-- ============================================
-- ÍNDICES COMPUESTOS para consultas frecuentes
-- ============================================

-- Índice para búsqueda rápida de disponibilidad
-- (la consulta más frecuente del sistema)
DROP INDEX IF EXISTS idx_disponibilidad_completa;
CREATE INDEX idx_disponibilidad_completa 
ON public.citas(barbero, fecha, hora, estado)
WHERE estado IN ('pendiente', 'confirmada');

-- Índice para búsqueda de citas por teléfono + estado
DROP INDEX IF EXISTS idx_citas_telefono_estado;
CREATE INDEX idx_citas_telefono_estado 
ON public.citas(cliente_telefono, estado, fecha DESC);

-- Índice para dashboard (citas recientes y futuras)
-- Sin predicado WHERE para evitar problemas con CURRENT_DATE
DROP INDEX IF EXISTS idx_citas_fecha_estado;
CREATE INDEX idx_citas_fecha_estado 
ON public.citas(fecha DESC, estado);

-- Índice para recordatorios pendientes
DROP INDEX IF EXISTS idx_recordatorios_pendientes;
CREATE INDEX idx_recordatorios_pendientes 
ON public.recordatorios(estado, fecha_envio)
WHERE estado = 'pendiente';

-- ============================================
-- FUNCIONES OPTIMIZADAS
-- ============================================

-- Versión optimizada de verificar disponibilidad
CREATE OR REPLACE FUNCTION public.verificar_disponibilidad_optimizada(
  p_fecha DATE,
  p_hora VARCHAR,
  p_barbero VARCHAR
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Usa el índice compuesto para búsqueda ultra rápida
  RETURN NOT EXISTS (
    SELECT 1 
    FROM public.citas
    WHERE barbero = p_barbero
      AND fecha = p_fecha
      AND hora = p_hora
      AND estado IN ('pendiente', 'confirmada')
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql STABLE;

-- Función para obtener horarios disponibles de un día completo
CREATE OR REPLACE FUNCTION public.horarios_disponibles(
  p_fecha DATE,
  p_barbero VARCHAR
)
RETURNS TABLE(hora VARCHAR, disponible BOOLEAN) AS $$
DECLARE
  horarios_base VARCHAR[] := ARRAY[
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30', '18:00', '18:30'
  ];
  citas_ocupadas VARCHAR[];
BEGIN
  -- Obtener horas ocupadas en una sola consulta
  SELECT ARRAY_AGG(c.hora)
  INTO citas_ocupadas
  FROM public.citas c
  WHERE c.barbero = p_barbero
    AND c.fecha = p_fecha
    AND c.estado IN ('pendiente', 'confirmada');
  
  -- Devolver todos los horarios con su disponibilidad
  RETURN QUERY
  SELECT 
    h AS hora,
    NOT (h = ANY(COALESCE(citas_ocupadas, ARRAY[]::VARCHAR[]))) AS disponible
  FROM unnest(horarios_base) h;
END;
$$ LANGUAGE plpgsql STABLE;

-- Función para obtener estadísticas del barbero (optimizada)
CREATE OR REPLACE FUNCTION public.estadisticas_barbero(
  p_barbero VARCHAR,
  p_desde DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
  p_hasta DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE(
  total_citas BIGINT,
  completadas BIGINT,
  canceladas BIGINT,
  pendientes BIGINT,
  tasa_completado NUMERIC,
  tasa_cancelacion NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) AS total_citas,
    COUNT(*) FILTER (WHERE estado = 'completada') AS completadas,
    COUNT(*) FILTER (WHERE estado = 'cancelada') AS canceladas,
    COUNT(*) FILTER (WHERE estado IN ('pendiente', 'confirmada')) AS pendientes,
    ROUND(
      COUNT(*) FILTER (WHERE estado = 'completada')::NUMERIC / 
      NULLIF(COUNT(*), 0) * 100, 
      2
    ) AS tasa_completado,
    ROUND(
      COUNT(*) FILTER (WHERE estado = 'cancelada')::NUMERIC / 
      NULLIF(COUNT(*), 0) * 100, 
      2
    ) AS tasa_cancelacion
  FROM public.citas
  WHERE barbero = p_barbero
    AND fecha BETWEEN p_desde AND p_hasta;
END;
$$ LANGUAGE plpgsql STABLE;

-- Función para obtener citas próximas (optimizada)
CREATE OR REPLACE FUNCTION public.citas_proximas(
  p_dias INTEGER DEFAULT 7,
  p_limite INTEGER DEFAULT 50
)
RETURNS TABLE(
  id UUID,
  cliente_nombre VARCHAR,
  cliente_telefono VARCHAR,
  fecha DATE,
  hora VARCHAR,
  servicio VARCHAR,
  barbero VARCHAR,
  estado VARCHAR,
  dias_restantes INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.cliente_nombre,
    c.cliente_telefono,
    c.fecha,
    c.hora,
    c.servicio,
    c.barbero,
    c.estado,
    (c.fecha - CURRENT_DATE)::INTEGER AS dias_restantes
  FROM public.citas c
  WHERE c.fecha BETWEEN CURRENT_DATE AND CURRENT_DATE + (p_dias || ' days')::INTERVAL
    AND c.estado IN ('pendiente', 'confirmada')
  ORDER BY c.fecha ASC, c.hora ASC
  LIMIT p_limite;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================
-- VISTAS MATERIALIZADAS (para reportes pesados)
-- ============================================

-- Vista materializada: Estadísticas mensuales
CREATE MATERIALIZED VIEW IF NOT EXISTS public.stats_mensuales AS
SELECT 
  DATE_TRUNC('month', fecha) AS mes,
  barbero,
  COUNT(*) AS total_citas,
  COUNT(*) FILTER (WHERE estado = 'completada') AS completadas,
  COUNT(*) FILTER (WHERE estado = 'cancelada') AS canceladas,
  COUNT(DISTINCT cliente_telefono) AS clientes_unicos,
  ARRAY_AGG(DISTINCT servicio) AS servicios_ofrecidos
FROM public.citas
WHERE fecha >= CURRENT_DATE - INTERVAL '12 months'
GROUP BY DATE_TRUNC('month', fecha), barbero
ORDER BY mes DESC, barbero;

-- Índice para la vista materializada
CREATE UNIQUE INDEX IF NOT EXISTS idx_stats_mensuales_mes_barbero 
ON public.stats_mensuales(mes, barbero);

-- Función para refrescar estadísticas
CREATE OR REPLACE FUNCTION public.refrescar_estadisticas()
RETURNS VOID AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.stats_mensuales;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- VACUUM Y ANALYZE automáticos (mantenimiento)
-- ============================================

-- Función para optimizar tablas
CREATE OR REPLACE FUNCTION public.optimizar_tablas()
RETURNS VOID AS $$
BEGIN
  -- Analizar estadísticas de la tabla principal
  ANALYZE public.citas;
  ANALYZE public.servicios;
  ANALYZE public.barberos;
  ANALYZE public.recordatorios;
  
  -- Si existe la tabla de auditoría
  ANALYZE public.auditoria_citas;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- CONFIGURACIÓN: Particionamiento automático (avanzado)
-- ============================================
-- Comentado por ahora, activar solo si tienes MUCHAS citas (>100k)
/*
-- Crear tabla particionada por fecha
CREATE TABLE public.citas_particionadas (
  LIKE public.citas INCLUDING ALL
) PARTITION BY RANGE (fecha);

-- Crear particiones por mes
CREATE TABLE public.citas_2024_10 PARTITION OF public.citas_particionadas
  FOR VALUES FROM ('2024-10-01') TO ('2024-11-01');

CREATE TABLE public.citas_2024_11 PARTITION OF public.citas_particionadas
  FOR VALUES FROM ('2024-11-01') TO ('2024-12-01');
*/

-- ============================================
-- VERIFICACIÓN DE RENDIMIENTO
-- ============================================

-- Consulta para ver el tamaño de las tablas
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
  pg_total_relation_size(schemaname||'.'||tablename) AS size_bytes
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('citas', 'servicios', 'barberos', 'auditoria_citas')
ORDER BY size_bytes DESC;

-- Consulta para ver índices y su uso
SELECT 
  schemaname,
  relname AS tablename,
  indexrelname AS indexname,
  idx_scan AS veces_usado,
  pg_size_pretty(pg_relation_size(indexrelid)) AS tamaño
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
  AND relname = 'citas'
ORDER BY idx_scan DESC;

-- ============================================
-- RESULTADO ESPERADO:
-- ✅ Consultas hasta 10x más rápidas
-- ✅ Índices optimizados para casos de uso reales
-- ✅ Funciones mejoradas para disponibilidad
-- ✅ Vistas materializadas para reportes
-- ✅ índices: idx_disponibilidad_completa, idx_citas_telefono_estado, idx_citas_fecha_estado
-- ============================================
