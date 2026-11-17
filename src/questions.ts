import { A_WORDS, BASIC_WORDS, blankDigraph, D_WORDS, DIGRAPH_INFO, Digraph, LETTERS, NUMBERS, READINGS, SENTENCES, WORDS, Word } from './data';
import { isMastered, Stats } from './progress';

export type SectionId = 'abc' | 'numbers' | 'words' | 'basic' | 'sentences' | 'vowels' | 'digraphs' | 'listen' | 'reading';

export type Option = { label: string; value: string; emoji?: string; ltr?: boolean };
export type Question = {
  key: string; // progress key: `${section}:${item}`
  section: SectionId;
  kind: 'choice' | 'type';
  title: string; // Hebrew instruction
  big?: string; // shown big (English unless bigHe)
  bigHe?: boolean;
  emoji?: string;
  say?: string; // English to read aloud (speaker button)
  autoSay?: boolean;
  passage?: { title: string; text: string; he: string };
  bank?: string[]; // word bank shown above the sentence
  options?: Option[];
  optionsWide?: boolean;
  answer: string;
  after?: string; // Hebrew explanation shown after answering
  sayAfter?: string; // English said after a correct answer
};

type Rand = () => number;

export function shuffle<T>(arr: T[], rand: Rand = Math.random): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** `count` distinct items from `pool` that are not `exclude`. Similar-looking ones (same first letter) first. */
function distractors(pool: string[], answer: string, count: number, rand: Rand, similar = false): string[] {
  const others = shuffle([...new Set(pool)].filter((x) => x.toLowerCase() !== answer.toLowerCase()), rand);
  if (similar) others.sort((x, y) => Number(y[0].toLowerCase() === answer[0].toLowerCase()) - Number(x[0].toLowerCase() === answer[0].toLowerCase()));
  return others.slice(0, count);
}

/** Word kinds for the sentence word bank: a wrong option is never of the same kind, so only one word fits. */
const KIND: Record<string, string> = {
  friend: 'person', teacher: 'person', brother: 'person', sister: 'person', family: 'person',
  house: 'place', school: 'place', town: 'place',
  fly: 'verb', talk: 'verb', want: 'verb',
  new: 'adj', nice: 'adj',
  bird: 'animal', grade: 'grade', lesson: 'class', English: 'lang', we: 'we',
};
const AVOID_EXTRA: Record<string, string[]> = {
  family: ['place', 'animal'], house: ['person'], town: ['person'], school: ['person'], lesson: ['person'],
  sister: ['animal'], brother: ['animal'], teacher: ['animal'], friend: ['animal'],
};

export function sentenceBank(answer: string, rand: Rand): string[] {
  const avoid = new Set([KIND[answer], ...(AVOID_EXTRA[answer] ?? [])]);
  const pool = SENTENCES.map((x) => x.answer).filter((w) => !avoid.has(KIND[w]));
  return shuffle([answer, ...distractors(pool, answer, 3, rand)], rand);
}

const K_SOUND = ['C', 'K', 'Q'];
export function sameSound(a: { up: string; sound: string }, b: { up: string; sound: string }): boolean {
  return a.sound === b.sound || (K_SOUND.includes(a.up) && K_SOUND.includes(b.up));
}

const en = (label: string): Option => ({ label, value: label, ltr: true });

export const SECTION_ITEMS: Record<SectionId, string[]> = {
  abc: LETTERS.map((l) => l.up),
  numbers: NUMBERS.map((_, i) => String(i + 1)),
  words: WORDS.map((w) => w.en),
  basic: BASIC_WORDS.map((w) => w.en),
  sentences: SENTENCES.map((_, i) => String(i)),
  vowels: A_WORDS.map((w) => w.en),
  digraphs: D_WORDS.map((w) => w.en),
  // the test's listening part: words from the sheet, numbers, and the sheet's A words
  listen: [...new Set([...WORDS.map((w) => w.en), ...NUMBERS, 'cat', 'hat', 'bag', 'cake', 'name', 'game'])],
  reading: READINGS.flatMap((r, ri) => r.items.map((_, i) => `${ri}.${i}`)),
};

