import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, Download, Sparkles, TrendingUp, Brain, MessageSquare, Home } from 'lucide-react';
import { useInterview } from '@/context/InterviewContext';
import { getExam } from '@/lib/exams';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function ReportPage() {
  const navigate = useNavigate();
  const { examId, result, reset } = useInterview();
  const exam = examId ? getExam(examId) : undefined;
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!examId || !result) {
      navigate('/', { replace: true });
    }
  }, [examId, result, navigate]);

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.text(`Interview Report - ${exam?.name}`, 10, 10);
    autoTable(doc, {
      head: [['Parameter', 'Rating', 'Feedback']],
      body: [
        ['Communication', '8/10', 'Good flow, maintain clarity.'],
        ['Content Depth', '7/10', 'Needs more examples.'],
      ],
    });
    doc.save('interview-report.pdf');
  };

  if (!exam) return null;

  return (
    <div className="min-h-screen bg-ink-50 p-4">
      <header className="flex items-center justify-between py-3">
        <button onClick={() => navigate('/')} className="p-2 bg-white rounded-xl"><ArrowLeft /></button>
        <h1 className="font-bold text-lg">Interview Summary</h1>
        <div className="w-10"></div>
      </header>

      <main className="max-w-md mx-auto space-y-6">
        <section className="bg-white p-6 rounded-2xl shadow-soft">
          <h2 className="text-xl font-bold">Feedback for {exam.name}</h2>
          <div className="mt-4 space-y-4">
            {/* Conditional Rendering based on Exam */}
            {exam.id === 'ssb' ? (
              <p>Ratings across 15 OLQs would be here.</p>
            ) : (
              <div>
                <p><strong>Answer Depth:</strong> Good</p>
                <p><strong>Language Clarity:</strong> Excellent</p>
                <p><strong>Stance Balance:</strong> Moderate</p>
              </div>
            )}
          </div>
          
          <button 
            onClick={downloadPDF}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary-500 px-6 py-3 text-white font-bold"
          >
            <Download className="h-5 w-5" />
            Download PDF Report
          </button>
        </section>

        <section className="bg-white p-6 rounded-2xl shadow-soft">
            <h2 className="text-lg font-bold flex items-center gap-2"><Lock className="text-accent-500" /> Unlock Unlimited Interviews</h2>
            <p className="text-sm text-ink-600 mt-2">Upgrade to get AI-driven insights and unlimited sessions.</p>
            <button 
              className="mt-4 w-full bg-accent-500 text-white rounded-2xl py-3 font-bold"
              onClick={() => alert('Razorpay Popup: Upgrade to Unlimited Interviews')}
            >
              Upgrade Now
            </button>
        </section>
      </main>
    </div>
  );
}