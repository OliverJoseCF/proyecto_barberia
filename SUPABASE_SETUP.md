# 🗄️ Guía de Integración con Supabase

## 📋 **Resumen**

Este proyecto está **preparado para trabajar con Supabase** o en **modo DEMO** (sin base de datos). 

- ✅ **Con Supabase**: Las citas se guardan en una base de datos PostgreSQL real
- ✅ **Sin Supabase (Demo)**: Las citas se guardan en `localStorage` del navegador

---

## 🚀 **Paso 1: Crear Proyecto en Supabase**

1. Ve a [https://supabase.com](https://supabase.com)
2. Crea una cuenta gratis
3. Click en **"New Project"**
4. Completa:
   - **Name**: `cantabarba-studio`
   - **Database Password**: (guarda esta contraseña)
   - **Region**: South America (São Paulo) *recomendado*
5. Click **"Create new project"** (tarda ~2 minutos)

---

## 🗃️ **Paso 2: Crear Estructura de Base de Datos**

1. En Supabase, ve al **SQL Editor** (menú izquierdo)
2. Click en **"New query"**
3. Abre el archivo `supabase-schema.sql` de este proyecto
4. **Copia TODO el contenido** del archivo
5. **Pégalo** en el editor de Supabase
6. Click en **"Run"** (esquina inferior derecha)
7. Espera el mensaje: ✅ **"Success. No rows returned"**

---

## 🔑 **Paso 3: Obtener Credenciales**

1. En Supabase, ve a **Settings** > **API** (menú izquierdo)
2. Encuentra estos dos valores:
   - 📍 **Project URL** (ej: `https://xyzcompany.supabase.co`)
   - 🔐 **anon/public key** (es una cadena larga que empieza con `eyJhbGc...`)

---

## ⚙️ **Paso 4: Configurar Variables de Entorno**

1. En la raíz del proyecto, crea un archivo llamado `.env`
2. Copia el contenido de `.env.example`
3. Reemplaza los valores con tus credenciales:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

4. **Guarda el archivo**

---

## ▶️ **Paso 5: Reiniciar el Servidor de Desarrollo**

```bash
# Detén el servidor actual (Ctrl + C)
# Reinicia:
npm run dev
```

---

## ✅ **Verificar que Funciona**

Abre la consola del navegador (F12) y busca uno de estos mensajes:

### ✅ **Con Supabase configurado:**
```
✅ Conexión a Supabase exitosa
💾 Guardando cita en Supabase...
✅ Cita guardada exitosamente en Supabase
```

### 🎭 **Modo Demo (sin configurar):**
```
⚠️ Supabase no está configurado. Usando modo demo.
🎭 Modo demo: Guardando en localStorage...
```

---

## 📊 **Funcionalidades con Supabase**

Una vez configurado, estas funciones usarán la base de datos real:

### **Frontend (Clientes):**
- ✅ Verificación de disponibilidad en tiempo real
- ✅ Creación de citas
- ✅ Reprogramación de citas
- ✅ Consulta de citas por teléfono

### **Panel Admin:**
- ✅ Ver todas las citas
- ✅ Confirmar/cancelar citas
- ✅ Filtrar por barbero/fecha/estado
- ✅ Estadísticas reales
- ✅ Sistema de recordatorios

---

## 🔧 **Estructura de Tablas Creadas**

### **`citas`** (Principal)
- `id` - UUID único
- `cliente_nombre` - Nombre del cliente
- `cliente_telefono` - Teléfono
- `fecha` - Fecha de la cita
- `hora` - Hora de la cita
- `servicio` - Servicio solicitado
- `barbero` - Barbero asignado
- `estado` - pendiente/confirmada/completada/cancelada
- `notas` - Notas adicionales (opcional)
- `created_at` - Fecha de creación
- `updated_at` - Última actualización

### **`servicios`**
- Lista de servicios con precios y duraciones
- 8 servicios pre-cargados

### **`barberos`**
- Información de barberos
- 2 barberos pre-cargados (Ángel y Emiliano)

### **`recordatorios`**
- Sistema de notificaciones
- Tipos: confirmación, recordatorio, seguimiento

---

## 🛡️ **Seguridad Configurada**

✅ **RLS (Row Level Security)** activado
✅ Políticas de lectura pública para servicios/barberos
✅ Inserción pública de citas (formulario web)
✅ Solo usuarios autenticados pueden modificar/eliminar

---

## 🎯 **Modo Dual: Demo + Producción**

El proyecto detecta automáticamente si Supabase está configurado:

```typescript
// En src/lib/supabase.ts
export const isSupabaseConfigured = supabaseUrl && supabaseAnonKey;

// En componentes:
if (isSupabaseConfigured) {
  // Usar Supabase
} else {
  // Usar localStorage (demo)
}
```

**Ventaja:** Puedes desarrollar sin base de datos y activarla cuando estés listo.

---

## 📝 **Scripts SQL Útiles**

### **Ver todas las citas de hoy:**
```sql
SELECT * FROM citas 
WHERE fecha = CURRENT_DATE
ORDER BY hora;
```

### **Ver estadísticas del mes:**
```sql
SELECT 
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE estado = 'confirmada') as confirmadas,
  COUNT(*) FILTER (WHERE estado = 'pendiente') as pendientes
FROM citas
WHERE DATE_TRUNC('month', fecha) = DATE_TRUNC('month', CURRENT_DATE);
```

### **Verificar disponibilidad:**
```sql
SELECT verificar_disponibilidad('2025-10-15', '10:00', 'Ángel Ramírez');
-- Retorna: true (disponible) o false (ocupado)
```

---

## 🚨 **Solución de Problemas**

### **Error: "Supabase no está configurado"**
✅ Verifica que el archivo `.env` existe
✅ Verifica que las variables empiezan con `VITE_`
✅ Reinicia el servidor (`npm run dev`)

### **Error: "Failed to fetch"**
✅ Verifica tu conexión a internet
✅ Verifica que las credenciales son correctas
✅ Verifica que RLS está configurado

### **Las citas no se guardan**
✅ Abre la consola del navegador (F12)
✅ Busca mensajes de error en rojo
✅ Verifica que ejecutaste el script SQL completo

---

## 📞 **Soporte**

Si tienes problemas:
1. Revisa la consola del navegador (F12)
2. Revisa los logs de Supabase (Logs en el menú)
3. Verifica que todas las tablas se crearon correctamente

---

## 🎉 **¡Listo!**

Tu proyecto ahora está preparado para usar Supabase. Cuando agregues las credenciales al `.env`, todo funcionará automáticamente sin necesidad de cambiar código.

**Modo actual:** 🎭 DEMO (localStorage)  
**Para activar Supabase:** Agrega credenciales al archivo `.env`
