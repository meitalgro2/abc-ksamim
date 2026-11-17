// All learning content. Based on the teacher's sheet: JET 2 – Unit 1 (Parts 1–2).

export const TEST_DATE = new Date(2026, 11, 1); // 1.12.2026 (some classes: 2.12)

/* ---------------- ABC ---------------- */
export type Letter = {
  up: string;
  name: string; // letter name, in Hebrew letters
  sound: string; // the sound, in Hebrew letters
  tip?: string;
  words: { en: string; emoji: string; he: string }[];
  atEnd?: boolean; // X: the sound is heard at the end of the word
};

export const LETTERS: Letter[] = [
  { up: 'A', name: 'אֵיי', sound: 'אַ', tip: 'זה הצליל הקצר. יש ל-A גם צליל ארוך: אֵיי, כמו ב-cake.', words: [{ en: 'apple', emoji: '🍎', he: 'תפוח' }, { en: 'ant', emoji: '🐜', he: 'נמלה' }] },
  { up: 'B', name: 'בִּי', sound: 'בּ', words: [{ en: 'ball', emoji: '⚽', he: 'כדור' }, { en: 'bear', emoji: '🐻', he: 'דוב' }] },
  { up: 'C', name: 'סִי', sound: 'ק', tip: 'בדרך כלל C נשמעת כמו ק. לפעמים היא נשמעת כמו ס.', words: [{ en: 'cat', emoji: '🐱', he: 'חתול' }, { en: 'car', emoji: '🚗', he: 'מכונית' }] },
  { up: 'D', name: 'דִּי', sound: 'ד', words: [{ en: 'dog', emoji: '🐶', he: 'כלב' }, { en: 'duck', emoji: '🦆', he: 'ברווז' }] },
  { up: 'E', name: 'אִי', sound: 'אֶ', tip: 'זה הצליל הקצר. הצליל הארוך הוא אִי, כמו ב-he.', words: [{ en: 'egg', emoji: '🥚', he: 'ביצה' }, { en: 'elephant', emoji: '🐘', he: 'פיל' }] },
  { up: 'F', name: 'אֶף', sound: 'פ', words: [{ en: 'fish', emoji: '🐟', he: 'דג' }, { en: 'frog', emoji: '🐸', he: 'צפרדע' }] },
  { up: 'G', name: "גִ'י", sound: 'ג', words: [{ en: 'goat', emoji: '🐐', he: 'עז' }, { en: 'gift', emoji: '🎁', he: 'מתנה' }] },
  { up: 'H', name: "אֵייץ'", sound: 'ה', words: [{ en: 'hat', emoji: '🎩', he: 'כובע' }, { en: 'horse', emoji: '🐴', he: 'סוס' }] },
  { up: 'I', name: 'אַיי', sound: 'אִ', tip: 'זה הצליל הקצר. הצליל הארוך הוא אַיי, כמו ב-kite.', words: [{ en: 'insect', emoji: '🐞', he: 'חרק' }, { en: 'ill', emoji: '🤒', he: 'חולה' }] },
  { up: 'J', name: "גֵ'יי", sound: "ג'", words: [{ en: 'juice', emoji: '🧃', he: 'מיץ' }, { en: 'jeans', emoji: '👖', he: "ג'ינס" }] },
  { up: 'K', name: 'קֵיי', sound: 'ק', words: [{ en: 'kite', emoji: '🪁', he: 'עפיפון' }, { en: 'key', emoji: '🔑', he: 'מפתח' }] },
  { up: 'L', name: 'אֶל', sound: 'ל', words: [{ en: 'lion', emoji: '🦁', he: 'אריה' }, { en: 'leaf', emoji: '🍃', he: 'עלה' }] },
  { up: 'M', name: 'אֶם', sound: 'מ', words: [{ en: 'moon', emoji: '🌙', he: 'ירח' }, { en: 'milk', emoji: '🥛', he: 'חלב' }] },
  { up: 'N', name: 'אֶן', sound: 'נ', words: [{ en: 'nose', emoji: '👃', he: 'אף' }, { en: 'nut', emoji: '🥜', he: 'אגוז' }] },
  { up: 'O', name: 'אוֹ', sound: 'אָ', tip: 'זה הצליל הקצר, עם פה פתוח, כמו ב-octopus. הצליל הארוך הוא אוֹ, כמו ב-home.', words: [{ en: 'octopus', emoji: '🐙', he: 'תמנון' }, { en: 'ox', emoji: '🐂', he: 'שור' }] },
  { up: 'P', name: 'פִּי', sound: 'פּ', words: [{ en: 'pig', emoji: '🐷', he: 'חזיר' }, { en: 'pen', emoji: '🖊️', he: 'עט' }] },
  { up: 'Q', name: 'קְיוּ', sound: 'קוּ', tip: 'אחרי Q כמעט תמיד בא u, ויחד הם נשמעים קוּ.', words: [{ en: 'queen', emoji: '👸', he: 'מלכה' }] },
  { up: 'R', name: 'אַר', sound: 'ר', words: [{ en: 'rabbit', emoji: '🐰', he: 'ארנב' }, { en: 'rain', emoji: '🌧️', he: 'גשם' }] },
  { up: 'S', name: 'אֶס', sound: 'ס', words: [{ en: 'sun', emoji: '☀️', he: 'שמש' }, { en: 'sock', emoji: '🧦', he: 'גרב' }] },
  { up: 'T', name: 'טִי', sound: 'ט', words: [{ en: 'tree', emoji: '🌳', he: 'עץ' }, { en: 'tiger', emoji: '🐯', he: 'נמר' }] },
  { up: 'U', name: 'יוּ', sound: 'אַ', tip: 'זה הצליל הקצר, כמו ב-up. הצליל הארוך הוא יוּ, כמו ב-cute.', words: [{ en: 'umbrella', emoji: '☂️', he: 'מטרייה' }, { en: 'up', emoji: '⬆️', he: 'למעלה' }] },
  { up: 'V', name: 'וִי', sound: 'ו', tip: 'השיניים העליונות נוגעות בשפה התחתונה: ו׳ שמזמזמת.', words: [{ en: 'van', emoji: '🚐', he: 'מסחרית (ואן)' }, { en: 'violin', emoji: '🎻', he: 'כינור' }] },
  { up: 'W', name: 'דַּבְּל־יוּ', sound: 'וּ', tip: 'עושים שפתיים עגולות, כמו נשיקה: וּ.', words: [{ en: 'watch', emoji: '⌚', he: 'שעון' }, { en: 'worm', emoji: '🪱', he: 'תולעת' }] },
  { up: 'X', name: 'אֶקְס', sound: 'קְס', tip: 'בדרך כלל שומעים את X בסוף המילה.', atEnd: true, words: [{ en: 'box', emoji: '📦', he: 'קופסה' }, { en: 'fox', emoji: '🦊', he: 'שועל' }] },
  { up: 'Y', name: 'וַוי', sound: 'י', words: [{ en: 'yo-yo', emoji: '🪀', he: 'יו־יו' }, { en: 'yellow', emoji: '💛', he: 'צהוב' }] },
  { up: 'Z', name: 'זִי', sound: 'ז', words: [{ en: 'zebra', emoji: '🦓', he: 'זברה' }, { en: 'zero', emoji: '0️⃣', he: 'אפס' }] },
];

