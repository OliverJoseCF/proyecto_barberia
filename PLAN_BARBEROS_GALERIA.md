# 📋 PLAN DE IMPLEMENTACIÓN: Barberos y Galería

## 🎯 Objetivo
Implementar gestión completa de **Barberos** y **Galería** en el panel admin con funcionalidad CRUD, Realtime, y sincronización con páginas públicas.

---

## ✅ Tareas Completadas

### 1. Scripts SQL
- ✅ `configuracion-barberos-galeria.sql` creado y ejecutado
  - Mejora tabla `barberos` (foto_url, biografia, horario_preferido, orden)
  - Crea tabla `galeria` (titulo, descripcion, imagen_url, categoria, orden)
  - Triggers auto-update
  - Realtime habilitado
  - RLS configurado
  - Datos iniciales de ejemplo (3 barberos, 6 imágenes)

### 2. Hooks Personalizados

#### use-barberos.ts
- ✅ Actualizado con nuevos campos en interfaz Barbero
  - Agregados: foto_url, biografia, horario_preferido, orden, timestamps
  - Solo muestra barberos activos (para página pública)
  - Ordenado alfabéticamente

#### use-barberos-admin.ts
- ✅ Creado completo
  - CRUD completo con actualización optimista
  - Realtime con prevención de duplicados
  - Funciones: agregar, actualizar, eliminar, toggleActivo, reordenar
  - Filtro por activos/inactivos (incluirInactivos: boolean)
  - Ordenado por campo `orden`

#### use-galeria.ts
- ✅ Creado completo
  - CRUD completo con actualización optimista
  - Realtime con prevención de duplicados
  - Funciones: agregar, actualizar, eliminar, toggleActivo, reordenar
  - filtrarPorCategoria(), obtenerCategorias()
  - Filtro por activos/inactivos
  - Ordenado por campo `orden`

### 3. Componentes UI
- ✅ `Textarea.tsx` creado (componente Shadcn-style para formularios)

### 4. Componentes Admin

#### BarberManagement.tsx
- ✅ Reescrito completamente (680 líneas)
  - Modal para agregar/editar barbero
  - Grid responsive (1/2/3 columnas)
  - Tarjetas con preview de foto
  - Búsqueda por nombre/especialidad/email
  - Toggle activo/inactivo inline
  - Eliminar con confirmación
  - Formulario completo con todos los campos
  - Placeholder para subida de imagen (comentado - requiere Storage)
  - Animaciones con Framer Motion
  - Estados de carga y vacío
  - Usa hook `use-barberos-admin`

#### GalleryManagement.tsx
- ✅ Reescrito completamente (680 líneas)
  - Modal para agregar/editar imagen
  - Grid responsive masonry (1/2/3/4 columnas)
  - Preview de imagen en tarjetas
  - Búsqueda por título/descripción
  - Filtro por categoría (dropdown)
  - Toggle activo/inactivo con overlay hover
  - Eliminar con confirmación
  - Preview de imagen en formulario
  - Placeholder para subida (comentado - requiere Storage)
  - Badges de categoría y estado
  - Orden visible en tarjetas
  - Usa hook `use-galeria`

### 5. Páginas Públicas

#### Team.tsx
- ✅ Sincronizado con base de datos
  - Usa hook `useBarberos()` (solo activos)
  - Muestra foto_url, biografia, horario_preferido
  - Loading state con spinner
  - Empty state (sin barberos activos)
  - Placeholder inteligente para fotos rotas (inicial del nombre)
  - Mantiene diseño 3D cards original
  - Animaciones preservadas
  - Condicional para mostrar campos opcionales

#### Gallery.tsx
- ✅ Sincronizado con base de datos
  - Usa hook `useGaleria(false)` (solo activas)
  - Convierte imágenes a formato Carousel
  - Loading state con spinner
  - Empty state (sin imágenes activas)
  - Filtro por categoría implementado
  - Botones dinámicos según categoría
  - Mantiene diseño Carousel original

---

## ⏳ Tareas Pendientes

### 6. Configuración de Supabase Storage (USUARIO)
**Requiere acción del usuario en Supabase Dashboard:**

- [ ] Crear bucket `barberos`
  - Público: ✅
  - Max size: 2MB
  - MIME types: image/jpeg, image/png, image/webp
  - Políticas RLS: lectura pública, escritura autenticada

- [ ] Crear bucket `galeria`
  - Público: ✅
  - Max size: 5MB
  - MIME types: image/jpeg, image/png, image/webp
  - Políticas RLS: lectura pública, escritura autenticada

- [ ] Descomentar código de subida en:
  - `BarberManagement.tsx` → función `handleImageUpload`
  - `GalleryManagement.tsx` → función `handleImageUpload`

**Guía:** Ver archivo `CONFIGURACION_STORAGE_SUPABASE.md`

