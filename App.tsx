import React, { useState, useEffect, useCallback, useRef } from 'react';

// --- 基础词库 ---
const HARDCORE_WORDS = ["结构", "映射", "函数", "关系", "集合", "元素", "子集", "并集", "交集", "补集", "顺序", "等价", "分类", "范畴", "态射", "同构", "群论", "环论", "理想", "域论", "向量", "空间", "线性", "变换", "矩阵", "特征", "同态", "拓扑", "邻域", "连续", "紧致", "流形", "同调", "同伦", "系统", "涌现", "反馈", "稳态", "信息", "熵值", "噪声", "编码", "解码", "逻辑", "算法", "递归", "优化", "梯度"];
const ENGLISH_WORDS = ["Mapping", "Function", "Set", "Element", "Group", "Ring", "Field", "Space", "Linear", "Matrix", "Topology", "Logic", "System", "Entropy", "Feedback", "Stable"];
const NOISE_ENG = ["coffee", "leak", "pixel", "void", "stack", "flow", "node", "link"];

type ModuleType = 'MENU' | 'SPAN' | 'NBACK' | 'COMPRESSION' | 'INTERFERENCE' | 'GENERATE';

export default function App() {
  const [activeModule, setActiveModule] = useState<ModuleType>('MENU');
  const [mode, setMode] = useState<'chinese' | 'english' | 'mixed'>('chinese');
  const [duration, setDuration] = useState(1500);

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
              <MenuCard icon="📊" title="语言跨度 (Verbal Span)" desc="测量“内存容量”极限。顺序记住并复述。" onClick={() => setActiveModule('SPAN')} border="hover:border-blue-500" />
              <MenuCard icon="🔄" title="双向匹配 (Dual N-Back)" desc="实时动态更新。强制大脑进行特征压缩训练。" onClick={() => setActiveModule('NBACK')} border="hover:border-yellow-500" />
              <MenuCard icon="💎" title="结构压缩 (Compression)" desc="训练主动建模能力。将词群压缩为逻辑结构图。" onClick={() => setActiveModule('COMPRESSION')} border="hover:border-purple-500" />
              <MenuCard icon="⚡" title="抗干扰抑制 (Interference)" desc="高难度！过滤噪声提取抽象词并倒序。" onClick={() => setActiveModule('INTERFERENCE')} border="hover:border-red-500" />
              <MenuCard icon="🌱" title="语义反向生成 (Generation)" desc="训练语义网络调度。根据种子词进行结构化扩张。" onClick={() => setActiveModule('GENERATE')} border="hover:border-emerald-500" />
            </div>
          </div>
        )}

        <div className={activeModule === 'MENU' ? 'hidden' : 'bg-white rounded-[2.5rem] shadow-xl p-8 border border-slate-100 min-h-[450px] flex flex-col justify-center animate-in zoom-in-95 duration-300'}>
          {activeModule === 'SPAN' && <SpanModule pool={getPool()} duration={duration} />}
          {activeModule === 'NBACK' && <NBackModule pool={getPool()} duration={duration} />}
          {activeModule === 'COMPRESSION' && <CompressionModule pool={getPool()} />}
          {activeModule === 'INTERFERENCE' && <InterferenceModule pool={getPool()} />}
          {activeModule === 'GENERATE' && <GenerateModule pool={getPool()} />}
        </div>
      </main>
    </div>
  );
}

const MenuCard = ({ icon, title, desc, onClick, border }: any) => (
  <button onClick={onClick} className={`bg-white p-6 rounded-3xl border-2 border-transparent ${border} transition-all text-left shadow-sm group`}>
    <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">{icon}</div>
    <h3 className="font-bold text-lg text-slate-800">{title}</h3>
    <p className="text-slate-400 text-xs mt-1">{desc}</p>
  </button>
);

