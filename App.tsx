import React, { useState } from 'react';
import { DualNBack } from './components/DualNBack';
import { CHINESE_WORDS } from './constants';

// --- 简单的语言跨度测试组件 (你之前的逻辑整合) ---
const VerbalSpanTest: React.FC = () => {
  const [sequence, setSequence] = useState<string[]>([]);
  const [userInput, setUserInput] = useState("");
  const [phase, setPhase] = useState<'start' | 'memorize' | 'input' | 'result'>('start');
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [level, setLevel] = useState(3);

  const startTest = () => {
    const newSeq = Array.from({ length: level }, () => 
      CHINESE_WORDS[Math.floor(Math.random() * CHINESE_WORDS.length)]
    );
    setSequence(newSeq);
    setPhase('memorize');
    setCurrentWordIndex(0);
    
    // 每 1.5 秒显示下一个词
    const interval = setInterval(() => {
      setCurrentWordIndex(prev => {
        if (prev >= newSeq.length - 1) {
          clearInterval(interval);
          setTimeout(() => setPhase('input'), 1000);
          return prev;
        }
        return prev + 1;
      });
    }, 1500);
  };

  const checkResult = () => {
    setPhase('result');
  };

  return (
    <div className="flex flex-col items-center p-6 text-center">
      {phase === 'start' && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">顺序记忆跨度测试</h2>
          <p className="text-gray-500">记住依次出现的词汇，最后按顺序输入。</p>
          <div className="flex items-center justify-center gap-4">
            <span>难度 (词汇量):</span>
            <input type="number" value={level} onChange={e => setLevel(Number(e.target.value))} className="w-16 p-2 border rounded" />
          </div>
          <button onClick={startTest} className="bg-green-600 text-white px-8 py-2 rounded-full">开始</button>
        </div>
      )}

      {phase === 'memorize' && (
        <div className="text-4xl font-bold text-blue-600 animate-bounce">
          {sequence[currentWordIndex]}
        </div>
      )}

      {phase === 'input' && (
        <div className="space-y-4 w-full max-w-sm">
          <p className="font-bold">请输入你记得的词（空格分隔）:</p>
          <textarea 
            className="w-full p-3 border-2 border-blue-300 rounded-lg"
            rows={3}
            value={userInput}
            onChange={e => setUserInput(e.target.value)}
            placeholder="苹果 太阳..."
          />
          <button onClick={checkResult} className="bg-blue-600 text-white px-8 py-2 rounded-lg w-full">提交答案</button>
        </div>
      )}

      {phase === 'result' && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">测试结果</h2>
          <div className="text-left bg-gray-100 p-4 rounded">
            <p className="text-gray-600">正确答案: {sequence.join(' ')}</p>
            <p className="text-blue-600">你的回答: {userInput}</p>
          </div>
          <button onClick={() => setPhase('start')} className="text-blue-600 underline">重新开始</button>
        </div>
      )}
    </div>
  );
};

// --- 主应用入口 ---
export default function App() {
  const [activeTab, setActiveTab] = useState<'menu' | 'nback' | 'span'>('menu');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <nav className="bg-white shadow-sm p-4 flex justify-between items-center">
        <h1 className="font-bold text-gray-700" onClick={() => setActiveTab('menu')} style={{cursor: 'pointer'}}>
          认知能力训练器
        </h1>
        {activeTab !== 'menu' && (
          <button 
            onClick={() => setActiveTab('menu')}
            className="text-sm text-blue-600 font-medium"
          >
            返回主页
          </button>
        )}
      </nav>

      <main className="container mx-auto max-w-2xl py-8">
        {activeTab === 'menu' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
            <div 
              onClick={() => setActiveTab('span')}
              className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition cursor-pointer border-b-4 border-green-500"
            >
              <div className="text-3xl mb-4">🧠</div>
              <h3 className="text-xl font-bold mb-2">语言跨度测试</h3>
              <p className="text-gray-500 text-sm">测试你的工作记忆容量。顺序记住词汇并复述。</p>
            </div>

            <div 
              onClick={() => setActiveTab('nback')}
              className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition cursor-pointer border-b-4 border-blue-500"
            >
              <div className="text-3xl mb-4">⚡</div>
              <h3 className="text-xl font-bold mb-2">Dual N-Back 训练</h3>
              <p className="text-gray-500 text-sm">公认最有效的脑力训练。同时处理位置与语义的动态匹配。</p>
            </div>
          </div>
        )}

        {activeTab === 'span' && (
          <div className="bg-white rounded-3xl shadow-lg p-4">
            <VerbalSpanTest />
          </div>
        )}

        {activeTab === 'nback' && (
          <div className="bg-white rounded-3xl shadow-lg p-2">
            <DualNBack />
          </div>
        )}
      </main>

      <footer className="text-center py-8 text-gray-400 text-xs">
        基于模式匹配与特征压缩原理设计
      </footer>
    </div>
  );
}
