import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import PageTransition from '@/components/ui/PageTransition';
import { ArrowLeft, Settings, Clock, DollarSign, Ban, Save } from 'lucide-react';
import { toast } from 'sonner';

const BookingSettings = () => {
  const navigate = useNavigate();
  const [config, setConfig] = useState({
    anticipacion_minima: 2,
    anticipacion_maxima: 30,
    cancelacion_limite: 24,
    deposito_requerido: false,
    deposito_porcentaje: 20,
    max_cancelaciones_mes: 3,
    bloqueo_automatico: true,
    confirmacion_automatica: false
  });

  useEffect(() => {
    const userData = localStorage.getItem('cantabarba_user');
    if (!userData || JSON.parse(userData).rol !== 'admin') navigate('/admin/login');
  }, []);

  const handleSave = () => {
    toast.success('Configuración guardada exitosamente');
  };

  return (
    <PageTransition>
      <motion.header initial={{ y: -100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-card border-b border-gold/20 sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.div whileHover={{ x: -5 }} transition={{ duration: 0.2 }}>
                <Button variant="ghost" onClick={() => navigate('/admin/configuracion')} className="text-gold">
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  Volver
                </Button>
              </motion.div>
              <div className="h-8 w-px bg-gold/20" />
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ 
                    scale: [1, 0.95, 1],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    repeatDelay: 3,
                    ease: "easeInOut"
                  }}
                >
                  <Settings className="h-8 w-8 text-gold" />
                </motion.div>
                <div>
                  <h1 className="font-display text-2xl gradient-gold bg-clip-text text-transparent">
                    Configuración de Reservas
                  </h1>
                  <p className="font-elegant text-sm text-muted-foreground">
                    Políticas y reglas del sistema de citas
                  </p>
                </div>
              </div>
            </div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button onClick={handleSave} className="gradient-gold text-gold-foreground font-elegant">
                <Save className="h-4 w-4 mr-2" />
                Guardar Cambios
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.2, duration: 0.5 }}
          whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
        >
          <Card className="glass-effect border-gold/20 hover:border-gold/30 transition-all duration-300">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Clock className="h-6 w-6 text-gold" />
                <CardTitle className="font-display gradient-gold bg-clip-text text-transparent">
                  Tiempo de Anticipación
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-elegant">Anticipación Mínima (horas)</Label>
                  <Input
                    type="number"
                    value={config.anticipacion_minima}
                    onChange={(e) => setConfig({...config, anticipacion_minima: Number(e.target.value)})}
                    className="font-elegant"
                  />
                  <p className="text-xs text-muted-foreground font-elegant">
                    Tiempo mínimo antes de la cita para reservar
                  </p>
                </div>
                <div className="space-y-2">
                  <Label className="font-elegant">Anticipación Máxima (días)</Label>
                  <Input
                    type="number"
                    value={config.anticipacion_maxima}
                    onChange={(e) => setConfig({...config, anticipacion_maxima: Number(e.target.value)})}
                    className="font-elegant"
                  />
                  <p className="text-xs text-muted-foreground font-elegant">
                    Hasta cuántos días en el futuro se puede reservar
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.4, duration: 0.5 }}
          whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
        >
          <Card className="glass-effect border-gold/20 hover:border-gold/30 transition-all duration-300">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Ban className="h-6 w-6 text-red-500" />
                <CardTitle className="font-display gradient-gold bg-clip-text text-transparent">
                  Políticas de Cancelación
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="font-elegant">Límite para Cancelar (horas antes)</Label>
                <Input
                  type="number"
                  value={config.cancelacion_limite}
                  onChange={(e) => setConfig({...config, cancelacion_limite: Number(e.target.value)})}
                  className="font-elegant"
                />
                <p className="text-xs text-muted-foreground font-elegant">
                  Tiempo mínimo antes de la cita para poder cancelar sin penalización
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-elegant">Cancelaciones Permitidas al Mes</Label>
                  <Input
                    type="number"
                    value={config.max_cancelaciones_mes}
                    onChange={(e) => setConfig({...config, max_cancelaciones_mes: Number(e.target.value)})}
                    className="font-elegant"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="font-elegant">Bloqueo Automático</Label>
                    <input
                      type="checkbox"
                      checked={config.bloqueo_automatico}
                      onChange={(e) => setConfig({...config, bloqueo_automatico: e.target.checked})}
                      className="w-5 h-5"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground font-elegant">
                    Bloquear clientes que superen el límite
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.6, duration: 0.5 }}
          whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
        >
          <Card className="glass-effect border-gold/20 hover:border-gold/30 transition-all duration-300">
            <CardHeader>
              <div className="flex items-center gap-3">
                <DollarSign className="h-6 w-6 text-green-500" />
                <CardTitle className="font-display gradient-gold bg-clip-text text-transparent">
                  Depósitos y Pagos
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-card/50 rounded-lg border border-gold/10">
                <div>
                  <Label className="font-elegant text-base">Requerir Depósito</Label>
                  <p className="text-xs text-muted-foreground font-elegant mt-1">
                    Solicitar pago anticipado para confirmar cita
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={config.deposito_requerido}
                  onChange={(e) => setConfig({...config, deposito_requerido: e.target.checked})}
                  className="w-6 h-6"
                />
              </div>
              {config.deposito_requerido && (
                <div className="space-y-2">
                  <Label className="font-elegant">Porcentaje de Depósito (%)</Label>
                  <Input
                    type="number"
                    value={config.deposito_porcentaje}
                    onChange={(e) => setConfig({...config, deposito_porcentaje: Number(e.target.value)})}
                    className="font-elegant"
                    min="10"
                    max="100"
                  />
                  <p className="text-xs text-muted-foreground font-elegant">
                    Porcentaje del precio total a pagar como anticipo
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.8, duration: 0.5 }}
          whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
        >
          <Card className="glass-effect border-gold/20 hover:border-gold/30 transition-all duration-300">
            <CardHeader>
              <CardTitle className="font-display gradient-gold bg-clip-text text-transparent">
                Automatización
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-card/50 rounded-lg border border-gold/10">
                <div>
                  <Label className="font-elegant text-base">Confirmación Automática</Label>
                  <p className="text-xs text-muted-foreground font-elegant mt-1">
                    Aprobar citas sin revisión manual
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={config.confirmacion_automatica}
                  onChange={(e) => setConfig({...config, confirmacion_automatica: e.target.checked})}
                  className="w-6 h-6"
                />
              </div>
              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <p className="text-sm font-elegant text-blue-500">
                  💡 Tip: La confirmación manual te permite revisar cada cita antes de aprobarla, útil para gestionar mejor la carga de trabajo.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card className="glass-effect border-gold/20">
            <CardHeader>
              <CardTitle className="font-display gradient-gold bg-clip-text text-transparent">
                Resumen de Configuración Actual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-card/50 rounded-lg border border-gold/10">
                  <p className="text-xs text-muted-foreground font-elegant mb-1">Ventana de Reserva</p>
                  <p className="font-elegant">
                    {config.anticipacion_minima}h - {config.anticipacion_maxima} días
                  </p>
                </div>
                <div className="p-3 bg-card/50 rounded-lg border border-gold/10">
                  <p className="text-xs text-muted-foreground font-elegant mb-1">Cancelación Límite</p>
                  <p className="font-elegant">
                    {config.cancelacion_limite} horas antes
                  </p>
                </div>
                <div className="p-3 bg-card/50 rounded-lg border border-gold/10">
                  <p className="text-xs text-muted-foreground font-elegant mb-1">Depósito</p>
                  <p className="font-elegant">
                    {config.deposito_requerido ? `${config.deposito_porcentaje}% requerido` : 'No requerido'}
                  </p>
                </div>
                <div className="p-3 bg-card/50 rounded-lg border border-gold/10">
                  <p className="text-xs text-muted-foreground font-elegant mb-1">Confirmación</p>
                  <p className="font-elegant">
                    {config.confirmacion_automatica ? 'Automática' : 'Manual'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </PageTransition>
  );
};

export default BookingSettings;
