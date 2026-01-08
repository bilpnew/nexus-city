
import React, { useState } from 'react';
import { Car } from '../types';
import { generateCarData, generateCarImage } from '../services/gemini';
import StatBar from './StatBar';
import { Plus, Car as CarIcon, Wand2, Loader2, Gauge, Shield, Sparkles, Cpu, MonitorOff } from 'lucide-react';

interface GarageViewProps {
  cars: Car[];
  addCar: (car: Car) => void;
  onPlaySFX?: (type: 'nav' | 'recruit' | 'mission' | 'click') => void;
  isOffline?: boolean;
}

const GarageView: React.FC<GarageViewProps> = ({ cars, addCar, onPlaySFX, isOffline }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [status, setStatus] = useState('');
  const [prompt, setPrompt] = useState('');

  const handleGenerate = async () => {
    if (isOffline) return;
    if (!prompt) return;
    setIsGenerating(true);
    onPlaySFX?.('click');
    try {
      setStatus('Simulating Specs...');
      const metadata = await generateCarData(prompt);
      
      setStatus('Assembling Chassis...');
      const imageUrl = await generateCarImage(metadata.imagePrompt);
      
      onPlaySFX?.('recruit');
      const newCar: Car = {
        id: Math.random().toString(36).substring(2, 11),
        model: metadata.model,
        class: metadata.class,
        description: metadata.description,
        imageUrl,
        stats: metadata.stats
      };
      addCar(newCar);
      setPrompt('');
    } catch (error: any) {
      console.error("Assembly System Malfunction:", error);
      alert(`Hardware malfunction: Assembly aborted. ${error.message || ''}`);
    } finally {
      setIsGenerating(false);
      setStatus('');
    }
  };

  return (
    <div className="h-full flex flex-col">
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-orbitron font-black italic mb-2 uppercase tracking-tighter">THE <span className="text-yellow-400">FLEET</span></h2>
          <p className="text-zinc-500 font-mono text-xs uppercase tracking-[0.2em]">Customize and deploy high-performance assets.</p>
        </div>
        <div className={`hidden md:flex items-center gap-2 border px-4 py-2 rounded-xl ${isOffline ? 'bg-red-500/10 border-red-500/20' : 'bg-yellow-400/10 border-yellow-400/20'}`}>
          {isOffline ? (
            <>
              <MonitorOff size={14} className="text-red-400" />
              <span className="text-[10px] font-black text-red-400 uppercase tracking-widest">Neural Link Suspended</span>
            </>
          ) : (
            <>
              <Cpu size={14} className="text-yellow-400" />
              <span className="text-[10px] font-black text-yellow-400 uppercase tracking-widest">Free Flash Gen Active</span>
            </>
          )}
        </div>
      </header>

      <div className="glass p-8 rounded-[2.5rem] border-white/5 mb-10 relative overflow-hidden">
        {isOffline && <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] z-10 flex items-center justify-center">
            <div className="text-center">
               <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-2">Assembly Line Offline</p>
               <p className="text-[9px] text-zinc-600 font-mono">LINK API KEY TO UNLOCK DESIGNER</p>
            </div>
        </div>}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <input 
              type="text" 
              placeholder={isOffline ? "Neural Link Required..." : "Design a masterpiece (e.g., 'Cyberpunk drifter with wide body kit')..."}
              className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-yellow-500 shadow-inner text-sm transition-all"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
              disabled={isGenerating || isOffline}
            />
            <Sparkles className="absolute right-5 top-1/2 -translate-y-1/2 text-yellow-400/50" size={20} />
          </div>
          <button 
            onClick={handleGenerate}
            disabled={isGenerating || !prompt || isOffline}
            className="bg-yellow-400 hover:bg-yellow-300 disabled:bg-zinc-800 text-black font-black px-10 py-4 rounded-2xl transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3 min-w-[200px]"
          >
            {isGenerating ? (
              <div className="flex items-center gap-2">
                <Loader2 className="animate-spin" size={20} />
                <span className="text-[10px] uppercase tracking-tighter">{status}</span>
              </div>
            ) : (
              <>
                <Wand2 size={20} />
                <span>AI ASSEMBLY</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 overflow-y-auto pr-2 scrollbar-hide pb-20">
        {cars.map((car) => (
          <div key={car.id} className="glass rounded-[3rem] overflow-hidden group hover:border-yellow-500/50 transition-all border border-zinc-800 bg-black/40 shadow-2xl">
            <div className="aspect-video relative overflow-hidden">
              <img src={car.imageUrl} alt={car.model} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[3s]" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
              <div className="absolute top-8 right-8">
                <span className="bg-black/80 backdrop-blur px-5 py-2 rounded-full border border-yellow-500/30 text-yellow-400 font-black italic text-[10px] tracking-widest uppercase shadow-xl">
                  {car.class}
                </span>
              </div>
            </div>
            <div className="p-10">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <div className="text-[10px] text-yellow-500 font-black tracking-[0.3em] mb-1 uppercase">CHASSIS // ID-{car.id.toUpperCase().slice(0,6)}</div>
                  <h3 className="text-4xl font-orbitron font-black uppercase italic tracking-tighter leading-none">{car.model}</h3>
                </div>
                <div className="flex gap-2">
                  <div className="w-12 h-12 rounded-xl bg-zinc-950 border border-white/5 flex items-center justify-center text-zinc-400 shadow-inner group-hover:text-yellow-400 transition-colors">
                    <Gauge size={24}/>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-zinc-950 border border-white/5 flex items-center justify-center text-zinc-400 shadow-inner group-hover:text-yellow-400 transition-colors">
                    <Shield size={24}/>
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-zinc-500 font-mono italic leading-relaxed mb-8 group-hover:text-zinc-300 transition-colors">
                "{car.description}"
              </p>
              
              <div className="grid grid-cols-3 gap-8 mb-10">
                <StatBar label="Speed" value={car.stats.speed} color="bg-yellow-400" />
                <StatBar label="Handling" value={car.stats.handling} color="bg-cyan-400" />
                <StatBar label="Armor" value={car.stats.armor} color="bg-red-500" />
              </div>

              <div className="flex items-center gap-4 pt-8 border-t border-white/5">
                <button 
                  onClick={() => onPlaySFX?.('click')}
                  className="flex-1 bg-zinc-900 hover:bg-zinc-800 border border-white/10 py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all"
                >
                  MOD TECH
                </button>
                <button 
                  onClick={() => onPlaySFX?.('click')}
                  className="flex-1 bg-yellow-400 text-black py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-white transition-all shadow-xl shadow-yellow-400/20 active:scale-95"
                >
                  DEPLOY UNIT
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GarageView;
