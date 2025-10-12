-- ============================================
-- HABILITAR REALTIME PARA CITAS
-- ============================================
-- Este script habilita Realtime para la tabla de citas
-- Ejecuta esto en el SQL Editor de Supabase

-- Habilitar Realtime para la tabla citas
ALTER PUBLICATION supabase_realtime ADD TABLE citas;

-- Verificar que Realtime está habilitado
-- Puedes ejecutar esta consulta para verificar:
-- SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';
