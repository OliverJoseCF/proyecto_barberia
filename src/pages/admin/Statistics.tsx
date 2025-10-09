import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Scissors } from 'lucide-react';
import { motion } from 'framer-motion';
import { AnalyticsDashboard } from '@/components/AnalyticsDashboard';
import PageTransition from '@/components/ui/PageTransition';

interface BarberoData {
  nombre: string;
  email: string;
  rol: 'admin' | 'barbero';
}

const Statistics = () => {
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(window.location.search);
  const demoMode = searchParams.get('demo') === 'true';
  const demoRole = searchParams.get('role') as 'admin' | 'barbero' || 'admin';
  const [loading, setLoading] = useState(true);
  const [barberoData, setBarberoData] = useState<BarberoData | null>(null);

  useEffect(() => {
    if (demoMode) {
      setBarberoData({
        nombre: demoRole === 'admin' ? 'Oliver José' : 'Emiliano Vega',
        email: demoRole === 'admin' ? 'admin@cantabarba.com' : 'emiliano@cantabarba.com',
        rol: demoRole
      });
      setLoading(false);
    } else {
      navigate('/admin/login');
    }
  }, [demoMode, demoRole, navigate]);

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
        className="bg-card border-b border-gold/20 sticky top-0 z-50 backdrop-blur-md"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                onClick={() => navigate(demoMode ? `/admin/dashboard?demo=true&role=${demoRole}` : '/admin/dashboard')}
                className="text-gold hover:text-gold/80"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <Scissors className="h-8 w-8 text-gold" />
              <div>
                <h1 className="font-display text-2xl gradient-gold bg-clip-text text-transparent">
                  Estadisticas {demoMode && '✨'}
                </h1>
                <p className="font-elegant text-sm text-muted-foreground">
                  {demoMode ? (
                    <span className="text-gold font-semibold">
                      🎭 MODO DEMO - {barberoData?.nombre} ({barberoData?.rol === 'admin' ? 'Fundador/Admin' : 'Barbero'})
                    </span>
                  ) : barberoData ? (
                    <span>
                      {barberoData.nombre} - {barberoData.rol === 'admin' ? 'Análisis completo' : 'Mi desempeño'}
                    </span>
                  ) : (
                    'Métricas avanzadas y configuración'
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard de Analytics Avanzado */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <AnalyticsDashboard />
        </motion.div>
      </main>
    </PageTransition>
  );
};

export default Statistics;