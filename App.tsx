import React, { useState, useEffect, useCallback, useRef } from 'react';

// ==========================================
// 基础词库 (内置以保证代码运行)
// ==========================================
const HARDCORE_WORDS = [
  "结构", "映射", "函数", "关系", "集合", "元素", "子集", "并集", "交集", "补集",
  "顺序", "等价", "偏序", "全序", "分类", "划分", "范畴", "对象", "态射", "同构",
  "群论", "子群", "正规", "商群", "环论", "理想", "域论", "向量", "空间", "基底",
  "线性", "变换", "矩阵", "行列", "特征", "值域", "核域", "同态", "自同", "表示",
  "拓扑", "开集", "闭集", "邻域", "连续", "紧致", "连通", "分离", "度规", "距离",
  "流形", "同调", "同伦", "基本", "覆盖", "嵌入", "浸入", "同胚", "不变","前提","变量","边界","目标",
  "系统", "涌现", "层次", "功能", "反馈", "负馈", "正馈", "控制", "稳态", "振荡",
  "信息", "熵值", "信源", "信道", "噪声", "编码", "解码", "冗余", "互信", "容量",
  "模型", "模拟", "动态", "平衡", "混沌", "吸引", "分形", "维数", "尺度","评估",
  "证明", "公理", "定理", "推论", "假设", "矛盾", "归纳", "演绎", "类比", "抽象",
  "形式", "逻辑", "命题", "谓词", "存在", "任意", "蕴含", "否定", "概率", "分布",
  "算法", "递归", "迭代", "优化", "极值", "约束", "梯度", "下降", "思考", "本质"
];
const ENGLISH_WORDS = ["Mapping", "Function", "Set", "Element", "Group", "Ring", "Field", "Space", "Linear", "Matrix", "Topology", "Logic", "System", "Entropy", "Feedback", "Stable", "Flow", "Node", "Link", "Delta"];
const NOISE_ENG = ["coffee", "leak", "pixel", "void", "stack", "flow", "node", "link", "input", "output", "data"];

type ModuleType = 'MENU' | 'SPAN' | 'NBACK' | 'COMPRESSION' | 'INTERFERENCE' | 'GENERATE';
type TestMode = 'forward' | 'backward';


const analyzeBrainErrors = (expected: string[], actual: string[], original: string[]) => {
  const reports: string[] = [];
  
  actual.forEach((word, index) => {
    if (!word || word === "") return;
    
    if (word === expected[index]) return; // 完全正确

    // 1. 位置偏移分析 (Position Encoding Error)
    if (original.includes(word)) {
      const correctIdx = expected.indexOf(word) + 1;
      reports.push(`“${word}”：Token 存储正确，但位置编码（Position Encoding）失效，应在第 ${correctIdx} 位。`);
    } 
    // 2. 幻觉/关联错误 (Hallucination / Association)
    else {
      reports.push(`“${word}”：产生“幻觉词”。大脑在精确缓存失效后，根据语义概率自动补全了无关 Token。`);
    }
  });

  // 3. 遗漏分析
  if (actual.length < expected.length) {
    reports.push(`丢失了 ${expected.length - actual.length} 个 Token。大脑为节省功耗，主动丢弃了低频信息。`);
  }

  return reports;
};


