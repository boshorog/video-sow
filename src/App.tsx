import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { POST_MESSAGE_HEIGHT } from "@/config/pluginIdentity";
import Index from "./pages/Index";
import { useEffect } from "react";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const token = new URLSearchParams(window.location.search).get('frameToken') || undefined;

    let lastHeight = 0;
    let isUpdating = false;
    let lastSentAt = 0;

    const measure = () => {
      const rootEl = document.getElementById('root');
      if (!rootEl) return 0;
      const raw = rootEl.scrollHeight + 24;
      return Math.ceil(raw / 8) * 8;
    };

    const postHeight = () => {
      if (isUpdating) return;
      const now = Date.now();
      const contentHeight = measure();
      if (Math.abs(contentHeight - lastHeight) > 12 && (now - lastSentAt) > 700) {
        isUpdating = true;
        lastHeight = contentHeight;
        lastSentAt = now;
        window.parent?.postMessage({ type: POST_MESSAGE_HEIGHT, height: contentHeight, token }, '*');
        setTimeout(() => { isUpdating = false; }, 250);
      }
    };

    let rafId = 0;
    const schedule = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => postHeight());
    };

    let timeout: number;
    const debouncedSchedule = () => {
      clearTimeout(timeout);
      timeout = window.setTimeout(schedule, 300);
    };

    setTimeout(postHeight, 500);
    setTimeout(postHeight, 1500);
    setTimeout(postHeight, 3000);
    const ro = new ResizeObserver(debouncedSchedule);
    const rootEl = document.getElementById('root');
    if (rootEl) ro.observe(rootEl);

    window.addEventListener('load', postHeight);
    window.addEventListener('resize', debouncedSchedule);

    return () => {
      clearTimeout(timeout);
      cancelAnimationFrame(rafId);
      ro.disconnect();
      window.removeEventListener('load', postHeight);
      window.removeEventListener('resize', debouncedSchedule);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <SonnerToaster position="bottom-right" richColors closeButton />
        <Index />
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
