import React from 'react';
import type { CardStatus } from '../types';

interface CardShellProps {
  title: string;
  icon: React.ReactNode;
  status: CardStatus;
  statusLabel: string;
  preview: string;
  onClick: () => void;
  children?: React.ReactNode;
}

const statusDotColors: Record<CardStatus, string> = {
  live: 'bg-emerald-400',
  attention: 'bg-amber-400',
  idle: 'bg-zinc-500',
};

const statusTextColors: Record<CardStatus, string> = {
  live: 'text-emerald-400',
  attention: 'text-amber-400',
  idle: 'text-zinc-500',
};

export default function CardShell({
  title,
  icon,
  status,
  statusLabel,
  preview,
  onClick,
}: CardShellProps) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 hover:border-zinc-700 hover:bg-zinc-900 transition-all duration-200 group focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60"
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="p-1.5 bg-zinc-800 rounded-lg text-zinc-400 group-hover:text-zinc-300 transition-colors">
          {icon}
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span
            className={`w-2 h-2 rounded-full flex-shrink-0 ${statusDotColors[status]} ${status === 'live' ? 'motion-safe:animate-pulse' : ''}`}
          />
          <span className={`font-mono text-xs font-medium ${statusTextColors[status]}`}>{statusLabel}</span>
        </div>
      </div>
      <h3 className="font-heading text-sm font-semibold text-zinc-200 group-hover:text-zinc-100 mb-1 transition-colors">
        {title}
      </h3>
      <p className="font-mono text-xs text-zinc-500 leading-relaxed line-clamp-2">{preview}</p>
    </button>
  );
}