// ==========================================
// 主应用入口
// ==========================================
export default function App() {
  const [activeModule, setActiveModule] = useState<ModuleType>('MENU');
  const [mode, setMode] = useState<'chinese' | 'english' | 'mixed'>('chinese');
  const [duration, setDuration] = useState(1200); 
  const [testMode, setTestMode] = useState<TestMode>('forward');
  
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
          <button onClick={() => setActiveModule('MENU')} className="text-sm font-bold text-slate-400 hover:text-blue-600 transition-colors">返回主菜单</button>
        )}
      </nav>

      <main className="max-w-xl mx-auto mt-8 px-4">
        {activeModule === 'MENU' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            {/* 全局配置面板 */}
            <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">实验室全局配置</h2>
              <div className="space-y-6">
                <div>
                  <label className="text-sm font-bold block mb-3">语言模式：</label>
                  <div className="flex bg-slate-100 p-1 rounded-2xl">
                    {(['chinese', 'english', 'mixed'] as const).map(m => (
                      <button key={m} onClick={() => setMode(m)} className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${mode === m ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}>
                        {m === 'chinese' ? '纯中文' : m === 'english' ? 'English' : '混合'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 模式选择：新增 */}
                <div>
                  <label className="text-sm font-bold block mb-3">测试逻辑 (Span Mode)：</label>
                  <div className="flex bg-slate-100 p-1 rounded-2xl">
                    {(['forward', 'backward'] as const).map(m => (
                      <button key={m} onClick={() => setTestMode(m)} className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${testMode === m ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}>
                        {m === 'forward' ? '顺序模式 (Forward)' : '倒序模式 (Backward)'}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm font-bold mb-3">
                    <span>刺激时长：</span>
                    <span className="text-blue-600 font-mono">{duration}ms</span>
                  </div>
                  <input type="range" min="400" max="3000" step="100" value={duration} onChange={e => setDuration(Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                </div>
              </div>
            </section>

            {/* 功能卡片 */}
            <div className="grid gap-4">
              <MenuCard icon="📊" title="语言跨度 (Span)" desc={`测试大脑容量极限。当前模式：${testMode === 'forward' ? '顺序' : '倒序'}。`} onClick={() => setActiveModule('SPAN')} border="hover:border-blue-500" />
              <MenuCard icon="🔄" title="双向匹配 (N-Back)" desc="实时动态更新。强制大脑进行特征压缩训练。" onClick={() => setActiveModule('NBACK')} border="hover:border-yellow-500" />
              <MenuCard icon="💎" title="结构压缩 (Compression)" desc="训练主动建模能力。将词群压缩为逻辑结构图。" onClick={() => setActiveModule('COMPRESSION')} border="hover:border-purple-500" />
              <MenuCard icon="⚡" title="抗干扰抑制 (Interference)" desc="逐个出现。过滤数字/英文噪声，提取核心抽象词。" onClick={() => setActiveModule('INTERFERENCE')} border="hover:border-red-500" />
              <MenuCard icon="🌱" title="语义生成 (Generation)" desc="训练语义网络调度。根据种子词进行结构化扩张。" onClick={() => setActiveModule('GENERATE')} border="hover:border-emerald-500" />
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
    <p className="text-slate-400 text-xs mt-1 leading-relaxed">{desc}</p>
  </button>
);

// ==========================================
// 1. 语言跨度 (Verbal Span)
// ==========================================
const SpanModule = ({ pool, duration }: any) => {
  const [phase, setPhase] = useState<'idle' | 'play' | 'input' | 'result'>('idle');
  const [level, setLevel] = useState(5); 
  const [seq, setSeq] = useState<string[]>([]);
  const [curr, setCurr] = useState(0);
  const [input, setInput] = useState("");

  const start = () => {
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
        <div className="space-y-8">
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">设置测试跨度</h2>
            <div className="flex items-center justify-center gap-6">
              <button onClick={() => setLevel(Math.max(2, level - 1))} className="w-10 h-10 rounded-full border-2 border-slate-200 text-xl font-bold hover:bg-slate-50">-</button>
              <div className="text-4xl font-black text-blue-600 w-16">{level}</div>
              <button onClick={() => setLevel(level + 1)} className="w-10 h-10 rounded-full border-2 border-slate-200 text-xl font-bold hover:bg-slate-50">+</button>
            </div>
          </div>
          <button onClick={start} className="bg-blue-600 text-white px-12 py-3 rounded-full font-bold shadow-lg shadow-blue-100">开始挑战</button>
        </div>
      )}
      
      {phase === 'play' && (
        <div className="text-5xl font-black text-blue-600 tracking-wider">
          {seq[curr]}
        </div>
      )}

      {phase === 'input' && (
        <div className="space-y-6 animate-in fade-in">
          <h3 className="font-bold text-slate-500 uppercase text-xs tracking-widest">输入刚才的词汇</h3>
          <textarea className="w-full p-4 border-2 border-blue-50 rounded-2xl focus:border-blue-500 outline-none text-center text-lg shadow-inner" rows={3} value={input} onChange={e => setInput(e.target.value)} placeholder="空格隔开..." autoFocus />
          <button onClick={() => setPhase('result')} className="bg-blue-600 text-white w-full py-4 rounded-xl font-bold">提交校验</button>
        </div>
      )}

      {phase === 'result' && (
        <div className="space-y-4 animate-in zoom-in-95">
          <div className="p-5 bg-slate-50 rounded-2xl text-left border border-slate-100 shadow-sm">
            <p className="text-[10px] text-slate-400 font-bold mb-2 uppercase">正确序列:</p>
            <p className="text-blue-700 font-bold leading-relaxed text-lg">{seq.join(' → ')}</p>
          </div>
          <button onClick={() => setPhase('idle')} className="text-blue-600 text-sm font-bold">返回设置</button>
        </div>
      )}
    </div>
  );
};

// ==========================================
// 2. 双向匹配 (Dual N-Back)
// ==========================================
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
        <div className="space-y-8 animate-in fade-in duration-200">
          <div className="grid grid-cols-3 gap-2 w-48 mx-auto">
            {[0,1,2,3,4,5,6,7,8].map(i => (
              <div key={i} className={`h-14 w-14 rounded-xl border-2 ${history[curr].pos === i ? 'bg-blue-500 border-blue-600 shadow-lg' : 'bg-slate-50 border-slate-100'}`} />
            ))}
          </div>
          <div className="text-4xl font-black text-slate-800 tracking-widest">{history[curr].word}</div>
          <div className="flex gap-4 justify-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">
            <span>KEY A: POS</span>
            <span>KEY L: VERBAL</span>
          </div>
        </div>
      )}
      {gameState === 'result' && <button onClick={() => setGameState('idle')} className="text-yellow-600 font-bold">测试结束</button>}
    </div>
  );
};

// ==========================================
// 3. 结构压缩 (Compression)
// ==========================================
const CompressionModule = ({ pool }: any) => {
  const [words, setWords] = useState<string[]>([]);
  const [count, setCount] = useState(6);
  const [phase, setPhase] = useState<'idle' | 'show' | 'input' | 'result'>('idle');
  const [labels, setLabels] = useState("");

  const start = () => {
    setWords([...pool].sort(() => 0.5 - Math.random()).slice(0, count));
    setPhase('show');
    setTimeout(() => setPhase('input'), 10000); 
  };

  return (
    <div className="text-center space-y-6">
      <h2 className="text-xl font-bold text-purple-600 italic tracking-tighter uppercase">Structural Mapping</h2>
      {phase === 'idle' && (
        <div className="space-y-6">
          <div className="flex items-center justify-center gap-4">
            <span className="text-xs font-bold text-slate-400 uppercase">词数:</span>
            <input type="number" value={count} onChange={e => setCount(Number(e.target.value))} className="w-16 p-2 border-2 border-slate-100 rounded-xl text-center font-bold outline-none focus:border-purple-200" />
          </div>
          <button onClick={start} className="bg-purple-600 text-white px-10 py-3 rounded-full font-bold shadow-lg shadow-purple-100">构思建模 (10s)</button>
        </div>
      )}
      {phase === 'show' && <div className="grid grid-cols-2 gap-4 animate-in fade-in">{words.map(w => <div key={w} className="p-4 bg-purple-50 rounded-2xl font-bold text-purple-900 shadow-sm border border-purple-100">{w}</div>)}</div>}
      {phase === 'input' && (
        <div className="space-y-4 animate-in slide-in-from-bottom-4">
          <input className="w-full p-4 border-2 border-purple-100 rounded-2xl focus:border-purple-500 outline-none shadow-inner" value={labels} onChange={e => setLabels(e.target.value)} placeholder="输入脑内结构标签..." autoFocus />
          <button onClick={() => setPhase('result')} className="bg-purple-600 text-white w-full py-3 rounded-xl font-bold">核对原始词群</button>
        </div>
      )}
      {phase === 'result' && (
        <div className="space-y-4 animate-in zoom-in-95">
          <div className="p-5 bg-slate-50 rounded-3xl text-left border border-slate-100 shadow-sm">
            <p className="text-[10px] text-slate-400 font-bold mb-2">ORIGINAL NODES:</p>
            <p className="font-bold leading-relaxed">{words.join(' · ')}</p>
            <p className="text-[10px] text-slate-400 font-bold mt-4 mb-1">YOUR LABEL:</p>
            <p className="italic text-purple-600 font-medium">"{labels}"</p>
          </div>
          <button onClick={() => setPhase('idle')} className="text-purple-600 text-xs font-bold uppercase underline">Restart</button>
        </div>
      )}
    </div>
  );
};

// ==========================================
// 4. 抗干扰抑制 (Interference)
// ==========================================
const InterferenceModule = ({ pool, duration }: any) => {
  const [phase, setPhase] = useState<'idle' | 'play' | 'input' | 'result'>('idle');
  const [abstractCount, setAbstractCount] = useState(3); 
  const [items, setItems] = useState<any[]>([]);
  const [curr, setCurr] = useState(0);
  const [input, setInput] = useState("");

  const start = () => {
    const c = [...pool].sort(() => 0.5 - Math.random()).slice(0, abstractCount);
    const n = [Math.floor(Math.random()*900 + 100), Math.floor(Math.random()*9)];
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
      <h2 className="text-xl font-bold text-red-500 mb-6 font-mono tracking-tighter uppercase">Inhibition Protocol</h2>
      
      {phase === 'idle' && (
        <div className="space-y-8 animate-in fade-in">
          <div className="space-y-4">
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">设置目标词数</p>
            <div className="flex items-center justify-center gap-6">
              <button onClick={() => setAbstractCount(Math.max(1, abstractCount - 1))} className="w-8 h-8 rounded-full border-2 border-slate-200 text-slate-300 font-bold">-</button>
              <div className="text-4xl font-black text-red-500 w-12">{abstractCount}</div>
              <button onClick={() => setAbstractCount(abstractCount + 1)} className="w-8 h-8 rounded-full border-2 border-slate-200 text-slate-300 font-bold">+</button>
            </div>
          </div>
          <button onClick={start} className="bg-red-500 text-white px-10 py-3 rounded-full font-bold shadow-lg shadow-red-100">激活抑制测试</button>
        </div>
      )}

      {phase === 'play' && (
        <div className="h-32 flex items-center justify-center">
          <div className={`text-5xl font-black ${typeof items[curr] === 'number' ? 'text-slate-200' : /^[a-zA-Z]/.test(items[curr]) ? 'text-slate-300' : 'text-red-600'}`}>
            {items[curr]}
          </div>
        </div>
      )}

      {phase === 'input' && (
        <div className="space-y-6 animate-in fade-in">
          <p className="text-xs font-bold text-red-400 uppercase tracking-widest">滤除噪声，倒序复述中文：</p>
          <input className="w-full p-5 border-2 border-red-50 rounded-2xl text-center text-xl font-bold focus:border-red-500 outline-none shadow-inner" value={input} onChange={e => setInput(e.target.value)} placeholder="??? ← ???" autoFocus />
          <button onClick={() => setPhase('result')} className="bg-red-500 text-white w-full py-4 rounded-2xl font-bold">揭晓答案</button>
        </div>
      )}

      {phase === 'result' && (
        <div className="space-y-6 animate-in zoom-in-95">
          <div className="p-6 bg-slate-900 text-white rounded-[2rem] text-left border border-slate-800 shadow-2xl">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-3 italic">Correct Target (Reversed):</p>
            <p className="text-red-400 font-bold text-2xl tracking-[0.2em]">{getTarget().join(' ← ')}</p>
            <div className="h-[1px] bg-slate-800 my-5"></div>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-2 italic">Your Input:</p>
            <p className="text-slate-400 italic text-lg">{input || "(NULL)"}</p>
          </div>
          <button onClick={() => setPhase('idle')} className="text-red-500 text-xs font-bold uppercase underline">Retry Protocol</button>
        </div>
      )}
    </div>
  );
};

// ==========================================
// 5. 语义生成 (Generation)
// ==========================================
const GenerateModule = ({ pool }: any) => {
  const [seeds, setSeeds] = useState<string[]>([]);
  const start = () => setSeeds([...pool].sort(() => 0.5 - Math.random()).slice(0, 3));
  useEffect(start, [pool]);

  return (
    <div className="text-center space-y-8 animate-in fade-in">
      <div className="space-y-2">
        <h2 className="text-xl font-bold text-emerald-600 italic tracking-tight">Semantic Expansion</h2>
        <p className="text-xs text-slate-400">基于核心词，向外扩张 6 个相关词。</p>
      </div>
      <div className="flex justify-center gap-3">
        {seeds.map(s => <span key={s} className="px-5 py-2 bg-emerald-50 text-emerald-700 rounded-2xl font-black border-2 border-emerald-100 shadow-sm">{s}</span>)}
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[1,2,3,4,5,6].map(i => <input key={i} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-center text-sm focus:bg-white focus:border-emerald-400 outline-none transition-all" placeholder={`关联概念 ${i}`} />)}
      </div>
      <button onClick={start} className="text-emerald-500 text-sm font-bold hover:underline underline-offset-4">获取新种子词对</button>
    </div>
  );
};
