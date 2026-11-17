import { useEffect, useRef, useState } from 'react';
import type { Screen } from '../App';
import { LETTERS } from '../data';
import { isMastered, Progress } from '../progress';
import { deleteRecording, getRecording, listRecordings, playBlob, playLetter, saveRecording, speakEn, startRecording } from '../speech';
import { En, Speaker, TopBar } from '../ui';

export default function Abc({ progress, start, go, practice }: { progress: Progress; start?: string; go: (s: Screen) => void; practice: () => void }) {
  const [open, setOpen] = useState<number | null>(start ? LETTERS.findIndex((l) => l.up === start) : null);
  const [recorded, setRecorded] = useState<Set<string>>(new Set());
  const refresh = () => listRecordings().then((k) => setRecorded(new Set(k.map(String))));
  useEffect(() => {
    refresh();
  }, []);

  if (open !== null) {
    return <LetterView index={open} setIndex={setOpen} recorded={recorded} onRecorded={refresh} />;
  }

  return (
    <section className="screen">
      <TopBar title="ABC וצלילים" onBack={() => go({ name: 'home' })} />
      <p className="center-text muted">לוחצים על אות כדי לשמוע איך היא נשמעת</p>
      <div className="abc-grid" dir="ltr">
        {LETTERS.map((l, i) => (
          <button key={l.up} className={`abc-key ${isMastered(progress.stats[`abc:${l.up}`]) ? 'known' : ''}`} onClick={() => setOpen(i)} aria-label={`האות ${l.up}`}>
            <b>{l.up}</b>
            <small>{l.up.toLowerCase()}</small>
            <span className="abc-emoji" aria-hidden="true">{l.words[0].emoji}</span>
          </button>
        ))}
      </div>
      <button className="btn btn-primary btn-xl" onClick={practice}>
        🎮 משחק האותיות
      </button>
      <p className="muted small center-text">אות עם רקע ירוק = כבר יודעים אותה</p>
    </section>
  );
}

function LetterView({ index, setIndex, recorded, onRecorded }: { index: number; setIndex: (i: number | null) => void; recorded: Set<string>; onRecorded: () => void }) {
  const l = LETTERS[index];
  const hasRec = recorded.has(l.up);
  const [blob, setBlob] = useState<Blob | null>(null);
  const say = (b: Blob | null = blob) => playLetter(l.up, l.words[0].en, b);
  useEffect(() => {
    let alive = true;
    getRecording(l.up).then((b) => {
      if (!alive) return;
      setBlob(b ?? null);
      say(b ?? null);
    });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, hasRec]);

  return (
    <section className="screen letter-screen">
      <TopBar title={`האות ${l.up}`} onBack={() => setIndex(null)} />
      <div className="card letter-card">
        <button className="letter-big" dir="ltr" onClick={() => say()} aria-label="להשמיע שוב">
          {l.up}
          <span>{l.up.toLowerCase()}</span>
        </button>
        <div className="letter-facts">
          <div>
            <small>שם האות</small>
            <b>{l.name}</b>
          </div>
          <div className="sound">
            <small>הצליל</small>
            <b>{l.sound}</b>
          </div>
        </div>
        {l.tip && <p className="tip">💡 {l.tip}</p>}
        <Speaker text="" label={hasRec ? 'לשמוע את הצליל' : 'לשמוע'} big onPlay={() => say()} />
      </div>

      <div className="examples">
        {l.words.map((w) => (
          <button key={w.en} className="example" onClick={() => speakEn(w.en)}>
            <span className="ex-emoji" aria-hidden="true">{w.emoji}</span>
            <En className="ex-word">
              {l.atEnd ? (
                <>
                  {w.en.slice(0, -1)}
                  <mark>{w.en.slice(-1)}</mark>
                </>
              ) : (
                <>
                  <mark>{w.en[0]}</mark>
                  {w.en.slice(1)}
                </>
              )}
            </En>
            <small>{w.he}</small>
          </button>
        ))}
      </div>

      <div className="row nav-row">
        <button className="btn" disabled={index === 0} onClick={() => setIndex(index - 1)}>→ {index > 0 ? LETTERS[index - 1].up : ''}</button>
        <button className="btn" disabled={index === LETTERS.length - 1} onClick={() => setIndex(index + 1)}>{index < LETTERS.length - 1 ? LETTERS[index + 1].up : ''} ←</button>
      </div>

      <Recorder letter={l.up} hasRec={hasRec} onChange={onRecorded} />
    </section>
  );
}

/** Parents can record the real sound of the letter (the phone's voice can only say the letter's name). */
function Recorder({ letter, hasRec, onChange }: { letter: string; hasRec: boolean; onChange: () => void }) {
  const [state, setState] = useState<'idle' | 'rec' | 'error'>('idle');
  const stopRef = useRef<() => void>();
  const supported = typeof window !== 'undefined' && !!navigator.mediaDevices?.getUserMedia && 'MediaRecorder' in window;
  useEffect(() => () => stopRef.current?.(), []);
  if (!supported) return null;

  const record = async () => {
    try {
      const r = await startRecording(3000);
      stopRef.current = r.stop;
      setState('rec');
      const blob = await r.done;
      stopRef.current = undefined;
      if (blob.size > 0) {
        await saveRecording(letter, blob);
        onChange();
        playBlob(blob);
      }
      setState('idle');
    } catch {
      setState('error');
    }
  };

  return (
    <details className="recorder">
      <summary>🎙️ להורים: להקליט את הצליל של {letter} בקול שלכם</summary>
      <p className="small">
        הקול של הטלפון אומר את <b>שם</b> האות, ולא את הצליל שלה. אם תקליטו כאן את הצליל ("{LETTERS.find((x) => x.up === letter)!.sound}"), הילדים ישמעו אותו בקול שלכם. ההקלטה עד 3 שניות ונשמרת רק בטלפון הזה.
      </p>
      <div className="row">
        {state === 'rec' ? (
          <button className="btn btn-rec" onClick={() => stopRef.current?.()}>⏹️ מקליטים… לסיום</button>
        ) : (
          <button className="btn" onClick={record}>{hasRec ? '🔁 להקליט מחדש' : '🔴 להקליט'}</button>
        )}
        {hasRec && state !== 'rec' && (
          <>
            <button className="btn" onClick={() => getRecording(letter).then((b) => b && playBlob(b))}>▶️ לשמוע</button>
            <button className="btn" onClick={() => deleteRecording(letter).then(onChange)}>🗑️ למחוק</button>
          </>
        )}
      </div>
      {state === 'error' && <p className="error small">לא הצלחנו להקליט. צריך לאשר גישה למיקרופון.</p>}
    </details>
  );
}
