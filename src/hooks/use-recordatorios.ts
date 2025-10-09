import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface Recordatorio {
  id: string;
  citaId: string;
  clienteNombre: string;
  clienteTelefono: string;
  fecha: string;
  hora: string;
  servicio: string;
  barbero: string;
  tipo: 'confirmacion' | 'recordatorio' | 'seguimiento';
  estado: 'pendiente' | 'enviado' | 'fallido';
  fechaEnvio?: string;
  intentos: number;
}

// Plantillas de mensajes
const PLANTILLAS_MENSAJES = {
  confirmacion: (nombre: string, fecha: string, hora: string, barbero: string) => 
    `¡Hola ${nombre}! 👋 Tu cita en CantaBarba Studio ha sido confirmada para el ${fecha} a las ${hora} con ${barbero}. ¡Te esperamos! ✂️💫`,
  
  recordatorio: (nombre: string, fecha: string, hora: string, barbero: string, servicio: string) => 
    `¡Hola ${nombre}! 📅 Te recordamos tu cita mañana ${fecha} a las ${hora} con ${barbero} para ${servicio}. ¡Nos vemos en CantaBarba Studio! ✨`,
  
  seguimiento: (nombre: string) => 
    `¡Hola ${nombre}! 🌟 Esperamos que hayas disfrutado tu experiencia en CantaBarba Studio. Nos encantaría conocer tu opinión. ¡Déjanos una reseña! 💙`
};

