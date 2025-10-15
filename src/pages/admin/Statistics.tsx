import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Scissors } from 'lucide-react';
import { motion } from 'framer-motion';
import { AnalyticsDashboard } from '@/components/AnalyticsDashboard';
import PageTransition from '@/components/ui/PageTransition';
import { 
  pageHeaderAnimation,
  backButtonAnimation
} from '@/lib/animations';

interface BarberoData {
  nombre: string;
  email: string;
  rol: 'admin' | 'barbero';
}

const Statistics = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [barberoData, setBarberoData] = useState<BarberoData | null>(null);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = () => {
    const userDataString = localStorage.getItem('cantabarba_user');
    if (!userDataString) {
      navigate('/admin/login');
      return;
    }

    const userData = JSON.parse(userDataString);
    setBarberoData({
      nombre: userData.nombre,
      email: userData.email,
      rol: userData.rol || 'barbero'
    });
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin text-gold text-4xl">⏳</div>
      </div>
    );
  }

  return (
    <PageTransition>
      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-card border-b border-gold/20 sticky top-0 z-50 backdrop-blur-md"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <motion.div 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.3 }}
              className="flex items-center gap-3"
            >
              <motion.div {...backButtonAnimation}>
                <Button
                  variant="ghost"
                  onClick={() => navigate('/admin/dashboard')}
                  className="text-gold hover:text-gold/80"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </motion.div>
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <Scissors className="h-8 w-8 text-gold" />
              </motion.div>
              <div>
                <h1 className="font-display text-2xl gradient-gold bg-clip-text text-transparent">
                  Estadísticas
                </h1>
                <p className="font-elegant text-sm text-muted-foreground">
                  {barberoData ? (
                    <span>
                      {barberoData.nombre} - {barberoData.rol === 'admin' ? 'Análisis completo' : 'Mi desempeño'}
                    </span>
                  ) : (
                    'Métricas avanzadas y configuración'
                  )}
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard de Analytics Avanzado */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <AnalyticsDashboard 
            barberoNombre={barberoData.nombre}
            rol={barberoData.rol}
          />
        </motion.div>
      </main>
    </PageTransition>
  );
};

export default Statistics;