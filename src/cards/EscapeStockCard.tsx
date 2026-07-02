import React, { useState, useEffect } from 'react';
import { Package, TrendingUp, AlertTriangle } from 'lucide-react';
import CardShell from '../components/CardShell';
import ExpandedOverlay from '../components/ExpandedOverlay';
import { escapeStockMock } from '../mockData/escapeStock';
import type { EscapeStockData } from '../types';

export default function EscapeStockCard() {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<EscapeStockData>(escapeStockMock);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/escape-stock')
      .then((r) => { if (!r.ok) throw new Error('fetch failed'); return r.json(); })
      .then((d: EscapeStockData) => { setData(d); setError(false); })
      .catch(() => { setError(true); setData(escapeStockMock); })
      .finally(() => setLoading(false));
  }, []);

  const d = data;
  const lowCount = d.lowStock.length;

  return (
    <>
      <CardShell
        title="EscapeStock"
        icon={<Package size={16} />}
        status={error ? 'attention' : lowCount > 0 ? 'attention' : 'live'}
        statusLabel={error ? 'Offline' : loading ? 'Loading…' : `${lowCount} low`}
        preview={error ? "Couldn't load — showing cached data" : loading ? 'Fetching inventory…' : lowCount > 0 ? `${lowCount} item${lowCount > 1 ? 's' : ''} below threshold` : 'All stock levels OK'}
        onClick={() => setOpen(true)}
      />
      {open && (
        <ExpandedOverlay
          title="EscapeStock"
          icon={<Package size={18} />}
          status={error ? 'attention' : lowCount > 0 ? 'attention' : 'live'}
          statusLabel={error ? 'Offline — cached data' : `${lowCount} low stock item${lowCount !== 1 ? 's' : ''}`}
          onClose={() => setOpen(false)}
        >
          <div className="space-y-5">
            {error && (
              <div className="flex items-center gap-2 bg-amber-400/10 border border-amber-400/20 rounded-lg px-4 py-3">
                <AlertTriangle size={14} className="text-amber-400" />
                <span className="font-mono text-xs text-amber-300">Couldn't reach EscapeStock — showing last known data.</span>
              </div>
            )}
            <div>
              <div className="font-mono text-xs text-zinc-500 uppercase tracking-widest mb-3">Low Stock</div>
              {d.lowStock.length === 0 ? (
                <div className="font-mono text-xs text-zinc-500 px-4 py-3">All items above threshold.</div>
              ) : (
                <div className="space-y-2">
                  {d.lowStock.map((item, i) => (
                    <div key={i} className="flex items-center justify-between bg-zinc-800 rounded-lg px-4 py-3">
                      <span className="font-body text-sm text-zinc-200">{item.item}</span>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="font-mono text-sm font-medium text-amber-400">{item.qty}</span>
                          <span className="font-mono text-xs text-zinc-600"> / {item.threshold}</span>
                        </div>
                        <div className="w-16 h-1.5 bg-zinc-700 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-400 rounded-full" style={{ width: `${Math.min((item.qty / item.threshold) * 100, 100)}%` }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 font-mono text-xs text-zinc-500 uppercase tracking-widest mb-3">
                <TrendingUp size={12} />
                Top Consumed This Week
              </div>
              {d.topConsumed.length === 0 ? (
                <div className="font-mono text-xs text-zinc-500 px-4 py-3">No adjustment data for this week.</div>
              ) : (
                <div className="space-y-2">
                  {d.topConsumed.map((item, i) => (
                    <div key={i} className="flex items-center justify-between bg-zinc-800 rounded-lg px-4 py-3">
                      <span className="font-body text-sm text-zinc-200">{item.item}</span>
                      <span className="font-mono text-sm text-zinc-400">{item.usedThisWeek} used</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </ExpandedOverlay>
      )}
    </>
  );
}
