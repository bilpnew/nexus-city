
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Character } from '../types';
import { generateCharacterData, generateCharacterImage } from '../services/gemini';
import StatBar from './StatBar';
import { Plus, User, Wand2, Loader2, AlertCircle, Sparkles, ShieldCheck } from 'lucide-react';

interface CharacterViewProps {
  characters: Character[];
  addCharacter: (char: Character) => void;
  onPlaySFX?: (type: 'nav' | 'recruit' | 'mission' | 'click') => void;
}

const CharacterView: React.FC<CharacterViewProps> = ({ characters, addCharacter, onPlaySFX }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [status, setStatus] = useState('');
  const [prompt, setPrompt] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt) return;
    setIsGenerating(true);
    setError(null);
    onPlaySFX?.('click');
    
    try {
      setStatus('Synthesizing Profile...');
      const metadata = await generateCharacterData(prompt);
      
      setStatus('Rendering Portrait...');
      const imageUrl = await generateCharacterImage(metadata.imagePrompt);
      
      onPlaySFX?.('recruit');
      addCharacter({
        id: Math.random().toString(36).substring(2, 9),
        name: metadata.name,
        role: metadata.role,
        description: metadata.description,
        imageUrl,
        stats: metadata.stats
      });
      setPrompt('');
    } catch (e: any) {
      setError(e.message || "Encryption error: Signal lost.");
    } finally {
      setIsGenerating(false);
      setStatus('');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="h-full flex flex-col"
    >
      <header className="mb-10 flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-orbitron font-black italic uppercase tracking-tighter">Syndicate <span className="text-cyan-400">Roster</span></h2>
          <p className="text-zinc-500 text-xs font-mono uppercase mt-2">Elite operatives for high-stakes heists.</p>
        </div>
        <div className="hidden md:flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-xl">
          <ShieldCheck size={14} className="text-emerald-400" />
          <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Free Flash Gen Active</span>
        </div>
      </header>

      <div className="glass p-8 rounded-[2.5rem] border-white/5 mb-10">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <input 
              type="text" 
              placeholder="Describe operative (e.g., 'Ex-con hacker who loves neon fashion')..."
              className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-cyan-500 shadow-inner text-sm transition-all"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isGenerating}
            />
            <Sparkles className="absolute right-5 top-1/2 -translate-y-1/2 text-cyan-400/50" size={20} />
          </div>
          <button 
            onClick={handleGenerate}
            disabled={isGenerating || !prompt}
            className="bg-cyan-500 hover:bg-cyan-400 disabled:bg-zinc-800 text-black font-black px-10 py-4 rounded-2xl transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3 min-w-[200px]"
          >
            {isGenerating ? (
              <div className="flex items-center gap-2">
                <Loader2 className="animate-spin" size={20} />
                <span className="text-[10px] uppercase tracking-tighter">{status}</span>
              </div>
            ) : (
              <>
                <Wand2 size={20} />
                <span>INTELLIGEN RECRUIT</span>
              </>
            )}
          </button>
        </div>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 overflow-y-auto scrollbar-hide pb-20 pr-2">
        {characters.map((char, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={char.id} 
            className="glass rounded-[2.5rem] overflow-hidden border-zinc-800/50 group hover:border-cyan-500/30 transition-all shadow-2xl"
          >
            <div className="aspect-[4/5] relative overflow-hidden bg-zinc-900">
              <img src={char.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2s]" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
              <div className="absolute bottom-8 left-8 right-8">
                <div className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.3em] mb-1">{char.role}</div>
                <h3 className="text-3xl font-orbitron font-black uppercase italic tracking-tighter leading-none">{char.name}</h3>
              </div>
            </div>
            <div className="p-8 space-y-6">
              <p className="text-[11px] text-zinc-500 font-mono italic leading-relaxed line-clamp-2 h-10 group-hover:text-zinc-300 transition-colors">
                "{char.description}"
              </p>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                <StatBar label="Shooting" value={char.stats.shooting} color="bg-red-500" />
                <StatBar label="Driving" value={char.stats.driving} color="bg-cyan-400" />
                <StatBar label="Hacking" value={char.stats.hacking} color="bg-purple-500" />
                <StatBar label="Strength" value={char.stats.strength} color="bg-yellow-500" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default CharacterView;
