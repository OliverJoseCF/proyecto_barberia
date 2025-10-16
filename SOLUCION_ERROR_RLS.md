# 🔧 SOLUCIÓN AL ERROR: "new row violates row-level security policy"

## ❌ ¿Qué significa este error?

Las políticas de seguridad (RLS) de Supabase están bloqueando la subida de archivos porque no reconocen tu sesión como autorizada.

---

## ✅ SOLUCIÓN 1: Script SQL Mejorado (MÁS RÁPIDO)

### Ejecuta este script:

1. **Abre Supabase Dashboard** → SQL Editor
2. **Copia y pega** el contenido de: `sql-scripts/configuracion-storage-PUBLIC.sql`
3. **Click en "Run"**
4. **Verifica** que dice "Success" al final

Este script:
- ✅ Crea buckets si no existen
- ✅ Elimina políticas antiguas restrictivas
- ✅ Crea políticas PÚBLICAS (permiten subida sin autenticación)
- ✅ Configura límites de tamaño y tipos de archivo

---

## ✅ SOLUCIÓN 2: Configuración Manual en Dashboard

Si el script no funciona, hazlo manualmente:

### Paso 1: Crear Buckets

1. **Ir a:** Supabase Dashboard → **Storage**
2. **Click en:** "New bucket"
3. **Crear bucket `barberos`:**
   ```
   Name: barberos
   Public bucket: ✅ (ACTIVADO)
   File size limit: 2000000 (2MB)
   Allowed MIME types: image/jpeg,image/png,image/webp
   ```
4. **Click:** "Create bucket"
5. **Repetir** para bucket `galeria`:
   ```
   Name: galeria
   Public bucket: ✅ (ACTIVADO)
   File size limit: 5000000 (5MB)
   Allowed MIME types: image/jpeg,image/png,image/webp
   ```

### Paso 2: Configurar Políticas (CRÍTICO)

#### Para bucket `barberos`:

1. **Click en el bucket** `barberos`
2. **Ir a pestaña:** "Policies"
3. **Click:** "New Policy"
4. **Seleccionar:** "For full customization"
5. **Configurar así:**

   ```
   Policy name: Public access to barberos
   Allowed operation: All
   Policy definition (USING): true
   Policy definition (WITH CHECK): true
   Target roles: public
   ```

6. **Click:** "Save policy"

#### Para bucket `galeria`:

Repetir el mismo proceso:
```
Policy name: Public access to galeria
Allowed operation: All
Policy definition (USING): true
Policy definition (WITH CHECK): true
Target roles: public
```

---

## ✅ SOLUCIÓN 3: Deshabilitar RLS Temporalmente

**Solo para desarrollo local:**

1. **Ir a:** Storage → Settings
2. **Buscar:** "Enable RLS"
3. **Desactivar** RLS temporalmente
4. **Probar** la subida
5. **Reactivar** RLS después (importante para producción)

---

## 🧪 Verificación

Después de aplicar cualquier solución:

### 1. Verificar Buckets

```sql
SELECT id, name, public, file_size_limit
FROM storage.buckets
WHERE id IN ('barberos', 'galeria');
```

**Resultado esperado:**
```
id        | name      | public | file_size_limit
barberos  | barberos  | true   | 2097152
galeria   | galeria   | true   | 5242880
```

### 2. Verificar Políticas

```sql
SELECT policyname, cmd, roles
FROM pg_policies
WHERE tablename = 'objects'
  AND (policyname LIKE '%barberos%' OR policyname LIKE '%galeria%')
ORDER BY policyname;
```

**Resultado esperado:**
```
policyname                    | cmd | roles
Public access to barberos     | ALL | {public}
Public access to galeria      | ALL | {public}
```

### 3. Probar Subida

1. **Ir a:** Admin Panel → Gestión de Barberos
2. **Click:** + Agregar Barbero
3. **Click:** Botón Upload en foto
4. **Seleccionar** una imagen
5. **Esperar** toast de éxito

---

## 🔍 Diagnóstico Adicional

Si aún falla, verifica en **Supabase Dashboard → Storage → barberos → Policies**:

### Deberías ver:

```
✅ Public access to barberos
   - Type: ALL
   - Role: public
   - USING: true
   - WITH CHECK: true
```

### Si NO lo ves:

1. **Elimina** todas las políticas existentes
2. **Ejecuta** este SQL directo:

```sql
-- Eliminar todas las políticas del bucket barberos
DELETE FROM storage.policies WHERE bucket_id = 'barberos';
DELETE FROM storage.policies WHERE bucket_id = 'galeria';

-- Crear política simple
CREATE POLICY "Public access to barberos"
ON storage.objects FOR ALL
TO public
USING (bucket_id = 'barberos')
WITH CHECK (bucket_id = 'barberos');

CREATE POLICY "Public access to galeria"
ON storage.objects FOR ALL
TO public
USING (bucket_id = 'galeria')
WITH CHECK (bucket_id = 'galeria');
```

---

## 🐛 Errores Comunes

### Error: "Bucket not found"
**Solución:** Crea los buckets primero en Storage → New bucket

### Error: "Invalid MIME type"
**Solución:** Verifica que allowed_mime_types incluya el tipo de tu imagen

### Error: "File size exceeds limit"
**Solución:** Reduce el tamaño de la imagen o aumenta file_size_limit

### Error: "Failed to create policy"
**Solución:** Usa la interfaz visual (Dashboard) en vez de SQL

---

## 📞 Último Recurso

Si nada funciona:

1. **Ve a:** Supabase Dashboard → Storage → barberos
2. **Click:** "Upload file" manualmente
3. Si **funciona** → el problema es en el código
4. Si **NO funciona** → el problema es en las políticas

---

## ✅ Checklist Final

Antes de probar de nuevo:

```
[ ] Buckets creados (barberos y galeria)
[ ] Buckets marcados como "public"
[ ] Políticas con nombre "Public access to [bucket]"
[ ] Políticas con "ALL" operations
[ ] Políticas con role "public"
[ ] USING y WITH CHECK en "true"
[ ] Navegador sin caché (Ctrl+Shift+R)
[ ] Consola del navegador sin errores
```

---

## 🎯 Resumen

**El problema:** RLS bloqueando subidas

**Solución rápida:**
1. Ejecutar `configuracion-storage-PUBLIC.sql`
2. Verificar políticas en Dashboard
3. Probar subida

**Si falla:** Usar configuración manual en Dashboard (Solución 2)

---

**¿Necesitas ayuda adicional?** Comparte:
1. Screenshot del error completo
2. Screenshot de Storage → barberos → Policies
3. Output del script de verificación
