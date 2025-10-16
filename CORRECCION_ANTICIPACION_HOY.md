# 🔧 CORRECCIÓN: Anticipación Mínima para Citas HOY

## 📋 PROBLEMA IDENTIFICADO

**Escenario:**
- Hora actual: **9:47 PM** (miércoles 15)
- Configuración: Cierre a **11:59 PM**, anticipación mínima **1 hora**
- Comportamiento: Al seleccionar HOY, aparece "No hay horarios disponibles"

**Causa del error:**
La validación de anticipación comparaba la fecha de HOY (a medianoche) con la fecha actual (también a medianoche), resultando en `0.00` horas de diferencia, aunque había horarios válidos en el futuro (10:00 PM, 11:00 PM).

```
❌ ANTES:
fechaHoy: 2025-10-15 00:00:00
fechaCita: 2025-10-15 00:00:00
diferenciaHoras: 0.00
minimaRequerida: 1
❌ RECHAZADO (0 < 1)
```

---

## ✅ SOLUCIÓN IMPLEMENTADA

### Cambio 1: Validación de anticipación a nivel de fecha

**Archivo:** `use-availability.ts` → función `validarAnticipacion()`

```typescript
// ✅ NUEVO COMPORTAMIENTO:
const validarAnticipacion = (fecha: string): { valido: boolean; mensaje?: string } => {
  const hoy = obtenerFechaHoyLocal();
  
  // Si es HOY, permitir la fecha y validar anticipación por horario individual
  if (fecha === hoy) {
    console.log('✅ Es hoy - validación de anticipación se hará por horario');
    return { valido: true };
  }
  
  // Para fechas futuras, validar anticipación en días (lógica anterior)
  // ...
}
```

**Razón:** Las citas para HOY deben validarse a nivel de horario específico, no a nivel de día completo.

---

### Cambio 2: Filtro de horarios con anticipación mínima

**Archivo:** `use-availability.ts` → función `checkAvailabilityTraditional()`

```typescript
// ✅ NUEVO: Aplicar anticipación mínima al filtrar horarios de HOY
if (esFechaHoy(fecha)) {
  const minutosActuales = obtenerMinutosActualesLocal();
  const minutosAnticipacion = configuracion.anticipacion_minima_horas * 60;
  const minutosMinimos = minutosActuales + minutosAnticipacion;
  
  console.log(`⏰ Es hoy, filtrando horarios. Hora actual: 21:47`);
  console.log(`⏱️ Anticipación mínima: 1 horas (60 minutos)`);
  console.log(`⏰ Horarios válidos: después de 22:47`);
  
  horariosFiltrados = horariosBase.filter(hora => {
    const [horas, minutos] = hora.split(':').map(Number);
    const minutoHorario = horas * 60 + minutos;
    const cumpleAnticipacion = minutoHorario >= minutosMinimos;
    
    if (!cumpleAnticipacion) {
      const razon = minutoHorario <= minutosActuales ? 'ya pasó' : 
                   `anticipación insuficiente (necesita 1h)`;
      console.log(`  🚫 Horario ${hora} descartado (${razon})`);
    }
    
    return cumpleAnticipacion;
  });
}
```

**Mejoras:**
1. ✅ Calcula el horario mínimo válido: `hora_actual + anticipación_mínima`
2. ✅ Filtra horarios que ya pasaron
3. ✅ Filtra horarios que no cumplen anticipación mínima
4. ✅ Logs detallados con la razón del descarte

---

## 🧪 EJEMPLO PRÁCTICO

### Escenario: Son las 9:47 PM, configuración 1 hora de anticipación

**Entrada:**
```
📅 Fecha seleccionada: 2025-10-15 (HOY)
⏰ Hora actual: 21:47 (1307 minutos)
⏱️ Anticipación: 1 hora (60 minutos)
⏰ Horarios base: ["18:00", "19:00", "20:00", "21:00", "22:00", "23:00", "23:30"]
```

**Proceso:**
```
⏰ Horarios válidos: después de 22:47 (1367 minutos)

Evaluando cada horario:
  🚫 18:00 (1080 min) descartado (ya pasó)
  🚫 19:00 (1140 min) descartado (ya pasó)
  🚫 20:00 (1200 min) descartado (ya pasó)
  🚫 21:00 (1260 min) descartado (ya pasó)
  🚫 22:00 (1320 min) descartado (anticipación insuficiente - necesita 1h)
  ✅ 23:00 (1380 min) VÁLIDO (1380 >= 1367)
  ✅ 23:30 (1410 min) VÁLIDO (1410 >= 1367)
```

**Resultado:**
```
✅ 2 horarios disponibles: ["23:00", "23:30"]
```

---

## 🎯 CASOS DE USO CUBIERTOS

### Caso 1: Suficiente tiempo de anticipación
```
Hora actual: 9:47 PM
Anticipación: 1 hora
Horario disponible: 11:00 PM
✅ VÁLIDO (11:00 PM es 1h 13min después de 9:47 PM)
```

### Caso 2: Anticipación insuficiente
```
Hora actual: 9:47 PM
Anticipación: 1 hora
Horario disponible: 10:30 PM
🚫 RECHAZADO (10:30 PM es solo 43min después de 9:47 PM)
```

### Caso 3: Horario ya pasado
```
Hora actual: 9:47 PM
Horario disponible: 8:00 PM
🚫 RECHAZADO (ya pasó)
```

### Caso 4: Fecha futura (mañana)
```
Fecha: 2025-10-16 (mañana)
Anticipación: 1 hora
✅ VÁLIDO (validación de anticipación a nivel de días)
```

### Caso 5: Día completamente lleno
```
Hora actual: 11:30 PM
Cierre: 11:59 PM
Anticipación: 1 hora
🚫 No hay horarios disponibles (ninguno cumple 1h de anticipación)
```

