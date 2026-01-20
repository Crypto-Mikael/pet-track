'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { X, Download, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallDialog, setShowInstallDialog] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    const checkIfInstalled = () => {
      const isStandaloneMode = 
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone ||
        document.referrer.includes('android-app://');
      
      setIsStandalone(isStandaloneMode);
    };

    // Check if device is iOS
    const checkIfIOS = () => {
      const userAgent = window.navigator.userAgent.toLowerCase();
      return /iphone|ipad|ipod/.test(userAgent);
    };

    checkIfInstalled();
    setIsIOS(checkIfIOS());

    // Check if user has previously dismissed
    const hasDismissed = localStorage.getItem('pwa-install-dismissed');
    if (hasDismissed) {
      setDismissed(true);
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show install dialog after a delay (only on mobile and not installed)
      setTimeout(() => {
        if (!isStandalone && !dismissed && window.innerWidth <= 768) {
          setShowInstallDialog(true);
        }
      }, 3000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [isStandalone, dismissed]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowInstallDialog(false);
    }
  };

  const handleDismiss = () => {
    setShowInstallDialog(false);
    setDismissed(true);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  // Don't show if already installed or dismissed
  if (isStandalone || dismissed || (!deferredPrompt && !isIOS)) {
    return null;
  }

  // For iOS, we can't use the install prompt, so show manual instructions
  if (isIOS) {
    return (
      <Dialog open={showInstallDialog} onOpenChange={setShowInstallDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              Instale o Pet Track
            </DialogTitle>
            <DialogDescription>
              Instale nosso aplicativo em sua tela inicial para acesso rápido e offline.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <h4 className="font-medium">Para instalar no iOS:</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                <li>Toque no ícone de compartilhar <span className="font-mono bg-muted px-1 rounded">⎋</span> na barra inferior</li>
                <li>Role para baixo e toque em "Adicionar à Tela de Início"</li>
                <li>Toque em "Adicionar" para confirmar</li>
              </ol>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={handleDismiss}>
              Talvez depois
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // For Android/Chrome with install prompt
  return (
    <Dialog open={showInstallDialog} onOpenChange={setShowInstallDialog}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Instale o Pet Track
          </DialogTitle>
          <DialogDescription>
            Instale nosso aplicativo para acesso rápido, notificações e uso offline.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="bg-muted/50 rounded-lg p-3">
            <h4 className="font-medium mb-2">Benefícios:</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Acesso rápido da tela inicial</li>
              <li>• Funciona offline</li>
              <li>• Notificações push</li>
              <li>• Experiência nativa</li>
            </ul>
          </div>
        </div>
        
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleDismiss}>
            Talvez depois
          </Button>
          <Button onClick={handleInstallClick} className="gap-2">
            <Download className="h-4 w-4" />
            Instalar Agora
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}