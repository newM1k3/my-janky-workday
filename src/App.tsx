import React from 'react';
import WeatherCard from './cards/WeatherCard';
import HomebaseCard from './cards/HomebaseCard';
import EscapeStockCard from './cards/EscapeStockCard';
import CalendarCard from './cards/CalendarCard';
import TrelloCard from './cards/TrelloCard';
import IdeaCaptureCard from './cards/IdeaCaptureCard';
import AppStatusCard from './cards/AppStatusCard';
import GitHubCard from './cards/GitHubCard';
import ChatTasksCard from './cards/ChatTasksCard';

interface Column {
  id: string;
  label: string;
  cards: React.ReactNode[];
}

const columns: Column[] = [
  {
    id: 'operations',
    label: 'Operations',
    cards: [<WeatherCard />, <HomebaseCard />, <EscapeStockCard />],
  },
  {
    id: 'personal',
    label: 'Personal',
    cards: [<CalendarCard />, <TrelloCard />, <IdeaCaptureCard />],
  },
  {
    id: 'systems',
    label: 'Systems',
    cards: [<AppStatusCard />, <GitHubCard />, <ChatTasksCard />],
  },
];

export default function App() {
  return (
    <div className="min-h-screen bg-zinc-950 font-body">
      {/* Header */}
      <header className="border-b border-zinc-800/60 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="font-heading text-xl font-semibold text-zinc-100 tracking-tight">
              My Janky Workday
            </h1>
            <p className="font-mono text-xs text-zinc-500 mt-0.5">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
              })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 motion-safe:animate-pulse" />
            <span className="font-mono text-xs text-zinc-500">Command Center</span>
          </div>
        </div>
      </header>

      {/* Kanban columns */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {columns.map((col) => (
            <div key={col.id} className="flex flex-col gap-3">
              {/* Column header */}
              <div className="mb-1">
                <h2 className="font-heading text-xs font-semibold text-zinc-400 uppercase tracking-widest px-1">
                  {col.label}
                </h2>
                <div className="mt-2 h-px bg-zinc-800" />
              </div>

              {/* Cards */}
              {col.cards.map((card, i) => (
                <React.Fragment key={i}>{card}</React.Fragment>
              ))}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
