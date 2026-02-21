import React, { useState, useEffect, useCallback, useRef } from 'react';

// --- 基础词库 ---
const HARDCORE_WORDS = ["结构", "映射", "函数", "关系", "集合", "元素", "子集", "并集", "交集", "补集", "顺序", "等价", "分类", "范畴", "态射", "同构", "群论", "环论", "理想", "域论", "向量", "空间", "线性", "变换", "矩阵", "特征", "同态", "拓扑", "邻域", "连续", "紧致", "流形", "同调", "同伦", "系统", "涌现", "反馈", "稳态", "信息", "熵值", "噪声", "编码", "解码", "逻辑", "算法", "递归", "优化", "梯度"];
const ENGLISH_WORDS = ["Mapping", "Function", "Set", "Element", "Group", "Ring", "Field", "Space", "Linear", "Matrix", "Topology", "Logic", "System", "Entropy", "Feedback", "Stable"];
const NOISE_ENG = ["coffee", "leak", "pixel", "void", "stack", "flow", "node", "link", "void", "input", "output"];

type ModuleType = 'MENU' | 'SPAN' | 'NBACK' | 'COMPRESSION' | 'INTERFERENCE' | 'GENERATE';

export default function App() {
  const [activeModule, setActiveModule] = useState<ModuleType>('MENU');
  const [mode, setMode] = useState<'chinese' | 'english' | 'mixed'>('chinese');
  const [duration, setDuration] = useState(1200); 

  const getPool = () => {
    if (mode === 'chinese') return HARDCORE_WORDS;
    if (mode === 'english') return ENGLISH_WORDS;
    return [...HARDCORE_WORDS, ...ENGLISH_WORDS];
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-20">
      <nav className="bg-white px-6 py-4 shadow-sm flex justify-between items-center sticky top-0 z-50">
        <h1 className="text-xl font-black text-blue-600 cursor-pointer" onClick={() => setActiveModule('MENU')}>COGNI-LAB 2.0</h1>
        {activeModule !== 'MENU' && (
          <button onClick={() => setActiveModule('MENU')} className="text-sm font-bold text-slate-400">返回主菜单</button>
        )}
      </nav>

      <main className="max-w-xl mx-auto mt-8 px-4">
        {activeModule === 'MENU' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">实验室全局配置</h2>
              <div className="space-y-6">
                <div>
                  <label className="text-sm font-bold block mb-3">选择测试语种：</label>
                  <div className="flex bg-slate-100 p-1 rounded-2xl">
                    {(['chinese', 'english', 'mixed'] as const).map(m => (
                      <button key={m} onClick={() => setMode(m)} className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${mode === m ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}>
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
                  <input type="range" min="400" max="3000" step="100" value={duration} onChange={e => setDuration(Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                </div>
              </div>
            </section>

            <div className="grid gap-4">
              <MenuCard icon="📊" title="语言跨度 (Verbal Span)" desc="测量“内存容量”极限。支持自定义词数长度。" onClick={() => setActiveModule('SPAN')} border="hover:border-blue-500" />
              <MenuCard icon="🔄" title="双向匹配 (Dual N-Back)" desc="实时动态更新。强制大脑进行特征压缩训练。" onClick={() => setActiveModule('NBACK')} border="hover:border-yellow-500" />
              <MenuCard icon="💎" title="结构压缩 (Compression)" desc="训练主动建模能力。将词群压缩为逻辑结构图。" onClick={() => setActiveModule('COMPRESSION')} border="hover:border-purple-500" />
              <MenuCard icon="⚡" title="抗干扰抑制 (Interference)" desc="逐个出现。过滤数字/英文噪声，提取核心抽象词。" onClick={() => setActiveModule('INTERFERENCE')} border="hover:border-red-500" />
              <MenuCard icon="🌱" title="语义反向生成 (Generation)" desc="训练语义网络调度。根据种子词进行结构化扩张。" onClick={() => setActiveModule('GENERATE')} border="hover:border-emerald-500" />
            </div>
          </div>
        )}

        <div className={activeModule === 'MENU' ? 'hidden' : 'bg-white rounded-[2.5rem] shadow-xl p-8 border border-slate-100 min-h-[450px] flex flex-col justify-center'}>
          {activeModule === 'SPAN' && <SpanModule pool={getPool()} duration={duration} />}
          {activeModule === 'NBACK' && <NBackModule pool={getPool()} duration={duration} />}
          {activeModule === 'COMPRESSION' && <CompressionModule pool={getPool()} />}
          {activeModule === 'INTERFERENCE' && <InterferenceModule pool={getPool()} duration={duration} />}
          {activeModule === 'GENERATE' && <GenerateModule pool={getPool()} />}
        </div>
      </main>
    </div>
  );
}

const MenuCard = ({ icon, title, desc, onClick, border }: any) => (
  <button onClick={onClick} className={`bg-white p-6 rounded-3xl border-2 border-transparent ${border} transition-all text-left shadow-sm group`}>
    <div className="text-3xl mb-2">{icon}</div>
    <h3 className="font-bold text-lg text-slate-800">{title}</h3>
    <p className="text-slate-400 text-xs mt-1">{desc}</p>
  </button>
);

// --- 模块 1: Span (找回了难度设置) ---
const SpanModule = ({ pool, duration }: any) => {
  const [phase, setPhase] = useState<'idle' | 'play' | 'input' | 'result'>('idle');
  const [level, setLevel] = useState(5); // 找回难度状态
  const [seq, setSeq] = useState<string[]>([]);
  const [curr, setCurr] = useState(0);
  const [input, setInput] = useState("");

  const start = () => {
    // 使用 level 状态生成序列
    const s = Array.from({length: level}, () => pool[Math.floor(Math.random()*pool.length)]);
    setSeq(s); setCurr(0); setPhase('play'); setInput("");
  };

  useEffect(() => {
    if (phase === 'play') {
      const t = setTimeout(() => {
        if (curr < seq.length - 1) setCurr(curr + 1);
        else setPhase('input');
      }, duration);
      return () => clearTimeout(t);
    }
  }, [phase, curr, seq, duration]);

  return (
    <div className="text-center">
      {phase === 'idle' && (
        <div className="space-y-8 animate-in fade-in">
          {/* 【修改点3】在这里插入字数调节器 */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">目标抽象词数量</h2>
            <div className="flex items-center justify-center gap-6">
              <button onClick={() => setAbstractCount(Math.max(1, abstractCount - 1))} className="w-10 h-10 rounded-full border-2 border-slate-200 text-xl font-bold hover:bg-slate-50 text-slate-400">-</button>
              <div className="text-4xl font-black text-red-500 w-16">{abstractCount}</div>
              <button onClick={() => setAbstractCount(abstractCount + 1)} className="w-10 h-10 rounded-full border-2 border-slate-200 text-xl font-bold hover:bg-slate-50 text-slate-400">+</button>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-xs text-slate-400">词汇逐个出现。滤除数字/英文噪声，只记中文并倒序。</p>
            <button onClick={start} className="bg-red-500 text-white px-12 py-3 rounded-full font-bold shadow-lg shadow-red-100 transition-transform active:scale-95">激活抑制协议</button>
          </div>
        </div>
      )}
      
      {phase === 'play' && (
        <div className="text-5xl font-black text-blue-600 tracking-wider">
          {seq[curr]}
        </div>
      )}

      {phase === 'input' && (
        <div className="space-y-6">
          <h3 className="font-bold text-slate-500 uppercase text-xs tracking-widest">记忆提取中...</h3>
          <textarea className="w-full p-4 border-2 border-blue-50 rounded-2xl focus:border-blue-500 outline-none text-center text-lg" rows={3} value={input} onChange={e => setInput(e.target.value)} placeholder="词汇空格隔开..." autoFocus />
          <button onClick={() => setPhase('result')} className="bg-blue-600 text-white px-12 py-3 rounded-xl font-bold w-full">提交校验</button>
        </div>
      )}

      {phase === 'result' && (
        <div className="space-y-4">
          <div className="p-4 bg-slate-50 rounded-2xl text-left border border-slate-100">
            <p className="text-[10px] text-slate-400 font-bold mb-2 uppercase tracking-widest">正确序列 (Total: {seq.length})</p>
            <p className="text-blue-700 font-bold leading-relaxed">{seq.join(' → ')}</p>
          </div>
          <button onClick={() => setPhase('idle')} className="text-blue-600 text-sm font-bold hover:underline">返回设置</button>
        </div>
      )}
    </div>
  );
};

// --- 模块 2: N-Back ---
const NBackModule = ({ pool, duration }: any) => {
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'result'>('idle');
  const [history, setHistory] = useState<any[]>([]);
  const [curr, setCurr] = useState(-1);

  const next = useCallback(() => {
    const word = pool[Math.floor(Math.random()*6)];
    const pos = Math.floor(Math.random()*9);
    setHistory(prev => [...prev, {word, pos}]);
    setCurr(c => c + 1);
  }, [pool]);

  useEffect(() => {
    if (gameState === 'playing' && curr < 15) {
      const t = setTimeout(next, duration + 300);
      return () => clearTimeout(t);
    } else if (curr >= 15) setGameState('result');
  }, [gameState, curr, next, duration]);

  return (
    <div className="text-center">
      {gameState === 'idle' && <button onClick={() => {setGameState('playing'); setHistory([]); setCurr(-1); next();}} className="bg-yellow-500 text-white px-10 py-3 rounded-full font-bold shadow-lg shadow-yellow-100">进入 Dual 2-Back</button>}
      {gameState === 'playing' && history[curr] && (
        <div className="space-y-8">
          <div className="grid grid-cols-3 gap-2 w-48 mx-auto">
            {[0,1,2,3,4,5,6,7,8].map(i => (
              <div key={i} className={`h-14 w-14 rounded-xl border-2 transition-colors ${history[curr].pos === i ? 'bg-blue-500 border-blue-600' : 'bg-slate-50 border-slate-100'}`} />
            ))}
          </div>
          <div className="text-4xl font-black text-slate-800 tracking-widest">{history[curr].word}</div>
          <div className="flex gap-4 justify-center text-[10px] text-slate-400 font-bold">
            <span>KEY A: POSITION</span>
            <span>KEY L: VERBAL</span>
          </div>
        </div>
      )}
      {gameState === 'result' && <button onClick={() => setGameState('idle')} className="text-yellow-600 font-bold">测试结束</button>}
    </div>
  );
};

// --- 模块 3: 结构压缩 (也增加了词数设置) ---
const CompressionModule = ({ pool }: any) => {
  const [words, setWords] = useState<string[]>([]);
  const [count, setCount] = useState(6); // 增加词数设置
  const [phase, setPhase] = useState<'idle' | 'show' | 'input' | 'result'>('idle');
  const [labels, setLabels] = useState("");

  const start = () => {
    setWords([...pool].sort(() => 0.5 - Math.random()).slice(0, count));
    setPhase('show');
    setTimeout(() => setPhase('input'), 10000); 
  };

  return (
    <div className="text-center space-y-6">
      <h2 className="text-xl font-bold text-purple-600 italic">Structural Coding</h2>
      {phase === 'idle' && (
        <div className="space-y-6">
          <div className="flex items-center justify-center gap-4">
            <span className="text-sm">词数:</span>
            <input type="number" value={count} onChange={e => setCount(Number(e.target.value))} className="w-16 p-2 border rounded text-center" />
          </div>
          <button onClick={start} className="bg-purple-600 text-white px-10 py-3 rounded-full font-bold shadow-lg shadow-purple-100">构思词群图 (10s)</button>
        </div>
      )}
      {phase === 'show' && <div className="grid grid-cols-2 gap-4">{words.map(w => <div key={w} className="p-4 bg-purple-50 rounded-2xl font-bold text-purple-900">{w}</div>)}</div>}
      {phase === 'input' && (
        <div className="space-y-4">
          <input className="w-full p-4 border-2 border-purple-100 rounded-2xl focus:border-purple-500 outline-none" value={labels} onChange={e => setLabels(e.target.value)} placeholder="输入脑内结构标签..." />
          <button onClick={() => setPhase('result')} className="bg-purple-600 text-white w-full py-3 rounded-xl font-bold">核对原始词群</button>
        </div>
      )}
      {phase === 'result' && (
        <div className="space-y-4">
          <div className="p-4 bg-slate-50 rounded-2xl text-left font-medium leading-relaxed">{words.join(' · ')}</div>
          <div className="italic text-purple-600 text-sm">标签: "{labels}"</div>
          <button onClick={() => setPhase('idle')} className="text-purple-600 text-xs font-bold">Restart</button>
        </div>
      )}
    </div>
  );
};

// --- 模块 4: 抗干扰 (护眼稳定版) ---
const InterferenceModule = ({ pool, duration }: any) => {
  const [phase, setPhase] = useState<'idle' | 'play' | 'input' | 'result'>('idle');
  const [items, setItems] = useState<any[]>([]);
  const [curr, setCurr] = useState(0);
  const [input, setInput] = useState("");
  const [abstractCount, setAbstractCount] = useState(3);
  
  const start = () => {
    const c = [...pool].sort(() => 0.5 - Math.random()).slice(0, abstractCount);
    const n = [Math.floor(Math.random()*100), Math.floor(Math.random()*9)];
    const e = [...NOISE_ENG].sort(() => 0.5 - Math.random()).slice(0, 2);
    setItems([...c, ...n, ...e].sort(() => 0.5 - Math.random()));
    setCurr(0);
    setPhase('play');
    setInput("");
  };

  useEffect(() => {
    if (phase === 'play') {
      const t = setTimeout(() => {
        if (curr < items.length - 1) setCurr(curr + 1);
        else setPhase('input');
      }, duration);
      return () => clearTimeout(t);
    }
  }, [phase, curr, items, duration]);

  const getTarget = () => items.filter(i => typeof i === 'string' && /[\u4e00-\u9fa5]/.test(i)).reverse();

  return (
    <div className="text-center">
      <h2 className="text-xl font-bold text-red-500 mb-6 font-mono tracking-tighter uppercase">Inhibition Lab</h2>
      {phase === 'idle' && <button onClick={start} className="bg-red-500 text-white px-10 py-3 rounded-full font-bold shadow-lg shadow-red-100">激活抑制协议</button>}
      {phase === 'play' && (
        <div className="h-32 flex items-center justify-center">
          <div className={`text-5xl font-black ${typeof items[curr] === 'number' ? 'text-slate-200' : /^[a-zA-Z]/.test(items[curr]) ? 'text-slate-300' : 'text-red-600'}`}>
            {items[curr]}
          </div>
        </div>
      )}
      {phase === 'input' && (
        <div className="space-y-6">
          <p className="text-sm font-bold text-red-500 uppercase tracking-widest">滤除噪声，倒序复述：</p>
          <input className="w-full p-5 border-2 border-red-50 rounded-2xl text-center text-xl font-bold focus:border-red-500 outline-none" value={input} onChange={e => setInput(e.target.value)} placeholder="词1 词2..." autoFocus />
          <button onClick={() => setPhase('result')} className="bg-red-500 text-white w-full py-4 rounded-2xl font-bold shadow-lg shadow-red-50">揭晓答案</button>
        </div>
      )}
      {phase === 'result' && (
        <div className="space-y-6">
          <div className="p-6 bg-slate-900 text-white rounded-[2rem] text-left">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-3 italic">Correct Target:</p>
            <p className="text-red-400 font-bold text-2xl tracking-widest leading-relaxed">{getTarget().join(' ← ')}</p>
          </div>
          <button onClick={() => setPhase('idle')} className="text-red-500 text-xs font-bold uppercase tracking-widest hover:underline">Retry</button>
        </div>
      )}
    </div>
  );
};

// --- 模块 5: 语义生成 ---
const GenerateModule = ({ pool }: any) => {
  const [seeds, setSeeds] = useState<string[]>([]);
  const start = () => setSeeds([...pool].sort(() => 0.5 - Math.random()).slice(0, 3));
  useEffect(start, [pool]);

  return (
    <div className="text-center space-y-8">
      <div className="space-y-2">
        <h2 className="text-xl font-bold text-emerald-600 italic tracking-tight">Semantic Network</h2>
        <p className="text-xs text-slate-400">基于“种子词”进行关联扩张练习</p>
      </div>
      <div className="flex justify-center gap-3">
        {seeds.map(s => <span key={s} className="px-5 py-2 bg-emerald-50 text-emerald-700 rounded-2xl font-black border-2 border-emerald-100 shadow-sm">{s}</span>)}
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[1,2,3,4,5,6].map(i => <input key={i} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-center text-sm focus:bg-white focus:border-emerald-400 outline-none transition-all shadow-inner" placeholder={`相关概念 ${i}`} />)}
      </div>
      <button onClick={start} className="text-emerald-500 text-sm font-bold">New Seeds</button>
    </div>
  );
};
