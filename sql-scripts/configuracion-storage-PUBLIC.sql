-- ========================================
-- CONFIGURACIÓN DE SUPABASE STORAGE
-- Políticas PÚBLICAS para desarrollo
-- ========================================

-- 1. CREAR BUCKETS (si no existen)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  (
    'barberos',
    'barberos',
    true,
    2097152, -- 2MB en bytes
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
  ),
  (
    'galeria',
    'galeria',
    true,
    5242880, -- 5MB en bytes
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
  )
ON CONFLICT (id) DO UPDATE
SET 
  public = true,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ========================================
-- 2. ELIMINAR POLÍTICAS ANTERIORES
-- ========================================

DROP POLICY IF EXISTS "Public can read barberos images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can upload barberos images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can update barberos images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can delete barberos images" ON storage.objects;
DROP POLICY IF EXISTS "Public can read galeria images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can upload galeria images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can update galeria images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can delete galeria images" ON storage.objects;

-- Políticas públicas (más permisivas para desarrollo)
DROP POLICY IF EXISTS "Public access to barberos" ON storage.objects;
DROP POLICY IF EXISTS "Public access to galeria" ON storage.objects;

-- ========================================
-- 3. CREAR POLÍTICAS PÚBLICAS (DESARROLLO)
-- ========================================

-- BARBEROS: Acceso público total (para desarrollo)
CREATE POLICY "Public access to barberos"
ON storage.objects FOR ALL
TO public
USING (bucket_id = 'barberos')
WITH CHECK (bucket_id = 'barberos');

-- GALERÍA: Acceso público total (para desarrollo)
CREATE POLICY "Public access to galeria"
ON storage.objects FOR ALL
TO public
USING (bucket_id = 'galeria')
WITH CHECK (bucket_id = 'galeria');

-- ========================================
-- ALTERNATIVA: POLÍTICAS MÁS ESPECÍFICAS
-- (Comenta las de arriba y descomenta estas si prefieres más seguridad)
-- ========================================

/*
-- BARBEROS - Lectura pública, escritura pública
CREATE POLICY "Anyone can read barberos images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'barberos');

CREATE POLICY "Anyone can upload barberos images"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'barberos');

CREATE POLICY "Anyone can update barberos images"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'barberos');

CREATE POLICY "Anyone can delete barberos images"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'barberos');

-- GALERÍA - Lectura pública, escritura pública
CREATE POLICY "Anyone can read galeria images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'galeria');

CREATE POLICY "Anyone can upload galeria images"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'galeria');

CREATE POLICY "Anyone can update galeria images"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'galeria');

CREATE POLICY "Anyone can delete galeria images"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'galeria');
*/

-- ========================================
-- 4. VERIFICACIÓN
-- ========================================

-- Ver buckets creados
SELECT 
  id, 
  name, 
  public,
  file_size_limit,
  allowed_mime_types,
  created_at
FROM storage.buckets
WHERE id IN ('barberos', 'galeria');

-- Ver políticas creadas
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'objects'
  AND (
    policyname LIKE '%barberos%' 
    OR policyname LIKE '%galeria%'
  )
ORDER BY policyname;

-- Contar políticas activas
SELECT 
  COUNT(*) as total_policies,
  COUNT(*) FILTER (WHERE policyname LIKE '%barberos%') as barberos_policies,
  COUNT(*) FILTER (WHERE policyname LIKE '%galeria%') as galeria_policies
FROM pg_policies
WHERE tablename = 'objects'
  AND (policyname LIKE '%barberos%' OR policyname LIKE '%galeria%');

-- ========================================
-- NOTAS IMPORTANTES
-- ========================================

/*
⚠️ SEGURIDAD:
- Estas políticas permiten acceso PÚBLICO TOTAL
- Son ideales para DESARROLLO
- Para PRODUCCIÓN, considera usar políticas autenticadas

✅ BUCKETS:
- barberos: 2MB max, público
- galeria: 5MB max, público
- Formatos: JPG, JPEG, PNG, WEBP

🔒 PARA PRODUCCIÓN (más adelante):
1. Comenta las políticas "Public access to..."
2. Descomenta las políticas específicas
3. Cambia 'public' por 'authenticated' en TO clause
4. Implementa autenticación en el frontend

📝 URLS DE ACCESO:
- Barberos: https://[tu-proyecto].supabase.co/storage/v1/object/public/barberos/[archivo]
- Galería: https://[tu-proyecto].supabase.co/storage/v1/object/public/galeria/[archivo]

🧪 PRUEBA:
Después de ejecutar este script, intenta subir una imagen.
Si aún falla, verifica en Dashboard → Storage → Policies
*/
