# 📚 ÍNDICE DE SCRIPTS SQL

Última actualización: 12 de Octubre, 2025

## 📁 Estructura de Archivos

```
sql-scripts/
├── README.md                           # Guía principal de uso
├── INDICE.md                          # Este archivo
├── datos-iniciales.sql                # Datos iniciales de la BD
├── enable-realtime.sql                # Configuración de Realtime
├── supabase-schema.sql                # Esquema completo de BD
│
├── mejoras/                           # 🆕 SCRIPTS DE MEJORAS
│   ├── README.md                      # Documentación de mejoras
│   ├── 01-constraint-unicidad.sql    # Previene dobles reservas
│   ├── 02-seguridad-rls.sql          # Mejora seguridad
│   ├── 03-auditoria.sql              # Sistema de auditoría
│   └── 04-optimizacion-rendimiento.sql # Optimización
│
├── mantenimiento/                     # Scripts de mantenimiento
│   ├── limpiar-citas-antiguas.sql    # Eliminar citas viejas
│   ├── actualizar-estados.sql         # Cambiar estados masivamente
│   ├── corregir-datos-clientes.sql   # Normalizar datos de clientes
│   └── modificar-servicios.sql        # Actualizar servicios
│
├── consultas/                         # Scripts de consultas
│   ├── reportes-citas.sql            # Reportes y búsquedas de citas
│   ├── estadisticas-barberos.sql     # Desempeño de barberos
│   └── analisis-ingresos.sql         # Análisis financiero
│
└── respaldos/                         # Scripts de respaldo
    ├── backup-citas.sql              # Respaldo de citas
    └── backup-servicios.sql          # Respaldo de servicios
```

---

## 🆕 MEJORAS (NUEVO)

### 📄 `01-constraint-unicidad.sql` ⚡ CRÍTICO
**Qué hace:** Previene que dos citas se reserven al mismo tiempo para el mismo barbero

**Cuándo usar:**
- ✅ Inmediatamente antes de ir a producción
- ✅ Si detectas dobles reservas

**Beneficios:**
- Protección automática contra duplicados
- Previene condiciones de carrera
- Índices optimizados para consultas

**Precauciones:**
- ⚠️ Verifica que no haya duplicados antes de ejecutar
- ✅ Primera mejora a ejecutar

---

### 📄 `02-seguridad-rls.sql` 🔒 ALTA PRIORIDAD
**Qué hace:** Mejora políticas de seguridad y añade sistema de tokens

**Cuándo usar:**
- ✅ Después del script 01
- ✅ Antes de abrir al público

**Beneficios:**
- Solo usuarios autenticados pueden modificar citas
- Sistema de tokens para reprogramación segura
- Protección contra modificaciones maliciosas

**Funciones nuevas:**
- `generar_token_reprogramacion(cita_id)`
- `validar_token_reprogramacion(token)`
- `marcar_token_usado(token)`

---

### 📄 `03-auditoria.sql` 📊 MEDIA PRIORIDAD
**Qué hace:** Registra automáticamente todos los cambios en citas

**Cuándo usar:**
- ✅ Después del script 02
- ✅ Si necesitas rastrear cambios

**Beneficios:**
- Historial completo de cambios
- Análisis de cancelaciones
- Rastreo de reprogramaciones
- Reportes de comportamiento

**Vistas creadas:**
- `historial_cita` - Ver cambios por cita
- `estadisticas_auditoria` - Resumen de cambios
- `citas_canceladas_auditoria` - Análisis
- `reprogramaciones_auditoria` - Seguimiento

**Funciones útiles:**
- `obtener_historial_cita(cita_id)`
- `cambios_recientes()`
- `limpiar_auditoria_antigua(dias)`

---

### 📄 `04-optimizacion-rendimiento.sql` 🚀 BAJA PRIORIDAD
**Qué hace:** Optimiza consultas y añade funciones PostgreSQL rápidas

**Cuándo usar:**
- ✅ Después del script 03
- ✅ Si notas lentitud
- ✅ Cuando tengas >1000 citas

**Beneficios:**
- Consultas 10x más rápidas
- Índices compuestos optimizados
- Vistas materializadas para reportes
- Funciones PostgreSQL nativas

**Funciones optimizadas:**
- `verificar_disponibilidad_optimizada(fecha, hora, barbero)`
- `horarios_disponibles(fecha, barbero)`
- `estadisticas_barbero(barbero, desde, hasta)`
- `citas_proximas(dias, limite)`
- `refrescar_estadisticas()`
- `optimizar_tablas()`

---

## 🛠️ MANTENIMIENTO

### 📄 `limpiar-citas-antiguas.sql`
**Qué hace:** Elimina citas antiguas (completadas/canceladas) para liberar espacio

**Cuándo usar:**
- Cada 6 meses para limpieza general
- Cuando la base de datos esté muy pesada
- Antes de hacer respaldo

**Precauciones:**
- ⚠️ Elimina datos permanentemente
- ✅ Siempre ver primero qué se eliminará
- ✅ Hacer respaldo antes

---

### 📄 `actualizar-estados.sql`
**Qué hace:** Cambia estados de citas masivamente

**Cuándo usar:**
- Marcar como completadas citas de ayer
- Cancelar citas pendientes viejas
- Confirmar citas del día
- Reasignar citas entre barberos

**Precauciones:**
- ⚠️ Verifica filtros WHERE antes de ejecutar
- ✅ Prueba con LIMIT 1 primero

---

### 📄 `corregir-datos-clientes.sql`
**Qué hace:** Normaliza y limpia datos de clientes

