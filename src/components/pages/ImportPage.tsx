import ImporterWidget from '@/components/importer/ImporterWidget';
import { useImporter } from '@/hooks/useImporter';

const ImportPage = () => {
  const imp = useImporter();
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Import</h2>
        <p className="text-muted-foreground mt-1">
          Connect a YouTube playlist and import videos as WordPress posts.
        </p>
      </div>
      <ImporterWidget
        config={imp.config}
        progress={imp.progress}
        stallInfo={imp.stallInfo}
        restingInfo={imp.restingInfo}
        stageInfo={imp.stageInfo}
        cancelPending={imp.cancelPending}
        repairProgress={imp.repairProgress}
        isRepairing={imp.isRepairing}
        onCancelSync={imp.cancelSync}
        onConfigChange={imp.setConfig}
        onSave={imp.save}
      />
    </div>
  );
};

export default ImportPage;
