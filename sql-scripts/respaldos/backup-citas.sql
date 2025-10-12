-- ============================================
-- RESPALDO DE TABLA DE CITAS
-- ============================================
-- USO: Crear copia de seguridad antes de operaciones peligrosas
-- ============================================

-- ============================================
-- CREAR TABLA DE RESPALDO
-- ============================================

-- Respaldo completo de citas
CREATE TABLE IF NOT EXISTS citas_backup_20251012 AS
SELECT * FROM citas;

-- Verificar respaldo
SELECT COUNT(*) as total_registros FROM citas_backup_20251012;

-- ============================================
-- RESPALDO CON FILTRO (solo datos recientes)
-- ============================================

-- Respaldo de citas de los últimos 6 meses
CREATE TABLE IF NOT EXISTS citas_backup_recientes AS
SELECT * FROM citas
WHERE TO_DATE(fecha, 'YYYY-MM-DD') >= CURRENT_DATE - INTERVAL '6 months';

-- ============================================
-- RESPALDO DE CITAS POR BARBERO
-- ============================================

CREATE TABLE IF NOT EXISTS citas_backup_angel AS
SELECT * FROM citas
WHERE barbero = 'Angel Ramirez';

-- ============================================
-- RESTAURAR DESDE RESPALDO
-- ============================================

-- ⚠️ CUIDADO: Esto reemplaza TODOS los datos actuales

-- Paso 1: Vaciar tabla actual
/*
TRUNCATE TABLE citas;
*/

-- Paso 2: Restaurar desde respaldo
/*
INSERT INTO citas
SELECT * FROM citas_backup_20251012;
*/

-- ============================================
-- RESTAURAR CITAS ESPECÍFICAS
-- ============================================

-- Restaurar solo citas eliminadas accidentalmente de un cliente
/*
INSERT INTO citas
SELECT * FROM citas_backup_20251012
WHERE cliente_telefono = '5512345678'
  AND id NOT IN (SELECT id FROM citas);
*/

-- ============================================
-- ELIMINAR TABLAS DE RESPALDO ANTIGUAS
-- ============================================

-- Ver todas las tablas de respaldo
SELECT 
    tablename 
FROM pg_tables 
WHERE tablename LIKE 'citas_backup%'
ORDER BY tablename;

-- Eliminar respaldo específico
/*
DROP TABLE IF EXISTS citas_backup_20251012;
*/

-- ============================================
-- EXPORTAR DATOS A CSV (para Supabase)
-- ============================================

-- Nota: Esto se debe ejecutar desde el Dashboard de Supabase
-- Ve a: Table Editor → citas → Options (⋮) → Export to CSV

-- Alternativamente, usa la API REST de Supabase para exportar datos

-- ============================================
-- COMPARAR TABLA ACTUAL CON RESPALDO
-- ============================================

-- Ver diferencias en cantidad
SELECT 
    'Actual' as tabla,
    COUNT(*) as total_registros
FROM citas
UNION ALL
SELECT 
    'Respaldo' as tabla,
    COUNT(*) as total_registros
FROM citas_backup_20251012;

-- Ver registros que están en actual pero no en respaldo (nuevas citas)
SELECT * FROM citas
WHERE id NOT IN (SELECT id FROM citas_backup_20251012)
ORDER BY created_at DESC;

-- Ver registros que están en respaldo pero no en actual (eliminadas)
SELECT * FROM citas_backup_20251012
WHERE id NOT IN (SELECT id FROM citas)
ORDER BY fecha DESC;