function wordQuestion(section: 'words' | 'basic', list: Word[], id: string, rand: Rand): Question {
  const w = list.find((x) => x.en === id)!;
  const key = `${section}:${id}`;
  const v = Math.floor(rand() * 3);
  if (v === 0) {
    const opts = [w.he, ...distractors(list.map((x) => x.he), w.he, 3, rand)];
    return { key, section, kind: 'choice', title: 'מה הפירוש של המילה?', big: w.en, say: w.en, answer: w.he, options: shuffle(opts, rand).map((h) => ({ label: h, value: h })), after: `${w.en} = ${w.he}` };
  }
  if (v === 1) {
    const opts = [w.en, ...distractors(list.map((x) => x.en), w.en, 3, rand)];
    return { key, section, kind: 'choice', title: 'איך אומרים באנגלית?', big: w.he, bigHe: true, emoji: w.emoji, answer: w.en, options: shuffle(opts, rand).map(en), after: `${w.he} = ${w.en}`, sayAfter: w.en };
  }
  const opts = [w.en, ...distractors(list.map((x) => x.en), w.en, 3, rand, true)];
  return { key, section, kind: 'choice', title: 'הקשיבו ולחצו על המילה ששמעתם', say: w.en, autoSay: true, answer: w.en, options: shuffle(opts, rand).map(en), after: `${w.en} = ${w.he}` };
}

