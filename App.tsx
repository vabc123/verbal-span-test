import React, { useState, useEffect, useCallback, useRef } from 'react';

// --- 基础词库 ---
const CHINESE_WORDS = ["太阳", "月亮", "星星", "天空", "大海", "森林", "苹果", "香蕉", "电脑", "手机", "书籍", "老师", "学生", "医生", "护士", "城市", "理想", "逻辑", "情绪", "感觉", "勇敢", "跳舞", "跑步", "旅游", "时光", "希望", "智慧", "力量", "和平", "自由"];
const ENGLISH_WORDS = ["Sun", "Moon", "Star", "Sky", "Ocean", "Forest", "Apple", "Banana", "Phone", "Book", "Teacher", "Doctor", "Nurse", "City", "Dream", "Logic", "Mood", "Feel", "Brave", "Dance", "Run", "Travel", "Time", "Hope", "Wisdom", "Power", "Peace", "Free"];

// --- 类型定义 ---
type Mode = 'chinese' | 'english' | 'mixed';

// ==========================================
// 1. 语言跨度测试组件 (Verbal Span)
// ==========================================
const VerbalSpanTest: React.FC<{ mode: Mode; duration: number }> = ({ mode, duration }) => {
  const [phase, setPhase] = useState<'idle' | 'memorize' | 'input' | 'result'>('idle');
  const [level, setLevel] = useState(5);
  const [sequence, setSequence] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState("");

  const getWordPool = () => {
    if (mode === 'chinese') return CHINESE_WORDS;
    if (mode === 'english') return ENGLISH_WORDS;
    return [...CHINESE_WORDS, ...ENGLISH_WORDS];
  };

  const startTest = () => {
    const pool = getWordPool();
    const newSeq = Array.from({ length: level }, () => pool[Math.floor(Math.random() * pool.length)]);
    setSequence(newSeq);
    setUserInput("");
    setPhase('memorize');
    setCurrentIndex(0);
  };

  useEffect(() => {
    if (phase === 'memorize') {
      const timer = setTimeout(() => {
        if (currentIndex < sequence.length - 1) {
          setCurrentIndex(prev => prev + 1);
        } else {
          setPhase('input');
        }
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [phase, currentIndex, sequence, duration]);

  const calculateScore = () => {
    const answers = userInput.trim().split(/[\s,，]+/).filter(s => s !== "");
    let correct = 0;
    sequence.forEach((word, i) => {
      if (answers[i] === word) correct++;
    });
    return { correct, total: sequence.length };
  };

  return (
    <div className="flex flex-col items-center py-4">
      {phase === 'idle' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-700">语言跨度测试</h2>
          <div className="flex items-center gap-4 justify-center">
            <span className="text-sm font-medium">记忆长度:</span>
            <input type="number" value={level} onChange={e => setLevel(Number(e.target.value))} className="w-16 p-2 border rounded" />
          </div>
          <button onClick={startTest} className="bg-green-600 text-white px-10 py-3 rounded-full font-bold shadow-lg">开始显示</button>
        </div>
      )}

      {phase === 'memorize' && (
        <div className="h-40 flex items-center justify-center">
          <div className="text-5xl font-black text-blue-600 animate-pulse">{sequence[currentIndex]}</div>
        </div>
      )}

      {phase === 'input' && (
        <div className="w-full max-w-md space-y-4">
          <p className="text-slate-600">请按顺序输入词汇（空格或逗号隔开）：</p>
          <textarea 
            className="w-full p-4 border-2 border-blue-200 rounded-xl focus:border-blue-500 outline-none"
            rows={4}
            value={userInput}
            onChange={e => setUserInput(e.target.value)}
            placeholder="例如：太阳 医生 苹果..."
            autoFocus
          />
          <button onClick={() => setPhase('result')} className="bg-blue-600 text-white w-full py-3 rounded-xl font-bold">提交结果</button>
        </div>
      )}

      {phase === 'result' && (
        <div className="bg-slate-50 p-6 rounded-2xl w-full">
          <h3 className="text-xl font-bold mb-4">测试报告</h3>
          <div className="text-4xl font-black text-blue-600 mb-4">{calculateScore().correct} / {calculateScore().total}</div>
          <div className="text-left space-y-2 text-sm">
            <p className="text-slate-400">正确序列: {sequence.join(' → ')}</p>
            <p className="text-blue-600">你的回答: {userInput}</p>
          </div>
          <button onClick={() => setPhase('idle')} className="mt-6 text-blue-600 underline">重新开始</button>
        </div>
      )}
    </div>
  );
};

// ==========================================
// 2. Dual N-Back 训练组件
// ==========================================
const DualNBack: React.FC<{ mode: Mode; duration: number }> = ({ mode, duration }) => {
  const [n, setN] = useState(2);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'result'>('idle');
  const [history, setHistory] = useState<{position: number, word: string}[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [score, setScore] = useState({ posHit: 0, posMiss: 0, wordHit: 0, wordMiss: 0 });
  const [userResponded, setUserResponded] = useState({ pos: false, word: false });
  const [sessionWords, setSessionWords] = useState<string[]>([]);

  const stateRef = useRef({ currentIndex, history, userResponded, n });
  stateRef.current = { currentIndex, history, userResponded, n };

  const startSession = () => {
    let pool = mode === 'chinese' ? CHINESE_WORDS : mode === 'english' ? ENGLISH_WORDS : [...CHINESE_WORDS, ...ENGLISH_WORDS];
    const sessionPool = [...pool].sort(() => 0.5 - Math.random()).slice(0, 6); // 限制词池增加匹配率
    setSessionWords(sessionPool);
    setScore({ posHit: 0, posMiss: 0, wordHit: 0, wordMiss: 0 });
    setHistory([]);
    setCurrentIndex(-1);
    setGameState('playing');
    setTimeout(() => spawnNext(sessionPool), 100);
  };

  const spawnNext = useCallback((pool: string[]) => {
    const nextPos = Math.floor(Math.random() * 9);
    const nextWord = pool[Math.floor(Math.random() * pool.length)];
    setHistory(prev => [...prev, { position: nextPos, word: nextWord }]);
    setCurrentIndex(prev => prev + 1);
    setUserResponded({ pos: false, word: false });
  }, []);

  useEffect(() => {
    let timer: number;
    if (gameState === 'playing') {
      if (currentIndex < 20 + n) {
        timer = window.setTimeout(() => {
          checkMissed();
          spawnNext(sessionWords);
        }, duration + 500);
      } else {
        setGameState('result');
      }
    }
    return () => clearTimeout(timer);
  }, [gameState, currentIndex, duration, n, sessionWords, spawnNext]);

  const checkMissed = () => {
    const { currentIndex, history, userResponded, n } = stateRef.current;
    if (currentIndex < n) return;
    const current = history[currentIndex];
    const target = history[currentIndex - n];
    if (current.position === target.position && !userResponded.pos) setScore(s => ({ ...s, posMiss: s.posMiss + 1 }));
    if (current.word === target.word && !userResponded.word) setScore(s => ({ ...s, wordMiss: s.wordMiss + 1 }));
  };

  const handleMatch = (type: 'pos' | 'word') => {
    if (gameState !== 'playing' || currentIndex < n || userResponded[type]) return;
    const { history, currentIndex, n } = stateRef.current;
    const isMatch = type === 'pos' 
      ? history[currentIndex].position === history[currentIndex - n].position 
      : history[currentIndex].word === history[currentIndex - n].word;
    
    if (isMatch) setScore(s => ({ ...s, [type + 'Hit']: s[type + 'Hit'] + 1 }));
    setUserResponded(prev => ({ ...prev, [type]: true }));
  };

  // 键盘支持
  useEffect(() => {
    const downHandler = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'a') handleMatch('pos');
      if (e.key.toLowerCase() === 'l') handleMatch('word');
    };
    window.addEventListener('keydown', downHandler);
    return () => window.removeEventListener('keydown', downHandler);
  }, [currentIndex, gameState]);

  return (
    <div className="text-center">
      {gameState === 'idle' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Dual N-Back 训练</h2>
          <div className="flex items-center gap-4 justify-center">
            <span>难度 (N):</span>
            <input type="number" min="1" value={n} onChange={e => setN(Number(e.target.value))} className="w-16 p-2 border rounded" />
          </div>
          <div className="text-xs text-slate-400 bg-slate-100 p-3 rounded-lg">
            快捷键：位置匹配 [A] | 词汇匹配 [L]
          </div>
          <button onClick={startSession} className="bg-blue-600 text-white px-12 py-3 rounded-full font-bold shadow-lg">开始挑战</button>
        </div>
      )}

      {gameState === 'playing' && (
        <div className="flex flex-col items-center">
          <div className="grid grid-cols-3 gap-3 bg-slate-100 p-4 rounded-2xl mb-8">
            {[0,1,2,3,4,5,6,7,8].map(i => (
              <div key={i} className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl transition-all ${history[currentIndex]?.position === i ? 'bg-blue-500 scale-90 shadow-inner' : 'bg-white'}`} />
            ))}
          </div>
          <div className="text-3xl font-black text-blue-900 mb-10 h-10">{history[currentIndex]?.word}</div>
          <div className="flex gap-4">
            <button onMouseDown={() => handleMatch('pos')} className={`px-8 py-4 rounded-xl font-bold transition ${userResponded.pos ? 'bg-slate-300' : 'bg-blue-600 text-white'}`}>位置 (A)</button>
            <button onMouseDown={() => handleMatch('word')} className={`px-8 py-4 rounded-xl font-bold transition ${userResponded.word ? 'bg-slate-300' : 'bg-green-600 text-white'}`}>词汇 (L)</button>
          </div>
        </div>
      )}

      {gameState === 'result' && (
        <div className="space-y-4">
          <h3 className="text-2xl font-bold">训练总结</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-green-50 rounded-xl">位置命中: <span className="font-bold text-green-700">{score.posHit}</span></div>
            <div className="p-4 bg-red-50 rounded-xl">位置漏选: <span className="font-bold text-red-700">{score.posMiss}</span></div>
            <div className="p-4 bg-green-50 rounded-xl">词汇命中: <span className="font-bold text-green-700">{score.wordHit}</span></div>
            <div className="p-4 bg-red-50 rounded-xl">词汇漏选: <span className="font-bold text-red-700">{score.wordMiss}</span></div>
          </div>
          <button onClick={() => setGameState('idle')} className="bg-slate-800 text-white px-8 py-2 rounded-lg">返回设置</button>
        </div>
      )}
    </div>
  );
};

// ==========================================
// 3. 主应用入口 (App)
// ==========================================
export default function App() {
  const [activeTab, setActiveTab] = useState<'menu' | 'span' | 'nback'>('menu');
  const [mode, setMode] = useState<Mode>('chinese');
  const [duration, setDuration] = useState(1500);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-20">
      {/* 顶部导航 */}
      <nav className="bg-white px-6 py-4 shadow-sm flex justify-between items-center sticky top-0 z-10">
        <h1 className="text-xl font-black tracking-tighter text-blue-600 cursor-pointer" onClick={() => setActiveTab('menu')}>COGNI-LAB</h1>
        {activeTab !== 'menu' && (
          <button onClick={() => setActiveTab('menu')} className="text-sm font-bold text-slate-400 hover:text-blue-600">退出模式</button>
        )}
      </nav>

      <main className="max-w-xl mx-auto mt-8 px-4">
        {activeTab === 'menu' && (
          <div className="space-y-8">
            {/* 配置面板 */}
            <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">实验室全局配置</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="text-sm font-bold block mb-3">选择测试语种：</label>
                  <div className="flex bg-slate-100 p-1 rounded-2xl">
                    {(['chinese', 'english', 'mixed'] as const).map(m => (
                      <button 
                        key={m}
                        onClick={() => setMode(m)}
                        className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${mode === m ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}
                      >
                        {m === 'chinese' ? '纯中文' : m === 'english' ? 'English' : '中英混合'}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm font-bold mb-3">
                    <span>显示刺激时长：</span>
                    <span className="text-blue-600">{duration}ms</span>
                  </div>
                  <input 
                    type="range" min="400" max="3000" step="100" 
                    value={duration} onChange={e => setDuration(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-2 font-mono">
                    <span>FAST (400ms)</span>
                    <span>SLOW (3000ms)</span>
                  </div>
                </div>
              </div>
            </section>

            {/* 功能卡片 */}
            <div className="grid gap-4">
              <button 
                onClick={() => setActiveTab('span')}
                className="bg-white p-6 rounded-3xl border-2 border-transparent hover:border-blue-500 transition-all text-left shadow-sm group"
              >
                <div className="text-3xl mb-3">🧠</div>
                <h3 className="font-bold text-lg">语言跨度 (Verbal Span)</h3>
                <p className="text-slate-400 text-xs mt-1">测量工作记忆的“内存容量”。如果你想再次确认为何中文能记5个词而英文只能记2个，选这个。</p>
              </button>

              <button 
                onClick={() => setActiveTab('nback')}
                className="bg-white p-6 rounded-3xl border-2 border-transparent hover:border-blue-500 transition-all text-left shadow-sm group"
              >
                <div className="text-3xl mb-3">⚡</div>
                <h3 className="font-bold text-lg">双向匹配 (Dual N-Back)</h3>
                <p className="text-slate-400 text-xs mt-1">练习特征压缩与动态更新。通过同时处理位置与语义，强迫大脑进行高强度优化。</p>
              </button>
            </div>
          </div>
        )}

        {/* 模式渲染 */}
        <div className="bg-white rounded-[2.5rem] shadow-xl p-8 border border-slate-100 min-h-[400px] flex flex-col justify-center">
          {activeTab === 'span' && <VerbalSpanTest mode={mode} duration={duration} />}
          {activeTab === 'nback' && <DualNBack mode={mode} duration={duration} />}
        </div>
      </main>

      <footer className="text-center mt-12 text-slate-300 text-[10px] tracking-widest uppercase">
        Intelligence = Compression × Pattern Matching
      </footer>
    </div>
  );
}
