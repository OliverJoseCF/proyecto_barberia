import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import PageTransition from '@/components/ui/PageTransition';
import { useCitas } from '@/hooks/use-citas';
import { supabase, type Cita } from '@/lib/supabase';
import { 
  pageHeaderAnimation,
  cardVariants,
  backButtonAnimation,
  glassEffectClasses
} from '@/lib/animations';
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

interface BarberoData {
  nombre: string;
  email: string;
  rol: 'admin' | 'barbero';
}

const CalendarView = () => {
  const navigate = useNavigate();
  const { getCitas, getCitasByBarbero } = useCitas();
  
  const [barberoData, setBarberoData] = useState<BarberoData | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [citas, setCitas] = useState<Cita[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    checkSessionAndLoadCitas();
  }, [currentDate]);

  // Suscripción en tiempo real a cambios en la tabla de citas
  useEffect(() => {
    if (!barberoData) return;

    console.log('🔔 [Calendar] Configurando suscripción en tiempo real');

    // Crear canal de suscripción
    const channel = supabase
      .channel('calendar-citas-changes', {
        config: {
          broadcast: { self: true }
        }
      })
      .on(
        'postgres_changes',
        {
          event: '*', // Escuchar INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'citas'
          // Sin filtro si es admin, con filtro si es barbero
        },
        (payload) => {
          console.log('🔔 [Calendar] Cambio detectado:', payload);
          
          if (payload.eventType === 'INSERT') {
            const nuevaCita = payload.new as Cita;
            console.log('➕ Nueva cita agregada:', nuevaCita);
            
            // Verificar si es cita del barbero (si no es admin)
            if (barberoData.rol === 'barbero' && nuevaCita.barbero !== barberoData.nombre) {
              return; // Ignorar citas de otros barberos
            }
            
            setCitas(prev => [...prev, nuevaCita]);
            toast.success('📅 Nueva cita en el calendario');
          } 
          else if (payload.eventType === 'UPDATE') {
            const citaActualizada = payload.new as Cita;
            console.log('✏️ Cita actualizada:', citaActualizada);
            
            setCitas(prev => 
              prev.map(c => c.id === citaActualizada.id ? citaActualizada : c)
            );
          } 
          else if (payload.eventType === 'DELETE') {
            const citaEliminada = payload.old as Cita;
            console.log('🗑️ Cita eliminada:', citaEliminada);
            
            setCitas(prev => prev.filter(c => c.id !== citaEliminada.id));
          }
        }
      )
      .subscribe((status, err) => {
        if (err) {
          console.error('❌ [Calendar] Error en suscripción:', err);
          toast.error('Error en tiempo real. Recargando...');
          setTimeout(() => {
            if (barberoData) {
              loadCitas(barberoData);
            }
          }, 2000);
          return;
        }
        
        console.log('📡 [Calendar] Estado de suscripción:', status);
        
        if (status === 'SUBSCRIBED') {
          console.log('✅ [Calendar] Suscripción activa correctamente');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ [Calendar] Error en el canal');
          toast.error('Error de conexión en tiempo real');
        } else if (status === 'TIMED_OUT') {
          console.warn('⏱️ [Calendar] Timeout (normal con conexión lenta)');
          // No mostrar toast - puede ser temporal
        } else if (status === 'CLOSED') {
          console.log('🔌 [Calendar] Canal cerrado');
        }
      });

    // Cleanup: desuscribirse cuando el componente se desmonte
    return () => {
      console.log('🔕 [Calendar] Desuscribiendo de cambios en tiempo real');
      supabase.removeChannel(channel);
    };
  }, [barberoData]);

  const checkSessionAndLoadCitas = async () => {
    try {
      // Verificar sesión
      const userDataString = localStorage.getItem('cantabarba_user');
      if (!userDataString) {
        console.log('❌ No hay sesión activa');
        navigate('/admin/login');
        return;
      }

      const userData = JSON.parse(userDataString);
      console.log('✅ Sesión activa:', userData);
      
      setBarberoData({
        nombre: userData.nombre,
        email: userData.email,
        rol: userData.rol || 'barbero'
      });

      // Cargar citas
      await loadCitas(userData);
    } catch (error) {
      console.error('Error al verificar sesión:', error);
      navigate('/admin/login');
    }
  };

  const loadCitas = async (userData: any) => {
    try {
      setLoading(true);
      console.log('📅 Cargando citas del mes...');
      
      let citasData: Cita[] = [];
      
      // Cargar todas las citas según el rol
      if (userData.rol === 'admin') {
        citasData = await getCitas();
        console.log(`✅ Admin - Cargadas ${citasData.length} citas totales`);
      } else {
        citasData = await getCitasByBarbero(userData.nombre);
        console.log(`✅ Barbero - Cargadas ${citasData.length} citas de ${userData.nombre}`);
      }
      
      // Filtrar por mes actual
      const mesActual = currentDate.getMonth();
      const añoActual = currentDate.getFullYear();
      
      const citasDelMes = citasData.filter(cita => {
        const fechaCita = new Date(cita.fecha);
        return fechaCita.getMonth() === mesActual && fechaCita.getFullYear() === añoActual;
      });
      
      console.log(`📊 ${citasDelMes.length} citas en ${currentDate.toLocaleString('es-MX', { month: 'long', year: 'numeric' })}`);
      setCitas(citasDelMes);
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
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
      setIsTransitioning(false);
    }, 150);
  };

  const nextMonth = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
      setIsTransitioning(false);
    }, 150);
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
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-card border-b border-gold/20 sticky top-0 z-50 backdrop-blur-md"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="flex items-center gap-3"
            >
              <Button
                variant="ghost"
                onClick={() => navigate('/admin/dashboard')}
                className="text-gold hover:text-gold/80"
                asChild
              >
                <motion.button whileHover={{ x: -5 }} transition={{ duration: 0.2 }}>
                  <ArrowLeft className="h-5 w-5" />
                </motion.button>
              </Button>
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <Scissors className="h-8 w-8 text-gold" />
              </motion.div>
              <div>
                <h1 className="font-display text-2xl gradient-gold bg-clip-text text-transparent">
                  Calendario
                </h1>
                <p className="font-elegant text-sm text-muted-foreground">
                  {barberoData ? (
                    <span>
                      {barberoData.nombre} - {barberoData.rol === 'admin' ? 'Todas las citas' : 'Mis citas'}
                    </span>
                  ) : (
                    'Vista mensual de citas'
                  )}
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {/* Calendar */}
          <div className="lg:col-span-2">
            <Card className="glass-effect border-gold/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <motion.div
                    key={monthName}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <CardTitle className="font-display text-2xl gradient-gold bg-clip-text text-transparent capitalize">
                      {monthName}
                    </CardTitle>
                  </motion.div>
                  <div className="flex gap-2">
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={previousMonth}
                        disabled={isTransitioning}
                        className="border-gold/20"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={nextMonth}
                        disabled={isTransitioning}
                        className="border-gold/20"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Days of week */}
                <div className="grid grid-cols-7 gap-2 mb-2">
                  {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day, idx) => (
                    <motion.div 
                      key={day}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.02, duration: 0.2 }}
                      className="text-center font-elegant text-sm text-muted-foreground py-2"
                    >
                      {day}
                    </motion.div>
                  ))}
                </div>
                
                {/* Calendar days */}
                <AnimatePresence mode="wait">
                  <motion.div 
                    key={monthName}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                    className="grid grid-cols-7 gap-2"
                  >
                  {days.map((day, index) => {
                    const dayCitas = day.date ? getCitasForDate(day.date) : [];
                    const isSelected = day.date === selectedDate;
                    
                    return (
                      <motion.button
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.01, duration: 0.15 }}
                        whileHover={day.day ? { scale: 1.05, transition: { duration: 0.15 } } : {}}
                        whileTap={day.day ? { scale: 0.95 } : {}}
                        onClick={() => day.date && setSelectedDate(day.date)}
                        disabled={!day.day}
                        className={`
                          aspect-square p-2 rounded-lg border transition-all
                          ${!day.day ? 'invisible' : ''}
                          ${isSelected ? 'border-gold bg-gold/10 shadow-lg shadow-gold/20' : 'border-gold/10 hover:border-gold/30 hover:shadow-md'}
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
                      </motion.button>
                    );
                  })}
                  </motion.div>
                </AnimatePresence>
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
                <AnimatePresence mode="wait">
                  {selectedDateCitas.length > 0 ? (
                    <motion.div 
                      key={selectedDate}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-3"
                    >
                      {selectedDateCitas.map((cita, idx) => (
                        <motion.div
                          key={cita.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05, duration: 0.2 }}
                          whileHover={{ scale: 1.02, x: 3, transition: { duration: 0.15 } }}
                          className="p-3 rounded-lg border border-gold/10 bg-card/50 hover:bg-card/80 hover:border-gold/30 transition-colors cursor-pointer"
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
                          {cita.cliente_nombre}
                        </p>
                        <p className="font-elegant text-xs text-muted-foreground">
                          {cita.servicio} - {cita.barbero}
                        </p>
                      </motion.div>
                    ))}
                    </motion.div>
                  ) : selectedDate ? (
                    <motion.div
                      key="no-citas"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="text-center py-8"
                    >
                    <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                    <p className="font-elegant text-muted-foreground text-sm">
                      No hay citas programadas para este día
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="select-date"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-center py-8"
                  >
                    <CalendarIcon className="h-12 w-12 text-gold mx-auto mb-3 opacity-50" />
                    <p className="font-elegant text-muted-foreground text-sm">
                      Selecciona un día en el calendario para ver sus citas
                    </p>
                  </motion.div>
                )}
                </AnimatePresence>
              </CardContent>
            </Card>

            {/* Legend */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.4 }}
            >
              <Card className="glass-effect border-gold/20 mt-4">
                <CardHeader>
                  <CardTitle className="font-display text-sm">Leyenda</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {[
                    { color: 'bg-green-500', label: 'Confirmada' },
                    { color: 'bg-yellow-500', label: 'Pendiente' },
                    { color: 'bg-blue-500', label: 'Completada' },
                    { color: 'bg-red-500', label: 'Cancelada' }
                  ].map((item, idx) => (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + idx * 0.05, duration: 0.2 }}
                      className="flex items-center gap-2"
                    >
                      <div className={`w-3 h-3 rounded-full ${item.color}`} />
                      <span className="font-elegant text-sm">{item.label}</span>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      </main>
    </PageTransition>
  );
};

export default CalendarView;
