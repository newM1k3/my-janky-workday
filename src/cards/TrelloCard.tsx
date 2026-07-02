import React, { useState, useEffect } from 'react';
import { Trello, Clock, AlertTriangle } from 'lucide-react';
import CardShell from '../components/CardShell';
import ExpandedOverlay from '../components/ExpandedOverlay';
import { trelloMock } from '../mockData/trello';
import type { TrelloCard as TrelloCardType } from '../types';

interface TrelloData { board: string; cards: TrelloCardType[] }

export default function TrelloCard() {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<TrelloData>(trelloMock);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/trello-cards')
      .then((r) => { if (!r.ok) throw new Error('fetch failed'); return r.json(); })
      .then((d: TrelloData) => { setData(d); setError(false); })
      .catch(() => { setError(true); setData(trelloMock); })
      .finally(() => setLoading(false));
  }, []);

  const d = data;
  const upcoming = d.cards.filter((c) => c.due);

  return (
    <>
      <CardShell
        title="Trello"
        icon={<Trello size={16} />}
        status={error ? 'attention' : 'live'}
        statusLabel={error ? 'Offline' : loading ? 'Loading…' : `${upcoming.length} due`}
        preview={error ? "Couldn't load Trello" : loading ? 'Fetching cards…' : upcoming[0] ? `Next: ${upcoming[0].name} · ${upcoming[0].due}` : 'No upcoming due dates'}
        onClick={() => setOpen(true)}
      />
      {open && (
        <ExpandedOverlay
          title="Trello — Escape Maze"
          icon={<Trello size={18} />}
          status={error ? 'attention' : 'live'}
          statusLabel={error ? 'Offline' : `${upcoming.length} cards with due dates`}
          onClose={() => setOpen(false)}
        >
          <div className="space-y-3">
            {error && (
              <div className="flex items-center gap-2 bg-amber-400/10 border border-amber-400/20 rounded-lg px-4 py-3">
                <AlertTriangle size={14} className="text-amber-400" />
                <span className="font-mono text-xs text-amber-300">Couldn't reach Trello — showing cached data.</span>
              </div>
            )}
            {upcoming.length === 0 ? (
              <div className="font-mono text-xs text-zinc-500 px-4 py-3">No cards with due dates found.</div>
            ) : (
              upcoming.map((card, i) => (
                <div key={i} className="flex items-start justify-between bg-zinc-800 rounded-lg px-4 py-3 gap-3">
                  <div className="min-w-0">
                    <div className="font-body text-sm font-medium text-zinc-200 truncate">{card.name}</div>
                    <div className="font-mono text-xs text-zinc-500 mt-0.5">{card.board} · {card.list}</div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <Clock size={11} className="text-amber-400" />
                    <span className="font-mono text-xs text-amber-400">{card.due}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </ExpandedOverlay>
      )}
    </>
  );
}
