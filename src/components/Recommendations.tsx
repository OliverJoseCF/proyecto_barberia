import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Phone, Calendar, Scissors, AlertCircle, CheckCircle } from "lucide-react";

const Recommendations = () => {
  const recommendations = [
    {
      icon: <Clock className="h-6 w-6" />,
      title: "Llega 10 minutos antes",
      description: "Te recomendamos llegar con anticipación para relajarte y disfrutar de la experiencia completa."
    },
    {
      icon: <Phone className="h-6 w-6" />,
      title: "Confirma tu cita",
      description: "Llama un día antes para confirmar tu reserva y evitar cualquier inconveniente."
    },
    {
      icon: <Calendar className="h-6 w-6" />,
      title: "Cancela con 24h de anticipación",
      description: "Si necesitas cancelar, hazlo con al menos 24 horas de anticipación para dar oportunidad a otros clientes."
    },
    {
      icon: <Scissors className="h-6 w-6" />,
      title: "Trae referencias visuales",
      description: "Si tienes un corte específico en mente, trae fotos de referencia para mejores resultados."
    },
    {
      icon: <CheckCircle className="h-6 w-6" />,
      title: "Cabello limpio",
      description: "Ven con el cabello limpio, esto facilita el trabajo y permite mejores resultados."
    },
    {
      icon: <AlertCircle className="h-6 w-6" />,
      title: "Comunica alergias",
      description: "Informa sobre cualquier alergia a productos o tratamientos antes de iniciar el servicio."
    }
  ];

  return (
  <section id="recomendaciones" className="py-24 bg-section-bg/80 backdrop-blur-sm border-elegant-border/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 fade-in-up">
          <h2 className="font-display text-4xl md:text-5xl mb-6 gradient-gold bg-clip-text text-transparent text-glow leading-relaxed overflow-visible pb-2">
            Recomendaciones para tu Cita
          </h2>
          <p className="font-elegant text-xl text-muted-foreground max-w-2xl mx-auto">
            Para garantizar la mejor experiencia y resultados excepcionales
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations.map((rec, index) => (
            <Card key={index} className="glass-effect hover:border-gold/50 hover:glow-soft transition-elegant group bg-card/40 backdrop-blur-lg">
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 gradient-gold rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-elegant glow-soft">
                  <div className="text-gold-foreground">
                    {rec.icon}
                  </div>
                </div>
                <CardTitle className="font-display text-lg text-foreground">
                  {rec.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="font-elegant text-sm text-muted-foreground leading-relaxed">
                  {rec.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Recommendations;