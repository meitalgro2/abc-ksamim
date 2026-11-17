// English read-aloud (the phone's built-in voice) + parent recordings of letter sounds (kept on the device).

let voice: SpeechSynthesisVoice | null = null;

function pickVoice() {
  try {
    const all = window.speechSynthesis.getVoices();
    const enVoices = all.filter((v) => v.lang.toLowerCase().startsWith('en'));
    voice =
      enVoices.find((v) => /samantha|google us english/i.test(v.name)) ??
      enVoices.find((v) => v.lang === 'en-US' && v.localService) ??
      enVoices.find((v) => v.lang === 'en-US') ??
      enVoices[0] ??
      null;
  } catch {
    voice = null;
  }
}

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  pickVoice();
  window.speechSynthesis.addEventListener?.('voiceschanged', pickVoice);
}

export const canSpeak = () => typeof window !== 'undefined' && 'speechSynthesis' in window;

export function speakEn(text: string, rate = 0.8): Promise<void> {
  return new Promise((resolve) => {
    try {
      const synth = window.speechSynthesis;
      synth.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'en-US';
      if (voice) u.voice = voice;
      u.rate = rate;
      u.onend = () => resolve();
      u.onerror = () => resolve();
      synth.speak(u);
      setTimeout(resolve, 6000); // never hang
    } catch {
      resolve();
    }
  });
}

/** iPhone only lets speech start from a tap: call this inside a tap handler before speech that starts later. */
let unlocked = false;
export function unlockSpeech() {
  if (unlocked || !canSpeak()) return;
  try {
    const u = new SpeechSynthesisUtterance(' ');
    u.volume = 0;
    window.speechSynthesis.speak(u);
    unlocked = true;
  } catch {
    /* optional */
  }
}

/* ---------- recordings (IndexedDB) ---------- */
const DB = 'abc-ksamim-audio';
function db(): Promise<IDBDatabase> {
  return new Promise((res, rej) => {
    const r = indexedDB.open(DB, 1);
    r.onupgradeneeded = () => r.result.createObjectStore('rec');
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
}
async function tx<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const d = await db();
  return new Promise((res, rej) => {
    const t = d.transaction('rec', mode);
    const req = fn(t.objectStore('rec'));
    t.oncomplete = () => res(req.result);
    t.onerror = () => rej(t.error);
  });
}
export const getRecording = (letter: string) => tx<Blob | undefined>('readonly', (s) => s.get(letter) as IDBRequest<Blob | undefined>).catch(() => undefined);
export const saveRecording = (letter: string, blob: Blob) => tx('readwrite', (s) => s.put(blob, letter));
export const deleteRecording = (letter: string) => tx('readwrite', (s) => s.delete(letter));
export const listRecordings = () => tx<IDBValidKey[]>('readonly', (s) => s.getAllKeys()).catch(() => [] as IDBValidKey[]);

export function playBlob(blob: Blob): Promise<void> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(blob);
    const a = new Audio(url);
    const done = () => {
      URL.revokeObjectURL(url);
      resolve();
    };
    a.onended = done;
    a.onerror = done;
    a.play().catch(done);
  });
}

/** Letter sound: the parent's recording if there is one, then the example word. Otherwise: letter name + word. */
export async function playLetter(up: string, word: string, preloaded?: Blob | null) {
  // a preloaded recording plays straight from the tap (iPhone blocks audio started after waiting)
  const rec = preloaded !== undefined ? preloaded : await getRecording(up);
  if (rec) {
    await playBlob(rec);
    await speakEn(word);
  } else {
    await speakEn(`${up}. ${word}`);
  }
}

/** Records up to `maxMs` from the microphone. Call the returned stop() to finish early. */
export async function startRecording(maxMs = 3000): Promise<{ stop: () => void; done: Promise<Blob> }> {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const rec = new MediaRecorder(stream);
  const chunks: Blob[] = [];
  rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
  const done = new Promise<Blob>((resolve) => {
    rec.onstop = () => {
      stream.getTracks().forEach((t) => t.stop());
      resolve(new Blob(chunks, { type: rec.mimeType || 'audio/mp4' }));
    };
  });
  rec.start();
  const timer = setTimeout(() => rec.state === 'recording' && rec.stop(), maxMs);
  return {
    stop: () => {
      clearTimeout(timer);
      if (rec.state === 'recording') rec.stop();
    },
    done,
  };
}
