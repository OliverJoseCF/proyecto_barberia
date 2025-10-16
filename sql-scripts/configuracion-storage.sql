-- ========================================
-- CONFIGURACIÓN DE SUPABASE STORAGE
-- Buckets para Barberos y Galería
-- ========================================

-- 1. CREAR BUCKETS
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  (
    'barberos',
    'barberos',
    true,
    2097152, -- 2MB en bytes
    ARRAY['image/jpeg', 'image/png', 'image/webp']
  ),
  (
    'galeria',
    'galeria',
    true,
    5242880, -- 5MB en bytes
    ARRAY['image/jpeg', 'image/png', 'image/webp']
  )
ON CONFLICT (id) DO NOTHING;

-- 2. POLÍTICAS PARA BUCKET 'barberos'

-- Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "Public can read barberos images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can upload barberos images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can update barberos images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can delete barberos images" ON storage.objects;

-- Lectura pública (GET)
CREATE POLICY "Public can read barberos images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'barberos');

-- Subida autenticada (POST)
CREATE POLICY "Authenticated can upload barberos images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'barberos');

-- Actualización autenticada (PUT)
CREATE POLICY "Authenticated can update barberos images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'barberos');

-- Eliminación autenticada (DELETE)
CREATE POLICY "Authenticated can delete barberos images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'barberos');

-- 3. POLÍTICAS PARA BUCKET 'galeria'

-- Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "Public can read galeria images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can upload galeria images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can update galeria images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can delete galeria images" ON storage.objects;

-- Lectura pública (GET)
CREATE POLICY "Public can read galeria images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'galeria');

-- Subida autenticada (POST)
CREATE POLICY "Authenticated can upload galeria images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'galeria');

-- Actualización autenticada (PUT)
CREATE POLICY "Authenticated can update galeria images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'galeria');

-- Eliminación autenticada (DELETE)
CREATE POLICY "Authenticated can delete galeria images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'galeria');

-- ========================================
-- VERIFICACIÓN
-- ========================================

-- Ver buckets creados
SELECT id, name, public, file_size_limit, allowed_mime_types
FROM storage.buckets
WHERE id IN ('barberos', 'galeria');

-- Ver políticas creadas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'objects'
  AND (
    policyname LIKE '%barberos%' 
    OR policyname LIKE '%galeria%'
  )
ORDER BY policyname;

-- ========================================
-- NOTAS
-- ========================================

/*
✅ Buckets Creados:
  - barberos: 2MB max, público, JPG/PNG/WEBP
  - galeria: 5MB max, público, JPG/PNG/WEBP

✅ Políticas RLS:
  - Lectura pública para ambos buckets
  - Escritura solo para usuarios autenticados

🔒 Seguridad:
  - Los archivos son públicamente accesibles (public = true)
  - Solo usuarios autenticados pueden subir/modificar/eliminar
  - Límites de tamaño y tipo MIME configurados

📝 URLs de acceso:
  - Barberos: https://[proyecto].supabase.co/storage/v1/object/public/barberos/[archivo]
  - Galería: https://[proyecto].supabase.co/storage/v1/object/public/galeria/[archivo]
*/
