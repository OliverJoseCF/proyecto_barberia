import gallery1 from "@/assets/corte1.jpg";
import gallery2 from "@/assets/corte1.jpg";
import gallery3 from "@/assets/angel.jpg";
import { Carousel } from "./Carousel";

const Gallery = () => {
  const carouselSlides = [
    {
      src: gallery1,
      title: "Corte Moderno",
      button: "Ver Más Trabajos"
    },
    {
      src: gallery2,
      title: "Barba Profesional",
      button: "Reservar Cita"
    },
    {
      src: gallery3,
      title: "Afeitado Clásico",
      button: "Conocer Servicios"
    },
    {
      src: gallery1,
      title: "Estilo Personalizado",
      button: "Ver Portfolio"
    },
    {


      src: gallery3,
      title: "Técnicas Avanzadas",
      button: "Agendar Ahora"
    }
    


  ];

  return (
    <section id="galeria" className="py-24 bg-background/85 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-5xl mb-6 gradient-gold bg-clip-text text-transparent text-glow leading-relaxed overflow-visible pb-2">
            Nuestro Trabajo
          </h2>
          <p className="font-elegant text-xl text-muted-foreground max-w-2xl mx-auto">
            Cada cliente es una obra de arte. Descubre la excelencia en cada detalle.
          </p>
        </div>

        <div className="w-full flex justify-center px-2 overflow-x-hidden">
          <div className="max-w-full">
            <Carousel slides={carouselSlides} />
          </div>
        </div>

        <div className="text-center mt-12">
          <p className="font-elegant text-lg text-muted-foreground italic">
            "Cada corte cuenta una historia, cada barba refleja personalidad"
          </p>
        </div>
      </div>
    </section>
  );
};

export default Gallery;