export type ExamId = 'upsc' | 'state-psc' | 'ssc-cgl' | 'sbi-po' | 'ssb';

export interface Exam {
  id: ExamId;
  name: string;
  fullName: string;
  description: string;
  topics: string[];
  gradient: string;
  accent: string;
}

export const EXAMS: Exam[] = [
  {
    id: 'upsc',
    name: 'UPSC',
    fullName: 'Union Public Service Commission',
    description: 'Civil Services personality test',
    topics: ['Ethics & integrity', 'Current affairs', 'Governance', 'Policy analysis'],
    gradient: 'from-primary-500 to-primary-700',
    accent: 'text-primary-600',
  },
  {
    id: 'state-psc',
    name: 'State PSC',
    fullName: 'State Public Service Commission',
    description: 'Regional administrative service interview',
    topics: ['Regional policy', 'Local geography', 'Governance', 'Current affairs'],
    gradient: 'from-secondary-500 to-secondary-700',
    accent: 'text-secondary-600',
  },

  {
    id: 'ssc-cgl',
    name: 'SSC CGL',
    fullName: 'Staff Selection Commission - Combined Graduate Level',
    description: 'Quantitative & reasoning interview',
    topics: ['Quantitative aptitude', 'Reasoning', 'General awareness', 'English'],
    gradient: 'from-accent-500 to-accent-700',
    accent: 'text-accent-600',
  },
  {
    id: 'sbi-po',
    name: 'SBI PO',
    fullName: 'State Bank of India - Probationary Officer',
    description: 'Banking group discussion & interview',
    topics: ['Banking awareness', 'Economy', 'Situational judgement', 'Communication'],
    gradient: 'from-success-500 to-success-700',
    accent: 'text-success-600',
  },
  {
    id: 'ssb',
    name: 'SSB',
    fullName: 'Services Selection Board',
    description: 'Armed forces personality & leadership',
    topics: ['Officer-like qualities', 'Leadership', 'Situational reaction', 'Logical reasoning'],
    gradient: 'from-ink-700 to-ink-900',
    accent: 'text-ink-700',
  },
];

export const getExam = (id: ExamId | null): Exam | undefined =>
  EXAMS.find((e) => e.id === id);

export interface ChatMessage {
  id: string;
  role: 'ai' | 'user';
  text: string;
  timestamp: number;
}

export interface InterviewResult {
  examId: ExamId;
  transcript: ChatMessage[];
  durationSec: number;
}
