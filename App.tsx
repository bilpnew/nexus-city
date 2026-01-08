
import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import CharacterView from './components/CharacterView';
import GarageView from './components/GarageView';
import MapView from './components/MapView';
import MissionView from './components/MissionView';
import TutorialModal from './components/TutorialModal';
import { Character, Car, GameView, Mission, TacticalEvent } from './types';
import { 
  TrendingUp, 
  Skull, 
  Clock, 
  Bell,
  Zap,
  Terminal,
  Activity,
  Trophy,
  Flame,
  Star,
  AlertCircle,
  CheckCircle,
  XCircle,
  Info
} from 'lucide-react';

const INITIAL_MISSIONS: Mission[] = [
  { id: 'm1', title: 'Silicon Ghost', type: 'Stealth', difficulty: 'Medium', reward: 450000, hook: 'Infiltrate the Arasaka server farm and inject a logic bomb.', objectives: ['Bypass biometric scanners', 'Avoid camera detection', 'Extract core data'], status: 'available', prestigeLevel: 0 },
  { id: 'm2', title: 'Neon Blitz', type: 'Driving', difficulty: 'Low', reward: 120000, hook: 'Deliver a high-priority package across the bridge in under 3 minutes.', objectives: ['Maintain 120mph avg speed', 'Avoid police roadblocks', 'Secure drop-off point'], status: 'available', prestigeLevel: 0 },
  { id: 'm3', title: 'The Iron Curtain', type: 'Heist', difficulty: 'Extreme', reward: 2500000, hook: 'The ultimate vault. No one has ever walked out of the Metro Bank alive.', objectives: ['Thermal drill the vault', 'Subdue security response', 'Escape via helicopter'], status: 'available', prestigeLevel: 0 },
  { id: 'm4', title: 'Carbon Silence', type: 'Stealth', difficulty: 'High', reward: 890000, hook: 'A rival syndicate leader is meeting a contact. Ghost them.', objectives: ['Track target to rooftop', 'Synchronize takedown', 'Evade area before backup'], status: 'available', prestigeLevel: 0 },
  { id: 'm5', title: 'Volt Hijack', type: 'Combat', difficulty: 'Medium', reward: 320000, hook: 'A military convoy is carrying experimental batteries. Take them.', objectives: ['Disable lead escort', 'Neutralize armed guards', 'Secure cargo truck'], status: 'available', prestigeLevel: 0 },
  { id: 'm8', title: 'Apex Predator', type: 'Combat', difficulty: 'Legendary', reward: 15000000, hook: 'The CEO of Militech is leaving his tower. This is the big one.', objectives: ['Disable skyscraper security', 'Fight through Elite Mechs', 'Terminate the CEO'], status: 'available', prestigeLevel: 0 },
];

const STARTING_CHARS: Character[] = [
  {
    id: 'c1',
    name: 'Jax Vane',
    role: 'Lead Infiltrator',
    description: 'Ex-military specialist with neural-link enhancements.',
    imageUrl: 'https://images.unsplash.com/photo-1614728263952-84ea256f9679?auto=format&fit=crop&q=80&w=400',
    stats: { driving: 85, shooting: 92, hacking: 40, strength: 78 }
  },
  {
    id: 'c2',
    name: 'Sera "Ghost" Lin',
    role: 'Technical Specialist',
    description: 'Bypasses any firewall within 60 seconds.',
    imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400',
    stats: { driving: 45, shooting: 30, hacking: 98, strength: 25 }
  }
];

const STARTING_CARS: Car[] = [
  {
    id: 'v1',
    model: 'Ronin X-90',
    class: 'Intercepter',
    description: 'Lightweight frame with a twin-turbo hyper-drive.',
    imageUrl: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?auto=format&fit=crop&q=80&w=600',
    stats: { speed: 95, handling: 88, armor: 45 }
  },
  {
    id: 'v2',
    model: 'Goliath T-800',
    class: 'Heavy Enforcer',
    description: 'Plated with experimental composite armor.',
    imageUrl: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&q=80&w=600',
    stats: { speed: 60, handling: 55, armor: 98 }
  }
];

