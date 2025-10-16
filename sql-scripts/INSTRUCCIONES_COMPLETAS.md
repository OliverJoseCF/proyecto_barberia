# 📋 Instrucciones Completas de Configuración

## Resumen de Scripts SQL

Tienes **3 scripts SQL** que ejecutar en orden:

1. ✅ **`supabase-schema.sql`** - Ya debería estar ejecutado (crea tablas base)
2. 🆕 **`actualizar-servicios.sql`** - Mejoras para gestión de servicios
3. 🆕 **`configuracion-horarios.sql`** - Sistema de horarios y festivos

---

## 📦 Paso 1: Verificar Schema Base (Servicios)

### ¿Ya tienes la tabla `servicios`?

Verifica ejecutando en SQL Editor:
```sql
SELECT * FROM servicios;
```

- **Si devuelve datos:** ✅ Continúa al Paso 2
- **Si da error "relation does not exist":** ❌ Ejecuta primero `supabase-schema.sql` completo

---

## 🔧 Paso 2: Actualizar Servicios

### Ejecutar: `actualizar-servicios.sql`

1. Ve a **SQL Editor** en Supabase
2. Copia y pega el contenido de `actualizar-servicios.sql`
3. Haz clic en **Run**

**Esto agrega:**
- ✅ Campo `categoria` a servicios
- ✅ Índices optimizados
- ✅ Políticas de seguridad (RLS)
- ✅ Asignación automática de categorías a servicios existentes

**Verificación:**
```sql
SELECT nombre, categoria, precio, duracion, activo 
FROM servicios 
ORDER BY categoria, nombre;
```

---

## 📅 Paso 3: Configurar Horarios

### Ejecutar: `configuracion-horarios.sql`

1. En **SQL Editor** de Supabase
2. Copia y pega el contenido completo de `configuracion-horarios.sql`
3. Haz clic en **Run**

**Esto crea:**
- ✅ Tabla `configuracion` (intervalos, anticipación)
- ✅ Tabla `horarios_semanales` (horarios por día)
- ✅ Tabla `dias_festivos` (fechas bloqueadas)
- ✅ Datos iniciales (horarios por defecto)
- ✅ Políticas de seguridad (RLS)

**Verificación:**
```sql
-- Ver horarios
SELECT dia_semana, activo, hora_apertura, hora_cierre 
FROM horarios_semanales 
ORDER BY dia_semana;

-- Ver configuración
SELECT clave, valor, descripcion 
FROM configuracion;

-- Ver días festivos
SELECT fecha, descripcion, recurrente 
FROM dias_festivos;
```

---

## 🔴 Paso 4: Habilitar Realtime (CRÍTICO)

Para que los cambios se vean en tiempo real en la app:

1. Ve a **Database** → **Replication** en Supabase
2. Busca y activa **Realtime** para estas tablas:
   - ☑️ `servicios`
   - ☑️ `configuracion`
   - ☑️ `horarios_semanales`
   - ☑️ `dias_festivos`

**Sin esto, los cambios NO se reflejarán automáticamente.**

---

## 🧪 Paso 5: Probar en la Aplicación

### 1. Gestión de Servicios

1. Inicia sesión como admin
2. Ve a **Configuración** → **Servicios**
3. Prueba:
   - ✅ Crear nuevo servicio
   - ✅ Editar servicio existente
   - ✅ Activar/desactivar servicio
   - ✅ Eliminar servicio
   - ✅ Ver cambios reflejados al instante

### 2. Gestión de Horarios

1. Ve a **Configuración** → **Horarios de Trabajo**
2. Prueba:
   - ✅ Activar/desactivar días
   - ✅ Cambiar horarios de apertura/cierre
   - ✅ Configurar pausas
   - ✅ Agregar días festivos
   - ✅ Cambiar intervalos de citas
   - ✅ Ver cambios guardados al instante

---

## 🔍 Verificación de Funcionalidad

### ✅ Servicios Funcionando Correctamente

- [ ] Se cargan todos los servicios al entrar
- [ ] Al crear un servicio, aparece sin recargar
- [ ] Al editar, los cambios se ven de inmediato
- [ ] Al desactivar, desaparece de la lista pública
- [ ] Al eliminar, se remueve al instante

### ✅ Horarios Funcionando Correctamente

- [ ] Se muestran los 7 días de la semana
- [ ] Se puede activar/desactivar cada día
- [ ] Los horarios se actualizan sin recargar
- [ ] Se pueden agregar días festivos
- [ ] Se pueden eliminar días festivos
- [ ] La configuración de intervalos se guarda

---

## 🚨 Solución de Problemas Comunes

### Error: "relation does not exist"

**Tabla:** `servicios`
- **Causa:** No se ejecutó el schema base
- **Solución:** Ejecuta `supabase-schema.sql` primero

