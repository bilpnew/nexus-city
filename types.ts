
export interface Character {
  id: string;
  name: string;
  role: string;
  stats: {
    driving: number;
    shooting: number;
    hacking: number;
    strength: number;
  };
  imageUrl: string;
  description: string;
}

export interface Car {
  id: string;
  model: string;
  class: string;
  stats: {
    speed: number;
    handling: number;
    armor: number;
  };
  imageUrl: string;
  description: string;
}

export interface TacticalEvent {
  id: string;
  description: string;
  options: {
    label: string;
    outcome: 'success' | 'damage' | 'progress' | 'delay';
    detail: string;
  }[];
}

export interface Mission {
  id: string;
  title: string;
  difficulty: 'Low' | 'Medium' | 'High' | 'Extreme' | 'Legendary';
  reward: number;
  hook: string;
  objectives: string[];
  type: 'Heist' | 'Stealth' | 'Combat' | 'Driving' | 'Hacking';
  status: 'available' | 'in-progress' | 'completed' | 'failed';
  endTime?: number;
  prestigeLevel?: number;
  health?: number;
  progress?: number;
  enemyHealth?: number;
  assignedCharacterId?: string;
  failureReason?: string;
  tacticalLogs?: string[];
  activeEvent?: TacticalEvent;
}

export type GameView = 'dashboard' | 'garage' | 'safehouse' | 'map' | 'missions' | 'terminal';
