# 🚀 Scripts de Mejoras para la Base de Datos

Este directorio contiene scripts SQL para mejorar la seguridad, rendimiento y funcionalidad de la base de datos de CantaBarba Studio.

---

## 📋 **Orden de Ejecución**

**IMPORTANTE:** Ejecuta los scripts en este orden exacto:

### **1. Constraint de Unicidad** ⚡ (CRÍTICO)
**Archivo:** `01-constraint-unicidad.sql`

**¿Qué hace?**
- Previene dobles reservas del mismo horario
- Protege contra condiciones de carrera
- Añade índice para consultas rápidas

**Ejecutar cuando:**
- ✅ Inmediatamente (antes de ir a producción)
- ✅ Tu base de datos NO tiene citas duplicadas

**Verificar antes:**
```sql
-- Revisa si hay duplicados actuales
SELECT fecha, hora, barbero, COUNT(*) 
FROM citas 
WHERE estado IN ('pendiente', 'confirmada')
GROUP BY fecha, hora, barbero 
HAVING COUNT(*) > 1;
```

Si hay duplicados, primero limpia manualmente antes de ejecutar.

---

### **2. Seguridad RLS** 🔒 (ALTA PRIORIDAD)
**Archivo:** `02-seguridad-rls.sql`

**¿Qué hace?**
- Mejora políticas de seguridad (Row Level Security)
- Restringe UPDATE/DELETE solo a usuarios autenticados
- Crea sistema de tokens para reprogramación segura
- Añade tabla de tokens temporales

**Ejecutar cuando:**
- ✅ Después del script 01
- ✅ Antes de abrir tu sitio al público

**Funciones nuevas:**
- `generar_token_reprogramacion(cita_id)` - Genera token único
- `validar_token_reprogramacion(token)` - Valida token
- `marcar_token_usado(token)` - Marca token como usado

---

### **3. Sistema de Auditoría** 📊 (MEDIA PRIORIDAD)
**Archivo:** `03-auditoria.sql`

**¿Qué hace?**
- Registra automáticamente TODOS los cambios en citas
- Crea tabla `auditoria_citas` con historial completo
- Añade vistas para análisis de datos
- Rastrea quién, cuándo y qué cambió

**Ejecutar cuando:**
- ✅ Después del script 02
- ✅ Si necesitas rastrear cambios y comportamiento de usuarios

**Vistas creadas:**
- `historial_cita` - Historial completo por cita
- `estadisticas_auditoria` - Resumen de cambios
- `citas_canceladas_auditoria` - Análisis de cancelaciones
- `reprogramaciones_auditoria` - Análisis de reprogramaciones

**Funciones útiles:**
- `obtener_historial_cita(cita_id)` - Ver todos los cambios
- `cambios_recientes()` - Ver cambios de últimas 24h
- `limpiar_auditoria_antigua(dias)` - Limpiar registros antiguos

---

### **4. Optimización de Rendimiento** 🚀 (BAJA PRIORIDAD)
**Archivo:** `04-optimizacion-rendimiento.sql`

**¿Qué hace?**
- Añade índices compuestos para consultas frecuentes
- Crea funciones optimizadas para disponibilidad
- Añade vista materializada para reportes pesados
- Mejora velocidad de consultas hasta 10x

**Ejecutar cuando:**
- ✅ Después del script 03
- ✅ Si notas lentitud en el sistema
- ✅ Cuando tengas >1000 citas en la BD

**Funciones optimizadas:**
- `verificar_disponibilidad_optimizada(fecha, hora, barbero)` - Ultra rápida
- `horarios_disponibles(fecha, barbero)` - Todos los horarios de un día
- `estadisticas_barbero(barbero, desde, hasta)` - Stats completas
- `citas_proximas(dias, limite)` - Próximas citas
- `refrescar_estadisticas()` - Actualizar vista materializada
- `optimizar_tablas()` - Mantenimiento de la BD

---

## ⚙️ **Cómo Ejecutar**

### **Opción 1: Supabase SQL Editor (Recomendado)**

1. Ve a tu proyecto en Supabase
2. Abre **SQL Editor** (menú izquierdo)
3. Click en **"New query"**
4. Copia y pega el contenido de cada script **EN ORDEN**
5. Click en **"Run"** (esquina inferior derecha)
6. Verifica el mensaje de éxito ✅

### **Opción 2: CLI de Supabase**

```bash
# Si tienes Supabase CLI instalado
supabase db execute --file sql-scripts/mejoras/01-constraint-unicidad.sql
supabase db execute --file sql-scripts/mejoras/02-seguridad-rls.sql
supabase db execute --file sql-scripts/mejoras/03-auditoria.sql
supabase db execute --file sql-scripts/mejoras/04-optimizacion-rendimiento.sql
```

