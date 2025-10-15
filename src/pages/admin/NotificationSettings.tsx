import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import PageTransition from '@/components/ui/PageTransition';
import { ArrowLeft, Bell, MessageCircle, Mail, Save, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const NotificationSettings = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState({
    whatsapp_enabled: true,
    whatsapp_api_key: '',
    whatsapp_recordatorio_24h: true,
    whatsapp_recordatorio_2h: true,
    whatsapp_confirmacion: true,
    email_enabled: true,
    email_recordatorio: true,
    email_confirmacion: true,
    email_cancelacion: true,
    sms_enabled: false,
    sms_api_key: '',
    notif_nueva_cita: true,
    notif_cancelacion: true,
    notif_modificacion: true
  });

  useEffect(() => {
    const userData = localStorage.getItem('cantabarba_user');
    if (!userData || JSON.parse(userData).rol !== 'admin') {
      navigate('/admin/login');
    }
  }, []);

  const handleGuardar = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success('Configuración de notificaciones guardada');
    setLoading(false);
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
                    rotate: [0, 15, -15, 15, 0],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    repeatDelay: 4,
                    ease: "easeInOut"
                  }}
                >
                  <Bell className="h-8 w-8 text-gold" />
                </motion.div>
                <div>
                  <h1 className="font-display text-2xl gradient-gold bg-clip-text text-transparent">
                    Sistema de Notificaciones
                  </h1>
                  <p className="font-elegant text-sm text-muted-foreground">
                    Configura alertas y recordatorios automáticos
                  </p>
                </div>
              </div>
            </div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button onClick={handleGuardar} disabled={loading} className="gradient-gold text-gold-foreground font-elegant">
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Guardando...' : 'Guardar'}
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
        >
          <Card className="glass-effect border-gold/20 hover:border-gold/30 transition-all duration-300">
          <CardHeader>
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-green-500" />
              <CardTitle className="font-display gradient-gold bg-clip-text text-transparent">
                WhatsApp
              </CardTitle>
            </div>
            <CardDescription className="font-elegant">
              Configuración de mensajes automáticos por WhatsApp
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.whatsapp_enabled}
                onChange={(e) => setConfig({...config, whatsapp_enabled: e.target.checked})}
                className="w-4 h-4 rounded border-gold/30 text-gold"
              />
              <Label className="font-elegant">Habilitar notificaciones por WhatsApp</Label>
            </div>
            
            {config.whatsapp_enabled && (
              <>
                <div className="space-y-2">
                  <Label className="font-elegant">API Key de WhatsApp Business</Label>
                  <Input
                    type="password"
                    value={config.whatsapp_api_key}
                    onChange={(e) => setConfig({...config, whatsapp_api_key: e.target.value})}
                    placeholder="Tu clave API"
                    className="font-elegant"
                  />
                </div>

                <div className="space-y-3 p-4 rounded-lg bg-muted/20">
                  <p className="font-elegant text-sm font-semibold">Recordatorios automáticos:</p>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" checked={config.whatsapp_recordatorio_24h} onChange={(e) => setConfig({...config, whatsapp_recordatorio_24h: e.target.checked})} className="w-4 h-4" />
                    <Label className="font-elegant text-sm">24 horas antes de la cita</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" checked={config.whatsapp_recordatorio_2h} onChange={(e) => setConfig({...config, whatsapp_recordatorio_2h: e.target.checked})} className="w-4 h-4" />
                    <Label className="font-elegant text-sm">2 horas antes de la cita</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" checked={config.whatsapp_confirmacion} onChange={(e) => setConfig({...config, whatsapp_confirmacion: e.target.checked})} className="w-4 h-4" />
                    <Label className="font-elegant text-sm">Confirmación inmediata al agendar</Label>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
        >
          <Card className="glass-effect border-gold/20 hover:border-gold/30 transition-all duration-300">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-blue-500" />
              <CardTitle className="font-display gradient-gold bg-clip-text text-transparent">
                Email
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={config.email_enabled} onChange={(e) => setConfig({...config, email_enabled: e.target.checked})} className="w-4 h-4" />
              <Label className="font-elegant">Habilitar notificaciones por email</Label>
            </div>
            {config.email_enabled && (
              <div className="space-y-3 p-4 rounded-lg bg-muted/20">
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={config.email_recordatorio} onChange={(e) => setConfig({...config, email_recordatorio: e.target.checked})} className="w-4 h-4" />
                  <Label className="font-elegant text-sm">Recordatorios de citas</Label>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={config.email_confirmacion} onChange={(e) => setConfig({...config, email_confirmacion: e.target.checked})} className="w-4 h-4" />
                  <Label className="font-elegant text-sm">Confirmación de reserva</Label>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={config.email_cancelacion} onChange={(e) => setConfig({...config, email_cancelacion: e.target.checked})} className="w-4 h-4" />
                  <Label className="font-elegant text-sm">Notificación de cancelación</Label>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
        >
          <Card className="glass-effect border-gold/20 hover:border-gold/30 transition-all duration-300">
          <CardHeader>
            <CardTitle className="font-display gradient-gold bg-clip-text text-transparent">
              Notificaciones Internas
            </CardTitle>
            <CardDescription className="font-elegant">
              Alertas para el panel administrativo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={config.notif_nueva_cita} onChange={(e) => setConfig({...config, notif_nueva_cita: e.target.checked})} className="w-4 h-4" />
              <Label className="font-elegant">Nueva cita agendada</Label>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={config.notif_cancelacion} onChange={(e) => setConfig({...config, notif_cancelacion: e.target.checked})} className="w-4 h-4" />
              <Label className="font-elegant">Cita cancelada</Label>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={config.notif_modificacion} onChange={(e) => setConfig({...config, notif_modificacion: e.target.checked})} className="w-4 h-4" />
              <Label className="font-elegant">Cita modificada</Label>
            </div>
          </CardContent>
        </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
        >
          <Card className="glass-effect border-blue-500/20 bg-blue-500/5 hover:border-blue-500/30 transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-elegant text-sm text-blue-500 font-semibold mb-1">
                  Importante
                </p>
                <p className="font-elegant text-xs text-muted-foreground leading-relaxed">
                  Para activar WhatsApp Business API necesitarás una cuenta verificada. 
                  Los mensajes automáticos ayudan a reducir ausencias en un 40%.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        </motion.div>
      </main>
    </PageTransition>
  );
};

export default NotificationSettings;
