import React, { useState } from 'react';
import { Users, AlertTriangle } from 'lucide-react';
import CardShell from '../components/CardShell';
import ExpandedOverlay from '../components/ExpandedOverlay';
import { homebaseMock } from '../mockData/homebase';

export default function HomebaseCard() {
  const [open, setOpen] = useState(false);
  const d = homebaseMock;
  const gapCount = d.shifts.filter((s) => s.gap).length;

  return (
    <>
      <CardShell
        title="Homebase Schedule"
        icon={<Users size={16} />}
        status={gapCount > 0 ? 'attention' : 'live'}
        statusLabel={gapCount > 0 ? `${gapCount} gap${gapCount > 1 ? 's' : ''}` : 'Fully staffed'}
        preview={`${d.shifts.length - gapCount} staff on shift${gapCount > 0 ? ` · ${gapCount} uncovered` : ''}`}
        onClick={() => setOpen(true)}
      />
      {open && (
        <ExpandedOverlay
          title="Homebase Schedule"
          icon={<Users size={18} />}
          status={gapCount > 0 ? 'attention' : 'live'}
          statusLabel={gapCount > 0 ? `${gapCount} shift gap${gapCount > 1 ? 's' : ''}` : 'Fully staffed'}
          onClose={() => setOpen(false)}
        >
          <div className="space-y-4">
            <div className="font-mono text-xs text-zinc-500 uppercase tracking-widest">{d.date}</div>
            <div className="space-y-2">
              {d.shifts.map((shift, i) =>
                shift.gap ? (
                  <div
                    key={i}
                    className="flex items-center justify-between bg-amber-400/10 border border-amber-400/20 rounded-lg px-4 py-3"
                  >
                    <div className="flex items-center gap-2">
                      <AlertTriangle size={14} className="text-amber-400" />
                      <span className="font-body text-sm font-medium text-amber-300">{shift.role}</span>
                    </div>
                    <span className="font-mono text-xs text-amber-400/80">{shift.time}</span>
                  </div>
                ) : (
                  <div
                    key={i}
                    className="flex items-center justify-between bg-zinc-800 rounded-lg px-4 py-3"
                  >
                    <div>
                      <div className="font-body text-sm font-medium text-zinc-200">{shift.name}</div>
                      <div className="font-mono text-xs text-zinc-500 mt-0.5">{shift.role}</div>
                    </div>
                    <span className="font-mono text-xs text-zinc-400">{shift.time}</span>
                  </div>
                )
              )}
            </div>
          </div>
        </ExpandedOverlay>
      )}
    </>
  );
}
