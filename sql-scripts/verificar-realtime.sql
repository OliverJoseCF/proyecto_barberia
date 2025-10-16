-- =====================================================
-- SCRIPT DE VERIFICACIÓN DE REALTIME
-- =====================================================
-- Este script te ayuda a verificar que Realtime esté
-- correctamente configurado en tu proyecto Supabase.
-- =====================================================

-- 1. Verificar que las tablas existan
SELECT 
    tablename,
    schemaname
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN (
    'servicios',
    'horarios_semanales', 
    'dias_festivos', 
    'configuracion'
)
ORDER BY tablename;

-- 2. Verificar que las tablas tengan Realtime habilitado
-- (Esta query solo funciona si tienes acceso a pg_catalog)
SELECT 
    schemaname,
    tablename
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime'
AND tablename IN (
    'servicios',
    'horarios_semanales', 
    'dias_festivos', 
    'configuracion'
)
ORDER BY tablename;

-- 3. Verificar datos actuales en horarios_semanales
SELECT 
    dia_semana,
    CASE dia_semana
        WHEN 0 THEN 'Domingo'
        WHEN 1 THEN 'Lunes'
        WHEN 2 THEN 'Martes'
        WHEN 3 THEN 'Miércoles'
        WHEN 4 THEN 'Jueves'
        WHEN 5 THEN 'Viernes'
        WHEN 6 THEN 'Sábado'
    END as dia,
    activo,
    hora_apertura,
    hora_cierre,
    pausa_inicio,
    pausa_fin,
    updated_at
FROM horarios_semanales
ORDER BY dia_semana;

-- 4. Verificar configuración
SELECT 
    clave,
    valor,
    tipo,
    descripcion
FROM configuracion
ORDER BY clave;

-- 5. Hacer un UPDATE de prueba para ver si Realtime funciona
-- Ejecuta esto y observa la consola de tu app
UPDATE horarios_semanales 
SET updated_at = NOW()
WHERE dia_semana = 1; -- Lunes

-- Si ves el mensaje "🔄 Cambio en horarios detectado" en tu consola,
-- ¡Realtime está funcionando correctamente!

-- =====================================================
-- INSTRUCCIONES DE USO
-- =====================================================
-- 1. Copia y pega este script en el SQL Editor de Supabase
-- 2. Ejecuta cada sección por separado
-- 3. Verifica los resultados
-- 
-- IMPORTANTE:
-- - Si la query 2 no devuelve resultados, Realtime NO está habilitado
-- - Ve a Database → Replication en Supabase
-- - Activa las 4 tablas mencionadas
-- 
-- DIAGNÓSTICO:
-- - Si query 1 falla: Las tablas no existen, ejecuta los scripts SQL
-- - Si query 2 está vacía: Realtime no habilitado, actívalo en UI
-- - Si query 3 muestra datos: Todo bien con horarios
-- - Si query 5 no dispara evento: Verifica la suscripción del canal
-- =====================================================