export function makeQuestion(section: SectionId, id: string, rand: Rand = Math.random): Question {
  const key = `${section}:${id}`;
  switch (section) {
    case 'abc': {
      const l = LETTERS.find((x) => x.up === id)!;
      const w = l.words[Math.floor(rand() * l.words.length)];
      const v = Math.floor(rand() * 3);
      if (v === 0) {
        // never offer a letter that makes the same sound (C/K/Q, A/U): both would be 'right'
        const pool = LETTERS.filter((x) => x.up !== l.up && !sameSound(x, l)).map((x) => x.up);
        const opts = [l.up, ...distractors(pool, l.up, 3, rand)];
        return {
          key, section, kind: 'choice', emoji: w.emoji, say: w.en, autoSay: true, // the word itself is not shown: it would give the answer away
          title: l.atEnd ? 'באיזו אות נגמרת המילה?' : 'באיזו אות מתחילה המילה?',
          answer: l.up, options: shuffle(opts, rand).map((u) => ({ label: `${u} ${u.toLowerCase()}`, value: u, ltr: true })),
          after: `${w.en} (${w.he}): ${l.atEnd ? 'נגמרת' : 'מתחילה'} ב-${l.up}, שנשמעת ${l.sound}`,
        };
      }
      if (v === 1) {
        const pool = LETTERS.filter((x) => x.sound !== l.sound && !x.atEnd && x.up !== 'Q').map((x) => x.words[0]);
        const opts = shuffle([w, ...shuffle(pool, rand).slice(0, 3)], rand);
        return {
          key, section, kind: 'choice', big: `${l.up} ${l.up.toLowerCase()}`, title: l.atEnd ? 'איזו מילה נגמרת באות הזאת?' : 'איזו תמונה מתחילה באות הזאת?',
          answer: w.en, options: opts.map((o) => ({ label: o.en, value: o.en, emoji: o.emoji, ltr: true })),
          after: `${w.emoji} ${w.en}: ${l.atEnd ? 'נגמרת' : 'מתחילה'} ב-${l.up}`, sayAfter: w.en,
        };
      }
      const sounds = [...new Set(LETTERS.map((x) => x.sound))];
      const opts = [l.sound, ...distractors(sounds, l.sound, 3, rand)];
      return {
        key, section, kind: 'choice', big: `${l.up} ${l.up.toLowerCase()}`, title: 'איזה צליל עושה האות?',
        answer: l.sound, options: shuffle(opts, rand).map((s) => ({ label: s, value: s })),
        after: `${l.up} נשמעת ${l.sound}, כמו ב-${l.words[0].en} ${l.words[0].emoji}`, sayAfter: `${l.up}. ${l.words[0].en}`,
      };
    }
    case 'numbers': {
      const n = Number(id);
      const word = NUMBERS[n - 1];
      const v = rand();
      if (v < 0.5) {
        return { key, section, kind: 'type', title: 'כתבו את המספר באנגלית', big: String(n), answer: word, after: `${n} = ${word}`, sayAfter: word };
      }
      if (v < 0.75) {
        const opts = [word, ...distractors(NUMBERS, word, 3, rand, true)];
        return { key, section, kind: 'choice', title: 'איזו מילה היא המספר?', big: String(n), answer: word, options: shuffle(opts, rand).map(en), after: `${n} = ${word}`, sayAfter: word };
      }
      const opts = [String(n), ...distractors(NUMBERS.map((_, i) => String(i + 1)), String(n), 3, rand)];
      return { key, section, kind: 'choice', title: 'איזה מספר כתוב כאן?', big: word, say: word, answer: String(n), options: shuffle(opts, rand).map(en), after: `${word} = ${n}` };
    }
    case 'words':
      return wordQuestion('words', WORDS, id, rand);
    case 'basic':
      return wordQuestion('basic', BASIC_WORDS, id, rand);
    case 'sentences': {
      const s = SENTENCES[Number(id)];
      const bank = sentenceBank(s.answer, rand);
      return {
        key, section, kind: 'choice', title: 'השלימו את המשפט עם מילה מהמחסן', big: s.text, bank,
        answer: s.answer, options: bank.map(en), after: `${s.text.replace('___', s.answer)}\n${s.he}`, sayAfter: s.text.replace('___', s.answer),
      };
    }
    case 'vowels': {
      const w = A_WORDS.find((x) => x.en === id)!;
      return {
        key, section, kind: 'choice', title: 'ה-A במילה קצרה או ארוכה?', emoji: w.emoji, big: w.en, say: w.en, autoSay: true,
        answer: w.long ? 'long' : 'short', optionsWide: true,
        options: [
          { label: 'A קצרה: אַ (כמו cat)', value: 'short' },
          { label: 'A ארוכה: אֵיי (כמו cake)', value: 'long' },
        ],
        after: w.long ? `${w.en}: יש e שקטה בסוף, ולכן ה-A ארוכה ואומרת את השם שלה: אֵיי` : `${w.en}: אין e בסוף, ולכן ה-A קצרה: אַ`,
      };
    }
    case 'digraphs': {
      const w = D_WORDS.find((x) => x.en === id)!;
      const order: Digraph[] = ['sh', 'ch', 'th'];
      return {
        key, section, kind: 'choice', title: 'איזה צירוף חסר? (תסתכלו על התמונה)', emoji: w.emoji, big: blankDigraph(w), say: w.en,
        answer: w.d, options: order.map(en),
        after: `${w.en} (${w.he}): ${w.d} נשמע ${DIGRAPH_INFO[w.d].sound}`, sayAfter: w.en,
      };
    }
    case 'listen': {
      const opts = [id, ...distractors(SECTION_ITEMS.listen, id, 3, rand, true)];
      return { key, section, kind: 'choice', title: 'הקשיבו ולחצו על המילה ששמעתם', say: id, autoSay: true, answer: id, options: shuffle(opts, rand).map(en) };
    }
    case 'reading': {
      const [ri, i] = id.split('.').map(Number);
      const r = READINGS[ri];
      const it = r.items[i];
      return {
        key, section, kind: 'choice', title: 'קראו את הטקסט. המשפט נכון או לא נכון?', passage: r, big: it.s, say: it.s,
        answer: it.ok ? 'yes' : 'no', options: [{ label: '✓ נכון', value: 'yes' }, { label: '✗ לא נכון', value: 'no' }],
      };
    }
  }
}