/* ---------------- Numbers 1–12 (must be written!) ---------------- */
export const NUMBERS = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'];

/* ---------------- Vocabulary (read + understand, no need to write) ---------------- */
export type Word = { en: string; he: string; emoji: string };

export const WORDS: Word[] = [
  { en: 'friend', he: 'חבר / חברה', emoji: '🤝' },
  { en: 'grade', he: 'כיתה (שכבה)', emoji: '🎒' },
  { en: 'house', he: 'בית', emoji: '🏠' },
  { en: 'new', he: 'חדש', emoji: '🆕' },
  { en: 'school', he: 'בית ספר', emoji: '🏫' },
  { en: 'teacher', he: 'מורה', emoji: '👩‍🏫' },
  { en: 'town', he: 'עיר קטנה', emoji: '🏘️' },
  { en: 'bird', he: 'ציפור', emoji: '🐦' },
  { en: 'brother', he: 'אח', emoji: '👦' },
  { en: 'sister', he: 'אחות', emoji: '👧' },
  { en: 'English', he: 'אנגלית', emoji: '🔤' },
  { en: 'family', he: 'משפחה', emoji: '👨‍👩‍👧‍👦' },
  { en: 'fly', he: 'לעוף', emoji: '🕊️' },
  { en: 'lesson', he: 'שיעור', emoji: '📖' },
  { en: 'nice', he: 'נחמד', emoji: '😊' },
  { en: 'talk', he: 'לדבר', emoji: '🗣️' },
  { en: 'want', he: 'רוצה', emoji: '💭' },
  { en: 'we', he: 'אנחנו', emoji: '🙌' },
];

