import { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import logoImage from "@/assets/logo1.jpg";
import LetterSwapForward from "./letter-swap-forward-anim";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [show, setShow] = useState(false);
  const [activeSection, setActiveSection] = useState("inicio");
  const [isScrolling, setIsScrolling] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Memoizar navItems para evitar recreación
  const navItems = useMemo(() => [
    { name: "Inicio", href: "#inicio" },
    { name: "Servicios", href: "#servicios" },
    { name: "Galería", href: "#galeria" },
    { name: "Equipo", href: "#equipo" },
    { name: "Contacto", href: "#contacto" },
    { name: "Reservas", href: "#reservas" },
  ], []);

  // Memoizar handleNavClick
  const handleNavClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const id = href.replace('#', '');
    const section = document.getElementById(id);
    if (section) {
      // 1. PRIMERO: Bloquear el observer
      setIsScrolling(true);
      
      // 2. SEGUNDO: Cambiar la sección activa inmediatamente
      setActiveSection(id);
      
      // 3. TERCERO: Hacer el scroll
      section.scrollIntoView({ behavior: 'smooth' });
      
      // 4. CUARTO: Desbloquear el observer después de que termine el scroll
      setTimeout(() => {
        setIsScrolling(false);
      }, 1200);
    }
    setIsOpen(false);
  }, []);
  
  useEffect(() => {
    const timer = setTimeout(() => setShow(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Detectar dirección del scroll
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY < 10) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
        setIsOpen(false);
      } else if (currentScrollY < lastScrollY) {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Detectar la sección visible
  useEffect(() => {
    const sections = document.querySelectorAll("section[id]");
    
    const observerOptions = {
      root: null,
      rootMargin: "-20% 0px -70% 0px",
      threshold: 0,
    };

    const observer = new IntersectionObserver((entries) => {
      if (isScrolling) {
        return;
      }
      
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    }, observerOptions);

    sections.forEach((section) => observer.observe(section));

    return () => {
      sections.forEach((section) => observer.unobserve(section));
    };
  }, [isScrolling]);

  return (
    <nav className={`fixed top-0 w-full z-50 glass-effect border-b border-elegant-border/30 bg-background/70 backdrop-blur-lg transition-all duration-300 ease-in-out ${
      show ? 'opacity-100' : 'opacity-0'
    } ${
      isVisible ? 'translate-y-0' : '-translate-y-full'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <div className="flex items-center space-x-3">
              <img 
                src={logoImage} 
                alt="CantaBarba Studio Logo" 
                className="h-10 w-10 glow-soft"
              />
              <h1 className="font-display text-2xl gradient-gold bg-clip-text text-transparent text-glow">
                CantaBarba Studio
              </h1>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {navItems.map((item) => {
                const isActive = activeSection === item.href.replace('#', '');
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    className={`font-elegant transition-elegant px-3 py-2 text-sm relative ${
                      isActive 
                        ? 'text-gold' 
                        : 'text-foreground hover:text-gold'
                    }`}
                    onClick={(e) => handleNavClick(e, item.href)}
                  >
                    <LetterSwapForward 
                      label={item.name}
                      staggerFrom={"center"}
                      className="mono"
                    />
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-gold to-transparent"></span>
                    )}
                  </a>
                );
              })}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
              className="text-foreground hover:text-gold"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div 
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map((item, index) => {
              const isActive = activeSection === item.href.replace('#', '');
              return (
                <a
                  key={item.name}
                  href={item.href}
                  className={`font-elegant block px-3 py-2 text-base transition-all duration-300 relative transform ${
                    isActive 
                      ? 'text-gold bg-gold/10' 
                      : 'text-foreground hover:text-gold hover:bg-gold/5'
                  } ${
                    isOpen 
                      ? 'translate-x-0 opacity-100' 
                      : '-translate-x-4 opacity-0'
                  }`}
                  style={{
                    transitionDelay: isOpen ? `${index * 50}ms` : '0ms'
                  }}
                  onClick={(e) => handleNavClick(e, item.href)}
                >
                  <LetterSwapForward 
                    label={item.name}
                    reverse={false}
                    className="font-bold"
                  />
                  {isActive && (
                    <span className="absolute left-0 top-0 bottom-0 w-1 bg-gold rounded-r"></span>
                  )}
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;