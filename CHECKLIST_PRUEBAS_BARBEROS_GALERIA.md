# ✅ Checklist de Pruebas - Gestión de Barberos y Galería

## 📋 Preparación

- [ ] Ejecutado script `configuracion-barberos-galeria.sql` en Supabase
- [ ] Verificado que existan datos de prueba en las tablas (3 barberos, 6 imágenes)
- [ ] Configurado Supabase Storage (buckets: `barberos` y `galeria`) *(Opcional - para subida de imágenes)*

---

## 🧑‍💼 Gestión de Barberos - Admin Panel

### ➕ Agregar Barbero

- [ ] Ir a `/admin/settings` → **Gestión de Barberos**
- [ ] Click en botón **"Agregar Barbero"**
- [ ] Llenar formulario:
  - [ ] Nombre: "Prueba Test" ✅ (Requerido)
  - [ ] Especialidad: "Cortes Modernos"
  - [ ] Email: "prueba@test.com"
  - [ ] Teléfono: "5551234567"
  - [ ] Foto URL: `https://placehold.co/150x150/1a1a1a/gold?text=PT`
  - [ ] Biografía: "Barbero de prueba para testing"
  - [ ] Horario Preferido: "Lun-Vie 9AM-5PM"
  - [ ] Orden: 99
  - [ ] Activo: ✅
- [ ] Click en **"Guardar"**
- [ ] **Resultado Esperado**: 
  - ✅ Mensaje de éxito "Barbero agregado correctamente"
  - ✅ Modal se cierra
  - ✅ **Barbero aparece INMEDIATAMENTE** en la lista (sin recargar página)
  - ✅ Tarjeta muestra foto, nombre, especialidad, badges

### ✏️ Editar Barbero

- [ ] Click en botón **Editar** (ícono lápiz) de "Prueba Test"
- [ ] Modal se abre con datos prellenados
- [ ] Cambiar:
  - [ ] Especialidad: "Diseños Capilares"
  - [ ] Biografía: "Barbero actualizado"
- [ ] Click en **"Actualizar"**
- [ ] **Resultado Esperado**:
  - ✅ Mensaje "Barbero actualizado correctamente"
  - ✅ Cambios se reflejan INMEDIATAMENTE en la tarjeta

### 👁️ Toggle Activo/Inactivo

- [ ] Click en ícono de **ojo** en tarjeta de "Prueba Test"
- [ ] **Resultado Esperado**:
  - ✅ Badge cambia de "Activo" (verde) a "Inactivo" (rojo)
  - ✅ Ícono cambia de ojo abierto a ojo cerrado
  - ✅ Cambio es INSTANTÁNEO
- [ ] Click nuevamente para activar
- [ ] **Resultado**: Badge vuelve a "Activo" (verde)

### 🔍 Búsqueda y Filtros

- [ ] En barra de búsqueda, escribir "Carlos"
- [ ] **Resultado**: Solo aparecen barberos con "Carlos" en nombre/especialidad/email
- [ ] Borrar búsqueda
- [ ] **Resultado**: Todos los barberos vuelven a aparecer

### 🗑️ Eliminar Barbero

- [ ] Click en botón **Eliminar** (ícono basura) de "Prueba Test"
- [ ] Aparece diálogo de confirmación
- [ ] Click en **"Aceptar"**
- [ ] **Resultado Esperado**:
  - ✅ Mensaje "Barbero eliminado correctamente"
  - ✅ Tarjeta desaparece INMEDIATAMENTE

---

## 🖼️ Gestión de Galería - Admin Panel

### ➕ Agregar Imagen

- [ ] Ir a `/admin/settings` → **Gestión de Galería**
- [ ] Click en **"Agregar Imagen"**
- [ ] Llenar formulario:
  - [ ] Título: "Corte de Prueba" ✅ (Requerido)
  - [ ] Imagen URL: `https://placehold.co/400x400/1a1a1a/gold?text=Test` ✅ (Requerido)
  - [ ] Descripción: "Esta es una imagen de prueba"
  - [ ] Categoría: "Cortes"
  - [ ] Orden: 99
  - [ ] Activo: ✅
- [ ] Click en **"Guardar"**
- [ ] **Resultado Esperado**:
  - ✅ Mensaje "Imagen agregada correctamente"
  - ✅ Modal se cierra
  - ✅ Imagen aparece INMEDIATAMENTE en el grid
  - ✅ Preview de imagen visible
  - ✅ Badges de categoría y estado presentes

### 🖼️ Preview de Imagen

- [ ] En el formulario de agregar/editar, pegar URL de imagen
- [ ] **Resultado**: Preview de imagen aparece arriba del campo URL
- [ ] Cambiar URL a una inválida
- [ ] **Resultado**: Placeholder de error se muestra

### ✏️ Editar Imagen

