
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './components/Sidebar';
import CharacterView from './components/CharacterView';
import GarageView from './components/GarageView';
import MapView from './components/MapView';
import MissionView from './components/MissionView';
import TerminalView from './components/TerminalView';
import TutorialModal from './components/TutorialModal';
import VideoReplayModal from './components/VideoReplayModal';
import { Character, Car, GameView, Mission, TacticalEvent } from './types';
import { generateMissionDescription, generateBriefingAudio, generateMissionVideo } from './services/gemini';
import { 
  Trophy, Wifi, Activity, Terminal as TerminalIcon, 
  Info, Zap, Skull, Bell, Volume2, ShieldAlert, Settings, Sliders, VolumeX,
  Lock, Key, ExternalLink, Cpu, Gift, Sparkles, MonitorOff, AlertCircle
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
  },
  {
    id: 'char-3',
    name: 'Leo "Gearhead" Rossi',
    role: 'Transporter',
    description: 'Underground racing legend. Can outrun a police interceptor in a garbage truck if he has to.',
    imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1000&auto=format&fit=crop',
    stats: { driving: 99, shooting: 50, hacking: 30, strength: 65 }
  },
  {
    id: 'char-4',
    name: 'Sloane "Ghost" Mercer',
    role: 'Stealth Specialist',
    description: 'Former intelligence operative. Specializes in "invisible" entries and exits.',
    imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1000&auto=format&fit=crop',
    stats: { driving: 60, shooting: 75, hacking: 85, strength: 45 }
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
  { id: 'm2', title: 'Neon Blitz', type: 'Driving', difficulty: 'Low', reward: 120000, hook: 'Deliver the high-value cargo through the downtown expressway.', objectives: ['Keep speed above 80', 'Avoid roadblocks', 'Reach drop point'], status: 'available' },
  { id: 'm3', title: 'Iron Rain', type: 'Combat', difficulty: 'High', reward: 780000, hook: 'Assault the private military convoy and seize the hardware.', objectives: ['Disable escorts', 'Hijack the truck', 'Hold off reinforcements'], status: 'available' },
  { id: 'm4', title: 'The Vault Breaker', type: 'Heist', difficulty: 'Extreme', reward: 2500000, hook: 'Bypass the layers of security at the Central Bank of Nexus.', objectives: ['Drill vault door', 'Neutralize alarms', 'Secure the gold'], status: 'available' },
  { id: 'm5', title: 'Digital Mirage', type: 'Hacking', difficulty: 'Medium', reward: 350000, hook: 'Siphon funds from a corporate shell account.', objectives: ['Bypass firewall', 'Decrypt keys', 'Route funds through safe nodes'], status: 'available' },
];

