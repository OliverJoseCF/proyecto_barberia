-- ============================================
-- VERIFICAR: ¿Se están registrando los DELETE?
-- ============================================

-- Ver todos los registros de auditoría (últimos 20)
SELECT 
  accion,
  datos_nuevos->>'cliente_nombre' as cliente,
  datos_anteriores->>'cliente_nombre' as cliente_anterior,
  timestamp,
  cita_id
FROM auditoria_citas
ORDER BY timestamp DESC
LIMIT 20;

-- Ver solo DELETE
SELECT 
  'DELETE' as tipo,
  datos_anteriores->>'cliente_nombre' as cliente,
  datos_anteriores->>'barbero' as barbero,
  datos_anteriores->>'estado' as estado,
  timestamp
FROM auditoria_citas
WHERE accion = 'DELETE'
ORDER BY timestamp DESC
LIMIT 10;

-- Contar registros por tipo
SELECT 
  accion,
  COUNT(*) as total
FROM auditoria_citas
GROUP BY accion
ORDER BY accion;
