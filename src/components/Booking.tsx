// ...existing code...
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, User, Phone, Scissors } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";
import { SERVICIOS, BARBEROS, HORARIOS } from "@/constants/bookingOptions";


const Booking = () => {
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    nombre: "",
    telefono: "",
    fecha: "",
    hora: "",
    servicio: "",
    barbero: ""
  });
  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const servicioGuardado = localStorage.getItem("servicioSeleccionado");
    if (servicioGuardado) {
      setFormData((prev) => ({ ...prev, servicio: servicioGuardado }));
      localStorage.removeItem("servicioSeleccionado");
    }
  }, []);

  // Validación de campos
  const validate = () => {
    const newErrors: any = {};
    if (!formData.nombre.trim()) newErrors.nombre = "El nombre es obligatorio.";
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(formData.nombre)) newErrors.nombre = "Solo letras y espacios.";
    if (!formData.telefono) newErrors.telefono = "El teléfono es obligatorio.";
    if (!/^\d{10}$/.test(formData.telefono)) newErrors.telefono = "Debe tener 10 dígitos.";
    if (!formData.fecha) newErrors.fecha = "La fecha es obligatoria.";
    if (!formData.hora) newErrors.hora = "La hora es obligatoria.";
    if (!formData.servicio) newErrors.servicio = "El servicio es obligatorio.";
    if (!formData.barbero) newErrors.barbero = "El barbero es obligatorio.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
    if (!validate()) return;
    setLoading(true);
    try {
      // Aquí podrías guardar en Supabase si lo deseas
      // await supabase.from('citas').insert([{ ...formData }]);
      toast({
        title: "¡Solicitud de reserva enviada!",
        description: `Gracias ${formData.nombre}, nos pondremos en contacto contigo para confirmar tu cita.`,
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
    } catch (err) {
      toast({ title: "Error", description: "No se pudo enviar la reserva." });
    } finally {
      setLoading(false);
    }
  };
  return (
    <section id="reservas" className="py-24 bg-background/85 backdrop-blur-sm">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-5xl mb-6 gradient-gold bg-clip-text text-transparent text-glow leading-relaxed overflow-visible pb-2">
            Reserva tu Cita
          </h2>
          <p className="font-elegant text-xl text-muted-foreground max-w-2xl mx-auto">
            Agenda tu próxima visita y déjanos crear la magia que buscas
          </p>
        </div>

        <Card className="glass-effect max-w-2xl mx-auto">
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      setFormData({ ...formData, nombre: value });
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
                      setFormData({ ...formData, telefono: value });
                    }}
                    placeholder="Tu número de teléfono"
                    className="font-elegant bg-background border-elegant-border/50 focus:border-gold"
                  />
                  {errors.telefono && <span id="error-telefono" className="text-red-500 text-xs">{errors.telefono}</span>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <Select value={formData.hora} onValueChange={(value) => setFormData({...formData, hora: value})}>
                    <SelectTrigger className="font-elegant bg-background border-elegant-border/50 focus:border-gold">
                      <SelectValue placeholder="Selecciona una hora" />
                    </SelectTrigger>
                    <SelectContent>
                      {HORARIOS.map((hora) => (
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
      </div>
    </section>
  );
};

export default Booking;