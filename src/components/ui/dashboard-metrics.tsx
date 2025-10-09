import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  TrendingUp, 
  Users, 
  Calendar, 
  DollarSign,
  Clock,
  Scissors,
  Star,
  Target
} from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  icon: React.ReactNode;
  className?: string;
}

export const MetricCard = ({ title, value, description, trend, icon, className = '' }: MetricCardProps) => {
  return (
    <Card className={`glass-effect border-gold/20 ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-elegant text-muted-foreground">
          {title}
        </CardTitle>
        <div className="h-4 w-4 text-gold">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-display gradient-gold bg-clip-text text-transparent">
          {value}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground font-elegant mt-1">
            {description}
          </p>
        )}
        {trend && (
          <div className={`flex items-center text-xs font-elegant mt-2 ${
            trend.isPositive ? 'text-green-500' : 'text-red-500'
          }`}>
            <TrendingUp className={`h-3 w-3 mr-1 ${
              trend.isPositive ? '' : 'rotate-180'
            }`} />
            {trend.isPositive ? '+' : ''}{trend.value}% vs mes anterior
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface SimpleChartProps {
  data: Array<{ name: string; value: number; color?: string }>;
  title: string;
}

export const SimpleBarChart = ({ data, title }: SimpleChartProps) => {
  const maxValue = Math.max(...data.map(item => item.value));
  
  return (
    <Card className="glass-effect border-gold/20">
      <CardHeader>
        <CardTitle className="font-display text-lg gradient-gold bg-clip-text text-transparent">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.map((item, index) => (
            <div key={index} className="flex items-center space-x-3">
              <div className="w-20 text-sm font-elegant text-muted-foreground">
                {item.name}
              </div>
              <div className="flex-1 bg-muted rounded-full h-2 relative overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    item.color || 'bg-gradient-to-r from-gold to-yellow-600'
                  }`}
                  style={{ width: `${(item.value / maxValue) * 100}%` }}
                />
              </div>
              <div className="w-12 text-sm font-display text-gold text-right">
                {item.value}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export const RevenueChart = ({ monthlyData }: { monthlyData: Array<{ month: string; revenue: number }> }) => {
  const maxRevenue = Math.max(...monthlyData.map(item => item.revenue));
  
  return (
    <Card className="glass-effect border-gold/20">
      <CardHeader>
        <CardTitle className="font-display text-lg gradient-gold bg-clip-text text-transparent">
          Ingresos Mensuales
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between h-64 space-x-2">
          {monthlyData.map((item, index) => (
            <div key={index} className="flex flex-col items-center flex-1">
              <div
                className="w-full bg-gradient-to-t from-gold to-yellow-600 rounded-t transition-all duration-500 hover:opacity-80"
                style={{ height: `${(item.revenue / maxRevenue) * 200}px` }}
              />
              <div className="text-xs font-elegant text-muted-foreground mt-2 text-center">
                {item.month}
              </div>
              <div className="text-xs font-display text-gold">
                ${item.revenue.toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Datos de ejemplo para el dashboard
export const DASHBOARD_METRICS = {
  totalCitas: 127,
  citasHoy: 8,
  ingresosMes: 45680,
  clientesNuevos: 23,
  promedioEspera: 12,
  satisfaccion: 4.8,
  
  trends: {
    citas: { value: 12, isPositive: true },
    ingresos: { value: 8, isPositive: true },
    clientes: { value: 15, isPositive: true },
    satisfaccion: { value: 2, isPositive: true }
  },
  
  serviciosPopulares: [
    { name: 'Corte Clásico', value: 45, color: 'bg-gradient-to-r from-gold to-yellow-600' },
    { name: 'Afeitado Premium', value: 32, color: 'bg-gradient-to-r from-blue-500 to-blue-700' },
    { name: 'Barba + Corte', value: 28, color: 'bg-gradient-to-r from-green-500 to-green-700' },
    { name: 'Corte Moderno', value: 22, color: 'bg-gradient-to-r from-purple-500 to-purple-700' }
  ],
  
  ingresosMensuales: [
    { month: 'Jun', revenue: 38500 },
    { month: 'Jul', revenue: 42300 },
    { month: 'Ago', revenue: 39800 },
    { month: 'Sep', revenue: 44200 },
    { month: 'Oct', revenue: 45680 }
  ],
  
  horariosPico: [
    { name: '9:00-11:00', value: 35 },
    { name: '11:00-13:00', value: 28 },
    { name: '14:00-16:00', value: 42 },
    { name: '16:00-18:00', value: 38 },
    { name: '18:00-20:00', value: 31 }
  ]
};