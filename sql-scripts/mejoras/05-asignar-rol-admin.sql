-- ============================================
-- MEJORA #5: ASIGNAR ROL DE ADMINISTRADOR
-- CantaBarba Studio
-- ============================================
-- Descripción: Agrega el campo 'rol' a la tabla barberos
--              y establece a Ángel Ramírez como administrador permanente
-- ============================================

-- PASO 1: Agregar columna 'rol' si no existe
-- ============================================
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'barberos' 
        AND column_name = 'rol'
    ) THEN
        ALTER TABLE public.barberos 
        ADD COLUMN rol VARCHAR(20) DEFAULT 'barbero' 
        CHECK (rol IN ('admin', 'barbero'));
        
        RAISE NOTICE 'Columna "rol" agregada exitosamente';
    ELSE
        RAISE NOTICE 'La columna "rol" ya existe';
    END IF;
END $$;

-- PASO 2: Asignar rol de administrador a Ángel Ramírez
-- ============================================
UPDATE public.barberos 
SET rol = 'admin' 
WHERE nombre ILIKE '%Angel%Ramirez%' 
   OR email = 'angel@cantabarba.com';

-- PASO 3: Asegurar que todos los demás sean 'barbero'
-- ============================================
UPDATE public.barberos 
SET rol = 'barbero' 
WHERE rol IS NULL 
  AND nombre NOT ILIKE '%Angel%Ramirez%' 
  AND email != 'angel@cantabarba.com';

-- PASO 4: Crear restricción para garantizar que siempre haya al menos un admin
-- ============================================
-- Función que previene eliminar el último admin
CREATE OR REPLACE FUNCTION prevenir_eliminar_ultimo_admin()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.rol = 'admin' THEN
        IF (SELECT COUNT(*) FROM barberos WHERE rol = 'admin' AND id != OLD.id) = 0 THEN
            RAISE EXCEPTION 'No se puede eliminar o cambiar el rol del último administrador';
        END IF;
    END IF;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para prevenir eliminar el último admin
DROP TRIGGER IF EXISTS trigger_prevenir_eliminar_admin ON barberos;
CREATE TRIGGER trigger_prevenir_eliminar_admin
BEFORE DELETE OR UPDATE OF rol ON barberos
FOR EACH ROW
EXECUTE FUNCTION prevenir_eliminar_ultimo_admin();

-- PASO 5: Crear índice para mejorar búsquedas por rol
-- ============================================
CREATE INDEX IF NOT EXISTS idx_barberos_rol ON public.barberos(rol);

-- PASO 6: Actualizar política RLS para admin
-- ============================================
-- Los administradores tienen acceso completo a todo
DROP POLICY IF EXISTS "Administradores tienen acceso completo" ON barberos;
CREATE POLICY "Administradores tienen acceso completo"
ON barberos
FOR ALL
USING (rol = 'admin')
WITH CHECK (rol = 'admin');

-- ============================================
-- VERIFICACIÓN
-- ============================================
SELECT 
    nombre, 
    email, 
    rol,
    CASE 
        WHEN rol = 'admin' THEN '✅ ADMINISTRADOR'
        ELSE '👤 Barbero'
    END as estado
FROM barberos 
ORDER BY 
    CASE WHEN rol = 'admin' THEN 0 ELSE 1 END,
    nombre;

-- Contar administradores
SELECT 
    'TOTAL DE ADMINISTRADORES:' as resultado,
    COUNT(*) as total
FROM barberos 
WHERE rol = 'admin';
