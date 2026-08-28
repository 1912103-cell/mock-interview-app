import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, Square, ArrowLeft, Loader2, Send } from 'lucide-react';
import { useInterview } from '@/context/InterviewContext';
import { DAFData } from '@/lib/aiBank';
import DAFForm from '@/components/forms/DAFForm';

import { getExam, type ChatMessage } from '@/lib/exams';
import { getOpeningQuestion, getNextQuestion } from '@/lib/aiBank';
import Visualizer from '@/components/Visualizer';

// Minimal typings for the Web Speech API (not in standard TS DOM lib)
interface SpeechRecognitionResultLike {
  0: { transcript: string };
  isFinal: boolean;
}
interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: { length: number; [i: number]: SpeechRecognitionResultLike };
}
interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((e: SpeechRecognitionEventLike) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}
type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  }
}

let msgId = 0;
const uid = () => `m${++msgId}-${Date.now()}`;

export default function InterviewPage() {
  const navigate = useNavigate();
  const { examId, messages, setMessages, setDurationSec, setResult, dafData, setDafData } = useInterview();
  const exam = examId ? getExam(examId) : undefined;

  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState('');
  const [supported, setSupported] = useState(true);
  const [aiThinking, setAiThinking] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [ended, setEnded] = useState(false);

  // Render DAF form if needed
  if (examId && !dafData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-ink-50 p-4">
        <div className="w-full max-w-md">
          <DAFForm onComplete={setDafData} />
        </div>
      </div>
    );
  }

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const exchangeCountRef = useRef(0);
  const startedRef = useRef(false);

  // guard: no exam selected
  useEffect(() => {
    if (!examId) navigate('/', { replace: true });
  }, [examId, navigate]);

  // timer
  useEffect(() => {
    const t = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  // seed opening question once DAF is provided
  useEffect(() => {
    if (!examId || startedRef.current || !dafData) return;
    startedRef.current = true;
    const opener: ChatMessage = {
      id: uid(),
      role: 'ai',
      text: getOpeningQuestion(examId, dafData),
      timestamp: Date.now(),
    };
    setMessages([opener]);
  }, [examId, setMessages, dafData]);

  // Speak when AI sends a message
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.role === 'ai') {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(lastMessage.text);
      utterance.lang = 'en-IN';
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  }, [messages]);

  // auto-scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, interim, aiThinking]);

  // check support + build recognition instance
  useEffect(() => {
    const Ctor = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Ctor) {
      setSupported(false);
      return;
    }
    const rec = new Ctor();
    rec.lang = 'en-IN';
    rec.continuous = true;
    rec.interimResults = true;

    rec.onresult = (e) => {
      let finalChunk = '';
      let interimChunk = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) finalChunk += r[0].transcript;
        else interimChunk += r[0].transcript;
      }
      if (finalChunk) {
        setInterim('');
        pushUserMessage(finalChunk.trim());
      } else {
        setInterim(interimChunk);
      }
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);

    recognitionRef.current = rec;
    return () => {
      try {
        rec.stop();
      } catch {
        /* noop */
      }
    };
  }, []);

  const pushUserMessage = useCallback(
    (text: string) => {
      if (!text) return;
      const userMsg: ChatMessage = {
        id: uid(),
        role: 'user',
        text,
        timestamp: Date.now(),
      };
      setMessages([...messages, userMsg]);
      // AI responds
      setAiThinking(true);
      const count = exchangeCountRef.current;
      const next = examId ? getNextQuestion(examId, count, dafData || undefined) : null;
      window.setTimeout(() => {
        const aiMsg: ChatMessage = {
          id: uid(),
          role: 'ai',
          text: next ?? "That's a thoughtful response. Let's move on — I have enough to evaluate you.",
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, aiMsg]);
        setAiThinking(false);
        exchangeCountRef.current += 1;
      }, 1400);
    },
    [messages, setMessages, examId, dafData]
  );

  const startListening = () => {
    if (!supported || !recognitionRef.current) return;
    try {
      recognitionRef.current.start();
      setListening(true);
    } catch {
      /* already started */
    }
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setListening(false);
    setInterim('');
  };

  const handleEnd = () => {
    stopListening();
    setEnded(true);
    setDurationSec(elapsed);
    if (examId) {
      setResult({ examId, transcript: messages, durationSec: elapsed });
    }
    navigate('/scorecard');
  };

  if (!exam) return null;

  const fmt = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div className="flex min-h-screen flex-col bg-ink-50">
      {/* top bar */}
      <header className="sticky top-0 z-10 border-b border-ink-200/70 bg-white/85 backdrop-blur-lg">
        <div className="mx-auto flex max-w-md items-center justify-between px-4 py-3">
          <button
            onClick={() => navigate('/')}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-ink-600 transition-colors hover:bg-ink-100"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="text-center">
            <div className="text-sm font-bold leading-tight text-ink-900">
              {exam.name} Interview
            </div>
            <div className="flex items-center justify-center gap-1.5 text-xs text-ink-500">
              <span
                className={`h-1.5 w-1.5 rounded-full ${listening ? 'bg-error-500 animate-pulse' : 'bg-ink-300'}`}
              />
              {fmt(elapsed)}
            </div>
          </div>
          <button
            onClick={handleEnd}
            className="rounded-xl bg-error-50 px-3 py-2 text-xs font-semibold text-error-600 transition-colors hover:bg-error-100"
          >
            End
          </button>
        </div>
      </header>

      {/* chat */}
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 py-4">
        <div className="no-scrollbar flex-1 space-y-4 overflow-y-auto pb-4">
          {messages.map((m) => (
            <ChatBubble key={m.id} message={m} />
          ))}

          {interim && (
            <div className="flex justify-end">
              <div className="max-w-[80%] rounded-2xl rounded-br-md bg-primary-100 px-4 py-3 text-sm text-primary-800 italic opacity-70">
                {interim}…
              </div>
            </div>
          )}

          {aiThinking && (
            <div className="flex items-center gap-2 px-1">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-ink-900 text-white">
                <span className="text-xs font-bold">AI</span>
              </div>
              <div className="flex items-center gap-1 rounded-2xl rounded-bl-md bg-ink-100 px-4 py-3">
                <span className="h-2 w-2 animate-bounce-dot rounded-full bg-ink-400 [animation-delay:-0.3s]" />
                <span className="h-2 w-2 animate-bounce-dot rounded-full bg-ink-400 [animation-delay:-0.15s]" />
                <span className="h-2 w-2 animate-bounce-dot rounded-full bg-ink-400" />
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
      </main>

      {/* control dock */}
      <footer className="sticky bottom-0 border-t border-ink-200/70 bg-white/90 backdrop-blur-lg">
        <div className="mx-auto max-w-md px-4 pb-5 pt-3">
          <Visualizer active={listening} />

          {!supported && (
            <p className="mt-2 text-center text-xs text-error-500">
              Voice input isn't supported in this browser. Try Chrome on Android or desktop.
            </p>
          )}

          <div className="mt-3 flex items-center justify-center gap-4">
            <button
              onClick={listening ? stopListening : startListening}
              disabled={!supported}
              className="relative flex h-20 w-20 items-center justify-center rounded-full transition-all duration-200 active:scale-95 disabled:opacity-40"
              aria-label={listening ? 'Stop speaking' : 'Hold to speak'}
            >
              {listening && (
                <>
                  <span className="absolute inset-0 animate-pulse-ring rounded-full bg-error-400/40" />
                  <span className="absolute inset-0 animate-pulse-ring rounded-full bg-error-400/30 [animation-delay:0.4s]" />
                </>
              )}
              <span
                className={`relative flex h-20 w-20 items-center justify-center rounded-full shadow-glow transition-colors ${
                  listening
                    ? 'bg-error-500 text-white'
                    : 'bg-primary-600 text-white'
                }`}
              >
                {listening ? <Square className="h-7 w-7" /> : <Mic className="h-8 w-8" />}
              </span>
            </button>
          </div>

          <p className="mt-2 text-center text-xs font-medium text-ink-500">
            {listening ? 'Listening… tap to stop' : 'Tap the mic to speak'}
          </p>

          <button
            onClick={handleEnd}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-ink-900 px-6 py-3.5 text-sm font-semibold text-white transition-all active:scale-[0.97]"
          >
            <Send className="h-4 w-4" />
            Finish & view scorecard
          </button>
        </div>
      </footer>
    </div>
  );
}

function ChatBubble({ message }: { message: ChatMessage }) {
  const isAi = message.role === 'ai';
  return (
    <div className={`flex items-end gap-2 ${isAi ? 'justify-start' : 'justify-end'} animate-fade-up`}>
      {isAi && (
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-ink-900 text-white">
          <span className="text-xs font-bold">AI</span>
        </div>
      )}
      <div
        className={`max-w-[80%] px-4 py-3 text-sm leading-relaxed ${
          isAi
            ? 'rounded-2xl rounded-bl-md bg-white text-ink-800 shadow-soft'
            : 'rounded-2xl rounded-br-md bg-primary-600 text-white'
        }`}
      >
        {message.text}
      </div>
    </div>
  );
}
