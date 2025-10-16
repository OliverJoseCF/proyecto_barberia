# 📦 Configuración de Supabase Storage

Esta guía te ayudará a configurar el almacenamiento de imágenes en Supabase para las funcionalidades de **Barberos** y **Galería**.

---

## 🎯 Objetivo

Permitir la subida de imágenes desde las páginas de administración:
- **Barberos**: Fotos de perfil de los barberos
- **Galería**: Fotos de trabajos realizados

---

## 📋 Pasos de Configuración

### 1️⃣ Crear Bucket para Barberos

1. **Accede a Supabase Dashboard** → Tu proyecto → **Storage**
2. Haz clic en **"New bucket"**
3. Configura el bucket con estos valores:

   ```
   Nombre del bucket: barberos
   Público: ✅ (Activado)
   File size limit: 2MB
   Allowed MIME types: image/jpeg, image/png, image/webp
   ```

4. Haz clic en **"Create bucket"**

---

### 2️⃣ Crear Bucket para Galería

1. En **Storage**, haz clic en **"New bucket"** nuevamente
2. Configura este bucket:

   ```
   Nombre del bucket: galeria
   Público: ✅ (Activado)
   File size limit: 5MB
   Allowed MIME types: image/jpeg, image/png, image/webp
   ```

3. Haz clic en **"Create bucket"**

---

### 3️⃣ Configurar Políticas de Seguridad (RLS)

#### Para el bucket **barberos**:

1. Ve a **Storage** → Click en bucket **"barberos"** → Pestaña **"Policies"**
2. Haz clic en **"New policy"**
3. Crea 2 políticas:

**Política 1: Lectura Pública (GET)**
```sql
-- Nombre: Public Read Access
-- Operación: SELECT (GET)
-- Target roles: public

-- Definición de política:
CREATE POLICY "Public can read barberos images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'barberos');
```

**Política 2: Escritura Autenticada (INSERT/UPDATE/DELETE)**
```sql
-- Nombre: Authenticated can upload
-- Operación: INSERT (POST)
-- Target roles: authenticated

-- Definición de política:
CREATE POLICY "Authenticated users can upload barberos images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'barberos');

-- También para UPDATE y DELETE:
CREATE POLICY "Authenticated users can update barberos images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'barberos');

CREATE POLICY "Authenticated users can delete barberos images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'barberos');
```

#### Para el bucket **galeria**:

Repite el mismo proceso con el bucket **"galeria"**:

```sql
-- Lectura pública
CREATE POLICY "Public can read galeria images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'galeria');

-- Escritura autenticada
CREATE POLICY "Authenticated users can upload galeria images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'galeria');

CREATE POLICY "Authenticated users can update galeria images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'galeria');

CREATE POLICY "Authenticated users can delete galeria images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'galeria');
```

---

### 4️⃣ Verificar Configuración

1. **Ve a Storage** en Supabase Dashboard
2. Deberías ver 2 buckets:
   - ✅ **barberos** (Public, 2MB max)
   - ✅ **galeria** (Public, 5MB max)

3. Click en cada bucket → **Policies** y verifica que tengas:
   - ✅ 1 política de lectura pública (`SELECT`)
   - ✅ 3 políticas de escritura autenticada (`INSERT`, `UPDATE`, `DELETE`)

---

## 🔓 Alternativa Temporal: Políticas Abiertas

Si tienes problemas con las políticas autenticadas, puedes usar estas temporalmente (⚠️ **No recomendado para producción**):

```sql
-- SOLO PARA DESARROLLO - Permitir todo a todos
CREATE POLICY "Allow all operations on barberos"
ON storage.objects FOR ALL
TO public
USING (bucket_id = 'barberos')
WITH CHECK (bucket_id = 'barberos');

CREATE POLICY "Allow all operations on galeria"
ON storage.objects FOR ALL
TO public
USING (bucket_id = 'galeria')
WITH CHECK (bucket_id = 'galeria');
```

---

## ✅ Verificación Final

### Prueba de Subida de Imagen

1. **Ve a Admin Panel** → **Gestión de Barberos**
2. Haz clic en **"Agregar Barbero"**
3. En el campo de imagen, haz clic en el botón de **upload** (📤)
4. Selecciona una imagen (JPG, PNG o WEBP, máximo 2MB)
5. Si todo está bien configurado:
   - ✅ Verás un mensaje de éxito
   - ✅ La imagen aparecerá en el preview
   - ✅ El campo `foto_url` se llenará automáticamente

### Prueba de Galería

1. **Ve a Admin Panel** → **Gestión de Galería**
2. Haz clic en **"Agregar Imagen"**
3. Sube una imagen (máximo 5MB)
4. Verifica que funcione igual que con Barberos

---

## 🚀 Habilitar Código de Subida en los Componentes

Una vez que hayas configurado Storage, debes descomentar el código de subida en los componentes:

### En `BarberManagement.tsx`:

Busca la función `handleImageUpload` y descomenta el bloque que dice:

```typescript
/* CÓDIGO PARA DESPUÉS DE CONFIGURAR STORAGE:
  
  import { supabase } from '@/lib/supabase';
  
  // ... resto del código
*/
```

Reemplázalo con el código activo (quita el comentario).

### En `GalleryManagement.tsx`:

Haz lo mismo con la función `handleImageUpload`.

---

## ⚠️ Problemas Comunes

### 1. "Error: new row violates row-level security policy"
- **Causa**: Las políticas RLS no están bien configuradas
- **Solución**: Verifica que las políticas de INSERT/UPDATE/DELETE existan y sean para `authenticated` users

### 2. "Error: Bucket not found"
- **Causa**: El nombre del bucket no coincide
- **Solución**: Verifica que los buckets se llamen exactamente `barberos` y `galeria`

### 3. "Error: File size limit exceeded"
- **Causa**: La imagen es muy grande
- **Solución**: Reduce el tamaño de la imagen a máximo 2MB (barberos) o 5MB (galería)

### 4. "Error: Invalid MIME type"
- **Causa**: Formato de imagen no permitido
- **Solución**: Solo usa JPG, PNG o WEBP

---

## 📝 Notas Adicionales

1. **URLs de Imágenes**: 
   - Las URLs generadas son públicas y permanentes
   - Formato: `https://[proyecto].supabase.co/storage/v1/object/public/barberos/[archivo]`

2. **Optimización de Imágenes**:
   - Supabase Storage puede servir imágenes optimizadas
   - Puedes agregar transformaciones a la URL (resize, format, quality)

3. **Eliminación de Imágenes**:
   - Cuando elimines un barbero o imagen de galería, la imagen en Storage **NO** se elimina automáticamente
   - Considera implementar lógica para eliminar archivos huérfanos periódicamente

---

## ✨ ¡Listo!

Una vez completados estos pasos:
- ✅ Podrás subir imágenes de barberos desde el panel de administración
- ✅ Podrás agregar fotos a la galería
- ✅ Las imágenes se mostrarán en las páginas públicas (Team y Gallery)
- ✅ Todo funcionará en tiempo real con Realtime activado

---

**¿Necesitas ayuda?** Revisa la [documentación oficial de Supabase Storage](https://supabase.com/docs/guides/storage)
