-- ============================================
-- MEJORA 1: CONSTRAINT DE UNICIDAD
-- ============================================
-- Previene que dos citas se reserven al mismo tiempo
-- para el mismo barbero (condiciones de carrera)
-- ============================================

-- Eliminar índice único si existe (por si re-ejecutas)
DROP INDEX IF EXISTS idx_unique_cita_fecha_hora_barbero;

-- Crear ÍNDICE ÚNICO PARCIAL
-- Esto actúa como constraint pero solo para citas activas
-- Permite solo una cita activa por fecha + hora + barbero
CREATE UNIQUE INDEX idx_unique_cita_fecha_hora_barbero 
ON public.citas(fecha, hora, barbero) 
WHERE estado IN ('pendiente', 'confirmada');

-- Crear índice adicional para mejorar rendimiento de consultas
DROP INDEX IF EXISTS idx_citas_activas_disponibilidad;
CREATE INDEX idx_citas_activas_disponibilidad 
ON public.citas(fecha, hora, barbero, estado) 
WHERE estado IN ('pendiente', 'confirmada');

-- ============================================
-- VERIFICACIÓN
-- ============================================
-- Este query debe devolver el índice único creado
SELECT 
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'citas' 
  AND indexname = 'idx_unique_cita_fecha_hora_barbero';

-- Verificar que funciona: Intentar insertar duplicado (debe fallar)
-- COMENTADO - Solo descomentar para probar
/*
INSERT INTO public.citas (cliente_nombre, cliente_telefono, fecha, hora, servicio, barbero, estado)
VALUES ('Test', '5512345678', '2025-12-01', '10:00', 'Corte', 'Ángel Ramírez', 'pendiente');

-- Intentar duplicado (debe dar error: "duplicate key value violates unique constraint")
INSERT INTO public.citas (cliente_nombre, cliente_telefono, fecha, hora, servicio, barbero, estado)
VALUES ('Test 2', '5512345679', '2025-12-01', '10:00', 'Corte', 'Ángel Ramírez', 'pendiente');

-- Limpiar prueba
DELETE FROM public.citas WHERE cliente_nombre = 'Test';
*/

-- ============================================
-- RESULTADO ESPERADO:
-- ✅ Ya no se podrán crear citas duplicadas
-- ✅ El sistema lanzará un error automático si hay conflicto
-- ✅ Protección contra condiciones de carrera
-- ✅ Error típico: "duplicate key value violates unique constraint"
-- ============================================
