-- ============================================
-- PRUEBA: Verificar que el trigger DELETE funcione
-- ============================================

-- PASO 1: Crear una cita de prueba
INSERT INTO citas (barbero, cliente_nombre, cliente_telefono, fecha, hora, servicio, estado)
VALUES ('Angel Ramirez', 'TEST DELETE', '5599999999', '2025-12-31', '10:00', 'Corte de Cabello (Hombre)', 'pendiente')
RETURNING id, cliente_nombre;

-- PASO 2: Ver que se creó en auditoría
SELECT 
  accion,
  datos_nuevos->>'cliente_nombre' as cliente,
  timestamp
FROM auditoria_citas
WHERE datos_nuevos->>'cliente_nombre' = 'TEST DELETE'
ORDER BY timestamp DESC;

-- PASO 3: Eliminar la cita de prueba
DELETE FROM citas WHERE cliente_nombre = 'TEST DELETE';

-- PASO 4: Verificar que se registró el DELETE
SELECT 
  accion,
  datos_anteriores->>'cliente_nombre' as cliente,
  datos_anteriores->>'estado' as estado_antes,
  timestamp,
  cita_id
FROM auditoria_citas
WHERE datos_anteriores->>'cliente_nombre' = 'TEST DELETE'
   OR datos_nuevos->>'cliente_nombre' = 'TEST DELETE'
ORDER BY timestamp DESC;

-- PASO 5: Ver el estado del trigger
SELECT 
  tgname AS nombre_trigger,
  tgenabled AS habilitado,
  CASE tgenabled
    WHEN 'O' THEN '✅ ACTIVO'
    WHEN 'D' THEN '❌ DESHABILITADO'
    ELSE '⚠️ OTRO: ' || tgenabled::text
  END AS estado
FROM pg_trigger
WHERE tgname = 'trigger_auditoria_citas'
  AND tgrelid = 'public.citas'::regclass;
