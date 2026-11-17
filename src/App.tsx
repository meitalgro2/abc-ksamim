import { useCallback, useState } from 'react';
import { loadProgress, Progress, saveProgress } from './progress';
import { mockTest, practiceRound, Question, SectionId } from './questions';
import Home from './screens/Home';
import Abc from './screens/Abc';
import Learn, { LearnId } from './screens/Learn';
import Quiz from './screens/Quiz';
import { unlockSpeech } from './speech';

export type Screen =
  | { name: 'home' }
  | { name: 'abc'; letter?: string }
  | { name: 'learn'; id: LearnId }
  | { name: 'quiz'; section: SectionId | 'mock'; questions: Question[]; back: Screen; round: number };

export default function App() {
  const [progress, setProgress] = useState<Progress>(loadProgress);
  const [screen, setScreen] = useState<Screen>({ name: 'home' });

  const update = useCallback((fn: (p: Progress) => Progress) => {
    setProgress((p) => {
      const n = fn(p);
      saveProgress(n);
      return n;
    });
  }, []);

  const go = useCallback((s: Screen) => {
    setScreen(s);
    window.scrollTo(0, 0);
  }, []);

  const practice = (section: SectionId, back: Screen = { name: 'home' }) => {
    unlockSpeech();
    go({ name: 'quiz', section, questions: practiceRound(section, progress.stats), back, round: Date.now() });
  };
  const mock = () => {
    unlockSpeech();
    go({ name: 'quiz', section: 'mock', questions: mockTest(), back: { name: 'home' }, round: Date.now() });
  };

  return (
    <main className="app">
      {screen.name === 'home' && <Home progress={progress} go={go} practice={practice} mock={mock} />}
      {screen.name === 'abc' && <Abc progress={progress} start={screen.letter} go={go} practice={() => practice('abc', { name: 'abc' })} />}
      {screen.name === 'learn' && <Learn id={screen.id} progress={progress} go={go} practice={(s) => practice(s, screen)} />}
      {screen.name === 'quiz' && (
        <Quiz
          key={screen.round}
          section={screen.section}
          questions={screen.questions}
          progress={progress}
          update={update}
          onExit={() => go(screen.back)}
          onAgain={() => (screen.section === 'mock' ? mock() : practice(screen.section, screen.back))}
        />
      )}
    </main>
  );
}
