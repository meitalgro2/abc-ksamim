import type { Screen } from '../App';
import { TEST_DATE } from '../data';
import { daysUntil, Progress, sectionProgress } from '../progress';
import { SECTION_ITEMS, SectionId } from '../questions';
import { Bar, Stars } from '../ui';
import type { LearnId } from './Learn';

type Tile = { id: SectionId; icon: string; title: string; sub: string; learn?: 'abc' | LearnId };

const TILES: Tile[] = [
  { id: 'abc', icon: '🔤', title: 'ABC וצלילים', sub: 'כל אות והצליל שלה', learn: 'abc' },
  { id: 'numbers', icon: '🔢', title: 'מספרים 1 עד 12', sub: 'לקרוא ולכתוב', learn: 'numbers' },
  { id: 'words', icon: '📚', title: 'המילים של המבדק', sub: 'מילה ופירוש', learn: 'words' },
  { id: 'sentences', icon: '✏️', title: 'השלמת משפטים', sub: 'מילה מהמחסן' },
  { id: 'vowels', icon: '🎂', title: 'A קצרה או ארוכה', sub: 'cat או cake?', learn: 'vowels' },
  { id: 'digraphs', icon: '🚢', title: 'th · ch · sh', sub: 'משלימים לפי תמונה', learn: 'digraphs' },
  { id: 'listen', icon: '👂', title: 'האזנה', sub: 'שומעים ובוחרים' },
  { id: 'reading', icon: '📖', title: 'קריאת טקסט', sub: 'נכון או לא נכון' },
  { id: 'basic', icon: '🌟', title: 'מילים בסיסיות', sub: 'בונוס: מילים מהכיתה', learn: 'basic' },
];

export default function Home({ progress, go, practice, mock }: { progress: Progress; go: (s: Screen) => void; practice: (s: SectionId) => void; mock: () => void }) {
  const days = daysUntil(TEST_DATE);
  const best = progress.mocks.reduce((m, r) => Math.max(m, Math.round((r.score / r.total) * 100)), -1);
  const last = progress.mocks[progress.mocks.length - 1];

  return (
    <section className="screen">
      <header className="hero">
        <div className="hero-top">
          <div className="logo" aria-hidden="true">ABC</div>
          <div>
            <h1>ABC קסמים</h1>
            <p className="muted">מתכוננים למבדק באנגלית</p>
          </div>
          <Stars n={progress.stars} />
        </div>
        <div className="countdown">
          {days > 1 ? (
            <>
              עוד <b>{days}</b> ימים למבדק <small>(1.12 או 2.12)</small>
            </>
          ) : days === 1 ? (
            <>המבדק מחר! בהצלחה 💪</>
          ) : days === 0 ? (
            <>המבדק היום! בהצלחה 🍀</>
          ) : (
            <>המבדק עבר. אפשר להמשיך לתרגל 😊</>
          )}
        </div>
      </header>

      <div className="tiles">
        {TILES.map((t) => {
          const sp = sectionProgress(progress.stats, t.id, SECTION_ITEMS[t.id]);
          const done = sp.mastered === sp.total;
          return (
            <button
              key={t.id}
              className={`tile ${t.id === 'basic' ? 'bonus' : ''}`}
              onClick={() => (t.learn === 'abc' ? go({ name: 'abc' }) : t.learn ? go({ name: 'learn', id: t.learn }) : practice(t.id))}
            >
              <span className="tile-icon" aria-hidden="true">{t.icon}</span>
              <span className="tile-text">
                <b>{t.title}</b>
                <small>{t.sub}</small>
              </span>
              <span className="tile-progress">
                {done ? <span className="medal" aria-label="יודעים הכול">🏅</span> : <small>{sp.mastered}/{sp.total}</small>}
                <Bar value={sp.mastered} total={sp.total} />
              </span>
            </button>
          );
        })}
      </div>

      <button className="tile mock" onClick={mock}>
        <span className="tile-icon" aria-hidden="true">🏆</span>
        <span className="tile-text">
          <b>מבחן דמה</b>
          <small>{last ? `בפעם הקודמת: ${Math.round((last.score / last.total) * 100)}% · השיא: ${best}%` : 'בדיוק כמו המבדק האמיתי, 25 שאלות'}</small>
        </span>
        <span className="go" aria-hidden="true">←</span>
      </button>

      <p className="muted small center-text">
        ⭐ כוכב על כל תשובה נכונה בניסיון הראשון · ימי תרגול: {progress.days.length}
        <br />
        המספר ליד כל נושא = כמה כבר יודעים (נכון פעמיים ברצף)
      </p>
      <InstallTip />
    </section>
  );
}

function InstallTip() {
  const installed =
    window.matchMedia?.('(display-mode: standalone)').matches || (navigator as unknown as { standalone?: boolean }).standalone;
  if (installed) return null;
  return (
    <details className="install-tip">
      <summary>📲 איך מתקינים בטלפון?</summary>
      <ul>
        <li><b>אייפון (Safari):</b> כפתור השיתוף ↑, ואז "הוספה למסך הבית".</li>
        <li><b>אנדרואיד (Chrome):</b> תפריט ⋮, ואז "התקנת אפליקציה" או "הוספה למסך הבית".</li>
      </ul>
      <small>אחרי ההתקנה האפליקציה עובדת גם בלי אינטרנט.</small>
    </details>
  );
}
