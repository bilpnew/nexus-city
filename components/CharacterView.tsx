
import React, { useState } from 'react';
import { Character } from '../types';
import { generateCharacterImage } from '../services/gemini';
import StatBar from './StatBar';
import { Plus, User, Wand2, Loader2, Shield, Zap, Target, Cpu } from 'lucide-react';

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
        id: Math.random().toString(36).substr(2, 9),
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
    } catch (error) {
      console.error(error);
      alert("Encryption error: Signal lost.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <header className="mb-8">
        <h2 className="text-4xl font-orbitron font-black italic mb-2">SYNDICATE <span className="text-cyan-400">MANIFEST</span></h2>
        <p className="text-zinc-500">Recruit and manage your elite operatives.</p>
      </header>

      <div className="flex gap-4 mb-8">
        <div className="flex-1 relative">
          <input 
            type="text" 
            placeholder="Describe your ideal operative (e.g., 'A veteran sniper with bionic eyes')..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-6 py-4 focus:outline-none focus:border-cyan-500 transition-colors"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <Wand2 className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600" size={20} />
        </div>
        <button 
          onClick={handleGenerate}
          disabled={isGenerating || !prompt}
          className="bg-cyan-500 hover:bg-cyan-400 disabled:bg-zinc-800 text-black font-black px-8 py-4 rounded-xl transition-all flex items-center gap-2 group"
        >
          {isGenerating ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            <>RECRUIT <Plus size={20} className="group-hover:rotate-90 transition-transform" /></>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto pr-2">
        {characters.map((char) => (
          <div key={char.id} className="glass rounded-2xl overflow-hidden group hover:border-cyan-500/50 transition-all">
            <div className="aspect-square relative overflow-hidden">
              <img src={char.imageUrl} alt={char.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
              <div className="absolute bottom-4 left-4 right-4">
                <div className="text-xs text-cyan-400 font-bold tracking-[0.2em] mb-1">OPERATIVE // {char.id}</div>
                <h3 className="text-2xl font-orbitron font-black uppercase italic">{char.name}</h3>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <StatBar label="Drive" value={char.stats.driving} color="bg-orange-400" />
                <StatBar label="Combat" value={char.stats.shooting} color="bg-red-500" />
                <StatBar label="Intel" value={char.stats.hacking} color="bg-purple-500" />
                <StatBar label="Power" value={char.stats.strength} color="bg-emerald-400" />
              </div>
              <p className="mt-4 text-xs text-zinc-500 italic leading-relaxed line-clamp-2">
                "{char.description}"
              </p>
            </div>
          </div>
        ))}
        {characters.length === 0 && !isGenerating && (
          <div className="col-span-full py-20 border-2 border-dashed border-zinc-800 rounded-3xl flex flex-col items-center justify-center text-zinc-600">
            <User size={48} className="mb-4 opacity-20" />
            <p className="font-orbitron font-bold">SYNDICATE EMPTY</p>
            <p className="text-sm">Initiate recruitment sequence above</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CharacterView;
