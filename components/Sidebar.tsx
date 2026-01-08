
import React from 'react';
import { GameView } from '../types';
import { 
  LayoutDashboard, 
  Car, 
  Users, 
  Map as MapIcon, 
  Target, 
  Terminal,
  LogOut,
  Zap,
  HelpCircle
} from 'lucide-react';

interface SidebarProps {
  currentView: GameView;
  setView: (view: GameView) => void;
  onShowTutorial?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, onShowTutorial }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'safehouse', label: 'Crew', icon: Users },
    { id: 'garage', label: 'Garage', icon: Car },
    { id: 'map', label: 'The City', icon: MapIcon },
    { id: 'missions', label: 'Contracts', icon: Target },
  ];

  return (
    <div className="w-20 md:w-72 h-screen bg-black border-r border-zinc-900 flex flex-col items-center md:items-stretch z-50">
      <div className="p-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-cyan-500 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.4)]">
            <Zap size={24} className="text-black" fill="currentColor" />
          </div>
          <h1 className="hidden md:block font-orbitron text-2xl font-black text-white tracking-tighter italic">
            NEXUS<span className="text-cyan-400">.</span>
          </h1>
        </div>
      </div>

      <nav className="flex-1 px-6 space-y-3 mt-12">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setView(item.id as GameView)}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 group ${
                isActive 
                  ? 'bg-white text-black shadow-[0_10px_30px_rgba(255,255,255,0.1)]' 
                  : 'text-zinc-500 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <Icon size={20} className={isActive ? 'text-black' : 'group-hover:scale-110 transition-transform'} />
              <span className="hidden md:block font-bold text-xs uppercase tracking-widest">{item.label}</span>
              {isActive && <div className="hidden md:block ml-auto w-1 h-1 bg-black rounded-full" />}
            </button>
          );
        })}
        
        <button
          onClick={onShowTutorial}
          className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-zinc-500 hover:text-cyan-400 hover:bg-cyan-400/5 transition-all duration-300 group"
        >
          <HelpCircle size={20} className="group-hover:scale-110 transition-transform" />
          <span className="hidden md:block font-bold text-xs uppercase tracking-widest">How to Play</span>
        </button>
      </nav>

      <div className="p-6 border-t border-zinc-900">
        <div className="mb-6 hidden md:block">
          <div className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-2">Network Status</div>
          <div className="h-1 w-full bg-zinc-900 rounded-full overflow-hidden">
            <div className="h-full w-2/3 bg-emerald-500" />
          </div>
        </div>
        <button className="w-full flex items-center gap-4 px-5 py-4 text-zinc-500 hover:text-red-400 transition-colors rounded-2xl hover:bg-red-500/5 group">
          <LogOut size={20} className="group-hover:rotate-12 transition-transform" />
          <span className="hidden md:block font-bold text-xs uppercase tracking-widest">Disconnect</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
