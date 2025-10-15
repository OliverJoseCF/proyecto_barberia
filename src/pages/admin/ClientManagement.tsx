import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import PageTransition from '@/components/ui/PageTransition';
import { ArrowLeft, Users, Plus, Edit, Trash2, Save, X, Search, Phone, Mail, Calendar, Award, Ban } from 'lucide-react';
import { toast } from 'sonner';

interface Cliente {
  id: string;
  nombre: string;
  telefono: string;
  email: string;
  total_citas: number;
  ultima_visita: string;
  valor_total: number;
  blacklist: boolean;
  notas: string;
}

const ClientManagement = () => {
  const navigate = useNavigate();
  const [clientes, setClientes] = useState<Cliente[]>([
    { id: '1', nombre: 'Pedro García', telefono: '3331234567', email: 'pedro@gmail.com', total_citas: 12, ultima_visita: '2025-01-15', valor_total: 2400, blacklist: false, notas: 'Cliente frecuente' },
    { id: '2', nombre: 'Ana López', telefono: '3339876543', email: 'ana@hotmail.com', total_citas: 5, ultima_visita: '2025-01-10', valor_total: 1000, blacklist: false, notas: '' }
  ]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Cliente | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem('cantabarba_user');
    if (!userData || JSON.parse(userData).rol !== 'admin') navigate('/admin/login');
  }, []);

  const filteredClientes = clientes.filter(c => 
    c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.telefono.includes(searchTerm) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (cliente: Cliente) => {
    setEditing(cliente);
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Eliminar este cliente y su historial?')) {
      setClientes(prev => prev.filter(c => c.id !== id));
      toast.success('Cliente eliminado');
    }
  };

  const toggleBlacklist = (id: string) => {
    setClientes(prev => prev.map(c => c.id === id ? {...c, blacklist: !c.blacklist} : c));
    toast.success('Estado actualizado');
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
                    scale: [1, 1.15, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 3,
                    ease: "easeInOut"
                  }}
                >
                  <Users className="h-8 w-8 text-gold" />
                </motion.div>
                <div>
                  <h1 className="font-display text-2xl gradient-gold bg-clip-text text-transparent">
                    Gestión de Clientes
                  </h1>
                  <p className="font-elegant text-sm text-muted-foreground">
                    Historial y estadísticas de clientes
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
          >
            <Card className="glass-effect border-gold/20 hover:border-gold/40 hover:shadow-xl hover:shadow-gold/10 transition-all duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="font-elegant text-sm text-muted-foreground">Total Clientes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-display gradient-gold bg-clip-text text-transparent">
                {clientes.length}
              </div>
            </CardContent>
          </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
          >
            <Card className="glass-effect border-green-500/20 hover:border-green-500/40 hover:shadow-xl hover:shadow-green-500/10 transition-all duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="font-elegant text-sm text-muted-foreground">Clientes Frecuentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-display text-green-500">
                {clientes.filter(c => c.total_citas >= 5).length}
              </div>
            </CardContent>
          </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
          >
            <Card className="glass-effect border-blue-500/20 hover:border-blue-500/40 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="font-elegant text-sm text-muted-foreground">Valor Promedio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-display text-blue-500">
                ${Math.round(clientes.reduce((sum, c) => sum + c.valor_total, 0) / clientes.length)}
              </div>
            </CardContent>
          </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
          >
            <Card className="glass-effect border-red-500/20 hover:border-red-500/40 hover:shadow-xl hover:shadow-red-500/10 transition-all duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="font-elegant text-sm text-muted-foreground">Blacklist</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-display text-red-500">
                {clientes.filter(c => c.blacklist).length}
              </div>
            </CardContent>
          </Card>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <Card className="glass-effect border-gold/20 mb-6 hover:border-gold/30 transition-all duration-300">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nombre, teléfono o email..."
                className="pl-10 font-elegant"
              />
            </div>
          </CardContent>
        </Card>
        </motion.div>

        <Card className="glass-effect border-gold/20">
          <CardHeader>
            <CardTitle className="font-display gradient-gold bg-clip-text text-transparent">
              Clientes Registrados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredClientes.map((cliente, index) => (
                <motion.div
                  key={cliente.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                  whileHover={{ x: 5, backgroundColor: 'rgba(212, 175, 55, 0.05)', transition: { duration: 0.2 } }}
                  className={`p-4 rounded-lg border transition-all duration-300 ${cliente.blacklist ? 'border-red-500/20 bg-red-500/5' : 'border-gold/10 bg-card/50'}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-display text-lg gradient-gold bg-clip-text text-transparent">
                          {cliente.nombre}
                        </h3>
                        {cliente.blacklist && (
                          <span className="px-2 py-1 rounded-full text-xs bg-red-500/20 text-red-500 flex items-center gap-1">
                            <Ban className="h-3 w-3" />
                            Blacklist
                          </span>
                        )}
                        {cliente.total_citas >= 10 && (
                          <span className="px-2 py-1 rounded-full text-xs bg-gold/20 text-gold flex items-center gap-1">
                            <Award className="h-3 w-3" />
                            VIP
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm mb-2">
                        <div className="flex items-center gap-2 font-elegant text-muted-foreground">
                          <Phone className="h-4 w-4 text-gold" />
                          {cliente.telefono}
                        </div>
                        <div className="flex items-center gap-2 font-elegant text-muted-foreground">
                          <Mail className="h-4 w-4 text-gold" />
                          {cliente.email}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1 font-elegant">
                          <Calendar className="h-4 w-4 text-blue-500" />
                          {cliente.total_citas} citas
                        </span>
                        <span className="font-elegant text-muted-foreground">
                          Última: {new Date(cliente.ultima_visita).toLocaleDateString()}
                        </span>
                        <span className="font-elegant text-green-500">
                          Valor total: ${cliente.valor_total}
                        </span>
                      </div>
                      {cliente.notas && (
                        <p className="mt-2 text-sm font-elegant text-muted-foreground italic">
                          "{cliente.notas}"
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="ghost" onClick={() => handleEdit(cliente)} className="text-blue-500 hover:bg-blue-500/10">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => toggleBlacklist(cliente.id)} className={cliente.blacklist ? 'text-green-500' : 'text-red-500'}>
                        <Ban className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(cliente.id)} className="text-red-500 hover:bg-red-500/10">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>

      <AnimatePresence>
        {showModal && editing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={(e) => e.stopPropagation()} className="w-full max-w-xl">
              <Card className="glass-effect border-gold/20">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="font-display text-2xl gradient-gold bg-clip-text text-transparent">
                      Editar Cliente
                    </CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => setShowModal(false)}>
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <form className="space-y-4">
                    <div className="space-y-2">
                      <Label className="font-elegant">Nombre</Label>
                      <Input value={editing.nombre} className="font-elegant" readOnly />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="font-elegant">Teléfono</Label>
                        <Input value={editing.telefono} className="font-elegant" readOnly />
                      </div>
                      <div className="space-y-2">
                        <Label className="font-elegant">Email</Label>
                        <Input value={editing.email} className="font-elegant" readOnly />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="font-elegant">Notas Internas</Label>
                      <textarea
                        value={editing.notas}
                        onChange={(e) => setEditing({...editing, notas: e.target.value})}
                        className="w-full px-3 py-2 rounded-md border border-input bg-background font-elegant min-h-[100px]"
                        placeholder="Preferencias, alergias, observaciones..."
                      />
                    </div>
                    <div className="flex gap-3 pt-4">
                      <Button type="button" variant="outline" onClick={() => setShowModal(false)} className="flex-1 font-elegant">
                        Cancelar
                      </Button>
                      <Button type="button" onClick={() => { setShowModal(false); toast.success('Cliente actualizado'); }} className="flex-1 gradient-gold text-gold-foreground font-elegant">
                        <Save className="h-4 w-4 mr-2" />
                        Guardar
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

export default ClientManagement;
