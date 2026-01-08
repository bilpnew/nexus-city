
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './components/Sidebar';
import CharacterView from './components/CharacterView';
import GarageView from './components/GarageView';
import MapView from './components/MapView';
import MissionView from './components/MissionView';
import TerminalView from './components/TerminalView';
import TutorialModal from './components/TutorialModal';
import { Character, Car, GameView, Mission, TacticalEvent } from './types';
import { generateMissionDescription, generateBriefingAudio } from './services/gemini';
import { 
  Trophy, Wifi, Activity, Terminal as TerminalIcon, 
  Info, Zap, Skull, Bell, Volume2, ShieldAlert, Settings, Sliders, VolumeX
} from 'lucide-react';

const INITIAL_CHARACTERS: Character[] = [
  {
    id: 'char-1',
    name: 'Jax "Voltage" Thorne',
    role: 'Master Infiltrator',
    description: 'Expert hacker with a history of high-profile data heists. Fast on his feet, faster on a terminal.',
    imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000&auto=format&fit=crop',
    stats: { driving: 85, shooting: 70, hacking: 98, strength: 60 }
  },
  {
    id: 'char-2',
    name: 'Kira "Viper" Sato',
    role: 'Tactical Enforcer',
    description: 'Ex-military specialist trained in urban warfare. If things get loud, she’s the one you want on point.',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1000&auto=format&fit=crop',
    stats: { driving: 70, shooting: 95, hacking: 40, strength: 88 }
  }
];

const INITIAL_CARS: Car[] = [
  {
    id: 'car-1',
    model: 'Overdrive Zenith',
    class: 'Hypercar',
    description: 'Aerodynamic masterpiece built for absolute velocity. Features a prototype nitro injection system.',
    imageUrl: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?q=80&w=1000&auto=format&fit=crop',
    stats: { speed: 98, handling: 92, armor: 45 }
  },
  {
    id: 'car-2',
    model: 'Ironclad Juggernaut',
    class: 'Armored SUV',
    description: 'Modified tactical response vehicle. Replaced luxury with heavy-duty plating and bulletproof glass.',
    imageUrl: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=1000&auto=format&fit=crop',
    stats: { speed: 55, handling: 60, armor: 95 }
  }
];

const INITIAL_MISSIONS: Mission[] = [
  { id: 'm1', title: 'Silicon Ghost', type: 'Stealth', difficulty: 'Medium', reward: 450000, hook: 'Infiltrate the server farm and inject a logic bomb.', objectives: ['Bypass scanners', 'Avoid detection', 'Extract data'], status: 'available' },
];

