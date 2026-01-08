
import React, { useState } from 'react';
import { Mission, Character } from '../types';
import { 
  Database, Eye, Swords, Car, Target, Loader2, 
  ChevronRight, CheckCircle2, XCircle, Clock, 
  Heart, Activity, Binary, AlertCircle, Users, Sparkles, RefreshCcw
} from 'lucide-react';

interface MissionViewProps {
  missions: Mission[];
  characters: Character[];
  onAccept: (id: string, characterId: string) => void;
  onResolveEvent: (missionId: string, optionIndex: number) => void;
  onGenerateMission: (theme: string) => void;
  isGenerating: boolean;
  onShowTutorial: () => void;
  onReplay: (id: string) => void;
}

const MissionView: React.FC<MissionViewProps> = ({ 
  missions, characters, onAccept, onResolveEvent, onGenerateMission, isGenerating, onShowTutorial, onReplay 
}) => {
  const [selectedChar, setSelectedChar] = useState<Record<string, string>>({});
  const [customTheme, setCustomTheme] = useState('');

  const getIcon = (type: Mission['type']) => {
    switch (type) {
      case 'Heist': return <Database className="text-gold" />;
      case 'Stealth': return <Eye className="text-purple-400" />;
      case 'Combat': return <Swords className="text-red-500" />;
      case 'Driving': return <Car className="text-cyan-400" />;
      case 'Hacking': return <Binary className="text-emerald-400" />;
      default: return <Target />;
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700 h-full flex flex-col pb-20">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div>
          <h2 className="text-5xl font-orbitron font-black italic tracking-tighter uppercase">CONTRACT <span className="text-red-600">FEED</span></h2>
          <div className="flex gap-4 items-center mt-2">
            <p className="text-zinc-500 font-mono text-[10px] tracking-[0.3em] uppercase">// DATA LINK ENCRYPTED</p>
          </div>
        </div>
        
        <div className="flex gap-2 w-full lg:w-auto">
          <input 
            type="text" 
            placeholder="Custom Operation Theme..."
            className="flex-1 lg:w-80 bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-3 text-xs focus:outline-none focus:border-cyan-500 shadow-inner"
            value={customTheme}
            onChange={(e) => setCustomTheme(e.target.value)}
          />
          <button 
            disabled={isGenerating || !customTheme}
            onClick={() => { onGenerateMission(customTheme); setCustomTheme(''); }}
            className="bg-cyan-500 hover:bg-cyan-400 disabled:bg-zinc-800 text-black px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg flex items-center gap-2 transition-all active:scale-95"
          >
            {isGenerating ? <Loader2 className="animate-spin" size={14} /> : <><Sparkles size={14} /> GENERATE</>}
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {missions.map((mission) => (
          <div 
            key={mission.id} 
            className={`glass p-8 rounded-[2.5rem] relative flex flex-col border border-white/5 transition-all duration-500 group ${
              mission.status === 'in-progress' ? 'border-cyan-500/50 scale-[1.02] shadow-[0_0_50px_rgba(6,182,212,0.1)]' : 
              mission.status === 'completed' ? 'opacity-80 border-emerald-500/30' :
              mission.status === 'failed' ? 'border-red-500/50' : 'hover:border-white/20'
            }`}
          >
            <div className="flex justify-between items-start mb-6">
              <div className="p-4 bg-zinc-900 rounded-2xl shadow-xl group-hover:scale-110 transition-transform">
                {getIcon(mission.type)}
              </div>
              <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                mission.difficulty === 'Legendary' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'bg-white/5 text-zinc-400'
              }`}>
                {mission.difficulty}
              </div>
            </div>

            <h3 className="text-2xl font-orbitron font-black italic uppercase mb-2 tracking-tighter">{mission.title}</h3>
            <p className="text-[13px] text-zinc-500 italic h-12 line-clamp-2 overflow-hidden mb-8 leading-relaxed">"{mission.hook}"</p>

            {mission.status === 'in-progress' && (
              <div className="space-y-6 mb-8 bg-black/60 p-6 rounded-3xl border border-white/5 relative overflow-hidden shadow-2xl">
                {mission.activeEvent ? (
                  <div className="animate-in zoom-in duration-300">
                    <div className="flex items-center gap-2 text-red-500 text-[10px] font-black uppercase mb-4">
                      <AlertCircle size={14} className="animate-pulse" /> TACTICAL EVENT
                    </div>
                    <p className="text-xs text-white font-bold italic mb-6 leading-relaxed">{mission.activeEvent.description}</p>
                    <div className="space-y-2">
                      {mission.activeEvent.options.map((opt, idx) => (
                        <button key={idx} onClick={() => onResolveEvent(mission.id, idx)} className="w-full bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-3 text-left transition-all active:scale-95">
                          <div className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-1">{opt.label}</div>
                          <div className="text-[9px] text-zinc-400">{opt.detail}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-2 text-cyan-400 text-xs font-black italic animate-pulse">
                        <Loader2 size={16} className="animate-spin" /> {mission.type === 'Combat' ? 'ENGAGING' : 'EXECUTING'}...
                      </div>
                      <div className="text-[10px] text-zinc-500 font-mono flex items-center gap-2">
                         <Clock size={12} /> {(mission.endTime ? Math.max(0, Math.floor((mission.endTime - Date.now()) / 1000)) : 0)}s
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] font-black text-red-500 uppercase tracking-widest">
                          <span className="flex items-center gap-1"><Heart size={10} /> CREW_VITALS</span>
                          <span>{Math.floor(mission.health || 100)}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden border border-white/5">
                          <div className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-500" style={{ width: `${mission.health}%` }} />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] font-black text-cyan-400 uppercase tracking-widest">
                          <span className="flex items-center gap-1"><Activity size={10} /> SYNC_PROGRESS</span>
                          <span>{Math.floor(mission.progress || 0)}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden border border-white/5">
                          <div className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 transition-all duration-500" style={{ width: `${mission.progress}%` }} />
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            <div className="space-y-2 mb-8 flex-1">
              <div className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                <Target size={12} /> TACTICAL_OBJECTIVES
              </div>
              {mission.objectives.map((obj, i) => (
                <div key={i} className="flex items-center gap-3 text-[11px] font-mono text-zinc-400 group-hover:text-zinc-200 transition-colors">
                  <div className={`w-1.5 h-1.5 rounded-full ${mission.status === 'completed' ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-zinc-800'}`} />
                  {obj}
                </div>
              ))}
            </div>

            {mission.status === 'available' && characters.length > 0 && (
              <div className="mb-6 animate-in slide-in-from-bottom duration-300">
                <div className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <Users size={12} /> ASSIGN OPERATIVE
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {characters.map(char => (
                    <button
                      key={char.id}
                      onClick={() => setSelectedChar(prev => ({ ...prev, [mission.id]: char.id }))}
                      className={`flex-shrink-0 px-4 py-2 rounded-xl text-[10px] font-bold border transition-all ${
                        selectedChar[mission.id] === char.id 
                          ? 'bg-cyan-500 border-cyan-400 text-black shadow-lg shadow-cyan-500/20' 
                          : 'bg-white/5 border-white/10 text-zinc-500 hover:border-white/30 hover:text-white'
                      }`}
                    >
                      {char.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-between items-center pt-8 border-t border-white/5 mt-auto">
              <div>
                <div className="text-[10px] font-black text-zinc-600 uppercase mb-1">CONTRACT VALUE</div>
                <div className={`text-2xl font-orbitron font-black italic tracking-tighter ${mission.status === 'failed' ? 'text-red-500/40 line-through' : 'text-emerald-400'}`}>
                  ${mission.reward.toLocaleString()}
                </div>
              </div>

              {mission.status === 'available' && (
                <button 
                  disabled={characters.length === 0}
                  onClick={() => onAccept(mission.id, selectedChar[mission.id] || characters[0]?.id)}
                  className="bg-white text-black px-8 py-3 rounded-2xl font-black text-[11px] hover:bg-cyan-400 transition-all uppercase tracking-widest shadow-2xl active:scale-95 disabled:bg-zinc-800 disabled:text-zinc-600 flex items-center gap-2"
                >
                  START <ChevronRight size={16} />
                </button>
              )}
              {mission.status === 'completed' && (
                <div className="flex flex-col items-end gap-2">
                   <div className="text-emerald-500 flex items-center gap-2 font-black text-[10px]"><CheckCircle2 size={16} /> SUCCESS</div>
                   <button onClick={() => onReplay(mission.id)} className="text-[10px] font-black text-purple-400 flex items-center gap-2 hover:text-white transition-colors"><RefreshCcw size={14} /> REPLAY</button>
                </div>
              )}
              {mission.status === 'failed' && (
                <div className="flex flex-col items-end gap-2 text-red-500">
                   <div className="flex items-center gap-2 font-black text-[10px]"><XCircle size={16} /> BOTCHED</div>
                   <button onClick={() => onReplay(mission.id)} className="text-[10px] font-black text-zinc-500 flex items-center gap-2 hover:text-white transition-colors"><RefreshCcw size={14} /> RETRY</button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MissionView;
