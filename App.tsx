import React, { useState, useEffect, useCallback, useRef } from 'react';
import { HARDCORE_WORDS, NOISE_ENGLISH } from './constants';

// --- 类型定义 ---
type ModuleType = 'MENU' | 'COMPRESSION' | 'INTERFERENCE' | 'GENERATE' | 'NBACK';

export default function App() {
  const [activeModule, setActiveModule] = useState<ModuleType>('MENU');
  const [difficulty, setDifficulty] = useState({ count: 6, time: 10 });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans pb-20 selection:bg-blue-500/30">
      {/* 顶部导航 */}
      <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md px-6 py-4 sticky top-0 z-50 flex justify-between items-center">
        <h1 className="text-xl font-black tracking-tighter bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent cursor-pointer" onClick={() => setActiveModule('MENU')}>
          STRUCTURAL-WM LAB
        </h1>
        {activeModule !== 'MENU' && (
          <button onClick={() => setActiveModule('MENU')} className="text-xs font-bold text-slate-500 hover:text-blue-400 transition-colors uppercase tracking-widest">
            TERMINATE SESSION [ESC]
          </button>
        )}
      </nav>

      <main className="max-w-2xl mx-auto mt-8 px-4">
        {activeModule === 'MENU' && <MenuPanel onSelect={setActiveModule} />}
        
        {/* 模块一 & 二：结构压缩训练 (含限时模式) */}
        {activeModule === 'COMPRESSION' && (
          <CompressionModule difficulty={difficulty} />
        )}

        {/* 模块三：抗干扰混合训练 */}
        {activeModule === 'INTERFERENCE' && (
          <InterferenceModule />
        )}

        {/* 模块四：反向生成训练 */}
        {activeModule === 'GENERATE' && (
          <GenerateModule />
        )}
      </main>

      <footer className="fixed bottom-4 w-full text-center text-slate-600 text-[10px] tracking-[0.2em] uppercase pointer-events-none">
        Cognitive Architecture: Structural Encoding v3.0
      </footer>
    </div>
  );
}

// ==========================================
// 1. 菜单面板
// ==========================================
const MenuPanel = ({ onSelect }: { onSelect: (m: ModuleType) => void }) => (
  <div className="grid gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div className="text-slate-500 text-xs font-bold mb-2 tracking-widest uppercase">Select Neural Protocol</div>
    
    <MenuButton 
      title="结构压缩训练" 
      desc="训练主动建模能力。将散乱抽象词压缩为逻辑结构图。"
      icon="🧠" color="border-blue-500/50"
      onClick={() => onSelect('COMPRESSION')}
    />

    <MenuButton 
      title="抗干扰混合测试" 
      desc="高难度抑制训练。过滤数字与英文噪声，提取核心抽象词并倒序。"
      icon="⚡" color="border-red-500/50"
      onClick={() => onSelect('INTERFERENCE')}
    />

    <MenuButton 
      title="语义反向生成" 
      desc="训练语义网络调度。根据核心种子词进行结构化扩张。"
      icon="🌱" color="border-emerald-500/50"
      onClick={() => onSelect('GENERATE')}
    />
  </div>
);

const MenuButton = ({ title, desc, icon, color, onClick }: any) => (
  <button onClick={onClick} className={`bg-slate-900 p-6 rounded-2xl border ${color} hover:bg-slate-800 transition-all text-left group relative overflow-hidden`}>
    <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">{icon}</div>
    <h3 className="font-bold text-lg text-slate-100">{title}</h3>
    <p className="text-slate-500 text-xs mt-2 leading-relaxed">{desc}</p>
  </button>
);

