import React, { useState } from 'react';
import { Cloud, Droplets, Wind, Thermometer, Sunrise } from 'lucide-react';
import CardShell from '../components/CardShell';
import ExpandedOverlay from '../components/ExpandedOverlay';
import { weatherMock } from '../mockData/weather';

const conditionIcon: Record<string, string> = {
  Sunny: '☀️',
  'Mostly Sunny': '🌤',
  'Partly Cloudy': '⛅',
  Cloudy: '☁️',
  Rain: '🌧',
};

export default function WeatherCard() {
  const [open, setOpen] = useState(false);
  const d = weatherMock;

  return (
    <>
      <CardShell
        title="Weather"
        icon={<Cloud size={16} />}
        status="live"
        statusLabel="Live Mock"
        preview={`${d.temp}°F · ${d.condition} · Feels ${d.feelsLike}°F`}
        onClick={() => setOpen(true)}
      />
      {open && (
        <ExpandedOverlay
          title="Weather"
          icon={<Cloud size={18} />}
          status="live"
          statusLabel="Live Mock"
          onClose={() => setOpen(false)}
        >
          <div className="space-y-5">
            {/* Current */}
            <div className="flex items-center gap-6">
              <div>
                <div className="font-heading text-5xl font-bold text-zinc-100">{d.temp}°</div>
                <div className="font-body text-sm text-zinc-400 mt-1">{d.condition}</div>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 font-mono text-sm text-zinc-400">
                  <Thermometer size={14} className="text-zinc-500" />
                  Feels like {d.feelsLike}°F
                </div>
                <div className="flex items-center gap-2 font-mono text-sm text-zinc-400">
                  <Wind size={14} className="text-zinc-500" />
                  {d.wind} mph
                </div>
                <div className="flex items-center gap-2 font-mono text-sm text-zinc-400">
                  <Droplets size={14} className="text-zinc-500" />
                  {d.humidity}% humidity
                </div>
              </div>
            </div>

            {/* 5-day forecast */}
            <div>
              <div className="font-mono text-xs text-zinc-500 uppercase tracking-widest mb-2">5-Day Forecast</div>
              <div className="grid grid-cols-5 gap-2">
                {d.forecast.map((day) => (
                  <div key={day.day} className="flex flex-col items-center bg-zinc-800 rounded-lg py-3 gap-1">
                    <span className="font-mono text-xs text-zinc-400">{day.day}</span>
                    <span className="text-lg">{conditionIcon[day.condition] ?? '🌡'}</span>
                    <span className="font-mono text-xs text-zinc-200">{day.high}°</span>
                    <span className="font-mono text-xs text-zinc-500">{day.low}°</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Nudge */}
            <div className="flex items-start gap-3 bg-emerald-400/10 border border-emerald-400/20 rounded-lg px-4 py-3">
              <Sunrise size={16} className="text-emerald-400 mt-0.5 flex-shrink-0" />
              <p className="font-body text-sm text-emerald-300">{d.nudge}</p>
            </div>
          </div>
        </ExpandedOverlay>
      )}
    </>
  );
}
