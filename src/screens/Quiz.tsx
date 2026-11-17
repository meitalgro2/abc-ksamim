import { useEffect, useMemo, useRef, useState } from 'react';
import { MockResult, Progress, recordAnswer } from '../progress';
import { checkTyped, makeQuestion, MOCK_PARTS, Question, SectionId } from '../questions';
import { speakEn } from '../speech';
import { Bar, En, Speaker, Stars, TopBar } from '../ui';

type Entry = { q: Question; retry: boolean };
type Result = { q: Question; correct: boolean; given: string };

const SECTION_NAMES: Record<string, string> = {
  abc: 'משחק האותיות', numbers: 'מספרים 1 עד 12', words: 'המילים של המבדק', basic: 'מילים בסיסיות', sentences: 'השלמת משפטים',
  vowels: 'A קצרה או ארוכה', digraphs: 'th · ch · sh', listen: 'האזנה', reading: 'קריאת טקסט', mock: 'מבחן דמה',
};
const PRAISE = ['מעולה!', 'יופי!', 'כל הכבוד!', 'נכון!', 'אלופים!', 'בדיוק!'];

export default function Quiz({ section, questions, progress, update, onExit, onAgain }: {
  section: SectionId | 'mock';
  questions: Question[];
  progress: Progress;
  update: (fn: (p: Progress) => Progress) => void;
  onExit: () => void;
  onAgain: () => void;
}) {
  const isMock = section === 'mock';
  const [queue, setQueue] = useState<Entry[]>(() => questions.map((q) => ({ q, retry: false })));
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [typed, setTyped] = useState('');
  const [typeTries, setTypeTries] = useState(0);
  const [results, setResults] = useState<Result[]>([]);
  const [showHe, setShowHe] = useState(false);
  const [starsAtStart] = useState(progress.stars);
  const saved = useRef(false);

  const entry = queue[idx];
  const q = entry?.q;
  const done = idx >= queue.length;
  const answered = picked !== null;
  const fbRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (answered) fbRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [answered]);

  useEffect(() => {
    setPicked(null);
    setTyped('');
    setTypeTries(0);
    if (q?.autoSay && q.say) {
      const t = setTimeout(() => speakEn(q.say!), 250);
      return () => clearTimeout(t);
    }
  }, [idx, q]);

  // the reading passage keeps its translation toggle per text
  useEffect(() => setShowHe(false), [q?.passage?.title]);

  /** Record the final outcome of the current entry. */
  const finish = (correct: boolean, firstTry: boolean, given: string) => {
    setPicked(given || '·');
    update((p) => recordAnswer(p, q.key, correct, firstTry && !entry.retry));
    if (!entry.retry) setResults((r) => [...r, { q, correct: correct && firstTry, given }]);
    if (!isMock) {
      const after = q.sayAfter ?? (q.options?.find((o) => o.value === q.answer)?.ltr ? q.answer : q.kind === 'type' ? q.answer : undefined);
      if (after) setTimeout(() => speakEn(after), 150);
      // a mistake comes back a few questions later (once)
      if (!(correct && firstTry) && !entry.retry) {
        const id = q.key.slice(q.key.indexOf(':') + 1);
        const again: Entry = { q: makeQuestion(q.section, id), retry: true };
        setQueue((qq) => {
          const at = Math.min(qq.length, idx + 4);
          return [...qq.slice(0, at), again, ...qq.slice(at)];
        });
      }
    }
  };

  const choose = (value: string) => {
    if (answered) return;
    finish(value === q.answer, true, value);
  };

  const submitTyped = () => {
    if (answered || !typed.trim()) return;
    const ok = checkTyped(typed, q.answer);
    if (ok) return finish(true, typeTries === 0, typed);
    if (!isMock && typeTries === 0) {
      setTypeTries(1);
      return;
    }
    finish(false, true, typed);
  };

  const next = () => setIdx((i) => i + 1);

  // mock test: no feedback, go straight on
  useEffect(() => {
    if (isMock && answered) {
      const t = setTimeout(next, 250);
      return () => clearTimeout(t);
    }
  }, [isMock, answered]);

  const summary = useMemo(() => {
    if (!done) return null;
    const parts: Record<string, [number, number]> = {};
    for (const r of results) {
      const name = MOCK_PARTS.find((p) => p.section === r.q.section)?.name ?? r.q.section;
      const cur = parts[name] ?? [0, 0];
      parts[name] = [cur[0] + (r.correct ? 1 : 0), cur[1] + 1];
    }
    return { score: results.filter((r) => r.correct).length, total: results.length, parts };
  }, [done, results]);

  useEffect(() => {
    if (done && isMock && summary && !saved.current) {
      saved.current = true;
      const m: MockResult = { at: Date.now(), ...summary };
      update((p) => ({ ...p, mocks: [...p.mocks, m].slice(-30) }));
    }
  }, [done, isMock, summary, update]);

  if (done && summary) {
    return <Summary isMock={isMock} section={section} summary={summary} results={results} stars={progress.stars - starsAtStart} onExit={onExit} onAgain={onAgain} />;
  }

  const correctNow = answered && (q.kind === 'type' ? checkTyped(picked!, q.answer) && typeTries === 0 : picked === q.answer);

  return (
    <section className="screen quiz">
      <TopBar title={SECTION_NAMES[section]} onBack={onExit} right={<Stars n={progress.stars} />} />
      <Bar value={idx} total={queue.length} />

      {q.passage && (
        <div className="card passage">
          <div className="passage-head">
            <En className="passage-title">{q.passage.title}</En>
            <Speaker text={q.passage.text} label="להקריא" />
          </div>
          <p dir="ltr" className="passage-text">{q.passage.text}</p>
          {!isMock && (
            <button className="link" onClick={() => setShowHe((s) => !s)}>
              {showHe ? 'להסתיר תרגום' : 'לא הבנתי, להראות תרגום'}
            </button>
          )}
          {showHe && <p className="passage-he">{q.passage.he}</p>}
        </div>
      )}

      <div className={`card question ${entry.retry ? 'retry' : ''}`}>
        {entry.retry && <span className="retry-tag">🔁 עוד הזדמנות</span>}
        <p className="q-title">{q.title}</p>
        {q.emoji && <div className="q-emoji" aria-hidden="true">{q.emoji}</div>}
        {q.big && (
          q.bigHe ? <p className="q-big he">{q.big}</p> : <p className={`q-big ${q.big.length > 14 ? 'long' : ''}`} dir="ltr">{q.big}</p>
        )}
        {q.say && <Speaker text={q.say} big={q.autoSay} label={q.autoSay ? 'לשמוע שוב' : undefined} />}
      </div>

      {q.kind === 'choice' && (
        <div className={`options ${q.optionsWide ? 'wide' : ''} ${q.options!.length === 3 ? 'three' : ''} ${q.options!.some((o) => o.emoji) ? 'pics' : ''}`}>
          {q.options!.map((o) => {
            const state = !answered || isMock ? '' : o.value === q.answer ? 'right' : o.value === picked ? 'wrong' : 'dim';
            return (
              <button key={o.value} className={`opt ${state} ${isMock && picked === o.value ? 'picked' : ''}`} onClick={() => choose(o.value)} disabled={answered}>
                {o.emoji && <span className="opt-emoji" aria-hidden="true">{o.emoji}</span>}
                {o.ltr ? <En>{o.label}</En> : o.label}
              </button>
            );
          })}
        </div>
      )}

      {q.kind === 'type' && (
        <TypeBox
          value={answered ? picked! : typed}
          setValue={setTyped}
          disabled={answered}
          onSubmit={submitTyped}
          hint={typeTries === 1 && !answered ? `כמעט! נסו שוב. המילה מתחילה ב-${q.answer[0]} ויש בה ${q.answer.length} אותיות` : undefined}
        />
      )}

      {answered && !isMock && (
        <div ref={fbRef} className={`feedback ${correctNow ? 'good' : 'soft'}`} role="status">
          <b>{correctNow ? `${PRAISE[idx % PRAISE.length]} ⭐` : q.kind === 'type' && checkTyped(picked!, q.answer) ? 'נכון בניסיון השני 👍' : 'לא נורא, ככה לומדים!'}</b>
          {!correctNow && !(q.kind === 'type' && checkTyped(picked!, q.answer)) && (
            <p>
              התשובה הנכונה: <b>{q.options?.find((o) => o.value === q.answer)?.ltr || q.kind === 'type' ? <En>{q.answer}</En> : q.options?.find((o) => o.value === q.answer)?.label}</b>
            </p>
          )}
          {q.after && q.after.split('\n').map((line, i) => <p key={i} className="after">{line}</p>)}
          <button className="btn btn-primary btn-xl" onClick={next} autoFocus>
            {idx + 1 < queue.length ? 'הבא ←' : 'לסיום ←'}
          </button>
        </div>
      )}
    </section>
  );
}

