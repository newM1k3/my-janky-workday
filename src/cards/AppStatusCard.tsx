import { useState } from 'react';
import { LayoutGrid } from 'lucide-react';
import CardShell from '../components/CardShell';
import ExpandedOverlay from '../components/ExpandedOverlay';
import { appStatusMock } from '../mockData/appStatus';
import type { AppStage } from '../types';

const stageStyle: Record<AppStage, { dot: string; text: string; bg: string; label: string }> = {
  live: { dot: 'bg-emerald-400', text: 'text-emerald-400', bg: 'bg-emerald-400/10 border border-emerald-400/20', label: 'Live' },
  building: { dot: 'bg-amber-400', text: 'text-amber-400', bg: 'bg-amber-400/10 border border-amber-400/20', label: 'Building' },
  idea: { dot: 'bg-zinc-500', text: 'text-zinc-400', bg: 'bg-zinc-800 border border-zinc-700', label: 'Idea' },
};

export default function AppStatusCard() {
  const [open, setOpen] = useState(false);
  const apps = appStatusMock;
  const live = apps.filter((a) => a.stage === 'live').length;
  const building = apps.filter((a) => a.stage === 'building').length;

  return (
    <>
      <CardShell
        title="App Status Board"
        icon={<LayoutGrid size={16} />}
        status="live"
        statusLabel={`${live} live`}
        preview={`${live} live · ${building} building · ${apps.length - live - building} ideas`}
        onClick={() => setOpen(true)}
      />
      {open && (
        <ExpandedOverlay
          title="App Status Board"
          icon={<LayoutGrid size={18} />}
          status="live"
          statusLabel={`${apps.length} apps tracked`}
          onClose={() => setOpen(false)}
        >
          <div className="space-y-5">
            {(['live', 'building', 'idea'] as AppStage[]).map((stage) => {
              const group = apps.filter((a) => a.stage === stage);
              if (!group.length) return null;
              const s = stageStyle[stage];
              return (
                <div key={stage}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`w-2 h-2 rounded-full ${s.dot}`} />
                    <span className={`font-mono text-xs uppercase tracking-widest ${s.text}`}>{s.label}</span>
                    <span className="font-mono text-xs text-zinc-600">({group.length})</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {group.map((app) => (
                      <span key={app.name} className={`font-mono text-xs px-2.5 py-1 rounded-md ${s.bg} ${s.text}`}>
                        {app.name}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </ExpandedOverlay>
      )}
    </>
  );
}
