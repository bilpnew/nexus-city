
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Target, ShieldAlert, Zap, Search, Radar, Crosshair, DollarSign, AlertTriangle, Info } from 'lucide-react';

interface MapNode {
  id: string;
  type: 'safehouse' | 'target' | 'node';
  name: string;
  pos: { x: number; y: number };
  status: string;
  intel: string;
  risk: 'Low' | 'Medium' | 'High' | 'Extreme';
  payout?: string;
}

const MAP_NODES: MapNode[] = [
  // Sector 1: Downtown / Financial
  { id: 'sh1', type: 'safehouse', name: 'Downtown Penthouse', pos: { x: 35, y: 25 }, status: 'OPTIMAL', intel: 'Primary logistics hub. 2 fleet units ready.', risk: 'Low' },
  { id: 'tgt1', type: 'target', name: 'Vantage Casino', pos: { x: 42, y: 28 }, status: 'ACTIVE', intel: 'Vault contains $2.5M in bearer bonds.', risk: 'Extreme', payout: '$2,500,000' },
  { id: 'nd1', type: 'node', name: 'Main Exchange', pos: { x: 38, y: 20 }, status: 'STABLE', intel: 'Central fiber hub for the city.', risk: 'Medium' },
  { id: 'tgt5', type: 'target', name: 'Global Finance Tower', pos: { x: 45, y: 15 }, status: 'ACTIVE', intel: 'High-level server farm access.', risk: 'High', payout: '$1,800,000' },
  
  // Sector 2: The Docks / Industrial
  { id: 'sh2', type: 'safehouse', name: 'The Docks Cache', pos: { x: 80, y: 70 }, status: 'SECURE', intel: 'Secondary extraction point. Stealth specialized.', risk: 'Medium' },
  { id: 'tgt2', type: 'target', name: 'Union Depository', pos: { x: 75, y: 75 }, status: 'ACTIVE', intel: 'High-security transport incoming at 0400.', risk: 'High', payout: '$1,200,000' },
  { id: 'tgt6', type: 'target', name: 'Steel Mill Storage', pos: { x: 85, y: 80 }, status: 'ACTIVE', intel: 'Rare industrial chemicals cache.', risk: 'Medium', payout: '$600,000' },
  { id: 'nd2', type: 'node', name: 'Dockside Relay', pos: { x: 70, y: 65 }, status: 'OFFLINE', intel: 'Needs remote reboot to bypass port security.', risk: 'Low' },

  // Sector 3: North Mountains / Military Outskirts
  { id: 'sh3', type: 'safehouse', name: 'Mountain Lodge', pos: { x: 15, y: 10 }, status: 'SECURE', intel: 'Remote retreat for high-heat cooldown.', risk: 'Low' },
  { id: 'tgt3', type: 'target', name: 'Zancudo Hangar', pos: { x: 10, y: 15 }, status: 'ACTIVE', intel: 'Military hardware heist. Heavy armor required.', risk: 'Extreme', payout: '$4,800,000' },
  { id: 'tgt7', type: 'target', name: 'Research Lab Omega', pos: { x: 20, y: 5 }, status: 'ACTIVE', intel: 'Bio-tech prototype data.', risk: 'High', payout: '$2,100,000' },
  { id: 'nd3', type: 'node', name: 'Satellite Uplink', pos: { x: 5, y: 5 }, status: 'STABLE', intel: 'Military-grade encryption override.', risk: 'High' },

  // Sector 4: The Slums / Cyber-Hub
  { id: 'sh4', type: 'safehouse', name: 'Neon Alley Basement', pos: { x: 60, y: 50 }, status: 'ACTIVE', intel: 'Small but undetectable. Good for hacking jobs.', risk: 'Medium' },
  { id: 'tgt4', type: 'target', name: 'Cyber-Barrens Node', pos: { x: 65, y: 45 }, status: 'ACTIVE', intel: 'Illegal crypto mining farm.', risk: 'Medium', payout: '$950,000' },
  { id: 'tgt8', type: 'target', name: 'The Grid Club', pos: { x: 55, y: 55 }, status: 'ACTIVE', intel: 'Black market deal hub.', risk: 'High', payout: '$1,100,000' },
  { id: 'nd4', type: 'node', name: 'Sub-Net Access', pos: { x: 50, y: 48 }, status: 'STABLE', intel: 'Entry point for local cyber-grid.', risk: 'Low' },

  // Central Hub / Crossroads
  { id: 'nd5', type: 'node', name: 'Signal Jammer B4', pos: { x: 50, y: 50 }, status: 'STABLE', intel: 'Encryption node. Vulnerable to signal loss.', risk: 'Medium' },
  { id: 'tgt9', type: 'target', name: 'Central Transit Hub', pos: { x: 48, y: 52 }, status: 'ACTIVE', intel: 'Massive cash shipment transit.', risk: 'Extreme', payout: '$3,500,000' },
  { id: 'tgt10', type: 'target', name: 'Police Plaza (Infiltration)', pos: { x: 52, y: 48 }, status: 'ACTIVE', intel: 'Recover sensitive criminal files.', risk: 'Extreme', payout: '$5,000,000' },
];

