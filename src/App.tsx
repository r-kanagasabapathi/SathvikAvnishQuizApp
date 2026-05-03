import { useState, useEffect } from 'react';
import { auth, db } from './lib/firebase';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { Brain, Calculator, SpellCheck, Trophy, Settings, Star, Rocket, User, LogOut } from 'lucide-react';
import { QuizView } from './components/QuizView';
import { ParentDashboard } from './components/ParentDashboard';
import { RewardSystem } from './components/RewardSystem';

export interface ChildProfile {
  uid: string;
  displayName: string;
  totalExp: number;
  level: number;
  badges: string[];
  role: 'child' | 'parent';
  avatar: string;
}

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<ChildProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'home' | 'quiz' | 'parent' | 'rewards'>('home');
  const [selectedQuiz, setSelectedQuiz] = useState<'math' | 'brain' | 'spelling' | 'vocabulary' | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const docRef = doc(db, 'users', u.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setProfile({ uid: u.uid, ...docSnap.data() } as ChildProfile);
        } else {
          const newProfile: Partial<ChildProfile> = {
            displayName: u.displayName || 'Hero',
            totalExp: 0,
            level: 1,
            badges: [],
            role: 'child',
            avatar: '🚀'
          };
          await setDoc(docRef, newProfile);
          setProfile({ uid: u.uid, ...newProfile } as ChildProfile);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error("Login failed", err);
    }
  };

  const handleLogout = () => {
    auth.signOut();
    setView('home');
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-sky-100 font-sans">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2 }}>
          <Rocket className="text-sky-500 w-12 h-12" />
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen w-screen bg-sky-400 flex flex-col items-center justify-center p-6 text-white text-center font-sans">
        <motion.div
           initial={{ scale: 0.5, opacity: 0 }}
           animate={{ scale: 1, opacity: 1 }}
           className="bg-white p-8 rounded-3xl shadow-xl text-sky-900 max-w-sm w-full"
        >
          <Brain className="w-20 h-20 text-sky-500 mx-auto mb-6" />
          <h1 className="text-4xl font-black mb-2">BrainQuest Jr.</h1>
          <p className="text-lg opacity-80 mb-8">Ready for a super cool adventure?</p>
          <button 
            onClick={handleLogin}
            className="w-full bg-sky-500 hover:bg-sky-600 text-white font-bold py-4 px-8 rounded-2xl transition duration-200 transform hover:scale-105 active:scale-95 flex items-center justify-center gap-3"
          >
            <User size={20} />
            Sign in with Google
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-yellow text-brand-dark font-sans selection:bg-brand-red selection:text-white p-4 sm:p-8">
      <nav className="max-w-5xl mx-auto mb-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 cursor-pointer group" onClick={() => setView('home')}>
          <div className="w-16 h-16 bg-brand-red brutal-border rounded-2xl flex items-center justify-center brutal-shadow transition-transform group-hover:rotate-6">
            <Brain size={32} className="text-white" />
          </div>
          <div>
            <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-tighter leading-none text-brand-dark">Brain Blasters!</h1>
            <p className="text-lg font-black text-brand-red italic">Welcome Sathvik Avnish!</p>
          </div>
        </div>

        <div className="bg-white brutal-border p-4 rounded-[32px] brutal-shadow flex items-center gap-6">
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-black uppercase">Level</span>
            <span className="text-3xl font-black text-brand-blue">{profile?.level || 1}</span>
          </div>
          <div className="hidden sm:block">
            <div className="w-48 h-6 bg-slate-100 border-2 border-black rounded-full overflow-hidden">
               <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${((profile?.totalExp || 0) % 500) / 5}%` }}
                className="h-full bg-brand-green border-r-2 border-black shadow-[inset_-2px_0px_0px_0px_rgba(0,0,0,0.1)]"
               />
            </div>
            <div className="flex justify-between mt-1 px-1">
              <span className="text-[9px] font-bold uppercase">XP Journey</span>
              <span className="text-[9px] font-bold uppercase">{(profile?.totalExp || 0) % 500} / 500</span>
            </div>
          </div>
          <div className="flex gap-2">
             <button onClick={() => setView('rewards')} className="w-10 h-10 bg-brand-yellow brutal-border rounded-full flex items-center justify-center transition-transform hover:scale-110 active:scale-95" title="Rewards">
                <Trophy size={20} />
             </button>
             {profile?.role === 'parent' && (
               <button onClick={() => setView('parent')} className="w-10 h-10 bg-slate-100 brutal-border rounded-full flex items-center justify-center transition-transform hover:scale-110 active:scale-95" title="Parent Dashboard">
                  <Settings size={20} />
               </button>
             )}
             <button onClick={handleLogout} className="w-10 h-10 bg-brand-red/10 brutal-border border-rose-500 rounded-full flex items-center justify-center transition-transform hover:scale-110 active:scale-95 text-rose-500" title="Logout">
                <LogOut size={20} />
             </button>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto">
        <AnimatePresence mode="wait">
          {view === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="space-y-12"
            >
              <h2 className="text-3xl font-black uppercase italic underline decoration-8 decoration-brand-red underline-offset-4 mb-8">Choose Your Mission</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <QuizCard 
                  title="MATH MAZE" 
                  description="Master numbers & win big!" 
                  icon={<Calculator className="w-10 h-10" />}
                  color="bg-brand-blue"
                  diff="01"
                  onClick={() => { setSelectedQuiz('math'); setView('quiz'); }}
                />
                <QuizCard 
                  title="BRAIN BONUS" 
                  description="Logic riddles for power!" 
                  icon={<Brain className="w-10 h-10" />}
                  color="bg-brand-purple"
                  diff="02"
                  onClick={() => { setSelectedQuiz('brain'); setView('quiz'); }}
                />
                <QuizCard 
                  title="WORD WIZARD" 
                  description="Spell magic word sets!" 
                  icon={<SpellCheck className="w-10 h-10" />}
                  color="bg-brand-green"
                  diff="01"
                  onClick={() => { setSelectedQuiz('spelling'); setView('quiz'); }}
                />
                <QuizCard 
                  title="PIZZA PARTY" 
                  description="Vocab Master Fun!" 
                  icon={<Star className="w-10 h-10" />}
                  color="bg-brand-pink"
                  diff="03"
                  onClick={() => { setSelectedQuiz('vocabulary'); setView('quiz'); }}
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                 <section className="lg:col-span-8 bg-white brutal-border p-8 rounded-[40px] brutal-shadow flex flex-col sm:flex-row items-center gap-8 group">
                   <div className="bg-brand-yellow w-24 h-24 rounded-3xl brutal-border flex items-center justify-center brutal-shadow-sm group-hover:rotate-12 transition-transform">
                      <Rocket className="w-12 h-12 text-brand-dark animate-bounce" />
                   </div>
                   <div className="flex-1 text-center sm:text-left">
                     <h3 className="text-2xl font-black uppercase mb-1">Weekly Adventure Challenge</h3>
                     <p className="text-slate-600 font-bold mb-4 italic">"Solve 5 quizzes to unlock a rare Astro-Fox avatar!"</p>
                     <div className="w-full bg-slate-100 brutal-border h-8 rounded-2xl overflow-hidden relative">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: '40%' }}
                          className="h-full bg-brand-blue border-r-2 border-black"
                        />
                        <span className="absolute inset-0 flex items-center justify-center text-xs font-black uppercase tracking-widest text-brand-dark mix-blend-overlay">2 / 5 COMPLETED</span>
                     </div>
                   </div>
                 </section>

                 <aside className="lg:col-span-4 bg-white brutal-border p-6 rounded-[40px] brutal-shadow flex flex-col items-center">
                    <h3 className="text-xl font-black uppercase mb-4 underline decoration-4 decoration-brand-yellow">Locked Heroes</h3>
                    <div className="grid grid-cols-2 gap-4 w-full">
                       <HeroIcon icon="🦊" label="Astro Fox" bg="bg-brand-yellow" unlocked />
                       <HeroIcon icon="🦁" label="Neon Lion" bg="bg-slate-100" />
                       <HeroIcon icon="🦉" label="Space Owl" bg="bg-slate-100" />
                       <HeroIcon icon="🐉" label="Zen Dragon" bg="bg-slate-100" />
                    </div>
                 </aside>
              </div>
            </motion.div>
          )}

          {view === 'quiz' && selectedQuiz && (
            <QuizView 
              key="quiz"
              type={selectedQuiz} 
              onClose={() => setView('home')} 
              onComplete={() => {
                 setView('rewards');
              }}
            />
          )}

          {view === 'rewards' && (
            <RewardSystem key="rewards" onClose={() => setView('home')} profile={profile} />
          )}

          {view === 'parent' && (
            <ParentDashboard key="parent" profile={profile} onClose={() => setView('home')} />
          )}
        </AnimatePresence>
      </main>
      
      <footer className="mt-20 max-w-lg mx-auto">
        <nav className="bg-white brutal-border rounded-full px-8 py-3 brutal-shadow flex justify-around">
           <FooterLink icon="🏠" label="Home" active={view === 'home'} onClick={() => setView('home')} />
           <FooterLink icon="📊" label="Stats" active={view === 'parent'} onClick={() => setView('parent')} />
           <FooterLink icon="🎒" label="Items" onClick={() => {}} />
           <FooterLink icon="🏆" label="Ranks" active={view === 'rewards'} onClick={() => setView('rewards')} />
        </nav>
      </footer>
    </div>
  );
}

function QuizCard({ title, description, icon, color, onClick, diff }: any) {
  return (
    <motion.div
      whileHover={{ y: -8 }}
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className={`${color} brutal-border p-6 rounded-[40px] text-white flex flex-col justify-between h-80 brutal-shadow-lg transition-all relative overflow-hidden group`}
    >
      <div className="flex justify-between items-start relative z-10">
        <div className="bg-white w-14 h-14 rounded-full border-4 border-black flex items-center justify-center text-brand-dark brutal-shadow-sm group-hover:rotate-12 transition-transform">
          {icon}
        </div>
        <span className="bg-black text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">DIFFICULTY: {diff || '01'}</span>
      </div>
      
      <div className="relative z-10">
        <h3 className="text-3xl font-black leading-none mb-2 uppercase break-words">{title}</h3>
        <p className="text-white/90 font-bold text-sm mb-6 leading-tight">{description}</p>
        <button 
          onClick={onClick}
          className="w-full bg-brand-yellow border-2 border-black py-3 rounded-2xl font-black text-xl text-brand-dark brutal-shadow-sm active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all uppercase tracking-tight"
        >
          START
        </button>
      </div>
      
      {/* Background flare */}
      <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-1000" />
    </motion.div>
  );
}

function HeroIcon({ icon, label, bg, unlocked }: any) {
  return (
    <div className={`${bg} rounded-3xl brutal-border p-3 flex flex-col items-center justify-center border-dashed ${!unlocked && 'opacity-40 grayscale'} transition-all hover:scale-105`}>
       <div className={`w-12 h-12 rounded-full mb-1 flex items-center justify-center text-2xl ${unlocked ? 'bg-white' : 'bg-slate-200'}`}>
         {unlocked ? icon : '🔒'}
       </div>
       <span className="text-[8px] font-black uppercase text-center">{unlocked ? label : 'LOCKED'}</span>
    </div>
  );
}

function FooterLink({ icon, label, active, onClick }: any) {
  return (
    <button onClick={onClick} className="flex flex-col items-center group transition-transform hover:scale-110 active:scale-95">
      <span className="text-2xl mb-1 group-hover:filter grayscale-0 group-hover:grayscale-0 transition">{icon}</span>
      <span className={`text-[10px] font-black uppercase ${active ? 'text-brand-blue underline decoration-2' : 'text-slate-400 group-hover:text-brand-dark'}`}>{label}</span>
    </button>
  );
}
