import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import PageTransition from '@/components/ui/PageTransition';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Scissors, 
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  User
} from 'lucide-react';
import { toast } from 'sonner';

// Datos DEMO para el calendario
const generateDemoCitas = () => {
  const today = new Date();
  const citas = [];
  
  // Generar citas para el mes actual
  for (let i = -5; i < 15; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    
    if (i % 3 === 0) {
      citas.push({
        id: `demo-${i}-1`,
        nombre: 'Cliente Demo',
        telefono: '5512345678',
        fecha: date.toISOString().split('T')[0],
        hora: '10:00',
        servicio: 'Corte Clásico',
        barbero: 'Ángel Ramírez',
        estado: 'confirmada' as const
      });
    }
    if (i % 2 === 0) {
      citas.push({
        id: `demo-${i}-2`,
        nombre: 'Otro Cliente',
        telefono: '5587654321',
        fecha: date.toISOString().split('T')[0],
        hora: '14:00',
        servicio: 'Corte + Barba',
        barbero: 'Emiliano Vega',
        estado: 'pendiente' as const
      });
    }
  }
  
  return citas;
};

interface Cita {
  id: string;
  nombre: string;
  telefono: string;
  fecha: string;
  hora: string;
  servicio: string;
  barbero: string;
  estado: 'pendiente' | 'confirmada' | 'cancelada' | 'completada';
}

interface BarberoData {
  nombre: string;
  email: string;
  rol: 'admin' | 'barbero';
}