### 7. Testing Completo
- [ ] Ejecutar checklist de pruebas completa
- [ ] Verificar Realtime en múltiples pestañas
- [ ] Validar formularios
- [ ] Probar responsive en móvil/tablet
- [ ] Verificar animaciones

**Guía:** Ver archivo `CHECKLIST_PRUEBAS_BARBEROS_GALERIA.md`

---

## 📦 Archivos Creados/Modificados

### Nuevos
1. `sql-scripts/configuracion-barberos-galeria.sql` (198 líneas)
2. `hooks/use-barberos-admin.ts` (230 líneas)
3. `hooks/use-galeria.ts` (255 líneas)
4. `components/ui/textarea.tsx` (28 líneas)
5. `PLAN_BARBEROS_GALERIA.md` (este archivo)
6. `CONFIGURACION_STORAGE_SUPABASE.md` (guía paso a paso)
7. `CHECKLIST_PRUEBAS_BARBEROS_GALERIA.md` (checklist completa)

### Modificados
1. `hooks/use-barberos.ts` (interfaz actualizada con nuevos campos)
2. `pages/admin/BarberManagement.tsx` (reescrito completamente)
3. `pages/admin/GalleryManagement.tsx` (reescrito completamente)
4. `components/Team.tsx` (sincronizado con BD)
5. `components/Gallery.tsx` (sincronizado con BD)

---

## 🎯 Estado Actual

### ✅ Completado (90%)
- Scripts SQL ejecutados
- Hooks creados y funcionales
- Componentes admin reescritos
- Páginas públicas sincronizadas
- Documentación completa

### ⏳ Pendiente (10%)
- Configuración de Storage (usuario debe hacerlo manualmente)
- Testing final

#### GalleryManagement.tsx
**Estado:** Pendiente
**Funcionalidades requeridas:**
- [ ] Grid de imágenes (masonry layout)
- [ ] Modal agregar imagen
- [ ] Subida de imagen a Supabase Storage
- [ ] Edición de título/descripción/categoría
- [ ] Filtros por categoría
- [ ] Reordenamiento drag-and-drop
- [ ] Vista previa de imágenes
- [ ] Toggle activo/inactivo
- [ ] Búsqueda
- [ ] Diseño responsive

### 4. Supabase Storage (TODO)
**Buckets a crear:**
- [ ] `barberos` - Fotos de barberos
  - Política: Lectura pública, escritura autenticada
  - Formatos: JPG, PNG, WEBP
  - Tamaño máximo: 2MB
  
- [ ] `galeria` - Imágenes de trabajos
  - Política: Lectura pública, escritura autenticada
  - Formatos: JPG, PNG, WEBP
  - Tamaño máximo: 5MB

### 5. Sincronización con Páginas Públicas (TODO)

#### Team.tsx
**Estado:** Pendiente
**Cambios:**
- [ ] Reemplazar array hardcoded con `useBarberos(false)`
- [ ] Usar fotos de BD (barbero.foto_url)
- [ ] Mostrar biografía dinámica
- [ ] Mostrar especialidad
- [ ] Loading state
- [ ] Empty state

#### Gallery.tsx
**Estado:** Pendiente
**Cambios:**
- [ ] Reemplazar array hardcoded con `useGaleria(false)`
- [ ] Usar imágenes de BD
- [ ] Filtros por categoría
- [ ] Modal con detalles
- [ ] Loading state con skeleton
- [ ] Empty state

### 6. Testing (TODO)
- [ ] Ejecutar script SQL en Supabase
- [ ] Crear buckets en Storage
- [ ] Configurar políticas de Storage
- [ ] Probar CRUD de barberos
- [ ] Probar CRUD de galería
- [ ] Verificar Realtime funciona
- [ ] Validar sincronización con páginas públicas
- [ ] Probar subida de imágenes
- [ ] Probar reordenamiento
- [ ] Probar en múltiples pestañas

---

## 📦 Archivos Nuevos Creados

```
sql-scripts/
  └── configuracion-barberos-galeria.sql ✅

src/hooks/
  ├── use-barberos-admin.ts ✅
  └── use-galeria.ts ✅

src/pages/admin/
  ├── BarberManagement.tsx 🚧 (en progreso)
  └── GalleryManagement.tsx ⏳ (pendiente)
```

---

## 🔄 Siguiente Paso

**Ahora:** Completar `BarberManagement.tsx` con todas las funcionalidades CRUD y subida de imágenes.

**Después:** Crear `GalleryManagement.tsx` completo.

**Finalmente:** Sincronizar con páginas públicas.

---

## 📝 Notas Importantes

1. **Realtime:** Ya está configurado en los hooks, funcionará automáticamente
2. **Actualización Optimista:** Implementada en todos los hooks para UX inmediata
3. **Rollback:** Los hooks revierten cambios si la operación falla
4. **Prevención de Duplicados:** Los canales Realtime validan antes de agregar
5. **Storage:** Requiere configuración manual en Supabase Dashboard