const App: React.FC = () => {
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [view, setView] = useState<GameView>('dashboard');
  const [characters, setCharacters] = useState<Character[]>(INITIAL_CHARACTERS);
  const [cars, setCars] = useState<Car[]>(INITIAL_CARS);
  const [missions, setMissions] = useState<Mission[]>(INITIAL_MISSIONS);
  const [balance, setBalance] = useState(15420930);
  const [level, setLevel] = useState(14);
  const [notoriety, setNotoriety] = useState(1);
  const [logs, setLogs] = useState<string[]>(['[SYSTEM] AUTHENTICATED: NEXUS_ADMIN', '[UPLINK] STABLE']);
  const [showTutorial, setShowTutorial] = useState(false);
  const [isGeneratingMission, setIsGeneratingMission] = useState(false);
  
  // Video Replay State
  const [showReplay, setShowReplay] = useState(false);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoStatus, setVideoStatus] = useState('');

  // Audio State
  const [masterVolume, setMasterVolume] = useState(0.5);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    const checkKey = async () => {
      if (typeof window.aistudio !== 'undefined') {
        const has = await window.aistudio.hasSelectedApiKey();
        setHasApiKey(has);
      } else {
        setHasApiKey(true);
      }
    };
    checkKey();
  }, []);

  const handleConnect = async () => {
    if (typeof window.aistudio !== 'undefined') {
      await window.aistudio.openSelectKey();
      setHasApiKey(true);
      setIsOfflineMode(false);
    }
  };

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
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.1);
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
        osc.connect(gain);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
        break;
      }
      case 'mission': {
        const osc = ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(110, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(55, ctx.currentTime + 0.5);
        osc.connect(gain);
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
        break;
      }
    }
  }, [masterVolume]);

  const handleAcceptMission = useCallback((id: string, characterId: string) => {
    const mission = missions.find(m => m.id === id);
    if (!mission) return;

    playSFX('mission');
    addLog(`Deploying operative to mission: ${mission.title}`);
    
    setMissions(prev => prev.map(m => 
      m.id === id ? { 
        ...m, 
        status: 'in-progress', 
        assignedCharacterId: characterId,
        health: 100,
        progress: 0,
        endTime: Date.now() + 20000 
      } : m
    ));

    const interval = setInterval(() => {
      setMissions(prev => {
        const current = prev.find(m => m.id === id);
        if (!current || current.status !== 'in-progress') {
          clearInterval(interval);
          return prev;
        }

        const newProgress = Math.min(100, (current.progress || 0) + 4);
        const newHealth = Math.max(0, (current.health || 100) - (Math.random() * 6));

        if (newHealth <= 0) {
          clearInterval(interval);
          addLog(`MISSION FAILED: ${current.title} - Operator compromised.`);
          return prev.map(m => m.id === id ? { ...m, status: 'failed', health: 0 } : m);
        }

        if (newProgress >= 100) {
          clearInterval(interval);
          setBalance(b => b + current.reward);
          addLog(`MISSION SUCCESS: ${current.title} - $${current.reward.toLocaleString()} secured.`);
          return prev.map(m => m.id === id ? { ...m, status: 'completed', progress: 100 } : m);
        }

        return prev.map(m => m.id === id ? { ...m, progress: newProgress, health: newHealth } : m);
      });
    }, 1000);
  }, [missions, addLog, playSFX, setBalance]);

  const handleWatchReplay = useCallback(async (mission: Mission) => {
    if (isOfflineMode) {
      addLog("Action replay unavailable in OFFLINE mode.");
      return;
    }
    setShowReplay(true);
    setIsGeneratingVideo(true);
    setVideoStatus('Initializing neural link...');
    
    try {
      const url = await generateMissionVideo(mission, (msg) => setVideoStatus(msg));
      setVideoUrl(url);
    } catch (error) {
      console.error(error);
      setVideoStatus('Signal loss: Action replay data corrupted.');
    } finally {
      setIsGeneratingVideo(false);
    }
  }, [isOfflineMode, addLog]);

  const handleGenerateMission = useCallback(async (theme: string, type: string, difficulty: string) => {
    if (isOfflineMode) {
      addLog("Contract generation requires NEURAL LINK.");
      return;
    }
    setIsGeneratingMission(true);
    addLog(`Contracting network for: ${theme}...`);
    try {
      const data = await generateMissionDescription(theme, type, difficulty);
      const newMission: Mission = {
        id: Math.random().toString(36).substring(2, 9),
        ...data,
        status: 'available'
      };
      setMissions(prev => [newMission, ...prev]);
      addLog(`New contract decrypted: ${data.title}`);
    } catch (error) {
      addLog('Failed to generate mission. Network congestion.');
    } finally {
      setIsGeneratingMission(false);
    }
  }, [isOfflineMode, addLog]);

  const handleReplayMission = useCallback((id: string) => {
    setMissions(prev => prev.map(m => m.id === id ? { ...m, status: 'available', progress: 0, health: 100 } : m));
  }, []);

  const handleSetView = useCallback((newView: GameView) => {
    if (view !== newView) {
      playSFX('nav');
      setView(newView);
    }
  }, [view, playSFX]);

  // Main UI Logic: Lock screen if no key and NOT in offline mode
  if (hasApiKey === false && !isOfflineMode) {
    return (
      <div className="h-screen bg-black flex items-center justify-center p-6 text-center bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-900/20 via-black to-black">
        <div className="max-w-md w-full glass p-12 rounded-[3rem] border border-cyan-500/20 shadow-[0_0_100px_rgba(6,182,212,0.15)] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50" />
          
          <div className="w-24 h-24 bg-zinc-900 rounded-[2rem] border border-white/10 flex items-center justify-center mx-auto mb-8 shadow-2xl">
            <MonitorOff className="text-red-500" size={40} />
          </div>
          
          <h1 className="text-3xl font-orbitron font-black italic uppercase tracking-tighter mb-4">
            NEURAL LINK <span className="text-red-500">OFFLINE</span>
          </h1>
          
          <p className="text-zinc-400 text-xs font-mono mb-10 uppercase leading-relaxed tracking-wider px-4">
            AI-powered generation and action replays require a Google Gemini Key. You can play with limited features in Offline Mode.
          </p>
          
          <div className="space-y-4">
            <button 
              onClick={handleConnect}
              className="w-full bg-cyan-500 text-black py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white transition-all shadow-2xl shadow-cyan-500/30 flex items-center justify-center gap-3 group active:scale-95"
            >
              <Key size={18} className="group-hover:rotate-12 transition-transform" /> 
              ACTIVATE BEST FREE AI KEY
            </button>

            <button 
              onClick={() => setIsOfflineMode(true)}
              className="w-full bg-zinc-900 text-zinc-400 py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-zinc-800 transition-all border border-white/5 flex items-center justify-center gap-3 active:scale-95"
            >
              <MonitorOff size={18} /> ENTER OFFLINE MODE
            </button>
            
            <div className="pt-6 flex flex-col gap-3">
              <a 
                href="https://aistudio.google.com/app/apikey" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 text-[10px] font-black text-zinc-500 hover:text-cyan-400 transition-colors uppercase tracking-widest"
              >
                Get a Free Key at AI Studio <ExternalLink size={12} />
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-black text-white font-inter selection:bg-cyan-500 overflow-hidden relative">
      <Sidebar currentView={view} setView={handleSetView} onShowTutorial={() => { playSFX('click'); setShowTutorial(true); }} />
      <AnimatePresence>
        {showTutorial && <TutorialModal onClose={() => { playSFX('click'); setShowTutorial(false); }} />}
        {showReplay && (
          <VideoReplayModal 
            videoUrl={videoUrl} 
            isLoading={isGeneratingVideo} 
            statusMessage={videoStatus}
            onClose={() => { setShowReplay(false); setVideoUrl(null); }} 
          />
        )}
      </AnimatePresence>
      <main className="flex-1 overflow-y-auto p-6 md:p-12 scrollbar-hide relative z-10">
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
                    {isOfflineMode ? (
                      <MonitorOff size={14} className="text-red-500" />
                    ) : (
                      <Wifi size={14} className="text-emerald-500 animate-pulse" />
                    )}
                    <span>{isOfflineMode ? 'LOCAL_EMULATION_MODE' : 'BEST FREE AI LINK: Sector_01_Node_7'}</span>
                  </div>
                </div>
                <div className="glass p-6 rounded-[2rem] border-zinc-800 text-right">
                  <div className="text-[10px] font-bold text-zinc-500 mb-1 uppercase tracking-widest">Syndicate Balance</div>
                  <div className="text-4xl font-orbitron font-black text-emerald-400 italic">${balance.toLocaleString()}</div>
                </div>
              </header>

              {isOfflineMode && (
                <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* Fixed: AlertCircle added to imports above */}
                    <AlertCircle className="text-red-500" size={18} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-red-500">Warning: AI Generation features suspended in Offline Mode</span>
                  </div>
                  <button onClick={handleConnect} className="text-[10px] font-black underline uppercase text-white hover:text-cyan-400">Link AI Now</button>
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { label: 'Reputation', val: level, icon: Trophy, color: 'border-cyan-500' },
                  { label: 'Heat', val: notoriety, icon: ShieldAlert, color: 'border-red-500' },
                  { label: 'Assets', val: characters.length + cars.length, icon: Activity, color: 'border-gold' },
                  { label: 'Neural Link', val: isOfflineMode ? 'SUSPENDED' : 'ACTIVE', icon: Cpu, color: isOfflineMode ? 'border-zinc-800' : 'border-emerald-500' },
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
                    Manage Crew
                  </button>
                </div>
              </div>
            </motion.div>
          )}
          {view === 'safehouse' && <CharacterView characters={characters} addCharacter={addCharacter} onPlaySFX={playSFX} isOffline={isOfflineMode} />}
          {view === 'garage' && <GarageView cars={cars} addCar={addCar} onPlaySFX={playSFX} isOffline={isOfflineMode} />}
          {view === 'map' && <MapView />}
          {view === 'terminal' && <TerminalView balance={balance} setBalance={setBalance} addLog={addLog} onPlaySFX={playSFX} />}
          {view === 'missions' && (
            <MissionView 
              missions={missions} characters={characters} onAccept={handleAcceptMission} onResolveEvent={() => {}} 
              onGenerateMission={handleGenerateMission}
              onWatchReplay={handleWatchReplay}
              isGenerating={isGeneratingMission} onShowTutorial={() => setShowTutorial(true)}
              onReplay={handleReplayMission}
            />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default App;
