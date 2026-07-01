import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface ExpandedOverlayProps {
  title: string;
  icon: React.ReactNode;
  status: 'live' | 'attention' | 'idle';
  statusLabel: string;
  onClose: () => void;
  children: React.ReactNode;
}

const statusColors = {
  live: 'bg-emerald-400',
  attention: 'bg-amber-400',
  idle: 'bg-zinc-500',
};

const statusTextColors = {
  live: 'text-emerald-400',
  attention: 'text-amber-400',
  idle: 'text-zinc-400',
};

export default function ExpandedOverlay({
  title,
  icon,
  status,
  statusLabel,
  onClose,
  children,
}: ExpandedOverlayProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 overflow-y-auto"
      style={{ backgroundColor: 'rgba(9,9,11,0.85)', backdropFilter: 'blur(8px)' }}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-zinc-800">
          <div className="p-2 bg-zinc-800 rounded-lg text-zinc-300">
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-heading text-lg font-semibold text-zinc-100 truncate">{title}</h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span
                className={`w-2 h-2 rounded-full ${statusColors[status]} ${status === 'live' ? 'animate-pulse' : ''}`}
                style={{ animation: status === 'live' ? undefined : 'none' }}
              />
              <span className={`font-mono text-xs ${statusTextColors[status]}`}>{statusLabel}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        {/* Body */}
        <div className="px-6 py-5">
          {children}
        </div>
      </div>
    </div>
  );
}
