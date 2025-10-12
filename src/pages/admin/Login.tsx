import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Scissors, Lock, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';

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
        rol: 'barbero', // Todos son barberos por ahora
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
