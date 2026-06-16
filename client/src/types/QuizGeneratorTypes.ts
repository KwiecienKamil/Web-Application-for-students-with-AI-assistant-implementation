export type QA = { question: string; answer: string };

export type QuizAnswerDetails = {
  question: string;
  correct_answer: string;
  user_answer: string;
  is_correct: number;
};

export type QuizPDFReaderProps = {
  user: any;
  setLoading: (val: boolean) => void;
  setQuestions: (val: QA[]) => void;
  setSelectedAnswers: (val: Record<number, string>) => void;
  setResults: (val: Record<number, boolean>) => void;
  setOptionsMap: (val: Record<number, string[]>) => void;
};
