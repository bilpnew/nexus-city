
import React, { useState } from 'react';
import { Character } from '../types';
import { generateCharacterImage } from '../services/gemini';
import StatBar from './StatBar';
import { Plus, User, Wand2, Loader2 } from 'lucide-react';

interface CharacterViewProps {
  characters: Character[];
  addCharacter: (char: Character) => void;
}

const CharacterView: React.FC<CharacterViewProps> = ({ characters, addCharacter }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [prompt, setPrompt] = useState('');

  const handleGenerate = async () => {
    if (!prompt) return;
    setIsGenerating(true);
    try {
      const imageUrl = await generateCharacterImage(prompt);
      const newChar: Character = {
        id: Math.random().toString(36).substring(2, 11),
        name: prompt.split(' ').slice(0, 2).join(' ') || "Unknown Asset",
        role: "Contractor",
        description: prompt,
        imageUrl,
        stats: {
          driving: Math.floor(Math.random() * 50) + 50,
          shooting: Math.floor(Math.random() * 50) + 50,
          hacking: Math.floor(Math.random() * 50) + 50,
          strength: Math.floor(Math.random() * 50) + 50,
        }
      };
      addCharacter(newChar);
      setPrompt('');
    } catch (error: any) {
      console.error("Recruitment System Failure:", error);
      alert(`Encryption error: Signal lost. ${error.message || ''}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <header className="mb-8">
        <h2 className="text-4xl font-orbitron font-black italic mb-2 uppercase tracking-tighter">SYNDICATE <span className="text-cyan-400">MANIFEST</span></h2>
        <p className="text-zinc-500 font-mono text-xs uppercase tracking-[0.2em]">Recruit and manage your elite operatives.</p>
      </header>

      <div className="flex gap-4 mb-8">
        <div className="flex-1 relative">
          <input 
            type="text" 
            placeholder="Describe your ideal operative (e.g., 'A veteran sniper with bionic eyes')..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-6 py-4 focus:outline-none focus:border-cyan-500 transition-colors shadow-inner text-sm"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
          />
          <Wand2 className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600" size={20} />
        </div>
        <button 
          onClick={handleGenerate}
          disabled={isGenerating || !prompt}
          className="bg-cyan-500 hover:bg-cyan-400 disabled:bg-zinc-800 text-black font-black px-8 py-4 rounded-xl transition-all flex items-center gap-2 group shadow-lg active:scale-95"
        >
          {isGenerating ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            <span className="flex items-center gap-2">RECRUIT <Plus size={20} className="group-hover:rotate-90 transition-transform" /></span>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto pr-2 scrollbar-hide pb-20">
        {characters.map((char) => (
          <div key={char.id} className="glass rounded-2xl overflow-hidden group hover:border-cyan-500/50 transition-all border border-white/5 bg-black/40">
            <div className="aspect-square relative overflow-hidden">
              <img src={char.imageUrl} alt={char.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
              <div className="absolute bottom-4 left-4 right-4">
                <div className="text-[9px] text-cyan-400 font-black tracking-[0.3em] mb-1">OPERATIVE // ID-{char.id.toUpperCase().slice(0,6)}</div>
                <h3 className="text-2xl font-orbitron font-black uppercase italic tracking-tighter">{char.name}</h3>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <StatBar label="Drive" value={char.stats.driving} color="bg-orange-400" />
                <StatBar label="Combat" value={char.stats.shooting} color="bg-red-500" />
                <StatBar label="Intel" value={char.stats.hacking} color="bg-purple-500" />
                <StatBar label="Power" value={char.stats.strength} color="bg-emerald-400" />
              </div>
              <p className="mt-4 text-[11px] text-zinc-500 italic leading-relaxed line-clamp-2 font-mono">
                "{char.description}"
              </p>
            </div>
          </div>
        ))}
        {characters.length === 0 && !isGenerating && (
          <div className="col-span-full py-32 border-2 border-dashed border-zinc-800 rounded-[3rem] flex flex-col items-center justify-center text-zinc-600 bg-black/20">
            <User size={48} className="mb-4 opacity-20" />
            <p className="font-orbitron font-bold uppercase tracking-[0.3em]">SYNDICATE EMPTY</p>
            <p className="text-[10px] mt-2 font-mono uppercase">Initiate recruitment sequence above</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CharacterView;
