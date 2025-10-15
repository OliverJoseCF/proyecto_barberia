import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import PageTransition from '@/components/ui/PageTransition';
import { 
  ArrowLeft,
  Building2,
  Save,
  Mail,
  Phone,
  MapPin,
  Globe,
  Facebook,
  Instagram,
  MessageCircle,
  Clock,
  Info
} from 'lucide-react';
import { toast } from 'sonner';

const BusinessSettings = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre_negocio: 'CantaBarba Studio',
    eslogan: 'Tu estilo, nuestra pasión',
    telefono: '+52 123 456 7890',
    email: 'contacto@cantabarba.com',
    direccion: 'Av. Principal #123, Col. Centro',
    ciudad: 'Ciudad de México',
    estado: 'CDMX',
    codigo_postal: '01000',
    pais: 'México',
    whatsapp: '+52 123 456 7890',
    facebook: 'https://facebook.com/cantabarba',
    instagram: 'https://instagram.com/cantabarba',
    website: 'https://cantabarba.com',
    descripcion: 'Barbería premium con más de 10 años de experiencia',
    horario_general: 'Lunes a Sábado: 9:00 AM - 8:00 PM',
    politicas_cancelacion: 'Cancelaciones con 24 horas de anticipación',
    terminos_servicio: 'Términos y condiciones del servicio'
  });

  useEffect(() => {
    checkSession();
    cargarConfiguracion();
  }, []);

  const checkSession = () => {
    const userDataString = localStorage.getItem('cantabarba_user');
    if (!userDataString) {
      navigate('/admin/login');
      return;
    }

    const userData = JSON.parse(userDataString);
    if (userData.rol !== 'admin') {
      toast.error('Acceso denegado. Solo administradores.');
      navigate('/admin/dashboard');
      return;
    }
  };

  const cargarConfiguracion = () => {
    // Aquí cargaríamos desde la base de datos
    console.log('Cargando configuración del negocio...');
  };

  const handleGuardar = async () => {
    try {
      setLoading(true);
      
      // Aquí guardaríamos en la base de datos
      console.log('Guardando configuración:', formData);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Configuración guardada correctamente');
    } catch (error) {
      console.error('Error al guardar:', error);
      toast.error('Error al guardar la configuración');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      {/* Header */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-card border-b border-gold/20 sticky top-0 z-50 backdrop-blur-md"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.div whileHover={{ x: -5 }} transition={{ duration: 0.2 }}>
                <Button
                  variant="ghost"
                  onClick={() => navigate('/admin/configuracion')}
                  className="text-gold hover:text-gold/80 font-elegant"
                >
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  Volver
                </Button>
              </motion.div>
              
              <div className="h-8 w-px bg-gold/20" />
              
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Building2 className="h-8 w-8 text-gold" />
                </motion.div>
                <div>
                  <h1 className="font-display text-2xl gradient-gold bg-clip-text text-transparent">
                    Configuración de la Empresa
                  </h1>
                  <p className="font-elegant text-sm text-muted-foreground">
                    Información del negocio y redes sociales
                  </p>
                </div>
              </div>
            </div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={handleGuardar}
                disabled={loading}
                className="gradient-gold text-gold-foreground hover:opacity-90 font-elegant"
              >
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Información Básica */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
          >
            <Card className="glass-effect border-gold/20 hover:border-gold/30 transition-all duration-300">
              <CardHeader>
                <CardTitle className="font-display gradient-gold bg-clip-text text-transparent">
                  Información Básica
                </CardTitle>
                <CardDescription className="font-elegant">
                  Datos principales de tu negocio
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-elegant">Nombre del Negocio</Label>
                  <Input
                    value={formData.nombre_negocio}
                    onChange={(e) => setFormData({...formData, nombre_negocio: e.target.value})}
                    className="font-elegant"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="font-elegant">Eslogan</Label>
                  <Input
                    value={formData.eslogan}
                    onChange={(e) => setFormData({...formData, eslogan: e.target.value})}
                    className="font-elegant"
                    placeholder="Tu frase memorable"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="font-elegant">Descripción</Label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                  className="w-full min-h-[100px] px-3 py-2 rounded-md border border-input bg-background font-elegant text-sm resize-none"
                  placeholder="Describe tu barbería..."
                />
              </div>
            </CardContent>
          </Card>
          </motion.div>

          {/* Contacto */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
          >
            <Card className="glass-effect border-gold/20 hover:border-gold/30 transition-all duration-300">
              <CardHeader>
                <CardTitle className="font-display gradient-gold bg-clip-text text-transparent">
                  Información de Contacto
                </CardTitle>
              </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-elegant flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Teléfono Principal
                  </Label>
                  <Input
                    value={formData.telefono}
                    onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                    className="font-elegant"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="font-elegant flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="font-elegant"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="font-elegant flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp
                </Label>
                <Input
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
                  className="font-elegant"
                  placeholder="+52 123 456 7890"
                />
              </div>
            </CardContent>
          </Card>
          </motion.div>

          {/* Ubicación */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
          >
            <Card className="glass-effect border-gold/20 hover:border-gold/30 transition-all duration-300">
              <CardHeader>
                <CardTitle className="font-display gradient-gold bg-clip-text text-transparent">
                  Ubicación
                </CardTitle>
              </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="font-elegant flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Dirección Completa
                </Label>
                <Input
                  value={formData.direccion}
                  onChange={(e) => setFormData({...formData, direccion: e.target.value})}
                  className="font-elegant"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="font-elegant">Ciudad</Label>
                  <Input
                    value={formData.ciudad}
                    onChange={(e) => setFormData({...formData, ciudad: e.target.value})}
                    className="font-elegant"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="font-elegant">Estado</Label>
                  <Input
                    value={formData.estado}
                    onChange={(e) => setFormData({...formData, estado: e.target.value})}
                    className="font-elegant"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="font-elegant">Código Postal</Label>
                  <Input
                    value={formData.codigo_postal}
                    onChange={(e) => setFormData({...formData, codigo_postal: e.target.value})}
                    className="font-elegant"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          </motion.div>

          {/* Redes Sociales */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
          >
            <Card className="glass-effect border-gold/20 hover:border-gold/30 transition-all duration-300">
              <CardHeader>
                <CardTitle className="font-display gradient-gold bg-clip-text text-transparent">
                  Redes Sociales
                </CardTitle>
              </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="font-elegant flex items-center gap-2">
                  <Facebook className="h-4 w-4" />
                  Facebook
                </Label>
                <Input
                  value={formData.facebook}
                  onChange={(e) => setFormData({...formData, facebook: e.target.value})}
                  className="font-elegant"
                  placeholder="https://facebook.com/tupagina"
                />
              </div>

              <div className="space-y-2">
                <Label className="font-elegant flex items-center gap-2">
                  <Instagram className="h-4 w-4" />
                  Instagram
                </Label>
                <Input
                  value={formData.instagram}
                  onChange={(e) => setFormData({...formData, instagram: e.target.value})}
                  className="font-elegant"
                  placeholder="https://instagram.com/tuperfil"
                />
              </div>

              <div className="space-y-2">
                <Label className="font-elegant flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Sitio Web
                </Label>
                <Input
                  value={formData.website}
                  onChange={(e) => setFormData({...formData, website: e.target.value})}
                  className="font-elegant"
                  placeholder="https://tusitio.com"
                />
              </div>
            </CardContent>
          </Card>
          </motion.div>

          {/* Políticas */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.0, duration: 0.5 }}
            whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
          >
            <Card className="glass-effect border-gold/20 hover:border-gold/30 transition-all duration-300">
              <CardHeader>
                <CardTitle className="font-display gradient-gold bg-clip-text text-transparent">
                  Políticas y Términos
                </CardTitle>
              </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="font-elegant flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Horario General
                </Label>
                <Input
                  value={formData.horario_general}
                  onChange={(e) => setFormData({...formData, horario_general: e.target.value})}
                  className="font-elegant"
                />
              </div>

              <div className="space-y-2">
                <Label className="font-elegant">Políticas de Cancelación</Label>
                <textarea
                  value={formData.politicas_cancelacion}
                  onChange={(e) => setFormData({...formData, politicas_cancelacion: e.target.value})}
                  className="w-full min-h-[80px] px-3 py-2 rounded-md border border-input bg-background font-elegant text-sm resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label className="font-elegant">Términos de Servicio</Label>
                <textarea
                  value={formData.terminos_servicio}
                  onChange={(e) => setFormData({...formData, terminos_servicio: e.target.value})}
                  className="w-full min-h-[80px] px-3 py-2 rounded-md border border-input bg-background font-elegant text-sm resize-none"
                />
              </div>
            </CardContent>
          </Card>
          </motion.div>
        </div>
      </main>
    </PageTransition>
  );
};

export default BusinessSettings;
