import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, Layers, Languages, ListTodo, X, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';
import { PRO_NAME, STORAGE_KEYS, getStorageKey } from '@/config/pluginIdentity';

interface ProWelcomeProps {
  className?: string;
  onDismiss?: () => void;
}

const SHOWN_KEY = getStorageKey('pro_welcome_shown');

const ProWelcome = ({ className = '', onDismiss }: ProWelcomeProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const licenseUpdated = urlParams.get('license_updated');
    const licenseActivated = urlParams.get('license_activated');

    const getWpGlobalSafe = () => {
      let wpGlobal: any = null;
      try { wpGlobal = (window as any).videosowData || (window as any).kindpdfgData || null; } catch {}
      if (!wpGlobal) {
        try { wpGlobal = (window.parent && ((window.parent as any).videosowData || (window.parent as any).kindpdfgData)) || null; } catch {}
      }
      return wpGlobal;
    };

    const isWpProFromGlobal = (wpGlobal: any) =>
      !!(wpGlobal && (wpGlobal.fsIsPro === true || wpGlobal.fsIsPro === 'true' || wpGlobal.fsIsPro === '1' || wpGlobal.fsIsPro === 1));

    let dismissed: string | null = null;
    let shown: string | null = null;
    try {
      dismissed = localStorage.getItem(STORAGE_KEYS.proWelcomeDismissed);
      shown = localStorage.getItem(SHOWN_KEY);
    } catch {}

    const hasLicenseParams = !!licenseUpdated || !!licenseActivated;

    const triggerIfEligible = () => {
      const wpIsPro = isWpProFromGlobal(getWpGlobalSafe());
      const shouldTrigger = wpIsPro && (hasLicenseParams || (!dismissed && !shown));
      if (!shouldTrigger) return false;

      if (hasLicenseParams) {
        try { localStorage.removeItem(STORAGE_KEYS.proWelcomeDismissed); } catch {}
      }
      try { localStorage.setItem(SHOWN_KEY, '1'); } catch {}

      setShouldRender(true);
      setTimeout(() => setIsVisible(true), 100);

      if (hasLicenseParams) {
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('license_updated');
        newUrl.searchParams.delete('license_activated');
        window.history.replaceState({}, '', newUrl.toString());
      }
      return true;
    };

    if (triggerIfEligible()) return;

    const shouldPoll = hasLicenseParams || (!dismissed && !shown);
    if (!shouldPoll) return;

    const maxMs = hasLicenseParams ? 30000 : 5000;
    const startedAt = Date.now();
    const intervalId = window.setInterval(() => {
      if (triggerIfEligible()) { clearInterval(intervalId); return; }
      if (Date.now() - startedAt > maxMs) clearInterval(intervalId);
    }, 250);

    return () => clearInterval(intervalId);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    try {
      localStorage.setItem(STORAGE_KEYS.proWelcomeDismissed, '1');
      localStorage.setItem(SHOWN_KEY, '1');
    } catch {}
    setTimeout(() => {
      setShouldRender(false);
      onDismiss?.();
    }, 300);
  };

  if (!shouldRender) return null;

  const features = [
    { icon: Layers, title: 'Multi-Playlist Imports', description: 'Connect unlimited YouTube playlists and switch between them at import time.' },
    { icon: Languages, title: 'Transcript Extraction', description: 'Pull captions in any language to give every article a real SEO boost.' },
    { icon: ListTodo, title: 'Tasks Workflow', description: 'Queue post-import jobs to rewrite, enrich and schedule articles.' },
  ];

  return (
    <Card className={`border-2 border-orange-500/30 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 overflow-hidden transition-all duration-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'} ${className}`}>
      <CardContent className="p-6 relative">
        <button onClick={handleDismiss} className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors" aria-label="Dismiss welcome message">
          <X className="w-5 h-5 text-muted-foreground" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="flex-shrink-0 w-14 h-14 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/25">
            <Crown className="w-7 h-7 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-foreground">Welcome to {PRO_NAME}!</h2>
              <Sparkles className="w-5 h-5 text-amber-500" />
            </div>
            <p className="text-sm text-muted-foreground">Thank you for upgrading. Here's what you've unlocked:</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {features.map((feature) => (
            <div key={feature.title} className="flex flex-col items-center text-center p-4 rounded-xl bg-white/60 dark:bg-white/5 border border-orange-200/50 dark:border-orange-800/30">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center mb-3 shadow-md">
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">{feature.title}</h3>
              <p className="text-xs text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center gap-3">
          <Button onClick={handleDismiss} className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-medium px-8">
            Get Started
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            If you don't see the new features, a hard refresh may be needed: <span className="font-medium">Ctrl+Shift+R</span> (Windows) or <span className="font-medium">Cmd+Shift+R</span> (Mac)
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProWelcome;
