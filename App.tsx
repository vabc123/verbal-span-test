
import React, { useState, useCallback } from 'react';
import { AppState, TestMode, Direction, TestConfig, TestSession } from './types';
import ConfigScreen from './components/ConfigScreen';
import TestScreen from './components/TestScreen';
import ResultScreen from './components/ResultScreen';
import { getFilteredWords, getRandomSequence } from './services/wordGenerator';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(AppState.CONFIG);
  const [config, setConfig] = useState<TestConfig>({
    mode: TestMode.CHINESE,
    minLen: 2,
    maxLen: 8,
    direction: Direction.FORWARD,
    startLevel: 3,
    duration: 1.5,
  });

  const [session, setSession] = useState<TestSession>({
    currentLevel: 3,
    maxLevel: 0,
    sequence: [],
    userInput: [],
    isCorrect: null,
  });

  const startTest = useCallback(() => {
    const filtered = getFilteredWords(config);
    if (filtered.length < session.currentLevel) {
      alert(`词库不足，当前设置下只有 ${filtered.length} 个可用词，请放宽长度限制。`);
      return;
    }
    const seq = getRandomSequence(filtered, session.currentLevel);
    setSession(prev => ({ ...prev, sequence: seq, isCorrect: null, userInput: [] }));
    setState(AppState.PREVIEW);
  }, [config, session.currentLevel]);

  const handleConfigStart = () => {
    setSession(prev => ({ ...prev, currentLevel: config.startLevel, maxLevel: config.startLevel - 1 }));
    startTest();
  };

  const handleTestFinish = (userInput: string[]) => {
    const target = config.direction === Direction.BACKWARD 
      ? [...session.sequence].reverse() 
      : session.sequence;
    
    // Normalize comparison (trim and lower case if english)
    const normalize = (s: string) => s.trim().toLowerCase();
    const isCorrect = userInput.length === target.length && 
                      userInput.every((val, i) => normalize(val) === normalize(target[i]));

    setSession(prev => ({
      ...prev,
      userInput,
      isCorrect,
      maxLevel: isCorrect ? Math.max(prev.maxLevel, prev.currentLevel) : prev.maxLevel
    }));
    setState(AppState.RESULT);
  };

  const handleContinue = () => {
    if (session.isCorrect) {
      setSession(prev => ({ ...prev, currentLevel: prev.currentLevel + 1 }));
    }
    // We update currentLevel, then we need to trigger the word generation
    // useEffect can be used, but manual state transition is cleaner here
    // We'll let the user see the next level change in session then start
    setState(AppState.CONFIG); 
    // Wait for a tick to ensure session updated if we were to auto-start
    // But better to just go back and let them click or auto-trigger
  };

  // Effect to auto-start after "Continue" if we want a flow
  React.useEffect(() => {
    if (state === AppState.CONFIG && session.isCorrect !== null) {
       startTest();
    }
  }, [state, session.isCorrect, startTest]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-8 px-4 sm:px-6">
      <div className="w-full max-w-2xl">
        {state === AppState.CONFIG && (
          <ConfigScreen
            config={config}
            onUpdate={setConfig}
            onStart={handleConfigStart}
          />
        )}

        {(state === AppState.PREVIEW || state === AppState.DISPLAYING || state === AppState.RECALLING) && (
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden min-h-[500px]">
             <div className="bg-indigo-600 p-4 flex justify-between items-center text-white">
                <div className="flex items-center space-x-2">
                    <span className="bg-indigo-400 px-2 py-1 rounded text-xs font-bold uppercase tracking-tighter">Level</span>
                    <span className="text-xl font-black">{session.currentLevel}</span>
                </div>
                <div className="text-xs font-medium opacity-80">
                    {config.direction === Direction.FORWARD ? '正序模式' : '倒序模式'}
                </div>
             </div>
             <TestScreen
               level={session.currentLevel}
               config={config}
               sequence={session.sequence}
               onFinish={handleTestFinish}
               onCancel={() => setState(AppState.CONFIG)}
             />
          </div>
        )}

        {state === AppState.RESULT && (
          <ResultScreen
            session={session}
            config={config}
            onContinue={handleContinue}
            onRestart={() => {
                setSession({
                    currentLevel: config.startLevel,
                    maxLevel: 0,
                    sequence: [],
                    userInput: [],
                    isCorrect: null
                });
                setState(AppState.CONFIG);
            }}
          />
        )}
      </div>

      {/* Footer Info */}
      <footer className="mt-12 text-center text-gray-400 text-xs">
        <p>© 2024 Cognitive Research Tool · 认知功能评估与训练系统</p>
      </footer>

      {/* Tailwind Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default App;
