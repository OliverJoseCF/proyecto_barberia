import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import PageTransition from '@/components/ui/PageTransition';
import { 
  ArrowLeft,
  Clock,
  Calendar,
  Save,
  Plus,
  Trash2,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

interface HorarioSemanal {
  dia: string;
  activo: boolean;
  apertura: string;
  cierre: string;
  pausaInicio?: string;
  pausaFin?: string;
}

interface DiaFestivo {
  id: string;
  fecha: string;
  descripcion: string;
  recurrente: boolean;
}

const ScheduleManagement = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [intervaloMinutos, setIntervaloMinutos] = useState(30);
  const [anticipacionMinima, setAnticipacionMinima] = useState(2); // horas
  const [diasFestivos, setDiasFestivos] = useState<DiaFestivo[]>([]);
  const [nuevaFecha, setNuevaFecha] = useState('');
  const [nuevaDescripcion, setNuevaDescripcion] = useState('');
  
  const [horarios, setHorarios] = useState<HorarioSemanal[]>([
    { dia: 'Lunes', activo: true, apertura: '09:00', cierre: '19:00' },
    { dia: 'Martes', activo: true, apertura: '09:00', cierre: '19:00' },
    { dia: 'Miércoles', activo: true, apertura: '09:00', cierre: '19:00' },
    { dia: 'Jueves', activo: true, apertura: '09:00', cierre: '19:00' },
    { dia: 'Viernes', activo: true, apertura: '09:00', cierre: '20:00' },
    { dia: 'Sábado', activo: true, apertura: '09:00', cierre: '18:00' },
    { dia: 'Domingo', activo: false, apertura: '10:00', cierre: '14:00' }
  ]);

  useEffect(() => {
    checkSession();
    cargarConfiguracion();
  }, []);

  const checkSession = () => {
    const userDataString = localStorage.getItem('cantabarba_user');
    if (!userDataString) {
      navigate('/admin/login');
      return;
    }

    const userData = JSON.parse(userDataString);
    if (userData.rol !== 'admin') {
      toast.error('Acceso denegado. Solo administradores.');
      navigate('/admin/dashboard');
      return;
    }
  };

  const cargarConfiguracion = async () => {
    try {
      // Aquí cargaríamos la configuración desde la base de datos
      // Por ahora usamos valores por defecto
      console.log('Cargando configuración de horarios...');
    } catch (error) {
      console.error('Error al cargar configuración:', error);
    }
  };

  const handleToggleDia = (index: number) => {
    setHorarios(prev => prev.map((h, i) => 
      i === index ? { ...h, activo: !h.activo } : h
    ));
  };

  const handleHorarioChange = (index: number, field: keyof HorarioSemanal, value: string) => {
    setHorarios(prev => prev.map((h, i) => 
      i === index ? { ...h, [field]: value } : h
    ));
  };

  const agregarDiaFestivo = () => {
    if (!nuevaFecha) {
      toast.error('Por favor selecciona una fecha');
      return;
    }

    const nuevo: DiaFestivo = {
      id: Date.now().toString(),
      fecha: nuevaFecha,
      descripcion: nuevaDescripcion || 'Día festivo',
      recurrente: false
    };

    setDiasFestivos(prev => [...prev, nuevo]);
    setNuevaFecha('');
    setNuevaDescripcion('');
    toast.success('Día festivo agregado');
  };

  const eliminarDiaFestivo = (id: string) => {
    setDiasFestivos(prev => prev.filter(d => d.id !== id));
    toast.success('Día festivo eliminado');
  };

  const guardarConfiguracion = async () => {
    try {
      setLoading(true);
      
      // Aquí guardaríamos en la base de datos
      const configuracion = {
        horarios,
        intervaloMinutos,
        anticipacionMinima,
        diasFestivos
      };

      console.log('Guardando configuración:', configuracion);
      
      // Simulamos un guardado
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Configuración guardada correctamente');
    } catch (error: any) {
      console.error('Error al guardar:', error);
      toast.error('Error al guardar la configuración');
    } finally {
      setLoading(false);
    }
  };

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
            <div className="flex items-center gap-4">
              <motion.div whileHover={{ x: -5 }} transition={{ duration: 0.2 }}>
                <Button
                  variant="ghost"
                  onClick={() => navigate('/admin/configuracion')}
                  className="text-gold hover:text-gold/80 font-elegant"
                >
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  Volver
                </Button>
              </motion.div>
              
              <div className="h-8 w-px bg-gold/20" />
              
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                >
                  <Clock className="h-8 w-8 text-gold" />
                </motion.div>
                <div>
                  <h1 className="font-display text-2xl gradient-gold bg-clip-text text-transparent">
                    Gestión de Horarios
                  </h1>
                  <p className="font-elegant text-sm text-muted-foreground">
                    Configura los horarios de atención y días festivos
                  </p>
                </div>
              </div>
            </div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={guardarConfiguracion}
                disabled={loading}
                className="gradient-gold text-gold-foreground hover:opacity-90 font-elegant"
              >
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Horarios Semanales */}
          <motion.div 
            className="lg:col-span-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Card className="glass-effect border-gold/20">
              <CardHeader>
                <CardTitle className="font-display gradient-gold bg-clip-text text-transparent">
                  Horario Semanal
                </CardTitle>
                <CardDescription className="font-elegant">
                  Define los días y horarios de atención
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {horarios.map((horario, index) => (
                  <motion.div
                    key={horario.dia}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + (index * 0.05), duration: 0.3 }}
                    whileHover={{ x: 5, transition: { duration: 0.2 } }}
                    className={`p-4 rounded-lg border transition-all duration-300 ${
                      horario.activo 
                        ? 'bg-card/50 border-gold/10 hover:border-gold/30' 
                        : 'bg-muted/20 border-muted/30'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 w-32">
                        <input
                          type="checkbox"
                          checked={horario.activo}
                          onChange={() => handleToggleDia(index)}
                          className="w-4 h-4 rounded border-gold/30 text-gold"
                        />
                        <span className={`font-display ${
                          horario.activo ? 'text-gold' : 'text-muted-foreground'
                        }`}>
                          {horario.dia}
                        </span>
                      </div>

                      {horario.activo && (
                        <>
                          <div className="flex items-center gap-2 flex-1">
                            <Label className="font-elegant text-xs text-muted-foreground w-16">
                              Apertura
                            </Label>
                            <Input
                              type="time"
                              value={horario.apertura}
                              onChange={(e) => handleHorarioChange(index, 'apertura', e.target.value)}
                              className="font-elegant"
                            />
                          </div>

                          <div className="flex items-center gap-2 flex-1">
                            <Label className="font-elegant text-xs text-muted-foreground w-16">
                              Cierre
                            </Label>
                            <Input
                              type="time"
                              value={horario.cierre}
                              onChange={(e) => handleHorarioChange(index, 'cierre', e.target.value)}
                              className="font-elegant"
                            />
                          </div>
                        </>
                      )}
                    </div>

                    {horario.activo && (
                      <div className="mt-3 pt-3 border-t border-gold/10">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2 flex-1">
                            <Label className="font-elegant text-xs text-muted-foreground w-20">
                              Pausa inicio
                            </Label>
                            <Input
                              type="time"
                              value={horario.pausaInicio || ''}
                              onChange={(e) => handleHorarioChange(index, 'pausaInicio', e.target.value)}
                              className="font-elegant"
                              placeholder="Opcional"
                            />
                          </div>

                          <div className="flex items-center gap-2 flex-1">
                            <Label className="font-elegant text-xs text-muted-foreground w-20">
                              Pausa fin
                            </Label>
                            <Input
                              type="time"
                              value={horario.pausaFin || ''}
                              onChange={(e) => handleHorarioChange(index, 'pausaFin', e.target.value)}
                              className="font-elegant"
                              placeholder="Opcional"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Configuración Adicional */}
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            {/* Intervalos */}
            <motion.div
              whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
            >
              <Card className="glass-effect border-gold/20">
                <CardHeader>
                  <CardTitle className="font-display text-lg gradient-gold bg-clip-text text-transparent">
                    Intervalos de Citas
                  </CardTitle>
                </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="font-elegant">
                    Duración entre citas (minutos)
                  </Label>
                  <select
                    value={intervaloMinutos}
                    onChange={(e) => setIntervaloMinutos(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-md border border-input bg-background font-elegant"
                  >
                    <option value={15}>15 minutos</option>
                    <option value={30}>30 minutos</option>
                    <option value={45}>45 minutos</option>
                    <option value={60}>60 minutos</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label className="font-elegant">
                    Anticipación mínima (horas)
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    value={anticipacionMinima}
                    onChange={(e) => setAnticipacionMinima(Number(e.target.value))}
                    className="font-elegant"
                  />
                  <p className="text-xs text-muted-foreground font-elegant">
                    Tiempo mínimo con el que se puede agendar
                  </p>
                </div>
              </CardContent>
            </Card>
            </motion.div>

            {/* Alert Info */}
            <motion.div
              whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
            >
              <Card className="glass-effect border-blue-500/20 bg-blue-500/5">
                <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-elegant text-sm text-blue-500 font-semibold mb-1">
                      Importante
                    </p>
                    <p className="font-elegant text-xs text-muted-foreground leading-relaxed">
                      Los cambios en horarios afectarán la disponibilidad para nuevas reservas. 
                      Las citas ya agendadas no se verán afectadas.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            </motion.div>
          </motion.div>
        </div>

        {/* Días Festivos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <Card className="glass-effect border-gold/20 mt-8">
          <CardHeader>
            <CardTitle className="font-display gradient-gold bg-clip-text text-transparent">
              Días Festivos y Bloqueados
            </CardTitle>
            <CardDescription className="font-elegant">
              Bloquea fechas específicas donde no habrá atención
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Formulario para agregar */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-lg bg-muted/20 border border-gold/10">
                <div className="space-y-2">
                  <Label className="font-elegant">Fecha</Label>
                  <Input
                    type="date"
                    value={nuevaFecha}
                    onChange={(e) => setNuevaFecha(e.target.value)}
                    className="font-elegant"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="font-elegant">Descripción</Label>
                  <Input
                    type="text"
                    value={nuevaDescripcion}
                    onChange={(e) => setNuevaDescripcion(e.target.value)}
                    placeholder="Ej: Navidad, Año Nuevo"
                    className="font-elegant"
                  />
                </div>

                <div className="flex items-end">
                  <motion.div className="w-full" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      onClick={agregarDiaFestivo}
                      className="w-full gradient-gold text-gold-foreground font-elegant"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar
                    </Button>
                  </motion.div>
                </div>
              </div>

              {/* Lista de días festivos */}
              <div className="space-y-3">
                {diasFestivos.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-30" />
                    <p className="font-elegant text-muted-foreground text-sm">
                      No hay días festivos configurados
                    </p>
                  </div>
                ) : (
                  diasFestivos.map((dia, index) => (
                    <motion.div
                      key={dia.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.3 }}
                      whileHover={{ x: 5, scale: 1.02, transition: { duration: 0.2 } }}
                      className="flex items-center justify-between p-4 rounded-lg bg-card/50 border border-gold/10 hover:border-gold/30 transition-all duration-300"
                    >
                      <div className="flex items-center gap-4">
                        <Calendar className="h-5 w-5 text-gold" />
                        <div>
                          <p className="font-display text-gold">
                            {new Date(dia.fecha + 'T00:00:00').toLocaleDateString('es-MX', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </p>
                          <p className="font-elegant text-sm text-muted-foreground">
                            {dia.descripcion}
                          </p>
                        </div>
                      </div>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => eliminarDiaFestivo(dia.id)}
                        className="text-red-500 hover:bg-red-500/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        </motion.div>
      </main>
    </PageTransition>
  );
};

export default ScheduleManagement;
