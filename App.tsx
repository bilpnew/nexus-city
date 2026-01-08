
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
  Lock, Key, ExternalLink, Cpu, Gift, Sparkles
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
  },
  {
    id: 'char-5',
    name: 'Marcus "Brick" Stone',
    role: 'Heavy Weapons',
    description: "Walking tank. If a door doesn't open, he makes a new one.",
    imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1000&auto=format&fit=crop',
    stats: { driving: 40, shooting: 90, hacking: 10, strength: 98 }
  },
  {
    id: 'char-6',
    name: 'Elena "Cipher" Vance',
    role: 'Digital Architect',
    description: 'PhD in cryptography turned rogue. She sees the world in binary.',
    imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1000&auto=format&fit=crop',
    stats: { driving: 50, shooting: 40, hacking: 99, strength: 30 }
  },
  {
    id: 'char-7',
    name: 'Viktor "The Wolf" Volkov',
    role: 'Clean-Up Crew',
    description: 'Specializes in removing evidence and managing "unforeseen complications".',
    imageUrl: 'https://images.unsplash.com/photo-1488161628813-244768e24692?q=80&w=1000&auto=format&fit=crop',
    stats: { driving: 75, shooting: 88, hacking: 70, strength: 80 }
  },
  {
    id: 'char-8',
    name: 'Tessa "Nitro" Bell',
    role: 'Demolitions',
    description: 'Loves the smell of thermite in the morning. Everything is a fuse if you try hard enough.',
    imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1000&auto=format&fit=crop',
    stats: { driving: 65, shooting: 82, hacking: 55, strength: 75 }
  },
  {
    id: 'char-9',
    name: 'Chen "Echo" Long',
    role: 'Infiltrator',
    description: 'A master of social engineering and physical security bypass.',
    imageUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=1000&auto=format&fit=crop',
    stats: { driving: 70, shooting: 60, hacking: 88, strength: 55 }
  },
  {
    id: 'char-10',
    name: 'Rico "The Fixer" Diaz',
    role: 'Strategy Lead',
    description: 'The guy who knows a guy. If you need it, he can get it—for a price.',
    imageUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=1000&auto=format&fit=crop',
    stats: { driving: 80, shooting: 75, hacking: 75, strength: 75 }
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
  
  // Video Replay State
  const [showReplay, setShowReplay] = useState(false);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoStatus, setVideoStatus] = useState('');

  // Audio State
  const [masterVolume, setMasterVolume] = useState(0.5);
  const [ambientActive, setAmbientActive] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const ambientNodesRef = useRef<{osc: OscillatorNode, gain: GainNode}[]>([]);

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

  /**
   * Fix missing mission handlers to enable gameplay loop
   */
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
  }, []);

  const handleGenerateMission = useCallback(async (theme: string, type: string, difficulty: string) => {
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
  }, [addLog]);

  const handleReplayMission = useCallback((id: string) => {
    setMissions(prev => prev.map(m => m.id === id ? { ...m, status: 'available', progress: 0, health: 100 } : m));
  }, []);

  const handleSetView = useCallback((newView: GameView) => {
    if (view !== newView) {
      playSFX('nav');
      setView(newView);
    }
  }, [view, playSFX]);

  if (hasApiKey === false) {
    return (
      <div className="h-screen bg-black flex items-center justify-center p-6 text-center bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-900/20 via-black to-black">
        <div className="max-w-md w-full glass p-12 rounded-[3rem] border border-cyan-500/20 shadow-[0_0_100px_rgba(6,182,212,0.15)] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50" />
          
          <div className="w-24 h-24 bg-zinc-900 rounded-[2rem] border border-white/10 flex items-center justify-center mx-auto mb-8 shadow-2xl">
            <Sparkles className="text-cyan-400" size={40} />
          </div>
          
          <h1 className="text-3xl font-orbitron font-black italic uppercase tracking-tighter mb-4">
            BEST <span className="text-cyan-400">FREE AI</span> MODE
          </h1>
          
          <p className="text-zinc-400 text-xs font-mono mb-10 uppercase leading-relaxed tracking-wider px-4">
            Unlock high-fidelity character generation and action replays with your own <span className="text-white font-bold">Free Google AI Key</span>.
          </p>
          
          <div className="space-y-6">
            <button 
              onClick={handleConnect}
              className="w-full bg-cyan-500 text-black py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white transition-all shadow-2xl shadow-cyan-500/30 flex items-center justify-center gap-3 group active:scale-95"
            >
              <Key size={18} className="group-hover:rotate-12 transition-transform" /> 
              ACTIVATE BEST FREE AI KEY
            </button>
            
            <div className="flex flex-col gap-3">
              <a 
                href="https://aistudio.google.com/app/apikey" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 text-[10px] font-black text-zinc-500 hover:text-cyan-400 transition-colors uppercase tracking-widest"
              >
                Get a Free Key at AI Studio <ExternalLink size={12} />
              </a>
              <a 
                href="https://ai.google.dev/gemini-api/docs/billing" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 text-[10px] font-black text-zinc-600 hover:text-white transition-colors uppercase tracking-widest"
              >
                Billing Documentation <Info size={12} />
              </a>
            </div>
          </div>
          
          <div className="mt-10 pt-8 border-t border-white/5 flex items-center justify-center gap-4 grayscale opacity-40">
            <Gift size={20} className="text-cyan-400" />
            <div className="text-[8px] font-mono text-left uppercase tracking-tighter">
              Nexus Grid Version: 4.2.0-STABLE<br/>
              Neural Link: Pending Authorization
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
                    <Wifi size={14} className="text-emerald-500 animate-pulse" />
                    <span>BEST FREE AI LINK: Sector_01_Node_7</span>
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
                  { label: 'Flash Gen', val: 'ACTIVE', icon: Cpu, color: 'border-emerald-500' },
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
              {/* Rest of the views... */}
            </motion.div>
          )}
          {view === 'safehouse' && <CharacterView characters={characters} addCharacter={addCharacter} onPlaySFX={playSFX} />}
          {view === 'garage' && <GarageView cars={cars} addCar={addCar} onPlaySFX={playSFX} />}
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
