import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, Calendar, Clock, Star, Phone } from 'lucide-react';

// Tipos para analytics
interface AnalyticsData {
  totalAppointments: number;
  appointmentsThisMonth: number;
  averageRating: number;
  totalCustomers: number;
  popularServices: Array<{ name: string; count: number }>;
  peakHours: Array<{ hour: number; appointments: number }>;
  monthlyRevenue: number;
  customerRetention: number;
}

// Hook para obtener datos de analytics
export const useAnalytics = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalAppointments: 0,
    appointmentsThisMonth: 0,
    averageRating: 0,
    totalCustomers: 0,
    popularServices: [],
    peakHours: [],
    monthlyRevenue: 0,
    customerRetention: 0
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular carga de datos (en producción sería una llamada a API)
    const loadAnalytics = () => {
      // Datos simulados basados en el uso real
      const mockData: AnalyticsData = {
        totalAppointments: 1247,
        appointmentsThisMonth: 89,
        averageRating: 4.8,
        totalCustomers: 432,
        popularServices: [
          { name: 'Corte Clásico', count: 156 },
          { name: 'Afeitado Tradicional', count: 98 },
          { name: 'Barba + Corte', count: 87 },
          { name: 'Corte Moderno', count: 65 },
          { name: 'Arreglo de Barba', count: 43 }
        ],
        peakHours: [
          { hour: 9, appointments: 12 },
          { hour: 10, appointments: 18 },
          { hour: 11, appointments: 22 },
          { hour: 12, appointments: 15 },
          { hour: 13, appointments: 8 },
          { hour: 14, appointments: 11 },
          { hour: 15, appointments: 19 },
          { hour: 16, appointments: 25 },
          { hour: 17, appointments: 28 },
          { hour: 18, appointments: 21 },
          { hour: 19, appointments: 16 }
        ],
        monthlyRevenue: 45680,
        customerRetention: 78.5
      };

      setTimeout(() => {
        setAnalytics(mockData);
        setLoading(false);
      }, 1000);
    };

    loadAnalytics();
  }, []);

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
export const AnalyticsDashboard = () => {
  const { analytics, loading } = useAnalytics();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <MetricCard
          title="Total Citas"
          value={analytics.totalAppointments.toLocaleString()}
          change={12.5}
          icon={<Calendar className="h-6 w-6 text-white" />}
          color="bg-blue-500"
          delay={0}
        />
        
        <MetricCard
          title="Citas Este Mes"
          value={analytics.appointmentsThisMonth}
          change={8.2}
          icon={<Clock className="h-6 w-6 text-white" />}
          color="bg-green-500"
          delay={0.1}
        />
      </div>

      {/* Métricas adicionales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MetricCard
          title="Ingresos Mensuales"
          value={`$${analytics.monthlyRevenue.toLocaleString()}`}
          change={22.3}
          icon={<TrendingUp className="h-6 w-6 text-white" />}
          color="bg-emerald-500"
          delay={0.4}
        />
        
        <MetricCard
          title="Retención de Clientes"
          value={`${analytics.customerRetention}%`}
          change={5.8}
          icon={<Phone className="h-6 w-6 text-white" />}
          color="bg-indigo-500"
          delay={0.5}
        />
      </div>

      {/* Servicios más populares */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="bg-card/50 backdrop-blur-md rounded-lg p-6 shadow-sm border border-gold/20"
      >
        <h3 className="text-lg font-semibold text-foreground mb-4">Servicios Más Populares</h3>
        <div className="space-y-3">
          {analytics.popularServices.map((service, index) => (
            <div key={service.name} className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">{service.name}</span>
              <div className="flex items-center gap-2">
                <div className="w-32 bg-muted/30 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(service.count / analytics.popularServices[0].count) * 100}%` }}
                    transition={{ delay: 0.8 + index * 0.1, duration: 0.8 }}
                    className="bg-gold h-2 rounded-full"
                  />
                </div>
                <span className="text-sm text-muted-foreground min-w-[2rem]">{service.count}</span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Horas pico */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="bg-card/50 backdrop-blur-md rounded-lg p-6 shadow-sm border border-gold/20"
      >
        <h3 className="text-lg font-semibold text-foreground mb-4">Horas Pico de Citas</h3>
        <div className="grid grid-cols-6 lg:grid-cols-11 gap-2">
          {analytics.peakHours.map((hourData, index) => (
            <div key={hourData.hour} className="text-center">
              <div className="mb-2">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${(hourData.appointments / Math.max(...analytics.peakHours.map(h => h.appointments))) * 60}px` }}
                  transition={{ delay: 1 + index * 0.05, duration: 0.6 }}
                  className="bg-gradient-to-t from-gold to-yellow-400 rounded-t mx-auto w-6"
                />
              </div>
              <div className="text-xs text-muted-foreground">
                {hourData.hour}:00
              </div>
              <div className="text-xs font-medium text-foreground">
                {hourData.appointments}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Resumen de insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.5 }}
        className="bg-card border border-gold/30 rounded-lg p-6"
      >
        <h3 className="text-lg font-semibold text-gold mb-3">💡 Insights del Negocio</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-foreground">
          <div className="flex items-start gap-2">
            <span className="text-gold font-bold">•</span>
            <span>Las horas de 16:00 a 17:00 son las más demandadas</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-gold font-bold">•</span>
            <span>El "Corte Clásico" sigue siendo el servicio más solicitado</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-gold font-bold">•</span>
            <span>La retención de clientes está por encima del promedio (78.5%)</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-gold font-bold">•</span>
            <span>Los ingresos han crecido un 22% este mes</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};