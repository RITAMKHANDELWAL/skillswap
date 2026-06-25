import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { FileCheck, Award, Sparkles, HelpCircle, ArrowRight, CheckCircle2, XCircle, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Quiz() {
  const { checkAuth } = useAuthStore();
  const [quizzes, setQuizzes] = useState([]);
  const [loadingList, setLoadingList] = useState(true);

  // Active quiz state
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [activeQuizQuestions, setActiveQuizQuestions] = useState([]);
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});

  // Quiz submission results state
  const [quizResults, setQuizResults] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchQuizzesList = async () => {
    try {
      setLoadingList(true);
      const res = await axios.get('/api/quizzes');
      setQuizzes(res.data.quizzes);
      setLoadingList(false);
    } catch (error) {
      console.error('Error fetching quizzes:', error.message);
      setLoadingList(false);
    }
  };

  useEffect(() => {
    fetchQuizzesList();
  }, []);

  const handleStartQuiz = async (skillName) => {
    setLoadingQuiz(true);
    setQuizResults(null);
    setSelectedAnswers({});
    setCurrentQuestionIdx(0);

    try {
      const res = await axios.get(`/api/quizzes/${skillName}`);
      setActiveQuiz(res.data.quiz);
      setActiveQuizQuestions(res.data.quiz.questions);
      setLoadingQuiz(false);
    } catch (error) {
      alert(error.response?.data?.message || 'Error loading quiz details');
      setLoadingQuiz(false);
    }
  };

  const handleSelectOption = (optionIndex) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQuestionIdx]: optionIndex
    });
  };

  const handleSubmitQuiz = async () => {
    if (!activeQuiz) return;
    
    // Convert answers object to indices array
    const answersArray = [];
    for (let i = 0; i < activeQuizQuestions.length; i++) {
      if (selectedAnswers[i] === undefined) {
        alert('Please answer all questions before submitting.');
        return;
      }
      answersArray.push(selectedAnswers[i]);
    }

    setSubmitting(true);
    try {
      const res = await axios.post(`/api/quizzes/${activeQuiz.skillName}/submit`, {
        answers: answersArray
      });
      setQuizResults(res.data);
      checkAuth(); // Refresh user credit/badges profile state on pass
    } catch (error) {
      alert('Error evaluating answers.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingList) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-2">
        <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
        <span className="text-xs text-slate-500">Loading skill assessments...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* View 1: Quiz list selector */}
      {!activeQuiz && !quizResults && (
        <div className="space-y-6">
          <div className="space-y-1">
            <h1 className="font-display font-bold text-2xl md:text-3xl text-white">Skill Verification</h1>
            <p className="text-sm text-slate-400 font-medium">Verify your engineering expertise, unlock certified profile badges, and earn 10 credits per verification test.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quizzes.map((q) => (
              <div key={q._id} className="glass-panel p-5 rounded-2xl flex flex-col justify-between gap-5 hover:border-indigo-500/25 transition duration-300">
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 flex items-center justify-center font-bold">
                    🛡️
                  </div>
                  <h3 className="font-display font-semibold text-base text-slate-200">{q.skillName} Verification</h3>
                  <p className="text-xs text-slate-500 font-medium">{q.questions?.length || 0} Multiple-Choice questions testing key practices.</p>
                </div>

                <button 
                  onClick={() => handleStartQuiz(q.skillName)}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-xs font-semibold rounded-xl text-white shadow-glass-glow transition duration-200"
                >
                  Start Assessment
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* View 2: Active Question Flow */}
      {activeQuiz && !quizResults && (
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <button 
              onClick={() => setActiveQuiz(null)}
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-white transition"
            >
              <ChevronLeft size={16} /> Exit Quiz
            </button>
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
              {activeQuiz.skillName} Quiz: {currentQuestionIdx + 1} of {activeQuizQuestions.length}
            </span>
          </div>

          {/* Question panel */}
          {loadingQuiz ? (
            <div className="flex justify-center py-10">
              <div className="w-8 h-8 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
            </div>
          ) : (
            <div className="glass-panel p-6 md:p-8 rounded-2xl space-y-6">
              <h3 className="font-display font-semibold text-base md:text-lg text-white leading-snug">
                {activeQuizQuestions[currentQuestionIdx]?.text}
              </h3>

              <div className="space-y-2.5">
                {activeQuizQuestions[currentQuestionIdx]?.options.map((option, idx) => {
                  const isSelected = selectedAnswers[currentQuestionIdx] === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(idx)}
                      className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-left text-xs transition duration-200 ${
                        isSelected 
                          ? 'bg-indigo-500/10 border-indigo-500 text-indigo-300 font-semibold shadow-glass-glow' 
                          : 'glass-panel hover:bg-slate-800/40 text-slate-300'
                      }`}
                    >
                      <span>{option}</span>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                        isSelected ? 'border-indigo-500 bg-indigo-500' : 'border-slate-700'
                      }`}>
                        {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Action buttons */}
              <div className="flex justify-between items-center pt-2">
                <button
                  onClick={() => setCurrentQuestionIdx(prev => Math.max(0, prev - 1))}
                  disabled={currentQuestionIdx === 0}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-50 text-xs font-semibold rounded-lg border border-slate-700 transition"
                >
                  Previous
                </button>

                {currentQuestionIdx < activeQuizQuestions.length - 1 ? (
                  <button
                    onClick={() => setCurrentQuestionIdx(prev => prev + 1)}
                    disabled={selectedAnswers[currentQuestionIdx] === undefined}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-xs font-semibold rounded-lg text-white shadow-glass-glow transition flex items-center gap-1"
                  >
                    Next <ArrowRight size={14} />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmitQuiz}
                    disabled={submitting || selectedAnswers[currentQuestionIdx] === undefined}
                    className="px-5 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 disabled:opacity-50 text-xs font-semibold rounded-lg text-white shadow-glass-glow transition"
                  >
                    {submitting ? 'Submitting...' : 'Finish & Evaluate'}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* View 3: Score & Results summary */}
      {quizResults && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="glass-panel-glow p-6 md:p-8 rounded-2xl space-y-6 border-indigo-500/20 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[80px] pointer-events-none" />
            
            <div className="space-y-3">
              <div className="inline-block text-4xl mb-1 animate-bounce">
                {quizResults.passed ? '🏆' : '😢'}
              </div>
              <h2 className="font-display font-bold text-xl md:text-2xl text-white">
                {quizResults.passed ? 'Assessment Passed!' : 'Assessment Failed'}
              </h2>
              <p className="text-xs text-slate-400 font-medium">
                You scored <strong className="text-indigo-300 font-semibold">{quizResults.scorePercentage}%</strong> ({quizResults.correctCount} of {quizResults.totalQuestions} correct answers). Passing score is 70%+.
              </p>
            </div>

            {/* Achievement card on unlock */}
            {quizResults.passed && quizResults.badgeUnlocked && (
              <div className="max-w-md mx-auto p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-xl space-y-2 text-left shadow-glass-glow">
                <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs">
                  <Sparkles size={16} /> Badge Earned!
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-lg text-indigo-300">
                    🥇
                  </div>
                  <div>
                    <h4 className="font-semibold text-xs text-slate-200">{quizResults.badgeUnlocked.name}</h4>
                    <p className="text-[10px] text-slate-500">{quizResults.badgeUnlocked.description}</p>
                  </div>
                </div>
                <div className="text-[10px] text-green-400 font-semibold pt-1">
                  🎁 Bonus +10 learning credits credited to your profile.
                </div>
              </div>
            )}

            <button 
              onClick={() => { setQuizResults(null); setActiveQuiz(null); }}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-xl border border-slate-700 text-slate-300 transition"
            >
              Back to Verification List
            </button>
          </div>

          {/* Breakdown / Review answers */}
          <div className="space-y-3">
            <h3 className="font-display font-bold text-sm text-slate-400 uppercase tracking-wider">Answer Review</h3>
            {quizResults.breakdown.map((item, idx) => (
              <div key={idx} className="glass-panel p-4 rounded-xl space-y-2 text-xs">
                <div className="flex items-start justify-between gap-3">
                  <div className="font-semibold text-slate-200 leading-snug">{idx + 1}. {item.question}</div>
                  {item.isCorrect ? (
                    <CheckCircle2 size={18} className="text-green-500 shrink-0" />
                  ) : (
                    <XCircle size={18} className="text-red-500 shrink-0" />
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] font-medium pt-1">
                  <div className="p-2 bg-slate-900/40 rounded-lg">
                    <span className="text-slate-500 block">Your Answer:</span>
                    <span className={item.isCorrect ? 'text-green-400' : 'text-red-400'}>{item.submittedAnswer}</span>
                  </div>
                  <div className="p-2 bg-slate-900/40 rounded-lg">
                    <span className="text-slate-500 block">Correct Answer:</span>
                    <span className="text-green-400">{item.correctAnswer}</span>
                  </div>
                </div>

                {item.explanation && (
                  <p className="text-[11px] text-slate-500 leading-relaxed pt-1 italic">
                    💡 Explanation: {item.explanation}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