const TACTICAL_EVENTS: TacticalEvent[] = [
  {
    id: 'e1',
    description: 'Heavy police blockade ahead. They are checking all biometrics.',
    options: [
      { label: 'Ram Through', outcome: 'damage', detail: 'Force your way through. Heavy armor damage expected.' },
      { label: 'Bribe Officer', outcome: 'success', detail: 'Costs $5,000 but keeps the mission quiet.' },
      { label: 'Detour', outcome: 'delay', detail: 'Find a back alley. Adds 15 seconds to mission clock.' }
    ]
  },
  {
    id: 'e2',
    description: 'An unexpected firewall is blocking the data extraction.',
    options: [
      { label: 'Brute Force', outcome: 'delay', detail: 'Will eventually break, but it takes time.' },
      { label: 'Signal Ghost', outcome: 'progress', detail: 'Rapidly bypasses the lock.' },
      { label: 'Abort Sync', outcome: 'damage', detail: 'Retry from scratch. High stress level.' }
    ]
  },
  {
    id: 'e3',
    description: 'Security drones have spotted the team on the roof.',
    options: [
      { label: 'Engage Drones', outcome: 'damage', detail: 'Shoot them down. Risky combat.' },
      { label: 'ECM Jammer', outcome: 'success', detail: 'Electronic countermeasures used. Clean escape.' },
      { label: 'Hide in Shadows', outcome: 'delay', detail: 'Wait for them to pass.' }
    ]
  }
];

const TACTICAL_PHRASES = [
  "Bypassing subnet firewalls...",
  "Suppressing local security feedback...",
  "Asset in position. Visual confirmed.",
  "Warning: Thermal signature detected.",
  "Uploading logic bomb to core...",
  "Maintaining stealth profile.",
  "Engaging silent takedown protocol.",
  "Rerouting power to engine systems.",
  "Decryption at 45%. Monitoring ICE.",
  "Hostile reinforcements detected on sensors.",
  "Jamming radio frequencies in sector.",
  "Extraction route calculated. Proceeding."
];

