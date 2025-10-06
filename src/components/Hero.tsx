import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/fondochido1.jpg";

const Hero = () => {
  const [show, setShow] = useState(false);

  // Memoizar funciones de navegación
  const scrollToReservas = useCallback(() => {
    document.getElementById('reservas')?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const scrollToGaleria = useCallback(() => {
    document.getElementById('galeria')?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    // Desactivar restauración automática del scroll
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    const timer = setTimeout(() => setShow(true), 100);

    // Scroll inmediato al Hero
    const heroSection = document.getElementById('inicio');
    if (heroSection) {
      heroSection.scrollIntoView({ behavior: 'auto' });
    }

    return () => clearTimeout(timer);
  }, []);

  return (
    <section id="inicio" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image con loading optimizado */}
      <div
        className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-[1800ms] ease-out will-change-transform
        ${show ? 'opacity-100 blur-0 scale-100' : 'opacity-0 blur-sm scale-105'}`}
        style={{ 
          backgroundImage: `url(${heroImage})`,
          backgroundAttachment: 'fixed' // Parallax effect
        }}
        role="img"
        aria-label="Hero background - Barbershop interior"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-hero-bg/90 via-hero-bg/70 to-hero-bg/50"></div>
      </div>

      {/* Content */}
      <div
        className={`relative z-10 text-center max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-1000 ease-out will-change-transform
        ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      >
        <h1
          className="font-display text-5xl md:text-7xl lg:text-8xl mb-6 leading-tight text-glow drop-shadow-lg transition-transform duration-300 hover:scale-105 group brightness-90 hover:brightness-100"
        >
          <span className="gradient-gold bg-clip-text text-transparent animate-gradient">
            CantaBarba
          </span>
          <br />
          <span className="text-white">
            Studio
          </span>
        </h1>
        
        <p className="font-elegant text-xl md:text-2xl text-gold mb-8 italic">
          "La idea es tuya, nosotros hacemos la magia."
        </p>
        
        <p className="font-elegant text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
          Más que un corte, una experiencia completa de arte, relajación y convivencia social. 
          Fundado por la pasión y dedicado a la excelencia.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            variant="default" 
            size="lg" 
            className="gradient-gold text-gold-foreground hover:opacity-90 transition-elegant font-elegant text-lg px-8 py-3 hover:scale-[1.045] focus:scale-[1.045] active:scale-95"
            onClick={scrollToReservas}
            aria-label="Ir a la sección de reservas"
          >
            Reservar Cita
          </Button>
          <Button 
            variant="outline" 
            size="lg" 
            className="border-gold text-gold hover:bg-gold hover:text-gold-foreground transition-elegant font-elegant text-lg px-8 py-3 hover:scale-[1.045] focus:scale-[1.045] active:scale-95"
            onClick={scrollToGaleria}
            aria-label="Ir a la galería"
          >
            Ver Galería
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Hero;