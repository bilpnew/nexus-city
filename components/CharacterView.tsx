
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Character } from '../types';
import { generateCharacterImage } from '../services/gemini';
import StatBar from './StatBar';
import { Plus, User, Wand2, Loader2, AlertCircle } from 'lucide-react';

interface CharacterViewProps {
  characters: Character[];
  addCharacter: (char: Character) => void;
  onPlaySFX?: (type: 'nav' | 'recruit' | 'mission' | 'click') => void;
}

const CharacterView: React.FC<CharacterViewProps> = ({ characters, addCharacter, onPlaySFX }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt) return;
    setIsGenerating(true);
    setError(null);
    onPlaySFX?.('click');
    try {
      const imageUrl = await generateCharacterImage(prompt);
      onPlaySFX?.('recruit');
      addCharacter({
        id: Math.random().toString(36).substring(2, 9),
        name: prompt.split(' ')[0] || "Unknown",
        role: "Contractor",
        description: prompt,
        imageUrl,
        stats: { driving: 75, shooting: 80, hacking: 60, strength: 70 }
      });
      setPrompt('');
    } catch (e: any) {
      setError(e.message || "Encryption error: Signal lost.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="h-full flex flex-col"
    >
      <header className="mb-10">
        <h2 className="text-4xl font-orbitron font-black italic uppercase tracking-tighter">Syndicate <span className="text-cyan-400">Roster</span></h2>
        <p className="text-zinc-500 text-xs font-mono uppercase mt-2">Elite operatives for high-stakes heists.</p>
      </header>

      <div className="flex gap-4 mb-10">
        <div className="flex-1 relative">
          <input 
            type="text" 
            placeholder="Describe operative profile..."
            className="w-full bg-zinc-900 border border-white/5 rounded-2xl px-6 py-4 focus:outline-none focus:border-cyan-500 shadow-inner"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <Wand2 className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-600" size={20} />
        </div>
        <button 
          onClick={handleGenerate}
          disabled={isGenerating || !prompt}
          className="bg-cyan-500 hover:bg-cyan-400 disabled:bg-zinc-800 text-black font-black px-10 py-4 rounded-2xl transition-all shadow-xl active:scale-95 flex items-center gap-2"
        >
          {isGenerating ? <Loader2 className="animate-spin" size={20} /> : "RECRUIT"}
        </button>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-500 text-xs flex items-center gap-3 font-mono"
          >
            <AlertCircle size={16} /> {error}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 overflow-y-auto scrollbar-hide pb-20">
        {characters.map((char, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={char.id} 
            className="glass rounded-[2rem] overflow-hidden border-zinc-800/50 group"
          >
            <div className="aspect-square relative overflow-hidden bg-zinc-900">
              <img src={char.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
              <div className="absolute bottom-6 left-6">
                <h3 className="text-2xl font-orbitron font-black uppercase italic">{char.name}</h3>
              </div>
            </div>
            <div className="p-6">
              <StatBar label="Combat" value={char.stats.shooting} color="bg-red-500" />
              <StatBar label="Drive" value={char.stats.driving} color="bg-cyan-400" />
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default CharacterView;