const MapView: React.FC = () => {
  const [scanPos, setScanPos] = useState(0);
  const [selectedNode, setSelectedNode] = useState<MapNode | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setScanPos(prev => (prev + 1) % 100);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-full flex flex-col font-inter">
      <header className="mb-6 flex justify-between items-start">
        <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
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
        </motion.div>
        <div className="flex gap-2">
          <button className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 text-emerald-400 hover:bg-emerald-500 hover:text-black transition-all shadow-lg active:scale-95">
            <Search size={20} />
          </button>
          <button className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 text-emerald-400 hover:bg-emerald-500 hover:text-black transition-all shadow-lg active:scale-95">
            <Radar size={20} />
          </button>
        </div>
      </header>

      <div className="flex-1 bg-black rounded-[2.5rem] relative overflow-hidden border border-zinc-800 shadow-2xl">
        {/* Dynamic Scanning Line */}
        <div 
          className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/10 to-transparent h-[150px] pointer-events-none z-10 transition-all duration-75"
          style={{ top: `${scanPos}%` }}
        />

        {/* Map Grid */}
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            {[...Array(20)].map((_, i) => (
              <line key={`v-${i}`} x1={i*5} y1="0" x2={i*5} y2="100" stroke="#333" strokeWidth="0.05" />
            ))}
            {[...Array(20)].map((_, i) => (
              <line key={`h-${i}`} x1="0" y1={i*5} x2="100" y2={i*5} stroke="#333" strokeWidth="0.05" />
            ))}
          </svg>
        </div>

        {/* Nodes */}
        {MAP_NODES.map((node) => (
          <motion.div
            key={node.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: Math.random() * 0.5 }}
            className="absolute z-20 cursor-pointer"
            style={{ left: `${node.pos.x}%`, top: `${node.pos.y}%` }}
            onClick={() => setSelectedNode(node)}
          >
            <div className="relative group">
              <div className={`absolute -inset-4 rounded-full blur-xl opacity-0 group-hover:opacity-40 transition-opacity ${node.type === 'target' ? 'bg-red-600' : 'bg-emerald-500'}`} />
              
              {node.type === 'target' ? (
                <Target size={28} className="text-red-500 drop-shadow-[0_0_8px_#ef4444] animate-pulse" />
              ) : node.type === 'safehouse' ? (
                <MapPin size={28} className="text-emerald-500 drop-shadow-[0_0_8px_#10b981]" />
              ) : (
                <div className="w-4 h-4 bg-white rounded-full shadow-[0_0_10px_#fff]" />
              )}

              {/* Mini Label */}
              <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-[8px] font-black tracking-widest text-white bg-black/80 px-2 py-1 rounded border border-white/20 uppercase">
                  {node.name}
                </span>
              </div>
            </div>
          </motion.div>
        ))}

        {/* Selected Node Details Pop-up */}
        <AnimatePresence>
          {selectedNode && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              className="absolute bottom-10 right-10 z-50 glass border border-white/20 p-8 rounded-[2.5rem] w-80 shadow-[0_20px_60px_rgba(0,0,0,0.8)]"
            >
              <button 
                onClick={() => setSelectedNode(null)}
                className="absolute top-4 right-4 text-zinc-500 hover:text-white"
              >
                <Radar size={16} />
              </button>
              
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-lg ${selectedNode.type === 'target' ? 'bg-red-500/20 text-red-500' : 'bg-emerald-500/20 text-emerald-500'}`}>
                  {selectedNode.type === 'target' ? <Crosshair size={20}/> : <ShieldAlert size={20}/>}
                </div>
                <div>
                  <h4 className="font-orbitron font-black text-sm uppercase italic tracking-tighter">{selectedNode.name}</h4>
                  <div className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">{selectedNode.status}</div>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <div className="text-[9px] font-black text-zinc-600 uppercase mb-1 flex items-center gap-1">
                    <Info size={10} /> FIELD_INTEL
                  </div>
                  <p className="text-[11px] text-zinc-400 font-mono leading-relaxed italic">
                    "{selectedNode.intel}"
                  </p>
                </div>
                
                <div className="flex gap-4">
                  <div className="flex-1">
                    <div className="text-[9px] font-black text-zinc-600 uppercase mb-1">RISK_LVL</div>
                    <div className={`text-xs font-black uppercase tracking-widest ${
                      selectedNode.risk === 'Extreme' ? 'text-red-600' : 
                      selectedNode.risk === 'High' ? 'text-orange-500' : 'text-emerald-500'
                    }`}>
                      {selectedNode.risk}
                    </div>
                  </div>
                  {selectedNode.payout && (
                    <div className="flex-1">
                      <div className="text-[9px] font-black text-zinc-600 uppercase mb-1">EST_PAYOUT</div>
                      <div className="text-xs font-black text-emerald-400 font-orbitron">{selectedNode.payout}</div>
                    </div>
                  )}
                </div>
              </div>

              <button className={`w-full py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95 shadow-xl ${
                selectedNode.type === 'target' ? 'bg-red-600 hover:bg-red-500 text-white' : 'bg-white hover:bg-emerald-400 text-black'
              }`}>
                {selectedNode.type === 'target' ? 'ANALYZE SECURITY' : 'REDEPLOY ASSETS'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none">
           <div className="w-64 h-64 border border-emerald-500/5 rounded-full animate-ping absolute -inset-0 opacity-10"/>
           <div className="w-4 h-4 bg-white rounded-full shadow-[0_0_30px_#fff] animate-pulse"/>
           <span className="absolute top-full mt-6 left-1/2 -translate-x-1/2 text-[9px] font-black tracking-[0.4em] whitespace-nowrap text-white/50 bg-black/50 px-3 py-1 rounded-full border border-white/10 uppercase">Handoff Node // Local</span>
        </div>

        {/* Legend */}
        <div className="absolute bottom-10 left-10 flex flex-col gap-3 z-30">
          <div className="flex items-center gap-4 glass px-5 py-3 rounded-2xl border border-white/5 group hover:border-emerald-500/50 transition-all cursor-default">
            <div className="w-3 h-3 bg-emerald-500 rounded-full shadow-[0_0_10px_#10b981]"/>
            <span className="text-[10px] font-black tracking-[0.2em] text-zinc-400 group-hover:text-white uppercase">Safe Zones</span>
          </div>
          <div className="flex items-center gap-4 glass px-5 py-3 rounded-2xl border border-white/5 group hover:border-red-500/50 transition-all cursor-default">
            <div className="w-3 h-3 bg-red-500 rounded-full shadow-[0_0_10px_#ef4444] animate-pulse"/>
            <span className="text-[10px] font-black tracking-[0.2em] text-zinc-400 group-hover:text-white uppercase">High Threat</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapView;
