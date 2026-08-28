import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, ChevronDown, Sparkles, ShieldCheck, BarChart3, Check } from 'lucide-react';
import { EXAMS, type ExamId } from '@/lib/exams';
import { useInterview } from '@/context/InterviewContext';

export default function HomePage() {
  const navigate = useNavigate();
  const { setExamId, reset } = useInterview();
  const [selected, setSelected] = useState<ExamId | ''>('');
  const [open, setOpen] = useState(false);

  const handleStart = () => {
    if (!selected) return;
    reset();
    setExamId(selected as ExamId);
    navigate('/interview');
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-ink-950 text-white">
      {/* ambient gradient backdrop */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 -left-24 h-72 w-72 rounded-full bg-primary-600/30 blur-3xl" />
        <div className="absolute top-1/3 -right-24 h-80 w-80 rounded-full bg-accent-500/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 h-72 w-72 rounded-full bg-success-500/15 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-md flex-col px-6 pb-10 pt-8">
        {/* brand */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur">
              <Mic className="h-5 w-5 text-white" />
            </div>
            <span className="font-display text-lg font-bold tracking-tight">
              CrackTheInterview
            </span>
          </div>
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/80 backdrop-blur">
            Beta
          </span>
        </header>

        {/* hero */}
        <section className="mt-12 animate-fade-up">
          <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-white/80 backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-accent-300" />
            AI-powered mock interviews
          </div>
          <h1 className="font-display text-4xl font-extrabold leading-[1.1] tracking-tight">
            Practice like it's the real thing.
          </h1>
          <p className="mt-3 text-base leading-relaxed text-white/70">
            Pick your target exam, hold to speak, and get instant AI feedback on
            confidence, knowledge and communication.
          </p>
        </section>

        {/* exam selector card */}
        <section className="mt-10 animate-fade-up" style={{ animationDelay: '80ms' }}>
          <label className="mb-2 block text-sm font-semibold text-white/80">
            Select your target exam
          </label>

          <div className="relative">
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="flex w-full items-center justify-between rounded-2xl border border-white/15 bg-white/10 px-4 py-4 text-left backdrop-blur transition-all active:scale-[0.98]"
            >
              {selected ? (
                <span className="font-semibold">{EXAMS.find((e) => e.id === selected)?.name}</span>
              ) : (
                <span className="text-white/50">Choose an exam</span>
              )}
              <ChevronDown
                className={`h-5 w-5 text-white/60 transition-transform ${open ? 'rotate-180' : ''}`}
              />
            </button>

            {open && (
              <div className="absolute z-20 mt-2 w-full animate-scale-in overflow-hidden rounded-2xl border border-white/15 bg-ink-900/95 shadow-2xl backdrop-blur-xl">
                {EXAMS.map((exam) => (
                  <button
                    key={exam.id}
                    type="button"
                    onClick={() => {
                      setSelected(exam.id);
                      setOpen(false);
                    }}
                    className="flex w-full items-center justify-between px-4 py-3.5 text-left transition-colors hover:bg-white/10"
                  >
                    <div>
                      <div className="font-semibold">{exam.name}</div>
                      <div className="text-xs text-white/50">{exam.description}</div>
                    </div>
                    {selected === exam.id && <Check className="h-5 w-5 text-primary-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* selected exam detail */}
          {selected && (
            <div className="mt-4 animate-scale-in rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
              <div className="text-sm font-semibold text-white/90">
                {EXAMS.find((e) => e.id === selected)?.fullName}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {EXAMS.find((e) => e.id === selected)?.topics.map((t) => (
                  <span
                    key={t}
                    className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/80"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={handleStart}
            disabled={!selected}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-6 py-4 text-base font-bold text-ink-900 shadow-glow transition-all duration-200 active:scale-[0.97] disabled:opacity-40 disabled:active:scale-100"
          >
            <Mic className="h-5 w-5" />
            Start Mock Interview
          </button>
        </section>

        {/* trust strip */}
        <section className="mt-auto pt-12">
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: ShieldCheck, label: 'Private session' },
              { icon: BarChart3, label: 'Instant scores' },
              { icon: Sparkles, label: 'AI feedback' },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-2 py-4 text-center backdrop-blur"
              >
                <Icon className="h-5 w-5 text-primary-300" />
                <span className="text-[11px] font-medium leading-tight text-white/70">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
