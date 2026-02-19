
import React from 'react';
import { TestConfig, TestMode, Direction } from '../types';

interface ConfigScreenProps {
  config: TestConfig;
  onUpdate: (config: TestConfig) => void;
  onStart: () => void;
}

const ConfigScreen: React.FC<ConfigScreenProps> = ({ config, onUpdate, onStart }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    onUpdate({
      ...config,
      [name]: name === 'mode' || name === 'direction' ? value : Number(value),
    });
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white rounded-3xl shadow-xl mt-8 mb-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold text-indigo-600 mb-2">认知广度测试</h1>
        <p className="text-gray-500">定制您的记忆训练方案</p>
      </div>

      <div className="space-y-6">
        {/* Mode */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">选择模式</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: '中文', value: TestMode.CHINESE },
              { label: '混全', value: TestMode.MIXED },
              { label: '英文', value: TestMode.ENGLISH },
            ].map((m) => (
              <button
                key={m.value}
                onClick={() => onUpdate({ ...config, mode: m.value })}
                className={`py-3 px-4 rounded-xl text-sm font-medium transition-all ${
                  config.mode === m.value
                    ? 'bg-indigo-600 text-white shadow-lg scale-105'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Word Length Range */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">词语字数范围</label>
          <div className="flex items-center space-x-4">
            <input
              type="number"
              name="minLen"
              value={config.minLen}
              onChange={handleChange}
              min="1"
              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="最小"
            />
            <span className="text-gray-400">至</span>
            <input
              type="number"
              name="maxLen"
              value={config.maxLen}
              onChange={handleChange}
              min="1"
              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="最大"
            />
          </div>
        </div>

        {/* Direction */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">记忆方向</label>
          <div className="flex bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => onUpdate({ ...config, direction: Direction.FORWARD })}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                config.direction === Direction.FORWARD ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500'
              }`}
            >
              正序 (Forward)
            </button>
            <button
              onClick={() => onUpdate({ ...config, direction: Direction.BACKWARD })}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                config.direction === Direction.BACKWARD ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500'
              }`}
            >
              倒序 (Backward)
            </button>
          </div>
        </div>

        {/* Start Level & Duration */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">起始级别</label>
            <input
              type="number"
              name="startLevel"
              value={config.startLevel}
              onChange={handleChange}
              min="1"
              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">显示时长 (秒)</label>
            <input
              type="number"
              step="0.1"
              name="duration"
              value={config.duration}
              onChange={handleChange}
              min="0.5"
              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
        </div>

        <button
          onClick={onStart}
          className="w-full py-4 mt-4 bg-indigo-600 text-white rounded-2xl text-lg font-bold shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
        >
          开始测试
        </button>
      </div>
    </div>
  );
};

export default ConfigScreen;
