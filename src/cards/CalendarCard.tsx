import React, { useState } from 'react';
import { CalendarDays, MapPin } from 'lucide-react';
import CardShell from '../components/CardShell';
import ExpandedOverlay from '../components/ExpandedOverlay';
import { calendarMock } from '../mockData/calendar';

export default function CalendarCard() {
  const [open, setOpen] = useState(false);
  const events = calendarMock;
  const next = events[0];

  return (
    <>
      <CardShell
        title="Calendar"
        icon={<CalendarDays size={16} />}
        status="live"
        statusLabel={`${events.length} events`}
        preview={next ? `Next: ${next.time} · ${next.title}` : 'No events today'}
        onClick={() => setOpen(true)}
      />
      {open && (
        <ExpandedOverlay
          title="Calendar"
          icon={<CalendarDays size={18} />}
          status="live"
          statusLabel="Today's schedule"
          onClose={() => setOpen(false)}
        >
          <div className="space-y-2">
            {events.map((event, i) => (
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
            ))}
          </div>
        </ExpandedOverlay>
      )}
    </>
  );
}
