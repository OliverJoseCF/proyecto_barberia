-- ============================================
-- CONFIGURACIÓN: Barberos y Galería
-- ============================================
-- Este script mejora la tabla de barberos y crea la tabla de galería
-- Ejecutar en Supabase SQL Editor

-- ============================================
-- 1. MEJORAR TABLA BARBEROS
-- ============================================

-- Agregar campos adicionales a la tabla barberos
ALTER TABLE public.barberos 
  ADD COLUMN IF NOT EXISTS foto_url TEXT,
  ADD COLUMN IF NOT EXISTS biografia TEXT,
  ADD COLUMN IF NOT EXISTS horario_preferido TEXT,
  ADD COLUMN IF NOT EXISTS orden INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW());

-- Agregar índice para orden
CREATE INDEX IF NOT EXISTS idx_barberos_orden ON public.barberos(orden);
CREATE INDEX IF NOT EXISTS idx_barberos_activo ON public.barberos(activo);

-- Comentarios para documentación
COMMENT ON COLUMN public.barberos.foto_url IS 'URL de la foto del barbero (almacenada en Supabase Storage)';
COMMENT ON COLUMN public.barberos.biografia IS 'Descripción breve del barbero, experiencia, etc.';
COMMENT ON COLUMN public.barberos.horario_preferido IS 'Horario preferido o disponibilidad (texto libre)';
COMMENT ON COLUMN public.barberos.orden IS 'Orden de visualización en la página (menor = primero)';

-- ============================================
-- 2. CREAR TABLA GALERÍA
-- ============================================

