import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { db, auth } from '../lib/firebase';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { LineChart, BarChart, Activity, User as UserIcon, Calendar, ArrowLeft, Loader2, TrendingUp, BookOpen, Settings } from 'lucide-react';
import { ChildProfile } from '../App';

interface ParentDashboardProps {
  profile: ChildProfile | null;
  onClose: () => void;
  key?: string;
}

interface Attempt {
  id: string;
  quizType: string;
  score: number;
  totalQuestions: number;
  timestamp: string;
  difficulty: string;
}

export function ParentDashboard({ profile, onClose }: ParentDashboardProps) {
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      const user = auth.currentUser;
      if (!user) return;

      const q = query(
        collection(db, 'users', user.uid, 'attempts'),
        orderBy('timestamp', 'desc'),
        limit(20)
      );

      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Attempt));
      setAttempts(data);
      setLoading(false);
    }
    fetchStats();
  }, []);

  const avgScore = attempts.length > 0 
    ? Math.round((attempts.reduce((acc, curr) => acc + (curr.score / curr.totalQuestions), 0) / attempts.length) * 100)
    : 0;

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-10"
    >
      <div className="flex items-center justify-between">
        <button onClick={onClose} className="bg-white brutal-border px-6 py-3 rounded-2xl flex items-center gap-2 text-brand-dark font-black hover:bg-slate-50 transition brutal-shadow-sm active:shadow-none translate-y-0 active:translate-y-0.5">
          <ArrowLeft size={18} />
          BACK TO MISSION
        </button>
        <h2 className="text-3xl font-black uppercase italic tracking-tighter text-brand-dark">Parent Command Center</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <StatCard 
          title="Battle Accuracy" 
          value={`${avgScore}%`} 
          icon={<TrendingUp className="text-white" />} 
          bg="bg-brand-green"
          subtitle="Precision on the field"
        />
        <StatCard 
          title="Missions Completed" 
          value={attempts.length.toString()} 
          icon={<Activity className="text-white" />} 
          bg="bg-brand-blue"
          subtitle="Active duty time"
        />
        <StatCard 
          title="Explorer Rank" 
          value={profile?.level || 1} 
          icon={<UserIcon className="text-white" />} 
          bg="bg-brand-purple"
          subtitle="Journey milestone"
        />
      </div>

      <div className="bg-white brutal-border rounded-[40px] brutal-shadow-lg overflow-hidden">
        <div className="p-8 border-b-4 border-black flex items-center justify-between bg-slate-50">
          <h3 className="text-2xl font-black text-brand-dark uppercase flex items-center gap-3">
            <BookOpen size={24} className="text-brand-blue" />
            Mission Log
          </h3>
          <span className="bg-brand-yellow brutal-border px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">REAL-TIME TELEMETRY</span>
        </div>
        
        <div className="overflow-x-auto">
          {loading ? (
             <div className="p-20 flex justify-center">
               <Loader2 className="animate-spin text-brand-blue w-12 h-12" />
             </div>
          ) : attempts.length === 0 ? (
             <div className="p-20 text-center text-slate-400 font-black uppercase italic tracking-widest">
               No data received from the mission field.
             </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-500 text-[10px] uppercase tracking-widest font-black border-b-4 border-black">
                  <th className="px-8 py-5">Mission Type</th>
                  <th className="px-8 py-5">Result</th>
                  <th className="px-8 py-5">Stardate</th>
                  <th className="px-8 py-5 text-right">Success Rate</th>
                </tr>
              </thead>
              <tbody>
                {attempts.map((attempt) => (
                  <tr key={attempt.id} className="border-b-2 border-slate-100 hover:bg-slate-50 transition group">
                    <td className="px-8 py-6">
                       <span className="font-black uppercase text-sm group-hover:text-brand-blue transition-colors">{attempt.quizType}</span>
                    </td>
                    <td className="px-8 py-6 font-bold text-slate-600 text-lg">{attempt.score} / {attempt.totalQuestions}</td>
                    <td className="px-8 py-6 text-xs text-slate-400 font-bold font-mono">
                      {new Date(attempt.timestamp).toLocaleDateString()}
                    </td>
                    <td className="px-8 py-6 text-right">
                       <span className={`brutal-border px-5 py-2 rounded-full text-xs font-black uppercase brutal-shadow-sm ${
                         (attempt.score / attempt.totalQuestions >= 0.8) ? 'bg-brand-green text-white' : 
                         (attempt.score / attempt.totalQuestions >= 0.5) ? 'bg-brand-yellow text-brand-dark' : 'bg-brand-red text-white'
                       }`}>
                         {Math.round((attempt.score / attempt.totalQuestions) * 100)}%
                       </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="bg-brand-dark brutal-border rounded-[40px] p-10 text-white relative overflow-hidden brutal-shadow-lg">
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
          <div className="bg-brand-blue w-24 h-24 rounded-3xl brutal-border border-white flex items-center justify-center rotate-[-5deg]">
            <Settings size={48} className="text-white animate-spin-slow" style={{ animationDuration: '4s' }} />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-3xl font-black mb-2 uppercase italic tracking-tighter">Strategic Insights</h3>
            <p className="text-slate-400 font-bold text-lg max-w-2xl">Based on recent performance, BrainQuest Jr. recommends focusing on <span className="text-brand-yellow font-black">Word Power</span> missions to balance your son's skillset.</p>
          </div>
          <button className="bg-brand-red brutal-border border-white text-white font-black py-4 px-10 rounded-2xl hover:bg-brand-red transition transform active:scale-95 brutal-shadow-sm border-shadow-white whitespace-nowrap uppercase tracking-widest text-sm">
            Unlock Full Analytics
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function StatCard({ title, value, icon, subtitle, bg }: any) {
  return (
    <div className="bg-white brutal-border p-8 rounded-[40px] brutal-shadow flex items-center gap-8 group">
      <div className={`${bg} w-16 h-16 rounded-2xl brutal-border flex items-center justify-center brutal-shadow-sm group-hover:rotate-6 transition-transform shadow-[2px_2px_0px_0px_white]`}>
        {icon}
      </div>
      <div>
        <p className="text-[10px] uppercase tracking-widest font-black text-slate-400 mb-1">{title}</p>
        <p className="text-5xl font-black text-brand-dark leading-none mb-1 tracking-tighter">{value}</p>
        <p className="text-xs font-bold text-slate-400 italic font-mono uppercase">{subtitle}</p>
      </div>
    </div>
  );
}
