import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import logoImage from "@/assets/logo.png";
import LetterSwapForward from "./letter-swap-forward-anim";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [show, setShow] = useState(false);
  useEffect(() => {
    setTimeout(() => setShow(true), 100);
  }, []);

  const navItems = [
    { name: "Inicio", href: "#inicio" },
    { name: "Servicios", href: "#servicios" },
    { name: "Galería", href: "#galeria" },
    { name: "El Equipo", href: "#equipo" },
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
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="font-elegant text-foreground hover:text-gold transition-elegant px-3 py-2 text-sm"
                  onClick={(e) => handleNavClick(e, item.href)}
                >
                  <LetterSwapForward 
                    label={item.name}
                    staggerFrom={"center"}
            className="mono"
                  />
                </a>
              ))}
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
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="font-elegant text-foreground hover:text-gold block px-3 py-2 text-base transition-elegant"
                  onClick={(e) => handleNavClick(e, item.href)}
                >
                  <LetterSwapForward 
                    label={item.name}
                    reverse={false}
                    className="font-bold"
                  />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;