const ROWS = ['abcdefg', 'hijklmn', 'opqrstu', 'vwxyz'];

function TypeBox({ value, setValue, disabled, onSubmit, hint }: { value: string; setValue: (v: string) => void; disabled: boolean; onSubmit: () => void; hint?: string }) {
  return (
    <div className="typebox">
      <div className="typed" dir="ltr" aria-live="polite">
        {value || <span className="placeholder">...</span>}
        {!disabled && <span className="caret" />}
      </div>
      {hint && <p className="hint">💡 {hint}</p>}
      <div className="kbd" dir="ltr">
        {ROWS.map((row) => (
          <div key={row} className="kbd-row">
            {row.split('').map((ch) => (
              <button key={ch} disabled={disabled} onClick={() => value.length < 12 && setValue(value + ch)}>{ch}</button>
            ))}
            {row === 'vwxyz' && (
              <button className="kbd-back" disabled={disabled} onClick={() => setValue(value.slice(0, -1))} aria-label="מחיקה">⌫</button>
            )}
          </div>
        ))}
      </div>
      <button className="btn btn-primary btn-xl" disabled={disabled || !value} onClick={onSubmit}>בדיקה ✓</button>
    </div>
  );
}

function Summary({ isMock, section, summary, results, stars, onExit, onAgain }: {
  isMock: boolean;
  section: string;
  summary: { score: number; total: number; parts: Record<string, [number, number]> };
  results: Result[];
  stars: number;
  onExit: () => void;
  onAgain: () => void;
}) {
  const pct = summary.total ? Math.round((summary.score / summary.total) * 100) : 0;
  const weak = Object.entries(summary.parts).filter(([, [c, t]]) => c / t < 0.8);
  const mistakes = results.filter((r) => !r.correct);
  const face = pct >= 90 ? '🏆' : pct >= 70 ? '🌟' : pct >= 50 ? '💪' : '🌱';
  return (
    <section className="screen center-col">
      <TopBar title={SECTION_NAMES[section]} onBack={onExit} />
      <div className="card summary center-text">
        <div className="big-face" aria-hidden="true">{face}</div>
        {isMock ? (
          <>
            <h2>הציון במבחן הדמה</h2>
            <p className="score">{pct}</p>
            <p className="muted">{summary.score} תשובות נכונות מתוך {summary.total}</p>
          </>
        ) : (
          <>
            <h2>{pct >= 80 ? 'סבב מעולה!' : pct >= 50 ? 'יופי של תרגול!' : 'כל תרגול מקדם!'}</h2>
            <p className="muted">נכון בניסיון הראשון: {summary.score} מתוך {summary.total}</p>
            <p className="earned">⭐ +{stars}</p>
          </>
        )}
      </div>

      {isMock && (
        <div className="card">
          <h3>לפי נושאים</h3>
          {Object.entries(summary.parts).map(([name, [c, t]]) => (
            <div key={name} className="part-row">
              <span>{c === t ? '✅' : c / t >= 0.8 ? '👍' : '📌'} {name}</span>
              <b>{c}/{t}</b>
            </div>
          ))}
          {weak.length > 0 ? (
            <p className="tip">📌 כדאי לתרגל עוד: {weak.map(([n]) => n).join(', ')}</p>
          ) : (
            <p className="tip">🎉 כל הנושאים נראים מצוין!</p>
          )}
        </div>
      )}

      {isMock && mistakes.length > 0 && (
        <details className="card mistakes">
          <summary>לראות את הטעויות ({mistakes.length})</summary>
          {mistakes.map((r, i) => {
            const right = r.q.options?.find((o) => o.value === r.q.answer)?.label ?? r.q.answer;
            const given = r.q.options?.find((o) => o.value === r.given)?.label ?? r.given;
            return (
              <div key={i} className="mistake">
                <small>{r.q.title}</small>
                {r.q.big && <p dir={r.q.bigHe ? 'rtl' : 'ltr'} className="m-q">{r.q.emoji} {r.q.big}</p>}
                {!r.q.big && r.q.say && <p dir="ltr" className="m-q">🔊 {r.q.say}</p>}
                <p>
                  ✗ <span className="m-wrong">{given}</span> · ✓ <b>{right}</b>
                </p>
              </div>
            );
          })}
        </details>
      )}

      <div className="row">
        <button className="btn btn-primary btn-xl" onClick={onAgain}>{isMock ? 'מבחן דמה חדש' : 'עוד סבב'}</button>
        <button className="btn btn-xl" onClick={onExit}>חזרה</button>
      </div>
    </section>
  );
}