- [ ] Hacer hover sobre tarjeta de "Corte de Prueba"
- [ ] Aparece overlay oscuro con botones
- [ ] Click en botón **Editar** (ícono lápiz)
- [ ] Cambiar:
  - [ ] Título: "Corte Modificado"
  - [ ] Categoría: "Diseños"
- [ ] Click en **"Actualizar"**
- [ ] **Resultado**: Cambios se reflejan INMEDIATAMENTE

### 🔍 Filtros

**Por Búsqueda:**
- [ ] Escribir "Fade" en búsqueda
- [ ] **Resultado**: Solo aparecen imágenes con "Fade" en título o descripción

**Por Categoría:**
- [ ] En dropdown de categorías, seleccionar "Cortes"
- [ ] **Resultado**: Solo imágenes de categoría "Cortes"
- [ ] Seleccionar "Todas las categorías"
- [ ] **Resultado**: Todas las imágenes vuelven a aparecer

### 👁️ Toggle Activo/Inactivo

- [ ] Hacer hover sobre tarjeta de "Corte de Prueba"
- [ ] Click en botón **ojo** (verde)
- [ ] **Resultado**:
  - ✅ Badge cambia a "Inactiva" (rojo)
  - ✅ Botón se vuelve rojo con ojo cerrado
  - ✅ Cambio INSTANTÁNEO

### 🗑️ Eliminar Imagen

- [ ] Hover sobre "Corte de Prueba"
- [ ] Click en botón **Eliminar** (rojo)
- [ ] Confirmar eliminación
- [ ] **Resultado**:
  - ✅ Mensaje "Imagen eliminada correctamente"
  - ✅ Tarjeta desaparece INMEDIATAMENTE

---

## 👥 Página Pública - Team (Equipo)

### Visualización Básica

- [ ] Ir a `/` (página principal)
- [ ] Scroll hasta sección **"Nuestro Equipo"**
- [ ] **Resultado Esperado**:
  - ✅ Aparecen barberos de la base de datos
  - ✅ Solo barberos con `activo = true`
  - ✅ Fotos de perfil se cargan correctamente
  - ✅ Nombres y especialidades visibles
  - ✅ Biografía se muestra (si existe)
  - ✅ Horario preferido se muestra (si existe)

### Estados de Carga

- [ ] Recargar página con throttling de red lento
- [ ] **Resultado**: Spinner de carga aparece mientras se obtienen barberos
- [ ] Una vez cargado: Grid de tarjetas aparece con animaciones

### Sin Barberos Activos

- [ ] En admin, desactivar TODOS los barberos
- [ ] Ir a página pública
- [ ] **Resultado**:
  - ✅ Ícono de usuario vacío
  - ✅ Mensaje "No hay barberos disponibles en este momento"

### Animaciones

- [ ] Recargar página
- [ ] Scroll hasta sección de Equipo
- [ ] **Resultado**: 
  - ✅ Título aparece con animación desde la izquierda
  - ✅ Descripción desde la derecha
  - ✅ Tarjetas aparecen con fadeIn y scale
  - ✅ Hover sobre foto: efecto scale 1.1

---

## 🖼️ Página Pública - Gallery (Galería)

### Visualización Básica

- [ ] En página principal, scroll hasta **"Nuestro Trabajo"**
- [ ] **Resultado Esperado**:
  - ✅ Carrusel con imágenes de la base de datos
  - ✅ Solo imágenes con `activo = true`
  - ✅ Títulos visibles en cada slide
  - ✅ Botones de navegación funcionan
  - ✅ Auto-play activado

### Estados de Carga

- [ ] Recargar con throttling lento
- [ ] **Resultado**: Spinner mientras carga imágenes
- [ ] Después: Carrusel aparece con animación

### Sin Imágenes Activas

- [ ] En admin, desactivar TODAS las imágenes
- [ ] Ir a página pública
- [ ] **Resultado**:
  - ✅ Ícono de imagen vacío
  - ✅ Mensaje "No hay imágenes disponibles en la galería"

### Interactividad del Carrusel

- [ ] Click en flecha derecha
- [ ] **Resultado**: Siguiente imagen con transición suave
- [ ] Click en flecha izquierda
- [ ] **Resultado**: Imagen anterior
- [ ] Esperar sin interactuar
- [ ] **Resultado**: Auto-avanza cada 5 segundos

---

## 🔄 Realtime - Sincronización en Tiempo Real

### Test con Dos Pestañas

**Setup:**
- [ ] Abrir pestaña 1: Admin Panel - Gestión de Barberos
- [ ] Abrir pestaña 2: Página pública - Sección Equipo

**Agregar Barbero:**
- [ ] En pestaña 1: Agregar nuevo barbero "Realtime Test"
- [ ] **Resultado en pestaña 2**: ¡El barbero aparece AUTOMÁTICAMENTE sin recargar!

**Editar Barbero:**
- [ ] En pestaña 1: Editar nombre a "Realtime Test Updated"
- [ ] **Resultado en pestaña 2**: Nombre se actualiza AUTOMÁTICAMENTE

