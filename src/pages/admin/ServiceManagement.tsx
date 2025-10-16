import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import PageTransition from '@/components/ui/PageTransition';
import { 
  ArrowLeft,
  Scissors,
  Plus,
  Edit,
  Trash2,
  DollarSign,
  Clock,
  Save,
  X,
  Search,
  Tag,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useServicios } from '@/hooks/use-servicios';

interface Servicio {
  id: string;
  nombre: string;
  precio: number;
  duracion: number;
  descripcion?: string;
  categoria?: string;
  activo: boolean;
  creado_en?: string;
}

const ServiceManagement = () => {
  const navigate = useNavigate();
  const { servicios: serviciosDB, loading: loadingServicios } = useServicios(true); // Incluir inactivos en admin
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [filteredServicios, setFilteredServicios] = useState<Servicio[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingService, setEditingService] = useState<Servicio | null>(null);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    nombre: '',
    precio: '',
    duracion: '',
    descripcion: '',
    categoria: '',
    activo: true
  });

  useEffect(() => {
    checkSession();
  }, []);

  useEffect(() => {
    if (serviciosDB && serviciosDB.length > 0) {
      setServicios(serviciosDB as Servicio[]);
      setFilteredServicios(serviciosDB as Servicio[]);
    }
  }, [serviciosDB]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = servicios.filter(s => 
        s.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.categoria?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredServicios(filtered);
    } else {
      setFilteredServicios(servicios);
    }
  }, [searchTerm, servicios]);

  const checkSession = () => {
    const userDataString = localStorage.getItem('cantabarba_user');
    if (!userDataString) {
      navigate('/admin/login');
      return;
    }

    const userData = JSON.parse(userDataString);
    if (userData.rol !== 'admin') {
      toast.error('Acceso denegado. Solo administradores.');
      navigate('/admin/dashboard');
      return;
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      precio: '',
      duracion: '',
      descripcion: '',
      categoria: '',
      activo: true
    });
    setEditingService(null);
  };

  const handleAdd = () => {
    resetForm();
    setShowAddModal(true);
  };

  const handleEdit = (servicio: Servicio) => {
    setFormData({
      nombre: servicio.nombre,
      precio: servicio.precio.toString(),
      duracion: servicio.duracion.toString(),
      descripcion: servicio.descripcion || '',
      categoria: servicio.categoria || '',
      activo: servicio.activo
    });
    setEditingService(servicio);
    setShowAddModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este servicio?')) return;

    try {
      setLoading(true);
      const { error } = await supabase
        .from('servicios')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setServicios(prev => prev.filter(s => s.id !== id));
      toast.success('Servicio eliminado correctamente');
    } catch (error: any) {
      console.error('Error al eliminar:', error);
      toast.error('Error al eliminar el servicio');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (id: string, currentState: boolean) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('servicios')
        .update({ activo: !currentState })
        .eq('id', id);

      if (error) throw error;

      setServicios(prev => prev.map(s => 
        s.id === id ? { ...s, activo: !currentState } : s
      ));
      
      toast.success(`Servicio ${!currentState ? 'activado' : 'desactivado'}`);
    } catch (error: any) {
      console.error('Error al actualizar:', error);
      toast.error('Error al actualizar el servicio');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nombre || !formData.precio || !formData.duracion) {
      toast.error('Por favor completa los campos obligatorios');
      return;
    }

    try {
      setLoading(true);

      const servicioData = {
        nombre: formData.nombre,
        precio: parseFloat(formData.precio),
        duracion: parseInt(formData.duracion),
        descripcion: formData.descripcion || null,
        categoria: formData.categoria || null,
        activo: formData.activo
      };

      if (editingService) {
        // Actualizar
        const { error } = await supabase
          .from('servicios')
          .update(servicioData)
          .eq('id', editingService.id);

        if (error) throw error;

        setServicios(prev => prev.map(s => 
          s.id === editingService.id ? { ...s, ...servicioData } : s
        ));
        
        toast.success('Servicio actualizado correctamente');
      } else {
        // Crear nuevo
        const { data, error } = await supabase
          .from('servicios')
          .insert([servicioData])
          .select()
          .single();

        if (error) throw error;

        setServicios(prev => [...prev, data as Servicio]);
        toast.success('Servicio creado correctamente');
      }

      setShowAddModal(false);
      resetForm();
    } catch (error: any) {
      console.error('Error al guardar:', error);
      toast.error(editingService ? 'Error al actualizar' : 'Error al crear el servicio');
    } finally {
      setLoading(false);
    }
  };

  // Estadísticas rápidas
  const stats = {
    total: servicios.length,
    activos: servicios.filter(s => s.activo).length,
    inactivos: servicios.filter(s => !s.activo).length,
    precioPromedio: servicios.length > 0 
      ? Math.round(servicios.reduce((sum, s) => sum + s.precio, 0) / servicios.length)
      : 0
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
                <Scissors className="h-8 w-8 text-gold" />
                <div>
                  <h1 className="font-display text-2xl gradient-gold bg-clip-text text-transparent">
                    Gestión de Servicios
                  </h1>
                  <p className="font-elegant text-sm text-muted-foreground">
                    Administra todos los servicios de la barbería
                  </p>
                </div>
              </div>
            </div>

            <Button
              onClick={handleAdd}
              className="gradient-gold text-gold-foreground hover:opacity-90 font-elegant"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Servicio
            </Button>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="glass-effect border-gold/20">
              <CardHeader className="pb-2">
                <CardTitle className="font-elegant text-sm text-muted-foreground">
                  Total de Servicios
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-display gradient-gold bg-clip-text text-transparent">
                  {stats.total}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="glass-effect border-green-500/20">
              <CardHeader className="pb-2">
                <CardTitle className="font-elegant text-sm text-muted-foreground">
                  Activos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-display text-green-500">
                  {stats.activos}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="glass-effect border-red-500/20">
              <CardHeader className="pb-2">
                <CardTitle className="font-elegant text-sm text-muted-foreground">
                  Inactivos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-display text-red-500">
                  {stats.inactivos}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="glass-effect border-blue-500/20">
              <CardHeader className="pb-2">
                <CardTitle className="font-elegant text-sm text-muted-foreground">
                  Precio Promedio
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-display text-blue-500">
                  ${stats.precioPromedio}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Buscador */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-6"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar servicios por nombre o categoría..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 font-elegant bg-card border-gold/20"
            />
          </div>
        </motion.div>

        {/* Lista de Servicios */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="glass-effect border-gold/20">
            <CardHeader>
              <CardTitle className="font-display gradient-gold bg-clip-text text-transparent">
                Servicios Registrados ({filteredServicios.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingServicios ? (
                <div className="text-center py-8">
                  <div className="animate-spin text-gold text-3xl mb-2">⏳</div>
                  <p className="font-elegant text-muted-foreground">Cargando servicios...</p>
                </div>
              ) : filteredServicios.length === 0 ? (
                <div className="text-center py-12">
                  <Scissors className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-30" />
                  <p className="font-elegant text-muted-foreground">
                    {searchTerm ? 'No se encontraron servicios' : 'No hay servicios registrados'}
                  </p>
                  {!searchTerm && (
                    <Button
                      onClick={handleAdd}
                      className="mt-4 gradient-gold text-gold-foreground font-elegant"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar Primer Servicio
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredServicios.map((servicio, index) => (
                    <motion.div
                      key={servicio.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`p-4 rounded-lg border ${
                        servicio.activo 
                          ? 'bg-card/50 border-gold/10 hover:border-gold/30' 
                          : 'bg-muted/20 border-muted/30'
                      } transition-all duration-200`}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className={`font-display text-lg ${
                              servicio.activo ? 'text-gold' : 'text-muted-foreground'
                            }`}>
                              {servicio.nombre}
                            </h3>
                            {servicio.categoria && (
                              <span className="px-2 py-1 rounded-full text-xs bg-blue-500/20 text-blue-500 border border-blue-500/30 font-elegant">
                                {servicio.categoria}
                              </span>
                            )}
                            <span className={`px-2 py-1 rounded-full text-xs border font-elegant ${
                              servicio.activo 
                                ? 'bg-green-500/20 text-green-500 border-green-500/30' 
                                : 'bg-red-500/20 text-red-500 border-red-500/30'
                            }`}>
                              {servicio.activo ? 'Activo' : 'Inactivo'}
                            </span>
                          </div>
                          
                          {servicio.descripcion && (
                            <p className="font-elegant text-sm text-muted-foreground mb-2">
                              {servicio.descripcion}
                            </p>
                          )}
                          
                          <div className="flex items-center gap-6 text-sm">
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-4 w-4 text-green-500" />
                              <span className="font-elegant">
                                <span className="font-semibold">${servicio.precio}</span> MXN
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-blue-500" />
                              <span className="font-elegant">
                                <span className="font-semibold">{servicio.duracion}</span> min
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleToggleActive(servicio.id, servicio.activo)}
                            className={`${
                              servicio.activo ? 'text-red-500 hover:bg-red-500/10' : 'text-green-500 hover:bg-green-500/10'
                            } font-elegant`}
                          >
                            {servicio.activo ? 'Desactivar' : 'Activar'}
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(servicio)}
                            className="text-blue-500 hover:bg-blue-500/10"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(servicio.id)}
                            className="text-red-500 hover:bg-red-500/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </main>

      {/* Modal de Agregar/Editar */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => {
              setShowAddModal(false);
              resetForm();
            }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl"
            >
              <Card className="glass-effect border-gold/20">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="font-display text-2xl gradient-gold bg-clip-text text-transparent">
                        {editingService ? 'Editar Servicio' : 'Nuevo Servicio'}
                      </CardTitle>
                      <CardDescription className="font-elegant mt-2">
                        {editingService 
                          ? 'Modifica los datos del servicio' 
                          : 'Completa la información del nuevo servicio'}
                      </CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setShowAddModal(false);
                        resetForm();
                      }}
                      className="text-muted-foreground hover:text-gold"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="nombre" className="font-elegant">
                          Nombre del Servicio <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="nombre"
                          value={formData.nombre}
                          onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                          placeholder="Ej: Corte de cabello clásico"
                          className="font-elegant"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="categoria" className="font-elegant">
                          Categoría
                        </Label>
                        <Input
                          id="categoria"
                          value={formData.categoria}
                          onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                          placeholder="Ej: Cortes, Barba, Tintes"
                          className="font-elegant"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="precio" className="font-elegant">
                          Precio (MXN) <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="precio"
                            type="number"
                            step="0.01"
                            min="0"
                            value={formData.precio}
                            onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                            placeholder="150.00"
                            className="font-elegant pl-10"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="duracion" className="font-elegant">
                          Duración (minutos) <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                          <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="duracion"
                            type="number"
                            min="1"
                            value={formData.duracion}
                            onChange={(e) => setFormData({ ...formData, duracion: e.target.value })}
                            placeholder="30"
                            className="font-elegant pl-10"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="descripcion" className="font-elegant">
                        Descripción
                      </Label>
                      <textarea
                        id="descripcion"
                        value={formData.descripcion}
                        onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                        placeholder="Describe brevemente el servicio..."
                        className="w-full min-h-[100px] px-3 py-2 rounded-md border border-input bg-background font-elegant text-sm resize-none focus:outline-none focus:ring-2 focus:ring-gold/20"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="activo"
                        checked={formData.activo}
                        onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                        className="w-4 h-4 rounded border-gold/30 text-gold focus:ring-gold/20"
                      />
                      <Label htmlFor="activo" className="font-elegant cursor-pointer">
                        Servicio activo (visible para clientes)
                      </Label>
                    </div>

                    <div className="flex items-center gap-3 pt-4 border-t border-gold/10">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowAddModal(false);
                          resetForm();
                        }}
                        className="flex-1 font-elegant border-gold/30 hover:bg-gold/5"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancelar
                      </Button>
                      <Button
                        type="submit"
                        disabled={loading}
                        className="flex-1 gradient-gold text-gold-foreground hover:opacity-90 font-elegant"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {loading ? 'Guardando...' : editingService ? 'Actualizar' : 'Crear Servicio'}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageTransition>
  );
};

export default ServiceManagement;
