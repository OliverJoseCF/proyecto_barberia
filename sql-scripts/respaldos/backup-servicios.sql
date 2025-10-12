-- ============================================
-- RESPALDO DE TABLA DE SERVICIOS
-- ============================================

-- Crear respaldo completo de servicios
CREATE TABLE IF NOT EXISTS servicios_backup_20251012 AS
SELECT * FROM servicios;

-- Verificar respaldo
SELECT COUNT(*) FROM servicios_backup_20251012;

-- Ver comparación
SELECT 
    'Actual' as tabla,
    COUNT(*) as total_servicios,
    COUNT(*) FILTER (WHERE activo = true) as activos
FROM servicios
UNION ALL
SELECT 
    'Respaldo' as tabla,
    COUNT(*) as total_servicios,
    COUNT(*) FILTER (WHERE activo = true) as activos
FROM servicios_backup_20251012;

-- ============================================
-- RESTAURAR SERVICIOS
-- ============================================

-- Restaurar todos
/*
TRUNCATE TABLE servicios;
INSERT INTO servicios SELECT * FROM servicios_backup_20251012;
*/

-- Restaurar servicio específico
/*
INSERT INTO servicios
SELECT * FROM servicios_backup_20251012
WHERE nombre = 'Corte Clásico'
ON CONFLICT (id) DO UPDATE 
SET 
    nombre = EXCLUDED.nombre,
    precio = EXCLUDED.precio,
    duracion = EXCLUDED.duracion,
    categoria = EXCLUDED.categoria,
    descripcion = EXCLUDED.descripcion,
    activo = EXCLUDED.activo;
*/