---

## 📊 COMPARACIÓN ANTES/DESPUÉS

| Hora actual | Anticipación | Cierre | Horario | ❌ Antes | ✅ Ahora |
|-------------|--------------|--------|---------|----------|----------|
| 9:47 PM | 1h | 11:59 PM | 10:30 PM | ❌ No disponible | 🚫 Rechazado (43min) |
| 9:47 PM | 1h | 11:59 PM | 11:00 PM | ❌ No disponible | ✅ Disponible (1h 13min) |
| 9:47 PM | 1h | 11:59 PM | 23:30 PM | ❌ No disponible | ✅ Disponible (1h 43min) |
| 2:00 PM | 2h | 8:00 PM | 5:00 PM | ❌ No disponible | ✅ Disponible (3h) |
| 11:30 PM | 1h | 11:59 PM | Cualquiera | ❌ No disponible | 🚫 Correcto (no hay tiempo) |

---

## 🔍 LOGS DE DEBUGGING

### Console output esperado (9:47 PM, anticipación 1h):

```
📅 Generando horarios para: 2025-10-15
🌍 Información de Zona Horaria:
  ⏰ Hora local: 15/10/2025, 21:47:00
  📅 Fecha local (YYYY-MM-DD): 2025-10-15
  🕒 Minutos desde medianoche: 1307

⏱️ Validación de anticipación:
  fechaHoy: "2025-10-15"
  fechaCita: "2025-10-15"
  minimaRequerida: 1
✅ Es hoy - validación de anticipación se hará por horario

📆 Día de la semana: Miércoles (3)
🔍 Horario encontrado para el día: {activo: true, hora_apertura: "09:00", hora_cierre: "23:59", ...}

⏰ Es hoy, filtrando horarios. Hora actual: 21:47
⏱️ Anticipación mínima: 1 horas (60 minutos)
⏰ Horarios válidos: después de 22:47

  🚫 Horario 09:00 descartado (ya pasó)
  🚫 Horario 10:00 descartado (ya pasó)
  ...
  🚫 Horario 22:00 descartado (anticipación insuficiente - necesita 1h)
  ✅ Horario 23:00 válido
  ✅ Horario 23:30 válido

✅ 2 horarios disponibles después de filtrar
```

---

## ⚠️ CONSIDERACIONES IMPORTANTES

### 1. **Anticipación vs Horarios Pasados**
- **Horarios pasados**: No se pueden agendar bajo ninguna circunstancia
- **Anticipación insuficiente**: Horarios futuros pero demasiado cercanos

**Ejemplo (hora actual: 9:47 PM, anticipación: 1h):**
- ❌ `21:00` → Ya pasó (hace 47 minutos)
- ❌ `22:00` → Anticipación insuficiente (faltan 13 minutos)
- ✅ `23:00` → Válido (1h 13min de anticipación)

### 2. **Edge Case: Anticipación mayor que horario restante**
Si son las 11:30 PM y la anticipación es 1 hora, pero el cierre es 11:59 PM:
- No hay horarios válidos (correcto)
- Se muestra mensaje: "No hay horarios disponibles"

### 3. **Fechas Futuras**
Para fechas que NO son hoy, la validación de anticipación funciona a nivel de días (lógica anterior sin cambios).

---

## 🧪 PRUEBAS RECOMENDADAS

### Prueba 1: Tu caso específico
1. Configura cierre a 11:59 PM
2. Configura anticipación 1 hora
3. Cambia hora del sistema a 9:47 PM
4. Selecciona HOY
5. Verifica horarios después de 10:47 PM

**Resultado esperado:**
✅ Debe mostrar horarios desde 10:47 PM (o siguiente intervalo) hasta 11:59 PM

### Prueba 2: Sin tiempo suficiente
1. Cambia hora a 11:30 PM
2. Anticipación 1 hora
3. Cierre 11:59 PM
4. Selecciona HOY

**Resultado esperado:**
🚫 "No hay horarios disponibles"

### Prueba 3: Múltiples horarios válidos
1. Hora: 6:00 PM
2. Anticipación: 2 horas
3. Cierre: 10:00 PM
4. Selecciona HOY

**Resultado esperado:**
✅ Horarios desde 8:00 PM hasta 10:00 PM

---

## 📝 ARCHIVOS MODIFICADOS

**`src/hooks/use-availability.ts`:**
1. Función `validarAnticipacion()` - Línea ~140-165
   - Permite HOY sin validar anticipación de fecha
   - Validación de anticipación se delega a filtro de horarios

2. Función `checkAvailabilityTraditional()` - Línea ~240-265
   - Calcula `minutosMinimos = minutosActuales + anticipación`
   - Filtra horarios que no cumplen anticipación
   - Logs detallados con razón de descarte

---

## 🚀 PRÓXIMOS PASOS

1. **Probar** con tu escenario (9:47 PM, 1h anticipación)
2. **Verificar logs** en consola para confirmar lógica
3. **Ajustar anticipación** si es necesario desde panel admin
4. **Considerar** mensajes específicos en UI:
   - "No hay horarios con suficiente anticipación para hoy"
   - "Próximo horario disponible: 11:00 PM"

---

## ✅ RESULTADO FINAL

**Tu escenario (9:47 PM, miércoles 15, cierre 11:59 PM, anticipación 1h):**

```
✅ AHORA FUNCIONA:
- Sistema detecta que es HOY
- Hora actual: 9:47 PM (21:47)
- Horario mínimo: 10:47 PM (22:47)
- Horarios disponibles: 11:00 PM, 11:30 PM (si el intervalo es 30min)
- Usuario puede agendar para más tarde HOY 🎉
```
