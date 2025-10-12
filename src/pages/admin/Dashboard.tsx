import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import PageTransition from '@/components/ui/PageTransition';
import { 
  MetricCard, 
  SimpleBarChart, 
  RevenueChart
} from '@/components/ui/dashboard-metrics';
import { 
  Calendar, 
  Clock, 
  TrendingUp, 
  Scissors, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  LogOut,
  Home,
  User,
  Phone,
  Menu,
  DollarSign,
  Users,
  Star,
  Trash2,
  CalendarDays
} from 'lucide-react';
import { toast } from 'sonner';
import logoImage from '@/assets/logo.png';
import { supabase, type Cita } from '@/lib/supabase';
import { useCitas } from '@/hooks/use-citas';
import { useServicios } from '@/hooks/use-servicios';

interface EstadisticasDelDia {
  totalHoy: number; // Solo citas de hoy
  confirmadas: number; // TODAS las confirmadas
  pendientes: number; // TODAS las pendientes
  canceladas: number; // TODAS las canceladas
}

interface MetricasGenerales {
  totalCitas: number;
  citasHoy: number;
  ingresosMes: number;
  promedioIngresosPorCita: number;
  serviciosPopulares: Array<{ name: string; value: number; color?: string }>;
  horariosPico: Array<{ name: string; value: number }>;
  ingresosMensuales: Array<{ month: string; revenue: number }>;
  trends: {
    citas: { value: number; isPositive: boolean };
    ingresos: { value: number; isPositive: boolean };
    ingresosPromedio: { value: number; isPositive: boolean };
  };
}

interface BarberoData {
  nombre: string;
  email: string;
  rol: 'admin' | 'barbero';
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { getCitasByDate, getCitasByBarbero, updateCita, getCitas, deleteCita } = useCitas();
  const { servicios } = useServicios();
  const [barberoLogueado, setBarberoLogueado] = useState<any>(null);
  const [citas, setCitas] = useState<Cita[]>([]);
  const [todasLasCitas, setTodasLasCitas] = useState<Cita[]>([]); // Para cálculos globales
  const [loading, setLoading] = useState(true);
  
  const [stats, setStats] = useState<EstadisticasDelDia>({
    totalHoy: 0,
    confirmadas: 0,
    pendientes: 0,
    canceladas: 0,
  });

  const [metricas, setMetricas] = useState<MetricasGenerales>({
    totalCitas: 0,
    citasHoy: 0,
    ingresosMes: 0,
    promedioIngresosPorCita: 0,
    serviciosPopulares: [],
    horariosPico: [],
    ingresosMensuales: [],
    trends: {
      citas: { value: 0, isPositive: true },
      ingresos: { value: 0, isPositive: true },
      ingresosPromedio: { value: 0, isPositive: true }
    }
  });

  // Funciones de cálculo (definidas antes de los useEffect)
  // Función para calcular estadísticas (recibe citas de hoy Y todas las citas)
  const calcularEstadisticas = useCallback((citasHoy: Cita[], todasCitas: Cita[]) => {
    const nuevasStats = {
      totalHoy: citasHoy.length, // Solo citas de hoy
      confirmadas: todasCitas.filter(c => c.estado === 'confirmada').length, // TODAS las confirmadas
      pendientes: todasCitas.filter(c => c.estado === 'pendiente').length, // TODAS las pendientes
      canceladas: todasCitas.filter(c => c.estado === 'cancelada').length, // TODAS las canceladas
    };
    console.log('📊 [Dashboard] Estadísticas calculadas:', nuevasStats);
    setStats(nuevasStats);
  }, []);

