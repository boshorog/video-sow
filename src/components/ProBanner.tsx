import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, ExternalLink, Zap, Check, ListTodo, Languages, Layers } from 'lucide-react';
import { useLicense } from '@/hooks/useLicense';
import { PRO_NAME } from '@/config/pluginIdentity';

interface ProBannerProps {
  className?: string;
  showComparison?: boolean;
}

const FeatureRow = ({ feature, free, pro }: { feature: string; free: boolean | string; pro: boolean | string }) => (
  <tr className="border-b border-border/50">
    <td className="py-3 px-4 text-sm">{feature}</td>
    <td className="py-3 px-4 text-center">
      {typeof free === 'boolean' ? (
        free ? <Check className="w-5 h-5 text-green-500 mx-auto" /> : <span className="w-5 h-5 text-muted-foreground/50 mx-auto">—</span>
      ) : (
        <span className="text-sm text-muted-foreground">{free}</span>
      )}
    </td>
    <td className="py-3 px-4 text-center">
      {typeof pro === 'boolean' ? (
        pro ? <Check className="w-5 h-5 text-green-500 mx-auto" /> : <span className="w-5 h-5 text-muted-foreground/50 mx-auto">—</span>
      ) : (
        <span className="text-sm font-medium text-primary">{pro}</span>
      )}
    </td>
  </tr>
);

const ProBanner = ({ className = '', showComparison = false }: ProBannerProps) => {
  const license = useLicense();

  if (license.checked && (license.isPro || ['pro', 'trial', 'premium'].includes(String(license.status).toLowerCase()))) {
    return null;
  }

  return (
    <Card className={`border-gradient-to-r from-orange-500/20 to-red-500/20 bg-gradient-to-r from-orange-50/50 to-red-50/50 dark:from-orange-950/20 dark:to-red-950/20 ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
            <Crown className="w-6 h-6 text-white" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-bold text-foreground">Upgrade to {PRO_NAME}</h3>
              <div className="px-2 py-1 text-xs font-medium bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full">
                Pro
              </div>
            </div>

            <p className="text-sm text-muted-foreground mb-4">
              Unlock multi-playlist imports, automated transcript extraction and the Tasks workflow to scale your YouTube-to-WordPress pipeline.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="flex items-center gap-3">
                <Layers className="w-6 h-6 text-orange-500" />
                <span className="text-lg font-semibold">Multi-Playlist</span>
              </div>
              <div className="flex items-center gap-3">
                <Languages className="w-6 h-6 text-orange-500" />
                <span className="text-lg font-semibold">Transcripts (SEO)</span>
              </div>
              <div className="flex items-center gap-3">
                <ListTodo className="w-6 h-6 text-orange-500" />
                <span className="text-lg font-semibold">Tasks Workflow</span>
              </div>
            </div>

            <div className="w-full flex justify-center">
              <div className="w-full max-w-md">
                <Button
                  className="w-full h-10 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-medium"
                  onClick={() => window.open('https://checkout.freemius.com/plugin/18355/plan/', '_blank')}
                >
                  Get {PRO_NAME}
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>

      {showComparison && (
        <CardContent className="pt-0 pb-6">
          <div className="border-t pt-6">
            <h4 className="text-base font-semibold mb-4 flex items-center gap-2">
              Free vs Pro Comparison
              <Crown className="w-4 h-4 text-amber-500" />
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="py-3 px-4 text-left text-sm font-semibold">Feature</th>
                    <th className="py-3 px-4 text-center text-sm font-semibold">Free</th>
                    <th className="py-3 px-4 text-center text-sm font-semibold">
                      <span className="inline-flex items-center gap-1">
                        Pro <Crown className="w-4 h-4 text-amber-500" />
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <FeatureRow feature="YouTube playlists" free="1" pro="Unlimited" />
                  <FeatureRow feature="Automatic sync (cron)" free={true} pro={true} />
                  <FeatureRow feature="Custom interval, batch size & pauses" free={true} pro={true} />
                  <FeatureRow feature="Per-video WordPress article" free={true} pro={true} />
                  <FeatureRow feature="YouTube Data API v3 fetching" free={true} pro={true} />
                  <FeatureRow feature="Transcript extraction (multi-language SEO)" free={false} pro={true} />
                  <FeatureRow feature="YouTube OAuth for transcript backup" free={false} pro={true} />
                  <FeatureRow feature="Tasks workflow & content automation" free={false} pro={true} />
                  <FeatureRow feature="Archive of imported articles" free={true} pro={true} />
                  <FeatureRow feature="Priority support" free={false} pro={true} />
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default ProBanner;
