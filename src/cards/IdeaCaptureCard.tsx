import React, { useState, useEffect, useRef } from 'react';
import { Lightbulb, Plus, Trash2 } from 'lucide-react';
import CardShell from '../components/CardShell';
import ExpandedOverlay from '../components/ExpandedOverlay';
import pb from '../lib/pocketbase';
import type { Idea } from '../types';

function formatTime(iso: string) {
  try {
    return new Date(iso).toLocaleString('en-US', {
      month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export default function IdeaCaptureCard() {
  const [open, setOpen] = useState(false);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const fetchIdeas = async () => {
    try {
      const records = await pb.collection('ideas').getList<Idea>(1, 50, { sort: '-created' });
      setIdeas(records.items);
    } catch (err) {
      console.error('[IdeaCaptureCard] fetchIdeas failed:', err);
    }
  };

  useEffect(() => {
    fetchIdeas();
  }, []);

  const addIdea = async () => {
    const text = input.trim();
    if (!text) return;
    setLoading(true);
    setError(null);
    const optimistic: Idea = { id: `local-${Date.now()}`, text, created: new Date().toISOString() };
    setIdeas((prev) => [optimistic, ...prev]);
    setInput('');
    try {
      const record = await pb.collection('ideas').create<Idea>({ text });
      setIdeas((prev) => prev.map((i) => (i.id === optimistic.id ? record : i)));
    } catch (err) {
      console.error('[IdeaCaptureCard] create failed:', err);
      setError(`Save failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const deleteIdea = async (id: string) => {
    setIdeas((prev) => prev.filter((i) => i.id !== id));
    if (!id.startsWith('local-')) {
      try {
        await pb.collection('ideas').delete(id);
      } catch (err) {
        console.error('[IdeaCaptureCard] delete failed:', err);
      }
    }
  };

  return (
    <>
      <CardShell
        title="Idea Capture"
        icon={<Lightbulb size={16} />}
        status={ideas.length > 0 ? 'live' : 'idle'}
        statusLabel={ideas.length > 0 ? `${ideas.length} idea${ideas.length > 1 ? 's' : ''}` : 'Empty'}
        preview={ideas.length > 0 ? ideas[0].text : 'Tap to capture a new idea'}
        onClick={() => setOpen(true)}
      />
      {open && (
        <ExpandedOverlay
          title="Idea Capture"
          icon={<Lightbulb size={18} />}
          status={ideas.length > 0 ? 'live' : 'idle'}
          statusLabel={`${ideas.length} idea${ideas.length !== 1 ? 's' : ''}`}
          onClose={() => setOpen(false)}
        >
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') addIdea(); }}
                placeholder="Type an idea and press Enter…"
                className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 font-body text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-400/50 focus:ring-1 focus:ring-emerald-400/20 transition-colors"
              />
              <button
                onClick={addIdea}
                disabled={loading || !input.trim()}
                className="px-3 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 rounded-lg text-zinc-900 transition-colors"
              >
                <Plus size={16} />
              </button>
            </div>

            {error && (
              <div className="font-mono text-xs text-amber-400 px-1 break-all">{error}</div>
            )}

            {ideas.length === 0 ? (
              <div className="text-center py-8 font-mono text-sm text-zinc-600">No ideas yet.</div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {ideas.map((idea) => (
                  <div key={idea.id} className="flex items-start gap-3 bg-zinc-800 rounded-lg px-4 py-3 group">
                    <div className="flex-1 min-w-0">
                      <p className="font-body text-sm text-zinc-200">{idea.text}</p>
                      <p className="font-mono text-xs text-zinc-600 mt-1">{formatTime(idea.created)}</p>
                    </div>
                    <button
                      onClick={() => deleteIdea(idea.id)}
                      className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-400 transition-all flex-shrink-0 mt-0.5"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ExpandedOverlay>
      )}
    </>
  );
}