  const calcularMetricas = useCallback((todasCitas: Cita[], nombreBarbero: string) => {
    console.log('📊 Calculando métricas con', todasCitas.length, 'citas');
    console.log('📋 Servicios disponibles:', servicios.length);
    
    // Si no hay servicios cargados, no calcular aún
    if (servicios.length === 0) {
      console.log('⏳ Esperando a que se carguen los servicios...');
      return;
    }
    
    // Obtener fecha actual
    const hoy = new Date();
    const mesActual = hoy.getMonth();
    const añoActual = hoy.getFullYear();
    
    // Filtrar TODAS las citas del mes actual (para conteo general)
    const citasMesActual = todasCitas.filter(cita => {
      const fechaCita = new Date(cita.fecha);
      return fechaCita.getMonth() === mesActual && 
             fechaCita.getFullYear() === añoActual &&
             cita.estado !== 'cancelada';
    });
    
    // Filtrar solo citas COMPLETADAS del mes (para ingresos)
    const citasCompletadasMes = todasCitas.filter(cita => {
      const fechaCita = new Date(cita.fecha);
      return fechaCita.getMonth() === mesActual && 
             fechaCita.getFullYear() === añoActual &&
             cita.estado === 'completada';
    });
    
    console.log('✅ Citas completadas del mes:', citasCompletadasMes.length, citasCompletadasMes);
    
    // Citas de hoy
    const hoyStr = hoy.toISOString().split('T')[0];
    const citasHoy = todasCitas.filter(c => c.fecha === hoyStr);
    
    // Calcular ingresos del mes (SOLO completadas)
    const ingresosMes = citasCompletadasMes.reduce((total, cita) => {
      const servicio = servicios.find(s => s.nombre === cita.servicio);
      console.log(`💰 Cita servicio: "${cita.servicio}" -> Servicio encontrado:`, servicio);
      return total + (servicio?.precio || 0);
    }, 0);
    
    console.log('💵 Ingresos totales del mes:', ingresosMes);
    
    // Promedio de ingresos por cita (SOLO completadas)
    const promedioIngresos = citasCompletadasMes.length > 0 
      ? Math.round(ingresosMes / citasCompletadasMes.length)
      : 0;
    
    // Servicios más populares
    const contadorServicios: Record<string, number> = {};
    todasCitas.forEach(cita => {
      if (cita.estado !== 'cancelada') {
        contadorServicios[cita.servicio] = (contadorServicios[cita.servicio] || 0) + 1;
      }
    });
    
    const serviciosPopulares = Object.entries(contadorServicios)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([nombre, cantidad], index) => ({
        name: nombre.length > 20 ? nombre.substring(0, 20) + '...' : nombre,
        value: cantidad,
        color: [
          'bg-gradient-to-r from-gold to-yellow-600',
          'bg-gradient-to-r from-blue-500 to-blue-700',
          'bg-gradient-to-r from-green-500 to-green-700',
          'bg-gradient-to-r from-purple-500 to-purple-700',
          'bg-gradient-to-r from-pink-500 to-pink-700'
        ][index]
      }));
    
    // Horarios pico
    const contadorHorarios: Record<string, number> = {};
    todasCitas.forEach(cita => {
      if (cita.estado !== 'cancelada' && cita.hora) {
        const hora = parseInt(cita.hora.split(':')[0]);
        let rango = '';
        if (hora >= 9 && hora < 11) rango = '9:00-11:00';
        else if (hora >= 11 && hora < 13) rango = '11:00-13:00';
        else if (hora >= 14 && hora < 16) rango = '14:00-16:00';
        else if (hora >= 16 && hora < 18) rango = '16:00-18:00';
        else if (hora >= 18 && hora < 20) rango = '18:00-20:00';
        
        if (rango) {
          contadorHorarios[rango] = (contadorHorarios[rango] || 0) + 1;
        }
      }
    });
    
    const horariosPico = [
      '9:00-11:00', '11:00-13:00', '14:00-16:00', '16:00-18:00', '18:00-20:00'
    ].map(rango => ({
      name: rango,
      value: contadorHorarios[rango] || 0
    }));
    
    // Ingresos mensuales (últimos 5 meses - SOLO completadas)
    const ingresosMensuales = [];
    for (let i = 4; i >= 0; i--) {
      const fecha = new Date(añoActual, mesActual - i, 1);
      const mes = fecha.toLocaleString('es-MX', { month: 'short' });
      
      const citasMes = todasCitas.filter(cita => {
        const fechaCita = new Date(cita.fecha);
        return fechaCita.getMonth() === fecha.getMonth() &&
               fechaCita.getFullYear() === fecha.getFullYear() &&
               cita.estado === 'completada'; // SOLO completadas
      });
      
      const ingresos = citasMes.reduce((total, cita) => {
        const servicio = servicios.find(s => s.nombre === cita.servicio);
        return total + (servicio?.precio || 0);
      }, 0);
      
      ingresosMensuales.push({
        month: mes.charAt(0).toUpperCase() + mes.slice(1),
        revenue: ingresos
      });
    }
    
    // Calcular trends (comparar con mes anterior - SOLO completadas)
    const mesAnterior = mesActual - 1;
    const citasCompletadasMesAnterior = todasCitas.filter(cita => {
      const fechaCita = new Date(cita.fecha);
      return fechaCita.getMonth() === mesAnterior &&
             cita.estado === 'completada'; // SOLO completadas
    });
    
    const ingresosMesAnterior = citasCompletadasMesAnterior.reduce((total, cita) => {
      const servicio = servicios.find(s => s.nombre === cita.servicio);
      return total + (servicio?.precio || 0);
    }, 0);
    
    const trendCitas = citasCompletadasMesAnterior.length > 0
      ? Math.round(((citasCompletadasMes.length - citasCompletadasMesAnterior.length) / citasCompletadasMesAnterior.length) * 100)
      : 0;
      
    const trendIngresos = ingresosMesAnterior > 0
      ? Math.round(((ingresosMes - ingresosMesAnterior) / ingresosMesAnterior) * 100)
      : 0;
    
    setMetricas({
      totalCitas: citasMesActual.length,
      citasHoy: citasHoy.length,
      ingresosMes: Math.round(ingresosMes),
      promedioIngresosPorCita: promedioIngresos,
      serviciosPopulares,
      horariosPico,
      ingresosMensuales,
      trends: {
        citas: { value: Math.abs(trendCitas), isPositive: trendCitas >= 0 },
        ingresos: { value: Math.abs(trendIngresos), isPositive: trendIngresos >= 0 },
        ingresosPromedio: { value: 5, isPositive: true }
      }
    });
    
    console.log('✅ Métricas calculadas:', {
      citasMes: citasMesActual.length,
      ingresosMes: Math.round(ingresosMes),
      serviciosTop: serviciosPopulares.length
    });
  }, [servicios]);

  useEffect(() => {
    checkSession();
  }, []);

  // Suscripción en tiempo real a cambios en la tabla de citas
  useEffect(() => {
    if (!barberoLogueado) {
      console.log('⏳ [Dashboard] Esperando datos del barbero...');
      return;
    }

    console.log('🔔 [Dashboard] Configurando suscripción en tiempo real para:', barberoLogueado.nombre);

    // Crear canal de suscripción
    const channel = supabase
      .channel('citas-changes', {
        config: {
          broadcast: { self: true }
        }
      })
      .on(
        'postgres_changes',
        {
          event: '*', // Escuchar INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'citas',
          filter: `barbero=eq.${barberoLogueado.nombre}` // Solo citas de este barbero
        },
        (payload) => {
          console.log('🔔 [Dashboard] Cambio detectado:', payload.eventType, payload);
          
          const hoy = new Date().toISOString().split('T')[0];
          
          if (payload.eventType === 'INSERT') {
            const nuevaCita = payload.new as Cita;
            console.log('➕ Nueva cita agregada:', nuevaCita);
            
            // Agregar a todas las citas
            setTodasLasCitas(prev => {
              // Evitar duplicados
              if (prev.some(c => c.id === nuevaCita.id)) {
                console.log('⚠️ Cita ya existe en todasLasCitas');
                return prev;
              }
              return [...prev, nuevaCita];
            });
            
            // Si es de hoy, agregarla a citas del día
            if (nuevaCita.fecha === hoy) {
              console.log('✅ Agregando cita de hoy al Dashboard');
              setCitas(prev => {
                // Evitar duplicados
                if (prev.some(c => c.id === nuevaCita.id)) {
                  console.log('⚠️ Cita ya existe en citas del día');
                  return prev;
                }
                return [...prev, nuevaCita];
              });
              toast.success('📅 Nueva cita agregada');
            } else {
              console.log('📅 Cita agregada pero no es de hoy:', nuevaCita.fecha);
            }
          } 
          else if (payload.eventType === 'UPDATE') {
            const citaActualizada = payload.new as Cita;
            console.log('✏️ Cita actualizada:', citaActualizada);
            
            // Actualizar en todas las citas
            setTodasLasCitas(prev => 
              prev.map(c => c.id === citaActualizada.id ? citaActualizada : c)
            );
            
            // Actualizar en citas del día
            setCitas(prev => {
              const citaExiste = prev.some(c => c.id === citaActualizada.id);
              
              // Si la cita es de hoy
              if (citaActualizada.fecha === hoy) {
                if (citaExiste) {
                  // Ya existe, solo actualizar
                  return prev.map(c => 
                    c.id === citaActualizada.id ? citaActualizada : c
                  );
                } else {
                  // No existe, agregarla (cambió de fecha a hoy)
                  return [...prev, citaActualizada];
                }
              } else {
                // La cita NO es de hoy, removerla si existe
                return prev.filter(c => c.id !== citaActualizada.id);
              }
            });
          } 
          else if (payload.eventType === 'DELETE') {
            const citaEliminada = payload.old as Cita;
            console.log('🗑️ Cita eliminada:', citaEliminada);
            
            // Eliminar de todas las citas
            setTodasLasCitas(prev => prev.filter(c => c.id !== citaEliminada.id));
            
            // Eliminar de citas del día
            setCitas(prev => prev.filter(c => c.id !== citaEliminada.id));
          }
        }
      )
      .subscribe((status, err) => {
        if (err) {
          console.error('❌ [Dashboard] Error en suscripción:', err);
          toast.error('Error en tiempo real. Recargando...');
          // Recargar datos después de 2 segundos
          setTimeout(() => {
            if (barberoLogueado) {
              loadCitasDelBarbero(barberoLogueado.nombre);
            }
          }, 2000);
          return;
        }
        
        console.log('📡 [Dashboard] Estado de suscripción:', status);
        
        if (status === 'SUBSCRIBED') {
          console.log('✅ [Dashboard] Suscripción activa correctamente');
          // Solo mostrar toast en desarrollo
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ [Dashboard] Error en el canal');
          toast.error('Error de conexión en tiempo real');
        } else if (status === 'TIMED_OUT') {
          console.warn('⏱️ [Dashboard] Timeout en la suscripción (normal con conexión lenta)');
          // No mostrar toast - puede ser conexión lenta temporal
        } else if (status === 'CLOSED') {
          console.log('🔌 [Dashboard] Canal cerrado');
        }
      });

    // Cleanup: desuscribirse cuando el componente se desmonte
    return () => {
      console.log('🔕 [Dashboard] Desuscribiendo de cambios en tiempo real');
      supabase.removeChannel(channel);
    };
  }, [barberoLogueado]);

  // Recalcular estadísticas cuando las citas del día O todas las citas cambien
  useEffect(() => {
    console.log('🔄 [Dashboard] Citas actualizadas, recalculando estadísticas. Hoy:', citas.length, 'Total:', todasLasCitas.length);
    calcularEstadisticas(citas, todasLasCitas);
  }, [citas, todasLasCitas, calcularEstadisticas]);

  // Recalcular métricas cuando los servicios O las citas cambien
  useEffect(() => {
    if (servicios.length > 0 && todasLasCitas.length > 0 && barberoLogueado) {
      console.log('🔄 Recalculando métricas - Servicios:', servicios.length, 'Citas:', todasLasCitas.length);
      calcularMetricas(todasLasCitas, barberoLogueado.nombre);
    }
  }, [servicios, todasLasCitas]);

  const checkSession = () => {
    // Verificar sesión guardada
    const userDataString = localStorage.getItem('cantabarba_user');
    if (!userDataString) {
      console.log('❌ No hay sesión activa');
      navigate('/admin/login');
      return;
    }

    const userData = JSON.parse(userDataString);
    console.log('✅ Sesión activa:', userData);
    setBarberoLogueado(userData);
    loadCitasDelBarbero(userData.nombre);
  };

  const loadCitasDelBarbero = async (nombreBarbero: string) => {
    try {
      setLoading(true);
      console.log(`📊 [Dashboard] Cargando citas de barbero: "${nombreBarbero}"`);
      
      const hoy = new Date().toISOString().split('T')[0];
      console.log(`📅 [Dashboard] Fecha de hoy: ${hoy}`);
      
      // Obtener citas del barbero para HOY
      const todasLasCitas = await getCitasByBarbero(nombreBarbero);
      console.log(`📋 [Dashboard] Total de citas del barbero: ${todasLasCitas.length}`);
      
      // Guardar todas las citas del barbero para cálculos
      setTodasLasCitas(todasLasCitas);
      
      // Filtrar solo citas de hoy para el dashboard
      const citasHoy = todasLasCitas.filter((cita: any) => {
        console.log(`🔍 Comparando: cita.fecha="${cita.fecha}" vs hoy="${hoy}" → match: ${cita.fecha === hoy}`);
        return cita.fecha === hoy;
      });
      
      console.log(`✅ [Dashboard] ${citasHoy.length} citas encontradas para hoy:`, citasHoy);
      console.log(`📅 [Dashboard] Comparando fechas - Hoy: "${hoy}", Citas:`, todasLasCitas.map(c => ({ id: c.id, fecha: c.fecha, match: c.fecha === hoy })));
      
      // useEffect se encargará de calcular estadísticas y métricas automáticamente
      setCitas(citasHoy);
    } catch (error: any) {
      console.error('❌ [Dashboard] Error al cargar citas:', error);
      toast.error('No se pudieron cargar las citas');
      setCitas([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    localStorage.removeItem('cantabarba_user');
    toast.success('Sesión cerrada');
    navigate('/admin/login');
  };

  const actualizarEstado = async (citaId: string, nuevoEstado: Cita['estado']) => {
    try {
      console.log(`📝 [Dashboard] Actualizando cita ${citaId} a estado: ${nuevoEstado}`);
      
      const { error } = await updateCita(citaId, { estado: nuevoEstado });

      if (error) {
        throw new Error(error);
      }

      console.log(`✅ [Dashboard] Cita actualizada exitosamente`);
      
      // Actualizar la lista de citas de hoy (useEffect recalculará stats automáticamente)
      setCitas(prevCitas =>
        prevCitas.map(cita => 
          cita.id === citaId ? { ...cita, estado: nuevoEstado } : cita
        )
      );
      
      // Actualizar TODAS las citas del barbero
      setTodasLasCitas(prevCitas => 
        prevCitas.map(cita => 
          cita.id === citaId ? { ...cita, estado: nuevoEstado } : cita
        )
      );

      // Mensaje personalizado según el estado
      const mensajes = {
        confirmada: '✅ Cita confirmada',
        cancelada: '❌ Cita cancelada',
        completada: '✔️ Cita completada',
        pendiente: '⏳ Cita marcada como pendiente'
      };
      
      toast.success(mensajes[nuevoEstado] || 'Cita actualizada');
    } catch (error: any) {
      console.error('❌ [Dashboard] Error al actualizar:', error);
      toast.error('Error al actualizar la cita');
    }
  };

  const eliminarCita = async (citaId: string) => {
    try {
      console.log(`🗑️ [Dashboard] Eliminando cita ${citaId}`);
      
      const { error } = await deleteCita(citaId);

      if (error) {
        throw new Error(error);
      }

      console.log(`✅ [Dashboard] Cita eliminada exitosamente`);
      
      // Actualizar la lista local (useEffect recalculará stats automáticamente)
      setCitas(prevCitas => prevCitas.filter(cita => cita.id !== citaId));
      
      // Actualizar todas las citas (useEffect recalculará métricas automáticamente)
      setTodasLasCitas(prevCitas => prevCitas.filter(cita => cita.id !== citaId));

      toast.success('🗑️ Cita eliminada correctamente');
    } catch (error: any) {
      console.error('❌ [Dashboard] Error al eliminar:', error);
      toast.error('Error al eliminar la cita');
    }
  };

  const getEstadoBadge = (estado: Cita['estado']) => {
    const badges = {
      pendiente: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50',
      confirmada: 'bg-green-500/20 text-green-500 border-green-500/50',
      cancelada: 'bg-red-500/20 text-red-500 border-red-500/50',
      completada: 'bg-blue-500/20 text-blue-500 border-blue-500/50',
    };
    return badges[estado] || badges.pendiente;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin text-gold text-4xl">⏳</div>
      </div>
    );
  }

  return (
    <PageTransition>
      {/* Header */}
      <header className="bg-card border-b border-gold/20 sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Scissors className="h-8 w-8 text-gold" />
              <div>
                <h1 className="font-display text-2xl gradient-gold bg-clip-text text-transparent">
                  Panel de Administración
                </h1>
                <p className="font-elegant text-sm text-muted-foreground">
                  {barberoLogueado ? (
                    <span>
                      Bienvenido, <span className="text-gold">{barberoLogueado.nombre}</span>
                    </span>
                  ) : (
                    'Cargando...'
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/')}
                className="text-gold hover:text-gold/80 font-elegant"
              >
                <Menu className="h-5 w-5 mr-2" />
                Ir al sitio
              </Button>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="border-gold/50 text-gold hover:bg-gold/10 font-elegant"
              >
                <LogOut className="h-5 w-5 mr-2" />
                Cerrar sesión
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="glass-effect border-gold/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="font-elegant text-sm font-medium text-muted-foreground">
                Total Hoy
              </CardTitle>
              <Calendar className="h-5 w-5 text-gold" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-display gradient-gold bg-clip-text text-transparent">
                {stats.totalHoy}
              </div>
              <p className="text-xs text-muted-foreground font-elegant mt-1">
                Citas programadas
              </p>
            </CardContent>
          </Card>

          <Card className="glass-effect border-green-500/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="font-elegant text-sm font-medium text-muted-foreground">
                Confirmadas
              </CardTitle>
              <CheckCircle className="h-5 w-5 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-display text-green-500">
                {stats.confirmadas}
              </div>
              <p className="text-xs text-muted-foreground font-elegant mt-1">
                Total confirmadas
              </p>
            </CardContent>
          </Card>

          <Card className="glass-effect border-yellow-500/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="font-elegant text-sm font-medium text-muted-foreground">
                Pendientes
              </CardTitle>
              <AlertCircle className="h-5 w-5 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-display text-yellow-500">
                {stats.pendientes}
              </div>
              <p className="text-xs text-muted-foreground font-elegant mt-1">
                Total pendientes
              </p>
            </CardContent>
          </Card>

          <Card className="glass-effect border-red-500/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="font-elegant text-sm font-medium text-muted-foreground">
                Canceladas
              </CardTitle>
              <XCircle className="h-5 w-5 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-display text-red-500">
                {stats.canceladas}
              </div>
              <p className="text-xs text-muted-foreground font-elegant mt-1">
                Total canceladas
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Métricas Avanzadas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <MetricCard
            title="Citas del Mes"
            value={metricas.totalCitas}
            description={`${metricas.citasHoy} citas hoy`}
            trend={metricas.trends.citas}
            icon={<Calendar className="h-4 w-4" />}
          />
          
          <MetricCard
            title="Ingresos del Mes"
            value={`$${metricas.ingresosMes.toLocaleString()}`}
            description="MXN brutos"
            trend={metricas.trends.ingresos}
            icon={<DollarSign className="h-4 w-4" />}
          />

          <MetricCard
            title="Ticket Promedio"
            value={`$${metricas.promedioIngresosPorCita}`}
            description="Por cita"
            trend={metricas.trends.ingresosPromedio}
            icon={<Star className="h-4 w-4" />}
          />
        </div>

        {/* Gráficos y Análisis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <RevenueChart monthlyData={metricas.ingresosMensuales} />
          
          <SimpleBarChart
            data={metricas.serviciosPopulares}
            title="Servicios Más Populares"
          />
        </div>

        {/* Sistema de Recordatorios - REEMPLAZADO POR RESUMEN Y PRÓXIMAS CITAS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Resumen General */}
          <Card className="glass-effect border-gold/20">
            <CardHeader>
              <CardTitle className="font-display text-lg gradient-gold bg-clip-text text-transparent flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-gold" />
                Resumen de Citas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="font-elegant text-sm text-muted-foreground">Confirmadas</p>
                      <p className="font-display text-2xl text-green-500">{stats.confirmadas}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-yellow-500" />
                    <div>
                      <p className="font-elegant text-sm text-muted-foreground">Pendientes</p>
                      <p className="font-display text-2xl text-yellow-500">{stats.pendientes}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                  <div className="flex items-center gap-3">
                    <XCircle className="h-5 w-5 text-red-500" />
                    <div>
                      <p className="font-elegant text-sm text-muted-foreground">Canceladas</p>
                      <p className="font-display text-2xl text-red-500">{stats.canceladas}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-gold/10 border border-gold/20">
                  <div className="flex items-center gap-3">
                    <Scissors className="h-5 w-5 text-gold" />
                    <div>
                      <p className="font-elegant text-sm text-muted-foreground">Total Hoy</p>
                      <p className="font-display text-2xl text-gold">{stats.totalHoy}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Próximas Citas */}
          <Card className="glass-effect border-gold/20">
            <CardHeader>
              <CardTitle className="font-display text-lg gradient-gold bg-clip-text text-transparent flex items-center gap-2">
                <Clock className="h-5 w-5 text-gold" />
                Próximas Citas
              </CardTitle>
              <CardDescription className="font-elegant">
                Siguientes {Math.min(3, citas.filter(c => c.estado !== 'cancelada').length)} citas de hoy
              </CardDescription>
            </CardHeader>
            <CardContent>
              {citas.filter(c => c.estado !== 'cancelada').length === 0 ? (
                <div className="text-center py-6">
                  <Calendar className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="font-elegant text-muted-foreground text-sm">
                    No hay citas próximas
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {citas
                    .filter(c => c.estado !== 'cancelada')
                    .sort((a, b) => a.hora.localeCompare(b.hora))
                    .slice(0, 3)
                    .map((cita) => (
                      <div 
                        key={cita.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors border border-gold/10"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex flex-col items-center justify-center bg-gold/20 rounded-lg p-2 min-w-[60px]">
                            <Clock className="h-4 w-4 text-gold mb-1" />
                            <span className="font-display text-sm text-gold">{cita.hora}</span>
                          </div>
                          
                          <div>
                            <p className="font-display text-sm font-medium">
                              {cita.cliente_nombre}
                            </p>
                            <p className="font-elegant text-xs text-muted-foreground">
                              {cita.servicio}
                            </p>
                          </div>
                        </div>

                        <span className={`px-2 py-1 rounded-full text-xs font-elegant border ${getEstadoBadge(cita.estado)}`}>
                          {cita.estado.toUpperCase()}
                        </span>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Horarios Pico */}
        <div className="mb-8">
          <SimpleBarChart
            data={metricas.horariosPico}
            title="Horarios de Mayor Demanda"
          />
        </div>

        {/* Citas del Día */}
        <Card className="glass-effect border-gold/20">
          <CardHeader>
            <CardTitle className="font-display text-2xl gradient-gold bg-clip-text text-transparent">
              Citas de Hoy
            </CardTitle>
            <CardDescription className="font-elegant">
              {new Date().toLocaleDateString('es-MX', { 
                day: 'numeric',
                month: 'long', 
                year: 'numeric'
              })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {citas.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="font-elegant text-muted-foreground">
                  No hay citas programadas para hoy
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {citas.map((cita) => (
                  <div
                    key={cita.id}
                    className="grid grid-cols-12 gap-4 items-center p-4 rounded-lg border border-gold/10 bg-card/50 hover:bg-card/80 transition-all"
                  >
                    {/* Cliente - 2 columnas */}
                    <div className="col-span-12 md:col-span-2">
                      <p className="font-elegant text-sm text-muted-foreground mb-1">Cliente</p>
                      <p className="font-display text-gold truncate">{cita.cliente_nombre}</p>
                      <p className="font-elegant text-xs text-muted-foreground">{cita.cliente_telefono}</p>
                    </div>
                    
                    {/* Hora - 1 columna */}
                    <div className="col-span-6 md:col-span-1">
                      <p className="font-elegant text-sm text-muted-foreground mb-1">Hora</p>
                      <p className="font-display flex items-center gap-1 text-sm">
                        <Clock className="h-3 w-3 text-gold" />
                        {cita.hora}
                      </p>
                    </div>
                    
                    {/* Servicio - 2 columnas */}
                    <div className="col-span-6 md:col-span-2">
                      <p className="font-elegant text-sm text-muted-foreground mb-1">Servicio</p>
                      <p className="font-elegant text-sm">{cita.servicio}</p>
                    </div>
                    
                    {/* Barbero - 2 columnas */}
                    <div className="col-span-6 md:col-span-2">
                      <p className="font-elegant text-sm text-muted-foreground mb-1">Barbero</p>
                      <p className="font-elegant text-sm">{cita.barbero}</p>
                    </div>
                    
                    {/* Estado - 1 columna */}
                    <div className="col-span-6 md:col-span-1">
                      <p className="font-elegant text-sm text-muted-foreground mb-1">Estado</p>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-elegant border ${getEstadoBadge(cita.estado)}`}>
                        {cita.estado.toUpperCase()}
                      </span>
                    </div>
                    
                    {/* Acciones - 4 columnas para más espacio */}
                    <div className="col-span-12 md:col-span-4 flex items-center gap-3 justify-end">
                      {cita.estado === 'pendiente' ? (
                        <>
                          <Button
                            size="sm"
                            onClick={() => actualizarEstado(cita.id, 'confirmada')}
                            className="bg-green-500 hover:bg-green-600 text-white text-xs px-3 py-1 h-8"
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Confirmar
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => actualizarEstado(cita.id, 'cancelada')}
                            className="text-xs px-3 py-1 h-8"
                          >
                            <XCircle className="h-3 w-3 mr-1" />
                            Cancelar
                          </Button>
                        </>
                      ) : cita.estado === 'confirmada' ? (
                        <>
                          <Button
                            size="sm"
                            onClick={() => actualizarEstado(cita.id, 'completada')}
                            className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-3 py-1 h-8"
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Completar
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => actualizarEstado(cita.id, 'cancelada')}
                            className="text-xs px-3 py-1 h-8"
                          >
                            <XCircle className="h-3 w-3 mr-1" />
                            Cancelar
                          </Button>
                        </>
                      ) : cita.estado === 'completada' ? (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => eliminarCita(cita.id)}
                          className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1 h-8"
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Eliminar Cita
                        </Button>
                      ) : cita.estado === 'cancelada' ? (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => eliminarCita(cita.id)}
                          className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1 h-8"
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Eliminar Cita
                        </Button>
                      ) : (
                        <div className="h-8"></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Button
            variant="outline"
            className="h-24 border-gold/50 hover:bg-gold/10 font-elegant text-lg"
            onClick={() => navigate('/admin/citas')}
          >
            <Calendar className="h-6 w-6 mr-3 text-gold" />
            Ver Todas las Citas
          </Button>
          <Button
            variant="outline"
            className="h-24 border-gold/50 hover:bg-gold/10 font-elegant text-lg"
            onClick={() => navigate('/admin/calendario')}
          >
            <Clock className="h-6 w-6 mr-3 text-gold" />
            Calendario
          </Button>
          <Button
            variant="outline"
            className="h-24 border-gold/50 hover:bg-gold/10 font-elegant text-lg"
            onClick={() => navigate('/admin/estadisticas')}
          >
            <TrendingUp className="h-6 w-6 mr-3 text-gold" />
            Estadísticas
          </Button>
        </div>
      </main>
    </PageTransition>
  );
};

export default AdminDashboard;
