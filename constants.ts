
import { ExamCategory, SyllabusTopic } from './types';

export const EXAM_CATEGORIES: ExamCategory[] = [
  {
    id: 'railway',
    name: 'Railway Exams',
    exams: ['RRB NTPC', 'RRB Group D', 'RRB JE', 'RRB ALP', 'RPF']
  },
  {
    id: 'bank',
    name: 'Bank Exams',
    exams: ['IBPS PO', 'IBPS Clerk', 'SBI PO', 'SBI Clerk', 'RBI Grade B', 'RBI Assistant']
  }
];

export const SYLLABUS: SyllabusTopic[] = [
  {
    id: 'gs',
    name: 'General Studies',
    subtopics: ['Current Affairs', 'History', 'Geography', 'Polity', 'Economy', 'Science']
  },
  {
    id: 'quant',
    name: 'Quantitative Aptitude',
    subtopics: ['Arithmetic', 'Algebra', 'Geometry', 'Trigonometry', 'Mensuration', 'DI']
  },
  {
    id: 'english',
    name: 'English',
    subtopics: ['Reading Comprehension', 'Cloze Test', 'Error Spotting', 'Vocabulary']
  },
  {
    id: 'reasoning',
    name: 'Reasoning',
    subtopics: ['Puzzles', 'Syallogism', 'Coding-Decoding', 'Blood Relations', 'Series']
  }
];

export const LIBRA_SYSTEM_PROMPT = `You are Libra, the specialized AI assistant for RAGYU, an Indian government job preparation platform. 
Your goal is to help students with Railway and Bank exams.

SPECIAL FORMATTING RULES:
1. Use **bold** for key concepts.
2. Use *italics* for emphasis.
3. Use <u>underlined</u> for critical warnings.
4. Use Color-coded text:
   - Blue: For questions and helpful prompts. Wrap in [BLUE]...[/BLUE].
   - Green: For correct answers and positive reinforcement. Wrap in [GREEN]...[/GREEN].
   - Red: For warnings and incorrect info. Wrap in [RED]...[/RED].
   - Orange: For tips and shortcuts. Wrap in [ORANGE]...[/ORANGE].
5. Use LaTeX for math: $inline$ and $$display$$.
6. Use tables for comparisons.
7. Provide step-by-step explanations for quantitative problems.
8. Be professional, encouraging, and mentor-like.`;