export const useRecordatorios = () => {
  const [recordatorios, setRecordatorios] = useState<Recordatorio[]>([]);
  const [enviandoRecordatorio, setEnviandoRecordatorio] = useState(false);

  // Simular el sistema de recordatorios automáticos
  useEffect(() => {
    // En una implementación real, esto sería un cron job del backend
    const interval = setInterval(() => {
      verificarRecordatoriosPendientes();
    }, 60000); // Cada minuto

    return () => clearInterval(interval);
  }, []);

  const crearRecordatorio = (
    citaId: string,
    clienteNombre: string,
    clienteTelefono: string,
    fecha: string,
    hora: string,
    servicio: string,
    barbero: string,
    tipo: 'confirmacion' | 'recordatorio' | 'seguimiento'
  ) => {
    const nuevoRecordatorio: Recordatorio = {
      id: `rec_${Date.now()}_${Math.random()}`,
      citaId,
      clienteNombre,
      clienteTelefono,
      fecha,
      hora,
      servicio,
      barbero,
      tipo,
      estado: 'pendiente',
      intentos: 0
    };

    setRecordatorios(prev => [...prev, nuevoRecordatorio]);

    // Si es confirmación, enviar inmediatamente
    if (tipo === 'confirmacion') {
      enviarRecordatorio(nuevoRecordatorio.id);
    }

    return nuevoRecordatorio.id;
  };

  const enviarRecordatorio = async (recordatorioId: string) => {
    setEnviandoRecordatorio(true);
    
    try {
      const recordatorio = recordatorios.find(r => r.id === recordatorioId);
      if (!recordatorio) throw new Error('Recordatorio no encontrado');

      // Simular envío de WhatsApp/SMS
      await simularEnvioWhatsApp(recordatorio);

      setRecordatorios(prev => prev.map(r => 
        r.id === recordatorioId 
          ? { 
              ...r, 
              estado: 'enviado' as const, 
              fechaEnvio: new Date().toISOString(),
              intentos: r.intentos + 1
            }
          : r
      ));

      toast.success(`Recordatorio enviado a ${recordatorio.clienteNombre}`);
    } catch (error) {
      setRecordatorios(prev => prev.map(r => 
        r.id === recordatorioId 
          ? { ...r, estado: 'fallido' as const, intentos: r.intentos + 1 }
          : r
      ));
      
      toast.error('Error al enviar recordatorio');
    } finally {
      setEnviandoRecordatorio(false);
    }
  };

  const simularEnvioWhatsApp = async (recordatorio: Recordatorio): Promise<void> => {
    // Simular latencia de API
    await new Promise(resolve => setTimeout(resolve, 1500));

    const mensaje = PLANTILLAS_MENSAJES[recordatorio.tipo](
      recordatorio.clienteNombre,
      new Date(recordatorio.fecha + 'T00:00:00').toLocaleDateString('es-MX', {
        day: 'numeric',
        month: 'long'
      }),
      recordatorio.hora,
      recordatorio.barbero,
      recordatorio.servicio
    );

    console.log(`📱 WhatsApp a ${recordatorio.clienteTelefono}:`);
    console.log(mensaje);

    // En implementación real, aquí iría la integración con WhatsApp Business API
    // fetch('/api/whatsapp/send', {
    //   method: 'POST',
    //   body: JSON.stringify({
    //     to: recordatorio.clienteTelefono,
    //     message: mensaje
    //   })
    // });
  };

  const verificarRecordatoriosPendientes = () => {
    const ahora = new Date();
    const mañana = new Date(ahora);
    mañana.setDate(mañana.getDate() + 1);
    mañana.setHours(9, 0, 0, 0); // Enviar recordatorios a las 9 AM

    recordatorios.forEach(recordatorio => {
      if (recordatorio.estado === 'pendiente' && recordatorio.tipo === 'recordatorio') {
        const fechaCita = new Date(recordatorio.fecha + 'T' + recordatorio.hora);
        const fechaRecordatorio = new Date(fechaCita);
        fechaRecordatorio.setDate(fechaRecordatorio.getDate() - 1);
        fechaRecordatorio.setHours(9, 0, 0, 0);

        // Si es hora de enviar el recordatorio
        if (ahora >= fechaRecordatorio && ahora < new Date(fechaRecordatorio.getTime() + 3600000)) {
          enviarRecordatorio(recordatorio.id);
        }
      }
    });
  };

  const programarRecordatorios = (
    citaId: string,
    clienteNombre: string,
    clienteTelefono: string,
    fecha: string,
    hora: string,
    servicio: string,
    barbero: string
  ) => {
    // Crear recordatorio de confirmación (inmediato)
    const confirmacionId = crearRecordatorio(
      citaId, clienteNombre, clienteTelefono, fecha, hora, servicio, barbero, 'confirmacion'
    );

    // Crear recordatorio 24h antes
    const recordatorioId = crearRecordatorio(
      citaId, clienteNombre, clienteTelefono, fecha, hora, servicio, barbero, 'recordatorio'
    );

    // Crear recordatorio de seguimiento (24h después de la cita)
    const seguimientoId = crearRecordatorio(
      citaId, clienteNombre, clienteTelefono, fecha, hora, servicio, barbero, 'seguimiento'
    );

    return {
      confirmacionId,
      recordatorioId,
      seguimientoId
    };
  };

  const obtenerEstadisticasRecordatorios = () => {
    const total = recordatorios.length;
    const enviados = recordatorios.filter(r => r.estado === 'enviado').length;
    const pendientes = recordatorios.filter(r => r.estado === 'pendiente').length;
    const fallidos = recordatorios.filter(r => r.estado === 'fallido').length;

    return {
      total,
      enviados,
      pendientes,
      fallidos,
      tasaExito: total > 0 ? (enviados / total * 100).toFixed(1) : '0'
    };
  };

  const reenviarRecordatorio = (recordatorioId: string) => {
    setRecordatorios(prev => prev.map(r => 
      r.id === recordatorioId 
        ? { ...r, estado: 'pendiente' as const }
        : r
    ));
    
    setTimeout(() => {
      enviarRecordatorio(recordatorioId);
    }, 1000);
  };

  return {
    recordatorios,
    enviandoRecordatorio,
    crearRecordatorio,
    enviarRecordatorio,
    programarRecordatorios,
    obtenerEstadisticasRecordatorios,
    reenviarRecordatorio,
    verificarRecordatoriosPendientes
  };
};