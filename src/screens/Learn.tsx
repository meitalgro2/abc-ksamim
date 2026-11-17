import type { Screen } from '../App';
import { A_WORDS, BASIC_WORDS, D_WORDS, DIGRAPH_INFO, Digraph, NUMBERS, WORDS, Word } from '../data';
import { isMastered, Progress } from '../progress';
import { SectionId } from '../questions';
import { speakEn } from '../speech';
import { En, TopBar } from '../ui';

export type LearnId = 'numbers' | 'words' | 'basic' | 'vowels' | 'digraphs';

const TITLES: Record<LearnId, string> = {
  numbers: 'מספרים 1 עד 12',
  words: 'המילים של המבדק',
  basic: 'מילים בסיסיות',
  vowels: 'A קצרה או ארוכה',
  digraphs: 'th · ch · sh',
};

export default function Learn({ id, progress, go, practice }: { id: LearnId; progress: Progress; go: (s: Screen) => void; practice: (s: SectionId) => void }) {
  const known = (key: string) => isMastered(progress.stats[key]);
  return (
    <section className="screen">
      <TopBar title={TITLES[id]} onBack={() => go({ name: 'home' })} />
      {id === 'numbers' && <Numbers known={known} />}
      {(id === 'words' || id === 'basic') && <Words list={id === 'words' ? WORDS : BASIC_WORDS} section={id} known={known} />}
      {id === 'vowels' && <Vowels />}
      {id === 'digraphs' && <Digraphs />}
      <div className="sticky-cta">
        <button className="btn btn-primary btn-xl" onClick={() => practice(id)}>🎮 לתרגל</button>
      </div>
    </section>
  );
}

function Numbers({ known }: { known: (k: string) => boolean }) {
  return (
    <>
      <div className="note">
        ✍️ <b>את המספרים צריך לדעת לכתוב!</b> לוחצים כדי לשמוע, ומנסים לכתוב כל מספר על דף.
      </div>
      <div className="cards-grid">
        {NUMBERS.map((w, i) => (
          <button key={w} className={`learn-card ${known(`numbers:${i + 1}`) ? 'known' : ''}`} onClick={() => speakEn(w)}>
            <span className="num">{i + 1}</span>
            <En className="learn-en">{w}</En>
          </button>
        ))}
      </div>
    </>
  );
}

function Words({ list, section, known }: { list: Word[]; section: string; known: (k: string) => boolean }) {
  return (
    <>
      <div className="note">
        {section === 'words' ? (
          <>📖 את המילים האלה צריך <b>לקרוא ולהבין</b>. לא צריך לדעת לכתוב אותן.</>
        ) : (
          <>🌟 מילים בסיסיות שבדרך כלל לומדים בכיתה. הן לא כתובות בדף של המורה, אבל כדאי להכיר אותן.</>
        )}
      </div>
      <div className="cards-grid">
        {list.map((w) => (
          <button key={w.en} className={`learn-card ${known(`${section}:${w.en}`) ? 'known' : ''}`} onClick={() => speakEn(w.en)}>
            <span className="learn-emoji" aria-hidden="true">{w.emoji}</span>
            <En className="learn-en">{w.en}</En>
            <small>{w.he}</small>
          </button>
        ))}
      </div>
    </>
  );
}

function Vowels() {
  const short = A_WORDS.filter((w) => !w.long);
  const long = A_WORDS.filter((w) => w.long);
  return (
    <>
      <div className="card rule">
        <h2>הסוד של ה-e הקסומה ✨</h2>
        <p>
          <b>A קצרה</b> נשמעת <b>אַ</b>: <En>cat, hat, bag</En>
        </p>
        <p>
          <b>A ארוכה</b> אומרת את השם שלה, <b>אֵיי</b>: <En>cake, name, game</En>
        </p>
        <p className="magic">
          איך יודעים? אם בסוף המילה יש <b>e</b> שלא שומעים (<En>a_e</En>), ה-A ארוכה. ה-e שקטה, אבל היא "קסם" שגורם ל-A להגיד את השם שלה.
        </p>
        <div className="pair" dir="ltr">
          <button onClick={() => speakEn('cap')}>cap</button>
          <span>+ e →</span>
          <button onClick={() => speakEn('cape')}>
            cap<mark>e</mark>
          </button>
        </div>
      </div>
      <div className="two-cols">
        <div>
          <h3>קצרה · אַ</h3>
          {short.map((w) => (
            <button key={w.en} className="chip" onClick={() => speakEn(w.en)}>
              {w.emoji} <En>{w.en}</En>
            </button>
          ))}
        </div>
        <div>
          <h3>ארוכה · אֵיי</h3>
          {long.map((w) => (
            <button key={w.en} className="chip long" onClick={() => speakEn(w.en)}>
              {w.emoji} <En>{w.en.slice(0, -1)}<mark>e</mark></En>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

function Digraphs() {
  const order: Digraph[] = ['sh', 'ch', 'th'];
  return (
    <>
      <div className="note">שתי אותיות שנפגשות ועושות צליל חדש אחד.</div>
      {order.map((d) => (
        <div key={d} className="card digraph">
          <div className="digraph-head">
            <En className="digraph-big">{d}</En>
            <div>
              <b>נשמע {DIGRAPH_INFO[d].sound}</b>
              <p className="small muted">{DIGRAPH_INFO[d].how}</p>
            </div>
          </div>
          <div className="chips">
            {D_WORDS.filter((w) => w.d === d).map((w) => (
              <button key={w.en} className="chip" onClick={() => speakEn(w.en)}>
                {w.emoji}{' '}
                <En>
                  {w.en.split(d)[0]}
                  <mark>{d}</mark>
                  {w.en.split(d)[1]}
                </En>
              </button>
            ))}
          </div>
        </div>
      ))}
    </>
  );
}
