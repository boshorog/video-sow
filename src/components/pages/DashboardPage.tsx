import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Youtube, FileText, ListTodo, Settings as SettingsIcon } from 'lucide-react';

const DashboardPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Dashboard</h2>
        <p className="text-muted-foreground mt-1">
          Welcome to Video Sow — automatically turn a YouTube playlist into WordPress articles.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Youtube className="w-4 h-4 text-primary" />
              Imported videos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-slate-800">—</p>
            <p className="text-xs text-muted-foreground mt-1">Connect a playlist to start importing.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="w-4 h-4 text-primary" />
              Articles published
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-slate-800">—</p>
            <p className="text-xs text-muted-foreground mt-1">Articles created from imported videos.</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Getting started</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-600">
          <div className="flex items-start gap-3">
            <SettingsIcon className="w-4 h-4 mt-0.5 text-primary" />
            <span>Add your YouTube and AI API keys under <strong>Settings</strong>.</span>
          </div>
          <div className="flex items-start gap-3">
            <Youtube className="w-4 h-4 mt-0.5 text-primary" />
            <span>Connect a playlist and run an import from the <strong>Import</strong> tab.</span>
          </div>
          <div className="flex items-start gap-3">
            <ListTodo className="w-4 h-4 mt-0.5 text-primary" />
            <span>Customize cleanup and AI templates under <strong>Tasks</strong>.</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardPage;
