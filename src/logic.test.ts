import { describe, it, expect } from 'vitest';
import { A_WORDS, blankDigraph, D_WORDS, LETTERS, READINGS, SENTENCES, WORDS } from './data';
import { sameSound, sentenceBank, checkTyped, makeQuestion, mockTest, pickItems, SECTION_ITEMS, SectionId } from './questions';
import { daysUntil, emptyProgress, isMastered, recordAnswer } from './progress';

function seeded(seed = 1) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

describe('content', () => {
  it('has the whole ABC and every word from the sheet', () => {
    expect(LETTERS.map((l) => l.up).join('')).toBe('ABCDEFGHIJKLMNOPQRSTUVWXYZ');
    const sheet = 'friend grade house new school teacher town bird brother sister English family fly lesson nice talk want we'.split(' ');
    expect(WORDS.map((w) => w.en).sort()).toEqual([...sheet].sort());
  });

  it('every sentence has exactly one blank and its answer is a sheet word', () => {
    for (const s of SENTENCES) {
      expect(s.text.split('___').length).toBe(2);
      expect(WORDS.some((w) => w.en.toLowerCase() === s.answer.toLowerCase())).toBe(true);
    }
  });

  it('long-A words end with a silent e, short-A words do not', () => {
    for (const w of A_WORDS) expect(w.en.endsWith('e')).toBe(w.long);
  });

  it('every digraph word contains its digraph once and blanks correctly', () => {
    for (const w of D_WORDS) {
      expect(w.en.split(w.d).length).toBe(2);
      expect(blankDigraph(w)).toContain('__');
      expect(blankDigraph(w).replace('__', w.d)).toBe(w.en);
    }
  });
});

describe('questions', () => {
  const sections = Object.keys(SECTION_ITEMS) as SectionId[];

  it('every question in every section has its answer among the options, with no duplicates', () => {
    for (let seed = 1; seed < 40; seed++) {
      const rand = seeded(seed);
      for (const sec of sections) {
        for (const id of SECTION_ITEMS[sec]) {
          const q = makeQuestion(sec, id, rand);
          if (q.kind === 'type') continue;
          const values = q.options!.map((o) => o.value);
          expect(values).toContain(q.answer);
          expect(new Set(values).size).toBe(values.length);
        }
      }
    }
  });

  it('abc "starts with" never offers two letters with the same answer word', () => {
    for (let seed = 1; seed < 60; seed++) {
      const q = makeQuestion('abc', 'C', seeded(seed));
      if (q.options!.length && q.title.includes('צליל')) {
        // C and K share the sound ק: options are de-duplicated by sound
        expect(new Set(q.options!.map((o) => o.label)).size).toBe(q.options!.length);
      }
    }
  });

  it('a practice round has 10 different items; reading gives one whole text', () => {
    const ids = pickItems('words', 10, {}, seeded(3));
    expect(ids.length).toBe(10);
    expect(new Set(ids).size).toBe(10);
    const r = pickItems('reading', 10, {}, seeded(3));
    expect(r.length).toBe(5);
    expect(new Set(r.map((x) => x.split('.')[0])).size).toBe(1);
  });

  it('practice prefers items that are not mastered yet', () => {
    const stats: Record<string, { s: number; n: number; w: number }> = {};
    for (const w of WORDS.slice(0, 15)) stats[`words:${w.en}`] = { s: 3, n: 3, w: 0 };
    let unmasteredPicked = 0;
    for (let seed = 1; seed < 50; seed++) {
      const ids = pickItems('words', 5, stats, seeded(seed));
      unmasteredPicked += ids.filter((id) => !stats[`words:${id}`]).length;
    }
    // 3 unmastered of 18 -> ~0.8 per round if random; weighting should give clearly more
    expect(unmasteredPicked / 49).toBeGreaterThan(1.5);
  });

  it('reading picks the text with the most unmastered statements', () => {
    const stats: Record<string, { s: number; n: number; w: number }> = {};
    READINGS[0].items.forEach((_, i) => (stats[`reading:0.${i}`] = { s: 2, n: 2, w: 0 }));
    READINGS[1].items.forEach((_, i) => (stats[`reading:1.${i}`] = { s: 2, n: 2, w: 0 }));
    expect(pickItems('reading', 5, stats, seeded(1))[0].startsWith('2.')).toBe(true);
  });

  it('mock test: 25 questions, numbers must be written, words ask for the meaning', () => {
    const qs = mockTest(seeded(7));
    expect(qs.length).toBe(25);
    expect(qs.filter((q) => q.section === 'numbers').every((q) => q.kind === 'type')).toBe(true);
    expect(qs.filter((q) => q.section === 'words').every((q) => q.title === 'מה הפירוש של המילה?')).toBe(true);
  });

  it('sentence bank: 4 different words and never another word of the same kind', () => {
    for (let seed = 1; seed < 30; seed++) for (const s of SENTENCES) {
      const bank = sentenceBank(s.answer, seeded(seed));
      expect(new Set(bank).size).toBe(4);
      expect(bank).toContain(s.answer);
      const people = ['friend', 'teacher', 'brother', 'sister', 'family'];
      if (people.includes(s.answer)) expect(bank.filter((w) => people.includes(w)).length).toBe(1);
    }
  });

  it('abc: never offers two letters with the same sound', () => {
    for (let seed = 1; seed < 200; seed++) for (const up of ['C', 'K', 'Q', 'A', 'U']) {
      const q = makeQuestion('abc', up, seeded(seed));
      if (q.title !== 'באיזו אות מתחילה המילה?') continue;
      const me = LETTERS.find((l) => l.up === up)!;
      for (const o of q.options!) if (o.value !== up) expect(sameSound(LETTERS.find((l) => l.up === o.value)!, me)).toBe(false);
    }
  });

  it('typed answers ignore case and spaces', () => {
    expect(checkTyped(' Seven ', 'seven')).toBe(true);
    expect(checkTyped('sevn', 'seven')).toBe(false);
  });
});

describe('progress', () => {
  it('two first-try correct answers in a row = mastered; a mistake resets', () => {
    let p = emptyProgress();
    p = recordAnswer(p, 'words:bird', true, true);
    expect(isMastered(p.stats['words:bird'])).toBe(false);
    p = recordAnswer(p, 'words:bird', true, true);
    expect(isMastered(p.stats['words:bird'])).toBe(true);
    expect(p.stars).toBe(2);
    p = recordAnswer(p, 'words:bird', false, true);
    expect(isMastered(p.stats['words:bird'])).toBe(false);
    p = recordAnswer(p, 'words:bird', true, false); // correct on retry: no star, no streak
    expect(p.stars).toBe(2);
    expect(p.stats['words:bird'].s).toBe(0);
  });

  it('days until the test', () => {
    expect(daysUntil(new Date(2026, 11, 1), new Date(2026, 10, 17, 22, 0))).toBe(14);
  });
});
