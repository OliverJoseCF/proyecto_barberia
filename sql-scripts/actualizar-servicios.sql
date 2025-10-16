-- ============================================
-- ACTUALIZACIÓN DE TABLA SERVICIOS
-- ============================================
-- Este script agrega mejoras a la tabla de servicios existente
-- Ejecutar DESPUÉS de haber creado el schema original

-- Agregar campo categoría si no existe
ALTER TABLE public.servicios 
ADD COLUMN IF NOT EXISTS categoria VARCHAR(50);

-- Actualizar constraint de nombre para que sea más flexible
ALTER TABLE public.servicios 
DROP CONSTRAINT IF EXISTS servicios_nombre_key;

CREATE UNIQUE INDEX IF NOT EXISTS idx_servicios_nombre_unique 
ON public.servicios(LOWER(nombre));

-- Agregar índices para optimización
CREATE INDEX IF NOT EXISTS idx_servicios_activo ON public.servicios(activo);
CREATE INDEX IF NOT EXISTS idx_servicios_categoria ON public.servicios(categoria);
CREATE INDEX IF NOT EXISTS idx_servicios_precio ON public.servicios(precio);

-- Actualizar categorías de servicios existentes (opcional)
UPDATE public.servicios 
SET categoria = CASE 
  WHEN nombre ILIKE '%barba%' THEN 'Barba'
  WHEN nombre ILIKE '%niño%' OR nombre ILIKE '%niños%' THEN 'Infantil'
  WHEN nombre ILIKE '%completo%' OR nombre ILIKE '%combo%' THEN 'Paquetes'
  WHEN nombre ILIKE '%facial%' OR nombre ILIKE '%cejas%' THEN 'Facial'
  ELSE 'Cortes'
END
WHERE categoria IS NULL;

-- ============================================
-- HABILITAR REALTIME (IMPORTANTE)
-- ============================================
-- Nota: También debes habilitar Realtime desde la UI de Supabase
-- Database → Replication → Activar "servicios"

-- Verificar que RLS esté habilitado
ALTER TABLE public.servicios ENABLE ROW LEVEL SECURITY;

-- Crear políticas si no existen
DO $$ 
BEGIN
  -- Política de lectura pública
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'servicios' AND policyname = 'Permitir lectura pública de servicios'
  ) THEN
    CREATE POLICY "Permitir lectura pública de servicios"
      ON public.servicios FOR SELECT
      USING (true);
  END IF;

  -- Política de modificación (temporal: permitir todo)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'servicios' AND policyname = 'Permitir modificación de servicios'
  ) THEN
    CREATE POLICY "Permitir modificación de servicios"
      ON public.servicios FOR ALL
      USING (true);
  END IF;
END $$;

-- ============================================
-- COMENTARIOS
-- ============================================
COMMENT ON COLUMN public.servicios.categoria IS 'Categoría del servicio: Cortes, Barba, Paquetes, Facial, Infantil, etc.';
COMMENT ON COLUMN public.servicios.activo IS 'Si el servicio está disponible para reservas';
COMMENT ON COLUMN public.servicios.duracion IS 'Duración del servicio en minutos';

-- ============================================
-- VERIFICACIÓN
-- ============================================
-- Ejecuta esto para verificar que todo está correcto:
-- SELECT * FROM servicios ORDER BY categoria, nombre;
