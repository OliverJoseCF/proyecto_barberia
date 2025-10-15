import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import PageTransition from '@/components/ui/PageTransition';
import { 
  ArrowLeft,
  Image as ImageIcon,
  Upload,
  Trash2,
  Eye,
  Star,
  Download
} from 'lucide-react';
import { toast } from 'sonner';

const GalleryManagement = () => {
  const navigate = useNavigate();
  const [imagenes, setImagenes] = useState([
    { id: '1', url: 'https://placehold.co/600x400/D4AF37/FFF?text=Corte+1', titulo: 'Fade Clásico', destacada: true },
    { id: '2', url: 'https://placehold.co/600x400/C9A961/FFF?text=Corte+2', titulo: 'Degradado Moderno', destacada: false },
    { id: '3', url: 'https://placehold.co/600x400/8B7355/FFF?text=Corte+3', titulo: 'Barba Premium', destacada: false },
  ]);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = () => {
    const userDataString = localStorage.getItem('cantabarba_user');
    if (!userDataString || JSON.parse(userDataString).rol !== 'admin') {
      navigate('/admin/login');
    }
  };

  return (
    <PageTransition>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-card border-b border-gold/20 sticky top-0 z-50 backdrop-blur-md"
      >
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
                    rotate: [0, 10, -10, 10, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 3,
                    ease: "easeInOut"
                  }}
                >
                  <ImageIcon className="h-8 w-8 text-gold" />
                </motion.div>
                <div>
                  <h1 className="font-display text-2xl gradient-gold bg-clip-text text-transparent">
                    Gestión de Galería
                  </h1>
                  <p className="font-elegant text-sm text-muted-foreground">
                    Administra las imágenes de tus trabajos
                  </p>
                </div>
              </div>
            </div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button className="gradient-gold text-gold-foreground font-elegant">
                <Upload className="h-4 w-4 mr-2" />
                Subir Imagen
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {imagenes.map((img, index) => (
            <motion.div
              key={img.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ 
                delay: index * 0.1,
                type: "spring",
                stiffness: 200,
                damping: 15
              }}
              whileHover={{ 
                scale: 1.05,
                zIndex: 10,
                transition: { duration: 0.2 }
              }}
            >
              <Card className="glass-effect border-gold/20 hover:border-gold/40 overflow-hidden group transition-all duration-300 hover:shadow-xl hover:shadow-gold/10">
                <div className="relative">
                  <img src={img.url} alt={img.titulo} className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-110" />
                  <motion.div 
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                    className="absolute inset-0 bg-black/50 flex items-center justify-center gap-2"
                  >
                    <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}>
                      <Button size="sm" variant="ghost" className="text-white hover:text-gold">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}>
                      <Button size="sm" variant="ghost" className="text-white hover:text-gold">
                        <Download className="h-4 w-4" />
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}>
                      <Button size="sm" variant="ghost" className="text-white hover:text-red-500">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  </motion.div>
                  {img.destacada && (
                    <div className="absolute top-2 right-2 bg-gold/90 px-2 py-1 rounded-full flex items-center gap-1">
                      <Star className="h-3 w-3 text-white fill-white" />
                      <span className="text-xs text-white font-elegant">Destacada</span>
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <h3 className="font-display text-gold">{img.titulo}</h3>
                  <div className="flex items-center justify-between mt-2">
                    <Button size="sm" variant="ghost" className="text-gold font-elegant">
                      Marcar como destacada
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </main>
    </PageTransition>
  );
};

export default GalleryManagement;
