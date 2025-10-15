import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PageTransition from '@/components/ui/PageTransition';
import { AppointmentCardSkeleton } from '@/components/ui/loading-skeletons';
import ReprogramacionCita from '@/components/ReprogramacionCita';
import { useCitas } from '@/hooks/use-citas';
import { supabase, type Cita } from '@/lib/supabase';
import { 
  pageHeaderAnimation,
  cardVariants,
  backButtonAnimation,
  buttonHoverAnimation,
  buttonTapAnimation,
  glassEffectClasses
} from '@/lib/animations';
import { 
  Calendar, 
  Clock, 
  Scissors, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  ArrowLeft,
  Search,
  Filter,
  User,
  Phone,
  Edit3,
  MoreVertical,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';

// Datos de DEMO extendidos
const DEMO_ALL_CITAS = [
  {
    id: '1',
    nombre: 'Juan Pérez González',
    telefono: '5512345678',
    fecha: new Date().toISOString().split('T')[0],
    hora: '10:00',
    servicio: 'Corte Clásico',
    barbero: 'Ángel Ramírez',
    estado: 'pendiente' as const,
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    nombre: 'María García López',
    telefono: '5587654321',
    fecha: new Date().toISOString().split('T')[0],
    hora: '11:30',
    servicio: 'Afeitado Premium',
    barbero: 'Emiliano Vega',
    estado: 'confirmada' as const,
    created_at: new Date().toISOString()
  },
  {
    id: '3',
    nombre: 'Carlos López Martínez',
    telefono: '5598765432',
    fecha: new Date().toISOString().split('T')[0],
    hora: '14:00',
    servicio: 'Corte + Barba',
    barbero: 'Ángel Ramírez',
    estado: 'pendiente' as const,
    created_at: new Date().toISOString()
  },
  {
    id: '4',
    nombre: 'Roberto Martínez Sánchez',
    telefono: '5534567890',
    fecha: new Date().toISOString().split('T')[0],
    hora: '16:30',
    servicio: 'Delineado',
    barbero: 'Emiliano Vega',
    estado: 'cancelada' as const,
    created_at: new Date().toISOString()
  },
  {
    id: '5',
    nombre: 'Fernando López Ruiz',
    telefono: '5523456789',
    fecha: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Mañana
    hora: '09:00',
    servicio: 'Corte Fade',
    barbero: 'Ángel Ramírez',
    estado: 'confirmada' as const,
    created_at: new Date().toISOString()
  },
  {
    id: '6',
    nombre: 'Andrea Sánchez Torres',
    telefono: '5556789012',
    fecha: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    hora: '12:00',
    servicio: 'Tintes',
    barbero: 'Emiliano Vega',
    estado: 'pendiente' as const,
    created_at: new Date().toISOString()
  },
  {
    id: '7',
    nombre: 'Diego Ramírez Castro',
    telefono: '5567890123',
    fecha: new Date(Date.now() + 172800000).toISOString().split('T')[0], // Pasado mañana
    hora: '15:00',
    servicio: 'Diseños Capilares',
    barbero: 'Ángel Ramírez',
    estado: 'confirmada' as const,
    created_at: new Date().toISOString()
  },
  {
    id: '8',
    nombre: 'Sofía Hernández Vega',
    telefono: '5578901234',
    fecha: new Date(Date.now() - 86400000).toISOString().split('T')[0], // Ayer
    hora: '11:00',
    servicio: 'Corte Clásico',
    barbero: 'Emiliano Vega',
    estado: 'completada' as const,
    created_at: new Date().toISOString()
  }
];

interface BarberoData {
  nombre: string;
  email: string;
  rol: 'admin' | 'barbero';
}

const AllAppointments = () => {
  const navigate = useNavigate();
  const { getCitas, getCitasByBarbero, updateCita, deleteCita } = useCitas();
  
  const [barberoData, setBarberoData] = useState<BarberoData | null>(null);
  
  const [citas, setCitas] = useState<Cita[]>([]);
  const [filteredCitas, setFilteredCitas] = useState<Cita[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState<string>('todas');
  const [filterFecha, setFilterFecha] = useState<string>('');
  const [citaParaReprogramar, setCitaParaReprogramar] = useState<Cita | null>(null);

  useEffect(() => {
    checkSessionAndLoadCitas();
  }, []);

  // Suscripción en tiempo real a cambios en la tabla de citas
  useEffect(() => {
    if (!barberoData) {
      console.log('⏳ [AllAppointments] Esperando datos del barbero...');
      return;
    }

    console.log('🔔 [AllAppointments] Configurando suscripción en tiempo real para:', barberoData.nombre, 'Rol:', barberoData.rol);

    // Crear canal de suscripción
    const channel = supabase
      .channel('all-citas-changes', {
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
          // Sin filtro - escuchamos todas las citas
        },
        (payload) => {
          console.log('🔔 [AllAppointments] Cambio detectado:', payload.eventType, payload);
          
          if (payload.eventType === 'INSERT') {
            const nuevaCita = payload.new as Cita;
            console.log('➕ Nueva cita agregada:', nuevaCita);
            
            // Verificar si es cita del barbero (si no es admin)
            if (barberoData.rol === 'barbero' && nuevaCita.barbero !== barberoData.nombre) {
              console.log('⏭️ Ignorando cita de otro barbero:', nuevaCita.barbero);
              return; // Ignorar citas de otros barberos
            }
            
            console.log('✅ Agregando nueva cita a la lista');
            setCitas(prev => {
              // Evitar duplicados
              if (prev.some(c => c.id === nuevaCita.id)) {
                console.log('⚠️ Cita ya existe en la lista');
                return prev;
              }
              return [...prev, nuevaCita];
            });
            
            // Notificación mejorada con más detalles
            toast.success(`📅 Nueva cita: ${nuevaCita.cliente_nombre}`, {
              description: `${nuevaCita.fecha} • ${nuevaCita.hora} • ${nuevaCita.servicio}`,
              duration: 5000,
            });
          } 
          else if (payload.eventType === 'UPDATE') {
            const citaActualizada = payload.new as Cita;
            const citaAnterior = payload.old as Cita;
            console.log('✏️ Cita actualizada:', citaActualizada);
            
            // Verificar si es cita del barbero (si no es admin)
            if (barberoData.rol === 'barbero' && citaActualizada.barbero !== barberoData.nombre) {
              console.log('⏭️ Ignorando actualización de otro barbero');
              return;
            }
            
            setCitas(prev => 
              prev.map(c => c.id === citaActualizada.id ? citaActualizada : c)
            );
            
            // Notificación mejorada según el cambio
            if (citaAnterior.estado !== citaActualizada.estado) {
              toast.info(`✏️ Estado actualizado: ${citaActualizada.cliente_nombre}`, {
                description: `${citaAnterior.estado} → ${citaActualizada.estado}`,
                duration: 4000,
              });
            } else if (citaAnterior.fecha !== citaActualizada.fecha || citaAnterior.hora !== citaActualizada.hora) {
              toast.info(`📆 Cita reprogramada: ${citaActualizada.cliente_nombre}`, {
                description: `Nueva fecha: ${citaActualizada.fecha} a las ${citaActualizada.hora}`,
                duration: 4000,
              });
            }
          } 
          else if (payload.eventType === 'DELETE') {
            const citaEliminada = payload.old as Cita;
            console.log('🗑️ Cita eliminada:', citaEliminada);
            
            setCitas(prev => prev.filter(c => c.id !== citaEliminada.id));
            
            // Notificación de eliminación
            toast.error(`🗑️ Cita eliminada: ${citaEliminada.cliente_nombre}`, {
              description: `${citaEliminada.fecha} a las ${citaEliminada.hora}`,
              duration: 4000,
            });
          }
        }
      )
      .subscribe((status, err) => {
        if (err) {
          console.error('❌ [AllAppointments] Error en suscripción:', err);
          toast.error('Error en tiempo real. Recargando...');
          setTimeout(() => {
            checkSessionAndLoadCitas();
          }, 2000);
          return;
        }
        
        console.log('📡 [AllAppointments] Estado de suscripción:', status);
        
        if (status === 'SUBSCRIBED') {
          console.log('✅ [AllAppointments] Suscripción activa correctamente');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ [AllAppointments] Error en el canal');
          toast.error('Error de conexión en tiempo real');
        } else if (status === 'TIMED_OUT') {
          console.warn('⏱️ [AllAppointments] Timeout (normal con conexión lenta)');
          // No mostrar toast - puede ser temporal
        } else if (status === 'CLOSED') {
          console.log('🔌 [AllAppointments] Canal cerrado');
        }
      });

    // Cleanup: desuscribirse cuando el componente se desmonte
    return () => {
      console.log('🔕 [AllAppointments] Desuscribiendo de cambios en tiempo real');
      supabase.removeChannel(channel);
    };
  }, [barberoData]);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, filterEstado, filterFecha, citas]);

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

      // Cargar citas según el rol
      await loadAllCitas(userData);
    } catch (error) {
      console.error('Error al verificar sesión:', error);
      navigate('/admin/login');
    }
  };

  const loadAllCitas = async (userData: any) => {
    try {
      setLoading(true);
      console.log('📋 Cargando todas las citas...');
      
      let citasData: Cita[] = [];
      
      // Si es admin, cargar TODAS las citas. Si es barbero, solo las suyas
      if (userData.rol === 'admin') {
        citasData = await getCitas();
        console.log(`✅ Admin - Cargadas ${citasData.length} citas totales`);
      } else {
        citasData = await getCitasByBarbero(userData.nombre);
        console.log(`✅ Barbero - Cargadas ${citasData.length} citas de ${userData.nombre}`);
      }
      
      setCitas(citasData);
      setFilteredCitas(citasData);
      setLoading(false);
    } catch (error: any) {
      toast.error('Error al cargar las citas');
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...citas];

    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(cita => 
        cita.cliente_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cita.cliente_telefono.includes(searchTerm) ||
        cita.servicio.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cita.barbero.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por estado
    if (filterEstado !== 'todas') {
      filtered = filtered.filter(cita => cita.estado === filterEstado);
    }

    // Filtrar por fecha
    if (filterFecha) {
      filtered = filtered.filter(cita => cita.fecha === filterFecha);
    }

    setFilteredCitas(filtered);
  };

  const actualizarEstado = async (citaId: string, nuevoEstado: Cita['estado']) => {
    try {
      console.log(`📝 [AllAppointments] Actualizando cita ${citaId} a estado: ${nuevoEstado}`);
      
      const { error } = await updateCita(citaId, { estado: nuevoEstado });
      
      if (error) {
        throw new Error(error);
      }

      console.log(`✅ [AllAppointments] Cita actualizada exitosamente`);

      // Actualizar lista local
      setCitas(prev => prev.map(c => 
        c.id === citaId ? { ...c, estado: nuevoEstado } : c
      ));
      
      // Mensajes personalizados
      const mensajes = {
        confirmada: '✅ Cita confirmada exitosamente',
        cancelada: '❌ Cita cancelada',
        completada: '✔️ Cita marcada como completada',
        pendiente: '⏳ Cita marcada como pendiente'
      };
      
      toast.success(mensajes[nuevoEstado] || 'Cita actualizada');
    } catch (error: any) {
      console.error('❌ [AllAppointments] Error al actualizar estado:', error);
      toast.error('Error al actualizar la cita');
    }
  };

  const eliminarCita = async (citaId: string) => {
    try {
      console.log(`🗑️ [AllAppointments] Eliminando cita ${citaId}`);
      
      const { error } = await deleteCita(citaId);

      if (error) {
        throw new Error(error);
      }

      console.log(`✅ [AllAppointments] Cita eliminada exitosamente`);
      
      // Actualizar lista local
      setCitas(prev => prev.filter(c => c.id !== citaId));

      toast.success('🗑️ Cita eliminada correctamente');
    } catch (error: any) {
      console.error('❌ [AllAppointments] Error al eliminar:', error);
      toast.error('Error al eliminar la cita');
    }
  };

  const handleReprogramarCita = async (nuevaFecha: string, nuevaHora: string) => {
    if (!citaParaReprogramar) return;

    try {
      console.log(`📅 [AllAppointments] Reprogramando cita ${citaParaReprogramar.id} a ${nuevaFecha} ${nuevaHora}`);
      
      const { error } = await updateCita(citaParaReprogramar.id, { 
        fecha: nuevaFecha, 
        hora: nuevaHora 
      });
      
      if (error) {
        throw new Error(error);
      }

      console.log(`✅ [AllAppointments] Cita reprogramada exitosamente`);

      // Actualizar lista local
      setCitas(prev => prev.map(c => 
        c.id === citaParaReprogramar.id 
          ? { ...c, fecha: nuevaFecha, hora: nuevaHora } 
          : c
      ));
      
      toast.success(`📅 Cita reprogramada para el ${new Date(nuevaFecha).toLocaleDateString('es-MX')} a las ${nuevaHora}`);
      setCitaParaReprogramar(null);
    } catch (error: any) {
      console.error('❌ [AllAppointments] Error al reprogramar:', error);
      toast.error('Error al reprogramar la cita');
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

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    today.setHours(0, 0, 0, 0);
    tomorrow.setHours(0, 0, 0, 0);
    yesterday.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);

    if (date.getTime() === today.getTime()) return 'Hoy';
    if (date.getTime() === tomorrow.getTime()) return 'Mañana';
    if (date.getTime() === yesterday.getTime()) return 'Ayer';

    return date.toLocaleDateString('es-MX', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header Skeleton */}
        <header className="bg-card border-b border-gold/20 sticky top-0 z-50 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 bg-gold rounded animate-pulse" />
                <div className="h-8 w-8 bg-gold rounded animate-pulse" />
                <div>
                  <div className="h-6 w-40 bg-muted rounded animate-pulse mb-2" />
                  <div className="h-4 w-60 bg-muted rounded animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Skeleton */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Filters Skeleton */}
          <Card className="glass-effect border-gold/20 mb-6">
            <CardHeader>
              <div className="h-6 w-48 bg-muted rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="h-10 bg-muted rounded animate-pulse" />
                  <div className="h-10 bg-muted rounded animate-pulse" />
                </div>
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-8 w-24 bg-muted rounded animate-pulse" />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Appointments Skeleton */}
          <Card className="glass-effect border-gold/20">
            <CardContent className="p-6">
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <AppointmentCardSkeleton key={i} />
                ))}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-card border-b border-gold/20 sticky top-0 z-50 backdrop-blur-md"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.3 }}
                className="flex items-center gap-3"
              >
                <motion.div {...backButtonAnimation}>
                  <Button
                    variant="ghost"
                    onClick={() => navigate('/admin/dashboard')}
                    className="text-gold hover:text-gold/80"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                </motion.div>
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Scissors className="h-8 w-8 text-gold" />
                </motion.div>
                <div>
                  <h1 className="font-display text-2xl gradient-gold bg-clip-text text-transparent">
                    Todas las Citas
                  </h1>
                  <p className="font-elegant text-sm text-muted-foreground">
                    {barberoData ? (
                      <span>
                        {barberoData.nombre} - {barberoData.rol === 'admin' ? 'Todas las citas' : 'Mis citas'}
                      </span>
                    ) : (
                      'Gestión completa de citas'
                    )}
                  </p>
                </div>
              </motion.div>
          </div>
        </div>
        </motion.header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <Card className="glass-effect border-gold/20 mb-6">
          <CardHeader>
            <CardTitle className="font-display text-xl gradient-gold bg-clip-text text-transparent">
              Filtros y Búsqueda
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Búsqueda y filtro por fecha */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nombre, teléfono, servicio o barbero..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 font-elegant bg-background border-gold/20"
                  />
                </div>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="date"
                    placeholder="Filtrar por fecha..."
                    value={filterFecha}
                    onChange={(e) => setFilterFecha(e.target.value)}
                    className="pl-10 font-elegant bg-background border-gold/20"
                  />
                  {filterFecha && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setFilterFecha('')}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                    >
                      ×
                    </Button>
                  )}
                </div>
              </div>
              
              {/* Filtros por estado */}
              <div className="flex flex-wrap gap-2">
                {[
                  { estado: 'todas', label: 'Todas', className: 'gradient-gold', count: citas.length },
                  { estado: 'pendiente', label: 'Pendientes', className: 'bg-yellow-500 hover:bg-yellow-600', count: citas.filter(c => c.estado === 'pendiente').length },
                  { estado: 'confirmada', label: 'Confirmadas', className: 'bg-green-500 hover:bg-green-600', count: citas.filter(c => c.estado === 'confirmada').length },
                  { estado: 'completada', label: 'Completadas', className: 'bg-blue-500 hover:bg-blue-600', count: citas.filter(c => c.estado === 'completada').length },
                  { estado: 'cancelada', label: 'Canceladas', className: 'bg-red-500 hover:bg-red-600', count: citas.filter(c => c.estado === 'cancelada').length }
                ].map((filter, idx) => (
                  <motion.div
                    key={filter.estado}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 + idx * 0.05, duration: 0.2 }}
                    whileHover={{ scale: 1.05, transition: { duration: 0.15 } }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant={filterEstado === filter.estado ? 'default' : 'outline'}
                      onClick={() => setFilterEstado(filter.estado)}
                      className={filterEstado === filter.estado ? filter.className : 'border-gold/20'}
                    >
                      {filter.label} ({filter.count})
                    </Button>
                  </motion.div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
        </motion.div>

        {/* Results */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <Card className="glass-effect border-gold/20">
          <CardHeader>
            <CardTitle className="font-display text-2xl gradient-gold bg-clip-text text-transparent">
              Resultados: {filteredCitas.length} citas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredCitas.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="font-elegant text-muted-foreground">
                  No se encontraron citas con los filtros seleccionados
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                  {filteredCitas.map((cita, index) => (
                    <motion.div
                      key={cita.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, x: -100 }}
                      transition={{ 
                        delay: Math.min(index * 0.03, 0.3),
                        duration: 0.3,
                        layout: { duration: 0.2 }
                      }}
                      whileHover={{ 
                        scale: 1.01, 
                        x: 5,
                        boxShadow: "0 4px 20px rgba(212, 175, 55, 0.15)",
                        transition: { duration: 0.15 }
                      }}
                      className="grid grid-cols-12 gap-2 items-center p-3 rounded-lg border border-gold/10 bg-card/50 hover:bg-card/80 hover:border-gold/30 transition-colors cursor-pointer"
                    >
                    {/* Fecha - 2 columnas */}
                    <div className="col-span-6 md:col-span-2">
                      <p className="font-elegant text-sm text-muted-foreground mb-1">Fecha</p>
                      <div className="space-y-1">
                        <p className="font-display text-gold flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {formatDate(cita.fecha)}
                        </p>
                        <p className="font-elegant text-xs text-muted-foreground pl-6">
                          {new Date(cita.fecha + 'T00:00:00').toLocaleDateString('es-MX', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                          }).replace(/\//g, '-')}
                        </p>
                      </div>
                    </div>
                    
                    {/* Hora - 1 columna */}
                    <div className="col-span-6 md:col-span-1">
                      <p className="font-elegant text-sm text-muted-foreground mb-1">Hora</p>
                      <p className="font-display flex items-center gap-1">
                        <Clock className="h-4 w-4 text-gold" />
                        {cita.hora}
                      </p>
                    </div>
                    
                    {/* Cliente - 2 columnas */}
                    <div className="col-span-12 md:col-span-2">
                      <p className="font-elegant text-sm text-muted-foreground mb-1">Cliente</p>
                      <p className="font-display text-gold truncate">{cita.cliente_nombre}</p>
                      <p className="font-elegant text-xs text-muted-foreground flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {cita.cliente_telefono}
                      </p>
                    </div>
                    
                    {/* Servicio - 1.5 columnas */}
                    <div className="col-span-6 md:col-span-1">
                      <p className="font-elegant text-xs text-muted-foreground mb-1">Servicio</p>
                      <p className="font-elegant text-sm truncate">{cita.servicio}</p>
                    </div>
                    
                    {/* Barbero - 1 columna */}
                    <div className="col-span-6 md:col-span-1">
                      <p className="font-elegant text-xs text-muted-foreground mb-1">Barbero</p>
                      <p className="font-elegant text-sm">{cita.barbero}</p>
                    </div>
                    
                    {/* Estado - 1 columna */}
                    <div className="col-span-6 md:col-span-1">
                      <p className="font-elegant text-xs text-muted-foreground mb-1">Estado</p>
                      <span className={`inline-block px-1.5 py-0.5 rounded-full text-xs font-elegant border ${getEstadoBadge(cita.estado)}`}>
                        {cita.estado.toUpperCase()}
                      </span>
                    </div>
                    
                    {/* Acciones - 4 columnas (más espacio) */}
                    <div className="col-span-12 md:col-span-4 flex items-center gap-2 justify-end flex-wrap">
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
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setCitaParaReprogramar(cita)}
                            className="border-gold/20 hover:border-gold/40 text-xs px-3 py-1 h-8"
                          >
                            <Edit3 className="h-3 w-3 mr-1" />
                            Reprogramar
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
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setCitaParaReprogramar(cita)}
                            className="border-gold/20 hover:border-gold/40 text-xs px-3 py-1 h-8"
                          >
                            <Edit3 className="h-3 w-3 mr-1" />
                            Reprogramar
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
                  </motion.div>
                ))}
                </AnimatePresence>
              </div>
            )}
          </CardContent>
        </Card>
        </motion.div>
      </main>

      {/* Modal de Reprogramación */}
      {citaParaReprogramar && (
        <ReprogramacionCita
          cita={citaParaReprogramar}
          onClose={() => setCitaParaReprogramar(null)}
          onSuccess={handleReprogramarCita}
        />
      )}
    </div>
    </PageTransition>
  );
};

export default AllAppointments;
