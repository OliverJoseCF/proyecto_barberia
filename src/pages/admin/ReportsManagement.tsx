import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import PageTransition from '@/components/ui/PageTransition';
import { ArrowLeft, FileText, Download, Calendar, DollarSign, Users, TrendingUp, FileBarChart } from 'lucide-react';
import { toast } from 'sonner';

const ReportsManagement = () => {
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedBarbero, setSelectedBarbero] = useState('all');

  useEffect(() => {
    const userData = localStorage.getItem('cantabarba_user');
    if (!userData || JSON.parse(userData).rol !== 'admin') navigate('/admin/login');
    
    // Establecer rango de última semana por defecto
    const hoy = new Date();
    const semanaAtras = new Date(hoy);
    semanaAtras.setDate(hoy.getDate() - 7);
    setStartDate(semanaAtras.toISOString().split('T')[0]);
    setEndDate(hoy.toISOString().split('T')[0]);
  }, []);

  const generarReporte = (tipo: string) => {
    toast.success(`Generando reporte de ${tipo}...`);
    // Aquí se implementará la lógica de generación
  };

  const exportarPDF = (tipo: string) => {
    toast.success(`Exportando ${tipo} a PDF...`);
  };

  const exportarExcel = (tipo: string) => {
    toast.success(`Exportando ${tipo} a Excel...`);
  };

  return (
    <PageTransition>
      <motion.header initial={{ y: -100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-card border-b border-gold/20 sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.div whileHover={{ x: -5 }} transition={{ duration: 0.2 }}>
                <Button variant="ghost" onClick={() => navigate('/admin/configuracion')} className="text-gold">
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  Volver
                </Button>
              </motion.div>
              <div className="h-8 w-px bg-gold/20" />
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ 
                    rotate: 360,
                  }}
                  transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                >
                  <FileBarChart className="h-8 w-8 text-gold" />
                </motion.div>
                <div>
                  <h1 className="font-display text-2xl gradient-gold bg-clip-text text-transparent">
                    Reportes Avanzados
                  </h1>
                  <p className="font-elegant text-sm text-muted-foreground">
                    Genera y exporta análisis detallados
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Card className="glass-effect border-gold/20 mb-8 hover:border-gold/30 transition-all duration-300">
          <CardHeader>
            <CardTitle className="font-display gradient-gold bg-clip-text text-transparent">
              Filtros de Reporte
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="font-elegant">Fecha Inicio</Label>
                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="font-elegant" />
              </div>
              <div className="space-y-2">
                <Label className="font-elegant">Fecha Fin</Label>
                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="font-elegant" />
              </div>
              <div className="space-y-2">
                <Label className="font-elegant">Barbero</Label>
                <select value={selectedBarbero} onChange={(e) => setSelectedBarbero(e.target.value)} className="w-full px-3 py-2 rounded-md border border-input bg-background font-elegant">
                  <option value="all">Todos</option>
                  <option value="1">Carlos Méndez</option>
                  <option value="2">Luis Hernández</option>
                  <option value="3">Juan Pérez</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.3, duration: 0.5 }}
            whileHover={{ y: -5, scale: 1.01, transition: { duration: 0.2 } }}
          >
            <Card className="glass-effect border-gold/20 h-full hover:border-gold/40 hover:shadow-xl hover:shadow-gold/10 transition-all duration-300">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <DollarSign className="h-8 w-8 text-green-500" />
                  <div>
                    <CardTitle className="font-display text-xl gradient-gold bg-clip-text text-transparent">
                      Reporte de Ingresos
                    </CardTitle>
                    <p className="font-elegant text-sm text-muted-foreground mt-1">
                      Análisis completo de ventas y facturación
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button onClick={() => generarReporte('Ingresos')} className="w-full gradient-gold text-gold-foreground font-elegant">
                  <FileText className="h-4 w-4 mr-2" />
                  Generar Reporte
                </Button>
                <div className="flex gap-2">
                  <Button onClick={() => exportarPDF('Ingresos')} variant="outline" className="flex-1 font-elegant">
                    <Download className="h-4 w-4 mr-2" />
                    PDF
                  </Button>
                  <Button onClick={() => exportarExcel('Ingresos')} variant="outline" className="flex-1 font-elegant">
                    <Download className="h-4 w-4 mr-2" />
                    Excel
                  </Button>
                </div>
                <div className="p-3 bg-card/50 rounded-lg border border-gold/10">
                  <p className="font-elegant text-xs text-muted-foreground">
                    Incluye: Total facturado, gráficas de tendencias, comparativo por período, métodos de pago
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.4, duration: 0.5 }}
            whileHover={{ y: -5, scale: 1.01, transition: { duration: 0.2 } }}
          >
            <Card className="glass-effect border-gold/20 h-full hover:border-gold/40 hover:shadow-xl hover:shadow-gold/10 transition-all duration-300">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Calendar className="h-8 w-8 text-blue-500" />
                  <div>
                    <CardTitle className="font-display text-xl gradient-gold bg-clip-text text-transparent">
                      Reporte de Citas
                    </CardTitle>
                    <p className="font-elegant text-sm text-muted-foreground mt-1">
                      Estadísticas de reservaciones y ocupación
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button onClick={() => generarReporte('Citas')} className="w-full gradient-gold text-gold-foreground font-elegant">
                  <FileText className="h-4 w-4 mr-2" />
                  Generar Reporte
                </Button>
                <div className="flex gap-2">
                  <Button onClick={() => exportarPDF('Citas')} variant="outline" className="flex-1 font-elegant">
                    <Download className="h-4 w-4 mr-2" />
                    PDF
                  </Button>
                  <Button onClick={() => exportarExcel('Citas')} variant="outline" className="flex-1 font-elegant">
                    <Download className="h-4 w-4 mr-2" />
                    Excel
                  </Button>
                </div>
                <div className="p-3 bg-card/50 rounded-lg border border-gold/10">
                  <p className="font-elegant text-xs text-muted-foreground">
                    Incluye: Total citas, confirmadas vs canceladas, horarios más solicitados, días pico
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.5, duration: 0.5 }}
            whileHover={{ y: -5, scale: 1.01, transition: { duration: 0.2 } }}
          >
            <Card className="glass-effect border-gold/20 h-full hover:border-gold/40 hover:shadow-xl hover:shadow-gold/10 transition-all duration-300">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Users className="h-8 w-8 text-purple-500" />
                  <div>
                    <CardTitle className="font-display text-xl gradient-gold bg-clip-text text-transparent">
                      Reporte de Clientes
                    </CardTitle>
                    <p className="font-elegant text-sm text-muted-foreground mt-1">
                      Análisis de base de clientes y fidelización
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button onClick={() => generarReporte('Clientes')} className="w-full gradient-gold text-gold-foreground font-elegant">
                  <FileText className="h-4 w-4 mr-2" />
                  Generar Reporte
                </Button>
                <div className="flex gap-2">
                  <Button onClick={() => exportarPDF('Clientes')} variant="outline" className="flex-1 font-elegant">
                    <Download className="h-4 w-4 mr-2" />
                    PDF
                  </Button>
                  <Button onClick={() => exportarExcel('Clientes')} variant="outline" className="flex-1 font-elegant">
                    <Download className="h-4 w-4 mr-2" />
                    Excel
                  </Button>
                </div>
                <div className="p-3 bg-card/50 rounded-lg border border-gold/10">
                  <p className="font-elegant text-xs text-muted-foreground">
                    Incluye: Nuevos clientes, clientes frecuentes, valor promedio, tasa de retención
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.6, duration: 0.5 }}
            whileHover={{ y: -5, scale: 1.01, transition: { duration: 0.2 } }}
          >
            <Card className="glass-effect border-gold/20 h-full hover:border-gold/40 hover:shadow-xl hover:shadow-gold/10 transition-all duration-300">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-8 w-8 text-orange-500" />
                  <div>
                    <CardTitle className="font-display text-xl gradient-gold bg-clip-text text-transparent">
                      Reporte de Servicios
                    </CardTitle>
                    <p className="font-elegant text-sm text-muted-foreground mt-1">
                      Performance y popularidad de servicios
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button onClick={() => generarReporte('Servicios')} className="w-full gradient-gold text-gold-foreground font-elegant">
                  <FileText className="h-4 w-4 mr-2" />
                  Generar Reporte
                </Button>
                <div className="flex gap-2">
                  <Button onClick={() => exportarPDF('Servicios')} variant="outline" className="flex-1 font-elegant">
                    <Download className="h-4 w-4 mr-2" />
                    PDF
                  </Button>
                  <Button onClick={() => exportarExcel('Servicios')} variant="outline" className="flex-1 font-elegant">
                    <Download className="h-4 w-4 mr-2" />
                    Excel
                  </Button>
                </div>
                <div className="p-3 bg-card/50 rounded-lg border border-gold/10">
                  <p className="font-elegant text-xs text-muted-foreground">
                    Incluye: Servicios más vendidos, ingresos por servicio, duración promedio, ranking
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mt-6">
          <Card className="glass-effect border-gold/20">
            <CardHeader>
              <CardTitle className="font-display gradient-gold bg-clip-text text-transparent">
                Vista Previa de Datos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-card/50 rounded-lg border border-gold/10 text-center">
                  <div className="text-3xl font-display gradient-gold bg-clip-text text-transparent mb-1">
                    $15,240
                  </div>
                  <p className="font-elegant text-sm text-muted-foreground">Ingresos Período</p>
                </div>
                <div className="p-4 bg-card/50 rounded-lg border border-gold/10 text-center">
                  <div className="text-3xl font-display text-blue-500 mb-1">
                    127
                  </div>
                  <p className="font-elegant text-sm text-muted-foreground">Citas Totales</p>
                </div>
                <div className="p-4 bg-card/50 rounded-lg border border-gold/10 text-center">
                  <div className="text-3xl font-display text-purple-500 mb-1">
                    89
                  </div>
                  <p className="font-elegant text-sm text-muted-foreground">Clientes Únicos</p>
                </div>
                <div className="p-4 bg-card/50 rounded-lg border border-gold/10 text-center">
                  <div className="text-3xl font-display text-orange-500 mb-1">
                    94%
                  </div>
                  <p className="font-elegant text-sm text-muted-foreground">Ocupación</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </PageTransition>
  );
};

export default ReportsManagement;
