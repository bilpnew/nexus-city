
import React, { useState, useEffect } from 'react';
import { Mission, Character } from '../types';
import { Target, Zap, Shield, Eye, Database, Car, Swords, ChevronRight, CheckCircle2, XCircle, Loader2, Clock, RefreshCcw, Star, Heart, Activity, AlertTriangle, HelpCircle, Terminal, AlertCircle, Users } from 'lucide-react';

interface MissionViewProps {
  missions: Mission[];
  characters: Character[];
  onAccept: (id: string, characterId: string) => void;
  onReplay?: (id: string) => void;
  onResolveEvent?: (missionId: string, optionIndex: number) => void;
  onShowTutorial?: () => void;
}

const MissionTimer: React.FC<{ endTime: number }> = ({ endTime }) => {
  const [timeLeft, setTimeLeft] = useState<number>(Math.max(0, endTime - Date.now()));

  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = Math.max(0, endTime - Date.now());
      setTimeLeft(remaining);
      if (remaining <= 0) clearInterval(timer);
    }, 100);
    return () => clearInterval(timer);
  }, [endTime]);

  const seconds = Math.floor(timeLeft / 1000);
  const ms = Math.floor((timeLeft % 1000) / 100);
  const isUrgent = seconds < 10;

  return (
    <div className={`flex flex-col items-center gap-1 font-mono transition-all duration-300 ${isUrgent ? 'animate-pulse scale-110' : ''}`}>
      <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full border shadow-2xl ${
        isUrgent 
          ? 'bg-red-500/20 text-red-400 border-red-500/50' 
          : 'bg-zinc-900 text-cyan-400 border-white/10'
      }`}>
        {isUrgent ? <AlertTriangle size={14} className="animate-bounce" /> : <Clock size={14} />}
        <span className="text-sm font-black tracking-tighter">
          {seconds.toString().padStart(2, '0')}.{ms}s
        </span>
      </div>
      <span className="text-[8px] font-black uppercase tracking-[0.3em] opacity-40">Critical Window</span>
    </div>
  );
};

const MissionView: React.FC<MissionViewProps> = ({ missions, characters, onAccept, onReplay, onResolveEvent, onShowTutorial }) => {
  const [filter, setFilter] = useState<Mission['type'] | 'All'>('All');
  const [selectedCharForMission, setSelectedCharForMission] = useState<Record<string, string>>({});

  const getIcon = (type: Mission['type']) => {
    switch (type) {
      case 'Heist': return <Database className="text-yellow-400" />;
      case 'Stealth': return <Eye className="text-purple-400" />;
      case 'Combat': return <Swords className="text-red-500" />;
      case 'Driving': return <Car className="text-cyan-400" />;
      case 'Hacking': return <Zap className="text-emerald-400" />;
      default: return <Target />;
    }
  };

  const getDifficultyColor = (diff: Mission['difficulty']) => {
    switch (diff) {
      case 'Low': return 'text-emerald-400 bg-emerald-400/10';
      case 'Medium': return 'text-cyan-400 bg-cyan-400/10';
      case 'High': return 'text-orange-400 bg-orange-400/10';
      case 'Extreme': return 'text-red-500 bg-red-500/10';
      case 'Legendary': return 'text-purple-500 bg-purple-500/10 border border-purple-500/30 shadow-[0_0_20px_rgba(168,85,247,0.2)]';
      default: return 'text-zinc-400';
    }
  };

  const filteredMissions = filter === 'All' ? missions : missions.filter(m => m.type === filter);

  return (
    <div className="h-full flex flex-col space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-5xl md:text-6xl font-orbitron font-black italic tracking-tighter mb-2">CONTRACT <span className="text-red-600">HUB</span></h2>
          <div className="flex gap-4 items-center">
            <p className="text-zinc-500 font-mono text-[10px] md:text-xs tracking-[0.3em] uppercase">// 256-Bit Link Active // Tactical Systems Engaged</p>
            <button 
              onClick={onShowTutorial}
              className="flex items-center gap-2 text-cyan-400 text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors"
            >
              <HelpCircle size={14} /> Combat Manual
            </button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 p-1 bg-white/5 rounded-2xl border border-white/5 backdrop-blur max-w-full overflow-x-auto scrollbar-hide">
          {['All', 'Heist', 'Stealth', 'Combat', 'Driving', 'Hacking'].map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t as any)}
              className={`px-4 md:px-6 py-2 md:py-3 rounded-xl text-[9px] md:text-[10px] font-black tracking-widest uppercase transition-all duration-300 ${
                filter === t ? 'bg-white text-black shadow-xl scale-105' : 'text-zinc-500 hover:text-white hover:bg-white/5'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 overflow-y-auto pr-6 pb-20 scrollbar-hide">
        {filteredMissions.map((mission) => (
          <div 
            key={mission.id} 
            className={`glass p-8 rounded-[2.5rem] group relative transition-all duration-500 border border-white/5 flex flex-col ${
              mission.status === 'in-progress' ? 'border-cyan-500/50 scale-[1.02] shadow-[0_0_40px_rgba(6,182,212,0.15)] ring-1 ring-cyan-500/20' : 
              mission.status === 'completed' ? 'opacity-90 border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.05)]' : 
              mission.status === 'failed' ? 'border-red-500/50 bg-red-500/10 shadow-[0_0_50px_rgba(239,68,68,0.1)]' : 'hover:border-white/20'
            }`}
          >
            {mission.status === 'failed' && (
              <div className="absolute top-0 left-0 w-full h-1 bg-red-500 animate-pulse" />
            )}
            
            <div className="flex justify-between items-start mb-6">
              <div className="p-4 bg-zinc-900 rounded-2xl border border-white/5 group-hover:scale-110 transition-all duration-500 shadow-2xl flex items-center justify-center">
                {getIcon(mission.type)}
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="flex gap-2">
                  {mission.prestigeLevel && mission.prestigeLevel > 0 && (
                    <span className="px-3 py-1.5 rounded-lg bg-purple-500/20 text-purple-400 text-[9px] font-black border border-purple-500/30 flex items-center gap-1 shadow-lg shadow-purple-500/10">
                      <Star size={10} fill="currentColor" /> PRESTIGE {mission.prestigeLevel}
                    </span>
                  )}
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase shadow-md ${getDifficultyColor(mission.difficulty)}`}>
                    {mission.difficulty}
                  </span>
                </div>
              </div>
            </div>

            <h3 className="text-2xl font-orbitron font-black italic uppercase mb-2 tracking-tighter group-hover:text-cyan-400 transition-colors duration-500">{mission.title}</h3>
            <p className="text-[13px] text-zinc-500 leading-relaxed mb-6 italic h-10 overflow-hidden line-clamp-2">"{mission.hook}"</p>

            {/* LIVE SIMULATION STATUS */}
            {mission.status === 'in-progress' && (
              <div className="space-y-6 mb-8 bg-black/60 p-6 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden">
                {mission.activeEvent ? (
                  <div className="animate-in zoom-in duration-300">
                    <div className="flex items-center gap-3 text-red-500 font-black text-[10px] uppercase tracking-widest mb-4">
                      <AlertCircle size={16} className="animate-pulse" /> TACTICAL EVENT
                    </div>
                    <p className="text-xs text-white font-bold leading-relaxed mb-6 italic">{mission.activeEvent.description}</p>
                    <div className="space-y-3">
                      {mission.activeEvent.options.map((opt, idx) => (
                        <button 
                          key={idx}
                          onClick={() => onResolveEvent?.(mission.id, idx)}
                          className="w-full bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-3 text-left transition-all group/opt"
                        >
                          <div className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-1 group-hover/opt:text-white">{opt.label}</div>
                          <div className="text-[9px] text-zinc-500">{opt.detail}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl" />
                    
                    <div className="flex justify-between items-center mb-4">
                       <div className="space-y-1">
                          <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                            <Terminal size={12} /> Live Link Active
                          </div>
                          <div className="flex items-center gap-3 text-cyan-400 font-black text-xs italic animate-pulse">
                            <Loader2 size={18} className="animate-spin" /> {mission.type === 'Combat' ? 'ENGAGING' : 'EXECUTING'}...
                          </div>
                       </div>
                       {mission.endTime && <MissionTimer endTime={mission.endTime} />}
                    </div>

                    {/* TACTICAL FEED */}
                    <div className="bg-zinc-950/80 p-4 rounded-xl border border-white/5 h-20 overflow-y-auto mb-4 font-mono text-[9px] text-zinc-400 space-y-1.5 scrollbar-hide shadow-inner">
                      {(mission.tacticalLogs || []).map((log, i) => (
                        <div key={i} className={i === 0 ? "text-cyan-400 animate-in fade-in slide-in-from-left duration-300" : "opacity-60"}>
                          [{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}] {log}
                        </div>
                      ))}
                    </div>

                    <div className="space-y-4">
                      {/* Combat: Enemy Health Bar */}
                      {mission.type === 'Combat' && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-[9px] font-black uppercase tracking-widest mb-1">
                            <span className="flex items-center gap-2 text-yellow-500"><Swords size={12}/> Enemy Integrity</span>
                            <span className="text-yellow-500">{mission.enemyHealth}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden border border-white/5 shadow-inner">
                            <div className="h-full bg-gradient-to-r from-yellow-600 to-yellow-400 transition-all duration-500" style={{ width: `${mission.enemyHealth}%` }} />
                          </div>
                        </div>
                      )}

                      <div className="space-y-2">
                        <div className="flex justify-between text-[9px] font-black uppercase tracking-widest mb-1">
                          <span className="flex items-center gap-2 text-red-500"><Heart size={12}/> Vital Signs</span>
                          <span className={mission.health! < 30 ? 'text-red-500 animate-pulse font-black' : 'text-zinc-400'}>{mission.health}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden border border-white/5 shadow-inner">
                          <div className={`h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-500 ${mission.health! < 20 ? 'animate-pulse' : ''}`} style={{ width: `${mission.health}%` }} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-[9px] font-black uppercase tracking-widest mb-1">
                          <span className="flex items-center gap-2 text-cyan-400"><Activity size={12}/> {mission.type === 'Combat' ? 'Neutralization' : 'Sync Progress'}</span>
                          <span className="text-cyan-400">{mission.progress}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden border border-white/5 shadow-inner">
                          <div className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 transition-all duration-500" style={{ width: `${mission.progress}%` }} />
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            <div className="space-y-2.5 mb-8 flex-1">
              <div className="text-[9px] font-black uppercase tracking-widest text-zinc-600 mb-2">Tactical Objectives</div>
              {mission.objectives.map((obj, idx) => (
                <div key={idx} className="flex items-center gap-3 text-[11px] font-mono text-zinc-400 group-hover:text-zinc-300 transition-colors">
                  <div className={`w-1.5 h-1.5 rounded-full ${mission.status === 'completed' ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-zinc-700'}`} />
                  {obj}
                </div>
              ))}
            </div>

            {mission.status === 'available' && characters.length > 0 && (
              <div className="mb-6 animate-in slide-in-from-bottom duration-300">
                <div className="text-[9px] font-black uppercase tracking-widest text-zinc-600 mb-2 flex items-center gap-2">
                  <Users size={12} /> Assign Crew Member
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {characters.map(char => (
                    <button
                      key={char.id}
                      onClick={() => setSelectedCharForMission(prev => ({...prev, [mission.id]: char.id}))}
                      className={`flex-shrink-0 px-4 py-2 rounded-xl text-[10px] font-bold border transition-all ${
                        selectedCharForMission[mission.id] === char.id 
                          ? 'bg-cyan-500 border-cyan-400 text-black' 
                          : 'bg-white/5 border-white/10 text-zinc-400 hover:border-white/30'
                      }`}
                    >
                      {char.name} ({mission.type === 'Combat' ? `Aim: ${char.stats.shooting}` : `Drive: ${char.stats.driving}`})
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-between items-center pt-8 border-t border-white/5">
              <div>
                <div className="text-[10px] font-black tracking-widest text-zinc-600 uppercase mb-1">Contract Value</div>
                <div className={`text-2xl font-orbitron font-black tracking-tighter ${mission.status === 'failed' ? 'text-red-500/40 line-through' : 'text-emerald-400'}`}>
                  ${mission.reward.toLocaleString()}
                </div>
              </div>

              <div className="flex flex-col items-end gap-3">
                {mission.status === 'available' && (
                  <button 
                    onClick={() => {
                      const charId = selectedCharForMission[mission.id] || characters[0]?.id;
                      if (charId) onAccept(mission.id, charId);
                      else alert("No crew available. Recruit operatives first.");
                    }}
                    className="bg-white text-black px-8 py-3 rounded-2xl font-black text-[11px] hover:bg-cyan-400 transition-all flex items-center gap-3 shadow-[0_10px_30px_rgba(255,255,255,0.15)] hover:scale-105 active:scale-95 uppercase tracking-widest disabled:bg-zinc-800 disabled:text-zinc-600"
                    disabled={characters.length === 0}
                  >
                    START OP <ChevronRight size={16} />
                  </button>
                )}

                {mission.status === 'completed' && (
                  <div className="flex flex-col items-end gap-3">
                    <div className="flex items-center gap-2 text-emerald-500 font-black text-[10px] bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-500/20 uppercase tracking-[0.2em]">
                      <CheckCircle2 size={16} /> DATA_ARCHIVED
                    </div>
                    <button 
                      onClick={() => onReplay?.(mission.id)}
                      className="flex items-center gap-3 text-[10px] font-black text-purple-400 hover:text-white bg-purple-500/10 hover:bg-purple-600 px-5 py-3 rounded-2xl border border-purple-500/30 transition-all uppercase tracking-widest group/btn shadow-[0_5px_15px_rgba(168,85,247,0.1)] active:scale-95"
                    >
                      <RefreshCcw size={14} className="group-hover/btn:rotate-180 transition-transform duration-500" /> PRESTIGE REPLAY
                    </button>
                  </div>
                )}

                {mission.status === 'failed' && (
                  <div className="flex flex-col items-end gap-3">
                    <div className="flex items-center gap-2 text-red-500 font-black text-[10px] bg-red-500/20 px-4 py-2 rounded-xl border border-red-500/50 uppercase tracking-[0.2em] shadow-lg shadow-red-500/20">
                      <XCircle size={16} /> {mission.failureReason || 'BOTCHED'}
                    </div>
                    <button 
                      onClick={() => onReplay?.(mission.id)}
                      className="flex items-center gap-3 text-[10px] font-black text-zinc-400 hover:text-white bg-zinc-900 px-5 py-3 rounded-2xl border border-white/5 transition-all uppercase tracking-widest group/btn shadow-[0_5px_15px_rgba(0,0,0,0.3)] active:scale-95"
                    >
                      <RefreshCcw size={14} className="group-hover/btn:rotate-180 transition-transform duration-500" /> RETRY (UPSCALED)
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MissionView;
