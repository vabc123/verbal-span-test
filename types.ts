
export enum AppState {
  CONFIG = 'CONFIG',
  PREVIEW = 'PREVIEW',
  DISPLAYING = 'DISPLAYING',
  RECALLING = 'RECALLING',
  RESULT = 'RESULT'
}

export enum TestMode {
  CHINESE = '1',
  MIXED = '2',
  ENGLISH = '3'
}

export enum Direction {
  FORWARD = 'forward',
  BACKWARD = 'backward'
}

export interface TestConfig {
  mode: TestMode;
  minLen: number;
  maxLen: number;
  direction: Direction;
  startLevel: number;
  duration: number;
}

export interface TestSession {
  currentLevel: number;
  maxLevel: number;
  sequence: string[];
  userInput: string[];
  isCorrect: boolean | null;
}
