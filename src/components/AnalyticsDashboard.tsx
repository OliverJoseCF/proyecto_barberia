import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, Calendar, Clock, Star, DollarSign } from 'lucide-react';
import { supabase, type Cita } from '@/lib/supabase';
import { useServicios } from '@/hooks/use-servicios';
import { useCitas } from '@/hooks/use-citas';
import { toast } from 'sonner';

// Tipos para analytics
interface AnalyticsData {
  totalAppointments: number;
  appointmentsThisMonth: number;
  totalCustomers: number;
  popularServices: Array<{ name: string; count: number }>;
  peakHours: Array<{ hour: string; appointments: number }>;
  monthlyRevenue: number;
  completionRate: number;
  trends: {
    appointments: number;
    revenue: number;
  };
}

interface AnalyticsDashboardProps {
  barberoNombre?: string;
  rol?: 'admin' | 'barbero';
}

// Hook para obtener datos de analytics REALES
export const useAnalytics = (barberoNombre?: string, rol: 'admin' | 'barbero' = 'barbero') => {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalAppointments: 0,
    appointmentsThisMonth: 0,
    totalCustomers: 0,
    popularServices: [],
    peakHours: [],
    monthlyRevenue: 0,
    completionRate: 0,
    trends: {
      appointments: 0,
      revenue: 0
    }
  });

  const [loading, setLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true); // Nueva bandera
  const { getCitas, getCitasByBarbero } = useCitas();
  const { servicios } = useServicios();

  useEffect(() => {
    loadAnalytics(true); // Carga inicial
  }, [barberoNombre, servicios]);

  // Suscripción en tiempo real
  useEffect(() => {
    if (!barberoNombre) return;

    console.log('🔔 [Analytics] Configurando suscripción en tiempo real');

    const channel = supabase
      .channel('analytics-changes', {
        config: {
          broadcast: { self: true }
        }
      })
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'citas'
        },
        (payload) => {
          console.log('🔔 [Analytics] Cambio detectado, actualizando estadísticas silenciosamente');
          loadAnalytics(false); // Actualización sin loading
        }
      )
      .subscribe((status, err) => {
        if (err) {
          console.error('❌ [Analytics] Error en suscripción:', err);
          // No mostrar toast - error silencioso
          return;
        }
        
        console.log('📡 [Analytics] Estado de suscripción:', status);
        
        if (status === 'SUBSCRIBED') {
          console.log('✅ [Analytics] Suscripción activa correctamente');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ [Analytics] Error en el canal');
        } else if (status === 'TIMED_OUT') {
          console.warn('⏱️ [Analytics] Timeout (normal con conexión lenta)');
        } else if (status === 'CLOSED') {
          console.log('🔌 [Analytics] Canal cerrado');
        }
      });

    return () => {
      console.log('🔕 [Analytics] Desuscribiendo');
      supabase.removeChannel(channel);
    };
  }, [barberoNombre]);

  const loadAnalytics = async (showLoading = true) => {
    try {
      // Solo mostrar loading en la carga inicial
      if (showLoading) {
        setLoading(true);
      }
      
      console.log('📊 [Analytics] Cargando estadísticas...');

      // Obtener todas las citas según el rol
      let todasCitas: Cita[] = [];
      if (rol === 'admin' || !barberoNombre) {
        todasCitas = await getCitas();
      } else {
        todasCitas = await getCitasByBarbero(barberoNombre);
      }

      console.log(`📋 [Analytics] ${todasCitas.length} citas encontradas`);

      // Calcular estadísticas
      const hoy = new Date();
      const mesActual = hoy.getMonth();
      const añoActual = hoy.getFullYear();

      // Citas del mes actual
      const citasMesActual = todasCitas.filter(cita => {
        const fechaCita = new Date(cita.fecha);
        return fechaCita.getMonth() === mesActual && 
               fechaCita.getFullYear() === añoActual;
      });

      // Citas completadas del mes
      const citasCompletadasMes = citasMesActual.filter(c => c.estado === 'completada');

      // Total de clientes únicos
      const clientesUnicos = new Set(todasCitas.map(c => c.cliente_telefono)).size;

      // Servicios populares
      const contadorServicios: Record<string, number> = {};
      todasCitas.forEach(cita => {
        if (cita.estado !== 'cancelada') {
          contadorServicios[cita.servicio] = (contadorServicios[cita.servicio] || 0) + 1;
        }
      });

      const serviciosPopulares = Object.entries(contadorServicios)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([name, count]) => ({ name, count }));

      // Horarios pico
      const contadorHorarios: Record<string, number> = {};
      todasCitas.forEach(cita => {
        if (cita.estado !== 'cancelada' && cita.hora) {
          const hora = parseInt(cita.hora.split(':')[0]);
          let rango = '';
          if (hora >= 9 && hora < 12) rango = '9:00-12:00';
          else if (hora >= 12 && hora < 14) rango = '12:00-14:00';
          else if (hora >= 14 && hora < 17) rango = '14:00-17:00';
          else if (hora >= 17 && hora < 20) rango = '17:00-20:00';
          
          if (rango) {
            contadorHorarios[rango] = (contadorHorarios[rango] || 0) + 1;
          }
        }
      });

      const horariosPico = ['9:00-12:00', '12:00-14:00', '14:00-17:00', '17:00-20:00']
        .map(hour => ({
          hour,
          appointments: contadorHorarios[hour] || 0
        }));

      // Ingresos mensuales
      const ingresosMes = citasCompletadasMes.reduce((total, cita) => {
        const servicio = servicios.find(s => s.nombre === cita.servicio);
        return total + (servicio?.precio || 0);
      }, 0);

      // Tasa de completación
      const completionRate = citasMesActual.length > 0
        ? Math.round((citasCompletadasMes.length / citasMesActual.length) * 100)
        : 0;

      // Trends (comparación con mes anterior)
      const mesAnterior = mesActual - 1;
      const citasMesAnterior = todasCitas.filter(cita => {
        const fechaCita = new Date(cita.fecha);
        return fechaCita.getMonth() === mesAnterior;
      });

      const citasCompletadasMesAnterior = citasMesAnterior.filter(c => c.estado === 'completada');
      const ingresosMesAnterior = citasCompletadasMesAnterior.reduce((total, cita) => {
        const servicio = servicios.find(s => s.nombre === cita.servicio);
        return total + (servicio?.precio || 0);
      }, 0);

      const trendAppointments = citasMesAnterior.length > 0
        ? Math.round(((citasMesActual.length - citasMesAnterior.length) / citasMesAnterior.length) * 100)
        : 0;

      const trendRevenue = ingresosMesAnterior > 0
        ? Math.round(((ingresosMes - ingresosMesAnterior) / ingresosMesAnterior) * 100)
        : 0;

      setAnalytics({
        totalAppointments: todasCitas.length,
        appointmentsThisMonth: citasMesActual.length,
        totalCustomers: clientesUnicos,
        popularServices: serviciosPopulares,
        peakHours: horariosPico,
        monthlyRevenue: ingresosMes,
        completionRate,
        trends: {
          appointments: trendAppointments,
          revenue: trendRevenue
        }
      });

      console.log('✅ [Analytics] Estadísticas calculadas:', {
        totalCitas: todasCitas.length,
        citasMes: citasMesActual.length,
        ingresos: ingresosMes
      });

    } catch (error) {
      console.error('❌ [Analytics] Error al cargar estadísticas:', error);
    } finally {
      // Solo ocultar loading si se estaba mostrando
      if (showLoading) {
        setLoading(false);
        setIsInitialLoad(false);
      }
    }
  };

  return { analytics, loading };
};