// ==========================================
// 2. 模块一 & 二：结构压缩逻辑
// ==========================================
const CompressionModule = ({ difficulty }: any) => {
  const [phase, setPhase] = useState<'setup' | 'stimulus' | 'recall' | 'result'>('setup');
  const [words, setWords] = useState<string[]>([]);
  const [timer, setTimer] = useState(10);
  const [userNodes, setUserNodes] = useState("");
  const [userLabels, setUserLabels] = useState(""); // 隐藏标签（结构化证明）

  const start = (t: number) => {
    const selected = [...HARDCORE_WORDS].sort(() => 0.5 - Math.random()).slice(0, 6);
    setWords(selected);
    setTimer(t);
    setPhase('stimulus');
  };

  useEffect(() => {
    if (phase === 'stimulus' && timer > 0) {
      const t = setTimeout(() => setTimer(timer - 1), 1000);
      return () => clearTimeout(t);
    } else if (phase === 'stimulus' && timer === 0) {
      setPhase('recall');
    }
  }, [phase, timer]);

  return (
    <div className="bg-slate-900 p-8 rounded-[2rem] border border-slate-800 shadow-2xl">
      {phase === 'setup' && (
        <div className="text-center space-y-6">
          <h2 className="text-2xl font-black">结构压缩</h2>
          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => start(15)} className="p-4 bg-slate-800 rounded-xl hover:border-blue-500 border border-transparent">
              <span className="block text-lg font-bold">深度建模</span>
              <span className="text-xs text-slate-500">15秒 / 寻找隐藏逻辑</span>
            </button>
            <button onClick={() => start(4)} className="p-4 bg-slate-800 rounded-xl hover:border-red-500 border border-transparent">
              <span className="block text-lg font-bold">极速压缩</span>
              <span className="text-xs text-slate-500">4秒 / 强迫直觉建模</span>
            </button>
          </div>
        </div>
      )}

      {phase === 'stimulus' && (
        <div className="space-y-8 text-center">
          <div className="text-xs font-mono text-blue-400 tracking-[0.3em]">REMAINING: {timer}S</div>
          <div className="grid grid-cols-2 gap-4">
            {words.map(w => <div key={w} className="text-2xl font-bold p-4 bg-slate-800 rounded-lg">{w}</div>)}
          </div>
          <p className="text-xs text-slate-500 italic">脑内构建结构图，为组群分配标签...</p>
        </div>
      )}

      {phase === 'recall' && (
        <div className="space-y-6">
          <div>
            <label className="text-xs font-bold text-slate-500 mb-2 block">1. 还原全部词汇 (空格分隔)</label>
            <textarea value={userNodes} onChange={e => setUserNodes(e.target.value)} className="w-full bg-slate-800 p-4 rounded-xl border-2 border-slate-700 focus:border-blue-500 outline-none" rows={3} />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 mb-2 block">2. 结构化标签 (例如：代数线/拓扑线)</label>
            <input value={userLabels} onChange={e => setUserLabels(e.target.value)} className="w-full bg-slate-800 p-4 rounded-xl border-2 border-slate-700 focus:border-emerald-500 outline-none" placeholder="输入你脑内的压缩索引..." />
          </div>
          <button onClick={() => setPhase('result')} className="w-full py-4 bg-blue-600 rounded-xl font-bold">校验压缩完整度</button>
        </div>
      )}

      {phase === 'result' && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold">压缩分析记录</h3>
          <div className="p-4 bg-slate-800 rounded-xl text-sm">
            <div className="text-slate-500 mb-1">原始数据:</div>
            <div className="text-slate-200">{words.join(' · ')}</div>
          </div>
          <div className="p-4 bg-blue-900/20 rounded-xl text-sm">
            <div className="text-blue-400 mb-1">你的压缩标签:</div>
            <div className="italic text-blue-200">"{userLabels || '未定义结构'}"</div>
          </div>
          <button onClick={() => setPhase('setup')} className="w-full py-3 text-slate-500 text-sm">开启新序列</button>
        </div>
      )}
    </div>
  );
};

