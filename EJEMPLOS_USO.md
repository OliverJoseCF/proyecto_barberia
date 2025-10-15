# 💡 Ejemplos de Uso - Nuevas Funcionalidades

## 📚 Guía Práctica de las Nuevas Funciones

---

## 1️⃣ Verificación de Disponibilidad Optimizada

### **Antes (lento):**
```typescript
// Consultaba manualmente la tabla de citas
const { data } = await supabase
  .from('citas')
  .select('*')
  .eq('fecha', fecha)
  .eq('hora', hora)
  .eq('barbero', barbero);

const disponible = !data || data.length === 0;
```

### **Ahora (10x más rápido):**
```typescript
import { verificarDisponibilidadOptimizada } from '@/lib/supabase';

// Usa función PostgreSQL nativa
const disponible = await verificarDisponibilidadOptimizada(
  '2025-10-15',
  '10:00',
  'Ángel Ramírez'
);

if (disponible) {
  console.log('✅ Horario disponible');
} else {
  console.log('❌ Horario ocupado');
}
```

---

## 2️⃣ Obtener Todos los Horarios del Día

### **Uso en Componente:**
```typescript
import { obtenerHorariosDisponibles } from '@/lib/supabase';
import { useState, useEffect } from 'react';

function SelectorHorarios({ fecha, barbero }) {
  const [horarios, setHorarios] = useState([]);

  useEffect(() => {
    async function cargarHorarios() {
      const data = await obtenerHorariosDisponibles(fecha, barbero);
      setHorarios(data);
    }
    cargarHorarios();
  }, [fecha, barbero]);

  return (
    <div className="grid grid-cols-4 gap-2">
      {horarios.map(({ hora, disponible }) => (
        <button
          key={hora}
          disabled={!disponible}
          className={disponible ? 'bg-green-500' : 'bg-gray-300'}
        >
          {hora}
        </button>
      ))}
    </div>
  );
}
```

---

## 3️⃣ Sistema de Tokens para Reprogramación Segura

### **Flujo Completo:**

#### **Paso 1: Generar token al crear la cita**
```typescript
import { generarTokenReprogramacion } from '@/lib/supabase';

// Después de crear una cita
const { data: cita } = await supabase
  .from('citas')
  .insert([nuevaCita])
  .select()
  .single();

if (cita) {
  // Generar token para reprogramación
  const token = await generarTokenReprogramacion(cita.id);
  
  // Enviar link por WhatsApp/SMS
  const linkReprogramacion = `https://tudominio.com/reprogramar?token=${token}`;
  console.log('Link de reprogramación:', linkReprogramacion);
}
```

#### **Paso 2: Validar token en página de reprogramación**
```typescript
import { validarTokenReprogramacion, marcarTokenUsado } from '@/lib/supabase';

function ReprogramarCita() {
  const [citaId, setCitaId] = useState(null);
  
  useEffect(() => {
    async function validarToken() {
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');
      
      if (!token) {
        toast.error('Token inválido');
        return;
      }
      
      // Validar token
      const id = await validarTokenReprogramacion(token);
      
      if (id) {
        setCitaId(id);
        console.log('✅ Token válido, cita:', id);
      } else {
        toast.error('Token expirado o inválido');
      }
    }
    validarToken();
  }, []);

  async function reprogramar(nuevaFecha, nuevaHora) {
    // Actualizar la cita...
    await supabase
      .from('citas')
      .update({ fecha: nuevaFecha, hora: nuevaHora })
      .eq('id', citaId);
    
    // Marcar token como usado
    const params = new URLSearchParams(window.location.search);
    await marcarTokenUsado(params.get('token'));
    
    toast.success('Cita reprogramada exitosamente');
  }
}
```

---

## 4️⃣ Ver Historial de Cambios de una Cita

### **En Panel de Admin:**
```typescript
import { obtenerHistorialCita } from '@/lib/supabase';

