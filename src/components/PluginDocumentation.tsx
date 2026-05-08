import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Crown, Check, X, Trash2, BookOpen, Zap, Settings, Youtube, Languages, ListTodo, Wrench, KeyRound } from 'lucide-react';
import { useLicense } from '@/hooks/useLicense';
import { useToast } from '@/hooks/use-toast';
import { PLUGIN_VERSION, PLUGIN_NAME, PRO_NAME, PLUGIN_PREFIX, AJAX_ACTION } from '@/config/pluginIdentity';

interface PluginDocumentationProps {
  className?: string;
  showOnlyLicenseAndComparison?: boolean;
}

const PluginDocumentation: React.FC<PluginDocumentationProps> = ({ className, showOnlyLicenseAndComparison = false }) => {
  const license = useLicense();
  const [isRemovingLicense, setIsRemovingLicense] = useState(false);
  const { toast } = useToast();

  const getLicenseOwner = () => {
    try {
      const wpGlobal = (window as any).videosowData || (window as any).kindpdfgData || (window.parent as any)?.videosowData;
      return wpGlobal?.licensedTo || 'Pro User';
    } catch {
      return 'Pro User';
    }
  };

  const handleRemoveLicense = async () => {
    setIsRemovingLicense(true);
    try {
      const wpGlobal = (window as any).videosowData || (window.parent as any)?.videosowData;
      const ajaxUrl = wpGlobal?.ajaxUrl || (window as any).ajaxurl;
      const nonce = wpGlobal?.nonce;

      if (!ajaxUrl || !nonce) {
        toast({ title: 'Unable to remove license', description: 'WordPress AJAX not available', variant: 'destructive' });
        return;
      }

      const form = new FormData();
      form.append('action', `${PLUGIN_PREFIX}_freemius_deactivate`);
      form.append('nonce', nonce);

      const response = await fetch(ajaxUrl, { method: 'POST', credentials: 'same-origin', body: form });
      const data = await response.json();

      if (data?.success) {
        toast({ title: 'License removed', description: 'Your license has been deactivated. Reloading...' });
        setTimeout(() => window.location.reload(), 1500);
      } else {
        toast({ title: 'Failed to remove license', description: data?.data?.message || 'Unknown error', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error removing license', description: 'Please try again', variant: 'destructive' });
    } finally {
      setIsRemovingLicense(false);
    }
  };

  const FeatureRow = ({ feature, free, pro }: { feature: string; free: boolean | string; pro: boolean | string }) => (
    <tr className="border-b border-border/50">
      <td className="py-3 px-4 text-sm">{feature}</td>
      <td className="py-3 px-4 text-center">
        {typeof free === 'boolean' ? (
          free ? <Check className="w-5 h-5 text-green-500 mx-auto" /> : <X className="w-5 h-5 text-muted-foreground/50 mx-auto" />
        ) : (
          <span className="text-sm text-muted-foreground">{free}</span>
        )}
      </td>
      <td className="py-3 px-4 text-center">
        {typeof pro === 'boolean' ? (
          pro ? <Check className="w-5 h-5 text-green-500 mx-auto" /> : <X className="w-5 h-5 text-muted-foreground/50 mx-auto" />
        ) : (
          <span className="text-sm font-medium text-primary">{pro}</span>
        )}
      </td>
    </tr>
  );

  const ComparisonTable = () => (
    <table className="w-full border-collapse">
      <thead>
        <tr className="bg-muted/50">
          <th className="py-3 px-4 text-left text-sm font-semibold">Feature</th>
          <th className="py-3 px-4 text-center text-sm font-semibold">Free</th>
          <th className="py-3 px-4 text-center text-sm font-semibold">
            <span className="inline-flex items-center gap-1">Pro <Crown className="w-4 h-4 text-amber-500" /></span>
          </th>
        </tr>
      </thead>
      <tbody>
        <FeatureRow feature="YouTube playlists" free="1" pro="Unlimited" />
        <FeatureRow feature="Automatic sync (custom interval)" free={true} pro={true} />
        <FeatureRow feature="Per-video WordPress article" free={true} pro={true} />
        <FeatureRow feature="YouTube Data API v3 fetching" free={true} pro={true} />
        <FeatureRow feature="Archive of imported articles" free={true} pro={true} />
        <FeatureRow feature="Transcript extraction (SEO)" free={false} pro={true} />
        <FeatureRow feature="YouTube OAuth (transcript backup)" free={false} pro={true} />
        <FeatureRow feature="Tasks workflow" free={false} pro={true} />
        <FeatureRow feature="Priority support" free={false} pro={true} />
      </tbody>
    </table>
  );

  if (showOnlyLicenseAndComparison) {
    return (
      <div className={className}>
        {license.isPro && license.checked && (
          <Card className="mb-6 border-primary/30 bg-gradient-to-r from-primary/5 to-transparent">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-primary/10">
                    <Crown className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      Licensed to: <span className="text-primary">{getLicenseOwner()}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">{PRO_NAME} v{PLUGIN_VERSION}</p>
                  </div>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive">
                      <Trash2 className="w-4 h-4 mr-1" />
                      Remove License
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Remove Pro License?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will deactivate your Pro license and revert to the Free version. You can reactivate it later using your license key.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleRemoveLicense} disabled={isRemovingLicense} className="bg-destructive hover:bg-destructive/90">
                        {isRemovingLicense ? 'Removing...' : 'Remove License'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Free vs Pro Comparison
              <Crown className="w-5 h-5 text-amber-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto"><ComparisonTable /></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-center gap-2">
            <BookOpen className="w-5 h-5" />
            {PLUGIN_NAME} Documentation
            <Badge variant="secondary" className="ml-2">v{PLUGIN_VERSION}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">

            <AccordionItem value="getting-started">
              <AccordionTrigger className="text-base font-semibold">
                <div className="flex items-center gap-2"><Zap className="w-4 h-4 text-blue-500" /> Getting Started</div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 text-sm">
                  <div>
                    <h4 className="font-medium mb-2 text-base border-b border-border pb-2">1. Add your YouTube Data API v3 key</h4>
                    <p className="text-muted-foreground">
                      Open <strong>Settings</strong> and paste a YouTube Data API v3 key. Generate one from
                      Google Cloud Console → APIs &amp; Services → Credentials, after enabling the
                      <em> YouTube Data API v3</em>.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2 text-base border-b border-border pb-2">2. Connect a playlist</h4>
                    <p className="text-muted-foreground">
                      Paste any YouTube playlist URL or ID in the Playlist field. {PLUGIN_NAME} will pull the title,
                      description and thumbnail of every video and turn each into a draft / published WordPress article.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2 text-base border-b border-border pb-2">3. Configure automatic sync</h4>
                    <p className="text-muted-foreground">
                      Choose an interval (minutes / hours / days) and tweak the relaxed-mode pauses to stay friendly with
                      the YouTube quota. {PLUGIN_NAME} will keep checking for new videos and import them in batches.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2 text-base border-b border-border pb-2">4. Run your first import</h4>
                    <p className="text-muted-foreground">
                      Hit <strong>Run Import</strong> on the Import page. Once it completes, the Archive panel will list
                      every article that was created.
                    </p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="settings">
              <AccordionTrigger className="text-base font-semibold">
                <div className="flex items-center gap-2"><Settings className="w-4 h-4 text-slate-500" /> Settings reference</div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p><strong>YouTube Data API v3 Key</strong> — required to fetch video metadata.</p>
                  <p><strong>Playlist</strong> — the playlist URL or ID to monitor (Pro: multiple playlists).</p>
                  <p><strong>Automatic sync</strong> — interval in minutes, hours or days.</p>
                  <p><strong>Relaxed mode</strong> — pause between videos, batch size and pause between batches.</p>
                  <p><strong>Default post status</strong> — draft, pending, private or publish.</p>
                  <p><strong>Slug</strong> — controls the URL prefix used for imported articles.</p>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="import">
              <AccordionTrigger className="text-base font-semibold">
                <div className="flex items-center gap-2"><Youtube className="w-4 h-4 text-red-500" /> Importing videos</div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p>The Import page shows the connected playlist, total imported videos, the active interval and the article slug.</p>
                  <p>Click <strong>Run Import</strong> to trigger a manual sync; otherwise the cron handles it automatically.</p>
                  <p>The Archive section lists every imported article with a direct link to its WordPress post.</p>
                </div>
              </AccordionContent>
            </AccordionItem>

            {license.isPro && (
              <>
                <AccordionItem value="transcripts">
                  <AccordionTrigger className="text-base font-semibold">
                    <div className="flex items-center gap-2"><Languages className="w-4 h-4 text-emerald-500" /> Transcripts (Pro)</div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 text-sm text-muted-foreground">
                      <p>Enable <strong>Fetch transcript (SEO)</strong> in Settings to automatically pull captions and embed them in the post body for richer indexing.</p>
                      <p>Specify language priorities (e.g. <code>en, es, fr</code>) — leave empty to use whatever is available.</p>
                      <p>If InnerTube fails, configure <strong>YouTube OAuth</strong> as a backup to retrieve captions through the official Data API.</p>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="tasks">
                  <AccordionTrigger className="text-base font-semibold">
                    <div className="flex items-center gap-2"><ListTodo className="w-4 h-4 text-violet-500" /> Tasks workflow (Pro)</div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 text-sm text-muted-foreground">
                      <p>The Tasks page lets you queue post-import jobs — rewrite titles, generate excerpts, enrich tags or schedule publication windows.</p>
                      <p>Tasks run sequentially, respecting your relaxed-mode pauses to avoid hammering external APIs.</p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </>
            )}

            <AccordionItem value="troubleshooting">
              <AccordionTrigger className="text-base font-semibold">
                <div className="flex items-center gap-2"><Wrench className="w-4 h-4 text-orange-500" /> Troubleshooting</div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p>Use the <strong>Diagnostic tools</strong> at the bottom of Settings to repair the local database, clear stale jobs or re-run the last import.</p>
                  <p>If imports stop, double-check your API key quota in Google Cloud Console.</p>
                  <p>AJAX action: <code>{AJAX_ACTION}</code>. Plugin prefix: <code>{PLUGIN_PREFIX}_</code>.</p>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="license">
              <AccordionTrigger className="text-base font-semibold">
                <div className="flex items-center gap-2"><KeyRound className="w-4 h-4 text-amber-500" /> License &amp; updates</div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p>Free updates are delivered through WordPress.org. Pro updates flow through Freemius — no extra setup required after activating your license.</p>
                  <p>Manage your license from the <strong>Pro</strong> tab.</p>
                </div>
              </AccordionContent>
            </AccordionItem>

          </Accordion>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Free vs Pro Comparison
            <Crown className="w-5 h-5 text-amber-500" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto"><ComparisonTable /></div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PluginDocumentation;
