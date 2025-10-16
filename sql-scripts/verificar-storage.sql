-- VERIFICAR POLÍTICAS DE STORAGE

-- 1. Ver detalles completos de las políticas
SELECT 
  policyname,
  cmd as operacion,
  roles,
  CASE 
    WHEN qual IS NOT NULL THEN 'Tiene restricción USING'
    ELSE 'Sin restricción USING'
  END as using_status,
  CASE 
    WHEN with_check IS NOT NULL THEN 'Tiene restricción WITH CHECK'
    ELSE 'Sin restricción WITH CHECK'
  END as with_check_status
FROM pg_policies
WHERE tablename = 'objects'
  AND (policyname LIKE '%barberos%' OR policyname LIKE '%galeria%')
ORDER BY policyname;

-- 2. Verificar que buckets existan y sean públicos
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets
WHERE id IN ('barberos', 'galeria');
