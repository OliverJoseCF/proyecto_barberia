import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Scissors, Lock, Mail } from 'lucide-react';
import { motion } from 'framer-motion';

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
      // TODO: Integrar con tu sistema de autenticación aquí
      // Por ahora simulamos el login
      console.log('Login attempt:', formData);

      // Simulación básica
      if (formData.email && formData.password) {
        toast({
          title: '¡Bienvenido!',
          description: 'Has iniciado sesión correctamente.',
        });
        navigate('/admin/dashboard');
      } else {
        throw new Error('Por favor completa todos los campos');
      }
    } catch (error: any) {
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-hero-bg via-hero-bg/95 to-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="glass-effect bg-card/40 backdrop-blur-md border-gold/20">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-20 h-20 rounded-full bg-gold/10 flex items-center justify-center">
              <Scissors className="h-10 w-10 text-gold" />
            </div>
            <div>
              <CardTitle className="font-display text-3xl gradient-gold bg-clip-text text-transparent">
                Panel de Administración
              </CardTitle>
              <CardDescription className="font-elegant text-muted-foreground mt-2">
                CantaBarba Studio - Acceso exclusivo para barberos
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="font-elegant text-foreground flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gold" />
                  Correo Electrónico
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="font-elegant bg-background border-elegant-border/50 focus:border-gold"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="font-elegant text-foreground flex items-center gap-2">
                  <Lock className="h-4 w-4 text-gold" />
                  Contraseña
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="font-elegant bg-background border-elegant-border/50 focus:border-gold"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full gradient-gold text-gold-foreground hover:opacity-90 transition-elegant font-elegant text-lg py-6"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin">⏳</span>
                    Iniciando sesión...
                  </span>
                ) : (
                  'Iniciar Sesión'
                )}
              </Button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gold/20" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground font-elegant">MODO DEMO</span>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  type="button"
                  onClick={() => navigate('/admin/dashboard?demo=true&role=admin')}
                  variant="outline"
                  className="w-full border-gold/50 text-gold hover:bg-gold/10 font-elegant py-6"
                >
                  <div className="flex flex-col items-center">
                    <span className="text-lg">👑 Demo como Ángel (Fundador/Admin)</span>
                    <span className="text-xs opacity-75">Ver todas las citas de todos los barberos</span>
                  </div>
                </Button>

                <Button
                  type="button"
                  onClick={() => navigate('/admin/dashboard?demo=true&role=barbero')}
                  variant="outline"
                  className="w-full border-blue-500/50 text-blue-400 hover:bg-blue-500/10 font-elegant py-6"
                >
                  <div className="flex flex-col items-center">
                    <span className="text-lg">✂️ Demo como Emiliano (Barbero)</span>
                    <span className="text-xs opacity-75">Solo ver mis propias citas</span>
                  </div>
                </Button>
              </div>

              <p className="text-center text-sm text-muted-foreground font-elegant mt-4">
                Solo para personal autorizado de CantaBarba Studio
              </p>
            </form>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="text-gold hover:text-gold/80 font-elegant"
          >
            ← Volver al sitio principal
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
