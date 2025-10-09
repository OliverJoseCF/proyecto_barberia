import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge';
import { Badge } from './badge';
// If Badge is located elsewhere, update the path accordingly.
import { 
  MessageSquare, 
  Send, 
  Clock, 
  AlertTriangle, 
  CheckCircle,
  TrendingUp,
  RefreshCw
} from 'lucide-react';
import { useRecordatorios } from '@/hooks/use-recordatorios';

export const EstadisticasRecordatorios = () => {
  const { 
    recordatorios, 
    obtenerEstadisticasRecordatorios, 
    reenviarRecordatorio,
    enviandoRecordatorio 
  } = useRecordatorios();

  const stats = obtenerEstadisticasRecordatorios();

  const recordatoriosRecientes = recordatorios
    .sort((a, b) => new Date(b.fechaEnvio || '').getTime() - new Date(a.fechaEnvio || '').getTime())
    .slice(0, 5);

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'enviado': return 'bg-green-500/20 text-green-500 border-green-500/50';
      case 'pendiente': return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50';
      case 'fallido': return 'bg-red-500/20 text-red-500 border-red-500/50';
      default: return 'bg-muted/20 text-muted-foreground border-muted/50';
    }
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'confirmacion': return <CheckCircle className="h-3 w-3" />;
      case 'recordatorio': return <Clock className="h-3 w-3" />;
      case 'seguimiento': return <MessageSquare className="h-3 w-3" />;
      default: return <MessageSquare className="h-3 w-3" />;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Estadísticas Generales */}
      <Card className="glass-effect border-gold/20">
        <CardHeader>
          <CardTitle className="font-display text-lg gradient-gold bg-clip-text text-transparent flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-gold" />
            Sistema de Recordatorios
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-display gradient-gold bg-clip-text text-transparent">
                {stats.total}
              </div>
              <p className="text-xs font-elegant text-muted-foreground">Total Programados</p>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-display text-green-500">
                {stats.tasaExito}%
              </div>
              <p className="text-xs font-elegant text-muted-foreground">Tasa de Éxito</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Send className="h-4 w-4 text-green-500" />
                <span className="font-elegant text-sm">Enviados</span>
              </div>
              <Badge className="bg-green-500/20 text-green-500 border-green-500/50">
                {stats.enviados}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-yellow-500" />
                <span className="font-elegant text-sm">Pendientes</span>
              </div>
              <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/50">
                {stats.pendientes}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <span className="font-elegant text-sm">Fallidos</span>
              </div>
              <Badge className="bg-red-500/20 text-red-500 border-red-500/50">
                {stats.fallidos}
              </Badge>
            </div>
          </div>

          {stats.fallidos > 0 && (
            <div className="mt-4 p-3 bg-red-500/10 rounded-lg">
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <AlertTriangle className="h-4 w-4" />
                <span className="font-elegant text-sm">
                  Hay {stats.fallidos} recordatorios fallidos que requieren atención
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recordatorios Recientes */}
      <Card className="glass-effect border-gold/20">
        <CardHeader>
          <CardTitle className="font-display text-lg gradient-gold bg-clip-text text-transparent">
            Actividad Reciente
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recordatoriosRecientes.length === 0 ? (
            <div className="text-center py-6">
              <MessageSquare className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="font-elegant text-muted-foreground text-sm">
                No hay recordatorios recientes
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recordatoriosRecientes.map((recordatorio) => (
                <div 
                  key={recordatorio.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-full ${getEstadoColor(recordatorio.estado)}`}>
                      {getTipoIcon(recordatorio.tipo)}
                    </div>
                    
                    <div>
                      <p className="font-elegant text-sm font-medium">
                        {recordatorio.clienteNombre}
                      </p>
                      <p className="font-elegant text-xs text-muted-foreground">
                        {recordatorio.tipo.charAt(0).toUpperCase() + recordatorio.tipo.slice(1)} • 
                        {recordatorio.fecha} • {recordatorio.hora}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge className={getEstadoColor(recordatorio.estado)}>
                      {recordatorio.estado}
                    </Badge>
                    
                    {recordatorio.estado === 'fallido' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => reenviarRecordatorio(recordatorio.id)}
                        disabled={enviandoRecordatorio}
                        className="h-6 w-6 p-0"
                      >
                        <RefreshCw className={`h-3 w-3 ${enviandoRecordatorio ? 'animate-spin' : ''}`} />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};