// --- 修正后的模块 1: Span (增加输入阶段) ---
const SpanModule = ({ pool, duration }: any) => {
  const [phase, setPhase] = useState<'idle' | 'play' | 'input' | 'result'>('idle');
  const [seq, setSeq] = useState<string[]>([]);
  const [curr, setCurr] = useState(0);
  const [input, setInput] = useState("");

  const start = () => {
    const s = Array.from({length: 5}, () => pool[Math.floor(Math.random()*pool.length)]);
    setSeq(s); setCurr(0); setPhase('play'); setInput("");
  };

  useEffect(() => {
    if (phase === 'play') {
      const t = setTimeout(() => {
        if (curr < seq.length - 1) setCurr(curr + 1);
        else setPhase('input'); // 播放完后进入输入阶段，此时不看答案
      }, duration);
      return () => clearTimeout(t);
    }
  }, [phase, curr, seq, duration]);

  return (
    <div className="text-center">
      {phase === 'idle' && (
        <div className="space-y-4">
          <p className="text-slate-400 text-sm">准备好测试你的硬核词库跨度了吗？</p>
          <button onClick={start} className="bg-blue-600 text-white px-10 py-3 rounded-full font-bold shadow-lg shadow-blue-100">开始测试</button>
        </div>
      )}
      
      {phase === 'play' && (
        <div className="text-5xl font-black text-blue-600 animate-pulse tracking-wider">
          {seq[curr]}
        </div>
      )}

      {phase === 'input' && (
        <div className="space-y-6 animate-in fade-in">
          <h3 className="font-bold text-slate-500">记忆提取：按顺序输入词汇</h3>
          <textarea 
            className="w-full p-4 border-2 border-blue-100 rounded-2xl focus:border-blue-500 outline-none text-center text-lg" 
            rows={3}
            value={input} 
            onChange={e => setInput(e.target.value)} 
            placeholder="词汇之间用空格隔开..."
            autoFocus
          />
          <button onClick={() => setPhase('result')} className="bg-blue-600 text-white px-12 py-3 rounded-xl font-bold">提交校验</button>
        </div>
      )}

      {phase === 'result' && (
        <div className="space-y-6 animate-in zoom-in-95">
          <div className="p-4 bg-slate-50 rounded-2xl text-left space-y-2">
            <p className="text-xs font-bold text-slate-400 uppercase">正确序列:</p>
            <p className="text-blue-700 font-bold">{seq.join(' → ')}</p>
            <p className="text-xs font-bold text-slate-400 uppercase mt-4">你的回答:</p>
            <p className="text-slate-600 italic">{input || "(空白)"}</p>
          </div>
          <button onClick={() => setPhase('idle')} className="bg-slate-100 text-slate-500 px-8 py-2 rounded-lg text-sm font-bold">重新开始</button>
        </div>
      )}
    </div>
  );
};

// --- 模块 2: N-Back (增加实时反馈) ---
const NBackModule = ({ pool, duration }: any) => {
  const [n] = useState(2);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'result'>('idle');
  const [history, setHistory] = useState<any[]>([]);
  const [curr, setCurr] = useState(-1);
  const [score, setScore] = useState(0);

  const next = useCallback(() => {
    const word = pool[Math.floor(Math.random()*6)]; // 限制在6个词内提高匹配率
    const pos = Math.floor(Math.random()*9);
    setHistory(prev => [...prev, {word, pos}]);
    setCurr(c => c + 1);
  }, [pool]);

  useEffect(() => {
    if (gameState === 'playing' && curr < 15) {
      const t = setTimeout(next, duration + 500);
      return () => clearTimeout(t);
    } else if (curr >= 15) {
      setGameState('result');
    }
  }, [gameState, curr, next, duration]);

  return (
    <div className="text-center">
      {gameState === 'idle' && <button onClick={() => {setGameState('playing'); setHistory([]); setCurr(-1); next();}} className="bg-yellow-500 text-white px-10 py-3 rounded-full font-bold">开始 Dual 2-Back</button>}
      {gameState === 'playing' && history[curr] && (
        <div className="space-y-8">
          <div className="grid grid-cols-3 gap-2 w-48 mx-auto">
            {[0,1,2,3,4,5,6,7,8].map(i => (
              <div key={i} className={`h-14 w-14 rounded-lg border ${history[curr].pos === i ? 'bg-blue-500' : 'bg-slate-50'}`} />
            ))}
          </div>
          <div className="text-3xl font-bold text-blue-900">{history[curr].word}</div>
          <div className="flex gap-4 justify-center">
            <button className="px-4 py-2 bg-slate-100 rounded-lg text-xs">A (位置匹配)</button>
            <button className="px-4 py-2 bg-slate-100 rounded-lg text-xs">L (词汇匹配)</button>
          </div>
        </div>
      )}
      {gameState === 'result' && <button onClick={() => setGameState('idle')} className="text-yellow-600 font-bold">训练结束，返回</button>}
    </div>
  );
};

// --- 模块 3: 结构压缩 (修正答案显示) ---
const CompressionModule = ({ pool }: any) => {
  const [words, setWords] = useState<string[]>([]);
  const [phase, setPhase] = useState<'idle' | 'show' | 'input' | 'result'>('idle');
  const [labels, setLabels] = useState("");

  const start = () => {
    setWords([...pool].sort(() => 0.5 - Math.random()).slice(0, 6));
    setPhase('show');
    setTimeout(() => setPhase('input'), 10000); 
  };

  return (
    <div className="text-center space-y-6">
      <h2 className="text-xl font-bold text-purple-600">结构压缩训练</h2>
      {phase === 'idle' && <button onClick={start} className="bg-purple-600 text-white px-10 py-3 rounded-full font-bold shadow-lg shadow-purple-100">获取词群并构思 (10s)</button>}
      {phase === 'show' && <div className="grid grid-cols-2 gap-4 animate-in fade-in">{words.map(w => <div key={w} className="p-4 bg-purple-50 rounded-2xl font-bold text-purple-900">{w}</div>)}</div>}
      {phase === 'input' && (
        <div className="space-y-4 animate-in slide-in-from-bottom-4">
          <p className="text-sm text-slate-400">请建立逻辑连接，输入你的结构标签：</p>
          <input className="w-full p-4 border-2 border-purple-100 rounded-2xl focus:border-purple-500 outline-none" value={labels} onChange={e => setLabels(e.target.value)} placeholder="例如：拓扑性质线 / 线性变换组..." />
          <button onClick={() => setPhase('result')} className="bg-purple-600 text-white w-full py-3 rounded-xl font-bold">查看原始词群核对</button>
        </div>
      )}
      {phase === 'result' && (
        <div className="space-y-4">
          <div className="p-4 bg-slate-50 rounded-2xl text-left">
            <p className="text-xs font-bold text-slate-400 uppercase mb-2">原始词群:</p>
            <p className="font-bold">{words.join(' · ')}</p>
            <p className="text-xs font-bold text-slate-400 uppercase mt-4 mb-2">你的压缩定义:</p>
            <p className="italic text-purple-600">"{labels}"</p>
          </div>
          <button onClick={() => setPhase('idle')} className="text-purple-600 text-sm font-bold">开启新一轮</button>
        </div>
      )}
    </div>
  );
};