**Desactivar Barbero:**
- [ ] En pestaña 1: Desactivar "Realtime Test Updated"
- [ ] **Resultado en pestaña 2**: ¡Desaparece AUTOMÁTICAMENTE de la lista!

**Eliminar Barbero:**
- [ ] En pestaña 1: Eliminar barbero
- [ ] **Resultado en pestaña 2**: Ya no aparece (si es que volviste a activar)

### Test con Galería

**Setup:**
- [ ] Pestaña 1: Admin - Gestión de Galería
- [ ] Pestaña 2: Página pública - Sección Galería

**Agregar Imagen:**
- [ ] En pestaña 1: Agregar "Test Realtime Image"
- [ ] **Resultado en pestaña 2**: Aparece nueva slide en carrusel AUTOMÁTICAMENTE

**Editar Imagen:**
- [ ] En pestaña 1: Cambiar título a "Updated Realtime"
- [ ] **Resultado en pestaña 2**: Título se actualiza en slide

**Desactivar Imagen:**
- [ ] En pestaña 1: Desactivar imagen
- [ ] **Resultado en pestaña 2**: Slide desaparece del carrusel

---

## 📤 Subida de Imágenes (Storage) - Opcional

> ⚠️ **REQUIERE**: Configuración de Supabase Storage completada

### Subir Foto de Barbero

- [ ] Admin → Gestión de Barberos → Agregar
- [ ] Click en botón de **Upload** (📤)
- [ ] Seleccionar imagen JPG/PNG (máx 2MB)
- [ ] **Resultado**:
  - ✅ Mensaje "Imagen subida correctamente"
  - ✅ Preview aparece en formulario
  - ✅ Campo `foto_url` se llena automáticamente con URL pública
- [ ] Guardar barbero
- [ ] **Resultado**: Foto se muestra en tarjeta

### Subir Imagen de Galería

- [ ] Admin → Gestión de Galería → Agregar
- [ ] Click en botón **Upload**
- [ ] Seleccionar imagen JPG/PNG (máx 5MB)
- [ ] **Resultado**: Igual que barberos
- [ ] Guardar imagen
- [ ] **Resultado**: Aparece en grid y en carrusel público

### Errores de Validación

- [ ] Intentar subir archivo PDF
- [ ] **Resultado**: Error "Solo se permiten imágenes"
- [ ] Intentar subir imagen de 10MB
- [ ] **Resultado**: Error "La imagen no debe superar [2/5]MB"

---

## 🐛 Casos Edge y Errores

### URLs Inválidas

- [ ] Agregar barbero con URL de foto rota: `https://invalid.url/image.jpg`
- [ ] **Resultado**: Placeholder con inicial del nombre se muestra
- [ ] Agregar imagen de galería con URL rota
- [ ] **Resultado**: Placeholder de error "Error de carga"

### Campos Vacíos

- [ ] Intentar agregar barbero SIN nombre
- [ ] **Resultado**: Error "El nombre es obligatorio"
- [ ] Intentar agregar imagen SIN título
- [ ] **Resultado**: Error "El título es obligatorio"
- [ ] Intentar agregar imagen SIN URL
- [ ] **Resultado**: Error "La URL de la imagen es obligatoria"

### Conexión Perdida

- [ ] Abrir DevTools → Network → Offline
- [ ] Intentar agregar barbero
- [ ] **Resultado**: Error "Error de red" o similar
- [ ] Volver Online
- [ ] Reintentar
- [ ] **Resultado**: Funciona correctamente

---

## 📊 Resumen de Validación

### ✅ Debe funcionar:
- [x] CRUD completo de barberos (agregar, editar, eliminar, toggle)
- [x] CRUD completo de galería
- [x] Búsqueda y filtros
- [x] Realtime en admin panels
- [x] Realtime en páginas públicas
- [x] Estados de carga (spinners)
- [x] Estados vacíos (sin datos)
- [x] Validación de formularios
- [x] Manejo de errores
- [x] Animaciones y transiciones
- [x] Optimistic updates (cambios instantáneos)
- [x] Rollback en caso de error
- [x] Responsive design (móvil, tablet, desktop)

### ⚠️ Opcional (requiere Storage):
- [ ] Subida de imágenes
- [ ] Validación de archivos
- [ ] Previsualizaciones

---

## 🎉 ¡Todo Listo!

Si **TODOS** los items marcados funcionan correctamente:

✅ **Gestión de Barberos y Galería está completa y funcional**

Ahora puedes pasar al siguiente par de configuraciones (3/5):
- **Reportes**
- **Gestión de Clientes**

---

**¿Encontraste algún problema?** Revisa:
1. Consola del navegador para errores
2. Logs de Supabase (Dashboard → Logs)
3. Verifica que Realtime esté activado en las tablas
4. Confirma que las políticas RLS permitan las operaciones necesarias
