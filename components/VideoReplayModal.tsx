
import React from 'react';
import { motion } from 'framer-motion';
import { X, Share2, Twitter, Facebook, Link as LinkIcon, Download, Loader2, Play } from 'lucide-react';

interface VideoReplayModalProps {
  videoUrl: string | null;
  isLoading: boolean;
  statusMessage: string;
  onClose: () => void;
}

const VideoReplayModal: React.FC<VideoReplayModalProps> = ({ videoUrl, isLoading, statusMessage, onClose }) => {
  const handleShare = (platform: string) => {
    const text = "Check out my high-stakes heist replay from Nexus City!";
    const url = window.location.href;
    
    if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
    } else if (platform === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
    } else {
      navigator.clipboard.writeText(url);
      alert("Link copied to clipboard!");
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[300] flex items-center justify-center bg-black/90 backdrop-blur-2xl p-6"
    >
      <div className="glass max-w-5xl w-full rounded-[3rem] border border-white/10 overflow-hidden relative shadow-[0_0_100px_rgba(6,182,212,0.1)]">
        <button 
          onClick={onClose}
          className="absolute top-8 right-8 z-10 p-4 rounded-full bg-black/50 hover:bg-zinc-800 transition-colors text-white"
        >
          <X size={24} />
        </button>

        <div className="p-12">
          <header className="mb-8">
            <h2 className="text-4xl font-orbitron font-black italic uppercase tracking-tighter">AI <span className="text-cyan-400">ACTION REPLAY</span></h2>
            <p className="text-zinc-500 font-mono text-[10px] tracking-widest uppercase mt-2">DECRYPTED RECONNAISSANCE FOOTAGE</p>
          </header>

          <div className="aspect-video bg-zinc-900 rounded-[2rem] border border-white/5 flex items-center justify-center relative overflow-hidden">
            {isLoading ? (
              <div className="flex flex-col items-center gap-6 text-center px-10">
                <div className="relative">
                  <Loader2 size={64} className="text-cyan-400 animate-spin" />
                  <div className="absolute inset-0 blur-xl bg-cyan-400/20 animate-pulse rounded-full" />
                </div>
                <div>
                  <div className="text-xs font-black uppercase tracking-[0.3em] text-cyan-400 animate-pulse mb-2">Generating Replay</div>
                  <div className="text-[10px] font-mono text-zinc-500 max-w-xs">{statusMessage}</div>
                </div>
              </div>
            ) : videoUrl ? (
              <video 
                src={videoUrl} 
                className="w-full h-full object-cover" 
                controls 
                autoPlay 
                loop
              />
            ) : (
              <div className="text-zinc-600 text-xs font-mono uppercase">Neural link lost</div>
            )}
          </div>

          <div className="mt-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Share Transmission</div>
              <div className="flex gap-4">
                <button 
                  onClick={() => handleShare('twitter')}
                  className="p-4 rounded-2xl bg-white/5 hover:bg-cyan-500 hover:text-black transition-all border border-white/5"
                >
                  <Twitter size={20} />
                </button>
                <button 
                  onClick={() => handleShare('facebook')}
                  className="p-4 rounded-2xl bg-white/5 hover:bg-cyan-500 hover:text-black transition-all border border-white/5"
                >
                  <Facebook size={20} />
                </button>
                <button 
                  onClick={() => handleShare('link')}
                  className="p-4 rounded-2xl bg-white/5 hover:bg-cyan-500 hover:text-black transition-all border border-white/5"
                >
                  <LinkIcon size={20} />
                </button>
              </div>
            </div>

            <div className="flex gap-4 w-full md:w-auto">
              <button 
                className="flex-1 md:flex-none px-10 py-4 bg-zinc-900 border border-white/10 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-zinc-800 transition-all flex items-center justify-center gap-2"
              >
                <Download size={16} /> SAVE LOG
              </button>
              <button 
                onClick={onClose}
                className="flex-1 md:flex-none px-10 py-4 bg-cyan-500 text-black rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white transition-all shadow-xl shadow-cyan-500/20"
              >
                CLOSE REPLAY
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default VideoReplayModal;
