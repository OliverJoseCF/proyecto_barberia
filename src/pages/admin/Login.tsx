import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Scissors, Lock, Mail, LogIn } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import LiquidEther from '@/components/LiquidEther';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('🔐 Intentando login con:', formData.email);
      
      // Buscar barbero por email en Supabase
      const { data: barbero, error } = await supabase
        .from('barberos')
        .select('*')
        .eq('email', formData.email)
        .eq('activo', true)
        .single();

      if (error || !barbero) {
        throw new Error('Usuario no encontrado o inactivo');
      }

      // TODO: En producción, verificar la contraseña de forma segura
      console.log('✅ Barbero encontrado:', barbero);

      // Guardar sesión en localStorage
      localStorage.setItem('cantabarba_user', JSON.stringify({
        id: barbero.id,
        nombre: barbero.nombre,
        email: barbero.email,
        especialidad: barbero.especialidad,
        rol: barbero.rol || 'barbero', // Leer rol de la base de datos
        loginTime: new Date().toISOString()
      }));

      toast({
        title: `¡Bienvenido ${barbero.nombre}! 👋`,
        description: 'Has iniciado sesión correctamente.',
      });
      
      navigate('/admin/dashboard');
    } catch (error: any) {
      console.error('❌ Error de login:', error);
      toast({
        title: 'Error de autenticación',
        description: error.message || 'Credenciales incorrectas',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-hero-bg via-hero-bg/95 to-background p-4 relative overflow-hidden">
      {/* Fondo animado con LiquidEther */}
      <div className="absolute inset-0 opacity-60 pointer-events-auto z-0">
        <LiquidEther
          colors={['#FFD700', '#D4AF37', '#C9A961', '#8B7355', '#2C2416']}
          mouseForce={35}
          cursorSize={170}
          isViscous={false}
          viscous={30}
          iterationsViscous={32}
          iterationsPoisson={32}
          resolution={0.5}
          isBounce={false}
          autoDemo={true}
          autoSpeed={0.5}
          autoIntensity={2.5}
          takeoverDuration={0.25}
          autoResumeDelay={3000}
          autoRampDuration={0.6}
          style={{ width: '100%', height: '100%' }}
        />
      </div>
      
      {/* Overlay de gradiente */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.22 }}
        transition={{ duration: 1 }}
        className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(255,215,0,0.22)_0%,_transparent_60%)] pointer-events-none z-1"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ 
          duration: 0.6,
          ease: [0.22, 1, 0.36, 1]
        }}
        className="w-full max-w-md relative z-20"
      >
        <Card className="glass-effect bg-card/40 backdrop-blur-md border-gold/20 shadow-2xl pointer-events-auto">
          <CardHeader className="text-center space-y-4">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ 
                type: "spring",
                stiffness: 200,
                damping: 15,
                delay: 0.2
              }}
              className="mx-auto w-20 h-20 rounded-full bg-gold/10 flex items-center justify-center ring-4 ring-gold/20"
            >
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Scissors className="h-10 w-10 text-gold" />
              </motion.div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <CardTitle className="font-display text-3xl gradient-gold bg-clip-text text-transparent">
                Panel de Administración
              </CardTitle>
              <CardDescription className="font-elegant text-muted-foreground mt-2">
                CantaBarba Studio - Acceso exclusivo para barberos
              </CardDescription>
            </motion.div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleLogin} className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-2"
              >
                <Label htmlFor="email" className="font-elegant text-foreground flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gold" />
                  Correo Electrónico
                </Label>
                <motion.div
                  whileFocus={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="font-elegant bg-background border-elegant-border/50 focus:border-gold"
                    required
                  />
                </motion.div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="space-y-2"
              >
                <Label htmlFor="password" className="font-elegant text-foreground flex items-center gap-2">
                  <Lock className="h-4 w-4 text-gold" />
                  Contraseña
                </Label>
                <motion.div
                  whileFocus={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="font-elegant bg-background border-elegant-border/50 focus:border-gold"
                    required
                  />
                </motion.div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Button
                  type="submit"
                  className="w-full gradient-gold text-gold-foreground hover:opacity-90 transition-elegant font-elegant text-lg py-6 relative overflow-hidden group"
                  disabled={loading}
                  asChild
                >
                  <motion.button
                    whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(212, 175, 55, 0.5)" }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="animate-spin">⏳</span>
                        Iniciando sesión...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <LogIn className="h-5 w-5 group-hover:rotate-12 transition-transform" />
                        Iniciar Sesión
                      </span>
                    )}
                  </motion.button>
                </Button>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="text-center text-sm text-muted-foreground font-elegant mt-4"
              >
                Solo para personal autorizado de CantaBarba Studio
              </motion.p>
            </form>
          </CardContent>
        </Card>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-6 text-center pointer-events-auto"
        >
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="text-gold hover:text-gold/80 font-elegant group"
            asChild
          >
            <motion.button
              whileHover={{ x: -5 }}
              transition={{ duration: 0.2 }}
            >
              <motion.span
                className="inline-block mr-2"
                animate={{ x: [0, -5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              >
                ←
              </motion.span>
              Volver al sitio principal
            </motion.button>
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