const CalendarView = () => {
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(window.location.search);
  const demoMode = searchParams.get('demo') === 'true';
  const demoRole = (searchParams.get('role') as 'admin' | 'barbero') || 'admin';
  
  const [barberoData, setBarberoData] = useState<BarberoData | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [citas, setCitas] = useState<Cita[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (demoMode) {
      // Configurar datos según el rol
      if (demoRole === 'admin') {
        setBarberoData({ 
          nombre: 'Ángel Ramírez', 
          email: 'angel@cantabarba.com', 
          rol: 'admin' 
        });
        // Admin ve TODAS las citas
        setCitas(generateDemoCitas());
      } else {
        setBarberoData({ 
          nombre: 'Emiliano Vega', 
          email: 'emiliano@cantabarba.com', 
          rol: 'barbero' 
        });
        // Barbero solo ve SUS citas
        const todasCitas = generateDemoCitas();
        const citasEmiliano = todasCitas.filter(c => c.barbero === 'Emiliano Vega');
        setCitas(citasEmiliano);
      }
      setLoading(false);
    } else {
      // TODO: Cargar citas reales
      navigate('/admin/login');
    }
  }, [demoMode, demoRole, currentDate]);

  const loadCitas = async () => {
    try {
      // TODO: Cargar citas desde tu base de datos
      console.log('Cargar citas del mes');
      setLoading(false);
    } catch (error: any) {
      toast.error('Error al cargar las citas del mes');
      setLoading(false);
    }
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Días del mes anterior
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push({ day: null, date: null });
    }
    
    // Días del mes actual
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      days.push({ 
        day, 
        date: date.toISOString().split('T')[0],
        isToday: date.toDateString() === new Date().toDateString()
      });
    }
    
    return days;
  };

  const getCitasForDate = (date: string | null) => {
    if (!date) return [];
    return citas.filter(cita => cita.fecha === date);
  };

  const getEstadoBadge = (estado: Cita['estado']) => {
    const badges = {
      pendiente: 'bg-yellow-500',
      confirmada: 'bg-green-500',
      cancelada: 'bg-red-500',
      completada: 'bg-blue-500',
    };
    return badges[estado] || badges.pendiente;
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const monthName = currentDate.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });
  const days = getDaysInMonth();
  const selectedDateCitas = selectedDate ? getCitasForDate(selectedDate) : [];

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
              <Button
                variant="ghost"
                onClick={() => navigate(demoMode ? `/admin/dashboard?demo=true&role=${demoRole}` : '/admin/dashboard')}
                className="text-gold hover:text-gold/80"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <Scissors className="h-8 w-8 text-gold" />
              <div>
                <h1 className="font-display text-2xl gradient-gold bg-clip-text text-transparent">
                  Calendario {demoMode && '✨'}
                </h1>
                <p className="font-elegant text-sm text-muted-foreground">
                  {demoMode ? (
                    <span className="text-gold font-semibold">
                      🎭 MODO DEMO - {barberoData?.nombre} ({barberoData?.rol === 'admin' ? 'Fundador/Admin' : 'Barbero'})
                    </span>
                  ) : barberoData ? (
                    <span>
                      {barberoData.nombre} - {barberoData.rol === 'admin' ? 'Todas las citas' : 'Mis citas'}
                    </span>
                  ) : (
                    'Vista mensual de citas'
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <Card className="glass-effect border-gold/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="font-display text-2xl gradient-gold bg-clip-text text-transparent capitalize">
                    {monthName}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={previousMonth}
                      className="border-gold/20"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={nextMonth}
                      className="border-gold/20"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Days of week */}
                <div className="grid grid-cols-7 gap-2 mb-2">
                  {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
                    <div key={day} className="text-center font-elegant text-sm text-muted-foreground py-2">
                      {day}
                    </div>
                  ))}
                </div>
                
                {/* Calendar days */}
                <div className="grid grid-cols-7 gap-2">
                  {days.map((day, index) => {
                    const dayCitas = day.date ? getCitasForDate(day.date) : [];
                    const isSelected = day.date === selectedDate;
                    
                    return (
                      <button
                        key={index}
                        onClick={() => day.date && setSelectedDate(day.date)}
                        disabled={!day.day}
                        className={`
                          aspect-square p-2 rounded-lg border transition-all
                          ${!day.day ? 'invisible' : ''}
                          ${isSelected ? 'border-gold bg-gold/10' : 'border-gold/10 hover:border-gold/30'}
                          ${day.isToday ? 'ring-2 ring-gold/50' : ''}
                          ${dayCitas.length > 0 ? 'bg-card/50' : 'bg-background'}
                        `}
                      >
                        <div className="flex flex-col h-full">
                          <span className={`font-display text-sm ${day.isToday ? 'text-gold font-bold' : ''}`}>
                            {day.day}
                          </span>
                          {dayCitas.length > 0 && (
                            <div className="mt-1 flex flex-wrap gap-1">
                              {dayCitas.slice(0, 3).map((cita, i) => (
                                <div
                                  key={i}
                                  className={`w-1.5 h-1.5 rounded-full ${getEstadoBadge(cita.estado)}`}
                                />
                              ))}
                              {dayCitas.length > 3 && (
                                <span className="text-[10px] text-muted-foreground">+{dayCitas.length - 3}</span>
                              )}
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Selected Date Details */}
          <div>
            <Card className="glass-effect border-gold/20">
              <CardHeader>
                <CardTitle className="font-display text-xl gradient-gold bg-clip-text text-transparent">
                  {selectedDate ? (
                    new Date(selectedDate + 'T00:00:00').toLocaleDateString('es-MX', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })
                  ) : (
                    'Selecciona una fecha'
                  )}
                </CardTitle>
                <CardDescription className="font-elegant">
                  {selectedDateCitas.length > 0 ? (
                    `${selectedDateCitas.length} cita${selectedDateCitas.length !== 1 ? 's' : ''}`
                  ) : (
                    selectedDate ? 'Sin citas' : 'Haz clic en un día del calendario'
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedDateCitas.length > 0 ? (
                  <div className="space-y-3">
                    {selectedDateCitas.map((cita) => (
                      <div
                        key={cita.id}
                        className="p-3 rounded-lg border border-gold/10 bg-card/50"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-display text-gold flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            {cita.hora}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-elegant text-white ${getEstadoBadge(cita.estado)}`}>
                            {cita.estado}
                          </span>
                        </div>
                        <p className="font-elegant text-sm flex items-center gap-2 mb-1">
                          <User className="h-3 w-3 text-muted-foreground" />
                          {cita.nombre}
                        </p>
                        <p className="font-elegant text-xs text-muted-foreground">
                          {cita.servicio} - {cita.barbero}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : selectedDate ? (
                  <div className="text-center py-8">
                    <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                    <p className="font-elegant text-muted-foreground text-sm">
                      No hay citas programadas para este día
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CalendarIcon className="h-12 w-12 text-gold mx-auto mb-3 opacity-50" />
                    <p className="font-elegant text-muted-foreground text-sm">
                      Selecciona un día en el calendario para ver sus citas
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Legend */}
            <Card className="glass-effect border-gold/20 mt-4">
              <CardHeader>
                <CardTitle className="font-display text-sm">Leyenda</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="font-elegant text-sm">Confirmada</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <span className="font-elegant text-sm">Pendiente</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span className="font-elegant text-sm">Completada</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <span className="font-elegant text-sm">Cancelada</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </PageTransition>
  );
};

export default CalendarView;
