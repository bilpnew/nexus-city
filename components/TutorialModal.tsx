
import React from 'react';
import { X, User, Car, Target, TrendingUp, Heart, Zap, Shield, Star, Award } from 'lucide-react';

interface TutorialModalProps {
  onClose: () => void;
}

const TutorialModal: React.FC<TutorialModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="glass max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-[3rem] border border-white/10 p-10 relative scrollbar-hide">
        <button 
          onClick={onClose}
          className="absolute top-8 right-8 text-zinc-500 hover:text-white transition-colors"
        >
          <X size={32} />
        </button>

        <div className="mb-12 text-center">
          <h2 className="text-5xl font-orbitron font-black italic tracking-tighter mb-4">SYNDICATE <span className="text-cyan-400">HANDBOOK</span></h2>
          <p className="text-zinc-500 font-mono text-sm tracking-widest uppercase">Unauthorized reading is a criminal offense.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-cyan-500/10 rounded-2xl text-cyan-400"><User /></div>
              <h3 className="font-orbitron font-black text-xl italic uppercase tracking-tighter">1. Build Your Crew</h3>
            </div>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Use the <span className="text-cyan-400 font-bold">Crew</span> tab to recruit operatives. Type a description and our AI will generate a unique character with randomized stats. Infiltrators, hackers, and bruisers are essential.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-yellow-400/10 rounded-2xl text-yellow-400"><Car /></div>
              <h3 className="font-orbitron font-black text-xl italic uppercase tracking-tighter">2. Assemble the Fleet</h3>
            </div>
            <p className="text-zinc-400 text-sm leading-relaxed">
              A high-stakes syndicate needs speed. Use the <span className="text-yellow-400 font-bold">Garage</span> to build custom hyper-cars. Higher speed and armor help during heavy combat and driving missions.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-red-500/10 rounded-2xl text-red-500"><Target /></div>
              <h3 className="font-orbitron font-black text-xl italic uppercase tracking-tighter">3. Contracts & Risks</h3>
            </div>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Missions are live simulations. Watch as your <span className="text-red-500 font-bold">Vitality</span> drops and <span className="text-cyan-400 font-bold">Progress</span> grows. If Vitality hits 0%, the operation is botched. Choose difficulty wisely!
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-400"><Award /></div>
              <h3 className="font-orbitron font-black text-xl italic uppercase tracking-tighter">4. Prestige Levels</h3>
            </div>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Successfully completing a contract unlocks <span className="text-purple-400 font-bold">Prestige Levels</span>. Replaying a mission at a higher Prestige Tier increases enemy lethality and reduces tactical windows, but provides <span className="text-emerald-400 font-bold">exponential reward multipliers</span> and exclusive syndicate XP.
            </p>
          </div>
        </div>

        <div className="mt-16 p-8 bg-zinc-900/50 rounded-3xl border border-white/5 space-y-6">
          <h4 className="font-orbitron font-black text-lg italic uppercase tracking-widest text-white flex items-center gap-3">
            <Zap size={20} className="text-cyan-400" /> Operational Warnings
          </h4>
          <ul className="space-y-3 text-xs font-mono text-zinc-500">
            <li className="flex gap-3"><span className="text-red-500">!!</span> Watch the <span className="text-red-400">CRITICAL WINDOW</span> timer. Extraction is impossible if it hits zero.</li>
            <li className="flex gap-3"><span className="text-red-500">!!</span> Heat Level (Notoriety) increases with failures. High Heat makes the HUD unstable.</li>
            <li className="flex gap-3"><span className="text-red-500">!!</span> Reaching <span className="text-purple-400">Prestige V</span> on any contract marks you as a local legend, reducing police response times in that sector.</li>
          </ul>
        </div>

        <button 
          onClick={onClose}
          className="mt-12 w-full bg-cyan-500 text-black py-5 rounded-2xl font-black text-sm hover:bg-white transition-all transform hover:scale-[1.02] uppercase tracking-[0.3em] shadow-2xl"
        >
          I UNDERSTAND // DISMISS
        </button>
      </div>
    </div>
  );
};

export default TutorialModal;
