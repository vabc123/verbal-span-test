import React, { useState, useEffect, useCallback, useRef } from 'react';

// --- 1. 硬核词库 (直接内置，防止 import 出错) ---
const HARDCORE_WORDS = ["结构", "映射", "函数", "关系", "集合", "元素", "子集", "并集", "交集", "补集", "顺序", "等价", "分类", "范畴", "态射", "同构", "群论", "环论", "理想", "域论", "向量", "空间", "线性", "变换", "矩阵", "特征", "同态", "拓扑", "邻域", "连续", "紧致", "流形", "同调", "同伦", "系统", "涌现", "反馈", "稳态", "信息", "熵值", "噪声", "编码", "解码", "逻辑", "算法", "递归", "优化", "梯度"];
const ENGLISH_WORDS = ["Mapping", "Function", "Set", "Element", "Group", "Ring", "Field", "Space", "Linear", "Matrix", "Topology", "Logic", "System", "Entropy", "Feedback", "Stable"];
const NOISE_ENG = ["coffee", "leak", "pixel", "void", "stack", "flow", "node", "link"];

type ModuleType = 'MENU' | 'SPAN' | 'NBACK' | 'COMPRESSION' | 'INTERFERENCE' | 'GENERATE';

export default function App() {
  const [activeModule, setActiveModule] = useState<ModuleType>('MENU');
  const [mode, setMode] = useState<'chinese' | 'english' | 'mixed'>('chinese');
  const [duration, setDuration] = useState(1500);

  // 获取当前模式词池
  const getPool = () => {
    if (mode === 'chinese') return HARDCORE_WORDS;
    if (mode === 'english') return ENGLISH_WORDS;
    return [...HARDCORE_WORDS, ...ENGLISH_WORDS];
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-20">
      {/* 顶部导航 */}
      <nav className="bg-white px-6 py-4 shadow-sm flex justify-between items-center sticky top-0 z-50">
        <h1 className="text-xl font-black text-blue-600 cursor-pointer" onClick={() => setActiveModule('MENU')}>COGNI-LAB 2.0</h1>
        {activeModule !== 'MENU' && (
          <button onClick={() => setActiveModule('MENU')} className="text-sm font-bold text-slate-400">返回主菜单</button>
        )}
      </nav>

      <main className="max-w-xl mx-auto mt-8 px-4">
        {activeModule === 'MENU' && (
          <div className="space-y-8">
            {/* 1. 全局配置 */}
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

            {/* 2. 模式菜单 */}
            <div className="grid gap-4">
              <MenuCard icon="📊" title="语言跨度 (Verbal Span)" desc="测量“内存容量”极限。顺序记住并复述。" onClick={() => setActiveModule('SPAN')} border="hover:border-blue-500" />
              <MenuCard icon="🔄" title="双向匹配 (Dual N-Back)" desc="实时动态更新。强制大脑进行特征压缩训练。" onClick={() => setActiveModule('NBACK')} border="hover:border-yellow-500" />
              <MenuCard icon="💎" title="结构压缩 (Compression)" desc="训练主动建模能力。将词群压缩为逻辑结构图。" onClick={() => setActiveModule('COMPRESSION')} border="hover:border-purple-500" />
              <MenuCard icon="⚡" title="抗干扰抑制 (Interference)" desc="高难度！过滤噪声提取抽象词并倒序。" onClick={() => setActiveModule('INTERFERENCE')} border="hover:border-red-500" />
              <MenuCard icon="🌱" title="语义反向生成 (Generation)" desc="训练语义调度。根据种子词进行结构化扩张。" onClick={() => setActiveModule('GENERATE')} border="hover:border-emerald-500" />
            </div>
          </div>
        )}

        {/* 3. 模块挂载区 */}
        <div className={activeModule === 'MENU' ? 'hidden' : 'bg-white rounded-[2.5rem] shadow-xl p-8 border border-slate-100 min-h-[450px] flex flex-col justify-center'}>
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

// --- 子组件卡片 ---
const MenuCard = ({ icon, title, desc, onClick, border }: any) => (
  <button onClick={onClick} className={`bg-white p-6 rounded-3xl border-2 border-transparent ${border} transition-all text-left shadow-sm group`}>
    <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">{icon}</div>
    <h3 className="font-bold text-lg text-slate-800">{title}</h3>
    <p className="text-slate-400 text-xs mt-1">{desc}</p>
  </button>
);

// --- 模块 1: Span ---
const SpanModule = ({ pool, duration }: any) => {
  const [phase, setPhase] = useState<'idle' | 'play' | 'result'>('idle');
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
        else setPhase('result');
      }, duration);
      return () => clearTimeout(t);
    }
  }, [phase, curr, seq, duration]);

  return (
    <div className="text-center">
      {phase === 'idle' && <button onClick={start} className="bg-blue-600 text-white px-10 py-3 rounded-full font-bold">开始测试</button>}
      {phase === 'play' && <div className="text-5xl font-black text-blue-600 animate-pulse">{seq[curr]}</div>}
      {phase === 'result' && (
        <div className="space-y-4">
          <p className="text-sm text-slate-400">正确序列: {seq.join(' ')}</p>
          <textarea className="w-full p-4 border rounded-xl" value={input} onChange={e => setInput(e.target.value)} placeholder="按顺序输入..." />
          <button onClick={() => setPhase('idle')} className="text-blue-600 underline">重试</button>
        </div>
      )}
    </div>
  );
};

