import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import PageTransition from '@/components/ui/PageTransition';
import { 
  pageHeaderAnimation,
  cardHoverAnimation,
  buttonHoverAnimation,
  buttonTapAnimation
} from '@/lib/animations';
import { 
  ArrowLeft,
  Settings as SettingsIcon,
  Scissors,
  Clock,
  DollarSign,
  Users,
  Palette,
  Shield,
  Bell,
  Globe,
  Database,
  Calendar,
  FileText,
  Image,
  Tag,
  Info,
  Trash2,
  Gift,
  TrendingUp,
  UserCheck,
  Edit,
  Plus,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface BarberoData {
  nombre: string;
  email: string;
  rol: 'admin' | 'barbero';
}

const AdminSettings = () => {
  const navigate = useNavigate();
  const [barberoLogueado, setBarberoLogueado] = useState<BarberoData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = () => {
    const userDataString = localStorage.getItem('cantabarba_user');
    if (!userDataString) {
      console.log('❌ No hay sesión activa');
      navigate('/admin/login');
      return;
    }

    const userData = JSON.parse(userDataString);
    
    // Verificar que sea administrador
    if (userData.rol !== 'admin') {
      console.log('❌ Acceso denegado: No es administrador');
      toast.error('Acceso denegado. Solo administradores.');
      navigate('/admin/dashboard');
      return;
    }

    console.log('✅ Sesión de administrador activa:', userData);
    setBarberoLogueado(userData);
    setLoading(false);
  };

  const handleGoBack = () => {
    navigate('/admin/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin text-gold text-4xl">⏳</div>
      </div>
    );
  }

  // Opciones de configuración organizadas por categorías
  const configOptions = [
    {
      title: "Servicios",
      description: "Gestiona servicios, precios y duraciones disponibles",
      icon: <Scissors className="h-6 w-6 text-gold" />,
      action: "services",
      category: "Gestión de Servicios",
      badge: "Crítico",
      bgColor: "from-gold/10 to-gold/5"
    },
    {
      title: "Horarios de Trabajo",
      description: "Configura horarios, días festivos e intervalos de citas",
      icon: <Clock className="h-6 w-6 text-blue-500" />,
      action: "schedules",
      category: "Disponibilidad",
      badge: "Crítico",
      bgColor: "from-blue-500/10 to-blue-500/5"
    },
    {
      title: "Barberos",
      description: "Administra el equipo, especialidades y permisos",
      icon: <Users className="h-6 w-6 text-purple-500" />,
      action: "barbers",
      category: "Equipo",
      badge: "Crítico",
      bgColor: "from-purple-500/10 to-purple-500/5"
    },
    {
      title: "Galería",
      description: "Gestiona imágenes de trabajos y portafolio",
      icon: <Image className="h-6 w-6 text-pink-500" />,
      action: "gallery",
      category: "Contenido",
      badge: "Importante",
      bgColor: "from-pink-500/10 to-pink-500/5"
    },
    {
      title: "Información del Negocio",
      description: "Edita datos de contacto, ubicación y redes sociales",
      icon: <Info className="h-6 w-6 text-emerald-500" />,
      action: "business-info",
      category: "Empresa",
      badge: "Crítico",
      bgColor: "from-emerald-500/10 to-emerald-500/5"
    },
    {
      title: "Reportes Avanzados",
      description: "Análisis de ingresos, estadísticas y exportación",
      icon: <FileText className="h-6 w-6 text-cyan-500" />,
      action: "reports",
      category: "Analíticas",
      badge: "Importante",
      bgColor: "from-cyan-500/10 to-cyan-500/5"
    },
    {
      title: "Gestión de Clientes",
      description: "Historial de clientes y base de datos",
      icon: <UserCheck className="h-6 w-6 text-indigo-500" />,
      action: "clients",
      category: "Clientes",
      badge: "Crítico",
      bgColor: "from-indigo-500/10 to-indigo-500/5"
    },
    {
      title: "Configuración de Reservas",
      description: "Políticas de citas, cancelaciones y depósitos",
      icon: <Calendar className="h-6 w-6 text-amber-500" />,
      action: "booking-config",
      category: "Reservas",
      badge: "Crítico",
      bgColor: "from-amber-500/10 to-amber-500/5"
    },
    {
      title: "Notificaciones",
      description: "Configura alertas, recordatorios y mensajes automáticos",
      icon: <Bell className="h-6 w-6 text-orange-500" />,
      action: "notifications",
      category: "Sistema",
      badge: "Importante",
      bgColor: "from-orange-500/10 to-orange-500/5"
    }
  ];

  const getBadgeColor = (badge: string) => {
    const colors = {
      "Crítico": "bg-red-500/20 text-red-500 border-red-500/50",
      "Importante": "bg-yellow-500/20 text-yellow-500 border-yellow-500/50",
      "Opcional": "bg-blue-500/20 text-blue-500 border-blue-500/50"
    };
    return colors[badge as keyof typeof colors] || colors["Opcional"];
  };

  const handleCardClick = (action: string) => {
    const routes: Record<string, string> = {
      'services': '/admin/configuracion/servicios',
      'schedules': '/admin/configuracion/horarios',
      'barbers': '/admin/configuracion/barberos',
      'gallery': '/admin/configuracion/galeria',
      'business-info': '/admin/configuracion/empresa',
      'notifications': '/admin/configuracion/notificaciones',
      'reports': '/admin/configuracion/reportes',
      'clients': '/admin/configuracion/clientes',
      'booking-config': '/admin/configuracion/reservas'
    };

    const route = routes[action];
    if (route) {
      navigate(route);
    } else {
      toast.info(`Funcionalidad "${action}" próximamente`);
    }
  };

  return (
    <PageTransition>
      {/* Header */}
      <motion.header
        {...pageHeaderAnimation}
        className="bg-card border-b border-gold/20 sticky top-0 z-50 backdrop-blur-md"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="flex items-center gap-4"
            >
              <Button
                variant="ghost"
                onClick={handleGoBack}
                className="text-gold hover:text-gold/80 font-elegant"
                asChild
              >
                <motion.button
                  whileHover={{ x: -5 }}
                  transition={{ duration: 0.2 }}
                >
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  Volver
                </motion.button>
              </Button>
              
              <div className="h-8 w-px bg-gold/20" />
              
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                  <SettingsIcon className="h-8 w-8 text-gold" />
                </motion.div>
                <div>
                  <h1 className="font-display text-2xl gradient-gold bg-clip-text text-transparent">
                    Configuración del Sistema
                  </h1>
                  <p className="font-elegant text-sm text-muted-foreground">
                    Panel de control administrativo de CantaBarba Studio
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="flex items-center gap-3"
            >
              <div className="text-right">
                <p className="font-elegant text-sm text-muted-foreground">Administrador</p>
                <p className="font-display text-gold">{barberoLogueado?.nombre}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center">
                <Shield className="h-5 w-5 text-gold" />
              </div>
            </motion.div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Mensaje de bienvenida */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-8"
        >
          <Card className="glass-effect border-gold/20 bg-gradient-to-r from-gold/5 to-transparent">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-full bg-gold/20">
                  <Info className="h-6 w-6 text-gold" />
                </div>
                <div>
                  <h2 className="font-display text-lg text-gold mb-2">
                    Bienvenido al Centro de Configuración
                  </h2>
                  <p className="font-elegant text-muted-foreground text-sm leading-relaxed">
                    Desde aquí puedes controlar todos los aspectos de tu barbería sin necesidad de tocar código. 
                    Cada sección te permite modificar diferentes elementos del sistema de forma intuitiva y segura.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Secciones de configuración */}
        <div className="space-y-6">
          {/* Stats Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="glass-effect border-gold/20">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-gold/20">
                      <SettingsIcon className="h-6 w-6 text-gold" />
                    </div>
                    <div>
                      <p className="text-sm font-elegant text-muted-foreground">Total Opciones</p>
                      <p className="text-2xl font-display text-gold">{configOptions.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-effect border-red-500/20">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-red-500/20">
                      <AlertCircle className="h-6 w-6 text-red-500" />
                    </div>
                    <div>
                      <p className="text-sm font-elegant text-muted-foreground">Críticas</p>
                      <p className="text-2xl font-display text-red-500">
                        {configOptions.filter(c => c.badge === 'Crítico').length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-effect border-yellow-500/20">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-yellow-500/20">
                      <TrendingUp className="h-6 w-6 text-yellow-500" />
                    </div>
                    <div>
                      <p className="text-sm font-elegant text-muted-foreground">Importantes</p>
                      <p className="text-2xl font-display text-yellow-500">
                        {configOptions.filter(c => c.badge === 'Importante').length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>

          {/* Grid de opciones */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {configOptions.map((option, index) => (
              <motion.div
                key={option.action}
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.1 * index, duration: 0.3 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <Card 
                  className={`glass-effect border-gold/20 cursor-pointer hover:border-gold/40 transition-all duration-300 h-full bg-gradient-to-br ${option.bgColor} hover:shadow-xl hover:shadow-gold/10`}
                  onClick={() => handleCardClick(option.action)}
                >
                  <CardHeader className="space-y-4">
                    <div className="flex items-start justify-between">
                      <motion.div 
                        className="p-3 rounded-lg bg-background/50 backdrop-blur-sm"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ duration: 0.2 }}
                      >
                        {option.icon}
                      </motion.div>
                      <span className={`px-3 py-1 rounded-full text-xs font-elegant ${getBadgeColor(option.badge)}`}>
                        {option.badge}
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      <CardTitle className="font-display text-xl group-hover:text-gold transition-colors">
                        {option.title}
                      </CardTitle>
                      <CardDescription className="font-elegant text-sm leading-relaxed">
                        {option.description}
                      </CardDescription>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between text-xs font-elegant text-muted-foreground">
                      <span>{option.category}</span>
                      <ArrowLeft className="h-4 w-4 text-gold rotate-180" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Acciones rápidas adicionales */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.5 }}
          className="mt-12"
        >
          <Card className="glass-effect border-red-500/20 bg-gradient-to-r from-red-500/5 to-transparent">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-500/20">
                  <Shield className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <CardTitle className="font-display text-lg text-red-500">
                    Zona de Peligro
                  </CardTitle>
                  <CardDescription className="font-elegant text-sm">
                    Acciones críticas que requieren confirmación
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    variant="outline"
                    className="w-full border-red-500/50 text-red-500 hover:bg-red-500/10 font-elegant"
                    onClick={() => toast.warning('Funcionalidad de respaldo próximamente')}
                  >
                    <Database className="h-4 w-4 mr-2" />
                    Restaurar Base de Datos
                  </Button>
                </motion.div>
                
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    variant="outline"
                    className="w-full border-red-500/50 text-red-500 hover:bg-red-500/10 font-elegant"
                    onClick={() => toast.warning('Funcionalidad de limpieza próximamente')}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Limpiar Datos Antiguos
                  </Button>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </PageTransition>
  );
};

export default AdminSettings;
