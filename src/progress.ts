// Progress lives on the device (localStorage). Small and simple.

export type ItemStat = { s: number; n: number; w: number }; // s = correct in a row, n = attempts, w = wrong answers
export type Stats = Record<string, ItemStat>;
export type MockResult = { at: number; score: number; total: number; parts: Record<string, [number, number]> };
export type Progress = { stars: number; stats: Stats; mocks: MockResult[]; days: string[] };

const KEY = 'abc-ksamim-v1';
export const MASTER_STREAK = 2;

export function isMastered(s: ItemStat | undefined): boolean {
  return !!s && s.s >= MASTER_STREAK;
}

export function emptyProgress(): Progress {
  return { stars: 0, stats: {}, mocks: [], days: [] };
}

export function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return emptyProgress();
    const p = JSON.parse(raw) as Partial<Progress>;
    return { stars: p.stars ?? 0, stats: p.stats ?? {}, mocks: p.mocks ?? [], days: p.days ?? [] };
  } catch {
    return emptyProgress();
  }
}

export function saveProgress(p: Progress) {
  try {
    localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    /* storage full or blocked: keep playing */
  }
}

export function dayKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Returns a new Progress with one answer recorded. A first-try correct answer earns a star. */
export function recordAnswer(p: Progress, key: string, correct: boolean, firstTry: boolean, now = new Date()): Progress {
  const old = p.stats[key] ?? { s: 0, n: 0, w: 0 };
  const stat: ItemStat = correct && firstTry ? { s: old.s + 1, n: old.n + 1, w: old.w } : { s: 0, n: old.n + 1, w: old.w + (correct ? 0 : 1) };
  const today = dayKey(now);
  return {
    ...p,
    stars: p.stars + (correct && firstTry ? 1 : 0),
    stats: { ...p.stats, [key]: stat },
    days: p.days.includes(today) ? p.days : [...p.days, today],
  };
}

export function sectionProgress(stats: Stats, section: string, items: string[]): { mastered: number; total: number } {
  return { mastered: items.filter((id) => isMastered(stats[`${section}:${id}`])).length, total: items.length };
}

export function daysUntil(target: Date, now = new Date()): number {
  const a = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const b = new Date(target.getFullYear(), target.getMonth(), target.getDate()).getTime();
  return Math.round((b - a) / 86400000);
}