const App: React.FC = () => {
  const [view, setView] = useState<GameView>('dashboard');
  const [characters, setCharacters] = useState<Character[]>(STARTING_CHARS);
  const [cars, setCars] = useState<Car[]>(STARTING_CARS);
  const [missions, setMissions] = useState<Mission[]>(INITIAL_MISSIONS);
  const [balance, setBalance] = useState(15420930);
  const [level, setLevel] = useState(14);
  const [xp, setXp] = useState(2400);
  const maxXp = 5000;
  const [notoriety, setNotoriety] = useState(4);
  const [logs, setLogs] = useState<string[]>(['System initialized...', 'Network handshake complete', 'Crew: Jax Vane active.']);
  const [notification, setNotification] = useState<{type: 'success' | 'failure', message: string, missionTitle: string} | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);

  const addLog = useCallback((msg: string) => {
    setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 15));
  }, []);

  const triggerNotification = (type: 'success' | 'failure', message: string, missionTitle: string) => {
    setNotification({ type, message, missionTitle });
    setTimeout(() => setNotification(null), 5000);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      setMissions(prevMissions => prevMissions.map(m => {
        if (m.status === 'in-progress') {
          if (m.activeEvent) return m;

          const currentHealth = m.health ?? 100;
          const currentProgress = m.progress ?? 0;
          const currentEnemyHealth = m.enemyHealth ?? 100;
          const currentLogs = m.tacticalLogs ?? [];
          
          const riskFactor = { 'Low': 0.05, 'Medium': 0.1, 'High': 0.25, 'Extreme': 0.45, 'Legendary': 0.7 }[m.difficulty];
          
          // Character Stat Influence
          const assignedChar = characters.find(c => c.id === m.assignedCharacterId);
          const shootingBonus = (assignedChar?.stats.shooting || 50) / 100;
          const drivingBonus = (assignedChar?.stats.driving || 50) / 100;

          // Enemy AI Damage
          const damageRoll = Math.random() < riskFactor ? Math.floor(Math.random() * (12 - shootingBonus * 5)) : 0;
          const progressRoll = Math.random() > 0.25 ? Math.floor(Math.random() * 6) + 2 : 0;
          
          // Combat Specific Logic
          let nextEnemyHealth = currentEnemyHealth;
          if (m.type === 'Combat') {
            const combatDmg = Math.floor((shootingBonus * 10) + Math.random() * 5);
            nextEnemyHealth = Math.max(0, currentEnemyHealth - combatDmg);
          }

          const nextHealth = Math.max(0, currentHealth - damageRoll);
          // If combat mission, progress is tied to enemy health
          const nextProgress = m.type === 'Combat' ? Math.min(100, 100 - nextEnemyHealth) : Math.min(100, currentProgress + progressRoll);

          if (Math.random() > 0.96 && nextProgress < 90) {
            const event = TACTICAL_EVENTS[Math.floor(Math.random() * TACTICAL_EVENTS.length)];
            return { ...m, activeEvent: event, health: nextHealth, progress: nextProgress, enemyHealth: nextEnemyHealth };
          }

          let nextLogs = [...currentLogs];
          if (Math.random() > 0.7) {
            const phrase = m.type === 'Combat' && nextEnemyHealth < currentEnemyHealth 
              ? `Engaging targets. Enemy integrity at ${nextEnemyHealth}%.` 
              : TACTICAL_PHRASES[Math.floor(Math.random() * TACTICAL_PHRASES.length)];
            nextLogs = [phrase, ...nextLogs].slice(0, 5);
          }

          if (nextHealth <= 0) {
            addLog(`CRITICAL FAILURE: ${m.title}. Vital signs lost.`);
            setNotoriety(prev => Math.min(5, prev + 1));
            triggerNotification('failure', 'Crew Neutralized', m.title);
            return { ...m, status: 'failed', failureReason: 'Crew Neutralized', health: 0, endTime: undefined, tacticalLogs: ["CONNECTION TERMINATED."] };
          }

          if (m.endTime && now >= m.endTime) {
            addLog(`FAILURE: ${m.title}. Window closed.`);
            triggerNotification('failure', 'Time Limit Exceeded', m.title);
            return { ...m, status: 'failed', failureReason: 'Extraction Blocked', endTime: undefined, tacticalLogs: ["TIME EXPIRED. RETREATING."] };
          }

          if (nextProgress >= 100) {
            const reward = Math.floor(m.reward * (nextHealth / 100 + 0.5));
            setBalance(b => b + reward);
            addLog(`SUCCESS: ${m.title}. Credited $${reward.toLocaleString()}`);
            triggerNotification('success', `Payout: $${reward.toLocaleString()}`, m.title);
            
            const gainedXp = 600 + (reward / 800);
            setXp(pxp => {
              if (pxp + gainedXp >= maxXp) {
                setLevel(prevLevel => prevLevel + 1);
                addLog(`PROMOTED: Rank ${level + 1} Syndicate.`);
                return (pxp + gainedXp) - maxXp;
              }
              return pxp + gainedXp;
            });

            return { ...m, status: 'completed', progress: 100, health: nextHealth, endTime: undefined, tacticalLogs: ["OBJECTIVE SECURED. EVAC SUCCESSFUL."] };
          }

          return { ...m, health: nextHealth, progress: nextProgress, enemyHealth: nextEnemyHealth, tacticalLogs: nextLogs };
        }
        return m;
      }));
    }, 1000);
    return () => clearInterval(timer);
  }, [level, xp, balance, notoriety, maxXp, addLog, characters]);

  const handleResolveEvent = (missionId: string, optionIndex: number) => {
    setMissions(prev => prev.map(m => {
      if (m.id === missionId && m.activeEvent) {
        const option = m.activeEvent.options[optionIndex];
        let nextHealth = m.health ?? 100;
        let nextProgress = m.progress ?? 0;
        let nextEndTime = m.endTime ?? Date.now();
        let log = `TACTICAL CHOICE: ${option.label}. ${option.detail}`;

        if (option.outcome === 'damage') nextHealth -= 15;
        if (option.outcome === 'progress') nextProgress += 15;
        if (option.outcome === 'delay') nextEndTime += 15000;
        if (option.outcome === 'success') nextProgress += 5;

        addLog(log);
        return { 
          ...m, 
          activeEvent: undefined, 
          health: Math.max(0, nextHealth), 
          progress: Math.min(100, nextProgress),
          endTime: nextEndTime,
          tacticalLogs: [log, ...(m.tacticalLogs || [])].slice(0, 5)
        };
      }
      return m;
    }));
  };

  const addCharacter = (char: Character) => setCharacters([char, ...characters]);
  const addCar = (car: Car) => setCars([car, ...cars]);

  const handleAcceptMission = (id: string, characterId: string) => {
    const mission = missions.find(m => m.id === id);
    if (!mission) return;

    const durationMap = { 'Low': 30, 'Medium': 60, 'High': 120, 'Extreme': 240, 'Legendary': 600 };
    const seconds = durationMap[mission.difficulty] || 60;

    setMissions(prev => prev.map(m => 
      m.id === id ? { 
        ...m, 
        status: 'in-progress', 
        health: 100, 
        progress: 0, 
        enemyHealth: 100,
        assignedCharacterId: characterId,
        tacticalLogs: ["LINK ESTABLISHED.", "INFILTRATING SECTOR..."],
        endTime: Date.now() + (seconds * 1000) 
      } : m
    ));
    addLog(`INITIATING: ${mission.title}. Lead Operative: ${characters.find(c => c.id === characterId)?.name}`);
  };

  const handleReplayMission = (id: string) => {
    setMissions(prev => prev.map(m => {
      if (m.id === id && (m.status === 'completed' || m.status === 'failed')) {
        const difficultyLevels: Mission['difficulty'][] = ['Low', 'Medium', 'High', 'Extreme', 'Legendary'];
        const currentDiffIndex = difficultyLevels.indexOf(m.difficulty);
        const nextDifficulty = difficultyLevels[Math.min(currentDiffIndex + 1, 4)];
        
        const baseReward = m.status === 'completed' ? m.reward : m.reward / 1.5;
        const scaledReward = Math.floor(baseReward * 1.5);
        
        return {
          ...m,
          status: 'available',
          difficulty: nextDifficulty,
          reward: scaledReward,
          prestigeLevel: (m.prestigeLevel || 0) + 1,
          health: undefined,
          progress: undefined,
          enemyHealth: undefined,
          assignedCharacterId: undefined,
          failureReason: undefined,
          tacticalLogs: undefined,
          activeEvent: undefined
        };
      }
      return m;
    }));
  };

  return (
    <div className={`flex h-screen bg-[#020202] text-white selection:bg-cyan-500 selection:text-black font-inter overflow-hidden crt ${notoriety >= 5 ? 'border-4 border-red-500/20' : ''}`}>
      <Sidebar currentView={view} setView={setView} onShowTutorial={() => setShowTutorial(true)} />
      
      {showTutorial && <TutorialModal onClose={() => setShowTutorial(false)} />}

      <main className="flex-1 overflow-y-auto p-6 md:p-12 relative z-10 scrollbar-hide">
        <div className="fixed top-0 right-0 w-[1200px] h-[1200px] bg-cyan-500/5 rounded-full blur-[180px] -z-10 pointer-events-none animate-pulse" />
        
        {notification && (
          <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top duration-500">
            <div className={`glass flex items-center gap-4 px-8 py-4 rounded-2xl border ${notification.type === 'success' ? 'border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.2)]' : 'border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.2)]'}`}>
              <div className={notification.type === 'success' ? 'text-emerald-400' : 'text-red-400'}>
                {notification.type === 'success' ? <CheckCircle size={32} /> : <XCircle size={32} />}
              </div>
              <div>
                <h4 className="font-orbitron font-black uppercase text-sm italic tracking-widest">
                  {notification.type === 'success' ? 'OPERATION SUCCESS' : 'OPERATION BOTCHED'}
                </h4>
                <p className="text-zinc-400 text-xs font-mono uppercase tracking-tighter">
                  {notification.missionTitle} // {notification.message}
                </p>
              </div>
            </div>
          </div>
        )}

        {view === 'dashboard' && (
          <div className="space-y-8 animate-in fade-in duration-700">
            <header className="flex justify-between items-center">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-4xl font-orbitron font-black italic tracking-tighter">NEXUS <span className="text-cyan-400">HQ</span></h2>
                  <div className="bg-cyan-500/20 px-3 py-1 rounded-full border border-cyan-500/30 text-cyan-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                    <Trophy size={12} /> SYNDICATE RANK {level}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  <p className="text-zinc-500 text-xs font-mono uppercase tracking-widest italic">Connection: Secure // Sector: {Math.floor(Math.random() * 100)}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] font-bold tracking-[0.2em] text-zinc-500 mb-1">BANK BALANCE</div>
                <div className="text-4xl font-orbitron font-black text-emerald-400 italic shadow-[0_0_20px_rgba(52,211,153,0.1)]">${balance.toLocaleString()}</div>
              </div>
            </header>

            <div className="glass p-2 rounded-2xl overflow-hidden relative border border-white/5 shadow-inner">
              <div className="flex justify-between text-[9px] font-black text-zinc-600 tracking-[0.3em] uppercase px-4 mb-2">
                <span>Network Reach</span>
                <span className="text-cyan-400">{(xp / maxXp * 100).toFixed(1)}%</span>
              </div>
              <div className="h-2 w-full bg-black/50 rounded-full overflow-hidden border border-white/5">
                <div className="h-full bg-gradient-to-r from-cyan-600 via-cyan-400 to-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.6)] transition-all duration-1000" style={{ width: `${(xp / maxXp) * 100}%` }} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="glass p-8 rounded-[2.5rem] border-l-4 border-cyan-500 hover:bg-white/5 transition-all cursor-pointer group" onClick={() => setShowTutorial(true)}>
                <div className="p-3 bg-cyan-500/10 rounded-2xl text-cyan-400 w-fit mb-4 group-hover:scale-110 transition-transform"><Info /></div>
                <div className="text-xs font-bold text-zinc-500 tracking-widest mb-1 uppercase">How To Play</div>
                <div className="text-3xl font-orbitron font-black italic">VIEW MANUAL</div>
              </div>
              <div className="glass p-8 rounded-[2.5rem] border-l-4 border-red-500 hover:bg-white/5 transition-all cursor-pointer group">
                <div className="p-3 bg-red-500/10 rounded-2xl text-red-400 w-fit mb-4 group-hover:scale-110 transition-transform"><Skull /></div>
                <div className="text-xs font-bold text-zinc-500 tracking-widest mb-1 uppercase">Heat Level</div>
                <div className="text-3xl font-orbitron font-black italic flex items-center gap-3">
                  {notoriety >= 4 ? 'CRITICAL' : 'STABLE'}
                  {notoriety >= 4 && <Flame size={28} className="text-red-500 animate-pulse" />}
                </div>
              </div>
              <div className="glass p-8 rounded-[2.5rem] border-l-4 border-emerald-500 hover:bg-white/5 transition-all cursor-pointer group" onClick={() => setView('missions')}>
                <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-400 w-fit mb-4 group-hover:scale-110 transition-transform"><Zap /></div>
                <div className="text-xs font-bold text-zinc-500 tracking-widest mb-1 uppercase">Live Operations</div>
                <div className="text-3xl font-orbitron font-black italic">{missions.filter(m => m.status === 'in-progress').length} RUNNING</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 glass p-8 rounded-[2.5rem] flex flex-col border border-white/5 shadow-2xl overflow-hidden">
                <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-4">
                  <h3 className="font-orbitron font-black text-xl italic uppercase flex items-center gap-3 tracking-tighter">
                    <Activity size={20} className="text-cyan-400" /> SYSTEM FEED
                  </h3>
                </div>
                <div className="flex-1 space-y-3 font-mono text-[11px] max-h-[400px] overflow-y-auto pr-4 scrollbar-hide">
                  {logs.map((log, i) => (
                    <div key={i} className={`p-4 rounded-xl border border-white/5 bg-black/40 backdrop-blur transition-all ${i === 0 ? 'text-cyan-400 border-cyan-500/20 shadow-[0_0_20px_rgba(6,182,212,0.05)]' : 'text-zinc-500'}`}>
                      {log}
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass p-8 rounded-[2.5rem] flex flex-col items-center justify-center text-center relative overflow-hidden group border border-white/5">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-red-500/10 opacity-30 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10 w-full">
                  <div className="w-24 h-24 bg-zinc-900/80 rounded-[2rem] flex items-center justify-center mb-8 mx-auto border border-white/10 rotate-12 group-hover:rotate-0 transition-all duration-700 shadow-2xl backdrop-blur">
                    <Terminal className="text-cyan-500" size={40} />
                  </div>
                  <h3 className="font-orbitron font-black text-3xl italic uppercase mb-2 tracking-tighter">RESOURCES</h3>
                  <p className="text-xs text-zinc-500 mb-10 uppercase tracking-[0.3em] font-bold">Operatives: {characters.length} // Fleet: {cars.length}</p>
                  <button onClick={() => setView('safehouse')} className="w-full bg-white text-black py-5 rounded-2xl font-black text-sm hover:bg-cyan-400 transition-all transform hover:scale-[1.03] uppercase tracking-widest shadow-2xl active:scale-95">Expand Syndicate</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {view === 'safehouse' && <CharacterView characters={characters} addCharacter={addCharacter} />}
        {view === 'garage' && <GarageView cars={cars} addCar={addCar} />}
        {view === 'map' && <MapView />}
        {view === 'missions' && <MissionView missions={missions} characters={characters} onAccept={handleAcceptMission} onReplay={handleReplayMission} onResolveEvent={handleResolveEvent} onShowTutorial={() => setShowTutorial(true)} />}
      </main>
    </div>
  );
};

export default App;
