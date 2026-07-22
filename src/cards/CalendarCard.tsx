import { useState, useEffect } from 'react';
import { CalendarDays, MapPin, AlertTriangle } from 'lucide-react';
import CardShell from '../components/CardShell';
import ExpandedOverlay from '../components/ExpandedOverlay';
import { calendarMock } from '../mockData/calendar';
import type { CalendarEvent } from '../types';

export default function CalendarCard() {
  const [open, setOpen] = useState(false);
  const [events, setEvents] = useState<CalendarEvent[]>(calendarMock);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/google-calendar')
      .then((r) => { if (!r.ok) throw new Error('fetch failed'); return r.json(); })
      .then((d: CalendarEvent[]) => { setEvents(d); setError(false); })
      .catch(() => { setError(true); setEvents(calendarMock); })
      .finally(() => setLoading(false));
  }, []);

  const next = events[0];

  return (
    <>
      <CardShell
        title="Calendar"
        icon={<CalendarDays size={16} />}
        status={error ? 'attention' : 'live'}
        statusLabel={error ? 'Offline' : loading ? 'Loading…' : `${events.length} event${events.length !== 1 ? 's' : ''}`}
        preview={error ? "Couldn't load calendar" : loading ? 'Fetching events…' : next ? `Next: ${next.time} · ${next.title}` : 'No events today'}
        onClick={() => setOpen(true)}
      />
      {open && (
        <ExpandedOverlay
          title="Calendar"
          icon={<CalendarDays size={18} />}
          status={error ? 'attention' : 'live'}
          statusLabel={error ? 'Offline — cached data' : "Today's schedule"}
          onClose={() => setOpen(false)}
        >
          <div className="space-y-2">
            {error && (
              <div className="flex items-center gap-2 bg-amber-400/10 border border-amber-400/20 rounded-lg px-4 py-3 mb-2">
                <AlertTriangle size={14} className="text-amber-400" />
                <span className="font-mono text-xs text-amber-300">Couldn't reach Google Calendar — showing cached data.</span>
              </div>
            )}
            {events.length === 0 ? (
              <div className="font-mono text-xs text-zinc-500 px-4 py-3">No events today.</div>
            ) : (
              events.map((event, i) => (
                <div key={i} className="flex gap-4 bg-zinc-800 rounded-lg px-4 py-3">
                  <div className="font-mono text-xs text-zinc-400 w-20 flex-shrink-0 pt-0.5">{event.time}</div>
                  <div>
                    <div className="font-body text-sm font-medium text-zinc-200">{event.title}</div>
                    {event.location && (
                      <div className="flex items-center gap-1 mt-1">
                        <MapPin size={11} className="text-zinc-600" />
                        <span className="font-mono text-xs text-zinc-500">{event.location}</span>
                      </div>
                    )}
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
