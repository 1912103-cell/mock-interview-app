import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { InterviewProvider } from '@/context/InterviewContext';
import HomePage from '@/pages/HomePage';
import InterviewPage from '@/pages/InterviewPage';
import ScorecardPage from '@/pages/ScorecardPage';
import ReportPage from '@/pages/ReportPage';

function App() {
  return (
    <BrowserRouter>
      <InterviewProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/interview" element={<InterviewPage />} />
          <Route path="/scorecard" element={<ScorecardPage />} />
          <Route path="/report" element={<ReportPage />} />
          <Route path="*" element={<HomePage />} />
        </Routes>
      </InterviewProvider>
    </BrowserRouter>
  );
}

export default App;
