-- ============================================
-- FIX: Permitir eliminar citas con auditoría
-- ============================================
-- Problema: La FK en auditoria_citas bloquea DELETE de citas
-- Solución: Cambiar la FK para que se comporte correctamente
-- ============================================

-- PASO 1: Eliminar la constraint existente
-- ============================================
ALTER TABLE public.auditoria_citas 
DROP CONSTRAINT IF EXISTS auditoria_citas_cita_id_fkey;

-- PASO 2: Crear nueva constraint con ON DELETE SET NULL
-- ============================================
-- Esto permite que cuando se elimine una cita, el cita_id en auditoría se ponga NULL
-- pero mantenemos el registro de auditoría con los datos en datos_anteriores
ALTER TABLE public.auditoria_citas
ADD CONSTRAINT auditoria_citas_cita_id_fkey 
FOREIGN KEY (cita_id) 
REFERENCES public.citas(id) 
ON DELETE SET NULL;

-- PASO 3: Verificar que el trigger esté funcionando
-- ============================================
-- El trigger debe estar activo
SELECT 
  tgname AS trigger_name,
  tgenabled AS is_enabled,
  tgtype AS trigger_type
FROM pg_trigger
WHERE tgname = 'trigger_auditoria_citas';

-- PASO 4: Verificar registros de auditoría existentes
-- ============================================
SELECT 
  accion,
  COUNT(*) as total,
  MIN(timestamp) as primera,
  MAX(timestamp) as ultima
FROM public.auditoria_citas
GROUP BY accion
ORDER BY accion;

-- ============================================
-- PRUEBA: Crear, modificar y eliminar una cita de prueba
-- ============================================
-- NOTA: Ejecuta esto solo si quieres probar que funciona

-- 1. Insertar cita de prueba
-- INSERT INTO citas (barbero, cliente_nombre, cliente_telefono, fecha, hora, servicio, estado)
-- VALUES ('Angel Ramirez', 'Test Auditoría', '5500000000', '2025-12-31', '10:00', 'Corte de Cabello (Hombre)', 'pendiente')
-- RETURNING id;

-- 2. Ver que se creó el registro en auditoría
-- SELECT * FROM auditoria_citas WHERE datos_nuevos->>'cliente_nombre' = 'Test Auditoría' ORDER BY timestamp DESC LIMIT 5;

-- 3. Eliminar la cita de prueba
-- DELETE FROM citas WHERE cliente_nombre = 'Test Auditoría';

-- 4. Verificar que el registro de auditoría sigue existiendo con cita_id = NULL
-- SELECT * FROM auditoria_citas WHERE datos_anteriores->>'cliente_nombre' = 'Test Auditoría' ORDER BY timestamp DESC LIMIT 5;

-- ============================================
-- RESULTADO ESPERADO:
-- ============================================
-- ✅ Trigger activo
-- ✅ Registros de auditoría visibles
-- ✅ Se pueden eliminar citas sin error
-- ✅ Los registros de DELETE en auditoría tienen cita_id = NULL pero conservan datos_anteriores
