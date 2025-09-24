import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Phone, MapPin, Clock, Instagram, Facebook, Twitter } from "lucide-react";

const Contact = () => {
  return (
    <section id="contacto" className="py-24 bg-background/85 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-5xl mb-6 gradient-gold bg-clip-text text-transparent text-glow leading-relaxed overflow-visible pb-2">
            Contáctanos
          </h2>
          <p className="font-elegant text-xl text-muted-foreground max-w-2xl mx-auto">
            Estamos aquí para hacer realidad tu próximo estilo. Contáctanos y agenda tu cita.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="glass-effect">
              <CardHeader>
                <CardTitle className="font-display text-xl text-gold flex items-center space-x-3">
                  <Phone className="h-6 w-6" />
                  <span>Teléfono</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-elegant text-foreground text-lg">Angel +52 (555) 123-4567</p>
                <p className="font-elegant text-foreground text-lg">Emiliano +52 (555) 123-4567</p>
                <p className="font-elegant text-muted-foreground text-sm mt-2">
                  Llámanos para agendar tu cita
                </p>
              </CardContent>
            </Card>

            <Card className="glass-effect">
              <CardHeader>
                <CardTitle className="font-display text-xl text-gold flex items-center space-x-3">
                  <MapPin className="h-6 w-6" />
                  <span>Ubicación</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-elegant text-foreground">
                  Av. Hidalgo 39<br />
                  Col. Atequiza Centro<br />
                  C.P. 45860
                </p>
                <Button 
                  variant="elegant"
                  size="sm" 
                  className="mt-3"
                  onClick={() => window.open('https://maps.app.goo.gl/aivgyU38bAkj2f6YA', '_blank')}
                >
                  Ver en Google Maps
                </Button>
              </CardContent>
            </Card>

            <Card className="glass-effect">
              <CardHeader>
                <CardTitle className="font-display text-xl text-gold flex items-center space-x-3">
                  <Clock className="h-6 w-6" />
                  <span>Horarios</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-elegant text-muted-foreground">Lun - Vie</span>
                  <span className="font-elegant text-foreground">9:00 - 20:00</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-elegant text-muted-foreground">Sábados</span>
                  <span className="font-elegant text-foreground">9:00 - 18:00</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-elegant text-muted-foreground">Domingos</span>
                  <span className="font-elegant text-foreground">10:00 - 16:00</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Interactive Map */}
          <div className="lg:col-span-2">
            <Card className="glass-effect h-full">
              <CardContent className="p-0 h-full min-h-[400px]">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3739.707378183242!2d-103.1362642!3d20.3949516!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x842f396d72800ef3%3A0x33866592b8d0bc85!2sCantaBarba%20Studio!5e0!3m2!1ses-419!2smx!4v1758430356852!5m2!1ses-419!2smx"
                  width="100%"
                  height="100%"
                  style={{ border: 0, borderRadius: '0.75rem' }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="CantaBarba Studio Location"
                />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Social Media */}
        <div className="mt-16 text-center">
          <h3 className="font-display text-2xl text-gold mb-6">Síguenos en Redes</h3>
          <div className="flex justify-center space-x-6">
            <Button 
              variant="elegant"
              size="lg" 
              className="p-4"
              onClick={() => window.open('https://instagram.com', '_blank')}
            >
              <Instagram className="h-6 w-6" />
            </Button>
            <Button 
              variant="elegant"
              size="lg" 
              className="p-4"
              onClick={() => window.open('https://facebook.com', '_blank')}
            >
              <Facebook className="h-6 w-6" />
            </Button>
            <Button 
              variant="elegant"
              size="lg" 
              className="p-4"
              onClick={() => window.open('https://twitter.com', '_blank')}
            >
              <Twitter className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;