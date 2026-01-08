
import React, { useState } from 'react';
import { Car } from '../types';
import { generateCarImage } from '../services/gemini';
import StatBar from './StatBar';
import { Plus, Car as CarIcon, Wand2, Loader2, Gauge, Shield } from 'lucide-react';

interface GarageViewProps {
  cars: Car[];
  addCar: (car: Car) => void;
  onPlaySFX?: (type: 'nav' | 'recruit' | 'mission' | 'click') => void;
}

const GarageView: React.FC<GarageViewProps> = ({ cars, addCar, onPlaySFX }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [prompt, setPrompt] = useState('');

  const handleGenerate = async () => {
    if (!prompt) return;
    setIsGenerating(true);
    onPlaySFX?.('click');
    try {
      const imageUrl = await generateCarImage(prompt);
      onPlaySFX?.('recruit'); // reusing recruit for assembly
      const newCar: Car = {
        id: Math.random().toString(36).substring(2, 11),
        model: prompt.split(' ').slice(0, 2).join(' ') || "Experimental Unit",
        class: "Prototype",
        description: prompt,
        imageUrl,
        stats: {
          speed: Math.floor(Math.random() * 40) + 60,
          handling: Math.floor(Math.random() * 40) + 60,
          armor: Math.floor(Math.random() * 40) + 60,
        }
      };
      addCar(newCar);
      setPrompt('');
    } catch (error: any) {
      console.error("Assembly System Malfunction:", error);
      alert(`Hardware malfunction: Assembly aborted. ${error.message || ''}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <header className="mb-8">
        <h2 className="text-4xl font-orbitron font-black italic mb-2 uppercase tracking-tighter">THE <span className="text-yellow-400">FLEET</span></h2>
        <p className="text-zinc-500 font-mono text-xs uppercase tracking-[0.2em]">Customize and deploy high-performance assets.</p>
      </header>

      <div className="flex gap-4 mb-8">
        <div className="flex-1 relative">
          <input 
            type="text" 
            placeholder="Design a masterpiece (e.g., 'Matte carbon fiber hypercar with blue underglow')..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-6 py-4 focus:outline-none focus:border-yellow-500 transition-colors shadow-inner text-sm"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
          />
          <Wand2 className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600" size={20} />
        </div>
        <button 
          onClick={handleGenerate}
          disabled={isGenerating || !prompt}
          className="bg-yellow-400 hover:bg-yellow-300 disabled:bg-zinc-800 text-black font-black px-8 py-4 rounded-xl transition-all flex items-center gap-2 shadow-lg active:scale-95"
        >
          {isGenerating ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            <span className="flex items-center gap-2">ASSEMBLE <Plus size={20} /></span>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 overflow-y-auto pr-2 scrollbar-hide pb-20">
        {cars.map((car) => (
          <div key={car.id} className="glass rounded-3xl overflow-hidden group hover:border-yellow-500/50 transition-all border border-zinc-800 bg-black/40">
            <div className="aspect-video relative overflow-hidden">
              <img src={car.imageUrl} alt={car.model} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
              <div className="absolute top-6 right-6">
                <span className="bg-black/80 backdrop-blur px-4 py-2 rounded-full border border-yellow-500/30 text-yellow-400 font-black italic text-xs tracking-widest uppercase">S-CLASS UNIT</span>
              </div>
            </div>
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className="text-[10px] text-yellow-500 font-black tracking-[0.3em] mb-1 uppercase">ASSET // ID-{car.id.toUpperCase().slice(0,6)}</div>
                  <h3 className="text-3xl font-orbitron font-black uppercase italic tracking-tighter">{car.model}</h3>
                </div>
                <div className="flex gap-2">
                  <div className="w-10 h-10 rounded-lg bg-zinc-950 border border-white/5 flex items-center justify-center text-zinc-400"><Gauge size={20}/></div>
                  <div className="w-10 h-10 rounded-lg bg-zinc-950 border border-white/5 flex items-center justify-center text-zinc-400"><Shield size={20}/></div>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-6 mb-6">
                <StatBar label="Speed" value={car.stats.speed} color="bg-yellow-400" />
                <StatBar label="Handling" value={car.stats.handling} color="bg-cyan-400" />
                <StatBar label="Armor" value={car.stats.armor} color="bg-red-500" />
              </div>

              <div className="flex items-center gap-4 pt-6 border-t border-white/5">
                <button 
                  onClick={() => onPlaySFX?.('click')}
                  className="flex-1 bg-zinc-900 hover:bg-zinc-800 border border-white/5 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-colors"
                >
                  UPGRADE
                </button>
                <button 
                  onClick={() => onPlaySFX?.('click')}
                  className="flex-1 bg-yellow-400 text-black py-4 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-yellow-300 transition-colors shadow-lg active:scale-95"
                >
                  EQUIP ASSET
                </button>
              </div>
            </div>
          </div>
        ))}
        {cars.length === 0 && !isGenerating && (
          <div className="col-span-full py-40 border-2 border-dashed border-zinc-800 rounded-[3rem] flex flex-col items-center justify-center text-zinc-600 bg-black/20">
            <CarIcon size={64} className="mb-4 opacity-20" />
            <p className="font-orbitron font-bold text-xl uppercase tracking-[0.3em]">GARAGE OFFLINE</p>
            <p className="text-[10px] mt-2 font-mono uppercase opacity-60">Authorize production in the terminal</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GarageView;
