import { useState, useEffect } from 'react';
import { Cloud, Wind, Droplets, AlertTriangle } from 'lucide-react';
import CardShell from '../components/CardShell';
import ExpandedOverlay from '../components/ExpandedOverlay';
import { weatherMock } from '../mockData/weather';
import type { WeatherData } from '../types';

const WMO_MAP: Record<number, string> = {
  0: 'Clear', 1: 'Mostly Clear', 2: 'Partly Cloudy', 3: 'Overcast',
  45: 'Foggy', 48: 'Foggy', 51: 'Drizzle', 53: 'Drizzle', 55: 'Drizzle',
  61: 'Rain', 63: 'Rain', 65: 'Heavy Rain', 71: 'Snow', 73: 'Snow',
  75: 'Heavy Snow', 80: 'Showers', 81: 'Showers', 82: 'Heavy Showers',
  95: 'Thunderstorm', 96: 'Thunderstorm', 99: 'Thunderstorm',
};

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function cToF(c: number) { return Math.round(c * 9 / 5 + 32); }
function kmhToMph(k: number) { return Math.round(k * 0.621371); }
function wmoLabel(code: number) { return WMO_MAP[code] ?? 'Unknown'; }

function nudge(temp: number, code: number): string {
  if (code <= 1 && temp >= 20) return 'Great day for outdoor promos — push a morning social post.';
  if (code <= 2 && temp >= 15) return 'Decent weather — consider a lunchtime outdoor push.';
  if (code >= 61 && code <= 67) return 'Rainy day — great for indoor escape room promotions!';
  if (code >= 71 && code <= 77) return 'Snowy conditions — highlight the warm indoor experience.';
  if (code >= 95) return 'Stormy outside — perfect day to be inside solving puzzles.';
  return 'Check conditions before scheduling outdoor activities.';
}

export default function WeatherCard() {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<WeatherData>(weatherMock);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Open-Meteo — no API key required, safe to call from frontend
    const url =
      'https://api.open-meteo.com/v1/forecast?' +
      new URLSearchParams({
        latitude: '44.30',
        longitude: '-78.32',
        current: 'temperature_2m,apparent_temperature,weathercode,windspeed_10m,relativehumidity_2m',
        daily: 'weathercode,temperature_2m_max,temperature_2m_min',
        timezone: 'America/Toronto',
        forecast_days: '6',
      });

    fetch(url)
      .then((r) => { if (!r.ok) throw new Error('fetch failed'); return r.json(); })
      .then((d) => {
        const cur = d.current;
        const daily = d.daily;
        const forecast = daily.time.slice(1, 6).map((date: string, i: number) => ({
          day: DAYS[new Date(date).getDay()],
          high: cToF(daily.temperature_2m_max[i + 1]),
          low: cToF(daily.temperature_2m_min[i + 1]),
          condition: wmoLabel(daily.weathercode[i + 1]),
        }));
        setData({
          temp: cToF(cur.temperature_2m),
          feelsLike: cToF(cur.apparent_temperature),
          condition: wmoLabel(cur.weathercode),
          wind: kmhToMph(cur.windspeed_10m),
          humidity: cur.relativehumidity_2m,
          forecast,
          nudge: nudge(cur.temperature_2m, cur.weathercode),
        });
        setError(false);
      })
      .catch(() => setError(true));
  }, []);

  const d = data;

  return (
    <>
      <CardShell
        title="Weather"
        icon={<Cloud size={16} />}
        status={error ? 'attention' : 'live'}
        statusLabel={error ? 'Offline' : `${d.temp}°F · ${d.condition}`}
        preview={error ? "Couldn't load weather" : `${d.temp}°F · ${d.condition} · ${d.nudge}`}
        onClick={() => setOpen(true)}
      />
      {open && (
        <ExpandedOverlay
          title="Weather — Peterborough, ON"
          icon={<Cloud size={18} />}
          status={error ? 'attention' : 'live'}
          statusLabel={error ? 'Offline' : `${d.temp}°F · ${d.condition}`}
          onClose={() => setOpen(false)}
        >
          <div className="space-y-5">
            {error && (
              <div className="flex items-center gap-2 bg-amber-400/10 border border-amber-400/20 rounded-lg px-4 py-3">
                <AlertTriangle size={14} className="text-amber-400" />
                <span className="font-mono text-xs text-amber-300">Couldn't load weather — showing cached data.</span>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-zinc-800 rounded-lg px-4 py-3">
                <div className="font-heading text-3xl font-bold text-zinc-100">{d.temp}°F</div>
                <div className="font-mono text-xs text-zinc-500 mt-1">{d.condition}</div>
              </div>
              <div className="bg-zinc-800 rounded-lg px-4 py-3 space-y-1.5">
                <div className="flex items-center gap-2">
                  <Cloud size={12} className="text-zinc-500" />
                  <span className="font-mono text-xs text-zinc-400">Feels {d.feelsLike}°F</span>
                </div>
                <div className="flex items-center gap-2">
                  <Wind size={12} className="text-zinc-500" />
                  <span className="font-mono text-xs text-zinc-400">{d.wind} mph</span>
                </div>
                <div className="flex items-center gap-2">
                  <Droplets size={12} className="text-zinc-500" />
                  <span className="font-mono text-xs text-zinc-400">{d.humidity}% humidity</span>
                </div>
              </div>
            </div>
            <div className="bg-zinc-800/60 border border-zinc-700/50 rounded-lg px-4 py-3">
              <div className="font-mono text-xs text-emerald-400">{d.nudge}</div>
            </div>
            <div>
              <div className="font-mono text-xs text-zinc-500 uppercase tracking-widest mb-3">5-Day Forecast</div>
              <div className="grid grid-cols-5 gap-2">
                {d.forecast.map((day, i) => (
                  <div key={i} className="bg-zinc-800 rounded-lg px-2 py-3 text-center">
                    <div className="font-mono text-xs text-zinc-500 mb-1">{day.day}</div>
                    <div className="font-mono text-xs text-zinc-200">{day.high}°</div>
                    <div className="font-mono text-xs text-zinc-600">{day.low}°</div>
                    <div className="font-mono text-[10px] text-zinc-500 mt-1 leading-tight">{day.condition}</div>
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
