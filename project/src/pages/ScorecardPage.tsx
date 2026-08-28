import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Lock,
  Sparkles,
  TrendingUp,
  Brain,
  MessageSquare,
  Check,
  Star,
  Home,
} from 'lucide-react';
import { useInterview } from '@/context/InterviewContext';
import { getExam } from '@/lib/exams';

interface Score {
  label: string;
  value: number;
  icon: typeof TrendingUp;
  color: string;
  track: string;
  tips: string[];
}

const SCORES: Score[] = [
  {
    label: 'Confidence',
    value: 78,
    icon: TrendingUp,
    color: 'text-primary-600',
    track: 'bg-primary-500',
    tips: ['Strong opening posture in your first answer', 'Slightly hesitant on follow-up — pause less'],
  },
  {
    label: 'Subject Knowledge',
    value: 84,
    icon: Brain,
    color: 'text-accent-600',
    track: 'bg-accent-500',
    tips: ['Good conceptual depth on core topics', 'Add one concrete example per answer for credibility'],
  },
  {
    label: 'Communication',
    value: 72,
    icon: MessageSquare,
    color: 'text-success-600',
    track: 'bg-success-500',
    tips: ['Clear sentence structure', 'Reduce filler words — aim for 2 per minute'],
  },
];

export default function ScorecardPage() {
  const navigate = useNavigate();
  const { examId, result, reset } = useInterview();
  const exam = examId ? getExam(examId) : undefined;
  const [unlocked, setUnlocked] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    if (!examId || !result) {
      navigate('/', { replace: true });
    }
    const t = setTimeout(() => setAnimated(true), 250);
    return () => clearTimeout(t);
  }, [examId, result, navigate]);

  const overall = Math.round(
    SCORES.reduce((s, c) => s + c.value, 0) / SCORES.length
  );

  const handleUnlock = () => {
    setProcessing(true);
    // Simulated payment flow
    setTimeout(() => {
      setProcessing(false);
      setUnlocked(true);
    }, 1600);
  };

  const handleRestart = () => {
    reset();
    navigate('/');
  };

  if (!exam) return null;

  const fmt = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div className="min-h-screen bg-ink-50">
      <header className="sticky top-0 z-10 border-b border-ink-200/70 bg-white/85 backdrop-blur-lg">
        <div className="mx-auto flex max-w-md items-center justify-between px-4 py-3">
          <button
            onClick={() => navigate('/interview')}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-ink-600 transition-colors hover:bg-ink-100"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <span className="text-sm font-bold text-ink-900">Your Scorecard</span>
          <div className="w-10" />
        </div>
      </header>

      <main className="mx-auto max-w-md px-4 pb-12 pt-6">
        {/* overall hero */}
        <section className="card animate-scale-in overflow-hidden">
          <div className={`bg-gradient-to-br ${exam.gradient} px-6 py-8 text-center text-white`}>
            <p className="text-sm font-medium text-white/80">{exam.name} Mock Interview</p>
            <div className="mt-2 flex items-center justify-center gap-1">
              <Star className="h-7 w-7 fill-white/90 text-white/90" />
              <span className="font-display text-5xl font-extrabold tracking-tight">
                {animated ? overall : 0}
              </span>
              <span className="mt-3 text-lg font-semibold text-white/70">/100</span>
            </div>
            <p className="mt-1 text-sm text-white/80">
              {overall >= 80
                ? 'Excellent — you are interview-ready!'
                : overall >= 70
                  ? 'Good effort — a little polish to go.'
                  : 'Keep practising — you will get there.'}
            </p>
          </div>
          <div className="flex divide-x divide-ink-100 text-center">
            <div className="flex-1 py-3">
              <div className="text-lg font-bold text-ink-900">
                {result ? fmt(result.durationSec) : '00:00'}
              </div>
              <div className="text-xs text-ink-500">Duration</div>
            </div>
            <div className="flex-1 py-3">
              <div className="text-lg font-bold text-ink-900">
                {result ? result.transcript.filter((m) => m.role === 'user').length : 0}
              </div>
              <div className="text-xs text-ink-500">Answers</div>
            </div>
            <div className="flex-1 py-3">
              <div className="text-lg font-bold text-ink-900">{SCORES.length}</div>
              <div className="text-xs text-ink-500">Parameters</div>
            </div>
          </div>
        </section>

        {/* score bars */}
        <section className="mt-5 space-y-3">
          {SCORES.map((s, idx) => (
            <div
              key={s.label}
              className="card animate-fade-up p-4"
              style={{ animationDelay: `${idx * 80}ms` }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-xl bg-ink-50 ${s.color}`}>
                    <s.icon className="h-5 w-5" />
                  </div>
                  <span className="font-semibold text-ink-900">{s.label}</span>
                </div>
                <span className={`font-display text-xl font-bold ${s.color}`}>
                  {animated ? s.value : 0}
                  <span className="text-sm font-medium text-ink-400">/100</span>
                </span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-ink-100">
                <div
                  className={`h-full rounded-full ${s.track} transition-all duration-1000 ease-out`}
                  style={{ width: animated ? `${s.value}%` : '0%' }}
                />
              </div>
            </div>
          ))}
        </section>

        {/* feedback panel */}
        <section className="mt-5">
          {unlocked ? (
            <div className="card animate-scale-in p-5">
              <div className="mb-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-accent-500" />
                <h2 className="font-display text-lg font-bold text-ink-900">
                  Detailed Feedback
                </h2>
              </div>
              <div className="space-y-4">
                {SCORES.map((s) => (
                  <div key={s.label}>
                    <h3 className={`mb-2 text-sm font-bold ${s.color}`}>{s.label}</h3>
                    <ul className="space-y-1.5">
                      {s.tips.map((tip) => (
                        <li key={tip} className="flex items-start gap-2 text-sm text-ink-700">
                          <Check className={`mt-0.5 h-4 w-4 flex-shrink-0 ${s.color}`} />
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
                <div className="mt-4 rounded-2xl bg-primary-50 p-4">
                  <h3 className="mb-1 text-sm font-bold text-primary-700">
                    Overall recommendation
                  </h3>
                  <p className="text-sm leading-relaxed text-primary-800">
                    You have a solid foundation. Focus on adding concrete examples
                    and reducing filler words. Two more mock sessions targeting
                    communication should push you above 85.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="card relative overflow-hidden p-5">
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent to-ink-50/95" />
              <div className="relative">
                <div className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-ink-400" />
                  <h2 className="font-display text-lg font-bold text-ink-900">
                    Detailed Feedback
                  </h2>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-ink-600">
                  Unlock per-parameter tips, example answers, and a personalised
                  improvement plan curated by AI.
                </p>

                <div className="mt-4 space-y-2 opacity-50">
                  {['Per-parameter improvement tips', 'Model answer examples', 'Personalised study plan'].map((f) => (
                    <div key={f} className="flex items-center gap-2 text-sm text-ink-500">
                      <Lock className="h-3.5 w-3.5" />
                      {f}
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleUnlock}
                  disabled={processing}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-accent-500 px-6 py-4 text-base font-bold text-white shadow-soft transition-all active:scale-[0.97] hover:bg-accent-600 disabled:opacity-60"
                >
                  {processing ? (
                    <>
                      <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      Processing…
                    </>
                  ) : (
                    <>
                      <Lock className="h-5 w-5" />
                      Unlock Detailed Feedback for ₹49
                    </>
                  )}
                </button>
                <p className="mt-2 text-center text-xs text-ink-400">
                  One-time payment · instant access
                </p>
              </div>
            </div>
          )}
        </section>

        {/* actions */}
        <section className="mt-6 grid grid-cols-2 gap-3">
          <button
            onClick={handleRestart}
            className="btn-primary"
          >
            <Home className="h-4 w-4" />
            New Interview
          </button>
          <button
            onClick={() => navigate('/interview')}
            className="btn-ghost"
          >
            Review transcript
          </button>
        </section>
      </main>
    </div>
  );
}