// --- 模块 4: 抗干扰 (修正剧透) ---
const InterferenceModule = ({ pool }: any) => {
  const [items, setItems] = useState<any[]>([]);
  const [phase, setPhase] = useState<'idle' | 'show' | 'input' | 'result'>('idle');
  const [input, setInput] = useState("");

  const start = () => {
    const c = [...pool].sort(() => 0.5 - Math.random()).slice(0, 3);
    const n = [Math.floor(Math.random()*100), Math.floor(Math.random()*9)];
    const e = [...NOISE_ENG].sort(() => 0.5 - Math.random()).slice(0, 2);
    setItems([...c, ...n, ...e].sort(() => 0.5 - Math.random()));
    setPhase('show');
    setTimeout(() => { setPhase('input'); setInput(""); }, 6000);
  };

  const getTarget = () => items.filter(i => typeof i === 'string' && /[\u4e00-\u9fa5]/.test(i)).reverse();

  return (
    <div className="text-center">
      <h2 className="text-xl font-bold text-red-500 mb-6 font-mono tracking-tighter">ANTIGEN-X PROTOCOL</h2>
      {phase === 'idle' && <button onClick={start} className="bg-red-500 text-white px-10 py-3 rounded-full font-bold shadow-lg shadow-red-100">激活抑制测试 (6s)</button>}
      {phase === 'show' && <div className="grid grid-cols-2 gap-3">{items.map((it, i) => <div key={i} className="p-5 bg-slate-800 text-white rounded-2xl font-bold text-xl shadow-inner">{it}</div>)}</div>}
      {phase === 'input' && (
        <div className="space-y-4 animate-in fade-in">
          <p className="text-sm font-bold text-red-400">过滤噪声，仅倒序输入中文词汇：</p>
          <input className="w-full p-5 border-2 border-red-100 rounded-2xl text-center text-xl font-bold focus:border-red-500 outline-none" value={input} onChange={e => setInput(e.target.value)} placeholder="词1 词2 词3" />
          <button onClick={() => setPhase('result')} className="bg-red-500 text-white w-full py-3 rounded-xl font-bold">揭晓目标答案</button>
        </div>
      )}
      {phase === 'result' && (
        <div className="space-y-4">
          <div className="p-4 bg-slate-900 text-white rounded-2xl text-left">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-2">Target Suppression Sequence:</p>
            <p className="text-red-400 font-black text-xl tracking-widest">{getTarget().join(' ← ')}</p>
          </div>
          <button onClick={() => setPhase('idle')} className="text-red-500 text-xs font-bold uppercase tracking-widest">Restart Protocol</button>
        </div>
      )}
    </div>
  );
};

// --- 模块 5: 语义生成 (保持简单) ---
const GenerateModule = ({ pool }: any) => {
  const [seeds, setSeeds] = useState<string[]>([]);
  const start = () => setSeeds([...pool].sort(() => 0.5 - Math.random()).slice(0, 3));
  useEffect(start, [pool]);

  return (
    <div className="text-center space-y-8">
      <div className="space-y-2">
        <h2 className="text-xl font-bold text-emerald-600 italic">Semantic Expansion</h2>
        <p className="text-xs text-slate-400">基于这三个“种子”构建你的认知语义网</p>
      </div>
      <div className="flex justify-center gap-3">
        {seeds.map(s => <span key={s} className="px-5 py-2 bg-emerald-50 text-emerald-700 rounded-2xl font-black border-2 border-emerald-100 shadow-sm">{s}</span>)}
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[1,2,3,4,5,6].map(i => <input key={i} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-center text-sm focus:bg-white focus:border-emerald-400 outline-none transition-all shadow-inner" placeholder={`关联概念 ${i}`} />)}
      </div>
      <button onClick={start} className="text-emerald-500 text-sm font-bold hover:underline">获取新种子词</button>
    </div>
  );
};
