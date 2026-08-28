import type { ExamId } from './exams';

export interface DAFData {
  homeState: string;
  graduationSubject: string;
  hobbies: string;
}

interface AiQuestion {
  text: string;
  followups: string[];
}

const BANK: Record<string, AiQuestion[]> = {
  upsc: [
    {
      text: "Let's begin. What do you understand by the term 'inclusive governance', and why is it important for a diverse country like India?",
      followups: [
        "That's a fair start. Can you cite one recent government initiative that reflects inclusive governance and evaluate its impact?",
        "Good. Now, how would you balance fiscal discipline with welfare spending during an economic slowdown?",
      ],
    },
  ],
  'state-psc': [
    {
      text: "Welcome. How does your understanding of the local issues in your home state of {homeState} help in effective administration?",
      followups: [
        "That's insightful. Given your background in {graduationSubject}, how would you apply those skills to improve district-level public service delivery?",
        "Interesting. Which local development challenge in {homeState} do you believe needs immediate policy attention and why?",
      ],
    },
  ],
  ssb: [
    {
      text: "Welcome, candidate. The 15 Officer Like Qualities (OLQs) form the backbone of the assessment. Can you reflect on how you have demonstrated 'Initiative' in a recent life challenge?",
      followups: [
        "Noted. With your interest in {hobbies}, how do you believe these activities contribute to your mental toughness and team spirit?",
        "Good. If you were leading a team in a high-pressure environment and one member was struggling, how would you ensure the mission success while maintaining team morale?",
      ],
    },
  ],
  'ssc-cgl': [
    {
      text: "Welcome. Tell me about yourself and why you chose to apply for this position through the SSC CGL route.",
      followups: [
        "Interesting. A train travels 600 km in 8 hours partly at 75 km/h and partly at 100 km/h. How much distance does it cover at each speed?",
        "Well attempted. How would you prioritise a high-volume data entry task with a tight deadline?",
      ],
    },
  ],
  'sbi-po': [
    {
      text: "Good to have you here. What is the current repo rate, and how does a change in it affect a bank's lending decisions?",
      followups: [
        "Reasonable. If a customer with a strong CIBIL score is denied a loan, how would you handle their grievance as a probationary officer?",
        "Good. Explain the difference between NPAs and write-offs, and why the distinction matters for a public sector bank.",
      ],
    },
  ],
};

export function getOpeningQuestion(examId: ExamId, daf?: DAFData): string {
  let q = BANK[examId] ? BANK[examId][0].text : "Welcome to your interview.";
  
  if (daf) {
    q = q.replace('{subject}', daf.graduationSubject)
         .replace('{hobbies}', daf.hobbies)
         .replace('{homeState}', daf.homeState);
  }
  
  return q;
}

export function getNextQuestion(
  examId: ExamId,
  exchangeCount: number,
  daf?: DAFData
): string | null {
  const exam = BANK[examId] ? BANK[examId][0] : null;
  if (!exam) return null;
  
  if (exchangeCount < exam.followups.length) {
    let q = exam.followups[exchangeCount];
    if (daf) {
        q = q.replace('{subject}', daf.graduationSubject)
             .replace('{hobbies}', daf.hobbies)
             .replace('{homeState}', daf.homeState);
    }
    return q;
  }
  return null;
}

