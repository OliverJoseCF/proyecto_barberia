# 🔧 Solución de Problemas - Horarios no se Actualizan

## 🐛 Problema Reportado
Los cambios en el **Horario Semanal** no se reflejan en la interfaz después de modificarlos.

---

## ✅ Cambios Implementados

### 1. **Optimistic Updates** en `use-horarios.ts`
```typescript
// Ahora actualiza la UI INMEDIATAMENTE antes de confirmar con la BD
const actualizarHorario = async (id, updates) => {
  // 1. Actualizar UI instantáneamente
  setHorarios(prev => prev.map(h => 
    h.id === id ? { ...h, ...updates } : h
  ));
  
  // 2. Guardar en BD
  await supabase.from('horarios_semanales').update(updates);
  
  // 3. Refrescar para sincronizar
  await fetchHorarios();
}
```

### 2. **Formato correcto de tiempo** en `ScheduleManagement.tsx`
```typescript
// Convierte "HH:MM" a "HH:MM:SS" automáticamente
handleHorarioChange = async (id, field, value) => {
  const formattedValue = value.includes(':') && value.split(':').length === 2 
    ? `${value}:00` 
    : value;
  
  await actualizarHorario(id, { [field]: formattedValue });
}
```

### 3. **Mejor logging de Realtime**
Ahora verás en consola:
- `🔄 Cambio en horarios detectado: UPDATE`
- `✅ Estado de horarios actualizado: [...]`
- `📡 Canal horarios-changes: SUBSCRIBED`

---

## 🔍 Pasos de Diagnóstico

### Paso 1: Abrir DevTools
1. Presiona **F12** en tu navegador
2. Ve a la pestaña **Console**
3. Filtra por "horarios" o "🔄"

### Paso 2: Modificar un Horario
1. En la página de Gestión de Horarios
2. Cambia cualquier hora (ej: apertura de Lunes)
3. **Observa la consola**

### Paso 3: Interpretar Mensajes

#### ✅ **Si ves esto = TODO BIEN:**
```
🔄 Cambio en horarios detectado: UPDATE {...}
✅ Estado de horarios actualizado: [...]
Horario actualizado (toast)
```

#### ⚠️ **Si NO ves nada en consola:**
**Problema:** Realtime no está habilitado en Supabase

**Solución:**
1. Ve a tu proyecto Supabase
2. **Database** → **Replication**
3. Busca `horarios_semanales`
4. **Activa** el toggle de Realtime
5. Recarga la app (Ctrl+R)

#### ❌ **Si ves error "Error al actualizar":**
**Problema:** RLS bloqueando o tabla no existe

**Solución:**
Ejecuta en SQL Editor:
```sql
-- Verificar que la tabla existe
SELECT * FROM horarios_semanales;

-- Deshabilitar RLS temporalmente
ALTER TABLE horarios_semanales DISABLE ROW LEVEL SECURITY;
```

#### 🔄 **Si ves el cambio en consola pero NO en la UI:**
**Problema:** Realtime configurado pero estado no se actualiza

**Solución:**
Ejecuta el script `verificar-realtime.sql`:
```sql
-- Hacer update de prueba
UPDATE horarios_semanales 
SET updated_at = NOW()
WHERE dia_semana = 1;
```

Si esto dispara el evento en consola, el problema es específico de tu cambio.

---

## 🧪 Script de Verificación

Ejecuta **`verificar-realtime.sql`** en Supabase SQL Editor:

```bash
sql-scripts/verificar-realtime.sql
```

Esto te mostrará:
1. ✅ Tablas existentes
2. ✅ Realtime habilitado en cada tabla
3. 📊 Datos actuales de horarios
4. 🔬 Test de UPDATE en vivo

---

## 🎯 Soluciones Rápidas

### Solución 1: Refrescar Datos Manualmente
Si los datos están en BD pero no aparecen:
1. Recarga la página completa (Ctrl+Shift+R)
2. O cierra y abre la página admin

### Solución 2: Verificar Formato de Tiempo
Los inputs de tiempo deben mostrar "HH:MM" pero la BD guarda "HH:MM:SS":
```typescript
// Correcto ✅
<Input value={horario.hora_apertura.substring(0, 5)} />

// Incorrecto ❌
<Input value={horario.hora_apertura} />
```

### Solución 3: Limpiar Caché del Navegador
1. DevTools (F12)
2. Click derecho en el botón Reload
3. **"Empty Cache and Hard Reload"**

### Solución 4: Verificar Sesión Admin
Si no puedes editar:
```javascript
// Verifica en consola
const user = JSON.parse(localStorage.getItem('cantabarba_user'));
console.log('Rol actual:', user.rol); // Debe ser 'admin'
```

---

## 🔴 Verificación Final de Realtime

### En Supabase Dashboard:
1. **Database** → **Replication**
2. Verifica que estos 4 estén activos:
   - ☑️ `servicios`
   - ☑️ `horarios_semanales` ⚠️ **CRÍTICO**
   - ☑️ `dias_festivos`
   - ☑️ `configuracion` ⚠️ **CRÍTICO**

### En la App:
Abre la consola y verás al cargar:
```
📡 Canal horarios-changes: SUBSCRIBED
📡 Canal festivos-changes: SUBSCRIBED
📡 Canal config-changes: SUBSCRIBED
```

Si dice **CLOSED** o **CHANNEL_ERROR**, Realtime no funciona.

---

## 📋 Checklist de Verificación

- [ ] Tablas `horarios_semanales` y `configuracion` existen
- [ ] Realtime habilitado en Supabase UI para ambas tablas
- [ ] RLS deshabilitado o políticas configuradas correctamente
- [ ] Canal en consola muestra status "SUBSCRIBED"
- [ ] Al cambiar horario, aparece toast "Horario actualizado"
- [ ] Cambios persisten después de recargar página
- [ ] Consola muestra "🔄 Cambio en horarios detectado"

---

## 🆘 Si Nada Funciona

### Opción 1: Refresh Manual
Agrega botón de refresh temporal:
```tsx
<Button onClick={() => window.location.reload()}>
  Refrescar Datos
</Button>
```

### Opción 2: Polling como Fallback
Si Realtime falla, usar polling:
```typescript
useEffect(() => {
  const interval = setInterval(fetchHorarios, 5000); // cada 5s
  return () => clearInterval(interval);
}, []);
```

### Opción 3: Revisar Logs de Supabase
1. **Logs** → **Postgres Logs**
2. Busca errores relacionados con `horarios_semanales`
3. Verifica permisos de usuario

---

## 📞 Información de Debug

Si necesitas más ayuda, comparte:
1. Screenshot de la consola del navegador
2. Screenshot de Database → Replication (Supabase)
3. Resultado de `SELECT * FROM horarios_semanales;`
4. Mensaje de error completo (si hay)

---

**Última actualización:** Implementados optimistic updates + formato de tiempo automático
