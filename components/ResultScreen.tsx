
import React from 'react';
import { TestConfig, TestSession, Direction } from '../types';

interface ResultScreenProps {
  session: TestSession;
  config: TestConfig;
  onContinue: () => void;
  onRestart: () => void;
}

const ResultScreen: React.FC<ResultScreenProps> = ({ session, config, onContinue, onRestart }) => {
  const target = config.direction === Direction.BACKWARD 
    ? [...session.sequence].reverse() 
    : session.sequence;

  return (
    <div className="max-w-lg mx-auto p-8 bg-white rounded-3xl shadow-xl mt-8 animate-[slideUp_0.4s_ease-out]">
      <div className="text-center mb-8">
        <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 ${
          session.isCorrect ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
        }`}>
          {session.isCorrect ? (
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
          ) : (
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
          )}
        </div>
        <h2 className={`text-3xl font-black mb-2 ${session.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
          {session.isCorrect ? '太棒了！' : '可惜了...'}
        </h2>
        <p className="text-gray-500">
          {session.isCorrect ? `恭喜通过级别 ${session.currentLevel}` : `挑战级别 ${session.currentLevel} 失败`}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="p-4 bg-gray-50 rounded-2xl text-center">
            <span className="block text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">当前级别</span>
            <span className="text-2xl font-black text-gray-800">{session.currentLevel}</span>
        </div>
        <div className="p-4 bg-gray-50 rounded-2xl text-center">
            <span className="block text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">最高纪录</span>
            <span className="text-2xl font-black text-indigo-600">{session.maxLevel}</span>
        </div>
      </div>

      {!session.isCorrect && (
        <div className="space-y-4 mb-8 text-sm">
          <div className="p-4 border-l-4 border-green-500 bg-green-50 rounded-r-xl">
            <p className="font-bold text-green-800 mb-1">正确序列：</p>
            <p className="text-green-700">{target.join(' · ')}</p>
          </div>
          <div className="p-4 border-l-4 border-red-500 bg-red-50 rounded-r-xl">
            <p className="font-bold text-red-800 mb-1">您的输入：</p>
            <p className="text-red-700">{session.userInput.join(' · ') || '(空白)'}</p>
          </div>
        </div>
      )}

      <div className="space-y-3">
        <button
          onClick={onContinue}
          className={`w-full py-4 rounded-2xl font-bold text-white shadow-lg transition-all active:scale-95 ${
            session.isCorrect ? 'bg-green-600 shadow-green-100 hover:bg-green-700' : 'bg-indigo-600 shadow-indigo-100 hover:bg-indigo-700'
          }`}
        >
          {session.isCorrect ? '进入下一关' : '再试一关'}
        </button>
        <button
          onClick={onRestart}
          className="w-full py-4 bg-white border-2 border-gray-100 text-gray-500 rounded-2xl font-bold hover:bg-gray-50 transition-all"
        >
          重新设置测试
        </button>
      </div>
    </div>
  );
};

export default ResultScreen;
