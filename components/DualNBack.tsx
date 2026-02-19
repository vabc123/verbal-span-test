import React, { useState, useEffect, useCallback, useRef } from 'react';
import { CHINESE_WORDS, ENGLISH_WORDS } from '../constants';

interface DualNBackProps {
  mode: 'chinese' | 'english' | 'mixed';
  duration: number; // 毫秒
}

export const DualNBack: React.FC<DualNBackProps> = ({ mode, duration }) => {
  const [n, setN] = useState(2);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'result'>('idle');
  const [history, setHistory] = useState<{position: number, word: string}[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [score, setScore] = useState({ posHit: 0, posMiss: 0, wordHit: 0, wordMiss: 0 });
  const [userResponded, setUserResponded] = useState({ pos: false, word: false });
  
  // 本局专用的词池（关键：限制在 4-6 个词以增加匹配率）
  const [sessionWords, setSessionWords] = useState<string[]>([]);

  const stateRef = useRef({ currentIndex, history, userResponded, n });
  stateRef.current = { currentIndex, history, userResponded, n };

  const startGame = () => {
    // 根据模式选定基础库
    let basePool = mode === 'chinese' ? CHINESE_WORDS : mode === 'english' ? ENGLISH_WORDS : [...CHINESE_WORDS, ...ENGLISH_WORDS];
    // 从大库中随机挑 6 个作为本局的“活跃词池”
    const shuffled = [...basePool].sort(() => 0.5 - Math.random());
    setSessionWords(shuffled.slice(0, 6));

    setScore({ posHit: 0, posMiss: 0, wordHit: 0, wordMiss: 0 });
    setHistory([]);
    setCurrentIndex(-1);
    setGameState('playing');
    setTimeout(() => nextStep(shuffled.slice(0, 6)), 100);
  };

  const nextStep = useCallback((activePool: string[]) => {
    const nextPos = Math.floor(Math.random() * 9);
    // 从精简后的词池里抽，匹配概率大大增加
    const pool = activePool.length > 0 ? activePool : sessionWords;
    const nextWord = pool[Math.floor(Math.random() * pool.length)];
    
    setHistory(prev => [...prev, { position: nextPos, word: nextWord }]);
    setCurrentIndex(prev => prev + 1);
    setUserResponded({ pos: false, word: false });
  }, [sessionWords]);

  useEffect(() => {
    let timer: number;
    if (gameState === 'playing' && currentIndex < 20 + n) {
      timer = window.setTimeout(() => {
        checkMissed();
        nextStep(sessionWords);
      }, duration + 500);
    } else if (currentIndex >= 20 + n) {
      setGameState('result');
    }
    return () => clearTimeout(timer);
  }, [gameState, currentIndex, nextStep, duration, n, sessionWords]);

  const checkMissed = () => {
    const { currentIndex, history, userResponded, n } = stateRef.current;
    if (currentIndex < n) return;
    const current = history[currentIndex];
    const target = history[currentIndex - n];
    if (current.position === target.position && !userResponded.pos) setScore(s => ({ ...s, posMiss: s.posMiss + 1 }));
    if (current.word === target.word && !userResponded.word) setScore(s => ({ ...s, wordMiss: s.wordMiss + 1 }));
  };

  const handleInput = (type: 'pos' | 'word') => {
    if (gameState !== 'playing' || currentIndex < n || userResponded[type]) return;
    const { history, currentIndex, n } = stateRef.current;
    const isMatch = type === 'pos' ? history[currentIndex].position === history[currentIndex - n].position : history[currentIndex].word === history[currentIndex - n].word;
    if (isMatch) setScore(s => ({ ...s, [type + 'Hit']: s[type + 'Hit'] + 1 }));
    setUserResponded(prev => ({ ...prev, [type]: true }));
  };

  return (
    <div className="p-4 text-center">
      {gameState === 'idle' && (
        <div className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-xl text-sm text-blue-800">
            当前模式: {mode === 'mixed' ? '中英混合' : mode} | 显示时间: {duration}ms
          </div>
          <div className="flex items-center justify-center gap-4">
            <span>难度 (N):</span>
            <input type="number" min="1" value={n} onChange={e => setN(Number(e.target.value))} className="w-16 p-2 border rounded" />
          </div>
          <button onClick={startGame} className="bg-blue-600 text-white px-12 py-3 rounded-full font-bold shadow-lg">进入训练</button>
        </div>
      )}

      {gameState === 'playing' && (
        <div>
          <div className="grid grid-cols-3 gap-2 w-64 h-64 mx-auto mb-8">
            {[0,1,2,3,4,5,6,7,8].map(i => (
              <div key={i} className={`border rounded-lg transition-all ${history[currentIndex]?.position === i ? 'bg-blue-500 scale-95' : 'bg-gray-50'}`} />
            ))}
          </div>
          <div className="text-3xl font-bold h-12 mb-8 text-blue-900">{history[currentIndex]?.word}</div>
          <div className="flex gap-4 justify-center">
            <button onMouseDown={() => handleInput('pos')} className={`p-4 rounded-lg font-bold ${userResponded.pos ? 'bg-gray-300' : 'bg-blue-600 text-white'}`}>位置 (A)</button>
            <button onMouseDown={() => handleInput('word')} className={`p-4 rounded-lg font-bold ${userResponded.word ? 'bg-gray-300' : 'bg-green-600 text-white'}`}>词汇 (L)</button>
          </div>
          <div className="mt-4 text-gray-400">进度: {currentIndex + 1}</div>
        </div>
      )}

      {gameState === 'result' && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">训练报告</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="p-3 bg-green-50 rounded">位置命中: {score.posHit}</div>
            <div className="p-3 bg-red-50 rounded">位置漏选: {score.posMiss}</div>
            <div className="p-3 bg-green-50 rounded">词汇命中: {score.wordHit}</div>
            <div className="p-3 bg-red-50 rounded">词汇漏选: {score.wordMiss}</div>
          </div>
          <button onClick={() => setGameState('idle')} className="text-blue-600 font-bold">返回设置</button>
        </div>
      )}
    </div>
  );
};
