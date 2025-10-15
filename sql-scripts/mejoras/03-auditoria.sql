-- ============================================
-- MEJORA 3: SISTEMA DE AUDITORÍA
-- ============================================
-- Rastrea todos los cambios en las citas
-- (creación, actualización, cancelación, etc.)
-- ============================================

-- ============================================
-- TABLA: Auditoría de citas
-- ============================================
CREATE TABLE IF NOT EXISTS public.auditoria_citas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cita_id UUID REFERENCES public.citas(id) ON DELETE SET NULL,
  accion VARCHAR(20) NOT NULL CHECK (accion IN ('INSERT', 'UPDATE', 'DELETE')),
  usuario_id UUID, -- NULL si es público, o auth.uid() si está autenticado
  datos_anteriores JSONB, -- Estado anterior (para UPDATE y DELETE)
  datos_nuevos JSONB, -- Estado nuevo (para INSERT y UPDATE)
  cambios_especificos JSONB, -- Solo los campos que cambiaron
  ip_address VARCHAR(45), -- IP del usuario
  user_agent TEXT, -- Navegador/dispositivo
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Índices para consultas rápidas
CREATE INDEX IF NOT EXISTS idx_auditoria_cita_id ON public.auditoria_citas(cita_id);
CREATE INDEX IF NOT EXISTS idx_auditoria_accion ON public.auditoria_citas(accion);
CREATE INDEX IF NOT EXISTS idx_auditoria_timestamp ON public.auditoria_citas(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_auditoria_usuario ON public.auditoria_citas(usuario_id);

-- Habilitar RLS
ALTER TABLE public.auditoria_citas ENABLE ROW LEVEL SECURITY;

-- Política: Solo admin puede leer auditoría
CREATE POLICY "Permitir lectura de auditoría solo con autenticación"
  ON public.auditoria_citas FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- ============================================
-- FUNCIÓN: Registrar cambios automáticamente
-- ============================================
CREATE OR REPLACE FUNCTION public.registrar_auditoria_citas()
RETURNS TRIGGER AS $$
DECLARE
  v_usuario_id UUID;
  v_cambios JSONB;
BEGIN
  -- Obtener ID del usuario autenticado (si existe)
  v_usuario_id := auth.uid();
  
  -- Registrar según el tipo de operación
  CASE TG_OP
    WHEN 'INSERT' THEN
      INSERT INTO public.auditoria_citas (
        cita_id,
        accion,
        usuario_id,
        datos_nuevos
      ) VALUES (
        NEW.id,
        'INSERT',
        v_usuario_id,
        to_jsonb(NEW)
      );
      RETURN NEW;
      
    WHEN 'UPDATE' THEN
      -- Calcular solo los campos que cambiaron
      SELECT jsonb_object_agg(key, value)
      INTO v_cambios
      FROM (
        SELECT key, value
        FROM jsonb_each(to_jsonb(NEW))
        WHERE to_jsonb(NEW) -> key IS DISTINCT FROM to_jsonb(OLD) -> key
      ) AS cambios;
      
      INSERT INTO public.auditoria_citas (
        cita_id,
        accion,
        usuario_id,
        datos_anteriores,
        datos_nuevos,
        cambios_especificos
      ) VALUES (
        NEW.id,
        'UPDATE',
        v_usuario_id,
        to_jsonb(OLD),
        to_jsonb(NEW),
        v_cambios
      );
      RETURN NEW;
      
    WHEN 'DELETE' THEN
      INSERT INTO public.auditoria_citas (
        cita_id,
        accion,
        usuario_id,
        datos_anteriores
      ) VALUES (
        OLD.id,
        'DELETE',
        v_usuario_id,
        to_jsonb(OLD)
      );
      RETURN OLD;
  END CASE;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- TRIGGER: Activar auditoría automática
-- ============================================
DROP TRIGGER IF EXISTS trigger_auditoria_citas ON public.citas;

CREATE TRIGGER trigger_auditoria_citas
  AFTER INSERT OR UPDATE OR DELETE ON public.citas
  FOR EACH ROW
  EXECUTE FUNCTION public.registrar_auditoria_citas();

-- ============================================
-- VISTAS: Consultas útiles de auditoría
-- ============================================

-- Vista: Historial de cambios por cita
CREATE OR REPLACE VIEW public.historial_cita AS
SELECT 
  a.cita_id,
  c.cliente_nombre,
  c.cliente_telefono,
  a.accion,
  a.cambios_especificos,
  a.timestamp,
  a.usuario_id
FROM public.auditoria_citas a
LEFT JOIN public.citas c ON a.cita_id = c.id
ORDER BY a.timestamp DESC;

-- Vista: Estadísticas de cambios
CREATE OR REPLACE VIEW public.estadisticas_auditoria AS
SELECT 
  accion,
  COUNT(*) AS total,
  COUNT(DISTINCT cita_id) AS citas_afectadas,
  COUNT(DISTINCT usuario_id) AS usuarios_distintos,
  MIN(timestamp) AS primera_vez,
  MAX(timestamp) AS ultima_vez
FROM public.auditoria_citas
GROUP BY accion;

-- Vista: Citas canceladas (para análisis)
CREATE OR REPLACE VIEW public.citas_canceladas_auditoria AS
SELECT 
  a.cita_id,
  a.datos_anteriores->>'cliente_nombre' AS cliente_nombre,
  a.datos_anteriores->>'cliente_telefono' AS cliente_telefono,
  a.datos_anteriores->>'fecha' AS fecha_original,
  a.datos_anteriores->>'hora' AS hora_original,
  a.datos_anteriores->>'barbero' AS barbero,
  a.timestamp AS fecha_cancelacion,
  EXTRACT(EPOCH FROM (a.timestamp::timestamp - (a.datos_anteriores->>'created_at')::timestamp))/3600 AS horas_hasta_cancelacion
FROM public.auditoria_citas a
WHERE a.cambios_especificos->>'estado' = 'cancelada'
ORDER BY a.timestamp DESC;

-- Vista: Reprogramaciones
CREATE OR REPLACE VIEW public.reprogramaciones_auditoria AS
SELECT 
  a.cita_id,
  a.datos_anteriores->>'cliente_nombre' AS cliente,
  a.datos_anteriores->>'fecha' AS fecha_anterior,
  a.datos_anteriores->>'hora' AS hora_anterior,
  a.datos_nuevos->>'fecha' AS fecha_nueva,
  a.datos_nuevos->>'hora' AS hora_nueva,
  a.timestamp AS fecha_reprogramacion
FROM public.auditoria_citas a
WHERE a.accion = 'UPDATE'
  AND (
    a.datos_anteriores->>'fecha' IS DISTINCT FROM a.datos_nuevos->>'fecha'
    OR a.datos_anteriores->>'hora' IS DISTINCT FROM a.datos_nuevos->>'hora'
  )
ORDER BY a.timestamp DESC;

-- ============================================
-- FUNCIONES AUXILIARES: Consultas de auditoría
-- ============================================

-- Obtener historial completo de una cita
CREATE OR REPLACE FUNCTION public.obtener_historial_cita(p_cita_id UUID)
RETURNS TABLE (
  accion VARCHAR,
  cambios JSONB,
  fecha TIMESTAMP WITH TIME ZONE,
  usuario UUID
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.accion,
    a.cambios_especificos,
    a.timestamp,
    a.usuario_id
  FROM public.auditoria_citas a
  WHERE a.cita_id = p_cita_id
  ORDER BY a.timestamp ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Obtener cambios recientes (últimas 24 horas)
CREATE OR REPLACE FUNCTION public.cambios_recientes()
RETURNS TABLE (
  cita_id UUID,
  cliente VARCHAR,
  accion VARCHAR,
  cambios JSONB,
  fecha TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.cita_id,
    COALESCE(c.cliente_nombre, a.datos_anteriores->>'cliente_nombre') AS cliente,
    a.accion,
    a.cambios_especificos,
    a.timestamp
  FROM public.auditoria_citas a
  LEFT JOIN public.citas c ON a.cita_id = c.id
  WHERE a.timestamp > NOW() - INTERVAL '24 hours'
  ORDER BY a.timestamp DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- MANTENIMIENTO: Limpiar auditoría antigua
-- ============================================
-- Función para eliminar registros de auditoría antiguos
CREATE OR REPLACE FUNCTION public.limpiar_auditoria_antigua(dias_antiguedad INTEGER DEFAULT 365)
RETURNS INTEGER AS $$
DECLARE
  filas_eliminadas INTEGER;
BEGIN
  DELETE FROM public.auditoria_citas
  WHERE timestamp < NOW() - (dias_antiguedad || ' days')::INTERVAL;
  
  GET DIAGNOSTICS filas_eliminadas = ROW_COUNT;
  RETURN filas_eliminadas;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- VERIFICACIÓN
-- ============================================
SELECT 
  'Tabla de auditoría creada' AS verificacion,
  COUNT(*) AS registros_actuales
FROM public.auditoria_citas;

-- ============================================
-- RESULTADO ESPERADO:
-- ✅ Sistema de auditoría completo
-- ✅ Registro automático de todos los cambios
-- ✅ Vistas para análisis de datos
-- ✅ Funciones para consultas específicas
-- ============================================
