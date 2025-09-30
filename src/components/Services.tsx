import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Scissors, Sparkles, Zap, Palette, Star, Eye, ShoppingBag, Heart } from "lucide-react";

const Services = () => {
  const services = [
    {
      icon: <Scissors className="h-8 w-8" />,
      name: "Corte de Cabello",
      subtitle: "Hombre y Niño",
      price: "$25 - $35",
      duration: "45-60 min",
      description: "Cortes modernos y clásicos adaptados a tu estilo personal"
    },
    {
      icon: <Sparkles className="h-8 w-8" />,
      name: "Arreglo de Barba",
      subtitle: "Perfilado Profesional",
      price: "$20",
      duration: "30 min",
      description: "Definición y estilizado de barba con técnicas profesionales"
    },
    {
      icon: <Zap className="h-8 w-8" />,
      name: "Afeitado Clásico",
      subtitle: "Navaja Tradicional",
      price: "$30",
      duration: "45 min",
      description: "Experiencia tradicional con navaja, toallas calientes y acabado perfecto"
    },
    {
      icon: <Palette className="h-8 w-8" />,
      name: "Tintes",
      subtitle: "Color Profesional",
      price: "$40 - $60",
      duration: "90 min",
      description: "Coloración profesional con productos de alta calidad"
    },
    {
      icon: <Star className="h-8 w-8" />,
      name: "Diseños Capilares",
      subtitle: "Arte Personalizado",
      price: "$35",
      duration: "60 min",
      description: "Diseños únicos y personalizados para expresar tu personalidad"
    },
    {
      icon: <Eye className="h-8 w-8" />,
      name: "Tratamientos Barba y Cejas",
      subtitle: "Cuidado Completo",
      price: "$25",
      duration: "30 min",
      description: "Tratamientos especializados para barba y perfilado de cejas"
    },
    {
      icon: <ShoppingBag className="h-8 w-8" />,
      name: "Productos de Cuidado",
      subtitle: "Línea Premium",
      price: "Variable",
      duration: "-",
      description: "Productos profesionales para el cuidado en casa"
    },
    {
      icon: <Heart className="h-8 w-8" />,
      name: "Faciales y Skincare",
      subtitle: "Cuidado Facial",
      price: "$45",
      duration: "60 min",
      description: "Faciales, mascarillas y exfoliaciones para el cuidado completo de la piel"
    }
  ];

  return (
    <section id="servicios" className="py-24 bg-section-bg/80 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-5xl mb-6 gradient-gold bg-clip-text text-transparent text-glow leading-relaxed overflow-visible pb-2">
            Nuestros Servicios
          </h2>
          <p className="font-elegant text-xl text-muted-foreground max-w-2xl mx-auto">
            Servicios premium diseñados para realzar tu estilo y personalidad
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <Card key={index} className="glass-effect hover:border-gold/50 hover:glow-soft transition-elegant group bg-card/60 backdrop-blur-md">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 gradient-gold rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-elegant">
                  <div className="text-gold-foreground">
                    {service.icon}
                  </div>
                </div>
                <CardTitle className="font-display text-xl text-foreground">
                  {service.name}
                </CardTitle>
                <CardDescription className="font-elegant text-gold italic">
                  {service.subtitle}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-elegant text-muted-foreground">Precio:</span>
                  <span className="font-elegant text-gold font-semibold">{service.price}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="font-elegant text-muted-foreground">Duración:</span>
                  <span className="font-elegant text-foreground">{service.duration}</span>
                </div>
                <p className="font-elegant text-sm text-muted-foreground leading-relaxed mb-4">
                  {service.description}
                </p>
                <Button 
                  variant="elegant"
                  className="w-full font-elegant hover:scale-[1.045] focus:scale-[1.045] active:scale-95 transition-transform"
                  onClick={() => {
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
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;