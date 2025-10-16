# 🚀 INSTRUCCIONES RÁPIDAS - CONFIGURAR STORAGE

## ⚡ Paso 1: Ejecutar Script SQL

**Copia y pega esto en Supabase SQL Editor:**

```sql
-- CONFIGURACIÓN DE STORAGE PARA BARBEROS Y GALERÍA

-- 1. CREAR BUCKETS
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('barberos', 'barberos', true, 2097152, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('galeria', 'galeria', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- 2. POLÍTICAS BUCKET 'barberos'
DROP POLICY IF EXISTS "Public can read barberos images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can upload barberos images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can update barberos images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can delete barberos images" ON storage.objects;

CREATE POLICY "Public can read barberos images"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'barberos');

CREATE POLICY "Authenticated can upload barberos images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'barberos');

CREATE POLICY "Authenticated can update barberos images"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'barberos');

CREATE POLICY "Authenticated can delete barberos images"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'barberos');

-- 3. POLÍTICAS BUCKET 'galeria'
DROP POLICY IF EXISTS "Public can read galeria images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can upload galeria images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can update galeria images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can delete galeria images" ON storage.objects;

CREATE POLICY "Public can read galeria images"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'galeria');

CREATE POLICY "Authenticated can upload galeria images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'galeria');

CREATE POLICY "Authenticated can update galeria images"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'galeria');

CREATE POLICY "Authenticated can delete galeria images"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'galeria');
```

## ✅ Paso 2: Verificar

Ejecuta esto para confirmar que todo está bien:

```sql
-- Ver buckets creados
SELECT id, name, public, file_size_limit, allowed_mime_types
FROM storage.buckets
WHERE id IN ('barberos', 'galeria');

-- Ver políticas creadas (deberías ver 8 políticas total)
SELECT policyname, cmd
FROM pg_policies
WHERE tablename = 'objects'
  AND (policyname LIKE '%barberos%' OR policyname LIKE '%galeria%')
ORDER BY policyname;
```

**Resultado esperado:**
- ✅ 2 buckets (barberos y galeria)
- ✅ 8 políticas (4 por bucket: SELECT, INSERT, UPDATE, DELETE)

## 🎉 ¡Listo!

Una vez ejecutado, ya puedes:
- ✅ Subir fotos de barberos desde el panel admin
- ✅ Subir imágenes de galería desde el panel admin
- ✅ Las imágenes se guardarán en Supabase Storage
- ✅ URLs públicas generadas automáticamente

---

**Nota:** El código ya está activado en los componentes. Solo necesitas ejecutar el script SQL.
