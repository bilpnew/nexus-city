
import React from 'react';

interface StatBarProps {
  label: string;
  value: number;
  color?: string;
}

const StatBar: React.FC<StatBarProps> = ({ label, value, color = 'bg-cyan-400' }) => {
  return (
    <div className="mb-3">
      <div className="flex justify-between text-[10px] uppercase font-bold tracking-widest text-zinc-500 mb-1">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
        <div 
          className={`h-full ${color} transition-all duration-1000 ease-out`} 
          style={{ width: `${value}%`, boxShadow: `0 0 10px ${color}` }}
        />
      </div>
    </div>
  );
};

export default StatBar;
