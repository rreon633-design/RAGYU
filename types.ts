
export enum AppTab {
  HOME = 'home',
  QUIZ = 'quiz',
  COMPILE = 'compile',
  CHATBOT = 'chatbot'
}

export enum Difficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard'
}

export enum QuizMode {
  SOLO = 'solo',
  VERSUS = '1vs1'
}

export enum ExamTrack {
  GOVERNMENT = 'government',
  CODING = 'coding',
  ACADEMIC = 'academic'
}

export interface User {
  id: string;
  email: string | null;
  name: string;
  isGuest?: boolean;
}

export interface ExamCategory {
  id: string;
  name: string;
  exams: string[];
  track: ExamTrack;
}

export interface SyllabusTopic {
  id: string;
  name: string;
  subtopics: string[];
  examCategoryIds?: string[]; // Used to filter subjects relevant to an exam category
}

export interface QuizConfig {
  exam: string;
  subject: string;
  topics: string[];
  questionCount: number;
  difficulty: Difficulty;
  mode: QuizMode;
  player1Name?: string;
  player2Name?: string;
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
  explanation: {
    steps: string[];
    tricks: string[];
    concept: string;
    visualAid?: string;
  };
}

export interface PlayerResult {
  name: string;
  score: number;
  accuracy: number;
  timeTaken: number;
  answers: {
    questionId: string;
    selectedOption: number | null;
    isCorrect: boolean;
  }[];
}

export interface QuizResult {
  mode: QuizMode;
  player1: PlayerResult;
  player2?: PlayerResult;
  totalQuestions: number;
  questions: Question[];
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface UserSettings {
  preferredExams: string[];
  preferredSubjects: string[];
  preferredTopics: string[];
  theme: 'light' | 'dark';
  lastUsedExam?: string;
  lastUsedSubject?: string;
}