---

## ✅ **Verificación Post-Instalación**

Ejecuta estas queries para verificar que todo funciona:

```sql
-- 1. Verificar constraint de unicidad
SELECT conname, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'public.citas'::regclass
  AND conname = 'unique_cita_fecha_hora_barbero';

-- 2. Verificar políticas de seguridad
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'citas';

-- 3. Verificar tabla de auditoría
SELECT COUNT(*) AS registros_auditoria 
FROM auditoria_citas;

-- 4. Verificar índices
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'citas' 
  AND schemaname = 'public';

-- 5. Probar función de disponibilidad optimizada
SELECT horarios_disponibles('2025-10-15', 'Ángel Ramírez');
```

---

## 🔄 **Rollback (Deshacer Cambios)**

Si necesitas deshacer algún script:

### **Rollback Script 01:**
```sql
ALTER TABLE public.citas DROP CONSTRAINT IF EXISTS unique_cita_fecha_hora_barbero;
DROP INDEX IF EXISTS idx_citas_activas_disponibilidad;
```

### **Rollback Script 02:**
```sql
DROP TABLE IF EXISTS public.tokens_reprogramacion CASCADE;
DROP FUNCTION IF EXISTS generar_token_reprogramacion CASCADE;
DROP FUNCTION IF EXISTS validar_token_reprogramacion CASCADE;
DROP FUNCTION IF EXISTS marcar_token_usado CASCADE;
-- Restaurar políticas originales inseguras si es necesario
```

### **Rollback Script 03:**
```sql
DROP TRIGGER IF EXISTS trigger_auditoria_citas ON public.citas;
DROP FUNCTION IF EXISTS registrar_auditoria_citas CASCADE;
DROP TABLE IF EXISTS public.auditoria_citas CASCADE;
DROP VIEW IF EXISTS historial_cita CASCADE;
DROP VIEW IF EXISTS estadisticas_auditoria CASCADE;
DROP VIEW IF EXISTS citas_canceladas_auditoria CASCADE;
DROP VIEW IF EXISTS reprogramaciones_auditoria CASCADE;
```

### **Rollback Script 04:**
```sql
DROP INDEX IF EXISTS idx_disponibilidad_completa;
DROP INDEX IF EXISTS idx_citas_telefono_estado;
DROP INDEX IF EXISTS idx_citas_hoy;
DROP MATERIALIZED VIEW IF EXISTS public.stats_mensuales;
DROP FUNCTION IF EXISTS verificar_disponibilidad_optimizada CASCADE;
DROP FUNCTION IF EXISTS horarios_disponibles CASCADE;
DROP FUNCTION IF EXISTS estadisticas_barbero CASCADE;
DROP FUNCTION IF EXISTS citas_proximas CASCADE;
```

---

## 📊 **Impacto Esperado**

| Mejora | Beneficio | Impacto |
|--------|-----------|---------|
| **Constraint Unicidad** | Previene dobles reservas | 🔴 CRÍTICO |
| **Seguridad RLS** | Protege datos sensibles | 🟠 ALTO |
| **Auditoría** | Rastreo completo de cambios | 🟡 MEDIO |
| **Optimización** | 5-10x más rápido | 🟢 BAJO |

---

## 🆘 **Soporte**

Si encuentras algún error al ejecutar los scripts:


1. Copia el mensaje de error completo
2. Verifica que ejecutaste los scripts en orden
3. Revisa que tu plan de Supabase soporta estas funciones
4. Contacta al desarrollador con el log del error

---

### **5. Asignar Rol de Administrador** � (CONFIGURACIÓN)
**Archivo:** `05-asignar-rol-admin.sql`

**¿Qué hace?**
- Agrega campo `rol` a la tabla barberos
- Asigna rol de "admin" a Ángel Ramírez permanentemente
- Protege contra eliminar el último administrador
- Crea políticas RLS para administradores

**Ejecutar cuando:**
- ✅ Después de los scripts anteriores
- ✅ Antes de usar el panel de administración

**Funciones nuevas:**
- `prevenir_eliminar_ultimo_admin()` - Protege la cuenta de administrador

---

## �📝 **Notas Importantes**

- ⚠️ **Backup:** Haz un respaldo antes de ejecutar en producción
- ⚠️ **Testing:** Prueba primero en un proyecto de desarrollo
- ⚠️ **Performance:** Script 04 es opcional si tienes pocas citas
- ⚠️ **Auditoría:** Puede crecer rápido, programa limpieza mensual
- 👑 **Admin:** Ángel Ramírez siempre será el administrador principal

---

## 🎯 **Siguiente Paso**

Después de ejecutar estos scripts, actualiza tu código TypeScript para aprovechar las nuevas funciones. Ver: `../hooks/README.md` (próximamente)

