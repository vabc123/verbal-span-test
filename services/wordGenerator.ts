
import { TestMode, TestConfig } from '../types';
import { CHINESE_WORDS, ENGLISH_WORDS, MIXED_WORDS } from '../constants';

export const getFilteredWords = (config: TestConfig): string[] => {
  let source: string[] = [];
  
  switch (config.mode) {
    case TestMode.CHINESE:
      source = CHINESE_WORDS;
      break;
    case TestMode.ENGLISH:
      source = ENGLISH_WORDS;
      break;
    case TestMode.MIXED:
      source = MIXED_WORDS;
      break;
  }

  return source.filter(word => {
    const len = word.length;
    return len >= config.minLen && len <= config.maxLen;
  });
};

export const getRandomSequence = (words: string[], count: number): string[] => {
  if (words.length === 0) return [];
  const shuffled = [...words].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, words.length));
};
