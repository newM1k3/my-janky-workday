import React, { useState } from 'react';
import { LayoutList, Clock } from 'lucide-react';
import CardShell from '../components/CardShell';
import ExpandedOverlay from '../components/ExpandedOverlay';
import { trelloMock } from '../mockData/trello';

export default function TrelloCard() {
  const [open, setOpen] = useState(false);
  const d = trelloMock;

  return (
    <>
      <CardShell
        title="Trello"
        icon={<LayoutList size={16} />}
        status="attention"
        statusLabel={`${d.cards.length} due soon`}
        preview={`${d.board} · ${d.cards[0].name}`}
        onClick={() => setOpen(true)}
      />
      {open && (
        <ExpandedOverlay
          title="Trello"
          icon={<LayoutList size={18} />}
          status="attention"
          statusLabel={`${d.cards.length} cards due soon`}
          onClose={() => setOpen(false)}
        >
          <div className="space-y-3">
            <div className="font-mono text-xs text-zinc-500">{d.board}</div>
            <div className="space-y-2">
              {d.cards.map((card, i) => (
                <div key={i} className="flex items-center justify-between bg-zinc-800 rounded-lg px-4 py-3 gap-4">
                  <div className="min-w-0">
                    <div className="font-body text-sm font-medium text-zinc-200 truncate">{card.name}</div>
                    <div className="font-mono text-xs text-zinc-500 mt-0.5">{card.list}</div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <Clock size={11} className="text-amber-400" />
                    <span className="font-mono text-xs text-amber-400">{card.due}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ExpandedOverlay>
      )}
    </>
  );
}
