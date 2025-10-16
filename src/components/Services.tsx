import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Scissors, Sparkles, Zap, Palette, Star, Eye, ShoppingBag, Heart, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useServicios } from "@/hooks/use-servicios";

const Services = () => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  // Usar datos reales de la base de datos (solo servicios activos)
  const { servicios, loading } = useServicios(false);

  // Mapeo de categorías a iconos
  const getCategoryIcon = (categoria?: string) => {
    const iconMap: Record<string, JSX.Element> = {
      'Cortes': <Scissors className="h-8 w-8" />,
      'Barba': <Sparkles className="h-8 w-8" />,
      'Afeitado': <Zap className="h-8 w-8" />,
      'Tintes': <Palette className="h-8 w-8" />,
      'Diseños': <Star className="h-8 w-8" />,
      'Tratamientos': <Eye className="h-8 w-8" />,
      'Productos': <ShoppingBag className="h-8 w-8" />,
      'Facial': <Heart className="h-8 w-8" />,
      'Infantil': <Scissors className="h-8 w-8" />,
      'Paquetes': <Sparkles className="h-8 w-8" />,
    };
    
    return iconMap[categoria || 'Cortes'] || <Scissors className="h-8 w-8" />;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0, filter: 'blur(5px)' },
    visible: {
      y: 0,
      opacity: 1,
      filter: 'blur(0px)',
      transition: {
        duration: 0.8,
      },
    },
  };

  return (
    <section id="servicios" className="py-24 bg-section-bg/80 backdrop-blur-sm" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: -20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="font-display text-4xl md:text-5xl mb-6 gradient-gold bg-clip-text text-transparent text-glow leading-relaxed overflow-visible pb-2">
            Nuestros Servicios
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: -20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="font-elegant text-xl text-muted-foreground max-w-2xl mx-auto">
            Servicios premium diseñados para realzar tu estilo y personalidad
          </motion.p>
        </div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
        >
          {loading ? (
            // Loading state
            <div className="col-span-full flex justify-center items-center py-12">
              <Loader2 className="h-12 w-12 text-gold animate-spin" />
              <span className="ml-4 font-elegant text-gold">Cargando servicios...</span>
            </div>
          ) : servicios.length === 0 ? (
            // Empty state
            <div className="col-span-full text-center py-12">
              <p className="font-elegant text-xl text-muted-foreground">
                No hay servicios disponibles en este momento.
              </p>
            </div>
          ) : (
            // Servicios dinámicos desde la base de datos
            servicios.map((servicio, index) => (
              <motion.div
                key={servicio.id}
                variants={itemVariants}
              >
                <Card className="glass-effect hover:border-gold/50 hover:glow-soft transition-elegant group bg-card/60 backdrop-blur-md flex flex-col h-full">
                  <CardHeader className="text-center">
                    <div className="mx-auto w-16 h-16 gradient-gold rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-elegant">
                      <div className="text-gold-foreground">
                        {getCategoryIcon(servicio.categoria)}
                      </div>
                    </div>
                    <CardTitle className="font-display text-xl text-foreground">
                      {servicio.nombre}
                    </CardTitle>
                    <CardDescription className="font-elegant text-gold italic">
                      {servicio.categoria || 'Servicio Premium'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-center space-y-3 flex flex-col flex-grow">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-elegant text-muted-foreground">Precio:</span>
                      <span className="font-elegant text-gold font-semibold">
                        ${servicio.precio.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-elegant text-muted-foreground">Duración:</span>
                      <span className="font-elegant text-foreground">{servicio.duracion} min</span>
                    </div>
                    <p className="font-elegant text-sm text-muted-foreground leading-relaxed mb-4 flex-grow">
                      {servicio.descripcion}
                    </p>
                    <Button 
                      variant="elegant"
                      className="w-full font-elegant mt-auto"
                      onClick={() => {
                        // Guardar el servicio seleccionado en localStorage
                        localStorage.setItem('servicioSeleccionado', servicio.nombre);
                        
                        // Navegar a la sección de reservas
                        const bookingSection = document.getElementById('reservas');
                        if (bookingSection) {
                          bookingSection.scrollIntoView({ behavior: 'smooth' });
                        }
                      }}
                    >
                      Agendar Servicio
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default Services;