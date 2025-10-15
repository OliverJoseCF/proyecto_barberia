-- ============================================
-- FIX: Trigger DELETE con logging detallado
-- ============================================
-- Problema: El trigger DELETE no está registrando en auditoría
-- Solución: Recrear con RAISE NOTICE para debugging
-- ============================================

-- PASO 1: Eliminar trigger y función anterior
DROP TRIGGER IF EXISTS trigger_auditoria_citas ON public.citas;
DROP FUNCTION IF EXISTS public.registrar_auditoria_citas();

-- PASO 2: Crear función con logging detallado
CREATE OR REPLACE FUNCTION public.registrar_auditoria_citas()
RETURNS TRIGGER AS $$
DECLARE
  v_cambios JSONB;
  v_cita_id INTEGER;
BEGIN
  RAISE NOTICE '🔔 Trigger ejecutado: %', TG_OP;
  
  -- Registrar según el tipo de operación
  CASE TG_OP
    WHEN 'INSERT' THEN
      RAISE NOTICE '➕ INSERT detectado - ID: %', NEW.id;
      INSERT INTO public.auditoria_citas (
        cita_id,
        accion,
        datos_nuevos,
        timestamp
      ) VALUES (
        NEW.id,
        'INSERT',
        to_jsonb(NEW),
        NOW()
      );
      RAISE NOTICE '✅ INSERT registrado en auditoría';
      RETURN NEW;
      
    WHEN 'UPDATE' THEN
      RAISE NOTICE '✏️ UPDATE detectado - ID: %', NEW.id;
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
        datos_anteriores,
        datos_nuevos,
        cambios_especificos,
        timestamp
      ) VALUES (
        NEW.id,
        'UPDATE',
        to_jsonb(OLD),
        to_jsonb(NEW),
        v_cambios,
        NOW()
      );
      RAISE NOTICE '✅ UPDATE registrado en auditoría';
      RETURN NEW;
      
    WHEN 'DELETE' THEN
      v_cita_id := OLD.id;
      RAISE NOTICE '🗑️ DELETE detectado - ID: %, Cliente: %', v_cita_id, OLD.cliente_nombre;
      
      -- Intentar insertar en auditoría
      BEGIN
        INSERT INTO public.auditoria_citas (
          cita_id,
          accion,
          datos_anteriores,
          timestamp
        ) VALUES (
          NULL,  -- No usar cita_id porque será eliminada
          'DELETE',
          to_jsonb(OLD),
          NOW()
        );
        RAISE NOTICE '✅ DELETE registrado en auditoría exitosamente';
      EXCEPTION WHEN OTHERS THEN
        RAISE WARNING '❌ Error al registrar DELETE: % - %', SQLSTATE, SQLERRM;
      END;
      
      RETURN OLD;
  END CASE;
  
  RETURN NULL;
  
EXCEPTION WHEN OTHERS THEN
  -- Si hay error, registrarlo pero no bloquear la operación
  RAISE WARNING '❌ Error general en auditoría [%]: % - %', TG_OP, SQLSTATE, SQLERRM;
  CASE TG_OP
    WHEN 'DELETE' THEN RETURN OLD;
    ELSE RETURN NEW;
  END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PASO 3: Recrear trigger
CREATE TRIGGER trigger_auditoria_citas
  AFTER INSERT OR UPDATE OR DELETE ON public.citas
  FOR EACH ROW
  EXECUTE FUNCTION public.registrar_auditoria_citas();

-- PASO 4: Verificar que el trigger está activo
SELECT 
  tgname AS nombre_trigger,
  CASE tgenabled
    WHEN 'O' THEN '✅ ACTIVO'
    WHEN 'D' THEN '❌ DESHABILITADO'
    ELSE '⚠️ OTRO'
  END AS estado,
  tgtype AS tipo
FROM pg_trigger
WHERE tgname = 'trigger_auditoria_citas'
  AND tgrelid = 'public.citas'::regclass;

-- ============================================
-- PASO 5: PRUEBA CON LOGGING
-- ============================================

-- Crear cita de prueba
INSERT INTO citas (barbero, cliente_nombre, cliente_telefono, fecha, hora, servicio, estado)
VALUES ('Angel Ramirez', 'TEST DELETE LOG', '5599999999', '2025-12-31', '11:00', 'Corte de Cabello (Hombre)', 'pendiente')
RETURNING id, cliente_nombre;

-- Esperar 1 segundo
SELECT pg_sleep(1);

-- Eliminar la cita (esto debería mostrar NOTICE en la consola)
DELETE FROM citas WHERE cliente_nombre = 'TEST DELETE LOG';

-- Esperar 1 segundo
SELECT pg_sleep(1);

-- Verificar registros de auditoría
SELECT 
  accion,
  datos_anteriores->>'cliente_nombre' as cliente,
  datos_anteriores->>'estado' as estado,
  datos_nuevos->>'cliente_nombre' as cliente_nuevo,
  timestamp,
  cita_id
FROM auditoria_citas
WHERE datos_anteriores->>'cliente_nombre' = 'TEST DELETE LOG'
   OR datos_nuevos->>'cliente_nombre' = 'TEST DELETE LOG'
ORDER BY timestamp DESC;

-- ============================================
-- NOTAS IMPORTANTES:
-- ============================================
-- 1. Los RAISE NOTICE aparecerán en la consola de Supabase
-- 2. Deberías ver mensajes como:
--    🔔 Trigger ejecutado: INSERT
--    🔔 Trigger ejecutado: DELETE
--    🗑️ DELETE detectado - ID: X
--    ✅ DELETE registrado en auditoría exitosamente
-- 3. Si no ves estos mensajes, el trigger NO se está ejecutando
-- 4. Si ves errores ❌, nos dirá exactamente qué está fallando
-- ============================================