/** Basic words that are usually learned in class. A guess: the sheet doesn't list them. */
export const BASIC_WORDS: Word[] = [
  { en: 'I', he: 'אני', emoji: '🙋' },
  { en: 'you', he: 'אתה / את', emoji: '👉' },
  { en: 'my', he: 'שלי', emoji: '🫶' },
  { en: 'name', he: 'שם', emoji: '📛' },
  { en: 'mother', he: 'אמא', emoji: '👩' },
  { en: 'father', he: 'אבא', emoji: '👨' },
  { en: 'boy', he: 'ילד', emoji: '🧒' },
  { en: 'girl', he: 'ילדה', emoji: '👱‍♀️' },
  { en: 'book', he: 'ספר', emoji: '📕' },
  { en: 'bag', he: 'תיק', emoji: '👜' },
  { en: 'yes', he: 'כן', emoji: '✅' },
  { en: 'no', he: 'לא', emoji: '❌' },
  { en: 'hello', he: 'שלום', emoji: '👋' },
  { en: 'big', he: 'גדול', emoji: '🐘' },
  { en: 'small', he: 'קטן', emoji: '🐭' },
  { en: 'good', he: 'טוב', emoji: '👍' },
];

/* ---------------- Sentences with a word bank ---------------- */
export type Sentence = { text: string; answer: string; he: string };

export const SENTENCES: Sentence[] = [
  { text: 'My ___ is Tom. He is ten.', answer: 'brother', he: 'האח שלי הוא תום. הוא בן עשר.' },
  { text: 'I have a little ___. Her name is Noa.', answer: 'sister', he: 'יש לי אחות קטנה. קוראים לה נועה.' },
  { text: 'A ___ can fly.', answer: 'bird', he: 'ציפור יכולה לעוף.' },
  { text: 'We go to ___ every day.', answer: 'school', he: 'אנחנו הולכים לבית הספר כל יום.' },
  { text: 'My ___ is Mrs. Cohen.', answer: 'teacher', he: 'המורה שלי היא גברת כהן.' },
  { text: 'I live in a big ___.', answer: 'house', he: 'אני גר/ה בבית גדול.' },
  { text: 'Dan is my best ___.', answer: 'friend', he: 'דן הוא החבר הכי טוב שלי.' },
  { text: 'I am in ___ four.', answer: 'grade', he: 'אני בכיתה ד׳.' },
  { text: 'We have an English ___ today.', answer: 'lesson', he: 'יש לנו היום שיעור אנגלית.' },
  { text: 'I ___ a new bag.', answer: 'want', he: 'אני רוצה תיק חדש.' },
  { text: 'My teacher is very ___.', answer: 'nice', he: 'המורה שלי מאוד נחמדה.' },
  { text: 'Birds can ___.', answer: 'fly', he: 'ציפורים יכולות לעוף.' },
  { text: 'I have a ___ pen. It is not old.', answer: 'new', he: 'יש לי עט חדש. הוא לא ישן.' },
  { text: 'I like to ___ with my friends.', answer: 'talk', he: 'אני אוהב/ת לדבר עם החברים שלי.' },
  { text: 'My friends and I go to school. Every day ___ learn English.', answer: 'we', he: 'החברים שלי ואני הולכים לבית הספר. כל יום אנחנו לומדים אנגלית.' },
  { text: 'Mom, Dad, my sister and me: this is my ___.', answer: 'family', he: 'אמא, אבא, אחותי ואני: זאת המשפחה שלי.' },
  { text: 'I live in a small ___.', answer: 'town', he: 'אני גר/ה בעיר קטנה.' },
  { text: 'I can speak Hebrew and ___.', answer: 'English', he: 'אני יודע/ת לדבר עברית ואנגלית.' },
];

/* ---------------- Short A / Long A ---------------- */
export type AWord = { en: string; long: boolean; emoji: string; he: string };

export const A_WORDS: AWord[] = [
  { en: 'cat', long: false, emoji: '🐱', he: 'חתול' },
  { en: 'hat', long: false, emoji: '🎩', he: 'כובע' },
  { en: 'bag', long: false, emoji: '👜', he: 'תיק' },
  { en: 'man', long: false, emoji: '👨', he: 'איש' },
  { en: 'map', long: false, emoji: '🗺️', he: 'מפה' },
  { en: 'dad', long: false, emoji: '👨‍👧', he: 'אבא' },
  { en: 'van', long: false, emoji: '🚐', he: 'מסחרית (ואן)' },
  { en: 'cap', long: false, emoji: '🧢', he: 'כובע מצחייה' },
  { en: 'bat', long: false, emoji: '🦇', he: 'עטלף' },
  { en: 'cake', long: true, emoji: '🎂', he: 'עוגה' },
  { en: 'name', long: true, emoji: '📛', he: 'שם' },
  { en: 'game', long: true, emoji: '🎲', he: 'משחק' },
  { en: 'grade', long: true, emoji: '🎒', he: 'כיתה' },
  { en: 'lake', long: true, emoji: '🏞️', he: 'אגם' },
  { en: 'plane', long: true, emoji: '✈️', he: 'מטוס' },
  { en: 'grape', long: true, emoji: '🍇', he: 'ענב' },
  { en: 'face', long: true, emoji: '🙂', he: 'פנים' },
  { en: 'snake', long: true, emoji: '🐍', he: 'נחש' },
];

