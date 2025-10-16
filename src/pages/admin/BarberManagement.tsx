import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import PageTransition from '@/components/ui/PageTransition';
import { 
  ArrowLeft,
  Users,
  Plus,
  Edit,
  Trash2,
  Mail,
  Phone,
  Save,
  X,
  Search,
  Scissors,
  Upload,
  Eye,
  EyeOff,
  Loader2,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';
import { useBarberos as useBarberosAdmin } from '@/hooks/use-barberos-admin';
import { supabase } from '@/lib/supabase';

const BarberManagement = () => {
  const navigate = useNavigate();
  const { barberos, loading, agregarBarbero, actualizarBarbero, eliminarBarbero, toggleActivo } = useBarberosAdmin(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    nombre: '',
    especialidad: '',
    telefono: '',
    email: '',
    foto_url: '',
    biografia: '',
    horario_preferido: '',
    activo: true,
    orden: 0
  });

  const filteredBarberos = barberos.filter(b => 
    b.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.especialidad?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetForm = () => {
    setFormData({
      nombre: '',
      especialidad: '',
      telefono: '',
      email: '',
      foto_url: '',
      biografia: '',
      horario_preferido: '',
      activo: true,
      orden: barberos.length
    });
    setEditingId(null);
  };

  const handleOpenModal = (barbero?: any) => {
    if (barbero) {
      setFormData({
        nombre: barbero.nombre,
        especialidad: barbero.especialidad || '',
        telefono: barbero.telefono || '',
        email: barbero.email || '',
        foto_url: barbero.foto_url || '',
        biografia: barbero.biografia || '',
        horario_preferido: barbero.horario_preferido || '',
        activo: barbero.activo,
        orden: barbero.orden
      });
      setEditingId(barbero.id);
    } else {
      resetForm();
      setFormData(prev => ({ ...prev, orden: barberos.length }));
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nombre.trim()) {
      toast.error('El nombre es obligatorio');
      return;
    }

    try {
      if (editingId) {
        await actualizarBarbero(editingId, formData);
        toast.success('Barbero actualizado correctamente');
      } else {
        await agregarBarbero(formData);
        toast.success('Barbero agregado correctamente');
      }
      handleCloseModal();
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || 'Error al guardar el barbero');
    }
  };

  const handleDelete = async (id: string, nombre: string) => {
    if (!confirm(`¿Estás seguro de eliminar a ${nombre}?`)) return;

    try {
      await eliminarBarbero(id);
      toast.success('Barbero eliminado correctamente');
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || 'Error al eliminar el barbero');
    }
  };

  const handleToggleActivo = async (id: string, activo: boolean) => {
    try {
      await toggleActivo(id, !activo);
      toast.success(activo ? 'Barbero desactivado' : 'Barbero activado');
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

    if (file.size > 2 * 1024 * 1024) {
      toast.error('La imagen no debe superar 2MB');
      return;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { data, error } = await supabase.storage
        .from('barberos')
        .upload(filePath, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('barberos')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, foto_url: publicUrl }));
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
                <Users className="h-8 w-8 text-gold" />
                <div>
                  <h1 className="font-display text-2xl gradient-gold bg-clip-text text-transparent">
                    Gestión de Barberos
                  </h1>
                  <p className="font-elegant text-sm text-muted-foreground">
                    Administra el equipo de barberos y su información
                  </p>
                </div>
              </div>
            </div>

            <Button
              onClick={() => handleOpenModal()}
              className="gradient-gold text-gold-foreground hover:opacity-90 font-elegant"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Barbero
            </Button>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gold" />
            <Input
              type="text"
              placeholder="Buscar por nombre, especialidad o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 font-elegant bg-background border-elegant-border/50 focus:border-gold transition-elegant"
            />
          </div>
        </div>

        {/* Lista de Barberos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full flex flex-col justify-center items-center py-20">
              <Loader2 className="h-12 w-12 text-gold animate-spin mb-4" />
              <span className="font-elegant text-gold">Cargando barberos...</span>
            </div>
          ) : filteredBarberos.length === 0 ? (
            <Card className="col-span-full glass-effect bg-card/40 backdrop-blur-md border-gold/20">
              <CardContent className="flex flex-col items-center justify-center py-20">
                <Users className="h-16 w-16 text-gold/50 mb-4" />
                <p className="font-elegant text-muted-foreground text-lg mb-2">
                  {searchTerm ? 'No se encontraron barberos' : 'No hay barberos registrados'}
                </p>
                {!searchTerm && (
                  <Button
                    onClick={() => handleOpenModal()}
                    className="mt-4 gradient-gold text-elegant-dark hover:opacity-90 transition-elegant font-elegant"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar el primero
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            filteredBarberos.map((barbero) => (
              <motion.div
                key={barbero.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="glass-effect hover:border-gold/50 hover:glow-soft transition-elegant group bg-card/60 backdrop-blur-md overflow-hidden h-full flex flex-col">
                  {/* Imagen */}
                  <div className="relative h-48 bg-elegant-dark/30 overflow-hidden">
                    {barbero.foto_url ? (
                      <img
                        src={barbero.foto_url}
                        alt={barbero.nombre}
                        className="w-full h-full object-cover group-hover:scale-110 transition-elegant"
                        onError={(e) => {
                          e.currentTarget.src = 'https://placehold.co/400x300/1a1a1a/gold?text=' + barbero.nombre.charAt(0);
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-elegant-dark/50 to-elegant-dark/30">
                        <Users className="h-20 w-20 text-gold/30" />
                      </div>
                    )}
                    
                    {/* Badge de estado */}
                    <div className="absolute top-2 right-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleToggleActivo(barbero.id, barbero.activo)}
                        className={`${
                          barbero.activo 
                            ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30 border-green-500/50' 
                            : 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border-red-500/50'
                        } backdrop-blur-sm transition-elegant`}
                      >
                        {barbero.activo ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </Button>
                    </div>

                    {/* Orden */}
                    <div className="absolute top-2 left-2">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-elegant-dark/60 text-gold backdrop-blur-sm border border-gold/30">
                        #{barbero.orden}
                      </span>
                    </div>
                  </div>

                  <CardHeader className="pb-3">
                    <CardTitle className="font-display text-xl text-foreground flex items-center justify-between">
                      <span>{barbero.nombre}</span>
                    </CardTitle>
                    {barbero.especialidad && (
                      <div className="flex items-center gap-2 text-gold font-elegant italic">
                        <Scissors className="h-4 w-4" />
                        <span>{barbero.especialidad}</span>
                      </div>
                    )}
                  </CardHeader>

                  <CardContent className="space-y-3 flex-1 flex flex-col">
                    {barbero.biografia && (
                      <p className="text-sm text-muted-foreground font-elegant line-clamp-2">
                        {barbero.biografia}
                      </p>
                    )}

                    <div className="space-y-2 flex-1">
                      {barbero.email && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground font-elegant">
                          <Mail className="h-3 w-3 text-gold" />
                          <span className="truncate">{barbero.email}</span>
                        </div>
                      )}

                      {barbero.telefono && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground font-elegant">
                          <Phone className="h-3 w-3 text-gold" />
                          <span>{barbero.telefono}</span>
                        </div>
                      )}

                      {barbero.horario_preferido && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground font-elegant">
                          <Clock className="h-3 w-3 text-gold" />
                          <span>{barbero.horario_preferido}</span>
                        </div>
                      )}
                    </div>

                    {/* Acciones */}
                    <div className="flex gap-2 pt-3 border-t border-elegant-border/30">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenModal(barbero)}
                        className="flex-1 border-gold/30 text-gold hover:bg-gold/10 hover:border-gold/50 font-elegant transition-elegant"
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(barbero.id, barbero.nombre)}
                        className="flex-1 border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50 font-elegant transition-elegant"
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Eliminar
                      </Button>
                    </div>
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
                    {editingId ? 'Editar Barbero' : 'Nuevo Barbero'}
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
                  {/* Nombre */}
                  <div>
                    <Label htmlFor="nombre" className="font-elegant text-foreground">
                      Nombre *
                    </Label>
                    <Input
                      id="nombre"
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      className="font-elegant bg-background border-elegant-border/50 focus:border-gold transition-elegant"
                      placeholder="Ej: Carlos Mendoza"
                      required
                    />
                  </div>

                  {/* Especialidad */}
                  <div>
                    <Label htmlFor="especialidad" className="font-elegant text-foreground">
                      Especialidad
                    </Label>
                    <Input
                      id="especialidad"
                      value={formData.especialidad}
                      onChange={(e) => setFormData({ ...formData, especialidad: e.target.value })}
                      className="font-elegant bg-background border-elegant-border/50 focus:border-gold transition-elegant"
                      placeholder="Ej: Master Barber, Experto en diseños"
                    />
                  </div>

                  {/* Email y Teléfono */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email" className="font-elegant text-foreground">
                        Email
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="font-elegant bg-background border-elegant-border/50 focus:border-gold transition-elegant"
                        placeholder="email@ejemplo.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="telefono" className="font-elegant text-foreground">
                        Teléfono
                      </Label>
                      <Input
                        id="telefono"
                        value={formData.telefono}
                        onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                        className="font-elegant bg-background border-elegant-border/50 focus:border-gold transition-elegant"
                        placeholder="+52 123 456 7890"
                      />
                    </div>
                  </div>

                  {/* Foto */}
                  <div>
                    <Label htmlFor="foto" className="font-elegant text-foreground mb-2 block">
                      Foto de Perfil
                    </Label>
                    
                    {formData.foto_url && (
                      <div className="mb-3 relative group">
                        <img
                          src={formData.foto_url}
                          alt="Preview"
                          className="h-48 w-full object-cover rounded-lg border border-gold/30"
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
                        id="foto_url"
                        type="text"
                        value={formData.foto_url}
                        onChange={(e) => setFormData({ ...formData, foto_url: e.target.value })}
                        className="font-elegant bg-background border-elegant-border/50 focus:border-gold transition-elegant"
                        placeholder="URL de la imagen o..."
                      />
                      <Button
                        type="button"
                        variant="outline"
                        disabled={uploading}
                        className="border-gold/30 text-gold hover:bg-gold/10 transition-elegant"
                      >
                        <label htmlFor="foto_file" className="cursor-pointer flex items-center">
                          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                          <input
                            id="foto_file"
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                        </label>
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground font-elegant mt-1">
                      Puedes pegar una URL o subir una imagen (max 2MB)
                    </p>
                  </div>

                  {/* Biografía */}
                  <div>
                    <Label htmlFor="biografia" className="font-elegant text-foreground">
                      Biografía
                    </Label>
                    <Textarea
                      id="biografia"
                      value={formData.biografia}
                      onChange={(e) => setFormData({ ...formData, biografia: e.target.value })}
                      className="font-elegant bg-background border-elegant-border/50 focus:border-gold transition-elegant min-h-[100px]"
                      placeholder="Breve descripción del barbero..."
                    />
                  </div>

                  {/* Horario y Orden */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="horario" className="font-elegant text-foreground">
                        Horario Preferido
                      </Label>
                      <Input
                        id="horario"
                        value={formData.horario_preferido}
                        onChange={(e) => setFormData({ ...formData, horario_preferido: e.target.value })}
                        className="font-elegant bg-background border-elegant-border/50 focus:border-gold transition-elegant"
                        placeholder="Ej: Lun-Vie 9AM-5PM"
                      />
                    </div>
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
                  </div>

                  {/* Activo */}
                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="activo"
                      checked={formData.activo}
                      onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                      className="w-4 h-4 rounded border-elegant-border bg-background text-gold focus:ring-gold"
                    />
                    <Label htmlFor="activo" className="font-elegant text-foreground cursor-pointer">
                      Barbero activo (visible en página pública)
                    </Label>
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

export default BarberManagement;