// Componente de tarjeta métrica
interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  color: string;
  delay?: number;
}

const MetricCard = ({ title, value, change, icon, color, delay = 0 }: MetricCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    className="bg-card/50 backdrop-blur-md rounded-lg p-6 shadow-sm border border-gold/20"
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
        {change !== undefined && (
          <div className={`flex items-center mt-2 text-sm ${
            change >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            <TrendingUp size={16} className="mr-1" />
            {change >= 0 ? '+' : ''}{change}% vs mes anterior
          </div>
        )}
      </div>
      <div className={`p-3 rounded-full ${color}`}>
        {icon}
      </div>
    </div>
  </motion.div>
);

// Componente principal de Analytics Dashboard
export const AnalyticsDashboard = ({ barberoNombre, rol = 'barbero' }: AnalyticsDashboardProps) => {
  const { analytics, loading } = useAnalytics(barberoNombre, rol);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-muted/30 h-32 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <MetricCard
          title="Total de Citas"
          value={analytics.totalAppointments.toLocaleString()}
          change={analytics.trends.appointments}
          icon={<Calendar className="h-6 w-6 text-white" />}
          color="bg-blue-500"
          delay={0}
        />
        
        <MetricCard
          title="Citas Este Mes"
          value={analytics.appointmentsThisMonth}
          change={analytics.trends.appointments}
          icon={<Clock className="h-6 w-6 text-white" />}
          color="bg-green-500"
          delay={0.1}
        />
        
        <MetricCard
          title="Clientes Únicos"
          value={analytics.totalCustomers}
          icon={<Users className="h-6 w-6 text-white" />}
          color="bg-purple-500"
          delay={0.2}
        />
        
        <MetricCard
          title="Ingresos del Mes"
          value={`$${analytics.monthlyRevenue.toLocaleString()}`}
          change={analytics.trends.revenue}
          icon={<DollarSign className="h-6 w-6 text-white" />}
          color="bg-gold"
          delay={0.3}
        />
        
        <MetricCard
          title="Tasa de Completación"
          value={`${analytics.completionRate}%`}
          icon={<Star className="h-6 w-6 text-white" />}
          color="bg-orange-500"
          delay={0.4}
        />
        
        <MetricCard
          title="Promedio por Cita"
          value={analytics.appointmentsThisMonth > 0 
            ? `$${Math.round(analytics.monthlyRevenue / analytics.appointmentsThisMonth).toLocaleString()}` 
            : '$0'}
          icon={<TrendingUp className="h-6 w-6 text-white" />}
          color="bg-cyan-500"
          delay={0.5}
        />
      </div>

      {/* Servicios Populares */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="bg-card/50 backdrop-blur-md rounded-lg p-6 shadow-sm border border-gold/20"
      >
        <h3 className="text-lg font-semibold mb-4 text-foreground">
          Servicios Más Populares
        </h3>
        <div className="space-y-3">
          {analytics.popularServices.length > 0 ? (
            analytics.popularServices.map((service, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{service.name}</span>
                <div className="flex items-center gap-3">
                  <div className="w-32 bg-muted/30 rounded-full h-2">
                    <div
                      className="bg-gold h-2 rounded-full transition-all"
                      style={{ 
                        width: `${(service.count / Math.max(...analytics.popularServices.map(s => s.count))) * 100}%` 
                      }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-foreground w-8 text-right">
                    {service.count}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No hay datos de servicios disponibles
            </p>
          )}
        </div>
      </motion.div>

      {/* Horarios Pico */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.5 }}
        className="bg-card/50 backdrop-blur-md rounded-lg p-6 shadow-sm border border-gold/20"
      >
        <h3 className="text-lg font-semibold mb-4 text-foreground">
          Horarios Pico
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {analytics.peakHours.map((slot, index) => (
            <div key={index} className="text-center">
              <div className="text-2xl font-bold text-gold">
                {slot.appointments}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {slot.hour}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};