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
  Users,
  Plus,
  Edit,
  Trash2,
  Mail,
  Phone,
  Shield,
  CheckCircle,
  XCircle,
  Save,
  X,
  Search,
  Scissors,
  Star,
  Lock
} from 'lucide-react';
import { toast } from 'sonner';
import { useBarberos } from '@/hooks/use-barberos';
import { supabase } from '@/lib/supabase';

interface Barbero {
  id: string;
  nombre: string;
  email: string;
  telefono?: string;
  especialidad?: string;
  rol: 'admin' | 'barbero';
  activo: boolean;
  color_tema?: string;
  imagen_url?: string;
}

const BarberManagement = () => {
  const navigate = useNavigate();
  const { barberos: barberosDB, loading: loadingBarberos } = useBarberos();
  const [barberos, setBarberos] = useState<Barbero[]>([]);
  const [filteredBarberos, setFilteredBarberos] = useState<Barbero[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBarber, setEditingBarber] = useState<Barbero | null>(null);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    especialidad: '',
    rol: 'barbero' as 'admin' | 'barbero',
    password: '',
    confirmPassword: '',
    activo: true,
    color_tema: '#D4AF37'
  });

  useEffect(() => {
    checkSession();
  }, []);

  useEffect(() => {
    if (barberosDB && barberosDB.length > 0) {
      setBarberos(barberosDB as Barbero[]);
      setFilteredBarberos(barberosDB as Barbero[]);
    }
  }, [barberosDB]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = barberos.filter(b => 
        b.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.especialidad?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredBarberos(filtered);
    } else {
      setFilteredBarberos(barberos);
    }
  }, [searchTerm, barberos]);

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
      email: '',
      telefono: '',
      especialidad: '',
      rol: 'barbero',
      password: '',
      confirmPassword: '',
      activo: true,
      color_tema: '#D4AF37'
    });
    setEditingBarber(null);
  };

  const handleAdd = () => {
    resetForm();
    setShowAddModal(true);
  };

  const handleEdit = (barbero: Barbero) => {
    setFormData({
      nombre: barbero.nombre,
      email: barbero.email,
      telefono: barbero.telefono || '',
      especialidad: barbero.especialidad || '',
      rol: barbero.rol,
      password: '',
      confirmPassword: '',
      activo: barbero.activo,
      color_tema: barbero.color_tema || '#D4AF37'
    });
    setEditingBarber(barbero);
    setShowAddModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este barbero? Esta acción no se puede deshacer.')) return;

    try {
      setLoading(true);
      const { error } = await supabase
        .from('barberos')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setBarberos(prev => prev.filter(b => b.id !== id));
      toast.success('Barbero eliminado correctamente');
    } catch (error: any) {
      console.error('Error al eliminar:', error);
      toast.error('Error al eliminar el barbero');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (id: string, currentState: boolean) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('barberos')
        .update({ activo: !currentState })
        .eq('id', id);

      if (error) throw error;

      setBarberos(prev => prev.map(b => 
        b.id === id ? { ...b, activo: !currentState } : b
      ));
      
      toast.success(`Barbero ${!currentState ? 'activado' : 'desactivado'}`);
    } catch (error: any) {
      console.error('Error al actualizar:', error);
      toast.error('Error al actualizar el barbero');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nombre || !formData.email) {
      toast.error('Por favor completa los campos obligatorios');
      return;
    }

    if (!editingBarber && (!formData.password || formData.password.length < 6)) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (!editingBarber && formData.password !== formData.confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    try {
      setLoading(true);

      const barberoData = {
        nombre: formData.nombre,
        email: formData.email,
        telefono: formData.telefono || null,
        especialidad: formData.especialidad || null,
        rol: formData.rol,
        activo: formData.activo,
        color_tema: formData.color_tema
      };

      if (editingBarber) {
        // Actualizar
        const { error } = await supabase
          .from('barberos')
          .update(barberoData)
          .eq('id', editingBarber.id);

        if (error) throw error;

        setBarberos(prev => prev.map(b => 
          b.id === editingBarber.id ? { ...b, ...barberoData } : b
        ));
        
        toast.success('Barbero actualizado correctamente');
      } else {
        // Crear nuevo
        const { data, error } = await supabase
          .from('barberos')
          .insert([barberoData])
          .select()
          .single();

        if (error) throw error;

        setBarberos(prev => [...prev, data as Barbero]);
        toast.success('Barbero creado correctamente');
      }

      setShowAddModal(false);
      resetForm();
    } catch (error: any) {
      console.error('Error al guardar:', error);
      toast.error(editingBarber ? 'Error al actualizar' : 'Error al crear el barbero');
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    total: barberos.length,
    activos: barberos.filter(b => b.activo).length,
    inactivos: barberos.filter(b => !b.activo).length,
    admins: barberos.filter(b => b.rol === 'admin').length
  };

  const especialidades = ['Cortes Modernos', 'Barbería Clásica', 'Diseños y Degradados', 'Tintes y Color', 'Barba y Afeitado'];

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
              <motion.div whileHover={{ x: -5 }} transition={{ duration: 0.2 }}>
                <Button
                  variant="ghost"
                  onClick={() => navigate('/admin/configuracion')}
                  className="text-gold hover:text-gold/80 font-elegant"
                >
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  Volver
                </Button>
              </motion.div>
              
              <div className="h-8 w-px bg-gold/20" />
              
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                >
                  <Users className="h-8 w-8 text-gold" />
                </motion.div>
                <div>
                  <h1 className="font-display text-2xl gradient-gold bg-clip-text text-transparent">
                    Gestión de Barberos
                  </h1>
                  <p className="font-elegant text-sm text-muted-foreground">
                    Administra el equipo de trabajo
                  </p>
                </div>
              </div>
            </div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={handleAdd}
                className="gradient-gold text-gold-foreground hover:opacity-90 font-elegant"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Barbero
              </Button>
            </motion.div>
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
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
          >
            <Card className="glass-effect border-gold/20 hover:border-gold/40 transition-all duration-300">
              <CardHeader className="pb-2">
                <CardTitle className="font-elegant text-sm text-muted-foreground">
                  Total de Barberos
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
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
          >
            <Card className="glass-effect border-green-500/20 hover:border-green-500/40 transition-all duration-300">
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
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
          >
            <Card className="glass-effect border-red-500/20 hover:border-red-500/40 transition-all duration-300">
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
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
          >
            <Card className="glass-effect border-purple-500/20 hover:border-purple-500/40 transition-all duration-300">
              <CardHeader className="pb-2">
                <CardTitle className="font-elegant text-sm text-muted-foreground">
                  Administradores
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-display text-purple-500">
                  {stats.admins}
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
              placeholder="Buscar barberos por nombre, email o especialidad..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 font-elegant bg-card border-gold/20"
            />
          </div>
        </motion.div>

        {/* Lista de Barberos */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="glass-effect border-gold/20">
            <CardHeader>
              <CardTitle className="font-display gradient-gold bg-clip-text text-transparent">
                Equipo de Trabajo ({filteredBarberos.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingBarberos ? (
                <div className="text-center py-8">
                  <div className="animate-spin text-gold text-3xl mb-2">⏳</div>
                  <p className="font-elegant text-muted-foreground">Cargando barberos...</p>
                </div>
              ) : filteredBarberos.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-30" />
                  <p className="font-elegant text-muted-foreground">
                    {searchTerm ? 'No se encontraron barberos' : 'No hay barberos registrados'}
                  </p>
                  {!searchTerm && (
                    <Button
                      onClick={handleAdd}
                      className="mt-4 gradient-gold text-gold-foreground font-elegant"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar Primer Barbero
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredBarberos.map((barbero, index) => (
                    <motion.div
                      key={barbero.id}
                      initial={{ opacity: 0, scale: 0.9, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.3 }}
                      whileHover={{ y: -8, scale: 1.02, transition: { duration: 0.2 } }}
                      className={`p-6 rounded-lg border transition-all duration-300 ${
                        barbero.activo 
                          ? 'bg-card/50 border-gold/10 hover:border-gold/40 hover:shadow-lg hover:shadow-gold/10' 
                          : 'bg-muted/20 border-muted/30 opacity-75'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div 
                          className="w-16 h-16 rounded-full flex items-center justify-center text-white font-display text-2xl"
                          style={{ backgroundColor: barbero.color_tema || '#D4AF37' }}
                        >
                          {barbero.nombre.charAt(0).toUpperCase()}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className={`font-display text-lg ${
                                barbero.activo ? 'text-gold' : 'text-muted-foreground'
                              }`}>
                                {barbero.nombre}
                              </h3>
                              <div className="flex items-center gap-2 mt-1">
                                <span className={`px-2 py-1 rounded-full text-xs border font-elegant ${
                                  barbero.rol === 'admin'
                                    ? 'bg-purple-500/20 text-purple-500 border-purple-500/30'
                                    : 'bg-blue-500/20 text-blue-500 border-blue-500/30'
                                }`}>
                                  {barbero.rol === 'admin' ? 'Administrador' : 'Barbero'}
                                </span>
                                <span className={`px-2 py-1 rounded-full text-xs border font-elegant ${
                                  barbero.activo 
                                    ? 'bg-green-500/20 text-green-500 border-green-500/30' 
                                    : 'bg-red-500/20 text-red-500 border-red-500/30'
                                }`}>
                                  {barbero.activo ? 'Activo' : 'Inactivo'}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-2 text-sm mb-4">
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              <span className="font-elegant text-muted-foreground">
                                {barbero.email}
                              </span>
                            </div>
                            
                            {barbero.telefono && (
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <span className="font-elegant text-muted-foreground">
                                  {barbero.telefono}
                                </span>
                              </div>
                            )}
                            
                            {barbero.especialidad && (
                              <div className="flex items-center gap-2">
                                <Star className="h-4 w-4 text-gold" />
                                <span className="font-elegant text-gold">
                                  {barbero.especialidad}
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleToggleActive(barbero.id, barbero.activo)}
                                className={`w-full ${
                                  barbero.activo ? 'text-red-500 hover:bg-red-500/10' : 'text-green-500 hover:bg-green-500/10'
                                } font-elegant`}
                              >
                                {barbero.activo ? <XCircle className="h-4 w-4 mr-1" /> : <CheckCircle className="h-4 w-4 mr-1" />}
                                {barbero.activo ? 'Desactivar' : 'Activar'}
                              </Button>
                            </motion.div>
                            
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEdit(barbero)}
                                className="text-blue-500 hover:bg-blue-500/10"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </motion.div>
                            
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDelete(barbero.id)}
                                className="text-red-500 hover:bg-red-500/10"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </motion.div>
                          </div>
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
              className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <Card className="glass-effect border-gold/20">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="font-display text-2xl gradient-gold bg-clip-text text-transparent">
                        {editingBarber ? 'Editar Barbero' : 'Nuevo Barbero'}
                      </CardTitle>
                      <CardDescription className="font-elegant mt-2">
                        {editingBarber 
                          ? 'Modifica los datos del barbero' 
                          : 'Completa la información del nuevo miembro del equipo'}
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
                          Nombre Completo <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="nombre"
                          value={formData.nombre}
                          onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                          placeholder="Juan Pérez"
                          className="font-elegant"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email" className="font-elegant">
                          Correo Electrónico <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="juan@cantabarba.com"
                            className="font-elegant pl-10"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="telefono" className="font-elegant">
                          Teléfono
                        </Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="telefono"
                            type="tel"
                            value={formData.telefono}
                            onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                            placeholder="+52 123 456 7890"
                            className="font-elegant pl-10"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="especialidad" className="font-elegant">
                          Especialidad
                        </Label>
                        <select
                          id="especialidad"
                          value={formData.especialidad}
                          onChange={(e) => setFormData({ ...formData, especialidad: e.target.value })}
                          className="w-full px-3 py-2 rounded-md border border-input bg-background font-elegant"
                        >
                          <option value="">Seleccionar...</option>
                          {especialidades.map(esp => (
                            <option key={esp} value={esp}>{esp}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="rol" className="font-elegant">
                          Rol <span className="text-red-500">*</span>
                        </Label>
                        <select
                          id="rol"
                          value={formData.rol}
                          onChange={(e) => setFormData({ ...formData, rol: e.target.value as 'admin' | 'barbero' })}
                          className="w-full px-3 py-2 rounded-md border border-input bg-background font-elegant"
                          required
                        >
                          <option value="barbero">Barbero</option>
                          <option value="admin">Administrador</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="color_tema" className="font-elegant">
                          Color de Tema
                        </Label>
                        <div className="flex items-center gap-3">
                          <Input
                            id="color_tema"
                            type="color"
                            value={formData.color_tema}
                            onChange={(e) => setFormData({ ...formData, color_tema: e.target.value })}
                            className="w-16 h-10 p-1 cursor-pointer"
                          />
                          <span className="font-elegant text-sm text-muted-foreground">
                            {formData.color_tema}
                          </span>
                        </div>
                      </div>
                    </div>

                    {!editingBarber && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="password" className="font-elegant">
                            Contraseña <span className="text-red-500">*</span>
                          </Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="password"
                              type="password"
                              value={formData.password}
                              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                              placeholder="Mínimo 6 caracteres"
                              className="font-elegant pl-10"
                              required={!editingBarber}
                              minLength={6}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword" className="font-elegant">
                            Confirmar Contraseña <span className="text-red-500">*</span>
                          </Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="confirmPassword"
                              type="password"
                              value={formData.confirmPassword}
                              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                              placeholder="Repetir contraseña"
                              className="font-elegant pl-10"
                              required={!editingBarber}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-2 p-4 rounded-lg bg-muted/20 border border-gold/10">
                      <input
                        type="checkbox"
                        id="activo"
                        checked={formData.activo}
                        onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                        className="w-4 h-4 rounded border-gold/30 text-gold focus:ring-gold/20"
                      />
                      <Label htmlFor="activo" className="font-elegant cursor-pointer">
                        Barbero activo (puede atender clientes y acceder al sistema)
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
                        {loading ? 'Guardando...' : editingBarber ? 'Actualizar' : 'Crear Barbero'}
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

export default BarberManagement;