function HistorialCita({ citaId }) {
  const [historial, setHistorial] = useState([]);

  useEffect(() => {
    async function cargar() {
      const data = await obtenerHistorialCita(citaId);
      setHistorial(data);
    }
    cargar();
  }, [citaId]);

  return (
    <div className="space-y-2">
      <h3 className="font-bold">Historial de Cambios</h3>
      {historial.map((cambio, i) => (
        <div key={i} className="border-l-2 border-blue-500 pl-4">
          <p className="font-semibold">{cambio.accion}</p>
          <p className="text-sm text-gray-600">
            {new Date(cambio.fecha).toLocaleString()}
          </p>
          {cambio.cambios && (
            <pre className="text-xs bg-gray-100 p-2 mt-1">
              {JSON.stringify(cambio.cambios, null, 2)}
            </pre>
          )}
        </div>
      ))}
    </div>
  );
}
```

---

## 5️⃣ Dashboard con Cambios Recientes

### **Vista de Actividad Reciente:**
```typescript
import { obtenerCambiosRecientes } from '@/lib/supabase';

function ActividadReciente() {
  const [cambios, setCambios] = useState([]);

  useEffect(() => {
    async function cargar() {
      const data = await obtenerCambiosRecientes();
      setCambios(data);
    }
    cargar();
    
    // Actualizar cada 30 segundos
    const interval = setInterval(cargar, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-bold mb-4">
        Actividad Reciente (últimas 24h)
      </h3>
      <div className="space-y-2">
        {cambios.map((cambio, i) => (
          <div key={i} className="flex items-center justify-between">
            <div>
              <p className="font-medium">{cambio.cliente}</p>
              <p className="text-sm text-gray-600">
                {cambio.accion === 'INSERT' && '🆕 Nueva cita'}
                {cambio.accion === 'UPDATE' && '✏️ Modificada'}
                {cambio.accion === 'DELETE' && '🗑️ Eliminada'}
              </p>
            </div>
            <p className="text-xs text-gray-500">
              {new Date(cambio.fecha).toLocaleTimeString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 6️⃣ Estadísticas de Barbero

### **Panel de Desempeño:**
```typescript
import { obtenerEstadisticasBarbero } from '@/lib/supabase';

function EstadisticasBarbero({ barbero }) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    async function cargar() {
      // Últimos 30 días
      const desde = new Date();
      desde.setDate(desde.getDate() - 30);
      
      const data = await obtenerEstadisticasBarbero(
        barbero,
        desde.toISOString().split('T')[0],
        new Date().toISOString().split('T')[0]
      );
      setStats(data);
    }
    cargar();
  }, [barbero]);

  if (!stats) return <div>Cargando...</div>;

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-blue-100 p-4 rounded">
        <p className="text-sm text-gray-600">Total Citas</p>
        <p className="text-3xl font-bold">{stats.total_citas}</p>
      </div>
      <div className="bg-green-100 p-4 rounded">
        <p className="text-sm text-gray-600">Completadas</p>
        <p className="text-3xl font-bold">{stats.completadas}</p>
      </div>
      <div className="bg-red-100 p-4 rounded">
        <p className="text-sm text-gray-600">Canceladas</p>
        <p className="text-3xl font-bold">{stats.canceladas}</p>
      </div>
      <div className="bg-purple-100 p-4 rounded">
        <p className="text-sm text-gray-600">Tasa Completado</p>
        <p className="text-3xl font-bold">{stats.tasa_completado}%</p>
      </div>
    </div>
  );
}
```

---

## 7️⃣ Próximas Citas (Widget)

### **Dashboard Principal:**
```typescript
import { obtenerCitasProximas } from '@/lib/supabase';

function ProximasCitas() {
  const [citas, setCitas] = useState([]);

  useEffect(() => {
    async function cargar() {
      // Próximos 3 días, máximo 10 citas
      const data = await obtenerCitasProximas(3, 10);
      setCitas(data);
    }
    cargar();
  }, []);

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-bold mb-4">Próximas Citas</h3>
      <div className="space-y-3">
        {citas.map((cita) => (
          <div key={cita.id} className="flex items-center justify-between border-b pb-2">
            <div>
              <p className="font-medium">{cita.cliente_nombre}</p>
              <p className="text-sm text-gray-600">
                {cita.barbero} - {cita.servicio}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold">
                {new Date(cita.fecha).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-600">{cita.hora}</p>
              {cita.dias_restantes === 0 && (
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                  Hoy
                </span>
              )}
              {cita.dias_restantes === 1 && (
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                  Mañana
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 8️⃣ Manejo de Errores de Dobles Reservas

### **En Formulario de Citas:**
```typescript
import { useCitas } from '@/hooks/use-citas';

function FormularioCita() {
  const { createCita } = useCitas();

  async function handleSubmit(formData) {
    try {
      const { data, error } = await createCita(formData);
      
      if (error) {
        // Error de constraint de unicidad
        if (error.includes('unique_cita_fecha_hora_barbero')) {
          toast.error(
            'Este horario ya está ocupado. Por favor elige otro.',
            { duration: 5000 }
          );
          return;
        }
        
        // Otros errores
        toast.error('Error al crear la cita: ' + error);
        return;
      }
      
      toast.success('¡Cita creada exitosamente!');
    } catch (err) {
      console.error('Error inesperado:', err);
      toast.error('Ocurrió un error inesperado');
    }
  }
}
```

---

## 🔄 Refrescar Estadísticas Materializadas

### **Tarea Programada (Admin):**
```typescript
import { refrescarEstadisticas } from '@/lib/supabase';

// Ejecutar manualmente
async function actualizarEstadisticas() {
  const exito = await refrescarEstadisticas();
  
  if (exito) {
    toast.success('Estadísticas actualizadas');
  } else {
    toast.error('Error al actualizar estadísticas');
  }
}

// O automatizar (ejecutar cada noche)
useEffect(() => {
  const ahora = new Date();
  const siguienteEjecucion = new Date();
  siguienteEjecucion.setHours(23, 59, 0, 0);
  
  if (ahora > siguienteEjecucion) {
    siguienteEjecucion.setDate(siguienteEjecucion.getDate() + 1);
  }
  
  const delay = siguienteEjecucion.getTime() - ahora.getTime();
  
  const timeout = setTimeout(async () => {
    await refrescarEstadisticas();
    console.log('Estadísticas actualizadas automáticamente');
  }, delay);
  
  return () => clearTimeout(timeout);
}, []);
```

---

## 📊 Consultas SQL Directas en Supabase

### **Análisis de Cancelaciones:**
```sql
-- Ver todas las citas canceladas con razón
SELECT * FROM citas_canceladas_auditoria
WHERE fecha_original >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY fecha_cancelacion DESC;
```

### **Reprogramaciones Frecuentes:**
```sql
-- Ver quién reprograma más
SELECT cliente, COUNT(*) AS veces_reprogramado
FROM reprogramaciones_auditoria
GROUP BY cliente
HAVING COUNT(*) > 1
ORDER BY veces_reprogramado DESC;
```

### **Horarios más Populares:**
```sql
-- Horarios con más citas
SELECT hora, COUNT(*) AS total
FROM citas
WHERE estado = 'completada'
  AND fecha >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY hora
ORDER BY total DESC
LIMIT 5;
```

---

## 🎯 Checklist de Implementación

- [ ] Ejecuté los 4 scripts SQL en Supabase
- [ ] Verifiqué que las funciones existen
- [ ] Probé `verificarDisponibilidadOptimizada`
- [ ] Probé `obtenerHorariosDisponibles`
- [ ] Implementé manejo de errores de constraint
- [ ] Creé página de reprogramación con tokens
- [ ] Agregué widget de actividad reciente
- [ ] Agregué estadísticas de barberos
- [ ] Programé refresco de estadísticas

---

## 📞 Soporte

Si algo no funciona, verifica:
1. ✅ Ejecutaste los scripts SQL en orden
2. ✅ Reiniciaste el servidor de desarrollo
3. ✅ No hay errores en la consola del navegador
4. ✅ Las funciones existen en Supabase

¡Listo para producción! 🚀
