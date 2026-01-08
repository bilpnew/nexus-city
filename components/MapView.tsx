
import React, { useState, useEffect } from 'react';
import { MapPin, Target, ShieldAlert, Zap, Search, Radar } from 'lucide-react';

const MapView: React.FC = () => {
  const [scanPos, setScanPos] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setScanPos(prev => (prev + 1) % 100);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-full flex flex-col">
      <header className="mb-6 flex justify-between items-start">
        <div>
          <h2 className="text-4xl font-orbitron font-black italic tracking-tighter">THE <span className="text-emerald-400">DISTRICT</span></h2>
          <div className="flex gap-4 mt-2">
            <span className="flex items-center gap-2 text-[10px] text-zinc-500 font-bold tracking-widest bg-zinc-900/50 px-3 py-1 rounded-full border border-zinc-800">
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse"/> 
              GRID SECTOR 7G-14
            </span>
            <span className="flex items-center gap-2 text-[10px] text-zinc-500 font-bold tracking-widest bg-zinc-900/50 px-3 py-1 rounded-full border border-zinc-800">
              <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444] animate-ping"/> 
              POLICE SCANNER: ACTIVE
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 text-emerald-400 hover:bg-emerald-500 hover:text-black transition-all">
            <Search size={20} />
          </button>
          <button className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 text-emerald-400 hover:bg-emerald-500 hover:text-black transition-all">
            <Radar size={20} />
          </button>
        </div>
      </header>

      <div className="flex-1 bg-black rounded-[2.5rem] relative overflow-hidden border border-zinc-800 p-8 shadow-2xl">
        {/* Dynamic Scanning Line */}
        <div 
          className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/10 to-transparent h-[100px] pointer-events-none z-10 transition-all duration-75"
          style={{ top: `${scanPos}%` }}
        />

        {/* Map Grid Grid */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            {[...Array(20)].map((_, i) => (
              <line key={i} x1={i*5} y1="0" x2={i*5} y2="100" stroke="#333" strokeWidth="0.1" />
            ))}
            {[...Array(20)].map((_, i) => (
              <line key={i} x1="0" y1={i*5} x2="100" y2={i*5} stroke="#333" strokeWidth="0.1" />
            ))}
          </svg>
        </div>

        {/* Stylized City Blocks */}
        <div className="absolute inset-0 p-12 opacity-30">
          <div className="w-full h-full border-2 border-zinc-800 rounded-3xl flex items-center justify-center">
            <div className="grid grid-cols-4 gap-8 w-full h-full p-4">
              {[...Array(16)].map((_, i) => (
                <div key={i} className="border border-zinc-800/50 rounded-lg bg-zinc-900/20" />
              ))}
            </div>
          </div>
        </div>

        {/* Interactive Pins */}
        <div className="absolute top-[25%] left-[35%] group cursor-pointer z-20">
          <div className="absolute -inset-6 bg-emerald-500/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity animate-pulse"/>
          <MapPin size={32} className="text-emerald-500 drop-shadow-[0_0_10px_#10b981] group-hover:scale-125 transition-transform" />
          <div className="absolute left-full ml-4 top-0 glass border border-emerald-500/30 p-5 rounded-2xl w-56 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all shadow-2xl">
            <div className="flex items-center gap-2 mb-1">
              <Zap size={14} className="text-emerald-400" />
              <h4 className="font-orbitron font-black text-xs text-emerald-400 uppercase tracking-tighter italic">Safehouse 01</h4>
            </div>
            <p className="text-[10px] text-zinc-400 leading-relaxed font-mono">STATUS: OPTIMAL<br/>FLEET: 2 UNITS READY<br/>SIGNAL: ENCRYPTED</p>
          </div>
        </div>

        <div className="absolute bottom-[30%] right-[25%] group cursor-pointer z-20">
          <div className="absolute -inset-8 bg-red-500/30 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity animate-pulse"/>
          <Target size={44} className="text-red-500 drop-shadow-[0_0_15px_#ef4444] animate-bounce" />
          <div className="absolute right-full mr-4 bottom-0 glass border border-red-500/30 p-5 rounded-2xl w-60 opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all shadow-2xl">
            <div className="flex items-center gap-2 mb-2">
              <ShieldAlert size={16} className="text-red-500" />
              <h4 className="font-orbitron font-black text-sm text-red-500 uppercase tracking-tighter italic">HIGH VALUE TARGET</h4>
            </div>
            <p className="text-[10px] text-zinc-400 leading-relaxed font-mono">LOCATION: VANTAGE CASINO<br/>SECURITY: S-TIER<br/>EST. PAYOUT: $2.5M</p>
            <button className="mt-3 w-full bg-red-500 text-black py-2 rounded-lg font-black text-[9px] uppercase tracking-widest hover:bg-white transition-colors">Analyze Security</button>
          </div>
        </div>

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none">
           <div className="w-48 h-48 border border-zinc-700/20 rounded-full animate-ping absolute -inset-0 opacity-10"/>
           <div className="w-32 h-32 border border-zinc-700/30 rounded-full animate-ping absolute top-8 left-8 opacity-20"/>
           <div className="w-4 h-4 bg-white rounded-full shadow-[0_0_30px_#fff,0_0_60px_#fff] animate-pulse"/>
           <span className="absolute top-full mt-6 left-1/2 -translate-x-1/2 text-[9px] font-black tracking-[0.4em] whitespace-nowrap text-white/50 bg-black/50 px-3 py-1 rounded-full border border-white/10 uppercase">Handoff Node // Local</span>
        </div>

        {/* Legend / Overlay */}
        <div className="absolute bottom-10 left-10 flex flex-col gap-3 z-30">
          <div className="flex items-center gap-4 glass px-5 py-3 rounded-2xl border border-zinc-800 group hover:border-emerald-500/50 transition-all cursor-default">
            <div className="w-3 h-3 bg-emerald-500 rounded-full shadow-[0_0_10px_#10b981]"/>
            <span className="text-[10px] font-black tracking-[0.2em] text-zinc-400 group-hover:text-white uppercase">Safe Zones</span>
          </div>
          <div className="flex items-center gap-4 glass px-5 py-3 rounded-2xl border border-zinc-800 group hover:border-red-500/50 transition-all cursor-default">
            <div className="w-3 h-3 bg-red-500 rounded-full shadow-[0_0_10px_#ef4444] animate-pulse"/>
            <span className="text-[10px] font-black tracking-[0.2em] text-zinc-400 group-hover:text-white uppercase">Police Hotspots</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapView;
