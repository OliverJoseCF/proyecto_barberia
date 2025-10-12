# 📁 Scripts SQL - Guía de Uso

Esta carpeta contiene scripts SQL organizados para administración y mantenimiento de emergencia de la base de datos de **CantaBarba Studio**.

## 📂 Estructura de Carpetas

```
sql-scripts/
├── mantenimiento/      # Scripts de limpieza, corrección y mantenimiento
├── consultas/          # Consultas útiles para análisis y reportes
├── respaldos/          # Scripts para respaldos y restauración
└── README.md          # Este archivo
```

## ⚠️ ADVERTENCIAS IMPORTANTES

### 🔴 **ANTES DE EJECUTAR CUALQUIER SCRIPT:**

1. **SIEMPRE haz un respaldo** de los datos afectados
2. **Lee el script completo** antes de ejecutarlo
3. **Entiende qué hace** cada línea
4. **Prueba en un ambiente de desarrollo** primero si es posible
5. **Verifica los filtros WHERE** para no afectar datos incorrectos

### 📝 **Cómo usar estos scripts:**

1. Abre **Supabase Dashboard** → Tu proyecto
2. Ve a **SQL Editor**
3. Copia y pega el script que necesites
4. **MODIFICA los parámetros** (fechas, IDs, nombres, etc.) según tu necesidad
5. Revisa el script una vez más
6. Ejecuta

### 🚨 **Scripts Peligrosos (DELETE, DROP, TRUNCATE):**

Los scripts que eliminan datos tienen **múltiples advertencias** y requieren:
- Comentar/descomentar líneas de confirmación
- Verificación doble de filtros
- Respaldo previo obligatorio

## 🎯 Categorías de Scripts

### **Mantenimiento** (`/mantenimiento/`)
- Limpieza de datos antiguos
- Corrección de formatos
- Actualización masiva de estados
- Eliminación segura de registros

### **Consultas** (`/consultas/`)
- Reportes de citas
- Estadísticas de barberos
- Análisis de ingresos
- Búsqueda y filtrado avanzado

### **Respaldos** (`/respaldos/`)
- Exportación de datos
- Copias de seguridad
- Restauración de datos

## 📞 Soporte

Si no estás seguro de qué script usar o cómo modificarlo, **NO LO EJECUTES**. Consulta con un desarrollador o administrador de base de datos.

---

**Última actualización:** 12 de Octubre, 2025
