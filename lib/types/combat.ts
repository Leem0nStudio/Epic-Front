export type StatKey = 'hp' | 'atk' | 'def' | 'matk' | 'mdef' | 'agi';

export type Affinity = 'physical' | 'magic' | 'support' | 'ranged';

export type EffectType = 'damage' | 'heal' | 'buff' | 'debuff' | 'dot' | 'taunt' | 'shield' | 'apply_status';

export type TargetType = 'enemy' | 'ally' | 'self' | 'all_enemies' | 'all_allies' | 'random_enemy';

export interface SkillEffect {
  type: EffectType;
  scaling?: StatKey;
  power?: number;
  target: TargetType;
  status?: string;
  chance?: number;
  duration?: number;
  value?: number;
}

export interface SkillDefinition {
  id: string;
  name: string;
  type: 'active' | 'passive' | 'burst';
  cooldown: number;
  effects: SkillEffect[];
  description?: string;
}

export interface StatusEffect {
  id: string;
  name: string;
  type: 'buff' | 'debuff' | 'dot';
  stat?: StatKey;
  multiplier?: number;
  flatBonus?: number;
  duration: number; // in turns
  remainingTurns: number;
  appliedById: string;
}

export interface CombatUnit {
  id: string;
  instanceId: string; // The specific unit ID in the database
  name: string;
  side: 'player' | 'enemy';
  position: number; // 0-4 (0-2 front, 3-4 back)
  row: 'front' | 'back';

  stats: Record<StatKey, number>;
  currentHp: number;
  maxHp: number;

  burst: number; // 0 to 100

  skills: SkillDefinition[];
  cooldowns: Record<string, number>; // skillId -> remaining turns

  statusEffects: StatusEffect[];
  spriteId?: string;
  iconId?: string;
  jobId?: string;

  isDead: boolean;
  isStunned: boolean;
  isTaunting: boolean;
}

export interface CombatState {
  turn: number;
  round: number;
  units: CombatUnit[];
  activeUnitId: string | null;
  log: string[];
  isBattleOver: boolean;
  winner: 'player' | 'enemy' | null;
}