**Tabla:** `horarios_semanales`, `configuracion`, o `dias_festivos`
- **Causa:** No se ejecutó `configuracion-horarios.sql`
- **Solución:** Ejecuta el script completo

### Error: "column does not exist"

**Columna:** `categoria` en servicios
- **Causa:** No se ejecutó `actualizar-servicios.sql`
- **Solución:** Ejecuta el script de actualización

### Los cambios no se reflejan en tiempo real

**Causa:** Realtime no está habilitado
**Solución:**
1. Database → Replication
2. Activa todas las tablas mencionadas
3. Recarga la aplicación (Ctrl+R)

### Error: "permission denied" o RLS

**Causa:** Las políticas de seguridad están bloqueando
**Solución Temporal:**
```sql
-- Deshabilitar RLS temporalmente para pruebas
ALTER TABLE servicios DISABLE ROW LEVEL SECURITY;
ALTER TABLE configuracion DISABLE ROW LEVEL SECURITY;
ALTER TABLE horarios_semanales DISABLE ROW LEVEL SECURITY;
ALTER TABLE dias_festivos DISABLE ROW LEVEL SECURITY;
```

⚠️ **Nota:** En producción, configura políticas adecuadas según tu sistema de autenticación.

### No se ven los datos iniciales

**Servicios vacíos:**
```sql
-- Ejecutar la sección INSERT de supabase-schema.sql
INSERT INTO servicios (nombre, descripcion, precio, duracion) VALUES
  ('Corte de Cabello (Hombre)', 'Cortes modernos y clásicos', 250.00, 45),
  ('Arreglo de Barba', 'Definición profesional', 150.00, 30);
```

**Horarios vacíos:**
```sql
-- Ejecutar la sección INSERT de configuracion-horarios.sql
INSERT INTO horarios_semanales (dia_semana, activo, hora_apertura, hora_cierre) VALUES
  (1, true, '09:00', '19:00'),
  (2, true, '09:00', '19:00'),
  -- ... resto de días
```

---

## 📊 Estructura de Datos

### Tabla: `servicios`
```
id (UUID)
nombre (VARCHAR 100) - UNIQUE
descripcion (TEXT)
precio (DECIMAL)
duracion (INTEGER) - minutos
activo (BOOLEAN)
categoria (VARCHAR 50) - 🆕
created_at (TIMESTAMP)
```

### Tabla: `horarios_semanales`
```
id (UUID)
dia_semana (INTEGER 0-6) - UNIQUE
activo (BOOLEAN)
hora_apertura (TIME)
hora_cierre (TIME)
pausa_inicio (TIME) - opcional
pausa_fin (TIME) - opcional
updated_at (TIMESTAMP)
```

### Tabla: `dias_festivos`
```
id (UUID)
fecha (DATE) - UNIQUE
descripcion (VARCHAR 200)
recurrente (BOOLEAN)
created_at (TIMESTAMP)
```

### Tabla: `configuracion`
```
id (UUID)
clave (VARCHAR 100) - UNIQUE
valor (TEXT)
descripcion (TEXT)
tipo (VARCHAR 50)
updated_at (TIMESTAMP)
```

---

## 🎯 Estado Actual del Proyecto

### ✅ Completado
- [x] Tabla base de servicios
- [x] Hook `use-servicios` con Realtime
- [x] Componente `ServiceManagement` funcional
- [x] Script de actualización de servicios
- [x] Tablas de configuración de horarios
- [x] Hook `use-horarios` con Realtime
- [x] Componente `ScheduleManagement` funcional

### ⏳ Pendiente
- [ ] Ejecutar scripts en Supabase (TU RESPONSABILIDAD)
- [ ] Habilitar Realtime en todas las tablas
- [ ] Sincronizar servicios con página principal
- [ ] Sincronizar horarios con sistema de reservas
- [ ] Implementar barberos, galería, notificaciones, etc.

---

## 📝 Checklist de Ejecución

Marca cuando completes cada paso:

- [ ] ✅ Verificar que existe tabla `servicios`
- [ ] 🔧 Ejecutar `actualizar-servicios.sql`
- [ ] 📅 Ejecutar `configuracion-horarios.sql`
- [ ] 🔴 Habilitar Realtime en 4 tablas
- [ ] 🧪 Probar gestión de servicios
- [ ] 🧪 Probar gestión de horarios
- [ ] 📸 Hacer backup de datos antes de continuar

---

## 🆘 ¿Necesitas Ayuda?

Si encuentras algún error:
1. Copia el mensaje de error exacto
2. Anota qué script estabas ejecutando
3. Verifica que seguiste los pasos en orden
4. Comparte el error para ayudarte a resolverlo

**¡Listo para continuar con la sincronización de la página principal!** 🚀
