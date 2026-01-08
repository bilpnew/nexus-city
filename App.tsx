
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import CharacterView from './components/CharacterView';
import GarageView from './components/GarageView';
import MapView from './components/MapView';
import MissionView from './components/MissionView';
import TerminalView from './components/TerminalView';
import TutorialModal from './components/TutorialModal';
import { Character, Car, GameView, Mission, TacticalEvent } from './types';
import { generateMissionDescription } from './services/gemini';
import { 
  Trophy, 
  Wifi, 
  Activity, 
  Terminal as TerminalIcon, 
  Info, 
  Zap, 
  Skull, 
  Flame, 
  Search,
  Bell
} from 'lucide-react';

const INITIAL_MISSIONS: Mission[] = [
  { id: 'm1', title: 'Silicon Ghost', type: 'Stealth', difficulty: 'Medium', reward: 450000, hook: 'Infiltrate the Arasaka server farm and inject a logic bomb.', objectives: ['Bypass biometric scanners', 'Avoid camera detection', 'Extract core data'], status: 'available', prestigeLevel: 0 },
  { id: 'm2', title: 'Neon Blitz', type: 'Driving', difficulty: 'Low', reward: 120000, hook: 'Deliver a high-priority package across the bridge in under 3 minutes.', objectives: ['Maintain 120mph avg speed', 'Avoid police roadblocks', 'Secure drop-off point'], status: 'available', prestigeLevel: 0 },
  { id: 'm3', title: 'The Iron Curtain', type: 'Heist', difficulty: 'Extreme', reward: 2500000, hook: 'The ultimate vault. No one has ever walked out of the Metro Bank alive.', objectives: ['Thermal drill the vault', 'Subdue security response', 'Escape via helicopter'], status: 'available', prestigeLevel: 0 },
];

