import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import PageTransition from '@/components/ui/PageTransition';
import { 
  MetricCard, 
  SimpleBarChart, 
  RevenueChart, 
  DASHBOARD_METRICS 
} from '@/components/ui/dashboard-metrics';
import { EstadisticasRecordatorios } from '@/components/ui/estadisticas-recordatorios';
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
  Star
} from 'lucide-react';
import { toast } from 'sonner';
import logoImage from '@/assets/logo.png';

// DATOS DE DEMO para previsualización
const DEMO_CITAS = [
  {
    id: '1',
    nombre: 'Carlos Méndez',
    telefono: '5512345678',
    fecha: new Date().toISOString().split('T')[0],
    hora: '10:00',
    servicio: 'Corte de Cabello (Hombre)',
    barbero: 'Ángel Ramírez',
    estado: 'pendiente' as const,
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    nombre: 'Roberto García',
    telefono: '5598765432',
    fecha: new Date().toISOString().split('T')[0],
    hora: '11:30',
    servicio: 'Arreglo de Barba',
    barbero: 'Emiliano Vega',
    estado: 'confirmada' as const,
    created_at: new Date().toISOString()
  },
  {
    id: '3',
    nombre: 'Luis Torres',
    telefono: '5587654321',
    fecha: new Date().toISOString().split('T')[0],
    hora: '14:00',
    servicio: 'Afeitado Clásico',
    barbero: 'Ángel Ramírez',
    estado: 'pendiente' as const,
    created_at: new Date().toISOString()
  },
  {
    id: '4',
    nombre: 'Miguel Ángel Sánchez',
    telefono: '5534567890',
    fecha: new Date().toISOString().split('T')[0],
    hora: '16:30',
    servicio: 'Diseños Capilares',
    barbero: 'Emiliano Vega',
    estado: 'cancelada' as const,
    created_at: new Date().toISOString()
  },
  {
    id: '5',
    nombre: 'Fernando López',
    telefono: '5523456789',
    fecha: new Date().toISOString().split('T')[0],
    hora: '18:00',
    servicio: 'Tintes',
    barbero: 'Ángel Ramírez',
    estado: 'confirmada' as const,
    created_at: new Date().toISOString()
  }
];

interface Cita {
  id: string;
  nombre: string;
  telefono: string;
  fecha: string;
  hora: string;
  servicio: string;
  barbero: string;
  estado: 'pendiente' | 'confirmada' | 'cancelada' | 'completada';
  created_at: string;
}

interface EstadisticasDelDia {
  total: number;
  confirmadas: number;
  pendientes: number;
  canceladas: number;
}

interface BarberoData {
  nombre: string;
  email: string;
  rol: 'admin' | 'barbero';
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [barberoData, setBarberoData] = useState<BarberoData | null>(null);
  const [citas, setCitas] = useState<Cita[]>(DEMO_CITAS);
  const [loading, setLoading] = useState(false);
  
  // Detectar si está en modo demo desde la URL
  const searchParams = new URLSearchParams(window.location.search);
  const [demoMode, setDemoMode] = useState(searchParams.get('demo') === 'true');
  const [demoRole, setDemoRole] = useState<'admin' | 'barbero'>(
    (searchParams.get('role') as 'admin' | 'barbero') || 'admin'
  );
  
  const [stats, setStats] = useState<EstadisticasDelDia>({
    total: 0,
    confirmadas: 0,
    pendientes: 0,
    canceladas: 0,
  });

  useEffect(() => {
    if (demoMode) {
      // Configurar usuario demo según el rol
      if (demoRole === 'admin') {
        setUser({ email: 'angel@cantabarba.com' });
        setBarberoData({ 
          nombre: 'Ángel Ramírez', 
          email: 'angel@cantabarba.com', 
          rol: 'admin' 
        });
        // Admin ve TODAS las citas
        setCitas(DEMO_CITAS);
        calcularEstadisticas(DEMO_CITAS);
      } else {
        setUser({ email: 'emiliano@cantabarba.com' });
        setBarberoData({ 
          nombre: 'Emiliano Vega', 
          email: 'emiliano@cantabarba.com', 
          rol: 'barbero' 
        });
        // Barbero solo ve SUS citas
        const citasEmiliano = DEMO_CITAS.filter(c => c.barbero === 'Emiliano Vega');
        setCitas(citasEmiliano);
        calcularEstadisticas(citasEmiliano);
      }
      setLoading(false);
    } else {
      // TODO: Integrar con tu base de datos cuando esté lista
      // checkUser();
      // loadCitasHoy();
      navigate('/admin/login');
    }
  }, [demoMode, demoRole]);

