import { createContext, useContext, useState, type ReactNode } from 'react';
import type { ChatMessage, ExamId, InterviewResult } from '@/lib/exams';
import type { DAFData } from '@/lib/aiBank';

interface InterviewContextValue {
  examId: ExamId | null;
  setExamId: (id: ExamId | null) => void;
  messages: ChatMessage[];
  setMessages: (msgs: ChatMessage[]) => void;
  durationSec: number;
  setDurationSec: (n: number) => void;
  result: InterviewResult | null;
  setResult: (r: InterviewResult | null) => void;
  dafData: DAFData | null;
  setDafData: (d: DAFData | null) => void;
  reset: () => void;
}

const InterviewContext = createContext<InterviewContextValue | null>(null);

export function InterviewProvider({ children }: { children: ReactNode }) {
  const [examId, setExamId] = useState<ExamId | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [durationSec, setDurationSec] = useState(0);
  const [result, setResult] = useState<InterviewResult | null>(null);
  const [dafData, setDafData] = useState<DAFData | null>(null);

  const reset = () => {
    setMessages([]);
    setDurationSec(0);
    setResult(null);
    setDafData(null);
  };

  return (
    <InterviewContext.Provider
      value={{
        examId,
        setExamId,
        messages,
        setMessages,
        durationSec,
        setDurationSec,
        result,
        setResult,
        dafData,
        setDafData,
        reset,
      }}
    >
      {children}
    </InterviewContext.Provider>
  );
}

export function useInterview() {
  const ctx = useContext(InterviewContext);
  if (!ctx) throw new Error('useInterview must be used within InterviewProvider');
  return ctx;
}

