// ...existing code...
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, User, Phone, Scissors } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAvailability } from "@/hooks/use-availability";
import { SERVICIOS, BARBEROS, HORARIOS } from "@/constants/bookingOptions";
import DotGrid from "./DotGrid";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { z } from "zod";


const Booking = () => {
	const { toast } = useToast();
	const { ref, inView } = useInView({
		triggerOnce: true,
		threshold: 0.1,
	});
	const { loading: loadingAvailability, availabilityData, checkAvailability, getAvailableSlots } = useAvailability();

	const [formData, setFormData] = useState({
		nombre: "",
		telefono: "",
		fecha: "",
		hora: "",
		servicio: "",
		barbero: ""
	});
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [loading, setLoading] = useState(false);

  useEffect(() => {
    const servicioGuardado = localStorage.getItem("servicioSeleccionado");
    if (servicioGuardado) {
      setFormData((prev) => ({ ...prev, servicio: servicioGuardado }));
      localStorage.removeItem("servicioSeleccionado");
    }
  }, []);

  // Verificar disponibilidad cuando cambie fecha o barbero
  useEffect(() => {
    if (formData.fecha && formData.barbero) {
      checkAvailability(formData.fecha, formData.barbero);
      // Limpiar hora seleccionada si ya no está disponible
      if (formData.hora) {
        const availableSlots = getAvailableSlots(formData.fecha, formData.barbero);
        if (!availableSlots.includes(formData.hora)) {
          setFormData(prev => ({ ...prev, hora: '' }));
        }
      }
    }
  }, [formData.fecha, formData.barbero]);

  // Esquema de validación con Zod
  const bookingSchema = z.object({
    nombre: z.string()
      .min(2, 'El nombre debe tener al menos 2 caracteres')
      .max(50, 'El nombre no puede exceder 50 caracteres')
      .regex(/^[a-zA-ZáéíóúñÁÉÍÓÚÑüÜ\s]+$/, 'Solo se permiten letras y espacios'),
    telefono: z.string()
      .length(10, 'El teléfono debe tener exactamente 10 dígitos')
      .regex(/^\d{10}$/, 'Solo se permiten números'),
    fecha: z.string()
      .min(1, 'La fecha es obligatoria')
      .refine((date) => {
        const selectedDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return selectedDate >= today;
      }, 'La fecha no puede ser anterior a hoy'),
    hora: z.string().min(1, 'La hora es obligatoria'),
    servicio: z.string().min(1, 'El servicio es obligatorio'),
    barbero: z.string().min(1, 'El barbero es obligatorio'),
  });

	// Validación de campos mejorada
	const validate = () => {
		const result = bookingSchema.safeParse(formData);
    
    if (result.success) {
      setErrors({});
      return true;
    } else {
      const newErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        if (issue.path.length > 0) {
          newErrors[issue.path[0] as string] = issue.message;
        }
      });
      setErrors(newErrors);
      return false;
    }
  };

  const servicios = [
    "Corte de Cabello (Hombre)",
    "Corte de Cabello (Niño)",
    "Arreglo de Barba",
    "Afeitado Clásico",
    "Tintes",
    "Diseños Capilares",
    "Tratamientos Barba y Cejas",
    "Faciales y Skincare"
  ];

  const barberos = [
    "Ángel Ramírez",
    "Emiliano Vega"
  ];

  const horarios = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
    "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
    "18:00", "18:30", "19:00", "19:30"
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast({
        title: "Datos incompletos",
        description: "Por favor, completa todos los campos correctamente.",
      });
      return;
    }
    
    setLoading(true);
    
    try {
      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Guardar en localStorage temporalmente
      const existingCitas = JSON.parse(localStorage.getItem('cantabarba-citas') || '[]');
      const newCita = {
        id: `cita_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...formData,
        estado: 'pendiente',
        createdAt: new Date().toISOString(),
      };
      existingCitas.push(newCita);
      localStorage.setItem('cantabarba-citas', JSON.stringify(existingCitas));

      toast({
        title: "¡Solicitud de reserva enviada! ✅",
        description: `Gracias ${formData.nombre}, nos pondremos en contacto contigo al ${formData.telefono} para confirmar tu cita del ${formData.fecha} a las ${formData.hora}.`,
      });
      
      setFormData({
        nombre: "",
        telefono: "",
        fecha: "",
        hora: "",
        servicio: "",
        barbero: ""
      });
      setErrors({});
    } catch (err: any) {
      console.error('Error al guardar cita:', err);
      toast({ 
        title: "Error al enviar reserva", 
        description: err.message || "No se pudo enviar la reserva. Por favor, intenta de nuevo o llámanos directamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
	return (
		<section id="reservas" className="py-24 relative overflow-hidden" ref={ref}>
			{/* DotGrid Background */}
			<div className="absolute inset-0 opacity-15">
				<DotGrid 
					dotSize={8}
					gap={24}
					baseColor="#D4AF37"
					activeColor="#F5E6A8"
					proximity={120}
					speedTrigger={80}
					shockRadius={200}
					shockStrength={3}
					className="w-full h-full"
				/>
			</div>
			
			{/* Content overlay */}
			<div className="relative z-10">
				<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="text-center mb-16">
					<motion.h2 
						initial={{ opacity: 0, scale: 0.9 }}
						animate={inView ? { opacity: 1, scale: 1 } : {}}
						transition={{ duration: 0.5, ease: "easeOut" }}
						className="font-display text-4xl md:text-5xl mb-6 gradient-gold bg-clip-text text-transparent text-glow leading-relaxed overflow-visible pb-2">
						Reserva tu Cita
					</motion.h2>
					<motion.p 
						initial={{ opacity: 0, y: 20 }}
						animate={inView ? { opacity: 1, y: 0 } : {}}
						transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
						className="font-elegant text-xl text-muted-foreground max-w-2xl mx-auto">
						Agenda tu próxima visita y déjanos crear la magia que buscas
					</motion.p>
				</div>

				<motion.div
					initial={{ opacity: 0, y: 50, scale: 0.95 }}
					animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
					transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
				>
					<Card className="glass-effect max-w-2xl mx-auto bg-card/40 backdrop-blur-md border-gold/20">
          <CardHeader className="text-center">
            <CardTitle className="font-display text-2xl text-gold flex items-center justify-center space-x-2">
              <Scissors className="h-6 w-6" />
              <span>Nueva Reserva</span>
            </CardTitle>
            <CardDescription className="font-elegant text-muted-foreground">
              Completa el formulario y nos pondremos en contacto contigo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <Label htmlFor="nombre" className="font-elegant text-foreground flex items-center space-x-2">
                    <User className="h-4 w-4 text-gold" />
                    <span>Nombre Completo</span>
                  </Label>
                  <Input
                    id="nombre"
                    value={formData.nombre}
                    aria-invalid={!!errors.nombre}
                    aria-describedby="error-nombre"
                    onChange={(e) => {
                      const value = e.target.value;
                      // Solo permitir letras, espacios y caracteres con acentos
                      if (/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]*$/.test(value)) {
                        setFormData({ ...formData, nombre: value });
                      }
                    }}
                    onKeyPress={(e) => {
                      // Bloquear caracteres que no sean letras o espacios
                      if (!/[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/.test(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    placeholder="Tu nombre completo"
                    className="font-elegant bg-background border-elegant-border/50 focus:border-gold"
                  />
                  {errors.nombre && <span id="error-nombre" className="text-red-500 text-xs">{errors.nombre}</span>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telefono" className="font-elegant text-foreground flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gold" />
                    <span>Teléfono</span>
                  </Label>
                  <Input
                    id="telefono"
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={10}
                    value={formData.telefono}
                    aria-invalid={!!errors.telefono}
                    aria-describedby="error-telefono"
                    onChange={(e) => {
                      const value = e.target.value;
                      // Solo permitir números
                      if (/^\d*$/.test(value) && value.length <= 10) {
                        setFormData({ ...formData, telefono: value });
                      }
                    }}
                    onKeyPress={(e) => {
                      // Bloquear caracteres que no sean números
                      if (!/\d/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'Tab' && e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') {
                        e.preventDefault();
                      }
                    }}
                    placeholder="Tu número de teléfono"
                    className="font-elegant bg-background border-elegant-border/50 focus:border-gold"
                  />
                  {errors.telefono && <span id="error-telefono" className="text-red-500 text-xs">{errors.telefono}</span>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <Label htmlFor="fecha" className="font-elegant text-foreground flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gold" />
                    <span>Fecha</span>
                  </Label>
                  <Input
                    id="fecha"
                    type="date"
                    value={formData.fecha}
                    aria-invalid={!!errors.fecha}
                    aria-describedby="error-fecha"
                    onChange={(e) => setFormData({...formData, fecha: e.target.value})}
                    className="font-elegant bg-background border-elegant-border/50 focus:border-gold"
                  />
                  {errors.fecha && <span id="error-fecha" className="text-red-500 text-xs">{errors.fecha}</span>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hora" className="font-elegant text-foreground flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gold" />
                    <span>Hora</span>
                  </Label>
                  <Select 
                    value={formData.hora} 
                    onValueChange={(value) => setFormData({...formData, hora: value})}
                    disabled={!formData.fecha || !formData.barbero || loadingAvailability}
                  >
                    <SelectTrigger className="font-elegant bg-background border-elegant-border/50 focus:border-gold">
                      <SelectValue placeholder={
                        loadingAvailability ? "Verificando disponibilidad..." :
                        !formData.fecha || !formData.barbero ? "Selecciona fecha y barbero primero" :
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
                  {errors.hora && <span className="text-red-500 text-xs">{errors.hora}</span>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="servicio" className="font-elegant text-foreground flex items-center space-x-2">
                  <Scissors className="h-4 w-4 text-gold" />
                  <span>Servicio</span>
                </Label>
                <Select value={formData.servicio} onValueChange={(value) => setFormData({...formData, servicio: value})}>
                  <SelectTrigger className="font-elegant bg-background border-elegant-border/50 focus:border-gold">
                    <SelectValue placeholder="Selecciona un servicio" />
                  </SelectTrigger>
                  <SelectContent>
                    {SERVICIOS.map((servicio) => (
                      <SelectItem key={servicio} value={servicio} className="font-elegant">
                        {servicio}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.servicio && <span className="text-red-500 text-xs">{errors.servicio}</span>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="barbero" className="font-elegant text-foreground flex items-center space-x-2">
                  <User className="h-4 w-4 text-gold" />
                  <span>Barbero Preferido</span>
                </Label>
                <Select value={formData.barbero} onValueChange={(value) => setFormData({...formData, barbero: value})}>
                  <SelectTrigger className="font-elegant bg-background border-elegant-border/50 focus:border-gold">
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
                {errors.barbero && <span className="text-red-500 text-xs">{errors.barbero}</span>}
              </div>

              <Button 
                type="submit" 
                variant="premium"
                className={`w-full font-elegant text-lg py-3 flex items-center justify-center transition-all duration-300 hover:scale-[1.045] focus:scale-[1.045] active:scale-95 ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
                disabled={loading}
              >
                {loading && <span className="loader mr-2 animate-spin" aria-label="Cargando"></span>}
                Enviar Solicitud de Reserva
              </Button>

              <p className="text-center font-elegant text-sm text-muted-foreground">
                * Nos pondremos en contacto contigo para confirmar la disponibilidad
              </p>
						</form>
					</CardContent>
				</Card>
				</motion.div>
				</div>
			</div>
		</section>
	);
};

export default Booking;