  const loadCitasHoy = async () => {
    try {
      setLoading(true);
      // TODO: Cargar citas reales desde tu base de datos
      console.log('Cargar citas desde base de datos');
      setLoading(false);
    } catch (error: any) {
      toast.error('No se pudieron cargar las citas');
      setLoading(false);
    }
  };

  const calcularEstadisticas = (citas: Cita[]) => {
    const stats = {
      total: citas.length,
      confirmadas: citas.filter(c => c.estado === 'confirmada').length,
      pendientes: citas.filter(c => c.estado === 'pendiente').length,
      canceladas: citas.filter(c => c.estado === 'cancelada').length,
    };
    setStats(stats);
  };

  const handleLogout = async () => {
    toast.success('Sesión cerrada');
    navigate('/admin/login');
  };

  const actualizarEstado = async (citaId: string, nuevoEstado: Cita['estado']) => {
    if (demoMode) {
      // Actualizar solo en el estado local para DEMO
      setCitas(prevCitas => {
        const nuevasCitas = prevCitas.map(cita => 
          cita.id === citaId ? { ...cita, estado: nuevoEstado } : cita
        );
        calcularEstadisticas(nuevasCitas);
        return nuevasCitas;
      });
      toast.success(`Cita ${nuevoEstado} exitosamente (DEMO)`);
      return;
    }

    try {
      // TODO: Actualizar en tu base de datos
      console.log('Actualizar cita:', citaId, nuevoEstado);
      toast.success(`Cita ${nuevoEstado} exitosamente`);
      loadCitasHoy();
    } catch (error: any) {
      toast.error('Error al actualizar la cita');
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
                  Panel de Administración {demoMode && '✨'}
                </h1>
                <p className="font-elegant text-sm text-muted-foreground">
                  {demoMode ? (
                    <span className="text-gold font-semibold">
                      🎭 MODO DEMO - {barberoData?.nombre} ({barberoData?.rol === 'admin' ? 'Fundador/Admin' : 'Barbero'})
                    </span>
                  ) : barberoData ? (
                    <span>
                      Bienvenido, <span className="text-gold">{barberoData.nombre}</span> 
                      {barberoData.rol === 'admin' && <span className="text-gold"> (Admin)</span>}
                    </span>
                  ) : (
                    `Bienvenido, ${user?.email}`
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
                {stats.total}
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
                Listas para atender
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
                Por confirmar
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
                No disponibles
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Métricas Avanzadas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <MetricCard
            title="Citas del Mes"
            value={DASHBOARD_METRICS.totalCitas}
            description={`${DASHBOARD_METRICS.citasHoy} citas hoy`}
            trend={DASHBOARD_METRICS.trends.citas}
            icon={<Calendar className="h-4 w-4" />}
          />
          
          <MetricCard
            title="Ingresos del Mes"
            value={`$${DASHBOARD_METRICS.ingresosMes.toLocaleString()}`}
            description="MXN brutos"
            trend={DASHBOARD_METRICS.trends.ingresos}
            icon={<DollarSign className="h-4 w-4" />}
          />

          <MetricCard
            title="Tasa de Completación"
            value="92%"
            description="Citas finalizadas exitosamente"
            trend={{ value: 5, isPositive: true }}
            icon={<CheckCircle className="h-4 w-4" />}
          />
        </div>

        {/* Gráficos y Análisis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <RevenueChart monthlyData={DASHBOARD_METRICS.ingresosMensuales} />
          
          <SimpleBarChart
            data={DASHBOARD_METRICS.serviciosPopulares}
            title="Servicios Más Populares"
          />
        </div>

        {/* Sistema de Recordatorios */}
        <div className="mb-8">
          <EstadisticasRecordatorios />
        </div>

        {/* Horarios Pico */}
        <div className="mb-8">
          <SimpleBarChart
            data={DASHBOARD_METRICS.horariosPico}
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
                      <p className="font-display text-gold truncate">{cita.nombre}</p>
                      <p className="font-elegant text-xs text-muted-foreground">{cita.telefono}</p>
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
            onClick={() => navigate(demoMode ? `/admin/citas?demo=true&role=${demoRole}` : '/admin/citas')}
          >
            <Calendar className="h-6 w-6 mr-3 text-gold" />
            Ver Todas las Citas
          </Button>
          <Button
            variant="outline"
            className="h-24 border-gold/50 hover:bg-gold/10 font-elegant text-lg"
            onClick={() => navigate(demoMode ? `/admin/calendario?demo=true&role=${demoRole}` : '/admin/calendario')}
          >
            <Clock className="h-6 w-6 mr-3 text-gold" />
            Calendario
          </Button>
          <Button
            variant="outline"
            className="h-24 border-gold/50 hover:bg-gold/10 font-elegant text-lg"
            onClick={() => navigate(demoMode ? `/admin/estadisticas?demo=true&role=${demoRole}` : '/admin/estadisticas')}
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
