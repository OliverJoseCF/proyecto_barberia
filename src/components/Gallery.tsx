import gallery1 from "@/assets/corte1.jpg";
import gallery2 from "@/assets/corte1.jpg";
import gallery3 from "@/assets/angel.jpg";

const Gallery = () => {
  const galleryItems = [
    {
      image: gallery1,
      title: "Corte Moderno",
      description: "Transformación completa con técnicas avanzadas"
    },
    {
      image: gallery2,
      title: "Barba Profesional",
      description: "Definición y estilizado de barba premium"
    },
    {
      image: gallery3,
      title: "Afeitado Clásico",
      description: "Experiencia tradicional con navaja"
    },
    {
      image: gallery3,
      title: "Afeitado Clásico",
      description: "Experiencia tradicional con navaja"
    },
    {
      image: gallery1,
      title: "Corte Moderno",
      description: "Transformación completa con técnicas avanzadas"
    },
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {galleryItems.map((item, index) => (
            <div key={index} className="group relative overflow-hidden rounded-lg bg-card">
              <div className="aspect-[4/5] overflow-hidden">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-hero-bg/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-elegant">
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="font-display text-2xl text-gold mb-2">
                    {item.title}
                  </h3>
                  <p className="font-elegant text-foreground">
                    {item.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
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