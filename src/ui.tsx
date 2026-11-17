import { ReactNode } from 'react';
import { canSpeak, speakEn } from './speech';

export function TopBar({ title, onBack, right }: { title: string; onBack?: () => void; right?: ReactNode }) {
  return (
    <header className="topbar">
      {onBack ? (
        <button className="back" onClick={onBack} aria-label="חזרה">
          →
        </button>
      ) : (
        <span />
      )}
      <h1>{title}</h1>
      <div className="topbar-right">{right}</div>
    </header>
  );
}

export function Stars({ n }: { n: number }) {
  return (
    <span className="stars" aria-label={`${n} כוכבים`}>
      ⭐ <b>{n}</b>
    </span>
  );
}

export function Speaker({ text, label, big, onPlay }: { text: string; label?: string; big?: boolean; onPlay?: () => void }) {
  if (!canSpeak() && !onPlay) return null;
  return (
    <button className={`speaker ${big ? 'big' : ''}`} onClick={() => (onPlay ? onPlay() : speakEn(text))} aria-label={label ?? `להשמיע: ${text}`}>
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor" />
        <path d="M16 8.5a4.5 4.5 0 0 1 0 7M18.5 6a8 8 0 0 1 0 12" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      </svg>
      {label && <span>{label}</span>}
    </button>
  );
}

export function Bar({ value, total }: { value: number; total: number }) {
  const pct = total ? Math.round((value / total) * 100) : 0;
  return (
    <div className="bar" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
      <span style={{ width: `${pct}%` }} />
    </div>
  );
}

/** English text inside Hebrew UI. */
export const En = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <span dir="ltr" className={`en ${className}`}>
    {children}
  </span>
);