**Cuándo usar:**
- Nombres en mayúsculas/minúsculas
- Teléfonos con formato incorrecto
- Emails en mayúsculas
- Eliminar citas de prueba

**Precauciones:**
- ✅ Ver primero los datos afectados
- ✅ Los cambios son permanentes

---

### 📄 `modificar-servicios.sql`
**Qué hace:** Actualiza precios, nombres y disponibilidad de servicios

**Cuándo usar:**
- Cambios de precio (aumentos, promociones)
- Renombrar servicios
- Activar/desactivar servicios
- Cambiar duración o categoría

**Precauciones:**
- ⚠️ Afecta citas futuras
- ✅ Verificar que no haya citas con servicio antes de eliminar

---

## 📊 CONSULTAS

### 📄 `reportes-citas.sql`
**Qué contiene:**
- ✅ Citas de hoy por barbero
- ✅ Citas por rango de fechas
- ✅ Buscar por cliente (nombre, teléfono, email)
- ✅ Citas pendientes futuras
- ✅ Últimas citas creadas
- ✅ Detectar duplicados

**Cuándo usar:**
- Revisar citas del día
- Buscar historial de cliente
- Análisis semanal/mensual

---

### 📄 `estadisticas-barberos.sql`
**Qué contiene:**
- ✅ Resumen general por barbero (citas, porcentajes)
- ✅ Desempeño del mes (promedio diario)
- ✅ Servicios más solicitados por barbero
- ✅ Horarios más ocupados
- ✅ Tasa de cancelación
- ✅ Clientes frecuentes
- ✅ Comparación mes actual vs anterior

**Cuándo usar:**
- Evaluación de desempeño
- Planificación de horarios
- Detectar patrones de trabajo

---

### 📄 `analisis-ingresos.sql`
**Qué contiene:**
- ✅ Ingresos del mes actual
- ✅ Ingresos por barbero
- ✅ Ingresos por servicio
- ✅ Histórico de 6 meses
- ✅ Proyección de ingresos (citas confirmadas)
- ✅ Ingresos por día de semana
- ✅ Top 10 clientes que más gastan
- ✅ Comparación mes vs mes anterior

**Cuándo usar:**
- Fin de mes (cierre contable)
- Evaluación financiera
- Planificación de recursos

---

## 💾 RESPALDOS

### 📄 `backup-citas.sql`
**Qué hace:** Crea copias de seguridad de la tabla de citas

**Cuándo usar:**
- ⚠️ ANTES de cualquier operación DELETE masivo
- ⚠️ ANTES de UPDATE masivo
- Fin de mes (respaldo histórico)
- Antes de limpiar datos antiguos

**Cómo usar:**
1. Crear respaldo: `CREATE TABLE citas_backup_FECHA AS SELECT * FROM citas;`
2. Verificar: `SELECT COUNT(*) FROM citas_backup_FECHA;`
3. Hacer operación peligrosa
4. Si algo sale mal, restaurar desde respaldo

---

### 📄 `backup-servicios.sql`
**Qué hace:** Crea copias de seguridad de servicios

**Cuándo usar:**
- Antes de cambios masivos de precios
- Antes de eliminar servicios
- Antes de reorganizar categorías

---

## 🎯 CASOS DE USO COMUNES

### 📅 Fin de mes
```sql
-- 1. Hacer respaldo
-- 2. Ejecutar: analisis-ingresos.sql (todas las consultas)
-- 3. Ejecutar: estadisticas-barberos.sql (resumen general)
-- 4. Opcional: limpiar-citas-antiguas.sql (si hay muchas)
```

### 🧹 Limpieza general
```sql
-- 1. SIEMPRE hacer respaldo primero (backup-citas.sql)
-- 2. corregir-datos-clientes.sql (normalizar datos)
-- 3. actualizar-estados.sql (marcar completadas/cancelar viejas)
-- 4. limpiar-citas-antiguas.sql (eliminar muy antiguas)
```

### 🔍 Buscar información de cliente
```sql
-- 1. reportes-citas.sql → Buscar por nombre/teléfono
-- 2. analisis-ingresos.sql → Ver cuánto ha gastado (Top 10)
```

### 💰 Cambio de precios
```sql
-- 1. backup-servicios.sql (hacer respaldo)
-- 2. modificar-servicios.sql → Actualizar precios
-- 3. Verificar con una consulta SELECT
```

---

## ⚡ TIPS RÁPIDOS

### ✅ Antes de ejecutar DELETE o UPDATE:
1. Cambiar a SELECT primero para ver qué afectarás
2. Agregar LIMIT 1 para probar
3. Hacer respaldo
4. Ejecutar el comando completo

### ✅ Formato de fechas:
- PostgreSQL usa: `'YYYY-MM-DD'` (ejemplo: `'2025-10-12'`)
- Para hoy: `CURRENT_DATE`
- Para intervalos: `CURRENT_DATE - INTERVAL '7 days'`

### ✅ Filtros útiles:
```sql
-- Citas de hoy
WHERE TO_DATE(fecha, 'YYYY-MM-DD') = CURRENT_DATE

-- Citas futuras
WHERE TO_DATE(fecha, 'YYYY-MM-DD') >= CURRENT_DATE

-- Este mes
WHERE TO_DATE(fecha, 'YYYY-MM-DD') >= DATE_TRUNC('month', CURRENT_DATE)
```

---

## 📞 AYUDA

Si no sabes qué script usar o cómo modificarlo:
1. Lee el comentario de encabezado del script
2. Ejecuta primero la versión SELECT (ver datos)
3. Si no estás seguro, **NO LO EJECUTES**

**Recuerda:** Es mejor preguntar que borrar datos accidentalmente.
