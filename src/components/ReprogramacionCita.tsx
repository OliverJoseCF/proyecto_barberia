import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Scissors, 
  ArrowRight,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { useAvailability } from '@/hooks/use-availability';
import { HORARIOS, BARBEROS } from '@/constants/bookingOptions';
import { motion } from 'framer-motion';

interface CitaOriginal {
  id: string;
  nombre: string;
  telefono: string;
  fecha: string;
  hora: string;
  servicio: string;
  barbero: string;
}

interface ReprogramacionCitaProps {
  cita: CitaOriginal;
  onClose: () => void;
  onSuccess: (nuevaFecha: string, nuevaHora: string) => void;
}

export const ReprogramacionCita = ({ cita, onClose, onSuccess }: ReprogramacionCitaProps) => {
  const [nuevaFecha, setNuevaFecha] = useState('');
  const [nuevaHora, setNuevaHora] = useState('');
  const [nuevoBarbero, setNuevoBarbero] = useState(cita.barbero);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'seleccion' | 'confirmacion'>('seleccion');

  const { 
    loading: loadingAvailability, 
    availabilityData, 
    checkAvailability 
  } = useAvailability();

  const handleFechaChange = (fecha: string) => {
    setNuevaFecha(fecha);
    setNuevaHora(''); // Reset hora when fecha changes
    if (fecha && nuevoBarbero) {
      checkAvailability(fecha, nuevoBarbero);
    }
  };

  const handleBarberoChange = (barbero: string) => {
    setNuevoBarbero(barbero);
    setNuevaHora(''); // Reset hora when barbero changes
    if (nuevaFecha && barbero) {
      checkAvailability(nuevaFecha, barbero);
    }
  };

  const handleConfirmarReprogramacion = async () => {
    if (!nuevaFecha || !nuevaHora) {
      toast.error('Por favor selecciona fecha y hora');
      return;
    }

    setLoading(true);
    
    try {
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      onSuccess(nuevaFecha, nuevaHora);
      toast.success('Cita reprogramada exitosamente');
      onClose();
    } catch (error) {
      toast.error('Error al reprogramar la cita');
    } finally {
      setLoading(false);
    }
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha + 'T00:00:00').toLocaleDateString('es-MX', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  if (step === 'confirmacion') {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-md"
        >
          <Card className="glass-effect border-gold/20">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <CardTitle className="font-display text-xl gradient-gold bg-clip-text text-transparent">
                  Confirmar Reprogramación
                </CardTitle>
              </div>
              <CardDescription className="font-elegant">
                Verifica los nuevos datos de tu cita
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Datos de la cita original */}
              <div className="bg-muted/20 rounded-lg p-4">
                <h4 className="font-display text-sm gradient-gold bg-clip-text text-transparent mb-2">
                  Cita Original
                </h4>
                <div className="space-y-1 text-sm font-elegant text-muted-foreground">
                  <p>📅 {formatearFecha(cita.fecha)} a las {cita.hora}</p>
                  <p>💇‍♂️ {cita.barbero}</p>
                </div>
              </div>

              <div className="flex items-center justify-center">
                <ArrowRight className="h-5 w-5 text-gold" />
              </div>

              {/* Datos de la nueva cita */}
              <div className="bg-gold/10 rounded-lg p-4">
                <h4 className="font-display text-sm gradient-gold bg-clip-text text-transparent mb-2">
                  Nueva Cita
                </h4>
                <div className="space-y-1 text-sm font-elegant">
                  <p>📅 {formatearFecha(nuevaFecha)} a las {nuevaHora}</p>
                  <p>💇‍♂️ {nuevoBarbero}</p>
                  <p>✂️ {cita.servicio}</p>
                </div>
              </div>

              <div className="bg-blue-500/10 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5" />
                  <div className="text-sm font-elegant text-blue-700 dark:text-blue-300">
                    <p className="font-semibold">Importante:</p>
                    <p>Te enviaremos una confirmación por WhatsApp una vez completada la reprogramación.</p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <Button 
                  variant="outline" 
                  onClick={() => setStep('seleccion')}
                  className="flex-1 border-gold/20"
                  disabled={loading}
                >
                  Modificar
                </Button>
                <Button 
                  onClick={handleConfirmarReprogramacion}
                  disabled={loading}
                  className="flex-1 gradient-gold text-background hover:opacity-90"
                >
                  {loading ? 'Reprogramando...' : 'Confirmar'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <Card className="glass-effect border-gold/20">
          <CardHeader>
            <CardTitle className="font-display text-2xl gradient-gold bg-clip-text text-transparent">
              Reprogramar Cita
            </CardTitle>
            <CardDescription className="font-elegant">
              Selecciona una nueva fecha y hora para tu cita
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Info del cliente */}
            <div className="bg-muted/20 rounded-lg p-4">
              <h4 className="font-display text-lg gradient-gold bg-clip-text text-transparent mb-3">
                Información de la Cita
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-elegant">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gold" />
                  <span>{cita.nombre}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-gold" />
                  <span>{cita.telefono}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Scissors className="h-4 w-4 text-gold" />
                  <span>{cita.servicio}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gold" />
                  <span>Actual: {formatearFecha(cita.fecha)} • {cita.hora}</span>
                </div>
              </div>
            </div>

            {/* Selección de nueva fecha y hora */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="nuevaFecha" className="font-elegant text-foreground flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gold" />
                  <span>Nueva Fecha</span>
                </Label>
                <Input
                  id="nuevaFecha"
                  type="date"
                  value={nuevaFecha}
                  min={getMinDate()}
                  onChange={(e) => handleFechaChange(e.target.value)}
                  className="font-elegant bg-background border-gold/20 focus:border-gold"
                />
              </div>

              <div className="space-y-2">
                <Label className="font-elegant text-foreground flex items-center space-x-2">
                  <User className="h-4 w-4 text-gold" />
                  <span>Barbero</span>
                </Label>
                <Select value={nuevoBarbero} onValueChange={handleBarberoChange}>
                  <SelectTrigger className="font-elegant bg-background border-gold/20 focus:border-gold">
                    <SelectValue placeholder="Selecciona un barbero" />
                  </SelectTrigger>
                  <SelectContent>
                    {BARBEROS.map((barbero) => (
                      <SelectItem key={barbero} value={barbero} className="font-elegant">
                        {barbero}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Selección de hora */}
            <div className="space-y-2">
              <Label className="font-elegant text-foreground flex items-center space-x-2">
                <Clock className="h-4 w-4 text-gold" />
                <span>Nueva Hora</span>
              </Label>
              <Select 
                value={nuevaHora} 
                onValueChange={setNuevaHora}
                disabled={!nuevaFecha || !nuevoBarbero || loadingAvailability}
              >
                <SelectTrigger className="font-elegant bg-background border-gold/20 focus:border-gold">
                  <SelectValue placeholder={
                    loadingAvailability ? "Verificando disponibilidad..." :
                    !nuevaFecha || !nuevoBarbero ? "Selecciona fecha y barbero primero" :
                    "Selecciona una hora"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {availabilityData?.horarios.map((slot) => (
                    <SelectItem 
                      key={slot.hora} 
                      value={slot.hora} 
                      disabled={!slot.disponible}
                      className={`font-elegant ${!slot.disponible ? 'opacity-50 line-through' : ''}`}
                    >
                      {slot.hora} {!slot.disponible && '(Ocupado)'}
                    </SelectItem>
                  )) || HORARIOS.map((hora) => (
                    <SelectItem key={hora} value={hora} className="font-elegant">
                      {hora}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Aviso */}
            {nuevaFecha && nuevaHora && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-500/10 rounded-lg p-3"
              >
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <p className="font-elegant text-sm text-green-700 dark:text-green-300">
                    Horario disponible confirmado para {formatearFecha(nuevaFecha)} a las {nuevaHora}
                  </p>
                </div>
              </motion.div>
            )}

            {/* Botones */}
            <div className="flex space-x-3 pt-4">
              <Button 
                variant="outline" 
                onClick={onClose}
                className="flex-1 border-gold/20"
              >
                Cancelar
              </Button>
              <Button 
                onClick={() => setStep('confirmacion')}
                disabled={!nuevaFecha || !nuevaHora || loadingAvailability}
                className="flex-1 gradient-gold text-background hover:opacity-90"
              >
                Continuar
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default ReprogramacionCita;