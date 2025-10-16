# Instrucciones para Configurar Horarios en Supabase

## Paso 1: Ejecutar el Script SQL

1. Ve a tu proyecto en Supabase (https://supabase.com)
2. En el menú lateral, selecciona **SQL Editor**
3. Haz clic en **New Query**
4. Copia y pega el contenido completo del archivo `configuracion-horarios.sql`
5. Haz clic en **Run** (o presiona Ctrl+Enter)

## Paso 2: Verificar las Tablas Creadas

Después de ejecutar el script, verifica que se crearon las siguientes tablas:

- ✅ `configuracion` - Configuración general del sistema
- ✅ `horarios_semanales` - Horarios por día de la semana
- ✅ `dias_festivos` - Días cerrados/festivos

## Paso 3: Verificar Datos Iniciales

Las tablas deben tener estos datos por defecto:

### `horarios_semanales` (7 registros)
- Lunes a Jueves: 09:00 - 19:00 (activos)
- Viernes: 09:00 - 20:00 (activo)
- Sábado: 09:00 - 18:00 (activo)
- Domingo: 10:00 - 14:00 (inactivo)

### `configuracion` (3 registros)
- `intervalo_citas_minutos`: 30
- `anticipacion_minima_horas`: 2
- `anticipacion_maxima_dias`: 30

## Paso 4: Habilitar Realtime (Importante)

Para que los cambios se reflejen en tiempo real:

1. En Supabase, ve a **Database** → **Replication**
2. Busca las tablas:
   - `configuracion`
   - `horarios_semanales`
   - `dias_festivos`
3. Activa el toggle de **Realtime** para cada una

## Paso 5: Probar en la Aplicación

1. Inicia tu aplicación (`npm run dev`)
2. Inicia sesión como administrador
3. Ve a **Configuración** → **Horarios de Trabajo**
4. Deberías ver:
   - Los 7 días de la semana con sus horarios
   - Opciones para configurar intervalos de citas
   - Sección para agregar días festivos

## Verificación de Funcionalidad

### Horarios Semanales
- [ ] Puedes activar/desactivar cada día
- [ ] Puedes cambiar hora de apertura y cierre
- [ ] Puedes configurar pausas (opcional)
- [ ] Los cambios se guardan automáticamente en Supabase

### Días Festivos
- [ ] Puedes agregar nuevas fechas
- [ ] Puedes marcar como recurrente (se repite cada año)
- [ ] Puedes eliminar días festivos
- [ ] Los cambios se reflejan de inmediato

### Configuración de Citas
- [ ] Puedes cambiar el intervalo entre citas (15, 30, 45, 60 min)
- [ ] Puedes ajustar anticipación mínima y máxima
- [ ] Los cambios se guardan al modificar

## Solución de Problemas

### Error: "relation does not exist"
- **Causa:** Las tablas no se crearon
- **Solución:** Ejecuta nuevamente el script SQL completo

### No se ven los horarios
- **Causa:** Datos iniciales no se insertaron
- **Solución:** Ejecuta manualmente:
```sql
SELECT * FROM horarios_semanales;
```
Si está vacío, ejecuta solo la sección de INSERT del script.

### Cambios no se reflejan en tiempo real
- **Causa:** Realtime no está activado
- **Solución:** Sigue el Paso 4 para habilitar Realtime

### Error de permisos (RLS)
- **Causa:** Row Level Security bloqueando operaciones
- **Solución:** Las políticas están configuradas para permitir todo temporalmente. Si usas autenticación de Supabase, ajusta las políticas según tu sistema.

## Próximos Pasos

Una vez verificado que todo funciona:

1. ✅ **Servicios** - Ya funcional con Realtime
2. ✅ **Horarios** - Ya funcional con Realtime
3. ⏳ **Sincronizar con página principal** - Siguiente fase
4. ⏳ **Barberos** - Por implementar
5. ⏳ **Galería** - Por implementar
6. ⏳ **Notificaciones** - Por implementar

## Notas Importantes

- 📌 Los cambios en horarios afectarán la disponibilidad en el sistema de reservas
- 📌 Los días festivos bloquearán completamente esas fechas para citas
- 📌 El intervalo de citas determina cada cuánto tiempo se puede reservar
- 📌 Todos los cambios son instantáneos gracias a Realtime
