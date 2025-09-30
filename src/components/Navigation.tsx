import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import logoImage from "@/assets/logo.png";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [show, setShow] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("inicio");
  useEffect(() => {
    setTimeout(() => setShow(true), 100);

    // Escucha scroll para detectar sección activa
    const handleScroll = () => {
      const sectionIds = navItems.map(item => item.href.replace('#', ''));
      let current = sectionIds[0];
      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 120 && rect.bottom > 120) {
            current = id;
            break;
          }
        }
      }
      setActiveSection(current);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: "Inicio", href: "#inicio" },
    { name: "Servicios", href: "#servicios" },
    { name: "Galería", href: "#galeria" },
    { name: "Equipo", href: "#equipo" },
    { name: "Contacto", href: "#contacto" },
    { name: "Reservas", href: "#reservas" },
  ];

  // Scroll suave a la sección
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const id = href.replace('#', '');
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
    setIsOpen(false); // Cierra el menú móvil si está abierto
  };

  return (
    <nav className={`fixed top-0 w-full z-50 glass-effect border-b border-elegant-border/30 bg-background/70 backdrop-blur-lg transition-opacity duration-1000 ease-out ${show ? 'opacity-100' : 'opacity-0'}`}>
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
                    className={`font-elegant relative px-3 py-1 text-base rounded-md border border-transparent transition-all duration-150 after:absolute after:left-1/2 after:-translate-x-1/2 after:bottom-0 after:w-0 after:h-[2px] after:bg-gold after:rounded-full after:transition-all after:duration-200 hover:text-gold focus:text-gold active:text-gold hover:after:w-2/3 hover:after:opacity-100 after:opacity-0 ${isActive ? 'text-gold after:w-2/3 after:opacity-100' : 'text-foreground'}`}
                    onClick={(e) => handleNavClick(e, item.href)}
                    style={{overflow: 'visible'}}
                  >
                    <span className="relative z-10 font-medium tracking-wide">
                      {item.name}
                    </span>
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
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navItems.map((item) => {
                const isActive = activeSection === item.href.replace('#', '');
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    className={`font-elegant relative block px-3 py-2 text-base rounded-md border border-transparent transition-all duration-150 mb-2 after:absolute after:left-1/2 after:-translate-x-1/2 after:bottom-0 after:w-0 after:h-[2px] after:bg-gold after:rounded-full after:transition-all after:duration-200 hover:text-gold focus:text-gold active:text-gold hover:after:w-2/3 hover:after:opacity-100 after:opacity-0 ${isActive ? 'text-gold after:w-2/3 after:opacity-100' : 'text-foreground'}`}
                    onClick={(e) => handleNavClick(e, item.href)}
                    style={{overflow: 'visible'}}
                  >
                    <span className="relative z-10 font-medium tracking-wide">
                      {item.name}
                    </span>
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;