/** Pick `n` items for a practice round, mostly ones that aren't mastered yet. */
export function pickItems(section: SectionId, n: number, stats: Stats, rand: Rand = Math.random): string[] {
  if (section === 'reading') {
    // a whole text: the one with the most unmastered statements
    const scored = READINGS.map((r, ri) => ({ ri, left: r.items.filter((_, i) => !isMastered(stats[`reading:${ri}.${i}`])).length + rand() * 0.5 }));
    scored.sort((a, b) => b.left - a.left);
    const ri = scored[0].ri;
    return READINGS[ri].items.map((_, i) => `${ri}.${i}`);
  }
  const pool = SECTION_ITEMS[section].map((id) => {
    const s = stats[`${section}:${id}`];
    return { id, w: isMastered(s) ? 0.5 : 3 + Math.min(s?.w ?? 0, 3) };
  });
  const out: string[] = [];
  while (out.length < n && pool.length) {
    const total = pool.reduce((t, p) => t + p.w, 0);
    let r = rand() * total;
    let idx = 0;
    while (idx < pool.length - 1 && r >= pool[idx].w) r -= pool[idx++].w;
    out.push(pool[idx].id);
    pool.splice(idx, 1);
  }
  return out;
}

export function practiceRound(section: SectionId, stats: Stats, rand: Rand = Math.random): Question[] {
  return pickItems(section, 10, stats, rand).map((id) => makeQuestion(section, id, rand));
}

/** Mock test, built like the real one. */
export const MOCK_PARTS: { section: SectionId; n: number; name: string }[] = [
  { section: 'numbers', n: 4, name: 'מספרים 1 עד 12' },
  { section: 'words', n: 4, name: 'פירוש מילים' },
  { section: 'sentences', n: 3, name: 'השלמת משפטים' },
  { section: 'vowels', n: 3, name: 'A קצרה וארוכה' },
  { section: 'listen', n: 3, name: 'האזנה' },
  { section: 'digraphs', n: 3, name: 'th, ch, sh' },
  { section: 'reading', n: 5, name: 'קריאת טקסט' },
];

export function mockTest(rand: Rand = Math.random): Question[] {
  const qs: Question[] = [];
  for (const p of MOCK_PARTS) {
    const ids = p.section === 'reading' ? pickItems('reading', 5, {}, rand) : pickItems(p.section, p.n, {}, rand);
    for (const id of ids) {
      let q = makeQuestion(p.section, id, rand);
      // the real test asks to WRITE the numbers
      if (p.section === 'numbers' && q.kind !== 'type') {
        const n = Number(id);
        q = { key: q.key, section: 'numbers', kind: 'type', title: 'כתבו את המספר באנגלית', big: String(n), answer: NUMBERS[n - 1], after: `${n} = ${NUMBERS[n - 1]}` };
      }
      // the real test asks for the meaning of words
      if (p.section === 'words' && q.title !== 'מה הפירוש של המילה?') {
        const w = WORDS.find((x) => x.en === id)!;
        const opts = shuffle([w.he, ...distractors(WORDS.map((x) => x.he), w.he, 3, rand)], rand);
        q = { key: q.key, section: 'words', kind: 'choice', title: 'מה הפירוש של המילה?', big: w.en, say: w.en, answer: w.he, options: opts.map((h) => ({ label: h, value: h })), after: `${w.en} = ${w.he}` };
      }
      qs.push(q);
    }
  }
  return qs;
}

/** Normalizes a typed answer: case and spaces don't matter. */
export function checkTyped(typed: string, answer: string): boolean {
  return typed.trim().toLowerCase().replace(/\s+/g, '') === answer.toLowerCase();
}
