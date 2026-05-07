import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Youtube } from 'lucide-react';

const ImportPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Import</h2>
        <p className="text-muted-foreground mt-1">
          Connect a YouTube playlist and import videos as WordPress articles.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Youtube className="w-4 h-4 text-primary" />
            Playlist importer
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            The Sermon Importer widget will be ported here in the next pass — playlist sync,
            transcript fetching, AI processing, and article publishing.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ImportPage;
