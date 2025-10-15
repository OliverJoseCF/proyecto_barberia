import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PageTransition from '@/components/ui/PageTransition';
import { obtenerCambiosRecientes, obtenerHistorialCita, supabase } from '@/lib/supabase';
import { 
  pageHeaderAnimation,
  cardVariants,
  backButtonAnimation,
  glassEffectClasses
} from '@/lib/animations';
import { 
  ArrowLeft,
  Clock,
  User,
  Search,
  FileText,
  AlertCircle,
  CheckCircle,
  XCircle,
  Edit3,
  Trash2,
  PlusCircle,
  RefreshCw,
  Database
} from 'lucide-react';
import { toast } from 'sonner';

interface CambioAuditoria {
  cita_id: string;
  cliente: string;
  accion: 'INSERT' | 'UPDATE' | 'DELETE';
  cambios: any;
  datos_nuevos?: any;
  datos_anteriores?: any;
  fecha: string;
  usuario: string | null;
}

interface HistorialCita {
  accion: string;
  cambios: any;
  fecha: string;
  usuario: string | null;
}

const Auditoria = () => {
  const navigate = useNavigate();
  const [cambios, setCambios] = useState<CambioAuditoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [cambiosExpandidos, setCambiosExpandidos] = useState<Set<number>>(new Set());

  useEffect(() => {
    checkSessionAndLoadData();
  }, []);

  const checkSessionAndLoadData = async () => {
    try {
      // Verificar sesión en localStorage (mismo que Dashboard y Login)
      const barberoDataStr = localStorage.getItem('cantabarba_user');
      
      if (!barberoDataStr) {
        toast.error('Sesión expirada. Por favor inicia sesión nuevamente.');
        navigate('/admin/login');
        return;
      }

      const barberoData = JSON.parse(barberoDataStr);
      
      // Solo admin puede ver auditoría
      if (barberoData.rol !== 'admin') {
        toast.error('No tienes permisos para ver esta página');
        navigate('/admin/dashboard');
        return;
      }

      await cargarCambios();
    } catch (error) {
      console.error('Error al verificar sesión:', error);
      toast.error('Error al cargar datos');
      navigate('/admin/login');
    }
  };

  const cargarCambios = async () => {
    try {
      setLoading(true);
      
      // Obtener auditoría con más detalles
      const { data, error } = await supabase
        .from('auditoria_citas')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(100); // Últimos 100 cambios para ver más historial

      if (error) {
        console.error('Error al cargar auditoría:', error);
        throw error;
      }

      console.log('📊 Datos de auditoría recibidos:', data);

      // Formatear los datos para incluir información completa
      const cambiosFormateados = (data || []).map((registro: any) => ({
        cita_id: registro.cita_id || 'eliminada', // Si es null, la cita fue eliminada
        cliente: registro.datos_nuevos?.cliente_nombre || registro.datos_anteriores?.cliente_nombre || 'Desconocido',
        accion: registro.accion,
        cambios: registro.cambios_especificos || {},
        datos_nuevos: registro.datos_nuevos,
        datos_anteriores: registro.datos_anteriores,
        fecha: registro.timestamp,
        usuario: registro.usuario_id || null
      }));

      setCambios(cambiosFormateados);
      console.log('📊 Cambios formateados:', cambiosFormateados.length, 'registros');
      
      if (cambiosFormateados.length === 0) {
        console.warn('⚠️ No se encontraron registros de auditoría. Verifica que los triggers estén activos.');
      }
    } catch (error) {
      console.error('Error al cargar cambios:', error);
      toast.error('Error al cargar la auditoría');
    } finally {
      setLoading(false);
    }
  };

  const limpiarHistorial = async () => {
    try {
      // Confirmar antes de limpiar
      if (!confirm('¿Estás seguro de que deseas limpiar todo el historial de auditoría? Esta acción no se puede deshacer.')) {
        return;
      }

      setLoading(true);
      
      // Usar la función SQL creada específicamente para limpiar
      const { data, error } = await supabase.rpc('limpiar_auditoria_antigua', {
        dias_antiguedad: 0 // Eliminar TODO el historial
      });

      if (error) {
        throw error;
      }

      console.log(`🗑️ Registros eliminados: ${data}`);
      
      // Actualizar la lista local
      setCambios([]);
      
      toast.success('✅ Historial de auditoría limpiado correctamente', {
        description: `${data || 0} registros eliminados`,
      });
      
    } catch (error) {
      console.error('Error al limpiar historial:', error);
      toast.error('Error al limpiar el historial');
    } finally {
      setLoading(false);
    }
  };

  const toggleExpandir = (index: number) => {
    const nuevosExpandidos = new Set(cambiosExpandidos);
    if (nuevosExpandidos.has(index)) {
      nuevosExpandidos.delete(index);
    } else {
      nuevosExpandidos.add(index);
    }
    setCambiosExpandidos(nuevosExpandidos);
  };

  const getIconoPorAccion = (accion: string) => {
    switch (accion) {
      case 'INSERT':
        return <PlusCircle className="h-5 w-5 text-green-500" />;
      case 'UPDATE':
        return <Edit3 className="h-5 w-5 text-blue-500" />;
      case 'DELETE':
        return <Trash2 className="h-5 w-5 text-red-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  const getTextoAccion = (accion: string) => {
    switch (accion) {
      case 'INSERT':
        return 'Cita creada';
      case 'UPDATE':
        return 'Cita modificada';
      case 'DELETE':
        return 'Cita eliminada';
      default:
        return 'Acción desconocida';
    }
  };

  const obtenerDetallesCita = (cambio: CambioAuditoria) => {
    const datos = cambio.datos_nuevos || cambio.datos_anteriores || {};
    return {
      barbero: datos.barbero || 'N/A',
      servicio: datos.servicio || 'N/A',
      fecha: datos.fecha || 'N/A',
      hora: datos.hora || 'N/A',
      estado: datos.estado || 'N/A',
      telefono: datos.cliente_telefono || 'N/A',
      email: datos.cliente_email || 'N/A'
    };
  };

  const obtenerCambiosEspecificos = (cambio: CambioAuditoria) => {
    if (cambio.accion === 'INSERT') {
      return null; // No hay cambios previos en INSERT
    }
    
    if (cambio.accion === 'DELETE') {
      return null; // En DELETE solo mostramos los datos que se eliminaron
    }

    // Para UPDATE, mostrar qué cambió
    const cambios = cambio.cambios;
    if (!cambios || Object.keys(cambios).length === 0) {
      return null;
    }

    return Object.entries(cambios).map(([campo, valor]: [string, any]) => {
      const valorAnterior = cambio.datos_anteriores?.[campo];
      const valorNuevo = cambio.datos_nuevos?.[campo];
      
      return {
        campo: campo.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        antes: valorAnterior !== undefined ? String(valorAnterior) : 'N/A',
        despues: valorNuevo !== undefined ? String(valorNuevo) : 'N/A'
      };
    });
  };

  const formatearFecha = (fecha: string) => {
    const date = new Date(fecha);
    return new Intl.DateTimeFormat('es-MX', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date);
  };

  const cambiosFiltrados = cambios.filter(cambio => 
    cambio.cliente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cambio.accion?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          >
            <div>
              <Button
                variant="ghost"
                onClick={() => navigate('/admin/dashboard')}
                className="mb-4 hover:bg-gold/10 text-foreground"
                asChild
              >
                <motion.button
                  whileHover={{ x: -5 }}
                  transition={{ duration: 0.2 }}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Volver al Dashboard
                </motion.button>
              </Button>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="flex items-center gap-3"
              >
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                  <Database className="h-10 w-10 text-gold" />
                </motion.div>
                <div>
                  <h1 className="text-4xl font-display gradient-gold bg-clip-text text-transparent">
                    Auditoría de Cambios
                  </h1>
                  <p className="text-muted-foreground mt-1 font-elegant">
                    Historial completo de modificaciones (últimas 24 horas)
                  </p>
                </div>
              </motion.div>
            </div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="flex gap-2"
            >
              <Button
                onClick={cargarCambios}
                disabled={loading}
                className="bg-gold/90 hover:bg-gold text-gold-foreground font-semibold"
                asChild
              >
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  Actualizar
                </motion.button>
              </Button>
              <Button
                onClick={limpiarHistorial}
                disabled={loading}
                variant="destructive"
                className="bg-red-600 hover:bg-red-700"
                asChild
              >
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Limpiar Historial
                </motion.button>
              </Button>
            </motion.div>
          </motion.div>

          {/* Buscador */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <Card className="mb-6 glass-effect">
              <CardContent className="pt-6">
                <motion.div
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, duration: 0.3 }}
                  className="relative"
                >
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Buscar por cliente o acción..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-background/60"
                  />
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Lista de Cambios */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="grid gap-4"
          >
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <Card className="glass-effect">
                    <CardContent className="py-8 text-center">
                      <RefreshCw className="h-8 w-8 animate-spin mx-auto text-gold mb-2" />
                      <p className="text-muted-foreground">Cargando auditoría...</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : cambiosFiltrados.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <Card className="glass-effect">
                    <CardContent className="py-12 text-center">
                      <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground text-lg">
                        {searchTerm ? 'No se encontraron cambios' : 'No hay cambios recientes'}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : (
                <motion.div key="list">
                  {cambiosFiltrados.map((cambio, index) => {
                    const detalles = obtenerDetallesCita(cambio);
                    const cambiosEspecificos = obtenerCambiosEspecificos(cambio);
                    const estaExpandido = cambiosExpandidos.has(index);
                
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                    whileHover={{ scale: 1.01 }}
                  >
                    <Card 
                      className="glass-effect hover:border-gold/50 transition-all cursor-pointer"
                      onClick={() => toggleExpandir(index)}
                    >
                      <CardContent className="py-4">
                      {/* Vista Simplificada - Siempre visible */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="p-2 rounded-lg bg-muted/30">
                            {getIconoPorAccion(cambio.accion)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-semibold text-lg">{cambio.cliente}</h3>
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                cambio.accion === 'INSERT' ? 'bg-green-500/20 text-green-500' :
                                cambio.accion === 'UPDATE' ? 'bg-blue-500/20 text-blue-500' :
                                'bg-red-500/20 text-red-500'
                              }`}>
                                {getTextoAccion(cambio.accion)}
                              </span>
                              <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                                cambio.accion === 'DELETE' ? 'bg-red-500/20 text-red-500' :
                                detalles.estado === 'confirmada' ? 'bg-green-500/20 text-green-500' :
                                detalles.estado === 'pendiente' ? 'bg-yellow-500/20 text-yellow-500' :
                                detalles.estado === 'completada' ? 'bg-blue-500/20 text-blue-500' :
                                'bg-red-500/20 text-red-500'
                              }`}>
                                {cambio.accion === 'DELETE' ? 'ELIMINADA' : detalles.estado.toUpperCase()}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                              <span className="text-gold font-semibold">{detalles.barbero}</span>
                              <span>•</span>
                              <span>{detalles.fecha} {detalles.hora}</span>
                              <span>•</span>
                              <span className="text-xs">{formatearFecha(cambio.fecha)}</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Botón Ver Detalles */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleExpandir(index)}
                          className="ml-2 text-gold hover:bg-gold/10"
                        >
                          {estaExpandido ? (
                            <>
                              <XCircle className="h-4 w-4 mr-1" />
                              Ocultar
                            </>
                          ) : (
                            <>
                              <FileText className="h-4 w-4 mr-1" />
                              Ver Detalles
                            </>
                          )}
                        </Button>
                      </div>

                      {/* Vista Detallada - Solo cuando está expandido */}
                      {estaExpandido && (
                        <div className="mt-4 pt-4 border-t border-gold/20 space-y-3">
                          {/* Información de la cita */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-muted/20 rounded-lg p-3">
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Barbero</p>
                              <p className="text-sm font-semibold text-gold">{detalles.barbero}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Servicio</p>
                              <p className="text-sm font-semibold">{detalles.servicio}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Fecha</p>
                              <p className="text-sm font-semibold">{detalles.fecha}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Hora</p>
                              <p className="text-sm font-semibold">{detalles.hora}</p>
                            </div>
                          </div>

                          {/* Contacto del cliente */}
                          <div className="grid grid-cols-2 gap-3 bg-muted/10 rounded-lg p-3">
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Teléfono</p>
                              <p className="text-sm">{detalles.telefono}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Estado</p>
                              <p className={`text-sm font-semibold ${
                                detalles.estado === 'confirmada' ? 'text-green-500' :
                                detalles.estado === 'pendiente' ? 'text-yellow-500' :
                                detalles.estado === 'completada' ? 'text-blue-500' :
                                'text-red-500'
                              }`}>
                                {cambio.accion === 'DELETE' ? 'ELIMINADA' : detalles.estado.toUpperCase()}
                              </p>
                            </div>
                          </div>

                          {/* Mensaje especial para citas eliminadas */}
                          {cambio.accion === 'DELETE' && (
                            <div className="border-t border-red-500/20 pt-3">
                              <div className="flex items-center gap-2 bg-red-500/10 rounded p-3">
                                <Trash2 className="h-5 w-5 text-red-500" />
                                <div>
                                  <p className="text-sm font-semibold text-red-500">Cita Eliminada Permanentemente</p>
                                  <p className="text-xs text-muted-foreground">Esta cita fue eliminada del sistema. Los datos mostrados son del momento de la eliminación.</p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Cambios específicos (solo para UPDATE) */}
                          {cambiosEspecificos && cambiosEspecificos.length > 0 && (
                            <div className="border-t border-gold/20 pt-3">
                              <p className="text-sm font-semibold mb-2 text-muted-foreground">Cambios realizados:</p>
                              <div className="space-y-2">
                                {cambiosEspecificos.map((cambio, idx) => (
                                  <div key={idx} className="flex items-center gap-2 text-sm bg-blue-500/10 rounded p-2">
                                    <span className="font-medium text-blue-400">{cambio.campo}:</span>
                                    <span className="text-red-400 line-through">{cambio.antes}</span>
                                    <span className="text-muted-foreground">→</span>
                                    <span className="text-green-400 font-semibold">{cambio.despues}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  </motion.div>
                );
              })}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Auditoria;
