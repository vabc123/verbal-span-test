
import React, { useState, useEffect, useRef } from 'react';
import { TestConfig, AppState, Direction } from '../types';

interface TestScreenProps {
  config: TestConfig;
  sequence: string[];
  onFinish: (userInput: string[]) => void;
  onCancel: () => void;
  level: number;
}

const TestScreen: React.FC<TestScreenProps> = ({ config, sequence, onFinish, onCancel, level }) => {
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [phase, setPhase] = useState<'PREVIEW' | 'DISPLAY' | 'INPUT'>('PREVIEW');
  const [inputs, setInputs] = useState<string[]>(new Array(sequence.length).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer for word display
  useEffect(() => {
    if (phase === 'PREVIEW') {
      const timer = setTimeout(() => {
        setPhase('DISPLAY');
        setCurrentIndex(0);
      }, 1500);
      return () => clearTimeout(timer);
    }

    if (phase === 'DISPLAY') {
      if (currentIndex < sequence.length) {
        const timer = setTimeout(() => {
          setCurrentIndex(prev => prev + 1);
        }, config.duration * 1000);
        return () => clearTimeout(timer);
      } else {
        setPhase('INPUT');
      }
    }
  }, [phase, currentIndex, sequence.length, config.duration]);

  const handleInputChange = (idx: number, val: string) => {
    const newInputs = [...inputs];
    newInputs[idx] = val;
    setInputs(newInputs);
  };

  const handleKeyDown = (e: React.KeyboardEvent, idx: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (idx < inputs.length - 1) {
        inputRefs.current[idx + 1]?.focus();
      } else {
        onFinish(inputs);
      }
    }
  };

  if (phase === 'PREVIEW') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
        <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mb-6 animate-bounce">
          <span className="text-3xl font-bold text-indigo-600">!</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">准备开始</h2>
        <p className="text-gray-500 mb-2">即将逐个显示 {sequence.length} 个词语</p>
        <p className="text-sm font-medium text-indigo-500">
          测试模式: {config.direction === Direction.FORWARD ? '正序' : '倒序'}
        </p>
      </div>
    );
  }

  if (phase === 'DISPLAY') {
    const isFinished = currentIndex >= sequence.length;
    const currentWord = !isFinished ? sequence[currentIndex] : '';
    const progress = ((currentIndex + 1) / sequence.length) * 100;

    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
        <div className="w-full max-w-md mb-12">
           <div className="flex justify-between text-xs text-gray-400 mb-2">
              <span>进度: {currentIndex + 1} / {sequence.length}</span>
              <span>速度: {config.duration}s/词</span>
           </div>
           <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-indigo-500 transition-all duration-300" 
                style={{ width: `${progress}%` }}
              />
           </div>
        </div>
        
        <div className="h-40 flex items-center justify-center">
            <div key={currentIndex} className="text-5xl md:text-7xl font-bold text-gray-900 animate-[fadeIn_0.2s_ease-out]">
                {currentWord}
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto p-6 animate-[fadeIn_0.3s_ease-out]">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">开始回忆</h2>
        <p className="text-gray-500">
          请按照 {config.direction === Direction.FORWARD ? '【正序】' : '【倒序】'} 输入词语
        </p>
      </div>

      <div className="space-y-3 mb-8">
        {inputs.map((input, idx) => (
          <div key={idx} className="flex items-center space-x-4">
            <span className="w-10 text-right text-gray-400 font-mono">#{idx + 1}</span>
            <input
              ref={el => inputRefs.current[idx] = el}
              autoFocus={idx === 0}
              type="text"
              value={input}
              onChange={(e) => handleInputChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              className="flex-1 p-3 border-2 border-gray-100 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors"
              placeholder="..."
            />
          </div>
        ))}
      </div>

      <div className="flex space-x-3">
        <button
          onClick={onCancel}
          className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold"
        >
          取消
        </button>
        <button
          onClick={() => onFinish(inputs)}
          className="flex-[2] py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-100"
        >
          提交结果
        </button>
      </div>
      
      <p className="text-center mt-6 text-xs text-gray-400">
        技巧：可以使用空格或回车快速跳到下一个输入框
      </p>
    </div>
  );
};

export default TestScreen;
