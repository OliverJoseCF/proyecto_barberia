import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PageTransition from '@/components/ui/PageTransition';
import { 
  ArrowLeft,
  Image as ImageIcon,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Search,
  Upload,
  Eye,
  EyeOff,
  Loader2,
  Filter,
  Tag
} from 'lucide-react';
import { toast } from 'sonner';
import { useGaleria } from '@/hooks/use-galeria';
import { supabase } from '@/lib/supabase';

const CATEGORIAS = ['Cortes', 'Barba', 'Diseños', 'Infantil', 'Tintes', 'Tratamientos'];

const GalleryManagement = () => {
  const navigate = useNavigate();
  const { imagenes, loading, agregarImagen, actualizarImagen, eliminarImagen, toggleActivo, obtenerCategorias } = useGaleria(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>('todas');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    imagen_url: '',
    categoria: '',
    activo: true,
    orden: 0
  });

  const categoriasDisponibles = Array.from(new Set([...CATEGORIAS, ...obtenerCategorias()]));

  const imagenesFiltradas = imagenes.filter(img => {
    const matchSearch = img.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       img.descripcion?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategoria = categoriaFiltro === 'todas' || img.categoria === categoriaFiltro;
    return matchSearch && matchCategoria;
  });

  const resetForm = () => {
    setFormData({
      titulo: '',
      descripcion: '',
      imagen_url: '',
      categoria: '',
      activo: true,
      orden: imagenes.length
    });
    setEditingId(null);
  };

  const handleOpenModal = (imagen?: any) => {
    if (imagen) {
      setFormData({
        titulo: imagen.titulo,
        descripcion: imagen.descripcion || '',
        imagen_url: imagen.imagen_url,
        categoria: imagen.categoria || '',
        activo: imagen.activo,
        orden: imagen.orden
      });
      setEditingId(imagen.id);
    } else {
      resetForm();
      setFormData(prev => ({ ...prev, orden: imagenes.length }));
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.titulo.trim()) {
      toast.error('El título es obligatorio');
      return;
    }

    if (!formData.imagen_url.trim()) {
      toast.error('La URL de la imagen es obligatoria');
      return;
    }

    try {
      if (editingId) {
        await actualizarImagen(editingId, formData);
        toast.success('Imagen actualizada correctamente');
      } else {
        await agregarImagen(formData);
        toast.success('Imagen agregada correctamente');
      }
      handleCloseModal();
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || 'Error al guardar la imagen');
    }
  };

  const handleDelete = async (id: string, titulo: string) => {
    if (!confirm(`¿Estás seguro de eliminar "${titulo}"?`)) return;

    try {
      await eliminarImagen(id);
      toast.success('Imagen eliminada correctamente');
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || 'Error al eliminar la imagen');
    }
  };

  const handleToggleActivo = async (id: string, activo: boolean) => {
    try {
      await toggleActivo(id, !activo);
      toast.success(activo ? 'Imagen desactivada' : 'Imagen activada');
    } catch (error: any) {
      console.error('Error:', error);
      toast.error('Error al cambiar el estado');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Solo se permiten imágenes');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen no debe superar 5MB');
      return;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('galeria')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('galeria')
        .getPublicUrl(fileName);

      setFormData(prev => ({ ...prev, imagen_url: publicUrl }));
      toast.success('Imagen subida correctamente');
      
    } catch (error: any) {
      console.error('Error al subir imagen:', error);
      toast.error(error.message || 'Error al subir la imagen');
    } finally {
      setUploading(false);
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
              <Button
                variant="ghost"
                onClick={() => navigate('/admin/configuracion')}
                className="text-gold hover:text-gold/80 font-elegant"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Volver
              </Button>
              
              <div className="h-8 w-px bg-gold/20" />
              
              <div className="flex items-center gap-3">
                <ImageIcon className="h-8 w-8 text-gold" />
                <div>
                  <h1 className="font-display text-2xl gradient-gold bg-clip-text text-transparent">
                    Gestión de Galería
                  </h1>
                  <p className="font-elegant text-sm text-muted-foreground">
                    Administra las imágenes de trabajos realizados
                  </p>
                </div>
              </div>
            </div>

            <Button
              onClick={() => handleOpenModal()}
              className="gradient-gold text-gold-foreground hover:opacity-90 font-elegant"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nueva Imagen
            </Button>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filtros */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Búsqueda */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gold" />
            <Input
              type="text"
              placeholder="Buscar por título o descripción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 font-elegant bg-background border-elegant-border/50 focus:border-gold transition-elegant"
            />
          </div>

          {/* Filtro de categoría */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gold z-10 pointer-events-none" />
            <Select value={categoriaFiltro} onValueChange={setCategoriaFiltro}>
              <SelectTrigger className="pl-10 font-elegant bg-background border-elegant-border/50 focus:border-gold transition-elegant">
                <SelectValue placeholder="Filtrar por categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas las categorías</SelectItem>
                {categoriasDisponibles.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Grid de Imágenes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {loading ? (
            <div className="col-span-full flex flex-col justify-center items-center py-20">
              <Loader2 className="h-12 w-12 text-gold animate-spin mb-4" />
              <span className="font-elegant text-gold">Cargando galería...</span>
            </div>
          ) : imagenesFiltradas.length === 0 ? (
            <Card className="col-span-full glass-effect bg-card/40 backdrop-blur-md border-gold/20">
              <CardContent className="flex flex-col items-center justify-center py-20">
                <ImageIcon className="h-16 w-16 text-gold/50 mb-4" />
                <p className="font-elegant text-muted-foreground text-lg mb-2">
                  {searchTerm || categoriaFiltro !== 'todas' 
                    ? 'No se encontraron imágenes con los filtros aplicados' 
                    : 'No hay imágenes en la galería'}
                </p>
                {!searchTerm && categoriaFiltro === 'todas' && (
                  <Button
                    onClick={() => handleOpenModal()}
                    className="mt-4 gradient-gold text-elegant-dark hover:opacity-90 transition-elegant font-elegant"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar la primera
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            imagenesFiltradas.map((imagen) => (
              <motion.div
                key={imagen.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="group relative"
              >
                <Card className="glass-effect hover:border-gold/50 hover:glow-soft transition-elegant bg-card/60 backdrop-blur-md overflow-hidden">
                  {/* Imagen */}
                  <div className="relative aspect-square overflow-hidden bg-elegant-dark/30">
                    <img
                      src={imagen.imagen_url}
                      alt={imagen.titulo}
                      className="w-full h-full object-cover transition-elegant group-hover:scale-110"
                      onError={(e) => {
                        e.currentTarget.src = 'https://placehold.co/400x400/1a1a1a/gold?text=Error';
                      }}
                    />
                    
                    {/* Overlay con acciones */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-elegant flex items-end justify-center pb-4 gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleOpenModal(imagen)}
                        className="bg-gold/90 text-elegant-dark hover:bg-gold transition-elegant font-elegant backdrop-blur-sm"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleToggleActivo(imagen.id, imagen.activo)}
                        className={`${
                          imagen.activo 
                            ? 'bg-green-500/90 hover:bg-green-500' 
                            : 'bg-red-500/90 hover:bg-red-500'
                        } text-white transition-elegant backdrop-blur-sm`}
                      >
                        {imagen.activo ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleDelete(imagen.id, imagen.titulo)}
                        className="bg-red-500/90 text-white hover:bg-red-500 transition-elegant backdrop-blur-sm"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Badge de estado */}
                    <div className="absolute top-2 right-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm border ${
                        imagen.activo 
                          ? 'bg-green-500/20 text-green-400 border-green-500/50' 
                          : 'bg-red-500/20 text-red-400 border-red-500/50'
                      }`}>
                        {imagen.activo ? 'Activa' : 'Inactiva'}
                      </span>
                    </div>

                    {/* Orden */}
                    <div className="absolute top-2 left-2">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-elegant-dark/60 text-gold backdrop-blur-sm border border-gold/30">
                        #{imagen.orden}
                      </span>
                    </div>
                  </div>

                  {/* Info */}
                  <CardContent className="p-4">
                    <h3 className="font-display text-lg text-foreground mb-2 truncate">
                      {imagen.titulo}
                    </h3>
                    
                    {imagen.categoria && (
                      <div className="flex items-center gap-1 mb-2">
                        <Tag className="h-3 w-3 text-gold" />
                        <span className="text-xs font-elegant text-gold">
                          {imagen.categoria}
                        </span>
                      </div>
                    )}

                    {imagen.descripcion && (
                      <p className="text-sm text-muted-foreground font-elegant line-clamp-2">
                        {imagen.descripcion}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>

        {/* Modal Agregar/Editar */}
        <AnimatePresence>
          {showModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={handleCloseModal}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="glass-effect bg-card/95 backdrop-blur-md border-gold/30 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-display text-3xl gradient-gold bg-clip-text text-transparent">
                    {editingId ? 'Editar Imagen' : 'Nueva Imagen'}
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCloseModal}
                    className="text-muted-foreground hover:text-gold transition-elegant"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Título */}
                  <div>
                    <Label htmlFor="titulo" className="font-elegant text-foreground">
                      Título *
                    </Label>
                    <Input
                      id="titulo"
                      value={formData.titulo}
                      onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                      className="font-elegant bg-background border-elegant-border/50 focus:border-gold transition-elegant"
                      placeholder="Ej: Fade Clásico"
                      required
                    />
                  </div>

                  {/* Imagen */}
                  <div>
                    <Label htmlFor="imagen" className="font-elegant text-foreground mb-2 block">
                      Imagen *
                    </Label>
                    
                    {formData.imagen_url && (
                      <div className="mb-3 relative group">
                        <img
                          src={formData.imagen_url}
                          alt="Preview"
                          className="h-56 w-full object-cover rounded-lg border border-gold/30"
                          onError={(e) => {
                            e.currentTarget.src = 'https://placehold.co/400x300/1a1a1a/gold?text=Error';
                          }}
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-elegant rounded-lg flex items-center justify-center">
                          <span className="text-white font-elegant">Vista previa</span>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Input
                        id="imagen_url"
                        type="text"
                        value={formData.imagen_url}
                        onChange={(e) => setFormData({ ...formData, imagen_url: e.target.value })}
                        className="font-elegant bg-background border-elegant-border/50 focus:border-gold transition-elegant"
                        placeholder="URL de la imagen o..."
                        required
                      />
                      <Button
                        type="button"
                        variant="outline"
                        disabled={uploading}
                        className="border-gold/30 text-gold hover:bg-gold/10 transition-elegant"
                      >
                        <label htmlFor="imagen_file" className="cursor-pointer flex items-center">
                          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                          <input
                            id="imagen_file"
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                        </label>
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground font-elegant mt-1">
                      Puedes pegar una URL o subir una imagen (max 5MB)
                    </p>
                  </div>

                  {/* Descripción */}
                  <div>
                    <Label htmlFor="descripcion" className="font-elegant text-foreground">
                      Descripción
                    </Label>
                    <Textarea
                      id="descripcion"
                      value={formData.descripcion}
                      onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                      className="font-elegant bg-background border-elegant-border/50 focus:border-gold transition-elegant min-h-[80px]"
                      placeholder="Descripción breve del trabajo..."
                    />
                  </div>

                  {/* Categoría */}
                  <div>
                    <Label htmlFor="categoria" className="font-elegant text-foreground">
                      Categoría
                    </Label>
                    <Select 
                      value={formData.categoria} 
                      onValueChange={(value) => setFormData({ ...formData, categoria: value })}
                    >
                      <SelectTrigger className="font-elegant bg-background border-elegant-border/50 focus:border-gold transition-elegant">
                        <SelectValue placeholder="Selecciona una categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIAS.map((cat) => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Orden y Activo */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="orden" className="font-elegant text-foreground">
                        Orden de Visualización
                      </Label>
                      <Input
                        id="orden"
                        type="number"
                        value={formData.orden}
                        onChange={(e) => setFormData({ ...formData, orden: parseInt(e.target.value) || 0 })}
                        className="font-elegant bg-background border-elegant-border/50 focus:border-gold transition-elegant"
                        min="0"
                      />
                      <p className="text-xs text-muted-foreground font-elegant mt-1">
                        Menor número aparece primero
                      </p>
                    </div>

                    <div className="flex items-center gap-2 pt-6">
                      <input
                        type="checkbox"
                        id="activo"
                        checked={formData.activo}
                        onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                        className="w-4 h-4 rounded border-elegant-border bg-background text-gold focus:ring-gold"
                      />
                      <Label htmlFor="activo" className="font-elegant text-foreground cursor-pointer">
                        Imagen activa (visible en página pública)
                      </Label>
                    </div>
                  </div>

                  {/* Botones */}
                  <div className="flex gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCloseModal}
                      className="flex-1 border-elegant-border/50 font-elegant hover:border-gold/30 transition-elegant"
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 gradient-gold text-elegant-dark hover:opacity-90 transition-elegant font-elegant"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {editingId ? 'Actualizar' : 'Guardar'}
                    </Button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </PageTransition>
  );
};

export default GalleryManagement;
