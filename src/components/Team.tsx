import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, Star, Heart } from "lucide-react";
import angelImage from "@/assets/angel.jpg";
import marcoImage from "@/assets/emiliano.jpg";

const Team = () => {
  const teamMembers = [
    {
      name: "Ángel Ramírez",
      title: "Fundador & Master Barber",
      slogan: "La perfección está en los detalles",
      specialization: "Especialista en cortes clásicos y modernos",
      experience: "8+ años de experiencia",
      personality: "Apasionado por el arte de la barbería, combina técnicas tradicionales con tendencias modernas. Su filosofía: cada cliente merece una experiencia única.",
      image: angelImage
    },
    {
      name: "Emiliano Vega",
      title: "Senior Barber",
      slogan: "El estilo es una forma de expresión",
      specialization: "Experto en diseños capilares y coloración",
      experience: "5+ años de experiencia",
      personality: "Creativo y detallista, se especializa en transformaciones audaces. Su pasión por el arte se refleja en cada corte que realiza.",
      image: marcoImage
    }
  ];

  return (
    <section id="equipo" className="py-24 bg-section-bg/80 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-5xl mb-6 gradient-gold bg-clip-text text-transparent text-glow leading-relaxed overflow-visible pb-2">
            Nuestro Equipo
          </h2>
          <p className="font-elegant text-xl text-muted-foreground max-w-2xl mx-auto">
            Artistas dedicados que transforman tu visión en realidad
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {teamMembers.map((member, index) => (
            <Card key={index} className="glass-effect hover:border-gold/50 transition-elegant group">
              <CardHeader className="text-center">
                <div className="mx-auto w-24 h-24 rounded-full overflow-hidden mb-4 group-hover:scale-110 transition-elegant border-2 border-gold/30">
                  <img 
                    src={member.image} 
                    alt={`${member.name} - ${member.title}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardTitle className="font-display text-2xl text-foreground mb-2">
                  {member.name}
                </CardTitle>
                <CardDescription className="font-elegant text-gold text-lg mb-2">
                  {member.title}
                </CardDescription>
                <p className="font-elegant text-gold italic text-sm">
                  "{member.slogan}"
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <Heart className="h-5 w-5 text-gold mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-elegant font-semibold text-foreground text-sm">Especialización</p>
                      <p className="font-elegant text-muted-foreground text-sm">{member.specialization}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <Star className="h-5 w-5 text-gold mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-elegant font-semibold text-foreground text-sm">Experiencia</p>
                      <p className="font-elegant text-muted-foreground text-sm">{member.experience}</p>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-elegant-border/30">
                  <p className="font-elegant text-muted-foreground text-sm leading-relaxed">
                    {member.personality}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-16">
          <p className="font-elegant text-lg text-muted-foreground italic max-w-3xl mx-auto">
            "En CantaBarba Studio, no solo cortamos cabello. Creamos experiencias únicas 
            donde el arte, la técnica y la pasión se combinan para realzar tu personalidad."
          </p>
        </div>
      </div>
    </section>
  );
};

export default Team;