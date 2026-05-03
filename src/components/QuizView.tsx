import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle2, AlertCircle, ChevronRight, Loader2, Sparkles, Heart } from 'lucide-react';
import { generateQuiz, QuizQuestion } from '../services/geminiService';
import { db, auth } from '../lib/firebase';
import { collection, addDoc, doc, updateDoc, increment, getDoc } from 'firebase/firestore';

interface QuizViewProps {
  type: 'math' | 'brain' | 'spelling' | 'vocabulary';
  onClose: () => void;
  onComplete: (exp: number) => void;
  key?: string;
}

export function QuizView({ type, onClose, onComplete }: QuizViewProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [lives, setLives] = useState(3);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    async function loadQuiz() {
      const q = await generateQuiz(type, 'easy'); // Default to easy for now
      setQuestions(q);
      setLoading(false);
    }
    loadQuiz();
  }, [type]);

  const handleOptionClick = (option: string) => {
    if (selectedOption || finished) return;
    setSelectedOption(option);
    const correct = option === questions[currentIndex].correctAnswer;
    setIsCorrect(correct);
    if (correct) {
      setScore(s => s + 1);
    } else {
      setLives(l => Math.max(0, l - 1));
    }
  };

  const handleNext = async () => {
    if (currentIndex < questions.length - 1 && lives > 0) {
      setCurrentIndex(c => c + 1);
      setSelectedOption(null);
      setIsCorrect(null);
    } else {
      // Finish quiz
      setFinished(true);
      await saveResults();
    }
  };

  const saveResults = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const gainedExp = score * 20;
    
    // Save attempt
    await addDoc(collection(db, 'users', user.uid, 'attempts'), {
      userId: user.uid,
      quizType: type,
      score,
      totalQuestions: questions.length,
      timestamp: new Date().toISOString(), // In real app, use serverTimestamp
      difficulty: 'easy'
    });

    // Update user profile
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
       const data = userSnap.data();
       const newExp = (data.totalExp || 0) + gainedExp;
       const newLevel = Math.floor(newExp / 500) + 1;
       
       await updateDoc(userRef, {
         totalExp: newExp,
         level: newLevel
       });
    }

    onComplete(gainedExp);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center shadow-xl border-4 border-sky-100 flex flex-col items-center gap-4">
        <Loader2 className="w-12 h-12 text-sky-500 animate-spin" />
        <p className="text-xl font-bold text-sky-600">Generating your super quiz...</p>
      </div>
    );
  }

  if (finished || lives === 0) {
    return (
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-[40px] p-8 text-center brutal-border brutal-shadow-lg"
      >
        <div className="w-24 h-24 bg-brand-yellow brutal-border rounded-full flex items-center justify-center mx-auto mb-6 brutal-shadow-sm">
          <Trophy className="w-12 h-12 text-brand-dark" />
        </div>
        <h2 className="text-4xl font-black mb-2 uppercase italic tracking-tighter">Mission Complete!</h2>
        <p className="text-xl font-bold text-slate-500 mb-8 lowercase italic">
          You got <span className="text-brand-blue font-black">{score}</span> out of {questions.length} correct!
        </p>
        
        <div className="bg-brand-blue/10 brutal-border border-brand-blue p-8 rounded-3xl mb-8 brutal-shadow-sm">
          <p className="text-brand-blue font-black text-xs uppercase tracking-widest mb-1">XP EARNED</p>
          <p className="text-5xl font-black text-brand-blue">+{score * 20}</p>
        </div>

        <button 
          onClick={onClose}
          className="w-full bg-brand-yellow border-4 border-black text-brand-dark font-black text-2xl py-5 rounded-2xl brutal-shadow transition transform hover:scale-[1.02] active:scale-95 uppercase tracking-tight"
        >
          CLAIM REWARD
        </button>
      </motion.div>
    );
  }

  const currentQuestion = questions[currentIndex];

  return (
    <div className="bg-white rounded-[40px] p-6 sm:p-10 brutal-border brutal-shadow-lg relative overflow-hidden">
      {/* Header Info */}
      <div className="flex items-center justify-between mb-10">
        <button onClick={onClose} className="w-10 h-10 bg-slate-50 brutal-border rounded-full flex items-center justify-center hover:bg-brand-red hover:text-white transition-colors">
          <X size={20} />
        </button>
        <div className="flex gap-2">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              initial={false}
              animate={{ scale: i < lives ? [1, 1.2, 1] : 1 }}
            >
              <Heart 
                className={`w-10 h-10 ${i < lives ? 'text-brand-red fill-brand-red' : 'text-slate-200 fill-slate-200'} transition-colors duration-500`} 
              />
            </motion.div>
          ))}
        </div>
        <div className="bg-brand-dark text-white px-5 py-2 rounded-full font-black text-xs tracking-widest uppercase">
          {currentIndex + 1} / {questions.length}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 brutal-border h-6 rounded-full mb-12 overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          className="bg-brand-blue h-full border-r-2 border-black"
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -50, opacity: 0 }}
          className="space-y-8"
        >
          <div className="relative">
            <div className="absolute -top-6 -left-6 w-12 h-12 bg-brand-yellow brutal-border rounded-xl flex items-center justify-center brutal-shadow-sm rotate-[-10deg]">
              <Sparkles size={24} />
            </div>
            <h3 className="text-3xl sm:text-4xl font-black text-center leading-none uppercase tracking-tighter mb-12 px-4">
              {currentQuestion.question}
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {currentQuestion.options.map((option, idx) => (
              <motion.button
                key={idx}
                whileHover={{ y: selectedOption ? 0 : -4 }}
                whileTap={{ scale: selectedOption ? 1 : 0.98 }}
                onClick={() => handleOptionClick(option)}
                className={`
                  p-6 rounded-2xl text-xl font-black border-4 transition-all text-left flex items-center justify-between brutal-shadow-sm
                  ${selectedOption === option 
                    ? (isCorrect ? 'bg-brand-green border-black text-white' : 'bg-brand-red border-black text-white')
                    : 'bg-white border-black hover:bg-slate-50 text-brand-dark'
                  }
                  ${selectedOption && option === currentQuestion.correctAnswer && !isCorrect ? 'bg-brand-green border-black text-white animate-pulse' : ''}
                `}
              >
                <span>{option}</span>
                {selectedOption === option && (
                  isCorrect ? <CheckCircle2 className="text-white" /> : <AlertCircle className="text-white" />
                )}
                {selectedOption && option === currentQuestion.correctAnswer && !isCorrect && (
                  <CheckCircle2 className="text-white" />
                )}
              </motion.button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="h-32 flex items-center justify-center mt-12">
        <AnimatePresence>
          {selectedOption && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="w-full flex flex-col items-center gap-6"
            >
              {currentQuestion.explanation && (
                 <div className={`p-4 rounded-xl border-2 border-black border-dashed ${isCorrect ? 'bg-brand-green/10 text-brand-green' : 'bg-brand-red/10 text-brand-red'} font-black text-sm uppercase tracking-tight text-center max-w-lg`}>
                    "{currentQuestion.explanation}"
                 </div>
              )}
              <button 
                onClick={handleNext}
                className="bg-brand-yellow border-4 border-black text-brand-dark font-black text-xl py-4 px-12 rounded-2xl brutal-shadow flex items-center gap-3 transition hover:scale-105 active:scale-95 uppercase"
              >
                {currentIndex === questions.length - 1 ? 'FINISH BLAST' : 'NEXT MISSION'}
                <ChevronRight size={24} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Decorative SVG */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-brand-blue opacity-10 rounded-full border-8 border-black animate-spin-slow" style={{ animationDuration: '20s' }} />
      <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-brand-pink opacity-10 rounded-full border-8 border-black animate-pulse" />
    </div>
  );
}