const App: React.FC = () => {
  const [view, setView] = useState<GameView>('dashboard');
  const [characters, setCharacters] = useState<Character[]>(INITIAL_CHARACTERS);
  const [cars, setCars] = useState<Car[]>(INITIAL_CARS);
  const [missions, setMissions] = useState<Mission[]>(INITIAL_MISSIONS);
  const [balance, setBalance] = useState(15420930);
  const [level, setLevel] = useState(14);
  const [notoriety, setNotoriety] = useState(1);
  const [logs, setLogs] = useState<string[]>(['[SYSTEM] AUTHENTICATED: NEXUS_ADMIN', '[UPLINK] STABLE']);
  const [notification, setNotification] = useState<{type: 'success' | 'failure', message: string, title: string} | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isGeneratingMission, setIsGeneratingMission] = useState(false);
  const [isBriefing, setIsBriefing] = useState(false);
  
  // Audio State
  const [masterVolume, setMasterVolume] = useState(0.5);
  const [ambientActive, setAmbientActive] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const ambientNodesRef = useRef<{osc: OscillatorNode, gain: GainNode}[]>([]);

  const addLog = useCallback((msg: string) => {
    setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 15));
  }, []);

  const addCharacter = useCallback((char: Character) => {
    setCharacters(prev => [...prev, char]);
    addLog(`New operative recruited: ${char.name}`);
  }, [addLog]);

  const addCar = useCallback((car: Car) => {
    setCars(prev => [...prev, car]);
    addLog(`New vehicle assembled: ${car.model}`);
  }, [addLog]);

  // Audio Engine Management
  const initAudio = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
    return audioContextRef.current;
  };

  const playSFX = useCallback((type: 'nav' | 'recruit' | 'mission' | 'click') => {
    const ctx = initAudio();
    if (!ctx) return;
    
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(masterVolume * 0.4, ctx.currentTime);
    gain.connect(ctx.destination);

    switch (type) {
      case 'nav': {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        osc.connect(gain);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
        break;
      }
      case 'click': {
        const osc = ctx.createOscillator();
        osc.type = 'square';
        osc.frequency.setValueAtTime(1200, ctx.currentTime);
        gain.gain.setValueAtTime(masterVolume * 0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
        osc.connect(gain);
        osc.start();
        osc.stop(ctx.currentTime + 0.05);
        break;
      }
      case 'recruit': {
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(880, ctx.currentTime + 0.3);
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2000, ctx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.3);
        osc.connect(filter);
        filter.connect(gain);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
        break;
      }
      case 'mission': {
        const osc = ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(110, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(55, ctx.currentTime + 0.5);
        gain.gain.setValueAtTime(masterVolume * 0.8, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
        osc.connect(gain);
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
        break;
      }
    }
  }, [masterVolume]);

  const startAmbientEngine = () => {
    initAudio();
    const ctx = audioContextRef.current!;
    const mainGain = ctx.createGain();
    mainGain.gain.setValueAtTime(masterVolume * 0.1, ctx.currentTime);
    mainGain.connect(ctx.destination);

    // Deep Drone
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(55, ctx.currentTime);
    gain1.gain.setValueAtTime(0.5, ctx.currentTime);
    
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(200, ctx.currentTime);

    osc1.connect(filter);
    filter.connect(gain1);
    gain1.connect(mainGain);
    
    osc1.start();
    ambientNodesRef.current.push({ osc: osc1, gain: gain1 });
    setAmbientActive(true);
    addLog("Audio Engine: Ambient Generative Loop Active");
  };

  const stopAmbientEngine = () => {
    ambientNodesRef.current.forEach(node => {
      node.osc.stop();
      node.osc.disconnect();
    });
    ambientNodesRef.current = [];
    setAmbientActive(false);
    addLog("Audio Engine: Ambient Generative Loop Suspended");
  };

  const playBriefing = async (text: string) => {
    try {
      setIsBriefing(true);
      const base64 = await generateBriefingAudio(text);
      initAudio();
      const ctx = audioContextRef.current!;
      const arrayBuffer = Uint8Array.from(atob(base64), c => c.charCodeAt(0)).buffer;
      const dataInt16 = new Int16Array(arrayBuffer);
      const audioBuffer = ctx.createBuffer(1, dataInt16.length, 24000);
      const channelData = audioBuffer.getChannelData(0);
      for (let i = 0; i < dataInt16.length; i++) {
        channelData[i] = (dataInt16[i] / 32768.0) * masterVolume;
      }
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      source.onended = () => setIsBriefing(false);
      source.start();
    } catch (e) {
      console.warn("Briefing audio failed", e);
      setIsBriefing(false);
    }
  };

  const handleAcceptMission = async (id: string, charId: string) => {
    const mission = missions.find(m => m.id === id);
    if (!mission) return;
    
    setMissions(prev => prev.map(m => m.id === id ? { 
      ...m, 
      status: 'in-progress', 
      health: 100, 
      progress: 0, 
      assignedCharacterId: charId,
      endTime: Date.now() + 60000 
    } : m));

    playSFX('mission');
    await playBriefing(`Initializing mission: ${mission.title}. Target is secured. Good luck operative.`);
  };

  const handleSetView = useCallback((newView: GameView) => {
    if (view !== newView) {
      playSFX('nav');
      setView(newView);
    }
  }, [view, playSFX]);

  return (
    <div className="flex h-screen bg-black text-white font-inter selection:bg-cyan-500 overflow-hidden relative">
      <Sidebar currentView={view} setView={handleSetView} onShowTutorial={() => { playSFX('click'); setShowTutorial(true); }} />
      
      <AnimatePresence>
        {showTutorial && <TutorialModal onClose={() => { playSFX('click'); setShowTutorial(false); }} />}
        {showSettings && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-xl"
          >
            <div className="glass p-12 rounded-[3rem] border border-white/10 w-full max-w-lg">
              <h2 className="text-4xl font-orbitron font-black italic uppercase tracking-tighter mb-8">Audio <span className="text-cyan-400">Control</span></h2>
              
              <div className="space-y-8">
                <div>
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-4">
                    <span>Master Gain</span>
                    <span>{Math.round(masterVolume * 100)}%</span>
                  </div>
                  <input 
                    type="range" min="0" max="1" step="0.01" 
                    value={masterVolume} 
                    onChange={(e) => setMasterVolume(parseFloat(e.target.value))}
                    className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                  />
                </div>

                <div className="flex items-center justify-between p-6 bg-white/5 rounded-2xl border border-white/5">
                  <div>
                    <div className="text-xs font-black uppercase tracking-widest mb-1">Ambient Drone</div>
                    <div className="text-[9px] font-mono text-zinc-500">Procedural AI Synthesis Engine</div>
                  </div>
                  <button 
                    onClick={() => {
                      playSFX('click');
                      ambientActive ? stopAmbientEngine() : startAmbientEngine();
                    }}
                    className={`p-4 rounded-xl transition-all ${ambientActive ? 'bg-cyan-500 text-black shadow-[0_0_20px_rgba(6,182,212,0.4)]' : 'bg-zinc-800 text-zinc-500'}`}
                  >
                    {ambientActive ? <Volume2 size={24}/> : <VolumeX size={24}/>}
                  </button>
                </div>
              </div>

              <button 
                onClick={() => { playSFX('click'); setShowSettings(false); }}
                className="mt-12 w-full bg-white text-black py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-cyan-400 transition-all"
              >
                SAVE & RETURN
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 overflow-y-auto p-6 md:p-12 scrollbar-hide relative z-10">
        <div className="fixed top-0 right-0 w-[1000px] h-[1000px] bg-cyan-500/5 rounded-full blur-[150px] -z-10 animate-pulse pointer-events-none" />
        
        {/* Settings Toggle Button */}
        <button 
          onClick={() => { playSFX('click'); setShowSettings(true); }}
          className="fixed top-8 right-8 z-50 p-4 glass rounded-2xl text-zinc-500 hover:text-white border border-white/5 transition-all active:scale-95"
        >
          <Settings size={20} />
        </button>

        <AnimatePresence>
          {notification && (
            <motion.div 
              initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
              className="fixed top-10 left-1/2 -translate-x-1/2 z-[1000]"
            >
              <div className={`glass px-8 py-5 rounded-[2rem] border ${notification.type === 'success' ? 'border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.2)]' : 'border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.2)]'}`}>
                <div className="flex items-center gap-4">
                  {notification.type === 'success' ? <Zap className="text-emerald-400" /> : <Skull className="text-red-400" />}
                  <div>
                    <h4 className="font-orbitron font-black uppercase text-[10px] tracking-widest">{notification.title}</h4>
                    <p className="text-zinc-400 text-[10px] font-mono">{notification.message}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {view === 'dashboard' && (
            <motion.div 
              key="dash" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
              className="space-y-10"
            >
              <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                  <h1 className="text-5xl font-orbitron font-black italic tracking-tighter uppercase glitch-text cursor-default">
                    NEXUS <span className="text-cyan-400">HQ</span>
                  </h1>
                  <div className="flex items-center gap-3 text-zinc-500 text-[10px] font-mono mt-2">
                    <Wifi size={14} className="text-emerald-500 animate-pulse" />
                    <span>ENCRYPTED UPLINK: Sector_01_Node</span>
                  </div>
                </div>
                <div className="glass p-6 rounded-[2rem] border-zinc-800 text-right">
                  <div className="text-[10px] font-bold text-zinc-500 mb-1 uppercase tracking-widest">Syndicate Balance</div>
                  <div className="text-4xl font-orbitron font-black text-emerald-400 italic">${balance.toLocaleString()}</div>
                </div>
              </header>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { label: 'Reputation', val: level, icon: Trophy, color: 'border-cyan-500' },
                  { label: 'Heat', val: notoriety, icon: ShieldAlert, color: 'border-red-500' },
                  { label: 'Assets', val: characters.length + cars.length, icon: Activity, color: 'border-gold' },
                  { label: 'Voice', val: isBriefing ? 'ACTIVE' : 'READY', icon: Volume2, color: 'border-emerald-500' },
                ].map((card, i) => (
                  <motion.div 
                    whileHover={{ scale: 1.05 }} key={i} 
                    className={`glass p-8 rounded-[2rem] border-l-4 ${card.color} relative overflow-hidden group`}
                  >
                    <card.icon className="text-zinc-500 mb-4" size={20} />
                    <div className="text-[10px] font-black text-zinc-600 uppercase mb-1 tracking-widest">{card.label}</div>
                    <div className="text-2xl font-orbitron font-black italic">{card.val}</div>
                  </motion.div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 glass p-8 rounded-[2.5rem] bg-black/40 h-[400px] flex flex-col">
                  <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
                    <h3 className="font-orbitron font-black text-sm uppercase flex items-center gap-3">
                      <TerminalIcon size={16} className="text-cyan-400" /> NETWORK_TRAFFIC
                    </h3>
                  </div>
                  <div className="flex-1 overflow-y-auto scrollbar-hide space-y-2 font-mono text-[10px]">
                    {logs.map((log, i) => (
                      <div key={i} className={`p-3 rounded-lg bg-black/50 border border-white/5 ${i === 0 ? 'text-cyan-400 border-cyan-500/20' : 'text-zinc-600'}`}>
                        {log}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="glass p-10 rounded-[2.5rem] bg-black/60 flex flex-col items-center justify-center text-center">
                  <div className="w-20 h-20 bg-zinc-900 rounded-[1.5rem] flex items-center justify-center mb-6 border border-white/10 shadow-2xl">
                    <Zap className="text-cyan-400" size={32} />
                  </div>
                  <h3 className="font-orbitron font-black text-2xl uppercase mb-6">Operations</h3>
                  <button 
                    onClick={() => handleSetView('safehouse')}
                    className="w-full bg-white text-black py-4 rounded-xl font-black text-xs hover:bg-cyan-400 transition-all uppercase tracking-widest active:scale-95 shadow-xl"
                  >
                    Recruit Operatives
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {view === 'safehouse' && <CharacterView characters={characters} addCharacter={addCharacter} onPlaySFX={playSFX} />}
          {view === 'garage' && <GarageView cars={cars} addCar={addCar} onPlaySFX={playSFX} />}
          {view === 'map' && <MapView />}
          {view === 'terminal' && <TerminalView balance={balance} setBalance={setBalance} addLog={addLog} onPlaySFX={playSFX} />}
          {view === 'missions' && (
            <MissionView 
              missions={missions} characters={characters} onAccept={handleAcceptMission} onResolveEvent={() => {}} 
              onGenerateMission={async (t, type, difficulty) => {
                playSFX('click');
                setIsGeneratingMission(true);
                try {
                  const m = await generateMissionDescription(t, type, difficulty);
                  setMissions(prev => [{ ...m, id: Math.random().toString(), status: 'available' }, ...prev]);
                  addLog(`Contract generated: ${m.title}`);
                } catch(e) { addLog("Gen failed: Signal lost."); }
                finally { setIsGeneratingMission(false); }
              }}
              isGenerating={isGeneratingMission} onShowTutorial={() => { playSFX('click'); setShowTutorial(true); }}
              onReplay={(id) => { playSFX('click'); setMissions(prev => prev.map(m => m.id === id ? { ...m, status: 'available' } : m)); }}
            />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default App;
