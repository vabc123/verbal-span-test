import React, { useState, useEffect, useCallback, useRef } from 'react';
import { CHINESE_WORDS } from '../constants';

// 游戏配置
const STIMULUS_DURATION = 2000; // 每个刺激出现的时间 (ms)
const INTER_STIMULUS_INTERVAL = 500; // 间隔时间 (ms)
const TOTAL_STEPS = 20 + 2; // 每轮总次数

interface StepData {
  position: number;
  word: string;
}

export const DualNBack: React.FC = () => {
  // 基础状态
  const [n, setN] = useState(2);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'result'>('idle');
  const [history, setHistory] = useState<StepData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  
  // 评分统计
  const [score, setScore] = useState({ posHit: 0, posMiss: 0, wordHit: 0, wordMiss: 0 });
  const [userResponded, setUserResponded] = useState({ pos: false, word: false });

  // 引用计数，用于在回调中获取最新值
  const stateRef = useRef({ currentIndex, history, userResponded, n });
  stateRef.current = { currentIndex, history, userResponded, n };

  // 生成下一个刺激
  const nextStep = useCallback(() => {
    const nextPos = Math.floor(Math.random() * 9);
    const nextWord = CHINESE_WORDS[Math.floor(Math.random() * CHINESE_WORDS.length)];
    
    setHistory(prev => [...prev, { position: nextPos, word: nextWord }]);
    setCurrentIndex(prev => prev + 1);
    setUserResponded({ pos: false, word: false });
  }, []);

  // 核心游戏循环
  useEffect(() => {
    let timer: number;
    if (gameState === 'playing') {
      if (currentIndex < TOTAL_STEPS - 1) {
        timer = window.setTimeout(() => {
          // 在进入下一步前，检查用户是否漏掉了原本该按的键
          checkMissedMatches();
          nextStep();
        }, STIMULUS_DURATION + INTER_STIMULUS_INTERVAL);
      } else {
        setGameState('result');
      }
    }
    return () => clearTimeout(timer);
  }, [gameState, currentIndex, nextStep]);

  // 检查漏选逻辑
  const checkMissedMatches = () => {
    const { currentIndex, history, userResponded, n } = stateRef.current;
    if (currentIndex < n) return;

    const target = history[currentIndex - n];
    const current = history[currentIndex];

    if (current.position === target.position && !userResponded.pos) {
      setScore(s => ({ ...s, posMiss: s.posMiss + 1 }));
    }
    if (current.word === target.word && !userResponded.word) {
      setScore(s => ({ ...s, wordMiss: s.wordMiss + 1 }));
    }
  };

  // 处理按键输入 (A: 位置, L: 词汇)
  const handleInput = useCallback((type: 'pos' | 'word') => {
    if (gameState !== 'playing' || currentIndex < n) return;
    if (userResponded[type]) return; // 防止重复点击

    const { history, currentIndex, n } = stateRef.current;
    const current = history[currentIndex];
    const target = history[currentIndex - n];

    const isMatch = type === 'pos' 
      ? current.position === target.position 
      : current.word === target.word;

    if (isMatch) {
      setScore(s => ({ ...s, [type + 'Hit']: s[type + 'Hit'] + 1 }));
    } else {
      // 这里的逻辑可以根据需要调整：如果是误报，可以扣分或记录
    }

    setUserResponded(prev => ({ ...prev, [type]: true }));
  }, [gameState, currentIndex, n, userResponded]);

  // 监听键盘
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'a') handleInput('pos');
      if (e.key.toLowerCase() === 'l') handleInput('word');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleInput]);

  const startGame = () => {
    setScore({ posHit: 0, posMiss: 0, wordHit: 0, wordMiss: 0 });
    setHistory([]);
    setCurrentIndex(-1);
    setGameState('playing');
    nextStep();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4 text-gray-800">
      <h1 className="text-3xl font-bold mb-6">Dual {n}-Back 训练</h1>

      {gameState === 'idle' && (
        <div className="text-center max-w-md">
          <p className="mb-4 text-gray-600">
            同时观察九宫格位置和出现的词汇。如果当前项与 <strong>{n} 步前</strong> 的相同，请按下对应键：
          </p>
          <div className="flex justify-around mb-8 bg-white p-4 rounded-xl shadow-sm">
            <div><kbd className="px-2 py-1 bg-gray-200 rounded">A</kbd> 位置匹配</div>
            <div><kbd className="px-2 py-1 bg-gray-200 rounded">L</kbd> 词汇匹配</div>
          </div>
          <div className="flex items-center justify-center gap-4 mb-6">
            <span>难度 (N):</span>
            <input 
              type="number" min="1" max="5" value={n} 
              onChange={(e) => setN(Number(e.target.value))}
              className="w-16 p-2 border rounded"
            />
          </div>
          <button onClick={startGame} className="bg-blue-600 text-white px-8 py-3 rounded-full font-bold hover:bg-blue-700 transition">
            开始训练
          </button>
        </div>
      )}

      {gameState === 'playing' && (
        <div className="flex flex-col items-center">
          {/* 九宫格视觉区域 */}
          <div className="grid grid-cols-3 gap-3 bg-white p-4 rounded-xl shadow-lg mb-8">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div 
                key={i} 
                className={`w-20 h-20 rounded-lg transition-all duration-150 ${
                  history[currentIndex]?.position === i ? 'bg-blue-500 scale-95 shadow-inner' : 'bg-gray-100'
                }`}
              />
            ))}
          </div>

          {/* 语言刺激区域 */}
          <div className="h-16 flex items-center justify-center">
            <span className="text-4xl font-black text-blue-900 tracking-widest">
              {history[currentIndex]?.word}
            </span>
          </div>

          <div className="mt-12 flex gap-4">
            <button 
              onMouseDown={() => handleInput('pos')}
              className={`px-6 py-4 rounded-lg font-bold transition ${userResponded.pos ? 'bg-gray-400' : 'bg-blue-100 text-blue-700 active:bg-blue-200'}`}
            >
              位置匹配 (A)
            </button>
            <button 
              onMouseDown={() => handleInput('word')}
              className={`px-6 py-4 rounded-lg font-bold transition ${userResponded.word ? 'bg-gray-400' : 'bg-green-100 text-green-700 active:bg-green-200'}`}
            >
              词汇匹配 (L)
            </button>
          </div>
          
          <div className="mt-8 text-gray-400">
            进度: {currentIndex + 1} / {TOTAL_STEPS}
          </div>
        </div>
      )}

      {gameState === 'result' && (
        <div className="text-center bg-white p-8 rounded-2xl shadow-xl">
          <h2 className="text-2xl font-bold mb-4">测试完成</h2>
          <div className="space-y-2 mb-6">
            <p>位置正确命中: <span className="text-green-600 font-bold">{score.posHit}</span></p>
            <p>位置漏选次数: <span className="text-red-500">{score.posMiss}</span></p>
            <p>词汇正确命中: <span className="text-green-600 font-bold">{score.wordHit}</span></p>
            <p>词汇漏选次数: <span className="text-red-500">{score.wordMiss}</span></p>
          </div>
          <button onClick={() => setGameState('idle')} className="bg-blue-600 text-white px-8 py-2 rounded-lg font-bold hover:bg-blue-700">
            返回
          </button>
        </div>
      )}
    </div>
  );
};