/* ---------------- th / ch / sh ---------------- */
export type Digraph = 'sh' | 'ch' | 'th';
export type DWord = { en: string; d: Digraph; emoji: string; he: string };

export const DIGRAPH_INFO: Record<Digraph, { sound: string; how: string; example: string }> = {
  sh: { sound: 'ש', how: 'כמו כשמבקשים שקט: ששש…', example: 'ship' },
  ch: { sound: "צ'", how: "כמו צ' בצ'יפס", example: 'chair' },
  th: { sound: "ת' (לשון בין השיניים)", how: 'שמים את קצה הלשון בין השיניים ונושפים', example: 'three' },
};

export const D_WORDS: DWord[] = [
  { en: 'ship', d: 'sh', emoji: '🚢', he: 'ספינה' },
  { en: 'shoe', d: 'sh', emoji: '👟', he: 'נעל' },
  { en: 'fish', d: 'sh', emoji: '🐟', he: 'דג' },
  { en: 'sheep', d: 'sh', emoji: '🐑', he: 'כבשה' },
  { en: 'shell', d: 'sh', emoji: '🐚', he: 'צדף' },
  { en: 'brush', d: 'sh', emoji: '🪥', he: 'מברשת' },
  { en: 'chair', d: 'ch', emoji: '🪑', he: 'כיסא' },
  { en: 'cheese', d: 'ch', emoji: '🧀', he: 'גבינה' },
  { en: 'chicken', d: 'ch', emoji: '🐔', he: 'תרנגולת' },
  { en: 'cherry', d: 'ch', emoji: '🍒', he: 'דובדבן' },
  { en: 'peach', d: 'ch', emoji: '🍑', he: 'אפרסק' },
  { en: 'lunch', d: 'ch', emoji: '🥪', he: 'ארוחת צהריים' },
  { en: 'three', d: 'th', emoji: '3️⃣', he: 'שלוש' },
  { en: 'thumb', d: 'th', emoji: '👍', he: 'אגודל' },
  { en: 'bath', d: 'th', emoji: '🛁', he: 'אמבטיה' },
  { en: 'teeth', d: 'th', emoji: '🦷', he: 'שיניים' },
  { en: 'mouth', d: 'th', emoji: '👄', he: 'פה' },
  { en: 'thread', d: 'th', emoji: '🧵', he: 'חוט' },
];

/** "ship" -> "__ip" (the digraph is replaced by a blank). */
export function blankDigraph(w: DWord): string {
  return w.en.replace(w.d, '__');
}

/* ---------------- Reading: short text + true / false ---------------- */
export type Reading = { title: string; text: string; he: string; items: { s: string; ok: boolean }[] };

export const READINGS: Reading[] = [
  {
    title: 'Maya',
    text: 'Hi! My name is Maya. I am in grade four. I have a brother and a sister. My brother is Ben. My sister is Lia. We live in a nice house in a small town.',
    he: 'היי! קוראים לי מאיה. אני בכיתה ד׳. יש לי אח ואחות. האח שלי הוא בן. האחות שלי היא ליה. אנחנו גרים בבית נחמד בעיר קטנה.',
    items: [
      { s: 'Maya is in grade four.', ok: true },
      { s: 'Maya has two sisters.', ok: false },
      { s: 'Her brother is Ben.', ok: true },
      { s: 'They live in a big town.', ok: false },
      { s: 'The house is nice.', ok: true },
    ],
  },
  {
    title: 'The new teacher',
    text: 'This is Tom. Tom has a new teacher. Her name is Dana. She is very nice. Tom likes the English lesson. He wants to talk in English with his friends.',
    he: 'זה תום. לתום יש מורה חדשה. קוראים לה דנה. היא מאוד נחמדה. תום אוהב את שיעור האנגלית. הוא רוצה לדבר באנגלית עם החברים שלו.',
    items: [
      { s: 'Tom has a new teacher.', ok: true },
      { s: 'The teacher is Ben.', ok: false },
      { s: 'The teacher is nice.', ok: true },
      { s: 'Tom likes the English lesson.', ok: true },
      { s: 'Tom wants to talk in Hebrew.', ok: false },
    ],
  },
  {
    title: 'My bird',
    text: 'I have a bird. It is small and yellow. My bird can fly. My family likes the bird. My sister wants a cat. My brother wants a dog.',
    he: 'יש לי ציפור. היא קטנה וצהובה. הציפור שלי יכולה לעוף. המשפחה שלי אוהבת את הציפור. אחותי רוצה חתול. אחי רוצה כלב.',
    items: [
      { s: 'The bird can fly.', ok: true },
      { s: 'The bird is big.', ok: false },
      { s: 'The family likes the bird.', ok: true },
      { s: 'The sister wants a dog.', ok: false },
      { s: 'The brother wants a dog.', ok: true },
    ],
  },
];