// ==========================================
// 3. 模块三：抗干扰混合逻辑
// ==========================================
const InterferenceModule = () => {
  const [phase, setPhase] = useState<'idle' | 'play' | 'result'>('idle');
  const [seq, setSeq] = useState<any[]>([]);
  const [userInput, setUserInput] = useState("");

  const start = () => {
    const chinese = [...HARDCORE_WORDS].sort(() => 0.5 - Math.random()).slice(0, 3);
    const numbers = [Math.floor(Math.random()*900 + 100), Math.floor(Math.random()*10)];
    const english = [...NOISE_ENGLISH].sort(() => 0.5 - Math.random()).slice(0, 2);
    const mixed = [...chinese, ...numbers, ...english].sort(() => 0.5 - Math.random());
    setSeq(mixed);
    setPhase('play');
    setTimeout(() => setPhase('result'), 6000); // 6秒显示时间
  };

  const getTarget = () => seq.filter(i => typeof i === 'string' && /[\u4e00-\u9fa5]/.test(i)).reverse();

  return (
    <div className="bg-slate-900 p-8 rounded-[2rem] border border-red-500/20 shadow-2xl">
      {phase === 'idle' && (
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-black text-red-400">抗干扰混合训练</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            规则：丢弃数字与英文噪声，只提取<strong>抽象词</strong>并<strong>倒序</strong>复述。
          </p>
          <button onClick={start} className="px-10 py-3 bg-red-600 rounded-full font-bold">激活抑制协议</button>
        </div>
      )}

      {phase === 'play' && (
        <div className="grid grid-cols-2 gap-4 animate-pulse">
          {seq.map((item, i) => (
            <div key={i} className="bg-slate-800 p-6 rounded-xl text-center text-xl font-bold border border-slate-700">
              {item}
            </div>
          ))}
        </div>
      )}

      {phase === 'result' && (
        <div className="space-y-6">
          <div className="text-center text-xs text-slate-500 uppercase tracking-widest">请进行倒序复述</div>
          <input 
            autoFocus value={userInput} onChange={e => setUserInput(e.target.value)}
            className="w-full bg-slate-800 p-6 rounded-2xl text-2xl text-center border-2 border-red-500/30 outline-none focus:border-red-500"
            placeholder="??? ??? ???"
          />
          <div className="p-4 bg-slate-950 rounded-xl">
            <div className="text-[10px] text-slate-600 mb-2 tracking-tighter">CORRECT SUPPRESSION TARGET:</div>
            <div className="text-emerald-400 font-bold tracking-widest">{getTarget().join(' ← ')}</div>
          </div>
          <button onClick={() => {setPhase('idle'); setUserInput("")}} className="w-full py-2 text-slate-600 text-xs">RETRY SESSION</button>
        </div>
      )}
    </div>
  );
};

// ==========================================
// 4. 模块四：反向生成逻辑
// ==========================================
const GenerateModule = () => {
  const [seeds, setSeeds] = useState<string[]>([]);
  const [extensions, setExtensions] = useState(["", "", "", "", "", ""]);

  const refresh = () => {
    setSeeds([...HARDCORE_WORDS].sort(() => 0.5 - Math.random()).slice(0, 3));
    setExtensions(["", "", "", "", "", ""]);
  };

  useEffect(refresh, []);

  return (
    <div className="bg-slate-900 p-8 rounded-[2rem] border border-emerald-500/20 shadow-2xl">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-black text-emerald-400">反向语义生成</h2>
        <p className="text-xs text-slate-500 mt-2">基于核心词，向外扩张 6 个符合结构逻辑的相关词。</p>
      </div>

      <div className="flex justify-center gap-3 mb-10">
        {seeds.map(s => <div key={s} className="px-6 py-2 bg-emerald-900/30 border border-emerald-500/50 rounded-full text-emerald-200 font-bold">{s}</div>)}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {extensions.map((val, i) => (
          <input 
            key={i} value={val} onChange={e => {
              const next = [...extensions];
              next[i] = e.target.value;
              setExtensions(next);
            }}
            placeholder={`扩展词 ${i+1}...`}
            className="bg-slate-800 p-4 rounded-xl border border-slate-700 focus:border-emerald-500 outline-none text-center"
          />
        ))}
      </div>

      <button onClick={refresh} className="w-full mt-8 py-4 bg-emerald-600 rounded-xl font-bold text-white shadow-lg shadow-emerald-900/20">
        生成新种子词对
      </button>
    </div>
  );
};