// --- 模块 2: N-Back (简易版) ---
const NBackModule = ({ pool, duration }: any) => {
  return <div className="text-center text-slate-400 italic">Dual N-Back 逻辑正在运行... (请参考之前提供的 NBack 组件代码集成)</div>;
};

// --- 模块 3: 结构压缩 ---
const CompressionModule = ({ pool }: any) => {
  const [words, setWords] = useState<string[]>([]);
  const [phase, setPhase] = useState<'idle' | 'show' | 'input'>('idle');
  const [labels, setLabels] = useState("");

  const start = () => {
    setWords([...pool].sort(() => 0.5 - Math.random()).slice(0, 6));
    setPhase('show');
    setTimeout(() => setPhase('input'), 10000); // 10秒构思
  };

  return (
    <div className="text-center space-y-6">
      <h2 className="text-xl font-bold text-purple-600">结构压缩训练</h2>
      {phase === 'idle' && <button onClick={start} className="bg-purple-600 text-white px-8 py-2 rounded-full">获取词群并构思</button>}
      {phase === 'show' && <div className="grid grid-cols-2 gap-4">{words.map(w => <div key={w} className="p-4 bg-purple-50 rounded-xl font-bold">{w}</div>)}</div>}
      {phase === 'input' && (
        <div className="space-y-4">
          <div className="p-4 bg-slate-50 rounded-xl text-xs">答案: {words.join(' ')}</div>
          <input className="w-full p-4 border rounded-xl focus:border-purple-500 outline-none" placeholder="输入你脑内的“结构标签”..." value={labels} onChange={e => setLabels(e.target.value)} />
          <button onClick={() => setPhase('idle')} className="text-purple-600">完成一轮</button>
        </div>
      )}
    </div>
  );
};

// --- 模块 4: 抗干扰 ---
const InterferenceModule = ({ pool }: any) => {
  const [items, setItems] = useState<any[]>([]);
  const [phase, setPhase] = useState<'idle' | 'show' | 'input'>('idle');

  const start = () => {
    const c = [...pool].sort(() => 0.5 - Math.random()).slice(0, 3);
    const n = [Math.floor(Math.random()*100), Math.floor(Math.random()*9)];
    const e = [...NOISE_ENG].sort(() => 0.5 - Math.random()).slice(0, 2);
    setItems([...c, ...n, ...e].sort(() => 0.5 - Math.random()));
    setPhase('show');
    setTimeout(() => setPhase('input'), 5000);
  };

  return (
    <div className="text-center">
      <h2 className="text-xl font-bold text-red-500 mb-6">抗干扰抑制测试</h2>
      {phase === 'idle' && <button onClick={start} className="bg-red-500 text-white px-10 py-3 rounded-full font-bold">开始抑制协议</button>}
      {phase === 'show' && <div className="grid grid-cols-2 gap-2">{items.map((it, i) => <div key={i} className="p-4 bg-slate-100 rounded-lg font-bold">{it}</div>)}</div>}
      {phase === 'input' && (
        <div className="space-y-4">
          <p className="text-xs text-slate-400">仅保留中文抽象词并倒序输入</p>
          <input className="w-full p-4 border-2 border-red-200 rounded-xl text-center text-xl" placeholder="??? ← ???" />
          <div className="text-xs text-red-400">目标答案: {items.filter(i => typeof i === 'string' && /[\u4e00-\u9fa5]/.test(i)).reverse().join(' ← ')}</div>
          <button onClick={() => setPhase('idle')} className="text-red-500 underline">再试一次</button>
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
    <div className="text-center space-y-6">
      <h2 className="text-xl font-bold text-emerald-600">语义反向生成</h2>
      <div className="flex justify-center gap-2">
        {seeds.map(s => <span key={s} className="px-4 py-1 bg-emerald-50 text-emerald-700 rounded-full font-bold border border-emerald-100">{s}</span>)}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {[1,2,3,4,5,6].map(i => <input key={i} className="p-3 border rounded-xl text-center text-sm" placeholder={`关联词 ${i}...`} />)}
      </div>
      <button onClick={start} className="text-emerald-600 text-sm">换一批种子词</button>
    </div>
  );
};