const STARTING_CHARS: Character[] = [
  {
    id: 'c1',
    name: 'Jax Vane',
    role: 'Lead Infiltrator',
    description: 'Ex-military specialist with neural-link enhancements.',
    imageUrl: 'https://images.unsplash.com/photo-1614728263952-84ea256f9679?auto=format&fit=crop&q=80&w=400',
    stats: { driving: 85, shooting: 92, hacking: 40, strength: 78 }
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
  "Decryption at 45%. Monitoring ICE.",
  "Extraction route calculated. Proceeding."
];

const App: React.FC = () => {
  // State
  const [view, setView] = useState<GameView>('dashboard');
  const [characters, setCharacters] = useState<Character[]>(STARTING_CHARS);
  const [cars, setCars] = useState<Car[]>([]);
  const [missions, setMissions] = useState<Mission[]>(INITIAL_MISSIONS);
  const [balance, setBalance] = useState(15420930);
  const [level, setLevel] = useState(14);
  const [xp, setXp] = useState(2400);
  const maxXp = 5000;
  const [notoriety, setNotoriety] = useState(2);
  const [logs, setLogs] = useState<string[]>(['System initialized...', 'Network handshake complete']);
  const [notification, setNotification] = useState<{type: 'success' | 'failure', message: string, title: string} | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);
  const [isGeneratingMission, setIsGeneratingMission] = useState(false);

  // Derived
  const activeMissionsCount = useMemo(() => missions.filter(m => m.status === 'in-progress').length, [missions]);

  // Callbacks
  const addLog = useCallback((msg: string) => {
    setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 20));
  }, []);

  const triggerNotification = useCallback((type: 'success' | 'failure', message: string, title: string) => {
    setNotification({ type, message, title });
    setTimeout(() => setNotification(null), 5000);
  }, []);

  const handleGenerateMission = async (theme: string) => {
    setIsGeneratingMission(true);
    addLog(`SCANNING CITY FOR NEW CONTRACTS: ${theme.toUpperCase()}`);
    try {
      const data = await generateMissionDescription(theme);
      const newMission: Mission = {
        id: 'm' + Math.random().toString(36).substring(2, 9),
        title: data.title || "Unknown Contract",
        hook: data.hook || "No details provided.",
        objectives: data.objectives || ["Complete primary goal"],
        difficulty: data.difficulty as any || "Medium",
        type: data.type as any || "Heist",
        reward: data.reward || 500000,
        status: 'available',
        prestigeLevel: 0
      };
      setMissions(prev => [newMission, ...prev]);
      addLog(`NEW CONTRACT SECURED: ${newMission.title}`);
    } catch (e) {
      addLog(`ENCRYPTION ERROR: Signal lost while generating contract.`);
    } finally {
      setIsGeneratingMission(false);
    }
  };

  // Simulation Loop
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      setMissions(prevMissions => prevMissions.map(m => {
        if (m.status !== 'in-progress' || m.activeEvent) return m;

        const riskFactor = { Low: 0.05, Medium: 0.1, High: 0.2, Extreme: 0.35, Legendary: 0.5 }[m.difficulty];
        const assignedChar = characters.find(c => c.id === m.assignedCharacterId);
        const skillFactor = assignedChar ? (assignedChar.stats.shooting + assignedChar.stats.driving) / 200 : 0.5;

        // Progress and Damage
        const progressRoll = (Math.random() * 5 + 1) * skillFactor;
        const damageRoll = Math.random() < riskFactor ? (Math.random() * 10 * (1 - skillFactor)) : 0;
        
        const nextProgress = Math.min(100, (m.progress || 0) + progressRoll);
        const nextHealth = Math.max(0, (m.health || 100) - damageRoll);
        let nextEnemyHealth = m.enemyHealth ?? 100;

        if (m.type === 'Combat') {
          nextEnemyHealth = Math.max(0, nextEnemyHealth - (progressRoll * 2));
        }

        // Random Tactical Event
        if (Math.random() > 0.98 && nextProgress < 90) {
          const event = TACTICAL_EVENTS[Math.floor(Math.random() * TACTICAL_EVENTS.length)];
          return { ...m, activeEvent: event, health: nextHealth, progress: nextProgress, enemyHealth: nextEnemyHealth };
        }

        // Tactical Logging
        let nextLogs = [...(m.tacticalLogs || [])];
        if (Math.random() > 0.7) {
          nextLogs = [TACTICAL_PHRASES[Math.floor(Math.random() * TACTICAL_PHRASES.length)], ...nextLogs].slice(0, 5);
        }

        // Success / Failure Checks
        if (nextHealth <= 0) {
          triggerNotification('failure', 'CREW NEUTRALIZED', m.title);
          return { ...m, status: 'failed', failureReason: 'Crew Vital Signs Lost', health: 0, tacticalLogs: ["CONNECTION TERMINATED."] };
        }

        if (m.endTime && now >= m.endTime) {
          triggerNotification('failure', 'WINDOW CLOSED', m.title);
          return { ...m, status: 'failed', failureReason: 'Extraction Blocked', tacticalLogs: ["TIME EXPIRED."] };
        }

        if (nextProgress >= 100 || (m.type === 'Combat' && nextEnemyHealth <= 0)) {
          const reward = Math.floor(m.reward * (nextHealth / 100 + 0.5));
          setBalance(b => b + reward);
          triggerNotification('success', `PAYOUT: $${reward.toLocaleString()}`, m.title);
          setXp(x => (x + 800) % maxXp);
          if (xp + 800 >= maxXp) setLevel(l => l + 1);
          return { ...m, status: 'completed', progress: 100, health: nextHealth, tacticalLogs: ["MISSION ACCOMPLISHED."] };
        }

        return { ...m, health: nextHealth, progress: nextProgress, enemyHealth: nextEnemyHealth, tacticalLogs: nextLogs };
      }));
    }, 1000);
    return () => clearInterval(timer);
  }, [characters, xp, maxXp, triggerNotification]);

  const handleAcceptMission = (id: string, characterId: string) => {
    const mission = missions.find(m => m.id === id);
    if (!mission) return;
    const duration = { Low: 45, Medium: 90, High: 180, Extreme: 300, Legendary: 600 }[mission.difficulty] * 1000;
    
    setMissions(prev => prev.map(m => 
      m.id === id ? { 
        ...m, 
        status: 'in-progress', 
        health: 100, 
        progress: 0, 
        enemyHealth: 100,
        assignedCharacterId: characterId,
        tacticalLogs: ["LINK ESTABLISHED. COMMENCING OPS."],
        endTime: Date.now() + duration
      } : m
    ));
    addLog(`INITIALIZED OPERATION: ${mission.title}`);
  };

  const handleResolveEvent = (missionId: string, optionIndex: number) => {
    setMissions(prev => prev.map(m => {
      if (m.id !== missionId || !m.activeEvent) return m;
      const option = m.activeEvent.options[optionIndex];
      let h = m.health || 100;
      let p = m.progress || 0;
      if (option.outcome === 'damage') h -= 20;
      if (option.outcome === 'progress') p += 20;
      if (option.outcome === 'success') p += 10;
      return { ...m, activeEvent: undefined, health: Math.max(0, h), progress: Math.min(100, p), tacticalLogs: [`DECISION: ${option.label}`, ...(m.tacticalLogs || [])] };
    }));
  };

  const addCharacter = (c: Character) => setCharacters(prev => [c, ...prev]);
  const addCar = (c: Car) => setCars(prev => [c, ...prev]);

  return (
    <div className="flex h-screen bg-[#020202] text-white font-inter selection:bg-cyan-500 selection:text-black overflow-hidden relative">
      <Sidebar currentView={view} setView={setView} onShowTutorial={() => setShowTutorial(true)} />
      
      {showTutorial && <TutorialModal onClose={() => setShowTutorial(false)} />}

      <main className="flex-1 overflow-y-auto p-8 md:p-12 scrollbar-hide relative z-10">
        <div className="fixed top-0 right-0 w-[1200px] h-[1200px] bg-cyan-500/5 rounded-full blur-[200px] -z-10 animate-pulse pointer-events-none" />
        
        {notification && (
          <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[1000] animate-in slide-in-from-top-10 duration-500">
            <div className={`glass px-8 py-5 rounded-3xl border ${notification.type === 'success' ? 'border-emerald-500/50 shadow-[0_0_40px_rgba(16,185,129,0.2)]' : 'border-red-500/50 shadow-[0_0_40px_rgba(239,68,68,0.2)]'}`}>
              <div className="flex items-center gap-4">
                {notification.type === 'success' ? <Zap className="text-emerald-400" /> : <Skull className="text-red-400" />}
                <div>
                  <h4 className="font-orbitron font-black uppercase text-xs tracking-widest">{notification.title}</h4>
                  <p className="text-zinc-400 text-[10px] font-mono uppercase">{notification.message}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {view === 'dashboard' && (
          <div className="space-y-10 animate-in fade-in duration-700">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-5xl font-orbitron font-black italic tracking-tighter uppercase">NEXUS <span className="text-cyan-400">HQ</span></h1>
                  <div className="bg-cyan-500/20 px-4 py-1 rounded-full border border-cyan-500/30 text-cyan-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                    <Trophy size={12} /> LEVEL {level}
                  </div>
                </div>
                <div className="flex items-center gap-3 text-zinc-500 text-xs font-mono uppercase tracking-widest">
                  <Wifi size={14} className="text-emerald-500 animate-pulse" />
                  <span>UPLINK STABLE // SECTOR 01</span>
                </div>
              </div>
              <div className="text-right glass p-6 rounded-[2rem] border-zinc-800">
                <div className="text-[10px] font-bold tracking-[0.2em] text-zinc-500 mb-1 uppercase">SYNDICATE BALANCE</div>
                <div className="text-4xl font-orbitron font-black text-emerald-400 italic">${balance.toLocaleString()}</div>
              </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { label: 'Manual', val: 'ACCESS', icon: Info, color: 'border-cyan-500', onClick: () => setShowTutorial(true) },
                { label: 'Terminal', val: 'HACK', icon: TerminalIcon, color: 'border-emerald-500', onClick: () => setView('terminal') },
                { label: 'Heat', val: `${notoriety}/5`, icon: Skull, color: 'border-red-500', onClick: null },
                { label: 'Ops', val: activeMissionsCount, icon: Zap, color: 'border-gold', onClick: () => setView('missions') },
              ].map((card, i) => (
                <div 
                  key={i} 
                  onClick={card.onClick || undefined}
                  className={`glass p-8 rounded-[2.5rem] border-l-4 ${card.color} hover:bg-white/5 transition-all cursor-pointer group relative overflow-hidden`}
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform" />
                  <card.icon className="text-zinc-400 mb-4 group-hover:scale-110 transition-transform" size={24} />
                  <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">{card.label}</div>
                  <div className="text-3xl font-orbitron font-black italic uppercase group-hover:text-white transition-colors">{card.val}</div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 glass p-8 rounded-[2.5rem] border-zinc-800 bg-black/40">
                <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
                  <h3 className="font-orbitron font-black text-xl italic uppercase flex items-center gap-3">
                    <Activity size={20} className="text-cyan-400" /> SYSTEM_LOGS
                  </h3>
                  <div className="text-[9px] font-black text-emerald-500 uppercase flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" /> LIVE FEED
                  </div>
                </div>
                <div className="space-y-3 font-mono text-[11px] max-h-[400px] overflow-y-auto pr-4 scrollbar-hide">
                  {logs.map((log, i) => (
                    <div key={i} className={`p-4 rounded-xl border border-white/5 bg-black/60 ${i === 0 ? 'text-cyan-400 border-cyan-500/20 shadow-[0_0_20px_rgba(6,182,212,0.05)]' : 'text-zinc-500'}`}>
                      {log}
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass p-10 rounded-[2.5rem] flex flex-col items-center justify-center text-center relative group border-zinc-800 bg-black/60">
                <div className="w-24 h-24 bg-zinc-900 rounded-[2rem] flex items-center justify-center mb-8 border border-white/10 group-hover:rotate-6 transition-all duration-500 shadow-2xl">
                  <TerminalIcon className="text-cyan-500" size={40} />
                </div>
                <h3 className="font-orbitron font-black text-3xl italic uppercase mb-2">OPERATIONS</h3>
                <p className="text-xs text-zinc-500 mb-10 uppercase font-bold tracking-[0.2em]">Recruit Crew // Buy Assets</p>
                <button 
                  onClick={() => setView('safehouse')}
                  className="w-full bg-white text-black py-5 rounded-2xl font-black text-sm hover:bg-cyan-400 transition-all transform hover:scale-[1.03] uppercase tracking-widest shadow-2xl active:scale-95"
                >
                  EXPAND EMPIRE
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="relative">
          {view === 'safehouse' && <CharacterView characters={characters} addCharacter={addCharacter} />}
          {view === 'garage' && <GarageView cars={cars} addCar={addCar} />}
          {view === 'map' && <MapView />}
          {view === 'terminal' && <TerminalView balance={balance} setBalance={setBalance} addLog={addLog} />}
          {view === 'missions' && (
            <MissionView 
              missions={missions} 
              characters={characters} 
              onAccept={handleAcceptMission} 
              onResolveEvent={handleResolveEvent}
              onGenerateMission={handleGenerateMission}
              isGenerating={isGeneratingMission}
              onShowTutorial={() => setShowTutorial(true)}
              onReplay={(id) => setMissions(prev => prev.map(m => m.id === id ? { ...m, status: 'available' } : m))}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
