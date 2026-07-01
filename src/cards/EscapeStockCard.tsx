import React, { useState } from 'react';
import { Package, TrendingUp } from 'lucide-react';
import CardShell from '../components/CardShell';
import ExpandedOverlay from '../components/ExpandedOverlay';
import { escapeStockMock } from '../mockData/escapeStock';

export default function EscapeStockCard() {
  const [open, setOpen] = useState(false);
  const d = escapeStockMock;

  return (
    <>
      <CardShell
        title="EscapeStock"
        icon={<Package size={16} />}
        status="attention"
        statusLabel={`${d.lowStock.length} low stock`}
        preview={`${d.lowStock[0].item} at ${d.lowStock[0].qty} · ${d.lowStock.length} items need restocking`}
        onClick={() => setOpen(true)}
      />
      {open && (
        <ExpandedOverlay
          title="EscapeStock"
          icon={<Package size={18} />}
          status="attention"
          statusLabel={`${d.lowStock.length} items low`}
          onClose={() => setOpen(false)}
        >
          <div className="space-y-6">
            <div>
              <div className="font-mono text-xs text-zinc-500 uppercase tracking-widest mb-3">Low Stock</div>
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
                        <div
                          className="h-full bg-amber-400 rounded-full"
                          style={{ width: `${Math.min((item.qty / item.threshold) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 font-mono text-xs text-zinc-500 uppercase tracking-widest mb-3">
                <TrendingUp size={12} />
                Top Consumed This Week
              </div>
              <div className="space-y-2">
                {d.topConsumed.map((item, i) => (
                  <div key={i} className="flex items-center justify-between bg-zinc-800 rounded-lg px-4 py-3">
                    <span className="font-body text-sm text-zinc-200">{item.item}</span>
                    <span className="font-mono text-sm text-zinc-400">{item.usedThisWeek} used</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ExpandedOverlay>
      )}
    </>
  );
}
