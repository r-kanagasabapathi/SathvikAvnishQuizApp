import { motion } from 'motion/react';
import { Trophy, Star, Shield, Zap, Medal, Rocket, X, Crown } from 'lucide-react';
import { ChildProfile } from '../App';

interface RewardSystemProps {
  profile: ChildProfile | null;
  onClose: () => void;
  key?: string;
}

const BADGES = [
  { id: 'math_starter', name: 'Math Shield', description: 'Solved your first math quiz!', icon: <Shield size={32} />, color: 'bg-emerald-500' },
  { id: 'fast_learner', name: 'Super Zap', description: 'Got 100% on a quiz!', icon: <Zap size={32} />, color: 'bg-amber-500' },
  { id: 'speller', name: 'Word Crown', description: 'Finished a spelling challenge!', icon: <Crown size={32} />, color: 'bg-indigo-500' },
  { id: 'level_5', name: 'Galaxy Medal', description: 'Reached Level 5!', icon: <Medal size={32} />, color: 'bg-sky-500' },
  { id: 'hero', name: 'Grand Trophy', description: 'Earned 1000 XP!', icon: <Trophy size={32} />, color: 'bg-rose-500' },
];

export function RewardSystem({ profile, onClose }: RewardSystemProps) {
  const currentExp = profile?.totalExp || 0;
  const currentLevel = profile?.level || 1;
  const nextLevelExp = currentLevel * 500;
  const progressPercent = ((currentExp % 500) / 500) * 100;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-10 pb-12"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-4xl font-black uppercase italic underline decoration-[12px] decoration-brand-blue underline-offset-8">Hall of Fame</h2>
        <button onClick={onClose} className="w-12 h-12 bg-white brutal-border rounded-full flex items-center justify-center hover:bg-brand-red hover:text-white transition-colors brutal-shadow-sm active:shadow-none translate-y-0 active:translate-y-0.5">
          <X size={24} />
        </button>
      </div>

      {/* Level Card */}
      <section className="bg-white p-8 sm:p-12 rounded-[50px] brutal-border brutal-shadow-lg overflow-hidden relative">
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="text-center sm:text-left">
            <div className="inline-block bg-brand-pink text-white px-6 py-2 rounded-full text-sm font-black mb-4 brutal-border brutal-shadow-sm uppercase tracking-widest">
              GALAXY EXPLORER
            </div>
            <div className="flex items-baseline gap-4 mb-6">
               <span className="text-8xl font-black text-brand-dark tracking-tighter leading-none">{currentLevel}</span>
               <span className="text-2xl font-black text-slate-400 uppercase italic">LEVEL</span>
            </div>
            <p className="text-xl font-bold text-slate-500 mb-8 max-w-sm">You are <span className="text-brand-pink underline decoration-4 underline-offset-4">unstoppable</span>! {500 - (currentExp % 500)} more XP to reach your next evolution!</p>
            
            <div className="space-y-3">
              <div className="flex justify-between text-xs font-black uppercase tracking-widest text-slate-400">
                <span>Start</span>
                <span>{currentExp % 500} / 500 XP</span>
                <span>Next</span>
              </div>
              <div className="w-full bg-slate-100 brutal-border h-10 rounded-2xl p-1 relative overflow-hidden">
                <motion.div 
                   initial={{ width: 0 }}
                   animate={{ width: `${progressPercent}%` }}
                   className="h-full bg-brand-green border-r-4 border-black box-content"
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-center">
            <div className="w-56 h-56 bg-brand-blue rounded-full flex items-center justify-center brutal-border brutal-shadow-lg relative animate-bounce-slow">
               <Rocket className="w-28 h-28 text-white drop-shadow-[4px_4px_0px_rgba(0,0,0,0.2)]" />
               <div className="absolute -top-4 -right-4 bg-brand-yellow w-20 h-20 rounded-full brutal-border brutal-shadow-sm flex items-center justify-center rotate-12">
                 <Star className="text-brand-dark fill-brand-dark" size={32} />
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Badges Section */}
      <section>
        <h3 className="text-2xl font-black mb-8 uppercase italic flex items-center gap-4">
           Unlocked Loot
           <div className="h-1 flex-1 bg-brand-dark rounded-full opacity-10" />
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
          {BADGES.map((badge, idx) => {
            const isUnlocked = currentExp >= (idx + 1) * 200;
            return (
              <motion.div
                key={badge.id}
                whileHover={isUnlocked ? { scale: 1.05, rotate: 2 } : {}}
                className={`
                  p-6 rounded-[32px] flex flex-col items-center text-center transition-all brutal-border
                  ${isUnlocked 
                    ? `${badge.color} text-white brutal-shadow` 
                    : 'bg-slate-100 text-slate-300 border-slate-200 grayscale opacity-40'
                  }
                `}
              >
                <div className={`w-16 h-16 rounded-2xl mb-4 flex items-center justify-center brutal-border ${isUnlocked ? 'bg-white text-brand-dark brutal-shadow-sm' : 'bg-slate-50 border-slate-200'}`}>
                  {badge.icon}
                </div>
                <h4 className="font-black text-sm uppercase leading-tight mb-1 tracking-tighter">{badge.name}</h4>
                <p className="text-[10px] font-bold opacity-80 leading-tight italic uppercase">{badge.description}</p>
                {!isUnlocked && (
                   <div className="mt-3 text-[10px] font-black text-slate-400 bg-slate-200 px-2 py-0.5 rounded-full">
                     {(idx + 1) * 200} XP
                   </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </section>
    </motion.div>
  );
}
