export type ItemType = 'Weapon' | 'Armor' | 'Accessory';

export interface Item {
  id: string;
  name: string;
  type: ItemType;
  sprite: { col: number; row: number; className?: string };
  rarity: number;
  stats: { hp: number; atk: number; def: number; rec: number };
  description: string;
  effects?: string[];
}

export interface CharacterSkill {
  id: string;
  type: string;
  title: string;
  description: string;
  cost?: number | string;
  iconType?: string;
  level: number;
  maxLevel: number;
  upgradeCost: number;
}

export interface CharacterData {
  id: string;
  name: string;
  title: string;
  element: 'Water' | 'Fire' | 'Earth' | 'Dark' | 'Thunder';
  rarity: number;
  level: number;
  maxLevel: number;
  exp: number;
  maxExp: number;
  cost: number;
  baseStats: { hp: number; atk: number; def: number; rec: number };
  spriteUrl: string;
  cssFilter: string;
  skills: CharacterSkill[];
}

export type CharEquipment = { Weapon: Item | null; Armor: Item | null; Accessory: Item | null };
