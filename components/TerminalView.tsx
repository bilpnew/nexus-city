
import React, { useState, useEffect } from 'react';
import { Terminal, Cpu, Database, Shield, Zap, Loader2, AlertCircle } from 'lucide-react';

interface TerminalViewProps {
  balance: number;
  setBalance: React.Dispatch<React.SetStateAction<number>>;
  addLog: (msg: string) => void;
}

const TerminalView: React.FC<TerminalViewProps> = ({ balance, setBalance, addLog }) => {
  const [isHacking, setIsHacking] = useState(false);
  const [hackProgress, setHackProgress] = useState(0);
  const [currentNode, setCurrentNode] = useState('LOCAL_HOST');
  const [terminalLogs, setTerminalLogs] = useState<string[]>(['[SYSTEM] AUTHENTICATED AS ROOT', '[SYSTEM] ENCRYPTION LAYER ACTIVE']);

  const startHack = () => {
    setIsHacking(true);
    setHackProgress(0);
    const node = ['SWISS_BANK_CORE', 'CRYPTO_EXCHANGE_ALPHA', 'GLOBAL_SATELLITE_UPLINK'][Math.floor(Math.random() * 3)];
    setCurrentNode(node);
    setTerminalLogs(prev => [`[NETWORK] INJECTING EXPLOIT INTO ${node}...`, ...prev]);
  };

  useEffect(() => {
    if (isHacking) {
      const timer = setInterval(() => {
        setHackProgress(p => {
          if (p >= 100) {
            clearInterval(timer);
            setIsHacking(false);
            const reward = Math.floor(Math.random() * 250000) + 50000;
            setBalance(b => b + reward);
            addLog(`TERMINAL HACK SUCCESS: Extracted $${reward.toLocaleString()} from ${currentNode}`);
            setTerminalLogs(prev => [`[SUCCESS] DATA PACKET CAPTURED. REWARD: $${reward.toLocaleString()}`, ...prev]);
            return 100;
          }
          return p + (Math.random() * 5);
        });
      }, 200);
      return () => clearInterval(timer);
    }
  }, [isHacking, currentNode, setBalance, addLog]);

  return (
    <div className="h-full flex flex-col animate-in fade-in duration-700">
      <header className="mb-8">
        <h2 className="text-4xl font-orbitron font-black italic mb-2 tracking-tighter uppercase">CYBER <span className="text-emerald-400">TERMINAL</span></h2>
        <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest">Deep Web Node // Hacking Interface // {currentNode}</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 min-h-0">
        <div className="lg:col-span-2 glass rounded-[2.5rem] p-8 border border-white/5 flex flex-col bg-black/40">
          <div className="flex-1 font-mono text-[10px] space-y-2 overflow-y-auto pr-4 scrollbar-hide text-emerald-500/80">
            {terminalLogs.map((log, i) => (
              <div key={i} className={i === 0 ? "text-emerald-400 font-bold" : ""}>
                <span className="opacity-50 mr-3">{'>'}</span> {log}
              </div>
            ))}
            {isHacking && (
              <div className="mt-4 animate-pulse">
                [SYSTEM] DOWNLOADING ENCRYPTED BLOCKS: {hackProgress.toFixed(1)}%
                <div className="h-2 w-full bg-zinc-900 rounded-full mt-2 border border-emerald-500/20">
                  <div className="h-full bg-emerald-500 shadow-[0_0_15px_#10b981]" style={{ width: `${hackProgress}%` }} />
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-8 pt-8 border-t border-white/5 flex gap-4">
            <button 
              disabled={isHacking}
              onClick={startHack}
              className="flex-1 bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-800 text-black py-4 rounded-xl font-black text-xs uppercase tracking-widest shadow-2xl transition-all active:scale-95"
            >
              {isHacking ? <Loader2 className="animate-spin mx-auto" size={20} /> : "INITIALIZE BRUTE-FORCE"}
            </button>
            <button className="px-8 bg-zinc-900 border border-white/10 rounded-xl hover:bg-zinc-800 transition-colors">
              <Shield size={20} className="text-zinc-500" />
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass p-8 rounded-3xl border border-white/5">
            <h3 className="font-orbitron font-bold text-xs uppercase text-zinc-500 tracking-widest mb-6">Network Tools</h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-emerald-500/30 transition-all cursor-pointer group">
                <Database size={20} className="text-emerald-400" />
                <div>
                  <div className="text-[10px] font-black uppercase text-white">Database Scraper</div>
                  <div className="text-[9px] text-zinc-500">Extracts bank credentials</div>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-cyan-500/30 transition-all cursor-pointer group">
                <Cpu size={20} className="text-cyan-400" />
                <div>
                  <div className="text-[10px] font-black uppercase text-white">Node Overclocker</div>
                  <div className="text-[9px] text-zinc-500">Increases hack speed by 25%</div>
                </div>
              </div>
            </div>
          </div>

          <div className="glass p-8 rounded-3xl border border-white/5 bg-red-500/5">
            <div className="flex items-center gap-3 mb-4 text-red-500">
              <AlertCircle size={20} />
              <h3 className="font-orbitron font-bold text-xs uppercase tracking-widest">Trace Warning</h3>
            </div>
            <p className="text-[10px] text-zinc-500 leading-relaxed font-mono">
              The ICA is currently tracking sector signals. Hacking increases Notoriety by +0.5 per session. Current trace level: 12.4%.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TerminalView;
