import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, X, Smartphone, Monitor } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detectar iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Escuchar evento beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Mostrar prompt después de 3 segundos si no está instalado
      setTimeout(() => {
        if (!window.matchMedia('(display-mode: standalone)').matches) {
          setShowPrompt(true);
        }
      }, 3000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Para iOS, mostrar instrucciones después de un tiempo
    if (iOS && !(window.navigator as any).standalone) {
      setTimeout(() => {
        setShowPrompt(true);
      }, 5000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // No mostrar de nuevo por 24 horas
    localStorage.setItem('installPromptDismissed', Date.now().toString());
  };

  // No mostrar si fue dismisseado recientemente
  useEffect(() => {
    const dismissed = localStorage.getItem('installPromptDismissed');
    if (dismissed) {
      const dismissTime = parseInt(dismissed);
      const dayInMs = 24 * 60 * 60 * 1000;
      if (Date.now() - dismissTime < dayInMs) {
        setShowPrompt(false);
      }
    }
  }, []);

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <Card className="glass-effect border-gold/20 shadow-2xl">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isIOS ? <Smartphone className="h-5 w-5 text-gold" /> : <Monitor className="h-5 w-5 text-gold" />}
              <CardTitle className="font-display text-lg gradient-gold bg-clip-text text-transparent">
                Instalar App
              </CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription className="font-elegant text-sm">
            {isIOS 
              ? 'Agrega CantaBarba a tu pantalla de inicio para acceso rápido'
              : 'Instala CantaBarba para una experiencia nativa'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          {isIOS ? (
            <div className="space-y-3">
              <div className="text-xs text-muted-foreground font-elegant">
                1. Toca el botón de compartir <span className="inline-block">📤</span><br />
                2. Selecciona "Añadir a pantalla de inicio"<br />
                3. Toca "Añadir"
              </div>
            </div>
          ) : (
            <Button 
              onClick={handleInstallClick}
              className="w-full gradient-gold text-background hover:opacity-90"
              disabled={!deferredPrompt}
            >
              <Download className="h-4 w-4 mr-2" />
              Instalar App
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InstallPrompt;