CREATE TABLE IF NOT EXISTS public.galeria (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titulo VARCHAR(200) NOT NULL,
  descripcion TEXT,
  imagen_url TEXT NOT NULL,
  categoria VARCHAR(50),
  activo BOOLEAN DEFAULT true,
  orden INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Índices para galería
CREATE INDEX IF NOT EXISTS idx_galeria_categoria ON public.galeria(categoria);
CREATE INDEX IF NOT EXISTS idx_galeria_activo ON public.galeria(activo);
CREATE INDEX IF NOT EXISTS idx_galeria_orden ON public.galeria(orden);

-- Comentarios
COMMENT ON TABLE public.galeria IS 'Galería de trabajos realizados en la barbería';
COMMENT ON COLUMN public.galeria.titulo IS 'Nombre o título de la imagen';
COMMENT ON COLUMN public.galeria.descripcion IS 'Descripción opcional del trabajo';
COMMENT ON COLUMN public.galeria.imagen_url IS 'URL de la imagen (almacenada en Supabase Storage)';
COMMENT ON COLUMN public.galeria.categoria IS 'Categoría: Cortes, Barba, Diseños, Infantil, etc.';
COMMENT ON COLUMN public.galeria.orden IS 'Orden de visualización (menor = primero)';

-- ============================================
-- 3. TRIGGER: Auto-actualizar updated_at
-- ============================================

-- Trigger para barberos
DROP TRIGGER IF EXISTS set_updated_at_barberos ON public.barberos;
CREATE TRIGGER set_updated_at_barberos
  BEFORE UPDATE ON public.barberos
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- Trigger para galería
DROP TRIGGER IF EXISTS set_updated_at_galeria ON public.galeria;
CREATE TRIGGER set_updated_at_galeria
  BEFORE UPDATE ON public.galeria
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- ============================================
-- 4. DATOS INICIALES DE EJEMPLO - Barberos
-- ============================================

-- Insertar barberos de ejemplo (solo si no existen)
INSERT INTO public.barberos (nombre, especialidad, telefono, email, foto_url, biografia, activo, orden)
VALUES 
  (
    'Carlos Méndez',
    'Cortes clásicos y modernos',
    '5551234567',
    'carlos@cantabarba.com',
    '/placeholder-barber-1.jpg',
    'Más de 10 años de experiencia en barbería tradicional. Especialista en fades y cortes clásicos.',
    true,
    1
  ),
  (
    'Luis Fernández',
    'Diseños artísticos y barba',
    '5559876543',
    'luis@cantabarba.com',
    '/placeholder-barber-2.jpg',
    'Experto en diseños creativos y cuidado de barba. Ganador de múltiples competencias de barbería.',
    true,
    2
  ),
  (
    'Miguel Torres',
    'Cortes infantiles y familiares',
    '5555555555',
    'miguel@cantabarba.com',
    '/placeholder-barber-3.jpg',
    'Especialista en cortes infantiles con 8 años de experiencia. Paciencia y creatividad son mi sello.',
    true,
    3
  )
ON CONFLICT (nombre) DO NOTHING;

-- ============================================
-- 5. DATOS INICIALES DE EJEMPLO - Galería
-- ============================================

-- Insertar imágenes de ejemplo (solo si no existen)
INSERT INTO public.galeria (titulo, descripcion, imagen_url, categoria, activo, orden)
VALUES 
  ('Fade Clásico', 'Degradado perfecto con acabado impecable', '/placeholder-gallery-1.jpg', 'Cortes', true, 1),
  ('Barba Completa', 'Recorte y perfilado de barba profesional', '/placeholder-gallery-2.jpg', 'Barba', true, 2),
  ('Diseño Artístico', 'Diseño personalizado con detalles únicos', '/placeholder-gallery-3.jpg', 'Diseños', true, 3),
  ('Corte Infantil', 'Corte divertido para los más pequeños', '/placeholder-gallery-4.jpg', 'Infantil', true, 4),
  ('Pompadour Moderno', 'Estilo vintage con toque contemporáneo', '/placeholder-gallery-5.jpg', 'Cortes', true, 5),
  ('Barba y Bigote', 'Tratamiento completo con productos premium', '/placeholder-gallery-6.jpg', 'Barba', true, 6);

-- ============================================
-- 6. HABILITAR REALTIME
-- ============================================

-- Habilitar Realtime para barberos
ALTER PUBLICATION supabase_realtime ADD TABLE public.barberos;

-- Habilitar Realtime para galería
ALTER PUBLICATION supabase_realtime ADD TABLE public.galeria;

-- ============================================
-- 7. ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS para barberos
ALTER TABLE public.barberos ENABLE ROW LEVEL SECURITY;

-- Policy: Lectura pública
CREATE POLICY "Barberos son visibles públicamente"
  ON public.barberos FOR SELECT
  USING (true);

-- Policy: Solo admins pueden insertar/actualizar/eliminar
CREATE POLICY "Solo admins pueden modificar barberos"
  ON public.barberos FOR ALL
  USING (true) -- Temporalmente abierto, ajustar según autenticación
  WITH CHECK (true);

-- Habilitar RLS para galería
ALTER TABLE public.galeria ENABLE ROW LEVEL SECURITY;

-- Policy: Lectura pública
CREATE POLICY "Galería es visible públicamente"
  ON public.galeria FOR SELECT
  USING (true);

-- Policy: Solo admins pueden insertar/actualizar/eliminar
CREATE POLICY "Solo admins pueden modificar galería"
  ON public.galeria FOR ALL
  USING (true) -- Temporalmente abierto, ajustar según autenticación
  WITH CHECK (true);

-- ============================================
-- 8. VERIFICACIÓN
-- ============================================

-- Verificar barberos
SELECT 'Barberos creados:' as mensaje, COUNT(*) as total FROM public.barberos;

-- Verificar galería
SELECT 'Imágenes en galería:' as mensaje, COUNT(*) as total FROM public.galeria;

-- Verificar triggers
SELECT 
  trigger_name, 
  event_manipulation, 
  event_object_table
FROM information_schema.triggers 
WHERE event_object_table IN ('barberos', 'galeria')
ORDER BY event_object_table, trigger_name;

-- ============================================
-- ✅ SCRIPT COMPLETADO
-- ============================================
-- Las tablas barberos y galeria están listas para usar
-- Recuerda configurar Supabase Storage para las imágenes:
-- 1. Crear bucket "barberos" para fotos de barberos
-- 2. Crear bucket "galeria" para imágenes de trabajos
-- 3. Configurar políticas de acceso público para lectura
